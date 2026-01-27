#!/usr/bin/env bun
/**
 * Gateway.hook.ts - Routes non-trivial requests to pai-orchestrate
 *
 * PURPOSE:
 * Detects if a user request is trivial or complex. Complex requests that
 * would benefit from decomposition and parallel execution get a nudge to
 * use pai-orchestrate.
 *
 * TRIGGER: UserPromptSubmit (matcher: "")
 *
 * INPUT:
 * - user_prompt: The user's submitted prompt text
 * - session_id: Current session identifier
 *
 * OUTPUT:
 * - stdout: Suggestion message if complex request detected
 * - No output: If trivial request, let it pass through normally
 *
 * DETECTION LOGIC:
 * - Trivial: Greetings, simple questions, confirmations
 * - Complex: Action verbs (implement, build, refactor) + multi-step indicators
 */

// ========================================
// Types
// ========================================

interface HookInput {
  session_id: string;
  user_prompt?: string;
}

// ========================================
// Detection Patterns
// ========================================

// Trivial patterns - don't route
const TRIVIAL_PATTERNS = /^(hi|hello|hey|what is|what's|how do i|can you|thanks|thank you|ok|yes|no|sure|got it)\b/i;

// Action verbs that suggest complex work
const ACTION_VERBS = /\b(implement|build|create|add|research|investigate|refactor|debug|fix|analyze|review|deploy|migrate|update|change|modify|write|develop)\b/i;

// Multi-step indicators
const MULTI_STEP = /\b(and then|after that|first|then|also|multiple|several|all)\b/i;

// Explicit orchestrate triggers (user already wants orchestration)
const ORCHESTRATE_TRIGGERS = /\b(orchestrate|decompose|plan out|break down)\b/i;

// ========================================
// Detection Logic
// ========================================

function isComplexRequest(prompt: string): { isComplex: boolean; reason?: string } {
  const normalizedPrompt = prompt.trim().toLowerCase();

  // Skip if trivial pattern matches at start
  if (TRIVIAL_PATTERNS.test(normalizedPrompt)) {
    return { isComplex: false };
  }

  // Skip if user already explicitly wants orchestration
  if (ORCHESTRATE_TRIGGERS.test(normalizedPrompt)) {
    return { isComplex: false }; // Let the skill routing handle it
  }

  const hasAction = ACTION_VERBS.test(normalizedPrompt);
  const isMultiStep = MULTI_STEP.test(normalizedPrompt);

  // Complex if: has action verbs OR multi-step indicators
  if (hasAction || isMultiStep) {
    const reasons: string[] = [];
    if (hasAction) reasons.push('action-verb');
    if (isMultiStep) reasons.push('multi-step');
    return { isComplex: true, reason: reasons.join('+') };
  }

  return { isComplex: false };
}

// ========================================
// Main
// ========================================

async function main(): Promise<void> {
  let input: HookInput;

  try {
    const text = await Promise.race([
      Bun.stdin.text(),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 100)
      )
    ]);

    if (!text.trim()) {
      return; // No output for empty input
    }

    input = JSON.parse(text);
  } catch {
    return; // Silent fail, don't block user
  }

  const prompt = input.user_prompt || '';
  if (!prompt.trim()) {
    return;
  }

  const result = isComplexRequest(prompt);

  if (result.isComplex) {
    // Output suggestion to stderr (shows to user but doesn't block)
    console.log(`PAI: Route to pai-orchestrate`);
  }

  // Always allow the request to proceed
}

main().catch(() => {
  // Silent fail - never block user prompts
});
