# Agent Patterns Reference

Sub-agent patterns used by the pai-codebase skill. Each agent follows the **Process -> Save -> Summarize** pattern for context efficiency.

## Overview

| Agent | Purpose | Output | Context Savings |
|-------|---------|--------|-----------------|
| Index Agent | Analyze codebase structure | architecture.md, entry-points.md, dependencies.md, conventions.md | ~95% |
| Analyze Agent | Find what needs to change | changes.md, gaps.md, dupes.md | ~98% |
| Plan Agent | Order implementation steps | plan.md with ordered steps | ~90% |
| Test Agent | Run tests efficiently | Full test log | ~98% |

---

## Index Agent

**Purpose:** Analyze codebase structure, patterns, and conventions to create a comprehensive index.

**Subagent Type:** `Explore`

**When to Use:**
- Starting work on a new project
- First time working with a codebase
- Need to understand architecture before making changes
- Codebase has changed significantly since last index

### Input

| Parameter | Type | Description |
|-----------|------|-------------|
| `paths` | string[] | Directories to scan (default: current directory) |
| `output_dir` | string | Where to save index files |
| `incremental` | boolean | Only re-index changed files |

### Prompt Template

```
You are a codebase indexer. Analyze the provided directories and create a comprehensive index.

Directories to analyze: {paths}
Output directory: {output_dir}/index/

Create these files:

1. **architecture.md** - High-level structure
   - Overall pattern (MVC, feature-based, domain-driven, etc.)
   - Layer organization
   - Key abstractions and relationships
   - Data flow patterns

2. **entry-points.md** - Key files
   - Main entry file(s) and what they do
   - Key exported functions/classes
   - Public API surface
   - Configuration loading

3. **dependencies.md** - Dependencies
   - External packages and their purpose
   - Internal module dependencies
   - Circular dependency warnings
   - Shared utilities

4. **conventions.md** - Coding conventions
   - File naming patterns
   - Directory structure rules
   - Code style patterns
   - Testing patterns

Save each file to the output directory.
Return a brief summary (5-10 lines) of what you found.
```

### Output Format

**Files Created:**
- `index/architecture.md` - High-level structure and patterns
- `index/entry-points.md` - Key files and main functions
- `index/dependencies.md` - Internal and external dependencies
- `index/conventions.md` - Naming and structure rules

**Return Summary:**
```markdown
## Indexed: {scope}

**Saved to:** `~/.pai/output/codebase/{project}/{scope}/`

### Summary
- **Type:** [framework/language]
- **Structure:** [pattern], [file count] files
- **Key entry:** [main file] -> [flow]
- **Dependencies:** [key deps]
- **Conventions:** [key conventions]
```

### Context Savings Estimate

| Phase | Traditional | With Agent | Savings |
|-------|------------|------------|---------|
| File analysis | 50,000+ chars | 0 (in sub-agent) | 100% |
| Index storage | Kept in context | Saved to files | 100% |
| Returned | Full analysis | ~500 char summary | 99% |

**Total: ~95% context reduction**

---

## Analyze Agent

**Purpose:** Find what needs to change for a specific task (feature or bug fix).

**Subagent Type:** `Explore`

**When to Use:**
- Starting a new feature
- Fixing a bug
- Need to understand impact of a change
- Looking for missing abstractions or duplication

### Input

| Parameter | Type | Description |
|-----------|------|-------------|
| `task` | string | Description of feature/bug |
| `scope` | string | Existing indexed scope to use |
| `index_location` | string | Path to index files |
| `output_dir` | string | Where to save analysis |

### Prompt Template

```
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
```

### Output Format

**Files Created:**
- `analysis/{task-slug}-changes.md` - Files that need modification
- `analysis/{task-slug}-gaps.md` - Missing abstractions identified
- `analysis/{task-slug}-dupes.md` - Consolidation opportunities

**Return Summary:**
```markdown
## Analysis: {task}

**Saved to:** `~/.pai/output/codebase/{project}/{scope}/analysis/`

### Changes Needed

| File | Change | Confidence |
|------|--------|------------|
| `src/middleware/rate-limit.ts` | Create new file | High |
| `src/index.ts:23` | Register middleware | High |

### Patterns to Follow
- [Relevant existing patterns to reference]

### Gaps Found
- [Missing abstractions]

### Duplication Alert
- [Consolidation opportunities]
```

### Context Savings Estimate

| Phase | Traditional | With Agent | Savings |
|-------|------------|------------|---------|
| Index reading | 10,000+ chars | 0 (in sub-agent) | 100% |
| Code exploration | 20,000+ chars | 0 (in sub-agent) | 100% |
| Analysis storage | Kept in context | Saved to files | 100% |
| Returned | Full analysis | ~400 char summary | 98% |

**Total: ~98% context reduction**

---

## Plan Agent

**Purpose:** Order implementation steps based on analysis results.

**Subagent Type:** General-purpose

**When to Use:**
- Ready to implement after analysis
- Complex change with multiple files
- Need clear execution order to avoid conflicts
- Want to track implementation progress

### Input

| Parameter | Type | Description |
|-----------|------|-------------|
| `task` | string | Task being implemented |
| `analysis_dir` | string | Path to analysis files |
| `output_dir` | string | Where to save plan |

### Prompt Template

```
You are an implementation planner. Create an ordered execution plan based on the analysis.

Task: {task}
Analysis files: {analysis_dir}/
- {task-slug}-changes.md
- {task-slug}-gaps.md
- {task-slug}-dupes.md

Create an implementation plan with:

1. **Dependency Order** - Which changes must come first
   - Type definitions before implementations
   - Shared utilities before consumers
   - Config before usage

2. **Atomic Steps** - Each step should be:
   - Independently testable
   - Small enough to verify
   - Clear success criteria

3. **Risk Assessment** - Flag high-risk changes
   - Breaking changes
   - Data migrations
   - External dependencies

Save to: {output_dir}/plans/{task-slug}-plan.md

Format:
## Implementation Plan: {task}

### Prerequisites
- [ ] Prerequisite 1
- [ ] Prerequisite 2

### Steps
1. [ ] **Step title** - Brief description
   - File(s): `path/to/file.ts`
   - What: Specific changes
   - Test: How to verify

2. [ ] **Step title** - Brief description
   ...

### Post-Implementation
- [ ] Run full test suite
- [ ] Update documentation
- [ ] Code review

Return a numbered checklist summary.
```

### Output Format

**Files Created:**
- `plans/{task-slug}-plan.md` - Full implementation plan with ordered steps

**Return Summary:**
```markdown
## Plan: {task}

**Saved to:** `~/.pai/output/codebase/{project}/{scope}/plans/`

### Checklist (8 steps)
1. [ ] Create rate limit config schema
2. [ ] Add environment variables
3. [ ] Create rate limiter middleware
4. [ ] Register middleware in main.ts
5. [ ] Add rate limit headers to responses
6. [ ] Write unit tests
7. [ ] Write integration tests
8. [ ] Update API documentation

### High-Risk Steps
- Step 4: Modifies application bootstrap

**Full plan:** `plans/{task-slug}-plan.md`
```

### Context Savings Estimate

| Phase | Traditional | With Agent | Savings |
|-------|------------|------------|---------|
| Analysis reading | 5,000+ chars | 0 (in sub-agent) | 100% |
| Planning logic | 3,000+ chars | 0 (in sub-agent) | 100% |
| Plan storage | Kept in context | Saved to file | 100% |
| Returned | Full plan | ~300 char checklist | 94% |

**Total: ~90% context reduction**

---

## Test Agent

**Purpose:** Run tests efficiently and return actionable summaries.

**Subagent Type:** General-purpose

**When to Use:**
- After implementing changes
- Before committing code
- During CI/CD review
- Debugging test failures

### Input

| Parameter | Type | Description |
|-----------|------|-------------|
| `scope` | string | Scope to test (determines test command) |
| `test_command` | string | Override default test command |
| `filter` | string | Optional test filter pattern |
| `output_dir` | string | Where to save test results |

### Prompt Template

```
You are a test runner. Execute tests and provide actionable results.

Scope: {scope}
Test command: {test_command}
Filter: {filter}
Output directory: {output_dir}/tests/

Execute the test command and capture ALL output.

Save the full output to: {output_dir}/tests/{timestamp}.md

Format the output file:
## Test Run: {timestamp}

**Command:** `{test_command}`
**Duration:** {duration}
**Result:** {passed}/{total} passed

### Output
```
[full test output here]
```

### Failures (if any)
For each failure:
- Test name
- File and line
- Error message
- Relevant stack trace

Return a brief pass/fail summary with failure details.
```

### Output Format

**Files Created:**
- `tests/{timestamp}.md` - Full test output and metadata

**Return Summary:**
```markdown
## Tests: {scope}

**Result:** 45/47 passed

### Failures
1. `auth.test.ts:89` - Token expiry assertion
   - Expected: token to be expired
   - Actual: token still valid

2. `api.test.ts:156` - Missing mock
   - Error: Cannot find mock for /api/rate-limit

**Full output:** `~/.pai/output/codebase/{project}/{scope}/tests/{timestamp}.md`
```

### Context Savings Estimate

| Phase | Traditional | With Agent | Savings |
|-------|------------|------------|---------|
| Test output | 10,000+ chars | 0 (in sub-agent) | 100% |
| Full log storage | Kept in context | Saved to file | 100% |
| Returned | Full output | ~200 char summary | 98% |

**Total: ~98% context reduction**

---

## Cross-Scope Analysis Agent

**Purpose:** Analyze patterns across multiple indexed scopes (for monorepos).

**Subagent Type:** `Explore`

**When to Use:**
- Working in a monorepo with multiple packages
- Looking for shared patterns to extract
- Finding inconsistencies across packages
- Planning cross-cutting changes

### Input

| Parameter | Type | Description |
|-----------|------|-------------|
| `task` | string | Analysis task description |
| `scopes` | string[] | List of scopes to analyze |
| `output_dir` | string | Base output directory |

### Prompt Template

```
You are a cross-scope analyst. Analyze patterns across multiple indexed scopes.

Task: {task}
Scopes to analyze: {scopes}

For each scope, read:
- {scope}/index/architecture.md
- {scope}/index/conventions.md

Identify:
1. **Shared Patterns** - Code that appears in multiple scopes
2. **Inconsistencies** - Different approaches to same problem
3. **Consolidation Opportunities** - What could be shared

Save to: {output_dir}/cross-scope/{task-slug}.md

Format:
## Cross-Scope Analysis: {task}

### Shared Patterns
- [Pattern found in scope1, scope2]

### Inconsistencies
| Pattern | scope1 | scope2 | scope3 |
|---------|--------|--------|--------|
| Error handling | try/catch | Result type | throws |

### Consolidation Opportunities
1. **Error handling** - Create @repo/shared/errors
2. **API client** - Extract to @repo/shared/api-client

Return a summary of findings.
```

### Output Format

**Files Created:**
- `cross-scope/{task-slug}.md` - Cross-scope analysis results

**Return Summary:**
```markdown
## Cross-Scope: {task}

**Analyzed:** api, web, cli scopes

### Key Findings
1. **Error handling** differs across all 3 scopes
2. **API client** duplicated in web and cli
3. **Validation schemas** could be shared

### Recommended Actions
1. Create @repo/shared/errors
2. Extract API client to shared package
3. Move Zod schemas to @repo/shared/schemas

**Full analysis:** `cross-scope/{task-slug}.md`
```

---

## Implementation Notes

### Spawning Sub-Agents

Use the `Task` tool to spawn sub-agents:

```typescript
Task({
  subagent_type: "Explore",  // or general-purpose
  prompt: "...",
  // Sub-agent runs in isolated context
  // Full output stays in sub-agent context
  // Only summary returns to main chat
})
```

### Why Explore for Index/Analyze?

The `Explore` subagent type is optimized for:
- Reading many files
- Pattern recognition
- Comprehensive analysis
- No need for tool calls beyond Read/Glob/Grep

### Why General-Purpose for Plan/Test?

General-purpose subagents can:
- Execute shell commands (test running)
- Perform complex reasoning (planning)
- Handle varied output formats

### Error Handling

If a sub-agent fails:
1. Return error summary to main chat
2. Save partial results if available
3. Suggest retry with different parameters

### Caching Strategy

- Index Agent: Cache file hashes for incremental updates
- Analyze Agent: Reference existing index, don't re-scan
- Plan Agent: Reference existing analysis
- Test Agent: No caching (always run fresh)
