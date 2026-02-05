# Tiered Context Loading Protocol

Context loads in three tiers based on recency and relevance. This prevents bloating the context window with rarely-needed information.

## Tier Definitions

### Hot Tier (Always Loaded)
**What:** Current conversation, active task context
**When:** Automatically present
**Size:** Variable based on conversation length

Contents:
- User messages in current session
- AI responses in current session
- Currently open file contents (if any)
- Task context (if executing a skill)

### Warm Tier (Load on Demand)
**What:** Recent files, prior decisions, relevant context
**When:** Load when task references them
**Size:** ~10-20% of context budget

Contents:
- Files read in last 3-5 turns (cached)
- Recent decisions from memory/decisions/
- Active workspace context (if applicable)
- Prior plan SUMMARYs (if in GSD workflow)

**Loading trigger:** When task mentions prior work or needs recent context

### Cold Tier (Search, Don't Load)
**What:** Historical data, archived learnings, old projects
**When:** Search via grep/glob, load only excerpts
**Size:** Never bulk-loaded

Contents:
- Archived work status
- Old learnings (compile to rules, don't load raw)
- Completed project contexts
- Historical decisions

**Access pattern:** Search → find → load only relevant excerpt

## Loading Decision Matrix

| Need | Action |
|------|--------|
| Current conversation context | Already in Hot |
| File read in last 5 turns | Check Warm cache first |
| Decision from this session | Load from Warm |
| Historical pattern | Search Cold, load excerpt only |
| Full project history | Delegate to subagent (fresh context) |

## Anti-Patterns

**DON'T:**
- Load entire memory/ at session start
- Read all learnings files upfront
- Bulk-load historical decisions
- Keep old file contents after task completes

**DO:**
- Start with index.md (triggers only)
- Load full content on-demand
- Summarize and drop file contents after use
- Archive to Cold when no longer active
