#!/usr/bin/env bun
/**
 * DeadlineReminder.hook.ts - Display Business Deadline Reminders (SessionStart)
 *
 * PURPOSE:
 * Shows upcoming business deadlines at session start. Reads from deadlines.yaml
 * and displays reminders for items due within 30 days or past due.
 *
 * TRIGGER: SessionStart
 *
 * INPUT:
 * - Files: ~/.pai/memory/reminders/deadlines.yaml
 * - Mute: ~/.pai/memory/reminders/.muted-today
 *
 * OUTPUT:
 * - stdout: Formatted deadline reminders (if any due within 30 days)
 * - stderr: Status messages
 * - exit(0): Always (non-blocking)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import { getPaiDir } from '../lib/paths';

interface Deadline {
  id: string;
  title: string;
  due: string;
  category: string;
  critical: boolean;
  recurring: string;
  remind_at: number[];
  notes?: string;
}

interface DeadlinesFile {
  deadlines: Deadline[];
}

function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysUntil(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDateStr.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function isMutedToday(paiDir: string): boolean {
  const muteFile = join(paiDir, 'memory', 'reminders', '.muted-today');

  if (!existsSync(muteFile)) {
    return false;
  }

  try {
    const mutedDate = readFileSync(muteFile, 'utf-8').trim();
    return mutedDate === getTodayString();
  } catch (e) {
    return false;
  }
}

async function main() {
  try {
    // Check if this is a subagent session - if so, exit silently
    const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
    const isSubagent = claudeProjectDir.includes('/.claude/Agents/') ||
                      process.env.CLAUDE_AGENT_TYPE !== undefined;

    if (isSubagent) {
      process.exit(0);
    }

    const paiDir = getPaiDir();

    // Check mute status
    if (isMutedToday(paiDir)) {
      console.error('[DeadlineReminder] Muted for today');
      process.exit(0);
    }

    const deadlinesPath = join(paiDir, 'memory', 'reminders', 'deadlines.yaml');

    if (!existsSync(deadlinesPath)) {
      console.error('[DeadlineReminder] No deadlines.yaml found');
      process.exit(0);
    }

    const content = readFileSync(deadlinesPath, 'utf-8');
    const data = parseYaml(content) as DeadlinesFile;

    if (!data.deadlines || data.deadlines.length === 0) {
      console.error('[DeadlineReminder] No deadlines configured');
      process.exit(0);
    }

    // Filter deadlines due within 30 days or past due
    const relevantDeadlines = data.deadlines
      .map(d => ({
        ...d,
        daysUntil: getDaysUntil(d.due)
      }))
      .filter(d => d.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    if (relevantDeadlines.length === 0) {
      console.error('[DeadlineReminder] No deadlines due within 30 days');
      process.exit(0);
    }

    // Build display output
    let output = '\n';
    output += '\n';
    output += 'Upcoming Deadlines\n';
    output += '\n';

    for (const deadline of relevantDeadlines) {
      const daysText = deadline.daysUntil < 0
        ? `OVERDUE by ${Math.abs(deadline.daysUntil)} days`
        : deadline.daysUntil === 0
          ? 'DUE TODAY'
          : `${deadline.daysUntil} days`;

      const icon = deadline.daysUntil <= 0 ? '!!'
                 : deadline.daysUntil <= 7 ? '! '
                 : '  ';

      output += `${icon} ${deadline.title}\n`;
      output += `    Due: ${formatDate(deadline.due)} (${daysText})\n`;
      output += '\n';
    }

    output += '[mute for today: /pai mute-reminders]\n';
    output += '\n';

    console.log(output);
    console.error(`[DeadlineReminder] Displayed ${relevantDeadlines.length} deadline reminder(s)`);

    process.exit(0);
  } catch (error) {
    console.error('[DeadlineReminder] Error:', error);
    process.exit(0);
  }
}

main();
