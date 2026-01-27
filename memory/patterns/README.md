# Pattern Index

Tracks detected patterns from learnings for rule compilation.

## How It Works

When a learning is captured, pattern detection checks for similar learnings (same domain + 2+ tag overlap). When 3+ learnings match, a pattern is recorded here.

## Pattern Status

| Status | Meaning |
|--------|---------|
| `pending` | Pattern detected, awaiting review |
| `approved` | User approved, rule was created |
| `rejected` | User rejected, won't re-propose |
| `archived` | Source learnings archived |

## Structure

```json
{
  "patterns": {
    "technical-context-management": {
      "domain": "technical",
      "primaryTags": ["context", "delegation"],
      "learningIds": ["2026-01-22-context-saving", "2026-01-23-delegation-pattern", "..."],
      "detectedAt": "2026-01-27T10:30:00Z",
      "status": "pending"
    }
  },
  "lastUpdated": "2026-01-27T10:30:00Z"
}
```

## Files

- `index.json` - Pattern registry (the source of truth)
- `pending/` - (future) Full pattern proposals awaiting review

## Usage

Run `/pai review-rules` to see pending patterns and approve/reject rule proposals.
