#!/usr/bin/env bun
/**
 * Gateway.hook.ts - User prompt preprocessor
 *
 * PURPOSE:
 * Lightweight preprocessing of user prompts. Work session creation is now
 * handled by PreToolUse (SecurityValidator) which triggers on actual file
 * operations, not prompt text patterns.
 *
 * TRIGGER: UserPromptSubmit (matcher: "")
 *
 * INPUT:
 * - user_prompt: The user's submitted prompt text
 * - session_id: Current session identifier
 *
 * OUTPUT:
 * - No output (pass-through)
 */

interface HookInput {
  session_id: string;
  user_prompt?: string;
}

async function main(): Promise<void> {
  try {
    const text = await Promise.race([
      Bun.stdin.text(),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 100)
      )
    ]);

    if (!text.trim()) {
      return;
    }

    // Parse input but don't do anything special yet
    // Work sessions are created by PreToolUse on actual file operations
    JSON.parse(text) as HookInput;
  } catch {
    // Silent fail
  }
}

main().catch(() => {});
