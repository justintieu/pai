# Document Recent Workflow

Identify and document system changes that occurred since the last recorded update.

## When to Use

- Returning from extended break
- Periodic maintenance
- Pre-release documentation review
- Sessions that ended without proper documentation
- "What's undocumented?"

## Steps

### 1. Find Last Documentation Timestamp

```bash
# Find most recent session doc
LAST_DOC=$(ls -t ~/.pai/memory/sessions/*.md 2>/dev/null | head -1)

if [ -n "$LAST_DOC" ]; then
  LAST_DATE=$(basename "$LAST_DOC" | grep -oE '^[0-9]{4}-[0-9]{2}-[0-9]{2}')
  echo "Last documented: $LAST_DATE"
else
  echo "No previous documentation found"
  LAST_DATE="1970-01-01"
fi
```

### 2. Retrieve Changes Since Then

```bash
PAI_ROOT=~/.pai

# Git log since last doc
cd "$PAI_ROOT"
git log --oneline --since="$LAST_DATE" --name-only

# Or diff against a date
git diff --name-only $(git rev-list -1 --before="$LAST_DATE" HEAD)..HEAD
```

### 3. Categorize Changes

Group changes by type:

| Category | Patterns |
|----------|----------|
| Skills | `skills/*/SKILL.md`, `skills/*/workflows/*` |
| Agents | `agents/*.md` |
| Context | `context/*.md` |
| Memory | `memory/*.md` |
| Commands | `commands/*.md` |
| Hooks | `hooks/*` |
| Config | Root config files |

### 4. Filter Significant Changes

**Document if:**
- New files in source directories
- Skill modifications
- Configuration updates
- Workflow changes
- Architectural decisions

**Skip if:**
- Auto-generated index files
- Temporary files
- Minor formatting changes

### 5. Generate Documentation

For each significant group of changes:

```markdown
# Catch-up: [Category] Updates

**Date:** YYYY-MM-DD
**Covers:** Changes from LAST_DATE to today
**Impact:** [aggregated impact level]

## Summary

Overview of changes in this category since last documentation.

## Changes

### [Change 1 Title]
- What changed
- Why (if known from commit messages)

### [Change 2 Title]
- What changed
- Why

## Notes

Any additional context pieced together from:
- Commit messages
- File diffs
- Code comments
```

### 6. Store and Commit

```bash
# Save catch-up documentation
DOC_DIR="$HOME/.pai/memory/sessions"
DOC_FILE="$DOC_DIR/$(date +%Y-%m-%d)-catchup.md"

# Then proceed to Git Push workflow
```

## Gap Analysis Template

```markdown
## Documentation Gap Analysis

**Last documented:** YYYY-MM-DD
**Current date:** YYYY-MM-DD
**Gap:** N days

### Undocumented Changes

| File | Type | Commits | Priority |
|------|------|---------|----------|
| skills/pai-new/SKILL.md | New skill | 3 | High |
| agents/helper.md | Modification | 1 | Medium |
| context/prefs.md | Update | 2 | Low |

### Recommended Actions

1. Document new skill pai-new (High)
2. Note agent modifications (Medium)
3. Optional: Document config updates (Low)

### Already Documented (Skip)

- Auto-generated files
- Index rebuilds
- Formatting changes
```

## Automation

For regular catch-up, consider:

```bash
#!/bin/bash
# Run weekly to check for documentation gaps

LAST_DOC=$(ls -t ~/.pai/memory/sessions/*.md 2>/dev/null | head -1)
CHANGES=$(cd ~/.pai && git log --oneline --since="7 days ago" | wc -l)

if [ "$CHANGES" -gt 5 ]; then
  echo "WARNING: $CHANGES commits in last 7 days may need documentation"
fi
```
