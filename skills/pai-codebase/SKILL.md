---
name: pai-codebase
description: Index and understand codebases for context-efficient development. Analyzes structure, patterns, and dependencies then saves to files for reference. USE WHEN new project, index codebase, understand code, find what to change, analyze gaps, plan implementation.
tools: Read, Write, Bash, Glob, Grep, Task
---

# PAI Codebase

Context-efficient codebase understanding using the **Process → Save → Summarize** pattern.

## Philosophy

Instead of keeping verbose codebase analysis in conversation context:
1. **Index** - Agents analyze codebase in dedicated context
2. **Save** - Full analysis saved to files
3. **Summarize** - Return only actionable summaries to main chat

**Result:** Understand large codebases without exhausting context.

## Workflows

| Workflow | Use When | File |
|----------|----------|------|
| **Index** | New project, need to understand codebase | `workflows/index.md` |
| **Analyze** | Feature/bug - find what needs to change | `workflows/analyze.md` |
| **Plan** | Ready to implement, need execution order | `workflows/plan.md` |
| **Test** | Run tests, get context-efficient results | `workflows/test.md` |

## Quick Start

### Index a codebase (or subset)
```
/codebase index                          # Index current directory
/codebase index ./packages/api           # Index specific package
/codebase index ./src/auth ./src/users   # Index multiple directories
```
Creates comprehensive index at `~/.pai/output/codebase/{project}/{scope}/`

### Analyze for a task
```
/codebase analyze "add user authentication"
/codebase analyze "add rate limiting" --scope api   # Use existing scope
```
Finds files to change, missing abstractions, duplication opportunities.

### Plan implementation
```
/codebase plan
```
Generates ordered execution plan based on analysis.

### Run tests
```
/codebase test                           # Run all tests
/codebase test --scope api               # Run tests for specific scope
```
Runs tests, saves full output, returns pass/fail summary.

## Output Structure

```
~/.pai/output/codebase/{project}/
├── scopes.json                  # Tracks all indexed scopes
├── root/                        # Full repo index (if indexed)
│   └── index/
├── {scope-name}/                # Named scope (e.g., "api", "web", "auth")
│   ├── index/
│   │   ├── architecture.md      # High-level structure & patterns
│   │   ├── entry-points.md      # Key files, main functions
│   │   ├── dependencies.md      # Internal & external deps
│   │   └── conventions.md       # Naming, structure rules
│   ├── analysis/
│   │   ├── {task}-changes.md    # Files to modify for task
│   │   ├── {task}-gaps.md       # Missing abstractions
│   │   └── {task}-dupes.md      # Consolidation opportunities
│   ├── plans/
│   │   └── {task}-plan.md       # Implementation order
│   ├── tests/
│   │   └── {timestamp}.md       # Test run results
│   └── cache/
│       └── file-hashes.json     # For incremental updates
└── cross-scope/                 # Cross-cutting analysis
    └── shared-patterns.md       # Patterns found across scopes
```

### Scope Naming

| Input | Scope Name |
|-------|------------|
| `.` or no path | `root` |
| `./packages/api` | `api` |
| `./src/auth` | `auth` |
| `./services/user-service` | `user-service` |
| Multiple paths | Combined: `auth-users` |

## Monorepo Support

For monorepos, index only what you need:

```
my-monorepo/
├── packages/
│   ├── api/          # Backend API
│   ├── web/          # Frontend app
│   ├── shared/       # Shared utilities
│   └── cli/          # CLI tool
├── services/
│   ├── auth/         # Auth microservice
│   └── billing/      # Billing microservice
└── package.json
```

### Index specific packages
```
/codebase index ./packages/api           # Just the API
/codebase index ./packages/web           # Just the frontend
```

### Index related packages together
```
/codebase index ./packages/api ./packages/shared   # API + its deps
```

### Cross-scope analysis
When you have multiple scopes indexed, the skill can identify:
- Shared patterns across packages
- Inconsistencies in conventions
- Opportunities for shared utilities

```
/codebase analyze "add logging" --cross-scope
```

## Integration with Workspaces

When creating a workspace for a code project:

```bash
# Create workspace
pai workspace create my-api -d "REST API for user management"

# Index the relevant part of codebase
/codebase index ./packages/api ./packages/shared
```

The index is saved to `~/.pai/output/codebase/{project}/` and linked from the workspace.

## Instructions

### For New Projects

1. Navigate to project directory
2. Run `/codebase index` to create initial index
3. Index is cached - only re-analyzes changed files on subsequent runs

### For Feature Development

1. Run `/codebase analyze "description of feature"`
2. Review returned summary of what needs to change
3. Run `/codebase plan` to get implementation order
4. Implement changes
5. Run `/codebase test` to verify

### For Bug Fixes

1. Run `/codebase analyze "bug: description of issue"`
2. Agent traces code paths, identifies root cause
3. Review suggested fix locations
4. Implement fix
5. Run `/codebase test`

## Context Savings

| Operation | Traditional | With pai-codebase | Savings |
|-----------|------------|-------------------|---------|
| Understand codebase | 50,000+ chars | 800 chars | 98% |
| Find files to change | 20,000+ chars | 400 chars | 98% |
| Test results | 10,000+ chars | 200 chars | 98% |

## Examples

**Example 1: Index a new project**
```
User: I just cloned a new project, help me understand it
Claude: I'll index this codebase for you.

[Runs index workflow with sub-agent]

Codebase indexed! Saved to ~/.pai/output/codebase/my-project/root/

Summary:
- **Type:** Express.js API with TypeScript
- **Structure:** MVC pattern, 47 files
- **Key entry:** src/index.ts → routes/ → controllers/
- **Dependencies:** prisma, zod, jwt
- **Conventions:** kebab-case files, PascalCase classes

Full details: ~/.pai/output/codebase/my-project/root/index/
```

**Example 2: Index a monorepo package**
```
User: I need to work on the API in this monorepo
Claude: I'll index just the API package.

[Runs: /codebase index ./packages/api]

Indexed scope "api"! Saved to ~/.pai/output/codebase/my-monorepo/api/

Summary:
- **Type:** NestJS API with TypeScript
- **Structure:** Module-based, 23 files
- **Key entry:** src/main.ts → app.module.ts → feature modules
- **Internal deps:** Uses @repo/shared for utils
- **Conventions:** Feature modules, DTOs with class-validator

Note: References @repo/shared - consider indexing with:
  /codebase index ./packages/api ./packages/shared
```

**Example 3: Analyze for a feature (scoped)**
```
User: I need to add rate limiting to the API
Claude: Analyzing api scope for rate limiting implementation...

[Runs analyze workflow with sub-agent]

Analysis complete! Saved to ~/.pai/output/codebase/my-monorepo/api/analysis/

**Changes needed:**
1. `packages/api/src/middleware/` - Create rate-limiter.ts (new file)
2. `packages/api/src/main.ts:23` - Register middleware
3. `packages/api/src/config/index.ts` - Add rate limit config

**Existing patterns to follow:**
- Middleware pattern in `src/middleware/auth.ts`
- Config pattern in `src/config/`

**Potential duplication:**
- Similar retry logic in `@repo/shared/utils/retry.ts` - consider extending

Full analysis: ~/.pai/output/codebase/my-monorepo/api/analysis/rate-limiting-changes.md
```

**Example 4: Run tests with summary**
```
User: run the api tests
Claude: Running tests for api scope...

[Runs test workflow with sub-agent]

**Results:** 45/47 passed

**Failures:**
1. `auth.test.ts:89` - Token expiry assertion
2. `api.test.ts:156` - Missing mock for new endpoint

Full output: ~/.pai/output/codebase/my-monorepo/api/tests/2026-01-22-143022.md
```

**Example 5: Cross-scope analysis**
```
User: Are there shared patterns we could extract across packages?
Claude: Analyzing across all indexed scopes...

[Runs cross-scope analysis]

**Found 3 consolidation opportunities:**

1. **Error handling** - Similar try/catch patterns in api, web, cli
   → Suggest: Create @repo/shared/errors

2. **API client** - Duplicate fetch wrappers in web, cli
   → Suggest: Create @repo/shared/api-client

3. **Validation** - Zod schemas duplicated between api, web
   → Suggest: Move to @repo/shared/schemas

Full analysis: ~/.pai/output/codebase/my-monorepo/cross-scope/shared-patterns.md
```

## Resources

- [Index workflow](workflows/index.md) - Full indexing process
- [Analyze workflow](workflows/analyze.md) - Change analysis process
- [Plan workflow](workflows/plan.md) - Implementation planning
- [Test workflow](workflows/test.md) - Context-efficient test running
- [Agent patterns](reference/agents.md) - Sub-agent definitions
