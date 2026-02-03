# Vector Embeddings for Semantic Recall

**Source**: Continuous-Claude-v3 research
**Date**: 2026-01-28

## Insight

Instead of loading all previous context, use vector embeddings to retrieve semantically relevant pieces on-demand:

```sql
-- Find similar previous work
SELECT goal, approach, outcome
FROM handoffs
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

## Implementation Options

**Continuous-Claude uses:**
- PostgreSQL + pgvector for embeddings
- HNSW indexing for similarity lookup
- SQLite FTS5 for BM25-ranked text search

**Lighter alternatives:**
- SQLite with FTS5 only (no embeddings)
- JSON files with keyword matching
- Local embedding model (Ollama) + simple vector store

## Benefits

- Load only relevant context, not everything
- Scales to large memory stores
- Enables "recall similar work" patterns

## Applicability

Start simple:
1. SQLite FTS5 for learnings/handoffs (no embeddings needed)
2. Add embeddings later if FTS5 insufficient

## Tags

memory-retrieval, embeddings, context-loading
