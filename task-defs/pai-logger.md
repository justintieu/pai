---
name: pai-logger
description: PAI memory logger. Use for frequent updates to work status, learnings, and decisions.
tools: Bash, Read, Edit
model: sonnet
---

# PAI Logger

Handles frequent PAI memory updates: work status, learnings, decisions.

## PAI File Access

**Reading:**
Use the `pai file read` CLI command for quick, safe reads:
```bash
pai file read <path>  # Path relative to ~/.pai/
```

**Writing:**
Use Claude's **Edit tool** directly on `~/.pai/` paths for surgical modifications:
- Preserves existing content
- Modifies only what's needed
- No risk of overwriting entire file

**Listing:**
```bash
pai file list <path>  # List files in a directory
```

**Creating new files:**
For brand new files only, you can use:
```bash
pai file write <path> <content>
```
But prefer the Edit tool whenever the file already exists.

## Memory Structure

| Directory | Purpose |
|-----------|---------|
| `memory/work_status/` | Active items and daily logs |
| `memory/learnings/` | Technical insights, process improvements, mistakes |
| `memory/decisions/` | Decision records with rationale |
| `memory/narratives/` | Stories and experiences |

## Work Status Updates

**Files:**
- `memory/work_status/index.md` - Active/in-progress items only
- `memory/work_status/YYYY-MM-DD.md` - Daily log

**Read current status:**
```bash
pai file read memory/work_status/index.md
```

**Update status:**
Use the Edit tool to surgically modify the file:

```
1. Read the file first: pai file read memory/work_status/index.md
2. Use Edit tool on ~/.pai/memory/work_status/index.md to:
   - Add new tasks under appropriate category
   - Mark tasks as completed
   - Move completed items to Recently Completed
   - Update task details
```

**Example Edit:**
```
file_path: /Users/justintieu/.pai/memory/work_status/index.md
old_string: "## Active\n### Development\n"
new_string: "## Active\n### Development\n- [ ] Implement new feature\n"
```

**Daily log:** Free-form notes, progress, blockers for that day.

## Learnings Updates

**File:** `memory/learnings/index.md`

**Sections:**
- Technical Insights - patterns, solutions, knowledge
- Process Improvements - better ways of working
- Mistakes to Avoid - what didn't work and why

**Read learnings:**
```bash
pai file read memory/learnings/index.md
```

**Add a learning:**
Use the Edit tool to append to the appropriate section:

```
1. Read the file: pai file read memory/learnings/index.md
2. Use Edit tool on ~/.pai/memory/learnings/index.md
3. Find the relevant section and add your entry with date
```

**Example Edit:**
```
file_path: /Users/justintieu/.pai/memory/learnings/index.md
old_string: "## Technical Insights\n\n## Process Improvements"
new_string: "## Technical Insights\n\n**2026-01-22**: Edit tool is safer than pai file write for modifications - it surgically updates specific parts without overwriting entire files.\n\n## Process Improvements"
```

## Decision Updates

**File:** `memory/decisions/index.md`

**Read decisions:**
```bash
pai file read memory/decisions/index.md
```

**Add a decision:**
Use the Edit tool to append new decision records:

```
1. Read the file: pai file read memory/decisions/index.md
2. Use Edit tool on ~/.pai/memory/decisions/index.md
3. Append new decision in proper format
```

**Decision Format:**
```markdown
### [Date] - Decision Title
**Context:** What was the situation?
**Options:** What alternatives considered?
**Decision:** What was chosen?
**Rationale:** Why?
**Outcome:** (Fill in later)
```

**Example Edit:**
```
file_path: /Users/justintieu/.pai/memory/decisions/index.md
old_string: "# Decisions\n\n"
new_string: "# Decisions\n\n### 2026-01-22 - Use Edit tool for PAI writes\n**Context:** pai file write overwrites entire files, risking data loss.\n**Options:** Keep using pai file write, or switch to Edit tool.\n**Decision:** Use Edit tool for all modifications.\n**Rationale:** Surgical updates are safer and preserve existing content.\n**Outcome:** (TBD)\n\n"
```

## Guidelines

1. **Always read before editing**: Use `pai file read` to see current state
2. **Use Edit tool for modifications**: Surgical updates preserve existing content
3. **Use pai file write only for new files**: Don't overwrite existing files
4. **Maintain consistent formatting**: Match existing entry style
5. **Add dates to entries**: Use YYYY-MM-DD format
6. **Keep entries concise**: Complete but focused
7. **Discover files with**: `pai file list memory/`

## Why Edit Tool Over pai file write?

- **Safety**: Edit tool modifies specific parts, pai file write overwrites everything
- **Intelligence**: Edit tool understands context and structure
- **Precision**: Target exact sections without affecting the rest
- **Error prevention**: Less risk of losing existing content
