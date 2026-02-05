/**
 * storage.ts - Pattern persistence to ~/.pai/memory/patterns/
 *
 * Provides functions for reading and writing patterns to the filesystem.
 * Patterns are stored as markdown files with index tracking in JSON.
 */

import { existsSync, mkdirSync } from "fs";
import type { ExtractedPattern } from "./types.ts";

/**
 * Base directory for pattern storage
 */
const HOME = Bun.env.HOME || process.env.HOME || "~";
export const PATTERNS_DIR = `${HOME}/.pai/memory/patterns`;
export const APPROVED_DIR = `${PATTERNS_DIR}/approved`;
export const INDEXES_DIR = `${PATTERNS_DIR}/indexes`;
const INDEX_FILE = `${PATTERNS_DIR}/index.json`;

/**
 * Pattern status in the index
 */
export type PatternStatus = "pending" | "approved" | "rejected" | "archived";

/**
 * Entry for a pattern in the index
 */
export interface PatternIndexEntry {
  /** Current status of the pattern */
  status: PatternStatus;
  /** ISO timestamp when pattern was detected */
  detectedAt: string;
  /** ISO timestamp when pattern was last updated */
  updatedAt?: string;
  /** Source repository */
  repo?: string;
  /** Pattern type */
  type?: string;
  /** Brief description */
  description?: string;
}

/**
 * Structure of the pattern index file
 *
 * Extends the existing index.json structure to support extracted patterns.
 */
export interface PatternIndex {
  /** Map of pattern IDs to their index entries */
  patterns: Record<string, PatternIndexEntry>;
  /** ISO timestamp of last index update */
  lastUpdated: string;
}

/**
 * Load the pattern index from disk
 *
 * @returns Pattern index object
 *
 * @example
 * const index = await loadPatternIndex();
 * console.log(Object.keys(index.patterns).length);
 */
export async function loadPatternIndex(): Promise<PatternIndex> {
  try {
    const file = Bun.file(INDEX_FILE);
    if (await file.exists()) {
      const content = await file.text();
      return JSON.parse(content) as PatternIndex;
    }
  } catch (error) {
    console.error("Error loading pattern index:", error);
  }

  // Return empty index if file doesn't exist or can't be parsed
  return {
    patterns: {},
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Update the pattern index with a new or modified pattern entry
 *
 * @param patternId - Unique pattern identifier
 * @param status - New status for the pattern
 * @param metadata - Optional additional metadata to include
 *
 * @example
 * await updatePatternIndex("process-save-summarize_owner_repo", "approved", {
 *   repo: "owner/repo",
 *   type: "workflow"
 * });
 */
export async function updatePatternIndex(
  patternId: string,
  status: PatternStatus,
  metadata?: Partial<PatternIndexEntry>
): Promise<void> {
  const index = await loadPatternIndex();

  const now = new Date().toISOString();
  const existing = index.patterns[patternId];

  index.patterns[patternId] = {
    status,
    detectedAt: existing?.detectedAt ?? now,
    updatedAt: now,
    ...metadata,
  };

  index.lastUpdated = now;

  // Ensure directory exists
  if (!existsSync(PATTERNS_DIR)) {
    mkdirSync(PATTERNS_DIR, { recursive: true });
  }

  // Write updated index
  await Bun.write(INDEX_FILE, JSON.stringify(index, null, 2) + "\n");
}

/**
 * Generate a unique pattern ID from name and repo
 *
 * @param name - Pattern name (e.g., "Process-Save-Summarize")
 * @param repo - Repository in owner/repo format
 * @returns Unique ID (e.g., "process-save-summarize_owner_repo")
 *
 * @example
 * const id = generatePatternId("Process-Save-Summarize", "anthropics/anthropic-cookbook");
 * // Returns: "process-save-summarize_anthropics_anthropic-cookbook"
 */
export function generatePatternId(name: string, repo: string): string {
  const normalizedName = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const normalizedRepo = repo.replace("/", "_").replace(/[^a-zA-Z0-9_-]/g, "");

  return `${normalizedName}_${normalizedRepo}`;
}

/**
 * Format an extracted pattern as markdown
 *
 * @param pattern - Pattern to format
 * @returns Markdown string
 *
 * @example
 * const md = formatPatternMarkdown(pattern);
 * console.log(md);
 */
export function formatPatternMarkdown(pattern: ExtractedPattern): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${pattern.name}`);
  lines.push("");

  // Metadata
  lines.push(`**Type:** ${pattern.type}`);
  lines.push(`**PAI Relevance:** ${pattern.pai_relevance}`);
  lines.push(`**Extracted:** ${pattern.extracted_at}`);
  lines.push("");

  // Source
  lines.push("## Source");
  lines.push("");
  lines.push(`- **Repository:** [${pattern.source.repo}](${pattern.source.url})`);
  lines.push(`- **Investigation:** \`${pattern.source.report_path}\``);
  if (pattern.source.file) {
    lines.push(`- **File:** \`${pattern.source.file}\``);
  }
  lines.push("");

  // Description
  lines.push("## Description");
  lines.push("");
  lines.push(pattern.description);
  lines.push("");

  // Code snippet if available
  if (pattern.source.snippet) {
    lines.push("## Example");
    lines.push("");
    lines.push("```");
    lines.push(pattern.source.snippet);
    lines.push("```");
    lines.push("");
  }

  // Existing alternative if present
  if (pattern.existing_alternative) {
    lines.push("## Existing Alternative");
    lines.push("");
    lines.push(`PAI already has similar functionality: ${pattern.existing_alternative}`);
    lines.push("");
  }

  // Tags
  lines.push("## Tags");
  lines.push("");
  lines.push(pattern.tags.join(", "));
  lines.push("");

  // Footer
  lines.push("---");
  lines.push("");
  lines.push(`*Pattern ID: ${pattern.id}*`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Save a pattern to the approved directory
 *
 * Creates a markdown file in ~/.pai/memory/patterns/approved/
 * and updates the pattern index.
 *
 * @param pattern - Pattern to save
 * @returns Full path to the saved file
 *
 * @example
 * const path = await savePattern(pattern);
 * console.log(`Saved to: ${path}`);
 */
export async function savePattern(pattern: ExtractedPattern): Promise<string> {
  // Ensure directory exists
  if (!existsSync(APPROVED_DIR)) {
    mkdirSync(APPROVED_DIR, { recursive: true });
  }

  // Generate filename from pattern ID
  const filename = `${pattern.id}.md`;
  const filepath = `${APPROVED_DIR}/${filename}`;

  // Format and write
  const markdown = formatPatternMarkdown(pattern);
  await Bun.write(filepath, markdown);

  // Update index
  await updatePatternIndex(pattern.id, "approved", {
    repo: pattern.source.repo,
    type: pattern.type,
    description:
      pattern.description.length > 100
        ? pattern.description.slice(0, 97) + "..."
        : pattern.description,
  });

  return filepath;
}

/**
 * Get all approved patterns from the index
 *
 * @returns Array of pattern IDs that are approved
 */
export async function getApprovedPatterns(): Promise<string[]> {
  const index = await loadPatternIndex();
  return Object.entries(index.patterns)
    .filter(([_, entry]) => entry.status === "approved")
    .map(([id]) => id);
}

/**
 * Get all pending patterns from the index
 *
 * @returns Array of pattern IDs awaiting review
 */
export async function getPendingPatterns(): Promise<string[]> {
  const index = await loadPatternIndex();
  return Object.entries(index.patterns)
    .filter(([_, entry]) => entry.status === "pending")
    .map(([id]) => id);
}

// Allow running directly for testing
if (import.meta.main) {
  console.log("=== Pattern Storage Test ===\n");

  // Load current index
  const index = await loadPatternIndex();
  console.log("Current index:");
  console.log(JSON.stringify(index, null, 2));
  console.log("");

  // Generate a test pattern ID
  const testId = generatePatternId("Process-Save-Summarize", "anthropics/anthropic-cookbook");
  console.log(`Generated ID: ${testId}`);
  console.log("");

  // Create a mock pattern
  const mockPattern: ExtractedPattern = {
    id: testId,
    name: "Process-Save-Summarize",
    type: "workflow",
    description: "Sub-agent workflow that processes data, saves to files, returns summaries",
    source: {
      repo: "anthropics/anthropic-cookbook",
      url: "https://github.com/anthropics/anthropic-cookbook",
      report_path: "~/.pai/output/investigations/anthropics_anthropic-cookbook_2026-01-29.yaml",
    },
    pai_relevance: "high",
    tags: ["workflow", "sub-agent", "delegation"],
    extracted_at: new Date().toISOString(),
  };

  console.log("Mock pattern markdown:");
  console.log(formatPatternMarkdown(mockPattern));
}
