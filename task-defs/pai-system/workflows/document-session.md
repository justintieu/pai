# Document Session Workflow

Capture and document completed work from the current session.

## When to Use

- After completing major work
- After creating new skills or workflows
- After making architectural decisions
- Following successful integrity checks
- At the end of significant sessions

## Steps

### 1. Gather Context

Identify from the current session:

```markdown
**Changed Files:**
- List files created/modified/deleted

**Goals:**
- What was the user trying to accomplish?

**Methods:**
- What approaches were used?

**Outcomes:**
- What was achieved?
- What remains to be done?
```

### 2. Analyze for Documentation

Answer these questions:

1. **What was the problem or goal?**
   - User's original request
   - Context that led to this work

2. **What was the previous state?**
   - How things worked before
   - Limitations or issues

3. **What is the new state?**
   - Changes made
   - Improvements delivered

4. **What are the implications?**
   - Future considerations
   - Related areas affected

### 3. Classify the Change

**Impact Level:**
- `critical` - Core functionality change
- `major` - Significant feature or fix
- `moderate` - Notable improvement
- `minor` - Small enhancement
- `trivial` - Housekeeping

**Change Type:**
- `skill_update` - Skill modification
- `skill_create` - New skill
- `structure_change` - Architecture change
- `doc_update` - Documentation
- `config_change` - Configuration
- `bug_fix` - Fix for an issue

### 4. Generate Documentation Entry

Create entry in memory with this structure:

```markdown
# Session: [Brief Title]

**Date:** YYYY-MM-DD
**Impact:** [critical|major|moderate|minor|trivial]
**Type:** [change_type]

## Summary

One paragraph describing what was accomplished and why.

## Changes Made

- Change 1: description
- Change 2: description
- Change 3: description

## Context

Why this work was needed. Background that led to it.

## Implications

- What this enables going forward
- Areas that may need attention
- Related future work

## Verification

How to verify this work is correct:
1. Check X
2. Verify Y
3. Test Z
```

### 5. Store Documentation

```bash
# Location for session docs
DOC_DIR="$HOME/.pai/memory/sessions"
mkdir -p "$DOC_DIR"

# File naming: YYYY-MM-DD-brief-title.md
DOC_FILE="$DOC_DIR/$(date +%Y-%m-%d)-session-title.md"
```

### 6. Commit Changes

After documenting, proceed to Git Push workflow to commit:
- The work done during the session
- The documentation entry

## Documentation Standards

**Do:**
- Focus on "why" not just "what"
- Include enough context for future recall
- Note decisions and their reasoning
- List verification steps

**Don't:**
- Document trivial changes
- Include sensitive information
- Create duplicate entries
- Over-document obvious changes

## Example Entry

```markdown
# Session: Port pai-system-skill to PAI

**Date:** 2024-01-15
**Impact:** major
**Type:** skill_create

## Summary

Ported Daniel Miessler's pai-system-skill to our PAI structure,
adapting conventions from TitleCase to kebab-case and simplifying
the workflow structure.

## Changes Made

- Created ~/.pai/skills/pai-system/SKILL.md
- Added 7 workflow files in workflows/
- Adapted security scanning and integrity check workflows
- Removed pai-core-install dependencies

## Context

Building out PAI skills by adapting proven patterns from
Miessler's infrastructure while maintaining our simpler
conventions.

## Implications

- System maintenance workflows now available
- Can run integrity checks on PAI
- Security scanning capability added
- Documentation patterns established

## Verification

1. Run: pai-validate ~/.pai/skills/pai-system
2. Check all workflow files exist
3. Test integrity check workflow
```
