# Archive Workflow

Full conversation archival with context extraction.

## When to Use

- Conversation exceeds 50 messages
- Before compacting/clearing context
- After completing major work
- User says "archive this session"

## Process

### Step 1: Gather Context

Scan the conversation for:

1. **User Goals** - What was the user trying to accomplish?
2. **Decisions** - What choices were made and why?
3. **Code Changes** - What files were created/modified?
4. **Problems** - What issues were encountered?
5. **Solutions** - How were problems resolved?
6. **Remaining Work** - What's left to do?

### Step 2: Generate Session Title

Create a descriptive title from the main topic:
- "implementing-auth-feature"
- "debugging-build-errors"
- "context-saving-research"

### Step 3: Save Full Archive

```bash
SESSION_TITLE="[generated-title]"
ARCHIVE_FILE="$HOME/.pai/output/sessions/$(date +%Y-%m-%d)-${SESSION_TITLE}.md"

cat > "$ARCHIVE_FILE" << 'EOF'
# Session Archive: [Title]

**Date:** [YYYY-MM-DD]
**Time:** [HH:MM]
**Duration:** [estimated]
**Messages:** [approximate count]

## Summary

[2-3 sentences describing what was accomplished in this session]

## Goals

- [Primary goal]
- [Secondary goal if applicable]

## Decisions Made

### Decision 1: [Name]
- **Choice:** [What was decided]
- **Rationale:** [Why this choice]
- **Alternatives:** [What else was considered]

### Decision 2: [Name]
...

## Code Changes

### Files Created
- `path/to/new-file.ts` - [Purpose]

### Files Modified
- `path/to/existing.ts` - [What changed]

### Key Code Snippets
```[language]
// Important code that was written
[snippet]
```

## Problems & Solutions

### Problem 1: [Brief description]
- **Symptoms:** [How it manifested]
- **Root cause:** [What was wrong]
- **Solution:** [How it was fixed]

## Insights & Learnings

- [Key insight 1]
- [Key insight 2]
- [Pattern discovered]

## Action Items

### Completed This Session
- [x] [Task 1]
- [x] [Task 2]

### Remaining / Next Steps
- [ ] [Task 3]
- [ ] [Task 4]

## Context for Resumption

[Information needed to continue this work in a new session:
- Current state of the implementation
- Key files to reference
- Important context that shouldn't be lost]

## References

- [Related file 1](path/to/file)
- [Documentation](url-if-applicable)
EOF
```

### Step 4: Return Summary

Return concise summary to chat:

```markdown
## Session Archived

**Saved:** `~/.pai/output/sessions/[filename]`
**Size:** [X chars] → [Y chars summary] ([Z]% reduction)

### Key Decisions
- [Decision 1 - brief]
- [Decision 2 - brief]

### Completed
- [Accomplishment 1]
- [Accomplishment 2]

### To Continue
- [Next step 1]
- [Next step 2]

→ Full archive: `~/.pai/output/sessions/[filename]`
```

## Example

**Conversation:** 60 messages about implementing a caching layer

**Archive saved:** `~/.pai/output/sessions/2026-01-22-caching-implementation.md`

**Summary returned:**
```markdown
## Session Archived

**Saved:** `~/.pai/output/sessions/2026-01-22-caching-implementation.md`
**Size:** 48,000 chars → 580 chars (98.8% reduction)

### Key Decisions
- Chose Redis over in-memory caching for distributed setup
- Set 15-minute TTL for user session data

### Completed
- Implemented CacheService with Redis backend
- Added cache middleware for API routes
- Created cache invalidation on user update

### To Continue
- Add cache metrics/monitoring
- Implement cache warming on deploy

→ Full archive: `~/.pai/output/sessions/2026-01-22-caching-implementation.md`
```

## Notes

- Archive before running `/compact` to preserve context
- Archives can be recalled with "recall session about [topic]"
- Critical insights should also be promoted to `~/.pai/memory/lessons/`
