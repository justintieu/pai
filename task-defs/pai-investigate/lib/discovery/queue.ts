/**
 * queue.ts - Investigation queue management for discovered repos
 *
 * Persists repos discovered during search for later batch investigation.
 * Storage: ~/.pai/memory/investigation-queue.md
 */

import { homedir } from "os";
import { existsSync, mkdirSync } from "fs";

/**
 * Path to the investigation queue file
 */
export const QUEUE_PATH = `${homedir()}/.pai/memory/investigation-queue.md`;

/**
 * Initial template for a new queue file
 */
const QUEUE_TEMPLATE = `# Investigation Queue

## Pending

*No repos queued.*

## Investigated

*None yet.*
`;

/**
 * Entry in the investigation queue
 */
export interface QueueEntry {
  /** Full GitHub URL */
  url: string;
  /** Repository in owner/repo format */
  repoName: string;
  /** Why this repo was added (search query or suggestion context) */
  reason: string;
  /** ISO date when added (YYYY-MM-DD) */
  added: string;
}

/**
 * Parsed queue file contents
 */
interface ParsedQueue {
  /** Repos awaiting investigation */
  pending: QueueEntry[];
  /** Repos already investigated */
  investigated: QueueEntry[];
}

/**
 * Ensure the queue file exists, creating it with template if necessary.
 */
export async function ensureQueueFile(): Promise<void> {
  if (existsSync(QUEUE_PATH)) {
    return;
  }

  // Create parent directories
  const dir = QUEUE_PATH.substring(0, QUEUE_PATH.lastIndexOf("/"));
  mkdirSync(dir, { recursive: true });

  // Write initial template
  await Bun.write(QUEUE_PATH, QUEUE_TEMPLATE);
}

/**
 * Parse the queue file into structured data.
 *
 * Format: "- [ ] **owner/repo** - reason (YYYY-MM-DD)"
 * or:    "- [x] **owner/repo** - reason (YYYY-MM-DD)"
 */
export async function parseQueueFile(): Promise<ParsedQueue> {
  await ensureQueueFile();

  const content = await Bun.file(QUEUE_PATH).text();
  const pending: QueueEntry[] = [];
  const investigated: QueueEntry[] = [];

  // Regex to match queue entries
  // Format: - [ ] **owner/repo** - reason (YYYY-MM-DD)
  const entryRegex = /^- \[([ x])\] \*\*([^*]+)\*\* - (.+) \((\d{4}-\d{2}-\d{2})\)$/;

  for (const line of content.split("\n")) {
    const match = line.trim().match(entryRegex);
    if (!match) continue;

    const [, checkbox, repoName, reason, added] = match;
    const entry: QueueEntry = {
      url: `https://github.com/${repoName}`,
      repoName,
      reason,
      added,
    };

    if (checkbox === " ") {
      pending.push(entry);
    } else {
      investigated.push(entry);
    }
  }

  return { pending, investigated };
}

/**
 * Format a queue entry as a markdown line.
 *
 * @param entry - Queue entry to format
 * @param investigated - Whether this is an investigated entry (checked)
 * @returns Formatted markdown line
 */
export function formatQueueEntry(entry: QueueEntry, investigated: boolean): string {
  const checkbox = investigated ? "[x]" : "[ ]";
  return `- ${checkbox} **${entry.repoName}** - ${entry.reason} (${entry.added})`;
}

/**
 * Add a repository to the investigation queue.
 *
 * @param url - Full GitHub URL
 * @param reason - Why this repo is being queued (search query, suggestion context)
 * @returns The created QueueEntry, or null if already in queue
 *
 * @example
 * const entry = await addToQueue("https://github.com/anthropics/anthropic-cookbook", "AI agents search");
 * console.log(entry.repoName); // "anthropics/anthropic-cookbook"
 */
export async function addToQueue(url: string, reason: string): Promise<QueueEntry | null> {
  await ensureQueueFile();

  // Extract owner/repo from URL
  const match = url.match(/github\.com\/([^\/]+\/[^\/\s]+)/);
  if (!match) {
    throw new Error(`Invalid GitHub URL: ${url}`);
  }

  // Clean up repo name (remove .git suffix, trailing slash, etc.)
  let repoName = match[1];
  if (repoName.endsWith(".git")) {
    repoName = repoName.slice(0, -4);
  }
  if (repoName.endsWith("/")) {
    repoName = repoName.slice(0, -1);
  }

  // Check for duplicates
  const { pending } = await parseQueueFile();
  if (pending.some((e) => e.repoName === repoName)) {
    return null; // Already in queue
  }

  // Create entry with current date
  const today = new Date().toISOString().split("T")[0];
  const entry: QueueEntry = {
    url: `https://github.com/${repoName}`,
    repoName,
    reason,
    added: today,
  };

  // Read current content and insert new entry
  let content = await Bun.file(QUEUE_PATH).text();

  // Replace placeholder if present, otherwise insert after ## Pending
  if (content.includes("*No repos queued.*")) {
    content = content.replace("*No repos queued.*", formatQueueEntry(entry, false));
  } else {
    // Insert after ## Pending header
    content = content.replace(
      "## Pending\n",
      `## Pending\n${formatQueueEntry(entry, false)}\n`
    );
  }

  await Bun.write(QUEUE_PATH, content);
  return entry;
}

/**
 * Get all repositories currently queued for investigation.
 *
 * @returns Array of pending QueueEntry objects
 *
 * @example
 * const repos = await getQueuedRepos();
 * console.log(`${repos.length} repos waiting for investigation`);
 */
export async function getQueuedRepos(): Promise<QueueEntry[]> {
  await ensureQueueFile();
  const { pending } = await parseQueueFile();
  return pending;
}

/**
 * Mark a repository as investigated (move from Pending to Investigated).
 *
 * @param repoName - Repository name in owner/repo format
 * @returns true if found and moved, false if not in pending queue
 *
 * @example
 * const moved = await markInvestigated("anthropics/anthropic-cookbook");
 * console.log(moved ? "Marked as investigated" : "Not in queue");
 */
export async function markInvestigated(repoName: string): Promise<boolean> {
  await ensureQueueFile();

  const { pending, investigated } = await parseQueueFile();

  // Find the entry in pending
  const entryIndex = pending.findIndex((e) => e.repoName === repoName);
  if (entryIndex === -1) {
    return false;
  }

  const entry = pending[entryIndex];

  // Build new content
  let content = await Bun.file(QUEUE_PATH).text();

  // Remove from pending section
  const pendingLine = formatQueueEntry(entry, false);
  content = content.replace(pendingLine + "\n", "");
  content = content.replace(pendingLine, ""); // Handle case at end of section

  // Add placeholder back if pending is now empty
  const remainingPending = pending.filter((_, i) => i !== entryIndex);
  if (remainingPending.length === 0) {
    content = content.replace(
      "## Pending\n\n",
      "## Pending\n\n*No repos queued.*\n\n"
    );
  }

  // Add to investigated section
  const investigatedLine = formatQueueEntry(entry, true);
  if (content.includes("*None yet.*")) {
    content = content.replace("*None yet.*", investigatedLine);
  } else {
    content = content.replace(
      "## Investigated\n",
      `## Investigated\n${investigatedLine}\n`
    );
  }

  await Bun.write(QUEUE_PATH, content);
  return true;
}

/**
 * Get the count of pending repos in the queue.
 *
 * @returns Number of repos awaiting investigation
 *
 * @example
 * const count = await getQueueCount();
 * console.log(`${count} repos in queue`);
 */
export async function getQueueCount(): Promise<number> {
  const repos = await getQueuedRepos();
  return repos.length;
}

/**
 * Format a human-readable queue status message.
 *
 * @param pendingCount - Number of pending repos
 * @returns Status message
 *
 * @example
 * console.log(formatQueueStatus(5)); // "You have 5 repos queued for investigation"
 * console.log(formatQueueStatus(0)); // "Queue is empty"
 */
export function formatQueueStatus(pendingCount: number): string {
  if (pendingCount === 0) {
    return "Queue is empty";
  }
  if (pendingCount === 1) {
    return "You have 1 repo queued for investigation";
  }
  return `You have ${pendingCount} repos queued for investigation`;
}

// Allow running directly for testing
if (import.meta.main) {
  console.log("Testing queue operations...\n");

  // Reset queue for clean test
  await Bun.write(QUEUE_PATH, `# Investigation Queue

## Pending

*No repos queued.*

## Investigated

*None yet.*
`);
  console.log("Queue reset for testing.\n");

  // Add 2 repos
  console.log("Adding repos to queue...");
  const entry1 = await addToQueue("https://github.com/anthropics/anthropic-cookbook", "AI agents research");
  console.log(`  Added: ${entry1?.repoName ?? "skipped (duplicate)"}`);

  const entry2 = await addToQueue("https://github.com/langchain-ai/langchain", "LLM orchestration patterns");
  console.log(`  Added: ${entry2?.repoName ?? "skipped (duplicate)"}`);

  // Try adding duplicate
  const entry3 = await addToQueue("https://github.com/anthropics/anthropic-cookbook", "duplicate test");
  console.log(`  Duplicate attempt: ${entry3?.repoName ?? "skipped (duplicate)"}`);

  // Get count
  const count = await getQueueCount();
  console.log(`\nQueue count: ${count}`);
  console.log(`Status: ${formatQueueStatus(count)}`);

  // List repos
  const repos = await getQueuedRepos();
  console.log("\nQueued repos:");
  for (const repo of repos) {
    console.log(`  - ${repo.repoName}: "${repo.reason}" (${repo.added})`);
  }

  // Mark one investigated
  console.log("\nMarking anthropics/anthropic-cookbook as investigated...");
  const marked = await markInvestigated("anthropics/anthropic-cookbook");
  console.log(`  Result: ${marked ? "moved to investigated" : "not found"}`);

  // Final status
  const finalCount = await getQueueCount();
  console.log(`\nFinal status: ${formatQueueStatus(finalCount)}`);

  // Show file contents
  console.log("\n--- Queue file contents ---");
  console.log(await Bun.file(QUEUE_PATH).text());
}
