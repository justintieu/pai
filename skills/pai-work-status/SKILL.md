---
name: pai-work-status
description: Maintain work status tracking - daily logs, active items index, and monthly archival. Use when starting/ending sessions, completing tasks, or managing work history.
tools: [Read, Write, Edit, Bash, Glob]
---

# PAI Work Status

Skill for maintaining the PAI work status system - tracking active tasks, daily logs, and archived history.

## Structure

```
memory/work_status/
  index.md              # Active items only + structure docs
  yyyy-mm-dd.md         # Daily logs (current month only)
  archive/
    YYYY/               # Previous months, organized by year
      yyyy-mm-dd.md
```

## Instructions

### When Starting a Session

1. Read `memory/work_status/index.md` to see active items
2. Check if today's file exists (`yyyy-mm-dd.md`)
3. If not, create it with the daily template
4. Review yesterday's file if exists for context

### When Completing Work

1. Update today's daily file with completed items
2. Update `index.md`:
   - Move completed items to "Recently Completed" with date
   - Remove items that are no longer active
   - Keep only truly active/in-progress items in "Active"

### When Adding New Tasks

1. Add to `index.md` under appropriate project heading in "Active"
2. Add to today's daily file under "In Progress" or "Planned"

### Monthly Archival (When Entering a New Month)

1. Check if previous month's files exist at top level
2. Create archive directory if needed: `archive/YYYY/`
3. Move all previous month files: `mv yyyy-mm-*.md archive/YYYY/`
4. Verify files moved correctly

## Templates

### Daily File Template

```markdown
# yyyy-mm-dd

## Completed

- [x] Task description

## In Progress

- [ ] Task description

## Notes

- Any relevant context or decisions made
```

### Index Template

```markdown
# Work Status

## Structure

- `index.md` - Active/in-progress items only
- `yyyy-mm-dd.md` - Daily logs (current month only at top level)
- `archive/YYYY/` - Previous months' files

**Archive rule**: At month end, move previous month's files to `archive/YYYY/`.

---

## Active

### [Project Name]
- [ ] Task description

---

## Recently Completed

- [x] Task description (yyyy-mm-dd)
```

## Examples

**Starting a new day:**
```
1. Read index.md - see what's active
2. Create 2026-01-21.md from template
3. Copy any in-progress items from yesterday
```

**Completing a task:**
```
1. Mark done in today's file: - [x] Fixed the auth bug
2. Update index.md: move from Active to Recently Completed
```

**New month (February 1st):**
```
1. mkdir -p archive/2026
2. mv 2026-01-*.md archive/2026/
3. Create 2026-02-01.md fresh
```

## Tips

- Keep index.md lean - only truly active items
- Daily files are the source of truth for what happened
- Archive aggressively - old files are still searchable
- Use project headings in index.md to group related tasks
