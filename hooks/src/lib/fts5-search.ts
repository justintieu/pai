/**
 * FTS5 Full-Text Search for Learnings
 *
 * SQLite FTS5 implementation for fast full-text search of learnings.
 * Uses Porter tokenizer for stemming and BM25 ranking for relevance scoring.
 *
 * Based on: ~/.pai/memory/learning/SYSTEM/2026-01/vector-embeddings-recall.md
 *
 * Usage:
 *   import { initDatabase, searchLearnings, indexLearning } from './lib/fts5-search';
 *
 *   const db = initDatabase();
 *   indexLearning(db, { title: '...', content: '...', category: 'SYSTEM', tags: ['tag1'] });
 *   const results = searchLearnings(db, 'error handling');
 */

import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { paiPath } from '@/lib/paths';

// ============================================================================
// Types
// ============================================================================

/**
 * Learning document to be indexed
 */
export interface LearningDocument {
  /** Document ID (optional - auto-generated if not provided) */
  id?: string;
  /** Learning title */
  title: string;
  /** Full content of the learning */
  content: string;
  /** Category: SYSTEM or ALGORITHM */
  category: 'SYSTEM' | 'ALGORITHM';
  /** Tags for filtering */
  tags: string[];
  /** Source file path (optional) */
  sourcePath?: string;
  /** Creation timestamp */
  createdAt?: string;
}

/**
 * Search result with relevance score
 */
export interface SearchResult {
  /** Document ID */
  id: string;
  /** Learning title */
  title: string;
  /** Snippet of matching content with highlights */
  snippet: string;
  /** Category: SYSTEM or ALGORITHM */
  category: string;
  /** Tags */
  tags: string[];
  /** Source file path */
  sourcePath: string | null;
  /** BM25 relevance score (lower is more relevant) */
  score: number;
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Search options
 */
export interface SearchOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Filter by category */
  category?: 'SYSTEM' | 'ALGORITHM';
  /** Filter by tags (any match) */
  tags?: string[];
  /** Minimum score threshold (lower = more relevant) */
  minScore?: number;
}

// ============================================================================
// Database Path
// ============================================================================

/**
 * Get the database file path
 */
export function getDatabasePath(): string {
  return paiPath('data', 'learnings.db');
}

// ============================================================================
// Database Initialization
// ============================================================================

/**
 * Initialize the FTS5 database
 * Creates the database file and tables if they don't exist.
 *
 * @returns Initialized database instance
 */
export function initDatabase(): Database {
  const dbPath = getDatabasePath();
  const dbDir = dirname(dbPath);

  // Ensure data directory exists
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  db.exec('PRAGMA journal_mode = WAL');

  // Create the main learnings table for metadata
  db.exec(`
    CREATE TABLE IF NOT EXISTS learnings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT NOT NULL,
      source_path TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // Create FTS5 virtual table with Porter tokenizer for stemming
  // content='' means external content (we manage content ourselves)
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS learnings_fts USING fts5(
      title,
      content,
      category,
      tags,
      content='learnings',
      content_rowid='rowid',
      tokenize='porter unicode61'
    )
  `);

  // Create triggers to keep FTS index in sync with main table
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS learnings_ai AFTER INSERT ON learnings BEGIN
      INSERT INTO learnings_fts(rowid, title, content, category, tags)
      VALUES (NEW.rowid, NEW.title, NEW.content, NEW.category, NEW.tags);
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS learnings_ad AFTER DELETE ON learnings BEGIN
      INSERT INTO learnings_fts(learnings_fts, rowid, title, content, category, tags)
      VALUES ('delete', OLD.rowid, OLD.title, OLD.content, OLD.category, OLD.tags);
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS learnings_au AFTER UPDATE ON learnings BEGIN
      INSERT INTO learnings_fts(learnings_fts, rowid, title, content, category, tags)
      VALUES ('delete', OLD.rowid, OLD.title, OLD.content, OLD.category, OLD.tags);
      INSERT INTO learnings_fts(rowid, title, content, category, tags)
      VALUES (NEW.rowid, NEW.title, NEW.content, NEW.category, NEW.tags);
    END
  `);

  // Create index on category for filtering
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_learnings_category ON learnings(category)
  `);

  return db;
}

// ============================================================================
// Search Operations
// ============================================================================

/**
 * Search learnings using FTS5 with BM25 ranking
 *
 * @param db - Database instance
 * @param query - Search query (supports FTS5 syntax: AND, OR, NOT, "phrase", prefix*)
 * @param options - Search options
 * @returns Array of search results sorted by relevance
 */
export function searchLearnings(
  db: Database,
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const { limit = 10, category, tags, minScore } = options;

  // Build the SQL query with optional filters
  let sql = `
    SELECT
      l.id,
      l.title,
      snippet(learnings_fts, 1, '<mark>', '</mark>', '...', 64) as snippet,
      l.category,
      l.tags,
      l.source_path,
      l.created_at,
      bm25(learnings_fts, 1.0, 2.0, 0.5, 0.5) as score
    FROM learnings_fts
    JOIN learnings l ON learnings_fts.rowid = l.rowid
    WHERE learnings_fts MATCH ?
  `;

  const params: (string | number)[] = [query];

  if (category) {
    sql += ` AND l.category = ?`;
    params.push(category);
  }

  if (tags && tags.length > 0) {
    // Match any of the provided tags
    const tagConditions = tags.map(() => `l.tags LIKE ?`).join(' OR ');
    sql += ` AND (${tagConditions})`;
    params.push(...tags.map(tag => `%${tag}%`));
  }

  sql += ` ORDER BY score`;

  if (limit > 0) {
    sql += ` LIMIT ?`;
    params.push(limit);
  }

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params) as {
    id: string;
    title: string;
    snippet: string;
    category: string;
    tags: string;
    source_path: string | null;
    created_at: string;
    score: number;
  }[];

  return rows
    .filter(row => minScore === undefined || row.score <= minScore)
    .map(row => ({
      id: row.id,
      title: row.title,
      snippet: row.snippet,
      category: row.category,
      tags: JSON.parse(row.tags),
      sourcePath: row.source_path,
      score: row.score,
      createdAt: row.created_at,
    }));
}

/**
 * Search with simple keyword matching (auto-converts to FTS5 query)
 *
 * @param db - Database instance
 * @param keywords - Space-separated keywords
 * @param options - Search options
 * @returns Array of search results
 */
export function searchByKeywords(
  db: Database,
  keywords: string,
  options: SearchOptions = {}
): SearchResult[] {
  // Convert space-separated keywords to OR query for broader matching
  const terms = keywords
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0)
    .map(term => `"${term}"*`)
    .join(' OR ');

  if (!terms) {
    return [];
  }

  return searchLearnings(db, terms, options);
}

// ============================================================================
// Index Operations
// ============================================================================

/**
 * Generate a unique ID for a learning document
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Index a learning document
 *
 * @param db - Database instance
 * @param doc - Learning document to index
 * @returns The document ID
 */
export function indexLearning(db: Database, doc: LearningDocument): string {
  const id = doc.id || generateId();
  const createdAt = doc.createdAt || new Date().toISOString();
  const tags = JSON.stringify(doc.tags);

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO learnings (id, title, content, category, tags, source_path, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, doc.title, doc.content, doc.category, tags, doc.sourcePath || null, createdAt);

  return id;
}

/**
 * Index multiple learning documents in a transaction
 *
 * @param db - Database instance
 * @param docs - Array of learning documents
 * @returns Array of document IDs
 */
export function indexLearnings(db: Database, docs: LearningDocument[]): string[] {
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO learnings (id, title, content, category, tags, source_path, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const ids: string[] = [];

  const transaction = db.transaction(() => {
    for (const doc of docs) {
      const id = doc.id || generateId();
      const createdAt = doc.createdAt || new Date().toISOString();
      const tags = JSON.stringify(doc.tags);

      insertStmt.run(id, doc.title, doc.content, doc.category, tags, doc.sourcePath || null, createdAt);
      ids.push(id);
    }
  });

  transaction();

  return ids;
}

// ============================================================================
// Delete Operations
// ============================================================================

/**
 * Delete a learning by ID
 *
 * @param db - Database instance
 * @param id - Document ID to delete
 * @returns true if deleted, false if not found
 */
export function deleteLearning(db: Database, id: string): boolean {
  const stmt = db.prepare(`DELETE FROM learnings WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Delete learnings by source path
 *
 * @param db - Database instance
 * @param sourcePath - Source file path
 * @returns Number of deleted documents
 */
export function deleteLearningsBySource(db: Database, sourcePath: string): number {
  const stmt = db.prepare(`DELETE FROM learnings WHERE source_path = ?`);
  const result = stmt.run(sourcePath);
  return result.changes;
}

/**
 * Delete all learnings in a category
 *
 * @param db - Database instance
 * @param category - Category to delete
 * @returns Number of deleted documents
 */
export function deleteLearningsByCategory(
  db: Database,
  category: 'SYSTEM' | 'ALGORITHM'
): number {
  const stmt = db.prepare(`DELETE FROM learnings WHERE category = ?`);
  const result = stmt.run(category);
  return result.changes;
}

// ============================================================================
// Utility Operations
// ============================================================================

/**
 * Get a learning by ID
 *
 * @param db - Database instance
 * @param id - Document ID
 * @returns Learning document or null if not found
 */
export function getLearningById(
  db: Database,
  id: string
): (LearningDocument & { createdAt: string }) | null {
  const stmt = db.prepare(`
    SELECT id, title, content, category, tags, source_path, created_at
    FROM learnings WHERE id = ?
  `);

  const row = stmt.get(id) as {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string;
    source_path: string | null;
    created_at: string;
  } | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category as 'SYSTEM' | 'ALGORITHM',
    tags: JSON.parse(row.tags),
    sourcePath: row.source_path || undefined,
    createdAt: row.created_at,
  };
}

/**
 * Get the total count of indexed learnings
 *
 * @param db - Database instance
 * @param category - Optional category filter
 * @returns Count of learnings
 */
export function getLearningsCount(db: Database, category?: 'SYSTEM' | 'ALGORITHM'): number {
  let sql = `SELECT COUNT(*) as count FROM learnings`;
  const params: string[] = [];

  if (category) {
    sql += ` WHERE category = ?`;
    params.push(category);
  }

  const stmt = db.prepare(sql);
  const row = stmt.get(...params) as { count: number };
  return row.count;
}

/**
 * Rebuild the FTS index (useful after bulk operations or corruption)
 *
 * @param db - Database instance
 */
export function rebuildIndex(db: Database): void {
  db.exec(`INSERT INTO learnings_fts(learnings_fts) VALUES('rebuild')`);
}

/**
 * Optimize the FTS index (merge b-tree segments)
 *
 * @param db - Database instance
 */
export function optimizeIndex(db: Database): void {
  db.exec(`INSERT INTO learnings_fts(learnings_fts) VALUES('optimize')`);
}

/**
 * Close the database connection
 *
 * @param db - Database instance
 */
export function closeDatabase(db: Database): void {
  db.close();
}
