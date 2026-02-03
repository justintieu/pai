#!/usr/bin/env bun
/**
 * SessionSummary.hook.ts - Mark Work Complete and Clear State (SessionEnd)
 *
 * PURPOSE:
 * Finalizes a Claude Code session by marking the current work directory as
 * COMPLETED and clearing the session state. This ensures clean session boundaries
 * and accurate work tracking.
 *
 * TRIGGER: SessionEnd
 *
 * INPUT:
 * - stdin: Hook input JSON (session_id, transcript_path)
 * - Files: memory/state/current-work.json
 *
 * OUTPUT:
 * - stdout: None
 * - stderr: Status messages
 * - exit(0): Always (non-blocking)
 *
 * SIDE EFFECTS:
 * - Updates: memory/work/<dir>/META.yaml (status: COMPLETED, completed_at timestamp)
 * - Deletes: memory/state/current-work.json (clears session state)
 */

import { writeFileSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { getISOTimestamp } from '../lib/time';
import { getPaiDir } from '../lib/paths';
import { readYamlFile } from '../lib/yaml';

const BASE_DIR = getPaiDir();
const MEMORY_DIR = join(BASE_DIR, 'memory');
const STATE_DIR = join(MEMORY_DIR, 'state');
const CURRENT_WORK_FILE = join(STATE_DIR, 'current-work.yaml');
const WORK_DIR = join(MEMORY_DIR, 'work');

interface CurrentWork {
  session_id: string;
  work_dir: string;
  created_at: string;
  item_count: number;
}

/**
 * Mark work directory as completed and clear session state
 */
function clearSessionWork(): void {
  try {
    const currentWork = readYamlFile<CurrentWork>(CURRENT_WORK_FILE);
    if (!currentWork) {
      console.error('[SessionSummary] No current work to complete');
      return;
    }

    // Mark work directory as COMPLETED
    if (currentWork.work_dir) {
      const metaPath = join(WORK_DIR, currentWork.work_dir, 'META.yaml');
      if (existsSync(metaPath)) {
        let metaContent = readFileSync(metaPath, 'utf-8');
        metaContent = metaContent.replace(/^status: "ACTIVE"$/m, 'status: "COMPLETED"');
        metaContent = metaContent.replace(/^completed_at: null$/m, `completed_at: "${getISOTimestamp()}"`);
        writeFileSync(metaPath, metaContent, 'utf-8');
        console.error(`[SessionSummary] Marked work directory as COMPLETED: ${currentWork.work_dir}`);
      }
    }

    // Delete state file
    unlinkSync(CURRENT_WORK_FILE);
    console.error('[SessionSummary] Cleared session work state');
  } catch (error) {
    console.error(`[SessionSummary] Error clearing session work: ${error}`);
  }
}

async function main() {
  try {
    // Read input from stdin (not strictly needed but matches hook pattern)
    const input = await Bun.stdin.text();
    if (!input || input.trim() === '') {
      process.exit(0);
    }

    // Mark work as complete and clear state
    clearSessionWork();

    console.error('[SessionSummary] Session ended, work marked complete');
    process.exit(0);
  } catch (error) {
    // Silent failure - don't disrupt workflow
    console.error(`[SessionSummary] SessionEnd hook error: ${error}`);
    process.exit(0);
  }
}

main();
