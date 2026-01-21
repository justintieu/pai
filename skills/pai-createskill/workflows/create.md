# Create Skill Workflow

Step-by-step process for creating a new PAI skill.

## Prerequisites

- Know what the skill should do
- Know when Claude should use it (triggers)
- Understand our conventions (see SKILL.md)

## Steps

### 1. Gather Requirements

Determine or ask the user:

| Question | Purpose |
|----------|---------|
| What does this skill do? | Core functionality |
| When should Claude use it? | Trigger phrases for `USE WHEN` |
| Simple or complex? | Single instructions vs multiple workflows |
| What tools needed? | `tools:` frontmatter |
| Dependencies? | `requires:` frontmatter |

### 2. Choose Name

**Format:** `[prefix-]descriptive-name`

**Rules:**
- Always kebab-case (lowercase, hyphens)
- PAI-related skills use `pai-` prefix
- Keep short but descriptive

**Naming patterns:**
| Type | Pattern | Examples |
|------|---------|----------|
| PAI system skills | `pai-*` | `pai-research`, `pai-validate` |
| Domain skills | `domain-*` | `code-review`, `morning-routine` |
| Project skills | `project-name-*` | `myapp-deploy`, `api-testing` |

### 3. Create Directory

```bash
SKILL_NAME="skill-name"
SKILL_DIR="$HOME/.pai/skills/$SKILL_NAME"

# Create base directory
mkdir -p "$SKILL_DIR"

# Optional: Add subdirectories only if needed
mkdir -p "$SKILL_DIR/workflows"   # For multi-step procedures
mkdir -p "$SKILL_DIR/tools"       # For utility scripts
mkdir -p "$SKILL_DIR/reference"   # For detailed docs
```

### 4. Write SKILL.md

Use the appropriate template based on complexity:

#### Simple Skill (instructions only)

```markdown
---
name: skill-name
description: What it does. USE WHEN trigger1, trigger2, trigger3.
tools: Read, Edit
---

# Skill Name

Brief overview.

## Instructions

1. First step
2. Second step
3. Third step

## Examples

**Example 1: Basic usage**
```
User: "example request"
Claude: expected behavior
```

**Example 2: Another case**
```
User: "different request"
Claude: expected behavior
```
```

#### Complex Skill (with workflows)

```markdown
---
name: skill-name
description: What it does. USE WHEN trigger1, trigger2, trigger3.
tools: Read, Edit, Write, Bash
---

# Skill Name

Brief overview.

## Workflows

| Workflow | Use When | File |
|----------|----------|------|
| **Name1** | "phrase1", "phrase2" | `workflows/name1.md` |
| **Name2** | "phrase3", "phrase4" | `workflows/name2.md` |

## Quick Reference

Brief inline instructions for simple cases.

## Examples

**Example 1: Using workflow 1**
```
User: "request for workflow 1"
Claude: Uses workflows/name1.md
```

**Example 2: Using workflow 2**
```
User: "request for workflow 2"
Claude: Uses workflows/name2.md
```

## Resources

- [Workflow 1](workflows/name1.md) - Description
- [Workflow 2](workflows/name2.md) - Description
```

### 5. Create Workflow Files (if needed)

For each workflow in the routing table:

```markdown
# Workflow Name

Brief description of what this workflow accomplishes.

## When to Use

- Trigger phrase 1
- Trigger phrase 2

## Steps

### 1. Step Name

Description of what to do.

### 2. Another Step

More instructions.

## Checklist

- [ ] Item 1
- [ ] Item 2

## Examples

**Example: Scenario**
```
Input: ...
Output: ...
```
```

### 6. Validate

Run validation to ensure compliance:

```bash
# Using pai-validate skill
pai-validate ~/.pai/skills/skill-name

# Or quick manual check
grep -E "^(name|description):" ~/.pai/skills/skill-name/SKILL.md
grep "USE WHEN" ~/.pai/skills/skill-name/SKILL.md
```

### 7. Update Index

Add to `~/.pai/skills/index.md`:

```markdown
- **[skill-name](skill-name/SKILL.md)** - Brief description
```

### 8. Test

- Try the example scenarios
- Verify Claude picks up the triggers
- Check all referenced files exist

## Validation Checklist

Before considering complete:

- [ ] SKILL.md exists with proper frontmatter
- [ ] `name:` matches directory name
- [ ] `description:` is single-line with `USE WHEN`
- [ ] Has Instructions or Workflows section
- [ ] Has 2+ examples
- [ ] All referenced workflow files exist
- [ ] Added to skills/index.md
- [ ] Tested at least one example scenario

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| TitleCase names | Convert to kebab-case |
| Multiline description | Collapse to single line |
| Missing `USE WHEN` | Add trigger phrases |
| Too many directory levels | Flatten to max 2 levels |
| Backups folder in skill | Move to `~/.pai/backups/` |
| Missing examples | Add 2-3 concrete examples |
