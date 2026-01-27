# Learnings

Organized insights from work sessions. Each learning is a separate file for context efficiency.

## Structure

| Directory | Purpose |
|-----------|---------|
| `technical/` | Patterns, solutions, technical knowledge |
| `process/` | Better ways of working |
| `mistakes/` | Things that didn't work and why |

## File Naming

```
{category}/YYYY-MM-DD-brief-description.md
```

Examples:
- `technical/2026-01-22-context-saving-pattern.md`
- `process/2026-01-22-pai-architecture-flow.md`
- `mistakes/2026-01-22-editing-deployed-files.md`

## Recent

- `process/2026-01-27-cancel-scheduled-reminders.md` - Need `pai remind --list` and `--cancel` commands

## Usage

Load specific files as needed rather than reading everything. Use grep to find relevant learnings:

```bash
grep -r "keyword" ~/.pai/memory/learnings/
```

## Adding Learnings

1. Create a file in the appropriate subdirectory
2. Use the date-prefixed naming convention
3. Update the "Recent" section in this index
4. Run `pai sync --push` to save
