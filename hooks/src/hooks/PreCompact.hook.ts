#!/usr/bin/env bun
/**
 * PreCompact.hook.ts - Generate Handoff Before Context Compaction
 *
 * PURPOSE:
 * Generates a structured handoff document when context is about to be compacted
 * or when the dirty flag threshold is reached. Preserves task state, modified files,
 * and error context across session boundaries.
 *
 * TRIGGER: PreCompact (or called programmatically from SecurityValidator threshold)
 *
 * INPUT:
 * - stdin: Hook input JSON (session_id, transcript_path)
 *   - session_id: Current session identifier
 *   - transcript_path: Path to the current transcript file
 *   - goal?: Optional goal description for the handoff
 *   - focus?: Optional current focus area
 *
 * OUTPUT:
 * - stdout: JSON result with handoff filepath
 *   - {"success": true, "filepath": "..."} → Handoff created
 *   - {"success": false, "error": "..."} → Handoff creation failed
 * - stderr: Status messages
 * - exit(0): Normal completion
 *
 * SIDE EFFECTS:
 * - Creates: ~/.pai/memory/handoffs/<timestamp>-<session>.md
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { paiPath, getPaiDir } from '@/lib/paths';
import {
  extractTranscriptState,
  parseLastAssistantMessage,
  TranscriptState,
  TaskState,
  ModifiedFile,
  ErrorContext,
} from '@/tools/TranscriptParser';
import {
  createHandoff,
  writeHandoff,
  task,
  Handoff,
  HandoffTask,
  TaskStatus,
} from '@/lib/handoff';
import { readWorkState, type CurrentWork } from '@/lib/work-state';

// ============================================================================
// Types
// ============================================================================

interface HookInput {
  session_id: string;
  transcript_path?: string;
  goal?: string;
  focus?: string;
}

interface HookOutput {
  success: boolean;
  filepath?: string;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

// Note: Work state is now session-scoped via readWorkState(sessionId)

// ============================================================================
// State Extraction
// ============================================================================

/**
 * Get current work session info if available (session-scoped)
 */
function getCurrentWorkSession(sessionId: string): CurrentWork | null {
  return readWorkState(sessionId);
}

/**
 * Map TranscriptParser task status to handoff task status
 */
function mapTaskStatus(status: string): TaskStatus {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'in_progress':
      return 'in_progress';
    case 'blocked':
      return 'blocked';
    default:
      return 'pending';
  }
}

/**
 * Convert TranscriptParser tasks to handoff tasks
 */
function convertTasks(tasks: TaskState[]): HandoffTask[] {
  return tasks.map(t => task(mapTaskStatus(t.status), t.content));
}

/**
 * Convert modified files to path strings
 */
function convertModifiedFiles(files: ModifiedFile[]): string[] {
  return files
    .filter(f => f.success) // Only include successful modifications
    .map(f => f.path);
}

/**
 * Convert errors to summary strings
 */
function convertErrors(errors: ErrorContext[]): string[] {
  return errors.map(e => `${e.tool}: ${e.error.slice(0, 100)}`);
}

/**
 * Extract a goal summary from the last assistant message
 */
function extractGoalFromMessage(message: string): string {
  // Try to find a SUMMARY section
  const summaryMatch = message.match(/📋\s*SUMMARY:?\s*(.+?)(?:\n|$)/i);
  if (summaryMatch && summaryMatch[1]) {
    return summaryMatch[1].trim().slice(0, 100);
  }

  // Try to find an ANALYSIS or first significant line
  const lines = message.split('\n').filter(l => l.trim().length > 10);
  if (lines.length > 0) {
    // Skip lines that are just formatting or headers
    for (const line of lines) {
      const cleaned = line.replace(/^[#\*\-\s]+/, '').trim();
      if (cleaned.length > 10 && !cleaned.startsWith('[') && !cleaned.startsWith('<')) {
        return cleaned.slice(0, 100);
      }
    }
  }

  return 'Work in progress';
}

/**
 * Extract next steps from transcript state
 * Looks at pending/in_progress tasks and tool history
 */
function extractNextSteps(state: TranscriptState): string[] {
  const nextSteps: string[] = [];

  // Add pending and in-progress tasks as next steps
  for (const t of state.tasks) {
    if (t.status === 'pending' || t.status === 'in_progress') {
      nextSteps.push(t.content);
    }
  }

  // If there were errors, add a step to address them
  if (state.errors.length > 0) {
    const uniqueTools = [...new Set(state.errors.map(e => e.tool))];
    nextSteps.push(`Address ${state.errors.length} error(s) in: ${uniqueTools.join(', ')}`);
  }

  // Limit to top 5 next steps
  return nextSteps.slice(0, 5);
}

// ============================================================================
// Handoff Generation
// ============================================================================

/**
 * Generate a handoff from transcript and session state
 */
function generateHandoff(input: HookInput, transcriptContent: string): Handoff {
  // Extract full transcript state
  const state = extractTranscriptState(transcriptContent);

  // Get last assistant message for goal extraction
  const lastMessage = parseLastAssistantMessage(transcriptContent);

  // Get current work session for additional context (session-scoped)
  const currentWork = getCurrentWorkSession(input.session_id);

  // Determine goal (from input, work session, or message extraction)
  let goal = input.goal || '';
  if (!goal && currentWork?.work_dir) {
    // Extract from work directory name (format: YYYY-MM-DD_filename)
    const dirParts = currentWork.work_dir.split('_').slice(1);
    if (dirParts.length > 0) {
      goal = `Work on ${dirParts.join('_')}`;
    }
  }
  if (!goal) {
    goal = extractGoalFromMessage(lastMessage);
  }

  // Determine focus
  const focus = input.focus || goal;

  // Convert transcript state to handoff format
  const tasks = convertTasks(state.tasks);
  const modifiedFiles = convertModifiedFiles(state.modifiedFiles);
  const errors = convertErrors(state.errors);
  const nextSteps = extractNextSteps(state);

  // Create the handoff
  return createHandoff({
    session: input.session_id,
    goal,
    focus,
    tasks,
    modifiedFiles,
    errors,
    nextSteps,
  });
}

// ============================================================================
// Main Hook Logic
// ============================================================================

/**
 * Generate handoff from transcript path
 * Can be called directly or via hook input
 */
export async function generateHandoffFromTranscript(
  sessionId: string,
  transcriptPath: string,
  options: { goal?: string; focus?: string } = {}
): Promise<HookOutput> {
  try {
    // Validate transcript exists
    if (!existsSync(transcriptPath)) {
      return {
        success: false,
        error: `Transcript file not found: ${transcriptPath}`,
      };
    }

    // Read transcript content
    const transcriptContent = readFileSync(transcriptPath, 'utf-8');

    if (!transcriptContent.trim()) {
      return {
        success: false,
        error: 'Transcript file is empty',
      };
    }

    // Generate handoff
    const handoff = generateHandoff(
      {
        session_id: sessionId,
        transcript_path: transcriptPath,
        goal: options.goal,
        focus: options.focus,
      },
      transcriptContent
    );

    // Write handoff to disk
    const result = writeHandoff(handoff);

    if (result.success) {
      console.error(`[PreCompact] Handoff created: ${result.filepath}`);
      return {
        success: true,
        filepath: result.filepath,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[PreCompact] Error generating handoff: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Main hook entry point
 * Reads input from stdin and generates handoff
 */
async function main(): Promise<void> {
  try {
    // Read input from stdin with timeout
    const text = await Promise.race([
      Bun.stdin.text(),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 1000)
      ),
    ]);

    if (!text.trim()) {
      console.log(JSON.stringify({ success: false, error: 'No input provided' }));
      process.exit(0);
    }

    const input = JSON.parse(text) as HookInput;

    if (!input.session_id) {
      console.log(JSON.stringify({ success: false, error: 'No session_id provided' }));
      process.exit(0);
    }

    if (!input.transcript_path) {
      console.log(JSON.stringify({ success: false, error: 'No transcript_path provided' }));
      process.exit(0);
    }

    // Generate handoff
    const result = await generateHandoffFromTranscript(
      input.session_id,
      input.transcript_path,
      {
        goal: input.goal,
        focus: input.focus,
      }
    );

    // Output result
    console.log(JSON.stringify(result));
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[PreCompact] Hook error: ${message}`);
    console.log(JSON.stringify({ success: false, error: message }));
    process.exit(0);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}
