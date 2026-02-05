/**
 * Orama Index Management
 *
 * Manages vector database indexes for pattern storage and semantic search.
 * Indexes are persisted to ~/.pai/memory/patterns/indexes/ for reuse.
 */

import { create, insert, save, load } from "@orama/orama";
import type { Orama, TypedDocument } from "@orama/orama";
import { EMBEDDING_DIMENSIONS } from "./embeddings.ts";
import { homedir } from "os";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";

/**
 * Schema for pattern documents stored in Orama.
 */
const patternSchema = {
  id: "string",
  name: "string",
  description: "string",
  repo: "string",
  type: "string",
  tags: "string",
  embedding: `vector[${EMBEDDING_DIMENSIONS}]`,
} as const;

/**
 * Type for a pattern document in the Orama index.
 */
export interface PatternDocument {
  id: string;
  name: string;
  description: string;
  repo: string;
  type: string;
  tags: string;
  embedding: number[];
}

/**
 * Type for the Orama database instance with pattern schema.
 */
export type PatternIndex = Orama<typeof patternSchema>;

/**
 * Gets the path to the pattern indexes directory.
 */
function getIndexesDir(): string {
  return join(homedir(), ".pai", "memory", "patterns", "indexes");
}

/**
 * Gets the file path for a specific repo's index.
 *
 * @param repoName - Repository name in "owner/repo" or "owner_repo" format
 * @returns Full path to the index JSON file
 */
function getIndexPath(repoName: string): string {
  // Normalize repo name: owner/repo -> owner_repo
  const normalized = repoName.replace(/\//g, "_");
  return join(getIndexesDir(), `${normalized}.json`);
}

/**
 * Creates a new pattern index with the vector schema.
 *
 * @returns A new Orama database instance configured for pattern storage
 *
 * @example
 * ```typescript
 * const db = await createPatternIndex();
 * await insertPattern(db, {
 *   id: "pattern-001",
 *   name: "Error Handling",
 *   description: "Retry with exponential backoff",
 *   repo: "org/repo",
 *   type: "code",
 *   tags: "error,retry,backoff",
 *   embedding: [0.1, 0.2, ...]
 * });
 * ```
 */
export async function createPatternIndex(): Promise<PatternIndex> {
  const db = await create({
    schema: patternSchema,
  });
  return db as PatternIndex;
}

/**
 * Inserts a pattern document into the index.
 *
 * @param db - The Orama database instance
 * @param doc - The pattern document to insert
 *
 * @example
 * ```typescript
 * await insertPattern(db, {
 *   id: "pattern-001",
 *   name: "Circuit Breaker",
 *   description: "Prevents cascading failures",
 *   repo: "netflix/hystrix",
 *   type: "architectural",
 *   tags: "resilience,fault-tolerance",
 *   embedding: embedding
 * });
 * ```
 */
export async function insertPattern(
  db: PatternIndex,
  doc: PatternDocument
): Promise<void> {
  await insert(db, doc as TypedDocument<typeof patternSchema>);
}

/**
 * Saves the index to disk for the specified repository.
 *
 * @param db - The Orama database instance to save
 * @param repoName - Repository name (e.g., "owner/repo" or "owner_repo")
 * @returns The file path where the index was saved
 *
 * @example
 * ```typescript
 * const path = await saveIndex(db, "anthropics/anthropic-cookbook");
 * console.log(`Index saved to: ${path}`);
 * ```
 */
export async function saveIndex(
  db: PatternIndex,
  repoName: string
): Promise<string> {
  const indexPath = getIndexPath(repoName);
  const indexDir = getIndexesDir();

  // Ensure directory exists
  if (!existsSync(indexDir)) {
    mkdirSync(indexDir, { recursive: true });
  }

  // Serialize and save
  const serialized = await save(db);
  writeFileSync(indexPath, JSON.stringify(serialized, null, 2));

  return indexPath;
}

/**
 * Loads an existing index from disk for the specified repository.
 *
 * @param repoName - Repository name (e.g., "owner/repo" or "owner_repo")
 * @returns The loaded Orama database, or null if index doesn't exist
 *
 * @example
 * ```typescript
 * const db = await loadIndex("anthropics/anthropic-cookbook");
 * if (db) {
 *   const results = await search(db, ...);
 * }
 * ```
 */
export async function loadIndex(repoName: string): Promise<PatternIndex | null> {
  const indexPath = getIndexPath(repoName);

  if (!existsSync(indexPath)) {
    return null;
  }

  try {
    const content = readFileSync(indexPath, "utf-8");
    const serialized = JSON.parse(content);

    // Create a fresh database instance with the same schema
    const db = await create({
      schema: patternSchema,
    });

    // Load the serialized data into the database
    load(db, serialized);

    return db as PatternIndex;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to load index for ${repoName}: ${message}`);
    return null;
  }
}
