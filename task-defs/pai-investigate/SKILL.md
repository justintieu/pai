---
name: pai-investigate
description: Investigate GitHub repositories to extract patterns, understand structure, and capture learnings. Search and discover repos by topic. USE WHEN investigate repo, analyze github, understand codebase from URL, learn from repo, github investigation, explore repository, search github, find repos, discover repositories, similar repos.
tools: Read, Write, Bash, Glob
---

# PAI Investigate

Investigate GitHub repositories via URL to extract patterns, understand structure, and capture learnings.

## Philosophy

**API-First Investigation**

Instead of cloning entire repositories:
1. **Check** rate limit budget
2. **Fetch** metadata, README, tree via API
3. **Analyze** structure and identify entry points
4. **Save** full report + extract learnings
5. **Summarize** key findings inline

**Result:** Understand repos in <30 seconds without cloning.

## Quick Start

### Investigate a repository
```
/investigate https://github.com/anthropics/anthropic-cookbook
```

### Check rate limit before batch investigation
```
/investigate --check-rate-limit
```

## Workflows

| Workflow | Use When | Output |
|----------|----------|--------|
| **Quick Scan** | Default - fast overview | Metadata + README + structure |
| **Deep Dive** | Need more detail | Full tree + dependency analysis |
| **Search** | Discover repos by topic/concept | Numbered results |
| **Suggestions** | After investigation | 3 related repos |
| **Queue** | Save for later | Persistent list |

### Pattern Extraction

After investigation completes, patterns are automatically extracted and categorized:

**Auto-Applied (no confirmation needed):**
- Pattern notes saved to `~/.pai/memory/patterns/approved/`
- Tags extracted from repository metadata
- Learnings persisted to memory

**Requires Review:**
- New skill proposals (high-relevance workflow patterns)
- Rule modification proposals
- Proposals saved to `~/.pai/memory/patterns/pending/` for later review

**Inline Summary:**
After pattern extraction, a summary is shown:
`Auto-applied: 3 patterns | Pending review: 1 skill proposal`

**Pattern Categories:**
- **Architectural** - System structure, component organization
- **Code** - Implementation patterns, idioms, techniques
- **Workflow** - Process patterns, task orchestration
- **Integration** - API usage, service communication

**Relevance Assessment:**
- **High** - Directly applicable to PAI (agent, context, memory, skill patterns)
- **Medium** - General programming patterns worth learning
- **Low** - Not relevant (skipped from indexing)

## Output

### Report Location
`~/.pai/output/investigations/{owner}_{repo}_{date}.yaml`

### Learnings Location
`~/.pai/memory/learning/ALGORITHM/{year-month}/{date}_investigation_{repo}.md`

### Extracted Patterns Location
`~/.pai/memory/patterns/approved/{pattern_id}.md`

### Pending Proposals Location
`~/.pai/memory/patterns/pending/{proposal_type}_{id}.md`

### Semantic Index Location
`~/.pai/memory/patterns/indexes/{owner}_{repo}.json`

### Inline Summary
Key findings returned in conversation:
- Repository overview (language, stars, purpose)
- Structure insights (entry points, key directories)
- Notable patterns
- Potential learnings
- Integration ideas (if PAI-relevant)
- Pattern extraction summary (auto-applied vs pending review)

## Rate Limiting

**Before each investigation:**
- Remaining budget is checked
- If <50 calls remaining, investigation is blocked
- Reset time is shown when blocked

**Per investigation:**
- Quick scan: ~4 API calls
- Deep dive: ~10 API calls

## Instructions

### For Single Repo Investigation

1. Provide GitHub URL (any format accepted)
2. Investigation runs automatically
3. Report saved, learnings extracted
4. Summary returned inline

### For Batch Investigation

1. Check rate limit first: `/investigate --check-rate-limit`
2. If sufficient, investigate repos one at a time
3. Each investigation updates rate limit info

### For Understanding Results

**Report sections:**
- `investigation`: When and how investigated
- `metadata`: Basic repo info (stars, language, topics)
- `structure`: Entry points and key directories
- `dependencies`: Runtime and dev dependencies (if detected)
- `insights`: Patterns, notable items, potential learnings
- `rate_limit`: API usage for this investigation

**Learnings:**
- Auto-extracted from insights.potential_learnings
- Saved with source reference (repo URL + report path)
- Tagged with language and topics
- Available for pattern detection in self-improvement pipeline

## Examples

**Example 1: Quick investigation**
```
User: investigate https://github.com/anthropics/anthropic-cookbook

Claude: Investigating anthropics/anthropic-cookbook...

**anthropics/anthropic-cookbook** (Jupyter Notebook | 2.4k stars)
> A collection of notebooks/recipes showcasing usage of the Anthropic API

**Entry points:**
- Main: `misc/prompt_caching/`
- Docs: `README.md`

**Structure:** misc/, skills/

**Patterns:**
- Process-Save-Summarize

**Worth exploring:**
- Prompt caching patterns
- Multi-turn conversation handling
- Monorepo or multi-package architecture

*Full report: ~/.pai/output/investigations/anthropics_anthropic-cookbook_2026-01-29.yaml*

Rate limit: 4991 remaining (resets in 58 minutes)
Learnings saved: 2 items to ~/.pai/memory/learning/ALGORITHM/2026-01/
```

**Example 2: Rate limited**
```
User: investigate https://github.com/some/repo

Claude: **Rate limit too low**

Cannot proceed with investigation.
- Remaining: 23 calls
- Minimum required: 50 calls
- Resets at: 15:30:00

Try again after rate limit resets, or use `/investigate --check-rate-limit` to monitor.
```

**Example 3: Check rate limit**
```
User: /investigate --check-rate-limit

Claude: **GitHub API Rate Limit**

- Remaining: 4823 / 5000
- Resets in: 42 minutes
- Budget per repo: ~480 investigations possible

Safe to proceed with investigations.
```

**Example 4: Repository not found**
```
User: investigate https://github.com/nonexistent/repo

Claude: **Investigation failed**

Repository not found or not accessible: nonexistent/repo

Possible reasons:
- Repository doesn't exist
- Repository is private
- URL is malformed

Check the URL and try again.
```

## Integration

### With Self-Improvement Pipeline
Learnings extracted from investigations flow into the self-improvement pipeline:
- Pattern detection (3+ similar = pattern)
- Rule compilation
- Knowledge accumulation

### With PAI Memory
Investigation reports and learnings are persisted:
- Reports: `~/.pai/output/investigations/`
- Learnings: `~/.pai/memory/learning/ALGORITHM/`

## Discovery

Search for repositories and get contextual suggestions.

### Search for Repositories

Search GitHub for repos by topic, concept, or keywords:

```
search repos "TypeScript agent frameworks"
search repos "vector database" --limit 10
search repos "ai tools" --language python
```

**Results format:**
```
1. **anthropics/anthropic-cookbook** (Python | 2.4k stars)
   A collection of notebooks showcasing Anthropic API usage

2. **langchain-ai/langchain** (Python | 89.2k stars)
   Building applications with LLMs through composability
```

**Quality gates applied:**
- Minimum 50 stars
- Updated within past year
- Has README

**Act on results:**
- "investigate #3" - Investigate third result immediately
- "save #1 #4 to queue" - Add to investigation queue for later

### Contextual Suggestions

After investigating a repo, get suggestions for similar repositories:

```
what else is similar?
suggest related repos
```

**Suggestions based on:**
- Repository topics (primary signal)
- Language and key dependencies
- Pattern similarities

**Output format:**
```
**Related repositories:**

1. **owner/repo** (TypeScript | 1.2k stars)
   _Similar: shares topics ai, agents, llm_
   Description here
```

### Investigation Queue

Save repos for later investigation:

```
save #2 to queue
queue https://github.com/owner/repo
```

**View queue:**
```
show investigation queue
how many repos in queue?
```

**Queue location:** `~/.pai/memory/investigation-queue.md`

**After investigation:**
After completing an investigation, Claude reminds about remaining search results:
"Back to results: #1, #4, #5 still available"

## Semantic Search

After investigation, patterns can be searched semantically:

**Single Repository:**
```
Find patterns about error handling in anthropics/anthropic-cookbook
```

**Cross-Repository (PAI Memory):**
```
Search all investigated repos for context management patterns
```

**Requirements:**
- Ollama must be running for semantic search
- Falls back to keyword search if Ollama unavailable
- Indexes stored in `~/.pai/memory/patterns/indexes/`

**Progressive Indexing:**
- High-relevance patterns indexed first (always)
- Medium-relevance patterns indexed if <10 high-relevance patterns
- Low-relevance patterns skipped (not valuable for search)

**Search Functions:**
- `queryPatterns(repo, query)` - Search single repository
- `queryAllPatterns(query)` - Search across all indexed repos

## Limitations

- **Public repos only** - Private repos require additional auth setup (out of scope)
- **API-first** - Deep file inspection requires clone (future enhancement)
- **Rate limited** - 5000 calls/hour, ~1250 investigations/hour max
- **Large repos** - Trees >100k files may be truncated
- **Semantic search** - Requires Ollama for embeddings (keyword fallback available)

## URL Formats Supported

All these formats are accepted:
- `https://github.com/owner/repo`
- `https://github.com/owner/repo.git`
- `git@github.com:owner/repo.git`
- `https://github.com/owner/repo/` (trailing slash)
- `https://github.com/owner/repo/tree/main/src` (extracts owner/repo only)

## Context Required

When invoking this skill, Claude loads:
- `@core/task-defs/pai-investigate/lib/` - Core investigation modules
- `@core/task-defs/pai-investigate/lib/patterns/` - Pattern extraction modules
- `@core/task-defs/pai-investigate/lib/semantic/` - Semantic search modules
- `@core/task-defs/pai-investigate/lib/discovery/` - Discovery modules

## Resources

**Core Investigation:**
- [lib/rate-limit.ts](lib/rate-limit.ts) - Rate limit checking
- [lib/url-parser.ts](lib/url-parser.ts) - GitHub URL parsing
- [lib/api-client.ts](lib/api-client.ts) - GitHub API operations
- [lib/report.ts](lib/report.ts) - Report generation and persistence
- [lib/entry-points.ts](lib/entry-points.ts) - Entry point detection
- [lib/dependencies.ts](lib/dependencies.ts) - Dependency parsing
- [lib/learnings.ts](lib/learnings.ts) - Learning extraction
- [lib/investigate.ts](lib/investigate.ts) - Core orchestration
- [lib/index.ts](lib/index.ts) - Barrel exports

**Pattern Extraction:**
- [lib/patterns/types.ts](lib/patterns/types.ts) - Pattern type definitions
- [lib/patterns/storage.ts](lib/patterns/storage.ts) - Pattern persistence
- [lib/patterns/extractor.ts](lib/patterns/extractor.ts) - Pattern extraction
- [lib/patterns/integration.ts](lib/patterns/integration.ts) - Auto-apply logic
- [lib/patterns/proposals.ts](lib/patterns/proposals.ts) - Skill/rule proposals

**Semantic Search:**
- [lib/semantic/embeddings.ts](lib/semantic/embeddings.ts) - Ollama embedding generation
- [lib/semantic/index.ts](lib/semantic/index.ts) - Orama vector DB management
- [lib/semantic/search.ts](lib/semantic/search.ts) - Hybrid semantic/keyword search
- [lib/semantic/indexer.ts](lib/semantic/indexer.ts) - Pattern indexing with persistence
