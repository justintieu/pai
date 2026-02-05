/**
 * Semantic and Keyword Search
 *
 * Provides search functions for finding patterns in the vector database.
 * Gracefully falls back to keyword search when Ollama is unavailable.
 */

import { search } from "@orama/orama";
import type { PatternIndex } from "./index.ts";
import { generateEmbedding, checkOllamaAvailable } from "./embeddings.ts";

/**
 * Search result from pattern queries.
 */
export interface SearchResult {
  id: string;
  name: string;
  description: string;
  repo: string;
  score: number;
}

/**
 * Options for search operations.
 */
export interface SearchOptions {
  /** Maximum number of results to return (default: 10) */
  limit?: number;
  /** Minimum similarity threshold for vector search (default: 0.7) */
  threshold?: number;
}

/**
 * Performs semantic search using vector similarity.
 * Requires Ollama to be running for embedding generation.
 *
 * @param db - The Orama database to search
 * @param query - The natural language query
 * @param options - Search options (limit, threshold)
 * @returns Array of matching patterns sorted by similarity
 * @throws Error if embedding generation fails
 *
 * @example
 * ```typescript
 * const results = await semanticSearch(db, "error handling patterns");
 * for (const r of results) {
 *   console.log(`${r.name} (${r.score.toFixed(2)}): ${r.description}`);
 * }
 * ```
 */
export async function semanticSearch(
  db: PatternIndex,
  query: string,
  options?: SearchOptions
): Promise<SearchResult[]> {
  const limit = options?.limit ?? 10;
  const threshold = options?.threshold ?? 0.7;

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Search using vector similarity
  const results = await search(db, {
    mode: "vector",
    vector: {
      value: queryEmbedding,
      property: "embedding",
    },
    similarity: threshold,
    limit,
  });

  // Map to SearchResult format
  return results.hits.map((hit) => ({
    id: hit.document.id as string,
    name: hit.document.name as string,
    description: hit.document.description as string,
    repo: hit.document.repo as string,
    score: hit.score,
  }));
}

/**
 * Performs keyword-based full-text search.
 * Works without Ollama - used as fallback when embeddings unavailable.
 *
 * @param db - The Orama database to search
 * @param query - The search query (keywords)
 * @param options - Search options (limit)
 * @returns Array of matching patterns sorted by relevance
 *
 * @example
 * ```typescript
 * const results = await keywordSearch(db, "retry backoff");
 * ```
 */
export async function keywordSearch(
  db: PatternIndex,
  query: string,
  options?: SearchOptions
): Promise<SearchResult[]> {
  const limit = options?.limit ?? 10;

  // Search using full-text
  const results = await search(db, {
    term: query,
    properties: ["name", "description", "tags"],
    limit,
  });

  // Map to SearchResult format
  return results.hits.map((hit) => ({
    id: hit.document.id as string,
    name: hit.document.name as string,
    description: hit.document.description as string,
    repo: hit.document.repo as string,
    score: hit.score,
  }));
}

/**
 * Performs hybrid search with automatic fallback.
 * Uses semantic search if Ollama is available, otherwise falls back to keyword search.
 * This is the primary entry point for searches.
 *
 * @param db - The Orama database to search
 * @param query - The search query
 * @param options - Search options (limit, threshold)
 * @returns Array of matching patterns sorted by relevance
 *
 * @example
 * ```typescript
 * // Will use semantic search if Ollama running, keyword search otherwise
 * const results = await hybridSearch(db, "how to handle errors gracefully");
 * ```
 */
export async function hybridSearch(
  db: PatternIndex,
  query: string,
  options?: SearchOptions
): Promise<SearchResult[]> {
  // Check if Ollama is available for semantic search
  const ollamaAvailable = await checkOllamaAvailable();

  if (ollamaAvailable) {
    try {
      return await semanticSearch(db, query, options);
    } catch (error) {
      // If semantic search fails, fall back to keyword search
      console.warn(
        `Semantic search failed, falling back to keyword search: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return await keywordSearch(db, query, options);
    }
  }

  // Ollama not available - use keyword search
  console.warn("Ollama not available, using keyword search");
  return await keywordSearch(db, query, options);
}
