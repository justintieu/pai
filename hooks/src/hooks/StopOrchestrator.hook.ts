#!/usr/bin/env bun
/**
 * StopOrchestrator.hook.ts - Single Entry Point for Stop Hooks
 *
 * PURPOSE:
 * Orchestrates all Stop event handlers by reading and parsing the transcript
 * ONCE, then distributing the parsed data to isolated handlers. This prevents
 * multiple redundant transcript reads and ensures data consistency.
 *
 * TRIGGER: Stop (fires after Claude generates a response)
 *
 * INPUT:
 * - session_id: Current session identifier
 * - transcript_path: Path to the JSONL transcript file
 * - hook_event_name: "Stop"
 *
 * OUTPUT:
 * - stdout: None (no context injection)
 * - exit(0): Normal completion
 *
 * SIDE EFFECTS:
 * - Voice handler: Announces completion via voice server
 * - Capture handler: Updates WORK/ directory with response
 * - TabState handler: Resets tab title/color to default
 * - SystemIntegrity handler: Detects PAI changes and logs them
 * - Notification handler: Sends desktop and push notifications
 * - LearningCapture handler: Captures learnings on topic completion
 * - DecisionLog handler: Extracts decisions from responses, persists to log
 * - WorkingMemoryUpdate handler: Updates working memory with recent decisions
 *
 * HANDLERS (in handlers/):
 * - voice.ts: Extracts 🗣️ line, sends to voice server
 * - capture.ts: Updates current-work.json and WORK/ items
 * - tab-state.ts: Resets Kitty tab to default color
 * - SystemIntegrity.ts: Detects PAI changes, logs them
 * - notification.ts: Sends desktop/ntfy notifications
 * - learning-capture.ts: Topic-aware learning capture (replaces SessionEnd)
 * - decision-log.ts: Pattern-based decision extraction and logging
 * - working-memory-update.ts: Automatic working memory update with decisions
 *
 * ERROR HANDLING:
 * - Missing transcript: Exits gracefully
 * - Parse failures: Logged, exits gracefully
 * - Handler failures: Isolated via Promise.allSettled (one failure doesn't affect others)
 */

import { parseTranscript } from '../tools/TranscriptParser';
import { handleVoice } from '../handlers/voice';
import { handleCapture } from '../handlers/capture';
import { handleTabState } from '../handlers/tab-state';
import { handleSystemIntegrity } from '../handlers/SystemIntegrity';
import { handleNotification } from '../handlers/notification';
import { handleLearningCapture } from '../handlers/learning-capture';
import { handleDecisionLog } from '../handlers/decision-log';
import { handleWorkingMemoryUpdate } from '../handlers/working-memory-update';

interface HookInput {
  session_id: string;
  transcript_path: string;
  hook_event_name: string;
}

async function readStdin(): Promise<HookInput | null> {
  try {
    const decoder = new TextDecoder();
    const reader = Bun.stdin.stream().getReader();
    let input = '';

    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });

    const readPromise = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        input += decoder.decode(value, { stream: true });
      }
    })();

    await Promise.race([readPromise, timeoutPromise]);

    if (input.trim()) {
      return JSON.parse(input) as HookInput;
    }
  } catch (error) {
    console.error('[StopOrchestrator] Error reading stdin:', error);
  }
  return null;
}

async function main() {
  const hookInput = await readStdin();

  if (!hookInput || !hookInput.transcript_path) {
    console.error('[StopOrchestrator] No transcript path provided');
    process.exit(0);
  }

  // SINGLE READ, SINGLE PARSE
  const parsed = parseTranscript(hookInput.transcript_path);

  console.error(`[StopOrchestrator] Parsed transcript: ${parsed.plainCompletion.slice(0, 50)}...`);

  // Run handlers with pre-parsed data (isolated failures)
  const results = await Promise.allSettled([
    handleVoice(parsed, hookInput.session_id),
    handleCapture(parsed, hookInput),
    handleTabState(parsed),
    handleSystemIntegrity(parsed, hookInput),
    handleNotification(parsed, hookInput.session_id),
    handleLearningCapture(parsed, hookInput),
    handleDecisionLog(parsed, hookInput),
    handleWorkingMemoryUpdate(parsed, hookInput),
  ]);

  // Log any failures
  results.forEach((result, index) => {
    const handlerNames = ['Voice', 'Capture', 'TabState', 'SystemIntegrity', 'Notification', 'LearningCapture', 'DecisionLog', 'WorkingMemoryUpdate'];
    if (result.status === 'rejected') {
      console.error(`[StopOrchestrator] ${handlerNames[index]} handler failed:`, result.reason);
    }
  });

  process.exit(0);
}

main().catch((error) => {
  console.error('[StopOrchestrator] Fatal error:', error);
  process.exit(0);
});
