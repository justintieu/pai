/**
 * decision-log.ts - Extract and persist decisions from Claude's responses
 *
 * PURPOSE:
 * Captures decisions made during Claude's responses and persists them to
 * an append-only log. Decisions are detected via pattern matching on
 * explicit decision language.
 *
 * PATTERNS DETECTED:
 * - "decided to [X]"
 * - "chose [X] over [Y]"
 * - "going with [X]"
 * - "will use [X] because [Y]"
 * - "**Decision**: [X]"
 * - "approach: [X]"
 *
 * OUTPUT:
 * - Appends to ~/.pai/memory/state/decision-log.md
 * - Full provenance: timestamp, session_id, extracted decision text
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { getPaiDir } from '../lib/paths';

interface ParsedTranscript {
  plainCompletion: string;
}

interface HookInput {
  session_id: string;
  transcript_path: string;
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
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const decision = match[1]?.trim();
      if (decision && decision.length > 5 && decision.length < 200) {
        decisions.push({ decision, type });
      }
    }
  }

  // Deduplicate by decision text
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

export async function handleDecisionLog(
  parsed: ParsedTranscript,
  hookInput: HookInput
): Promise<void> {
  const decisions = extractDecisions(parsed.plainCompletion);

  if (decisions.length === 0) {
    console.error('[DecisionLog] No decisions detected');
    return;
  }

  const paiDir = getPaiDir();
  const logPath = join(paiDir, 'memory', 'state', 'decision-log.md');
  const logDir = dirname(logPath);

  // Ensure directory exists
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }

  // Read existing log or create header
  let existingContent = '';
  if (existsSync(logPath)) {
    existingContent = readFileSync(logPath, 'utf-8');
  } else {
    existingContent = '# Decision Log\n\nAppend-only log of decisions extracted from sessions.\n\n---\n';
  }

  // Format new entries
  const timestamp = formatTimestamp();
  const sessionId = hookInput.session_id.slice(0, 8); // Short ID for readability
  const newEntries = decisions.map(d =>
    `- [${timestamp}] (${sessionId}) [${d.type}] ${d.decision}`
  ).join('\n');

  // Append to log
  const updatedContent = existingContent.trim() + '\n' + newEntries + '\n';
  writeFileSync(logPath, updatedContent, 'utf-8');

  console.error(`[DecisionLog] Captured ${decisions.length} decision(s)`);
}
