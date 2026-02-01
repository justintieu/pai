/**
 * dirty-counter.ts - Persistent counter for tracking file modifications
 *
 * PURPOSE:
 * Manages a file-based counter that tracks Edit/Write operations.
 * Counter persists across hook invocations using a JSON file.
 *
 * DESIGN:
 * - File-based storage (environment variables reset between calls)
 * - Session-aware (resets on new session)
 * - Configurable threshold (default 15)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { getPaiDir } from './paths';

const DEFAULT_THRESHOLD = 15;

export interface CounterState {
  count: number;
  last_checkpoint: string | null;
  threshold: number;
  session_id: string | null;
}

function getCounterPath(): string {
  return join(getPaiDir(), 'memory', 'state', 'dirty-counter.json');
}

export function readCounter(): CounterState {
  const counterPath = getCounterPath();
  const counterDir = dirname(counterPath);

  // Ensure directory exists
  if (!existsSync(counterDir)) {
    mkdirSync(counterDir, { recursive: true });
  }

  if (!existsSync(counterPath)) {
    return {
      count: 0,
      last_checkpoint: null,
      threshold: DEFAULT_THRESHOLD,
      session_id: null,
    };
  }

  try {
    return JSON.parse(readFileSync(counterPath, 'utf-8'));
  } catch {
    return {
      count: 0,
      last_checkpoint: null,
      threshold: DEFAULT_THRESHOLD,
      session_id: null,
    };
  }
}

export function writeCounter(state: CounterState): void {
  const counterPath = getCounterPath();
  const counterDir = dirname(counterPath);

  // Ensure directory exists
  if (!existsSync(counterDir)) {
    mkdirSync(counterDir, { recursive: true });
  }

  writeFileSync(counterPath, JSON.stringify(state, null, 2), 'utf-8');
}

export function incrementCounter(sessionId?: string): CounterState {
  const state = readCounter();

  // Reset counter if new session
  if (sessionId && state.session_id !== sessionId) {
    state.count = 0;
    state.session_id = sessionId;
  }

  state.count++;
  writeCounter(state);
  return state;
}

export function checkThreshold(sessionId?: string): { exceeded: boolean; count: number; threshold: number } {
  const state = readCounter();

  // Reset counter if new session
  if (sessionId && state.session_id !== sessionId) {
    state.count = 0;
    state.session_id = sessionId;
    writeCounter(state);
  }

  return {
    exceeded: state.count >= state.threshold,
    count: state.count,
    threshold: state.threshold,
  };
}

export function resetCounter(): void {
  const state = readCounter();
  state.count = 0;
  state.last_checkpoint = new Date().toISOString();
  writeCounter(state);
}
