# Claude Code Hooks

Hook configurations for automatic PAI maintenance.

## Session End Hook

Checks for pending PAI items when sessions end.

### Automatic Setup

Hooks are **automatically configured** when you run `pai build`. No manual setup required.

### Manual Setup (if needed)

If you need to add hooks manually, add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "pai sync --check"
          }
        ]
      }
    ]
  }
}
```

### What This Does

When a Claude Code session ends (Stop event), the hook runs `pai sync --check` which:
- Shows uncommitted changes in PAI
- Warns if maintenance is overdue
- Suggests running `/pai sync` or `pai sync --push`

### Context Cost

**Zero** - hooks run outside Claude's context window.

## Alternative: Manual Check

If you prefer not to use hooks, run periodically:

```bash
pai sync --check    # See pending items
pai maintain        # Run maintenance
pai sync --push     # Commit and push changes
```

Maintenance also runs automatically when you `pai sync --push` if overdue.
