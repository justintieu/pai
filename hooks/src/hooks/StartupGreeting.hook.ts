#!/usr/bin/env bun
/**
 * StartupGreeting.hook.ts - Display PAI Banner at Session Start (SessionStart)
 *
 * PURPOSE:
 * Displays a startup greeting banner with system statistics.
 * Creates a visual confirmation that PAI is initialized and shows key metrics.
 *
 * TRIGGER: SessionStart
 *
 * INPUT:
 * - Environment: COLUMNS for terminal width detection
 * - Settings: settings.json for identity configuration
 *
 * OUTPUT:
 * - stdout: Banner display (captured by Claude Code)
 * - stderr: Error messages on failure
 * - exit(0): Normal completion
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { getPaiDir, getSettingsPath, getClaudeDir } from '../lib/paths';
import { getIdentity, getPrincipal } from '../lib/identity';

const paiDir = getPaiDir();

function countFiles(dir: string, extension: string): number {
  try {
    if (!existsSync(dir)) return 0;
    let count = 0;
    const items = readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
        count += countFiles(join(dir, item.name), extension);
      } else if (item.name.endsWith(extension)) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

function getStats(): { skills: number; hooks: number; contexts: number } {
  return {
    skills: countFiles(join(paiDir, 'skills'), '.md'),
    hooks: countFiles(join(paiDir, 'hooks', 'src', 'hooks'), '.ts'),
    contexts: countFiles(join(paiDir, 'context'), '.md'),
  };
}

function generateBanner(): string {
  const identity = getIdentity();
  const principal = getPrincipal();
  const stats = getStats();
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: principal.timezone,
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const cols = parseInt(process.env.COLUMNS || '80');

  if (cols < 60) {
    // Compact banner for narrow terminals
    return `
╭─────────────────────────────╮
│  ${identity.name.padEnd(25)} │
│  Ready for ${principal.name.padEnd(15)} │
│  ${timestamp.padEnd(25)} │
╰─────────────────────────────╯
`;
  }

  // Full banner
  return `
╭───────────────────────────────────────────────────────────╮
│                                                           │
│   ██████╗  █████╗ ██╗    Personal AI Infrastructure      │
│   ██╔══██╗██╔══██╗██║    ═══════════════════════════     │
│   ██████╔╝███████║██║    ${identity.name.padEnd(30)}│
│   ██╔═══╝ ██╔══██║██║    Ready for ${principal.name.padEnd(19)}│
│   ██║     ██║  ██║██║    ${timestamp.padEnd(30)}│
│   ╚═╝     ╚═╝  ╚═╝╚═╝                                    │
│                                                           │
│   Skills: ${String(stats.skills).padEnd(4)} │ Hooks: ${String(stats.hooks).padEnd(4)} │ Contexts: ${String(stats.contexts).padEnd(4)}│
│                                                           │
╰───────────────────────────────────────────────────────────╯
`;
}

try {
  // Check if this is a subagent session - if so, exit silently
  const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR || '';
  const isSubagent = claudeProjectDir.includes('/.claude/Agents/') ||
                    process.env.CLAUDE_AGENT_TYPE !== undefined;

  if (isSubagent) {
    process.exit(0);
  }

  const banner = generateBanner();
  console.log(banner);

  process.exit(0);
} catch (error) {
  console.error('StartupGreeting: Failed to display banner', error);
  process.exit(1);
}
