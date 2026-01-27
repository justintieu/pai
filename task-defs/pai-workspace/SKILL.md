---
name: pai-workspace
description: Manage workspaces for project-specific context - create, list, update, and archive workspaces. USE WHEN new project, workspace management, project context, organize work, start workspace, update progress.
tools: [Bash, Read]
---

# PAI Workspace

Skill for managing PAI workspaces - project-specific directories containing context, research, and status tracking.

## CLI Commands

This skill wraps the `pai workspace` CLI commands. Use Bash to execute:

| Command | Description |
|---------|-------------|
| `pai workspace list [--status STATUS]` | List workspaces (active/on hold/completed) |
| `pai workspace create <name> [-d DESC]` | Create from template |
| `pai workspace status [name]` | Show status (all or specific) |
| `pai workspace update <name> [--phase P] [--progress TEXT]` | Update workspace |
| `pai workspace archive <name>` | Move to Completed |

## Workflows

| Workflow | Use When | File |
|----------|----------|------|
| **Create** | Starting a new project, need organized context | `workflows/create.md` |
| **Update** | Recording progress, changing phase, updating status | `workflows/update.md` |

## Quick Reference

### Create a workspace
```bash
pai workspace create my-project -d "Description of the project"
```

### Update progress
```bash
pai workspace update my-project --progress "Completed initial setup"
pai workspace update my-project --phase Building
```

### Archive when done
```bash
pai workspace archive my-project
```

## Workspace Structure

Each workspace has:
```
~/.pai/workspaces/<name>/
  workspace.md    # Main context file with status, goals, progress
  research/       # (optional) Research notes and references
  notes/          # (optional) Additional notes
```

## Instructions

### For Quick Operations

Use CLI directly via Bash:
```bash
pai workspace list
pai workspace status my-project
```

### For Guided Experience

Load the appropriate workflow file for interactive guidance:
- Creating new workspace → `workflows/create.md`
- Updating existing workspace → `workflows/update.md`

## Integration with PAI

Workspaces are tracked in `~/.pai/workspaces/index.md` with sections:
- **Active** - Currently being worked on
- **On Hold** - Paused but not abandoned
- **Completed** - Finished for reference

When starting a session, check active workspaces to understand current projects.
