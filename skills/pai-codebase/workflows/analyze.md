# Analyze Workflow

Analyze a codebase to find what needs to change for a feature or bug fix.

## When to Use

- Starting a new feature
- Fixing a bug
- Need to understand impact of a change
- Looking for missing abstractions or duplication

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task` | Yes | Description of feature/bug (e.g., "add rate limiting", "bug: auth token expiry") |
| `scope` | No | Use existing indexed scope (default: most recent or "root") |
| `cross-scope` | No | Analyze across all indexed scopes |

## Process

### 1. Load Existing Index

Read the index for the specified scope:
- `index/architecture.md` - Understand structure
- `index/entry-points.md` - Know where things start
- `index/conventions.md` - Follow existing patterns

If no index exists, run index workflow first.

### 2. Spawn Analyze Agent

Use the Task tool to spawn a sub-agent:

```
Task(
  subagent_type: "Explore",
  prompt: """
  You are a codebase analyst. Given a task description, identify what needs to change.

  Task: {task}
  Scope: {scope}
  Index location: {output_dir}/index/

  First, read the existing index to understand the codebase.
  Then analyze what needs to change for this task.

  Create these files:

  1. **{task-slug}-changes.md** - Files to modify
     For each file:
     - Path and line numbers
     - What change is needed
     - Why this file is affected
     - Confidence level (high/medium/low)

  2. **{task-slug}-gaps.md** - Missing abstractions
     - Utilities that should exist but don't
     - Patterns that could be extracted
     - Suggested new files/modules

  3. **{task-slug}-dupes.md** - Duplication opportunities
     - Similar code that could be consolidated
     - Copy-paste patterns found
     - Suggested shared utilities

  Save files to: {output_dir}/analysis/
  Return a brief summary of findings.
  """
)
```

### 3. Identify Change Locations

The agent should find:

**Direct Changes:**
- Files that must be modified
- Specific functions/classes affected
- Configuration changes needed

**Indirect Changes:**
- Tests that need updating
- Documentation to update
- Types/interfaces to extend

**New Files:**
- New modules to create
- New tests to write
- New config entries

### 4. Pattern Matching

Compare task against existing patterns:
- How similar features were implemented
- Conventions to follow
- Anti-patterns to avoid

### 5. Gap Analysis

Identify missing abstractions:
- "This logic appears in 3 places, should be a utility"
- "No error handling pattern exists for this case"
- "Missing type definitions for this domain"

### 6. Return Summary

```markdown
## Analysis: {task}

**Saved to:** `~/.pai/output/codebase/{project}/{scope}/analysis/`

### Changes Needed

| File | Change | Confidence |
|------|--------|------------|
| `src/middleware/rate-limit.ts` | Create new file | High |
| `src/index.ts:23` | Register middleware | High |
| `src/config/index.ts` | Add rate limit config | High |

### Patterns to Follow
- Middleware pattern: see `src/middleware/auth.ts`
- Config pattern: see `src/config/database.ts`

### Gaps Found
- No shared rate limiting utility (consider creating)

### Duplication Alert
- Retry logic in 2 places - consolidate to shared util

**Full details:** `analysis/{task-slug}-changes.md`
```

## Cross-Scope Analysis

When `--cross-scope` is specified:

```
Task(
  subagent_type: "Explore",
  prompt: """
  Analyze across all indexed scopes for: {task}

  Scopes available: {list of scopes}

  For each scope, identify:
  1. Relevant files/patterns
  2. Shared code opportunities
  3. Inconsistencies to address

  Save to: {output_dir}/cross-scope/{task-slug}.md
  """
)
```

## Context Efficiency

| Phase | Context Used | Saved |
|-------|-------------|-------|
| Index reading | Sub-agent | ~10,000 chars of index |
| Analysis | Sub-agent | All exploration output |
| Storage | Files | Full analysis |
| Return | ~400 chars | Summary only |

**Total context saved:** ~98% compared to inline analysis
