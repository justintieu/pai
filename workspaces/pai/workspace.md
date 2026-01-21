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

- Added hooks system with TypeScript handlers for session lifecycle
- Ported 16 skills from Daniel Miessler's fabric patterns
- Added workspace CLI commands (`pai workspace create/list/status/update/archive`)
- Set up integrity checking, security blocks, state tracking

### Next Steps

- Fill out this workspace with architecture and key files
- Review context directories for cleanup
- Build workspace auto-switching based on cwd

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

## Key Files

| File | Purpose |
|------|---------|
| `kasanariba-ai/pai` | Main CLI script (bash) |
| `kasanariba-ai/core/` | Core CLI commands |
| `kasanariba-ai/lib/` | Shared library code |
| `~/.pai/agents/pai-assistant.md` | Atlas persona definition |
| `~/.pai/hooks/src/` | TypeScript hook implementations |
| `~/.pai/context/index.md` | Context directory guide |
| `~/.pai/memory/index.md` | Memory directory guide |

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

## Notes

- The name "kasanariba" comes from Japanese 重なり場 (kasanariba) meaning "overlapping place" - where AI and human context overlap
- Atlas is the default persona - a Life OS Navigator
- PAI is designed for Claude Code specifically but could adapt to other AI interfaces
