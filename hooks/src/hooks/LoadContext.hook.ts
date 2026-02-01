#!/usr/bin/env bun
/**
 * LoadContext.hook.ts - Inject CORE Skill into Claude's Context (SessionStart)
 *
 * PURPOSE:
 * The foundational context injection hook. Reads the CORE SKILL.md and outputs
 * it as a <system-reminder> to stdout, which Claude Code captures and includes
 * in the model's context. This is how the AI receives identity, preferences,
 * response format rules, workflow routing, and security guidelines.
 *
 * TRIGGER: SessionStart
 *
 * INPUT:
 * - Environment: PAI_DIR, TIME_ZONE
 * - Files: skills/CORE/SKILL.md, memory/state/progress/*.json
 *
 * OUTPUT:
 * - stdout: <system-reminder> containing full CORE skill content
 * - stdout: Active work summary if previous sessions have pending work
 * - stderr: Status messages and errors
 * - exit(0): Normal completion
 * - exit(1): Critical failure (SKILL.md not found)
 */

import { readFileSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { getPaiDir } from '../lib/paths';
import { recordSessionStart } from '../lib/notifications';

interface HookInput {
  session_id?: string;
  cwd?: string;
}

async function readStdin(): Promise<HookInput | null> {
  try {
    const decoder = new TextDecoder();
    const reader = Bun.stdin.stream().getReader();
    let input = '';

    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    const readPromise = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        input += decoder.decode(value, { stream: true });
      }
    })();

    await Promise.race([readPromise, timeoutPromise]);

    if (input.trim()) {
      return JSON.parse(input) as HookInput;
    }
  } catch (error) {
    // Silent fail - stdin might not be JSON
  }
  return null;
}

/**
 * Check for working memory file and return its content
 * Priority: project-level (.claude/working-memory.md) > global (~/.pai/memory/state/working-memory.md)
 */
function loadWorkingMemory(cwd: string | undefined, paiDir: string): { content: string; path: string } | null {
  // Priority 1: Project-level working memory
  if (cwd) {
    const projectPath = join(cwd, '.claude', 'working-memory.md');
    if (existsSync(projectPath)) {
      try {
        const content = readFileSync(projectPath, 'utf-8');
        return { content, path: projectPath };
      } catch (e) {
        console.error(`[LoadContext] Failed to read project working memory: ${e}`);
      }
    }
  }

  // Priority 2: Global working memory
  const globalPath = join(paiDir, 'memory', 'state', 'working-memory.md');
  if (existsSync(globalPath)) {
    try {
      const content = readFileSync(globalPath, 'utf-8');
      return { content, path: globalPath };
    } catch (e) {
      console.error(`[LoadContext] Failed to read global working memory: ${e}`);
    }
  }

  return null;
}

/**
 * Check for handoff file and return its content (one-time read - deletes after reading)
 */
function loadHandoff(cwd: string | undefined): { content: string; path: string } | null {
  if (!cwd) return null;

  const handoffPath = join(cwd, '.claude', 'handoff.md');
  if (existsSync(handoffPath)) {
    try {
      const content = readFileSync(handoffPath, 'utf-8');
      // Delete after reading - handoff is one-time context
      unlinkSync(handoffPath);
      return { content, path: handoffPath };
    } catch (e) {
      console.error(`[LoadContext] Failed to read/delete handoff: ${e}`);
    }
  }

  return null;
}

async function getCurrentDate(): Promise<string> {
  try {
    const tz = process.env.TIME_ZONE || 'America/Los_Angeles';
    const proc = Bun.spawn(['date', '+%Y-%m-%d %H:%M:%S %Z'], {
      stdout: 'pipe',
      env: { ...process.env, TZ: tz }
    });
    const output = await new Response(proc.stdout).text();
    return output.trim();
  } catch (error) {
    console.error('Failed to get current date:', error);
    return new Date().toISOString();
  }
}

interface ProgressFile {
  project: string;
  status: string;
  updated: string;
  objectives: string[];
  next_steps: string[];
  handoff_notes: string;
}

async function checkActiveProgress(paiDir: string): Promise<string | null> {
  const progressDir = join(paiDir, 'memory', 'state', 'progress');

  if (!existsSync(progressDir)) {
    return null;
  }

  try {
    const files = readdirSync(progressDir).filter(f => f.endsWith('-progress.json'));

    if (files.length === 0) {
      return null;
    }

    const activeProjects: ProgressFile[] = [];

    for (const file of files) {
      try {
        const content = readFileSync(join(progressDir, file), 'utf-8');
        const progress = JSON.parse(content) as ProgressFile;
        if (progress.status === 'active') {
          activeProjects.push(progress);
        }
      } catch (e) {
        // Skip malformed files
      }
    }

    if (activeProjects.length === 0) {
      return null;
    }

    // Build summary of active work
    let summary = '\n📋 ACTIVE WORK (from previous sessions):\n';

    for (const proj of activeProjects) {
      summary += `\n🔵 ${proj.project}\n`;

      if (proj.objectives && proj.objectives.length > 0) {
        summary += '   Objectives:\n';
        proj.objectives.forEach(o => summary += `   • ${o}\n`);
      }

      if (proj.handoff_notes) {
        summary += `   Handoff: ${proj.handoff_notes}\n`;
      }

      if (proj.next_steps && proj.next_steps.length > 0) {
        summary += '   Next steps:\n';
        proj.next_steps.forEach(s => summary += `   → ${s}\n`);
      }
    }

    return summary;
  } catch (error) {
    console.error('Error checking active progress:', error);
    return null;
  }
}

async function main() {
  try {
    // Read stdin for hook input (may contain cwd)
    const hookInput = await readStdin();
    const cwd = hookInput?.cwd || process.cwd();

    // Check if this is a subagent session - if so, exit silently
    const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
    const isSubagent = claudeProjectDir.includes('/.claude/Agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;

    if (isSubagent) {
      console.error('🤖 Subagent session - skipping PAI context loading');
      process.exit(0);
    }

    // Record session start time for notification timing
    recordSessionStart();
    console.error('⏱️ Session start time recorded for notification timing');

    const paiDir = getPaiDir();

    // Try multiple potential skill paths
    const skillPaths = [
      join(paiDir, 'skills', 'CORE', 'SKILL.md'),
      join(paiDir, 'skills', 'pai-core', 'SKILL.md'),
      join(paiDir, 'context', 'identity.md'),  // Fallback to identity context
    ];

    let paiSkillPath: string | null = null;
    for (const path of skillPaths) {
      if (existsSync(path)) {
        paiSkillPath = path;
        break;
      }
    }

    if (!paiSkillPath) {
      console.error(`❌ No PAI skill or context found in: ${skillPaths.join(', ')}`);
      console.error('💡 Create a SKILL.md in skills/CORE/ or context/identity.md');
      // Don't fail - just skip context loading
      process.exit(0);
    }

    console.error(`📚 Reading PAI core context from: ${paiSkillPath}`);

    // Read the PAI SKILL.md file content
    const paiContent = readFileSync(paiSkillPath, 'utf-8');

    console.error(`✅ Read ${paiContent.length} characters from PAI skill`);

    // Get current date/time to prevent confusion about dates
    const currentDate = await getCurrentDate();
    console.error(`📅 Current Date: ${currentDate}`);

    // Output the PAI content as a system-reminder
    const message = `<system-reminder>
PAI CORE CONTEXT (Auto-loaded at Session Start)

📅 CURRENT DATE/TIME: ${currentDate}

The following context has been loaded from ${paiSkillPath}:

${paiContent}

This context is now active for this session. Follow all instructions, preferences, and guidelines contained above.
</system-reminder>`;

    // Write to stdout (will be captured by Claude Code)
    console.log(message);

    // Output success confirmation for Claude to acknowledge
    console.log('\n✅ PAI Context successfully loaded...');

    // Check for active progress files and display them
    const activeProgress = await checkActiveProgress(paiDir);
    if (activeProgress) {
      console.log(activeProgress);
      console.error('📋 Active work found from previous sessions');
    }

    // Load working memory (project-level takes priority over global)
    const workingMemory = loadWorkingMemory(cwd, paiDir);
    if (workingMemory) {
      const workingMemoryBlock = `<working-memory>
# Current Working Memory
${workingMemory.content}
</working-memory>`;
      console.log(workingMemoryBlock);
      console.error(`📝 Working memory loaded from ${workingMemory.path}`);
    } else {
      console.error('📝 No working memory file found');
    }

    // Load handoff (one-time context injection, file is deleted after reading)
    const handoff = loadHandoff(cwd);
    if (handoff) {
      const handoffBlock = `<handoff-context>
# Post-Compaction Handoff Recovery
${handoff.content}

**This handoff was consumed and deleted. Working memory contains authoritative state.**
</handoff-context>`;
      console.log(handoffBlock);
      console.error(`🔄 Handoff consumed from ${handoff.path}`);
    }

    console.error('✅ PAI context injected into session');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in load-core-context hook:', error);
    process.exit(1);
  }
}

main();
