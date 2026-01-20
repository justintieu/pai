# Claude Code Hooks

Hook configurations for automatic PAI maintenance.

## Session End Hook

Add this to your Claude Code settings to check for pending PAI items when sessions end.

### Setup

Add to `~/.claude/settings.json` or project `.claude/settings.local.json`:

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
