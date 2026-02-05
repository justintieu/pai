/**
 * work-state.ts - Session-scoped work state management
 *
 * Manages work state files per session to prevent conflicts when
 * multiple Claude Code windows are open simultaneously.
 *
 * State files are stored as: current-work-<session_id>.json
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';
import { getPaiDir } from './paths';

const BASE_DIR = getPaiDir();
const STATE_DIR = join(BASE_DIR, 'memory', 'state');

export interface CurrentWork {
  session_id: string;
  work_dir: string;
  created_at: string;
  item_count: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

/**
 * Get the path to a session-scoped work state file
 */
export function getWorkStateFile(sessionId: string): string {
  // Use first 8 chars of session_id for shorter filenames while maintaining uniqueness
  const shortId = sessionId.slice(0, 8);
  return join(STATE_DIR, `current-work-${shortId}.json`);
}

/**
 * Read work state for a specific session
 */
export function readWorkState(sessionId: string): CurrentWork | null {
  try {
    const filepath = getWorkStateFile(sessionId);
    if (!existsSync(filepath)) return null;
    const content = readFileSync(filepath, 'utf-8');
    const work = JSON.parse(content) as CurrentWork;

    // Validate session_id matches (safety check)
    if (work.session_id !== sessionId) {
      console.error(`[WorkState] Session ID mismatch: expected ${sessionId}, got ${work.session_id}`);
      return null;
    }

    return work;
  } catch (error) {
    console.error(`[WorkState] Error reading work state: ${error}`);
    return null;
  }
}

/**
 * Write work state for a specific session
 */
export function writeWorkState(sessionId: string, work: CurrentWork): void {
  try {
    const filepath = getWorkStateFile(sessionId);
    // Ensure session_id is set correctly
    work.session_id = sessionId;
    writeFileSync(filepath, JSON.stringify(work, null, 2), 'utf-8');
  } catch (error) {
    console.error(`[WorkState] Error writing work state: ${error}`);
  }
}

/**
 * Delete work state for a specific session
 * Only deletes if the session_id matches (prevents cross-session interference)
 */
export function deleteWorkState(sessionId: string): boolean {
  try {
    const filepath = getWorkStateFile(sessionId);
    if (!existsSync(filepath)) {
      console.error(`[WorkState] No state file to delete for session ${sessionId.slice(0, 8)}`);
      return false;
    }

    // Read and validate session_id before deletion
    const content = readFileSync(filepath, 'utf-8');
    const work = JSON.parse(content) as CurrentWork;

    if (work.session_id !== sessionId) {
      console.error(`[WorkState] Refusing to delete: session_id mismatch`);
      return false;
    }

    unlinkSync(filepath);
    console.error(`[WorkState] Deleted state file for session ${sessionId.slice(0, 8)}`);
    return true;
  } catch (error) {
    console.error(`[WorkState] Error deleting work state: ${error}`);
    return false;
  }
}

/**
 * List all active work state files
 * Returns array of session IDs with active work states
 */
export function listActiveWorkStates(): string[] {
  try {
    if (!existsSync(STATE_DIR)) return [];

    const files = readdirSync(STATE_DIR)
      .filter(f => f.startsWith('current-work-') && f.endsWith('.json'));

    const sessions: string[] = [];
    for (const file of files) {
      try {
        const content = readFileSync(join(STATE_DIR, file), 'utf-8');
        const work = JSON.parse(content) as CurrentWork;
        if (work.session_id) {
          sessions.push(work.session_id);
        }
      } catch {
        // Skip malformed files
      }
    }

    return sessions;
  } catch {
    return [];
  }
}

/**
 * MIGRATION: Read from legacy single-file location
 * Returns the work state if found, null otherwise
 */
export function readLegacyWorkState(): CurrentWork | null {
  try {
    const legacyPath = join(STATE_DIR, 'current-work.json');
    if (!existsSync(legacyPath)) return null;
    const content = readFileSync(legacyPath, 'utf-8');
    return JSON.parse(content) as CurrentWork;
  } catch {
    return null;
  }
}

/**
 * MIGRATION: Delete legacy single-file state
 */
export function deleteLegacyWorkState(): void {
  try {
    const legacyPath = join(STATE_DIR, 'current-work.json');
    if (existsSync(legacyPath)) {
      unlinkSync(legacyPath);
      console.error('[WorkState] Deleted legacy state file');
    }
  } catch {
    // Silent fail
  }
}
