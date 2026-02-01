/**
 * working-memory-update.ts - Update working memory with extracted decisions
 *
 * PURPOSE:
 * Automatically updates the "Recent Decisions" section of working-memory.md
 * when decisions are extracted from Claude's responses on Stop events.
 * Satisfies CTXMGT-03: "working memory updated on decisions"
 *
 * DESIGN:
 * - Uses same decision extraction as decision-log handler (DRY)
 * - Updates project-level working-memory.md first, falls back to global
 * - Only updates "Recent Decisions" section, preserves other content
 * - Caps at 10 recent decisions (FIFO pruning)
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getPaiDir } from '../lib/paths';

interface ParsedTranscript {
  plainCompletion: string;
}

interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd?: string;
}

const DECISION_PATTERNS = [
  { pattern: /decided to (.+?)(?:\.|,|$)/gi, type: 'decided' },
  { pattern: /chose (.+?) over (.+?)(?:\.|,|$)/gi, type: 'chose' },
  { pattern: /going with (.+?)(?:\.|,|$)/gi, type: 'going_with' },
  { pattern: /will use (.+?) because (.+?)(?:\.|,|$)/gi, type: 'will_use' },
  { pattern: /\*\*Decision\*\*:?\s*(.+?)(?:\n|$)/gi, type: 'explicit' },
  { pattern: /approach:\s*(.+?)(?:\n|$)/gi, type: 'approach' },
];

function extractDecisions(text: string): Array<{ decision: string; type: string }> {
  const decisions: Array<{ decision: string; type: string }> = [];

  for (const { pattern, type } of DECISION_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const decision = match[1]?.trim();
      if (decision && decision.length > 5 && decision.length < 200) {
        decisions.push({ decision, type });
      }
    }
  }

  const seen = new Set<string>();
  return decisions.filter(d => {
    const key = d.decision.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function findWorkingMemoryPath(hookInput: HookInput): string | null {
  // Try project-level first
  if (hookInput.cwd) {
    const projectPath = join(hookInput.cwd, '.claude', 'working-memory.md');
    if (existsSync(projectPath)) {
      return projectPath;
    }
  }

  // Fall back to global
  const paiDir = getPaiDir();
  const globalPath = join(paiDir, 'memory', 'state', 'working-memory.md');
  if (existsSync(globalPath)) {
    return globalPath;
  }

  return null;
}

function updateRecentDecisions(
  content: string,
  newDecisions: Array<{ decision: string; type: string }>,
  timestamp: string
): string {
  const lines = content.split('\n');
  const sectionStart = lines.findIndex(l => l.trim() === '## Recent Decisions');

  if (sectionStart === -1) {
    // Section doesn't exist, append it
    const newSection = [
      '',
      '## Recent Decisions',
      '',
      ...newDecisions.map(d => `- [${timestamp}] ${d.decision}`),
    ].join('\n');
    return content.trim() + '\n' + newSection + '\n';
  }

  // Find section end (next ## or end of file)
  let sectionEnd = lines.findIndex((l, i) => i > sectionStart && l.startsWith('## '));
  if (sectionEnd === -1) sectionEnd = lines.length;

  // Parse existing decisions
  const existingDecisions: string[] = [];
  for (let i = sectionStart + 1; i < sectionEnd; i++) {
    const line = lines[i].trim();
    if (line.startsWith('- [')) {
      existingDecisions.push(line);
    }
  }

  // Add new decisions, cap at 10 (FIFO)
  const newEntries = newDecisions.map(d => `- [${timestamp}] ${d.decision}`);
  const allDecisions = [...newEntries, ...existingDecisions].slice(0, 10);

  // Rebuild section
  const beforeSection = lines.slice(0, sectionStart + 1);
  const afterSection = lines.slice(sectionEnd);
  const rebuiltSection = ['', ...allDecisions, ''];

  return [...beforeSection, ...rebuiltSection, ...afterSection].join('\n');
}

export async function handleWorkingMemoryUpdate(
  parsed: ParsedTranscript,
  hookInput: HookInput
): Promise<void> {
  const decisions = extractDecisions(parsed.plainCompletion);

  if (decisions.length === 0) {
    console.error('[WorkingMemoryUpdate] No decisions to update');
    return;
  }

  const wmPath = findWorkingMemoryPath(hookInput);

  if (!wmPath) {
    console.error('[WorkingMemoryUpdate] No working memory file found');
    return;
  }

  const content = readFileSync(wmPath, 'utf-8');
  const timestamp = formatTimestamp();
  const updated = updateRecentDecisions(content, decisions, timestamp);

  writeFileSync(wmPath, updated, 'utf-8');
  console.error(`[WorkingMemoryUpdate] Updated ${decisions.length} decision(s) in ${wmPath}`);
}
