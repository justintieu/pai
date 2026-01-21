/**
 * recovery-types.ts - Recovery state type definitions
 *
 * Types for session recovery and state persistence.
 */

export interface RecoveryState {
  session_id: string;
  timestamp: string;
  work_dir?: string;
  last_action?: string;
  needs_recovery: boolean;
}

export interface RecoveryOptions {
  force?: boolean;
  silent?: boolean;
}

export type RecoveryResult =
  | { success: true; message: string }
  | { success: false; error: string };
