# Workspace: pai

## Overview

Personal AI Infrastructure - a system for managing context, memory, and tools that help Claude understand who you are and how you work. Solves context rot by persisting information across sessions.

## Goals

- **Solve context rot** - stop losing context when switching between projects or sessions
- **Improve personal productivity** - reduce friction, automate repetitive work
- **Eventually help others** - package and share for other Claude users

### Current Priorities

1. **Workspaces** - project-specific context that switches when you change directories
2. **RAG** - retrieval augmented generation to surface relevant context without loading everything

## Status

**Phase:** Building

**Last Updated:** 2026-01-21

### Recent Progress

- Created PAI workspace with comprehensive documentation
- Simplified goals to reference workspace (avoid duplication)
- Added hooks system with TypeScript handlers for session lifecycle
- Ported 16+ skills from Daniel Miessler's fabric patterns
- Added workspace CLI commands (`pai workspace create/list/status/update/archive`)
- Set up integrity checking, security blocks, state tracking

### Next Steps

- Build workspace auto-switching based on cwd
- Implement RAG for context retrieval
- Add more skills as needed

### Blockers

- None currently

## Architecture

### Two Repositories

1. **kasanariba-ai** (`~/Documents/github/kasanariba-ai/`)
   - The CLI and build system
   - Published as `@tensakulabs/pai` on npm
   - Contains `pai` CLI script, `core/`, `lib/`, `adapters/`

2. **pai** (`~/.pai/`)
   - Your personal data (not in kasanariba-ai repo)
   - Context, memory, skills, hooks, workspaces
   - Symlinked into Claude Code via `pai build`

### Directory Structure (~/.pai)

| Directory | Purpose |
|-----------|---------|
| `context/` | Identity, beliefs, goals, preferences |
| `memory/` | Learnings, work status, decisions, state |
| `skills/` | Reusable workflows (invoked via /skill-name) |
| `agents/` | Specialized personas (Atlas is default) |
| `hooks/` | TypeScript handlers for lifecycle events |
| `workspaces/` | Project-specific context |
| `commands/` | Slash command definitions |
| `tools/` | MCP configs, custom tools |

### How It Works

1. `pai build` symlinks ~/.pai content into ~/.claude
2. Claude Code loads CLAUDE.md which references PAI structure
3. Context loaded lazily as needed during sessions
4. Hooks fire on session events (start, stop, tool calls)
5. Memory persists learnings, work status across sessions

### CLI Commands

| Command | Purpose |
|---------|---------|
| `pai setup` | Interactive setup (location, sync, git) |
| `pai build` | Build adapter, symlink into ~/.claude |
| `pai sync` | Pull changes and rebuild |
| `pai sync --push` | Commit and push to repo |
| `pai sync --check` | Check for pending items (used by hooks) |
| `pai status` | Show config and link status |
| `pai workspace <cmd>` | Manage workspaces (list/create/status/update/archive) |
| `pai maintain` | Run maintenance checks |
| `pai update` | Update with new templates from core/ |
| `pai profile [name]` | Build or list profiles |

### Hooks

TypeScript handlers in `~/.pai/hooks/src/hooks/`:

| Hook | When | Purpose |
|------|------|---------|
| `StartupGreeting` | Session start | Display PAI banner, load context |
| `LoadContext` | Session start | Load relevant context files |
| `CheckVersion` | Session start | Check for PAI updates |
| `SecurityValidator` | Tool calls | Block dangerous commands |
| `WorkCompletionLearning` | Task completion | Extract learnings from work |
| `SessionSummary` | Session end | Summarize session for memory |
| `StopOrchestrator` | Session end | Cleanup, save state |

### Skills (21 total)

Reusable workflows invoked via `/skill-name`. Key skills:

- `pai-workspace` - Manage project workspaces
- `pai-research` - Multi-source research with parallel agents
- `pai-system` - System maintenance (integrity, docs, git)
- `pai-telos` - Life OS for goals, beliefs, lessons
- `pai-algorithm` - Structured execution methodology
- `pai-council` - Multi-agent debate system
- `pai-redteam` - Adversarial analysis

## Key Files

### kasanariba-ai (CLI repo)

| File | Purpose |
|------|---------|
| `pai` | Main CLI script (bash) |
| `pai.config.yaml` | Default configuration |
| `core/build.sh` | Build/symlink logic |
| `core/sync.sh` | Git sync logic |
| `core/workspace.sh` | Workspace management |
| `lib/` | Shared library functions |
| `adapters/` | Adapter definitions (claude-code) |

### ~/.pai (user data)

| File | Purpose |
|------|---------|
| `agents/pai-assistant.md` | Atlas persona definition |
| `hooks/src/hooks/` | TypeScript hook implementations |
| `context/index.md` | Context directory guide |
| `memory/index.md` | Memory directory guide |
| `skills/*/SKILL.md` | Skill definitions |
| `workspaces/*/workspace.md` | Workspace context |
| `meta.yaml` | PAI metadata |

## Developer Guide

Quick reference for AI to understand, navigate, and modify PAI.

### Adding a New Skill

1. Create directory: `~/.pai/skills/pai-<name>/`
2. Create `SKILL.md` with:
   - Description and use cases
   - Workflows table
   - Instructions
3. Create `workflows/<workflow>.md` for each workflow
4. Skill auto-registers on next `pai build`

Example structure:
```
skills/pai-myskill/
  SKILL.md           # Main skill definition
  workflows/
    create.md        # Workflow for creating something
    update.md        # Workflow for updating
```

### Adding a New Hook

1. Create `~/.pai/hooks/src/hooks/<Name>.hook.ts`
2. Export handler matching Claude Code hook interface
3. Register in Claude Code settings (`.claude/settings.json`)
4. Run `bun install` in hooks/ if new dependencies needed

Hook types:
- `PreToolUse` - Before tool execution (can block)
- `PostToolUse` - After tool execution
- `UserPromptSubmit` - When user submits prompt
- `Stop` - When session ends

### Adding a CLI Command

1. Create `kasanariba-ai/core/<command>.sh`
2. Add case in main `pai` script
3. Update help text in `pai` script

### Adding Context

1. Create/edit files in `~/.pai/context/<category>/`
2. Update `index.md` in that category
3. Context loads lazily - no rebuild needed

### Common Modifications

| Task | Location |
|------|----------|
| Change startup banner | `hooks/src/hooks/StartupGreeting.hook.ts` |
| Add security block | `hooks/src/hooks/SecurityValidator.hook.ts` |
| Modify build behavior | `kasanariba-ai/core/build.sh` |
| Add workspace command | `kasanariba-ai/core/workspace.sh` |
| Change default persona | `~/.pai/agents/pai-assistant.md` |
| Add CLI option | `kasanariba-ai/pai` (main script) |

### Codebase Patterns

**Bash scripts**: Use `lib/` functions for common operations
```bash
source "$SCRIPT_DIR/lib/colors.sh"
source "$SCRIPT_DIR/lib/utils.sh"
```

**Skills**: Always have SKILL.md + workflows/ structure

**Hooks**: TypeScript with Bun runtime, async handlers

**Config**: YAML for user config, JSON for state

### Testing Changes

```bash
# Preview build changes
pai build --dry-run

# Check sync status
pai sync --check

# Run maintenance
pai maintain --dry-run
```

### Organizing Workspace Content

When `workspace.md` gets too large (>300 lines), split into subdirectories:

```
workspaces/pai/
  workspace.md          # Overview, status, quick reference (keep concise)
  architecture/
    overview.md         # High-level architecture
    cli.md              # CLI commands and structure
    hooks.md            # Hook system details
    skills.md           # Skill system details
  guides/
    adding-skills.md    # How to add a skill
    adding-hooks.md     # How to add a hook
    adding-commands.md  # How to add CLI commands
  reference/
    troubleshooting.md  # Common issues
    gotchas.md          # Things to watch out for
    patterns.md         # Code patterns
  research/
    rag-options.md      # RAG implementation research
    mcp-integration.md  # MCP research
```

**When to split:**
- Section exceeds ~50 lines → move to own file
- Topic is self-contained → make it a separate doc
- You find yourself scrolling too much → split it

**How to reference:**
```markdown
## Architecture

See [architecture/](architecture/) for detailed docs:
- [Overview](architecture/overview.md) - High-level system design
- [CLI](architecture/cli.md) - Command structure
- [Hooks](architecture/hooks.md) - Hook system
```

**Keep in workspace.md:**
- Overview (what is this project)
- Status (phase, progress, next steps, blockers)
- Quick reference tables
- Links to detailed docs

## Decisions

### Bash CLI over TypeScript
Simpler to maintain, faster to iterate. TypeScript used only for hooks where type safety matters.

### Symlinks over copying
Changes to ~/.pai reflect immediately without rebuild. `pai build` creates symlinks, not copies.

### Lazy loading
Don't load all context upfront. Load index.md first, then specific files as needed.

### Skills as directories
Each skill is a directory with SKILL.md and workflows/. Allows complex skills with multiple workflows.

## Research

- [Daniel Miessler's fabric](https://github.com/danielmiessler/fabric) - ported patterns as skills
- Claude Code hooks documentation
- MCP (Model Context Protocol) for tool integration

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Symlinks broken | Run `pai build` to recreate |
| Changes not showing | Check `pai status`, run `pai build` |
| Hook not firing | Check `.claude/settings.json` registration |
| Skill not found | Run `pai build`, check SKILL.md exists |
| Git sync conflicts | Resolve in `~/.pai/`, then `pai sync` |

## Gotchas

- **Two repos**: CLI code is in `kasanariba-ai/`, user data in `~/.pai/` - don't confuse them
- **Symlinks**: `pai build` creates symlinks, not copies - changes to `~/.pai/` reflect immediately
- **Hooks need registration**: Creating a hook file isn't enough - must register in `.claude/settings.json`
- **Skills need rebuild**: New skills require `pai build` to appear in Claude Code
- **Context is lazy**: Don't load all context upfront, load `index.md` first then specific files

## Notes

- The name "kasanariba" comes from Japanese 重なり場 (kasanariba) meaning "overlapping place" - where AI and human context overlap
- Atlas is the default persona - a Life OS Navigator
- PAI is designed for Claude Code specifically but could adapt to other AI interfaces
- This workspace doubles as a knowledge base for AI to quickly understand the project
