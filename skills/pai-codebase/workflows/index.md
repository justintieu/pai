# Index Workflow

Index a codebase (or subset) to understand its structure, patterns, and conventions.

## When to Use

- Starting work on a new project
- First time working with a codebase
- Need to understand architecture before making changes
- Codebase has changed significantly since last index

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `paths` | No | Directories to index (default: current directory) |
| `name` | No | Custom scope name (auto-generated from paths if not provided) |
| `incremental` | No | Only re-index changed files (default: true) |

## Process

### 1. Determine Scope

```
If no paths provided:
  scope = "root"
  paths = ["."]
Else if single path:
  scope = basename(path)  # ./packages/api → "api"
Else:
  scope = combined basenames  # ./src/auth ./src/users → "auth-users"
```

### 2. Setup Output Directory

```bash
PROJECT=$(basename $(git rev-parse --show-toplevel 2>/dev/null || pwd))
OUTPUT_DIR="$HOME/.pai/output/codebase/$PROJECT/$SCOPE"
mkdir -p "$OUTPUT_DIR"/{index,analysis,plans,tests,cache}
```

### 3. Check Cache (Incremental Mode)

If `incremental=true` and cache exists:
- Load `cache/file-hashes.json`
- Compare current file hashes
- Only analyze changed files
- Merge with existing index

### 4. Spawn Index Agent

Use the Task tool to spawn a sub-agent with dedicated context:

```
Task(
  subagent_type: "Explore",
  prompt: """
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
  """
)
```

### 5. Generate File Hashes

Save current state for incremental updates:

```json
{
  "indexed_at": "2026-01-22T14:30:00Z",
  "scope": "api",
  "paths": ["./packages/api"],
  "files": {
    "src/index.ts": "abc123...",
    "src/routes/users.ts": "def456..."
  }
}
```

### 6. Update Scopes Registry

Add/update entry in `{project}/scopes.json`:

```json
{
  "project": "my-monorepo",
  "scopes": {
    "api": {
      "paths": ["./packages/api"],
      "indexed_at": "2026-01-22T14:30:00Z",
      "file_count": 47,
      "summary": "NestJS API with TypeScript, module-based architecture"
    }
  }
}
```

### 7. Return Summary

Return concise summary to main conversation:

```markdown
## Indexed: {scope}

**Saved to:** `~/.pai/output/codebase/{project}/{scope}/`

### Summary
- **Type:** [framework/language]
- **Structure:** [pattern], [file count] files
- **Key entry:** [main file] → [flow]
- **Dependencies:** [key deps]
- **Conventions:** [key conventions]

### Quick Reference
- Architecture: `index/architecture.md`
- Entry points: `index/entry-points.md`
- Dependencies: `index/dependencies.md`
- Conventions: `index/conventions.md`
```

## Files Analyzed

The agent examines:
- `**/*.{ts,tsx,js,jsx}` - TypeScript/JavaScript
- `**/*.{py}` - Python
- `**/*.{go}` - Go
- `**/*.{rs}` - Rust
- `**/package.json`, `**/Cargo.toml`, `**/go.mod`, `**/pyproject.toml` - Configs
- `**/*.md` - Documentation (for context)

Excludes:
- `node_modules/`, `vendor/`, `.git/`
- Build outputs (`dist/`, `build/`, `target/`)
- Test fixtures and mocks
- Generated files

## Context Efficiency

| Phase | Context Used | Saved |
|-------|-------------|-------|
| Analysis | Sub-agent (separate) | All verbose output |
| Storage | Files | Full index |
| Return | ~500 chars | Summary only |

**Total context saved:** ~95% compared to inline analysis
