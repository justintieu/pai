# Update Workflow

Add or modify content in your TELOS context files with automatic versioning.

## Process

### Step 1: Parse the Request

Identify:
- **What** is being added (belief, goal, lesson, wisdom, book)
- **Where** it belongs (which context file)
- **Why** it matters (capture motivation)

Ask clarifying questions if needed.

### Step 2: Create Backup

Before any changes:

```bash
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
BACKUP_DIR="$HOME/.pai/backups/telos/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"
cp [file being modified] "$BACKUP_DIR/"
```

### Step 3: Format Content

**Beliefs:**
```markdown
## [Statement]
[2-3 sentence explanation]
```

**Goals:**
```markdown
## [Goal Title]
**Why:** [Purpose]
**By when:** [Target date]
**Success looks like:** [Outcomes]
**Current status:** [Progress]
```

**Lessons:**
```markdown
## [Lesson Title]
**Context:** [When/where learned]
**The lesson:** [What you learned]
**Application:** [How you use it]
```

**Wisdom:**
```markdown
> [Quote]
> — [Source]

[Your reflection]
```

### Step 4: Update File

1. Read current content
2. Determine placement (append, insert, replace)
3. Make update
4. Verify success

### Step 5: Log Change

Append to `~/.pai/memory/telos-updates.md`:

```markdown
## [YYYY-MM-DD HH:MM]
**File:** [path]
**Change:** [description]
**Backup:** ~/.pai/backups/telos/[timestamp]/
```

### Step 6: Confirm

Tell user:
1. What was added
2. Where backup is
3. Invite further updates

## Tips

- Read existing file first to match style
- Preserve user's exact words for beliefs/lessons
- Group related updates together
- Suggest connections to existing content
