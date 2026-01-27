# Create Skill Workflow

Step-by-step process for creating a new PAI skill.

## Prerequisites

- Know what the skill should do
- Know when Claude should use it (triggers)
- Understand our conventions (see SKILL.md)

## Step 0: Determine Skill Type

Before creating, determine whether this is an **infrastructure skill** or a **personal skill**:

| Question | Infrastructure Skill | Personal Skill |
|----------|---------------------|----------------|
| Who will use it? | All PAI users | Just you |
| Where to create? | PAI source repo (`core/skills/`) | `~/.pai/skills/` |
| Naming prefix? | `pai-*` required | No prefix (e.g., `code-review`) |
| Update orchestrate? | Yes, add to catalog | Optional |

**Detect context:**
- If working in PAI source repository (where `core/skills/` exists) → Infrastructure skill
- If working anywhere else → Personal skill

**Ask user if unclear:** "Is this a personal skill for your own use, or an infrastructure skill to be included in PAI?"

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

**Format:** `descriptive-name` (personal) or `pai-descriptive-name` (infrastructure)

**Rules:**
- Always kebab-case (lowercase, hyphens)
- `pai-*` prefix is **reserved for infrastructure skills** created in PAI source repo
- Personal skills should NOT use `pai-` prefix
- Keep short but descriptive

**Naming patterns:**
| Skill Type | Pattern | Location | Examples |
|------------|---------|----------|----------|
| Infrastructure | `pai-*` | `core/skills/` (source repo) | `pai-research`, `pai-validate` |
| Personal | `name` | `~/.pai/skills/` | `code-review`, `morning-routine` |
| Project-specific | `project-*` | `~/.pai/skills/` | `myapp-deploy`, `api-testing` |

**Important:** If you're not a PAI maintainer working in the source repo, don't use the `pai-` prefix. Create personal skills instead.

### 3. Create Directory

**For personal skills** (most common):
```bash
SKILL_NAME="skill-name"
SKILL_DIR="$HOME/.pai/skills/$SKILL_NAME"

mkdir -p "$SKILL_DIR"
```

**For infrastructure skills** (PAI maintainers only):
```bash
SKILL_NAME="pai-skill-name"
SKILL_DIR="core/skills/$SKILL_NAME"  # In PAI source repo

mkdir -p "$SKILL_DIR"
```

**Optional subdirectories** (only if needed):
```bash
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

### 8. Update pai-orchestrate Skill Catalog

**Only for infrastructure skills** (`pai-*` prefix created in source repo).

Personal skills don't need to be added to the orchestrate catalog - they're available to you automatically.

For infrastructure skills, ask: "Should this skill be added to pai-orchestrate's skill catalog? This makes it available for tree-based task decomposition."

If yes, determine the category and add to `core/skills/pai-orchestrate/SKILL.md` in the "Available Skills Catalog" table:

| Category | Description | When in Tree |
|----------|-------------|--------------|
| Understanding | Analyze code, gather info | Early - before implementation |
| Research | External research, best practices | Early - inform approach |
| Validation | Review, check, verify | After implementation |
| Execution | Complex multi-phase tasks | When task needs rigor |
| Creation | Generate, scaffold, produce | During implementation |
| Analysis | Investigate, debug, profile | When investigating issues |

**Add entry format:**
```markdown
| `skill-name` | Brief description | When to use in tree |
```

**Example addition:**
```markdown
| `pai-createskill` | Scaffold new skills | When tree needs to create new skills |
```

### 9. Test

- Try the example scenarios
- Verify Claude picks up the triggers
- Check all referenced files exist

## Validation Checklist

Before considering complete:

**All skills:**
- [ ] SKILL.md exists with proper frontmatter
- [ ] `name:` matches directory name
- [ ] `description:` is single-line with `USE WHEN`
- [ ] Has Instructions or Workflows section
- [ ] Has 2+ examples
- [ ] All referenced workflow files exist
- [ ] Tested at least one example scenario

**Personal skills only:**
- [ ] Created in `~/.pai/skills/` (not source repo)
- [ ] Does NOT use `pai-` prefix
- [ ] Added to `~/.pai/skills/index.md`

**Infrastructure skills only:**
- [ ] Created in PAI source repo `core/skills/`
- [ ] Uses `pai-` prefix
- [ ] Added to pai-orchestrate skill catalog
- [ ] Added to `core/skills/index.md`

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| TitleCase names | Convert to kebab-case |
| Multiline description | Collapse to single line |
| Missing `USE WHEN` | Add trigger phrases |
| Too many directory levels | Flatten to max 2 levels |
| Backups folder in skill | Move to `~/.pai/backups/` |
| Missing examples | Add 2-3 concrete examples |
