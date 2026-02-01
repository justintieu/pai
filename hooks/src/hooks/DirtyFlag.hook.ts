#!/usr/bin/env bun
/**
 * DirtyFlag.hook.ts - Track file modifications and trigger checkpoints
 *
 * PURPOSE:
 * Implements a "dirty flag" system that counts Edit/Write operations and
 * prompts Claude to update working memory when threshold is reached.
 *
 * TRIGGERS:
 * - PostToolUse (matcher: Edit|Write): Increments counter
 * - PreToolUse (matcher: Edit|Write): Checks threshold, injects reminder if exceeded
 *
 * DESIGN:
 * - Uses file-based counter (environment variables don't persist)
 * - Session-aware (resets on new session)
 * - Threshold configurable in dirty-counter.json
 */

import { incrementCounter, checkThreshold, resetCounter } from '../lib/dirty-counter';

interface HookInput {
  session_id: string;
  tool_name?: string;
  hook_event_name: string;
}

async function readStdin(): Promise<HookInput | null> {
  try {
    const decoder = new TextDecoder();
    const reader = Bun.stdin.stream().getReader();
    let input = '';

    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 100); // Fast timeout for high-frequency hook
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
    console.error('[DirtyFlag] Error reading stdin:', error);
  }
  return null;
}

async function main() {
  const action = process.argv[2]; // 'increment' or 'check'
  const hookInput = await readStdin();
  const sessionId = hookInput?.session_id;

  if (action === 'increment') {
    const state = incrementCounter(sessionId);
    console.error(`[DirtyFlag] Count: ${state.count}/${state.threshold}`);
    process.exit(0);
  }

  if (action === 'check') {
    const { exceeded, count, threshold } = checkThreshold(sessionId);

    if (exceeded) {
      // Output JSON that adds context prompting checkpoint
      const response = {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          additionalContext: `**CHECKPOINT REMINDER**: You've made ${count} file edits since last checkpoint. Before continuing, update \`.claude/working-memory.md\` with:
- Current task state
- Key decisions made
- Next steps

After updating, the reminder will reset.`,
          permissionDecision: "allow"
        }
      };
      console.log(JSON.stringify(response));

      // Reset counter after prompting
      resetCounter();
      console.error(`[DirtyFlag] Threshold reached, checkpoint prompted, counter reset`);
    }
    process.exit(0);
  }

  // Unknown action
  console.error(`[DirtyFlag] Unknown action: ${action}`);
  process.exit(0);
}

main().catch((error) => {
  console.error('[DirtyFlag] Error:', error);
  process.exit(0); // Non-blocking failure
});
