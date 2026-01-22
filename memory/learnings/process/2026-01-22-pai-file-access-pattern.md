# PAI File Access Pattern

**Date:** 2026-01-22

## The Pattern

| Operation | Tool | Why |
|-----------|------|-----|
| **Reads** | `pai file read <path>` | Safe, quick, CLI handles path resolution |
| **Writes** | Edit tool on `~/.pai/<path>` | Surgical, preserves content |
| **New files** | `pai file write` | Only for creating brand new files |

## Why Not CLI Write?

`pai file write` overwrites the entire file. Dangerous for:
- Adding entries to existing files
- Updating sections
- Any modification

The Edit tool surgically replaces specific strings while preserving everything else.

## Permissions Required

In `~/.claude/settings.json`:
```json
"permissions": {
  "allow": [
    "Edit(~/.pai/**)",
    "Write(~/.pai/**)"
  ]
}
```

## Agent Updates

All PAI agents now use this pattern:
- `pai-reader`: CLI reads only (tools: Bash)
- `pai-logger`: CLI reads + Edit writes (tools: Bash, Read, Edit)
- `pai-editor`: CLI reads + Edit writes (tools: Bash, Read, Edit)
- `pai-assistant`: Delegates to above agents
