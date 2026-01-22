/**
 * notification.ts - Desktop/Push notification handler
 *
 * Pure handler: receives pre-parsed transcript data, sends desktop and push
 * notifications via the notification routing system.
 *
 * Channels used:
 * - desktop: macOS native notifications via osascript
 * - ntfy: Mobile push notifications via ntfy.sh
 *
 * Configuration: ~/.pai/config/notifications.json
 */

import { notifyTaskComplete } from '../lib/notifications';
import type { ParsedTranscript } from '../tools/TranscriptParser';

/**
 * Handle notification with pre-parsed transcript data.
 * Routes to appropriate channels based on task duration.
 */
export async function handleNotification(
  parsed: ParsedTranscript,
  sessionId: string
): Promise<void> {
  // Get a summary from the plain completion
  const completion = parsed.plainCompletion.trim();

  // Skip empty completions
  if (!completion || completion.length < 5) {
    console.error('[Notification] Skipping - completion too short or empty');
    return;
  }

  // Truncate to reasonable notification length
  const maxLength = 150;
  let summary = completion;
  if (summary.length > maxLength) {
    summary = summary.slice(0, maxLength - 3) + '...';
  }

  // Send notification through the routing system
  // notifyTaskComplete automatically routes to desktop for short tasks,
  // or desktop+ntfy for long-running tasks (>5 minutes)
  await notifyTaskComplete(summary);

  console.error(`[Notification] Sent: "${summary.slice(0, 50)}..."`);
}
