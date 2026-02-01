#!/usr/bin/env bun
/**
 * PreCompactHandoff.hook.ts - Generate handoff before context compaction
 *
 * PURPOSE:
 * Automatically captures state before context compaction occurs.
 * Writes handoff to .claude/handoff.md as sibling to working-memory.md.
 *
 * TRIGGER: PreCompact (matcher: auto|manual)
 *
 * CRITICAL: PreCompact hooks CANNOT block compaction.
 * Exit code 2 only shows stderr to user. This hook must complete synchronously.
 *
 * INPUT:
 * - session_id: Current session identifier
 * - transcript_path: Path to conversation JSONL
 * - cwd: Current working directory
 * - trigger: "manual" | "auto"
 * - custom_instructions: From /compact command (empty for auto)
 *
 * OUTPUT:
 * - Writes .claude/handoff.md with state capture
 * - exit(0): Normal completion
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parseTranscript } from '../tools/TranscriptParser';

interface PreCompactInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  trigger: 'manual' | 'auto';
  custom_instructions: string;
  hook_event_name: string;
}

function formatTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

async function readStdin(): Promise<PreCompactInput | null> {
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
      return JSON.parse(input) as PreCompactInput;
    }
  } catch (error) {
    console.error('[PreCompactHandoff] Error reading stdin:', error);
  }
  return null;
}

function extractDecisions(text: string): string[] {
  const patterns = [
    /decided to (.+?)(?:\.|,|$)/gi,
    /chose (.+?) over/gi,
    /will use (.+?) because/gi,
    /going with (.+?)(?:\.|,|$)/gi,
  ];

  const decisions: string[] = [];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const decision = match[1]?.trim();
      if (decision && decision.length > 5) {
        decisions.push(decision);
      }
    }
  }

  return [...new Set(decisions)]; // Deduplicate
}

function extractCurrentState(text: string): string {
  // Get last 800 chars of response for recent context
  const recentContext = text.slice(-800).trim();

  // Try to find task-related statements
  const taskPatterns = [
    /working on (.+?)(?:\.|,|$)/gi,
    /implementing (.+?)(?:\.|,|$)/gi,
    /next(?:\s+step)?(?:\s+is)?\s*:?\s*(.+?)(?:\.|$)/gi,
  ];

  const states: string[] = [];
  for (const pattern of taskPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(recentContext)) !== null) {
      states.push(match[1]?.trim());
    }
  }

  if (states.length > 0) {
    return states.slice(0, 3).map(s => `- ${s}`).join('\n');
  }

  // Fallback: summarize recent context
  return recentContext.length > 0
    ? `Recent context:\n${recentContext.slice(0, 400)}...`
    : 'No recent context captured.';
}

function generateHandoff(
  parsed: { plainCompletion: string },
  input: PreCompactInput
): string {
  const timestamp = formatTimestamp();
  const decisions = extractDecisions(parsed.plainCompletion);
  const currentState = extractCurrentState(parsed.plainCompletion);

  const decisionsText = decisions.length > 0
    ? decisions.map(d => `- ${d}`).join('\n')
    : 'No explicit decisions captured.';

  const nextSteps = input.custom_instructions
    ? input.custom_instructions
    : 'Review working-memory.md for task context and continue from there.';

  return `# Pre-Compaction Handoff

**Generated:** ${timestamp}
**Trigger:** ${input.trigger}
**Session:** ${input.session_id.slice(0, 8)}

## Current State

${currentState}

## Key Decisions Made

${decisionsText}

## Next Steps

${nextSteps}

## Recovery Instructions

After compaction:
1. Read this handoff to restore context
2. Check \`.claude/working-memory.md\` for detailed task state
3. Review \`~/.pai/memory/state/decision-log.md\` for decision history
4. Continue work from "Next Steps" above

---
*This handoff was automatically generated before context compaction.*
*If this file exists, compaction occurred. Read and restore context.*
`;
}

async function main() {
  const hookInput = await readStdin();

  if (!hookInput) {
    console.error('[PreCompactHandoff] No input provided');
    process.exit(0);
  }

  if (!hookInput.transcript_path) {
    console.error('[PreCompactHandoff] No transcript path provided');
    process.exit(0);
  }

  // Parse transcript (must complete synchronously - PreCompact can't block)
  const parsed = parseTranscript(hookInput.transcript_path);

  if (!parsed || !parsed.plainCompletion) {
    console.error('[PreCompactHandoff] Failed to parse transcript');
    process.exit(0);
  }

  // Generate handoff document
  const handoff = generateHandoff(parsed, hookInput);

  // Write to project directory (sibling to working-memory.md)
  const handoffDir = join(hookInput.cwd, '.claude');
  const handoffPath = join(handoffDir, 'handoff.md');

  // Ensure .claude directory exists
  if (!existsSync(handoffDir)) {
    mkdirSync(handoffDir, { recursive: true });
  }

  // Write synchronously (CRITICAL: must complete before hook exits)
  writeFileSync(handoffPath, handoff, 'utf-8');

  console.error(`[PreCompactHandoff] Wrote handoff to ${handoffPath}`);
  console.error(`[PreCompactHandoff] Trigger: ${hookInput.trigger}`);

  process.exit(0);
}

main().catch((error) => {
  console.error('[PreCompactHandoff] Error:', error);
  process.exit(0); // Non-blocking failure
});
