/**
 * TraceEmitter.ts - Trace emission for debugging and observability
 *
 * Emits structured traces that can be collected by external tools.
 */

import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getPaiDir } from './paths';
import { getISOTimestamp } from './time';

const TRACE_DIR = join(getPaiDir(), 'memory', 'traces');

export interface TraceEvent {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Emit a trace event
 */
export function emitTrace(
  source: string,
  level: TraceEvent['level'],
  message: string,
  data?: Record<string, unknown>
): void {
  const event: TraceEvent = {
    timestamp: getISOTimestamp(),
    level,
    source,
    message,
    data,
  };

  // Also log to stderr for immediate visibility
  console.error(`[${source}] ${level.toUpperCase()}: ${message}`);

  // Write to trace file (fire and forget)
  try {
    if (!existsSync(TRACE_DIR)) {
      mkdirSync(TRACE_DIR, { recursive: true });
    }

    const date = new Date().toISOString().split('T')[0];
    const tracePath = join(TRACE_DIR, `trace-${date}.jsonl`);
    appendFileSync(tracePath, JSON.stringify(event) + '\n');
  } catch {
    // Silent fail - tracing should never block execution
  }
}

/**
 * Create a scoped tracer for a specific source
 */
export function createTracer(source: string) {
  return {
    debug: (message: string, data?: Record<string, unknown>) =>
      emitTrace(source, 'debug', message, data),
    info: (message: string, data?: Record<string, unknown>) =>
      emitTrace(source, 'info', message, data),
    warn: (message: string, data?: Record<string, unknown>) =>
      emitTrace(source, 'warn', message, data),
    error: (message: string, data?: Record<string, unknown>) =>
      emitTrace(source, 'error', message, data),
  };
}
