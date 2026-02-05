/**
 * Pattern Indexer
 *
 * Creates and manages semantic indexes for extracted patterns.
 * Implements progressive indexing strategy: high-relevance patterns first,
 * medium-relevance patterns if needed, low-relevance patterns skipped.
 *
 * Indexes are persisted to ~/.pai/memory/patterns/indexes/ for repeat queries.
 */

import {
  createPatternIndex,
  insertPattern,
  saveIndex,
  loadIndex,
  type PatternDocument,
  type PatternIndex,
} from "./index.ts";
import {
  generateEmbedding,
  checkOllamaAvailable,
  EMBEDDING_DIMENSIONS,
} from "./embeddings.ts";
import { hybridSearch, type SearchResult } from "./search.ts";
import type { ExtractedPattern, PaiRelevance } from "../patterns/types.ts";
import { homedir } from "os";
import { join } from "path";
import { existsSync, readdirSync } from "fs";

/**
 * Result of an indexing operation
 */
export interface IndexingResult {
  /** Number of patterns successfully indexed */
  indexed_count: number;
  /** Number of patterns skipped (low relevance or already indexed) */
  skipped_count: number;
  /** Path where the index was saved (if persisted) */
  index_path: string;
  /** Whether Ollama was available for semantic embeddings */
  ollama_available: boolean;
}

/**
 * Creates a zero-filled embedding for keyword-only indexing.
 * Used when Ollama is unavailable.
 */
function createZeroEmbedding(): number[] {
  return new Array(EMBEDDING_DIMENSIONS).fill(0);
}

/**
 * Generates a text representation of a pattern for embedding.
 * Combines name, description, and tags for richer semantic context.
 */
function patternToText(pattern: ExtractedPattern): string {
  return `${pattern.name}: ${pattern.description}. Tags: ${pattern.tags.join(", ")}`;
}

/**
 * Determines if a pattern should be indexed based on progressive strategy.
 *
 * Phase 1: Always index high-relevance patterns
 * Phase 2: Index medium-relevance if <10 high-relevance patterns
 * Low-relevance patterns are always skipped
 *
 * @param pattern - Pattern to evaluate
 * @param highRelevanceCount - Number of high-relevance patterns already indexed
 * @returns true if pattern should be indexed
 */
function shouldIndex(
  pattern: ExtractedPattern,
  highRelevanceCount: number
): boolean {
  switch (pattern.pai_relevance) {
    case "high":
      // Phase 1: Always index high-relevance
      return true;
    case "medium":
      // Phase 2: Index medium if not enough high-relevance
      return highRelevanceCount < 10;
    case "low":
      // Never index low-relevance
      return false;
    default:
      return false;
  }
}

/**
 * Indexes patterns with progressive strategy and optional embedding generation.
 *
 * Progressive strategy per CONTEXT.md:
 * - Phase 1: Index high-relevance patterns first (always)
 * - Phase 2: Index medium-relevance patterns if <10 high-relevance indexed
 * - Skip low-relevance patterns (should already be filtered by extractor)
 *
 * Graceful degradation:
 * - If Ollama available: Generate semantic embeddings for each pattern
 * - If Ollama unavailable: Index with zero embeddings (keyword-only mode)
 *
 * @param patterns - Patterns to index
 * @param repoName - Repository name (e.g., "owner/repo")
 * @returns IndexingResult with counts and Ollama availability
 *
 * @example
 * ```typescript
 * const result = await indexPatterns(extractedPatterns, "anthropics/anthropic-cookbook");
 * console.log(`Indexed ${result.indexed_count} patterns`);
 * if (!result.ollama_available) {
 *   console.log("Using keyword-only mode (Ollama unavailable)");
 * }
 * ```
 */
export async function indexPatterns(
  patterns: ExtractedPattern[],
  repoName: string
): Promise<{ db: PatternIndex; result: IndexingResult }> {
  // Handle empty patterns case
  if (patterns.length === 0) {
    const db = await createPatternIndex();
    return {
      db,
      result: {
        indexed_count: 0,
        skipped_count: 0,
        index_path: "",
        ollama_available: false,
      },
    };
  }

  // Check Ollama availability
  const ollamaAvailable = await checkOllamaAvailable();

  // Create new index
  const db = await createPatternIndex();

  // Count high-relevance patterns for progressive strategy
  const highRelevanceCount = patterns.filter(
    (p) => p.pai_relevance === "high"
  ).length;

  let indexedCount = 0;
  let skippedCount = 0;

  // Index patterns with progressive strategy
  for (const pattern of patterns) {
    if (!shouldIndex(pattern, highRelevanceCount)) {
      skippedCount++;
      continue;
    }

    // Generate embedding (or use zero embedding for keyword-only)
    let embedding: number[];
    if (ollamaAvailable) {
      try {
        embedding = await generateEmbedding(patternToText(pattern));
      } catch {
        // If embedding fails, use zero embedding for this pattern
        embedding = createZeroEmbedding();
      }
    } else {
      embedding = createZeroEmbedding();
    }

    // Create pattern document
    const doc: PatternDocument = {
      id: pattern.id,
      name: pattern.name,
      description: pattern.description,
      repo: pattern.source.repo,
      type: pattern.type,
      tags: pattern.tags.join(","),
      embedding,
    };

    // Insert into index
    await insertPattern(db, doc);
    indexedCount++;
  }

  return {
    db,
    result: {
      indexed_count: indexedCount,
      skipped_count: skippedCount,
      index_path: "",
      ollama_available: ollamaAvailable,
    },
  };
}

/**
 * Indexes patterns and persists the index to disk.
 *
 * Combines indexPatterns() with saveIndex() for complete workflow.
 *
 * @param patterns - Patterns to index
 * @param repoName - Repository name (e.g., "owner/repo")
 * @returns IndexingResult with counts and saved index path
 *
 * @example
 * ```typescript
 * const result = await indexAndPersist(patterns, "anthropics/anthropic-cookbook");
 * console.log(`Index saved to: ${result.index_path}`);
 * ```
 */
export async function indexAndPersist(
  patterns: ExtractedPattern[],
  repoName: string
): Promise<IndexingResult> {
  // Index patterns
  const { db, result } = await indexPatterns(patterns, repoName);

  // Save to disk if any patterns were indexed
  let indexPath = "";
  if (result.indexed_count > 0) {
    indexPath = await saveIndex(db, repoName);
  }

  return {
    ...result,
    index_path: indexPath,
  };
}

/**
 * Queries patterns from a specific repository's index.
 *
 * Uses hybridSearch() which automatically falls back to keyword search
 * if Ollama is unavailable.
 *
 * @param repoName - Repository name (e.g., "owner/repo")
 * @param query - Natural language query or keywords
 * @param options - Search options (limit)
 * @returns Search results, or empty array if index doesn't exist
 *
 * @example
 * ```typescript
 * const results = await queryPatterns("anthropics/anthropic-cookbook", "error handling");
 * for (const r of results) {
 *   console.log(`${r.name}: ${r.description}`);
 * }
 * ```
 */
export async function queryPatterns(
  repoName: string,
  query: string,
  options?: { limit?: number }
): Promise<SearchResult[]> {
  // Load index from disk
  const db = await loadIndex(repoName);

  if (!db) {
    console.warn(`No index found for ${repoName}`);
    return [];
  }

  // Use hybrid search (semantic if Ollama available, keyword otherwise)
  return await hybridSearch(db, query, { limit: options?.limit ?? 10 });
}

/**
 * Gets the indexes directory path.
 */
function getIndexesDir(): string {
  return join(homedir(), ".pai", "memory", "patterns", "indexes");
}

/**
 * Lists all indexed repositories.
 *
 * @returns Array of repository names that have been indexed
 */
export function listIndexedRepos(): string[] {
  const indexesDir = getIndexesDir();

  if (!existsSync(indexesDir)) {
    return [];
  }

  try {
    const files = readdirSync(indexesDir);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", "").replace("_", "/"));
  } catch {
    return [];
  }
}

/**
 * Queries patterns across all indexed repositories.
 *
 * Performs cross-repo search per CONTEXT.md specification:
 * "Single-repo by default, cross-repo (PAI memory) when explicitly requested"
 *
 * @param query - Natural language query or keywords
 * @param options - Search options (limit)
 * @returns Merged and ranked search results from all repos
 *
 * @example
 * ```typescript
 * const results = await queryAllPatterns("context management patterns", { limit: 20 });
 * for (const r of results) {
 *   console.log(`[${r.repo}] ${r.name}: ${r.description}`);
 * }
 * ```
 */
export async function queryAllPatterns(
  query: string,
  options?: { limit?: number }
): Promise<SearchResult[]> {
  const indexesDir = getIndexesDir();
  const limit = options?.limit ?? 10;

  // Check if indexes directory exists
  if (!existsSync(indexesDir)) {
    console.warn("No pattern indexes found");
    return [];
  }

  // Get all index files
  let indexFiles: string[];
  try {
    indexFiles = readdirSync(indexesDir).filter((f) => f.endsWith(".json"));
  } catch {
    console.warn("Failed to read indexes directory");
    return [];
  }

  if (indexFiles.length === 0) {
    console.warn("No pattern indexes found");
    return [];
  }

  // Search each index and collect results
  const allResults: SearchResult[] = [];

  for (const indexFile of indexFiles) {
    const repoName = indexFile.replace(".json", "").replace("_", "/");
    const db = await loadIndex(repoName);

    if (db) {
      try {
        // Get top results from each repo (get more than limit, will merge later)
        const repoResults = await hybridSearch(db, query, {
          limit: Math.ceil(limit / indexFiles.length) + 5,
        });
        allResults.push(...repoResults);
      } catch (error) {
        console.warn(
          `Failed to search ${repoName}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  // Sort by score (descending) and limit results
  allResults.sort((a, b) => b.score - a.score);
  return allResults.slice(0, limit);
}
