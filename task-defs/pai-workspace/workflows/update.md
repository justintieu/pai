# Update Workspace Workflow

Guided workflow for updating workspace status, progress, and details.

## When to Use

- Recording progress on a workspace
- Changing phase (e.g., Planning → Building)
- Adding notes or decisions
- Reviewing and updating goals

## Process

### 1. Identify Workspace

If not specified, list active workspaces:
```bash
pai workspace list --status Active
```

### 2. Review Current State

Show current workspace status:
```bash
pai workspace status <name>
```

### 3. Determine Update Type

Ask what kind of update:
- **Progress**: Recording completed work
- **Phase change**: Moving to a different phase
- **Goals update**: Modifying objectives
- **Notes/decisions**: Adding context

### 4. Execute Update

For progress and phase changes, use CLI:
```bash
# Add progress entry
pai workspace update <name> --progress "Completed feature X"

# Change phase
pai workspace update <name> --phase Building

# Both at once
pai workspace update <name> --phase Building --progress "Started implementation"
```

For goals, notes, or decisions, edit workspace.md directly:
```bash
# Read current state
cat ~/.pai/workspaces/<name>/workspace.md
```

Then use Edit tool to update the appropriate section.

### 5. Confirm Changes

Show updated status:
```bash
pai workspace status <name>
```

## Phase Reference

| Phase | When to Use |
|-------|-------------|
| Planning | Defining scope, gathering requirements |
| Research | Investigating options, learning domain |
| Building | Active development/implementation |
| Testing | Verifying, debugging, quality assurance |
| Launched | Deployed/shipped, in use |
| On Hold | Paused, will resume later |

## Example Interaction

```
User: Update my api-project workspace

Claude: Let me check the current status.

[Executes: pai workspace status api-project]

Current status:
- Phase: Building
- Last Updated: 2026-01-15
- Recent Progress: Set up authentication

What would you like to update?
1. Add progress entry
2. Change phase
3. Update goals or notes

User: Add progress - finished the user endpoints

Claude: [Executes: pai workspace update api-project --progress "Finished user endpoints"]

Done! Progress recorded with today's date.

Current status now shows:
- Phase: Building
- Last Updated: 2026-01-21
- Recent Progress:
  - [2026-01-21] Finished user endpoints
  - [2026-01-15] Set up authentication
```

## Tips

- Update progress frequently - small entries are better than forgetting
- Change phase when your focus shifts, not necessarily when "complete"
- Use blockers section to track what's holding you back
- Review workspaces weekly to keep them current
