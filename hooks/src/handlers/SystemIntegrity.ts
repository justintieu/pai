/**
 * SystemIntegrity.ts - Automatic system integrity maintenance handler
 *
 * Detects PAI system changes from the transcript and spawns background
 * maintenance tasks to update references and document changes.
 *
 * TRIGGER: Stop hook (via StopOrchestrator)
 *
 * SIDE EFFECTS:
 * - Spawns background maintenance process
 * - Voice notification on start
 * - Updates memory/state/integrity-state.json
 *
 * THROTTLING:
 * - 2-minute cooldown between runs
 * - Deduplicates identical change sets
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { spawn } from 'child_process';
import { join } from 'path';
import { paiPath } from '../lib/paths';
import { sendVoice, getNotificationConfig } from '../lib/notifications';
import { writeYamlFile } from '../lib/yaml';
import {
  parseToolUseBlocks,
  isSignificantChange,
  isInCooldown,
  isDuplicateRun,
  hashChanges,
  getCooldownEndTime,
  determineSignificance,
  inferChangeType,
  generateDescriptiveTitle,
  type FileChange,
} from '../lib/change-detection';
import type { ParsedTranscript } from '../tools/TranscriptParser';

interface HookInput {
  session_id: string;
  transcript_path: string;
  hook_event_name: string;
}

const STATE_DIR = paiPath('memory', 'state');
const STATE_FILE = join(STATE_DIR, 'integrity-state.yaml');

/**
 * Send voice notification for integrity check start.
 * Fire-and-forget - doesn't block.
 * Includes 4-second delay to let main voice handler finish speaking first.
 */
async function notifyIntegrityStart(): Promise<void> {
  const config = getNotificationConfig();
  if (!config.voice.enabled) return;

  try {
    // Wait 4 seconds for main voice handler to finish speaking
    await new Promise(resolve => setTimeout(resolve, 4000));

    await sendVoice('Checking system integrity for recent changes.', {
      priority: 'low',
    });
  } catch {
    // Voice server might not be running - silent fail
  }
}

/**
 * Update the integrity state file.
 */
function updateIntegrityState(changes: FileChange[]): void {
  try {
    const state = {
      last_run: new Date().toISOString(),
      last_changes_hash: hashChanges(changes),
      cooldown_until: getCooldownEndTime(),
    };

    writeYamlFile(STATE_FILE, state);
    console.error('[SystemIntegrity] Updated state file');
  } catch (error) {
    console.error('[SystemIntegrity] Failed to update state:', error);
  }
}

/**
 * Log the detected changes for audit trail
 */
function logChanges(changes: FileChange[], hookInput: HookInput): void {
  try {
    const logDir = paiPath('memory', 'integrity-logs');
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = join(logDir, `changes-${timestamp}.json`);

    const filteredChanges = changes.filter(c => c.category !== null);
    const logContent = {
      timestamp: new Date().toISOString(),
      session_id: hookInput.session_id,
      title: generateDescriptiveTitle(filteredChanges),
      significance: determineSignificance(filteredChanges),
      change_type: inferChangeType(filteredChanges),
      changes: filteredChanges.map(c => ({
        tool: c.tool,
        path: c.path,
        category: c.category,
        isPhilosophical: c.isPhilosophical,
        isStructural: c.isStructural,
      })),
    };

    writeFileSync(logFile, JSON.stringify(logContent, null, 2));
    console.error(`[SystemIntegrity] Logged changes to: ${logFile}`);
  } catch (error) {
    console.error('[SystemIntegrity] Failed to log changes:', error);
  }
}

/**
 * Handle system integrity check with pre-parsed transcript data.
 *
 * This handler:
 * 1. Parses the transcript for file modification tool_use blocks
 * 2. Filters for PAI system paths (excludes work/, learning/, scratch/)
 * 3. Checks throttle cooldown (max once per 2 min)
 * 4. Logs significant changes for audit trail
 */
export async function handleSystemIntegrity(
  parsed: ParsedTranscript,
  hookInput: HookInput
): Promise<void> {
  console.error('[SystemIntegrity] Checking for system changes...');

  // Check cooldown
  if (isInCooldown()) {
    console.error('[SystemIntegrity] In cooldown period, skipping');
    return;
  }

  // Parse changes from transcript
  const changes = parseToolUseBlocks(hookInput.transcript_path);
  console.error(`[SystemIntegrity] Found ${changes.length} file changes in transcript`);

  // Filter to only PAI system changes
  const systemChanges = changes.filter(c => c.category !== null);
  console.error(`[SystemIntegrity] ${systemChanges.length} are PAI system changes`);

  if (systemChanges.length === 0) {
    console.error('[SystemIntegrity] No system changes detected, skipping');
    return;
  }

  // Check if significant
  if (!isSignificantChange(systemChanges)) {
    console.error('[SystemIntegrity] Changes not significant enough, skipping');
    return;
  }

  // Check for duplicate run
  if (isDuplicateRun(changes)) {
    console.error('[SystemIntegrity] Duplicate change set, skipping');
    return;
  }

  // Log what we found
  console.error('[SystemIntegrity] Significant changes detected:');
  for (const change of systemChanges.slice(0, 5)) {
    console.error(`  - [${change.category}] ${change.path}`);
  }
  if (systemChanges.length > 5) {
    console.error(`  ... and ${systemChanges.length - 5} more`);
  }

  // Update state before logging
  updateIntegrityState(systemChanges);

  // Log changes for audit trail
  logChanges(changes, hookInput);

  // Send voice notification (fire-and-forget)
  notifyIntegrityStart().catch(() => {});

  console.error('[SystemIntegrity] Integrity check complete');
}
