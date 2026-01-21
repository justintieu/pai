# Create Skill Workflow

Create a new PAI skill following our conventions.

## Steps

### 1. Gather Requirements

Ask or determine:
- **Purpose:** What does this skill do?
- **Triggers:** When should Claude use it? (key phrases)
- **Workflows:** Does it need multiple workflows or just instructions?
- **Tools:** What system tools does it need? (Read, Edit, Bash, etc.)
- **Dependencies:** Does it require other skills?

### 2. Choose a Name

Format: `[prefix-]descriptive-name`

**Rules:**
- Use kebab-case (lowercase, hyphens)
- PAI-related skills use `pai-` prefix
- Keep it short but descriptive

**Examples:**
- `pai-research` (PAI skill for research)
- `code-review` (general skill)
- `morning-routine` (personal skill)

### 3. Create Directory Structure

```bash
SKILL_NAME="skill-name"
mkdir -p ~/.pai/skills/$SKILL_NAME

# Optional subdirectories (only if needed)
mkdir -p ~/.pai/skills/$SKILL_NAME/workflows   # For complex multi-step procedures
mkdir -p ~/.pai/skills/$SKILL_NAME/tools       # For utility scripts
mkdir -p ~/.pai/skills/$SKILL_NAME/reference   # For detailed documentation
```

### 4. Create SKILL.md

Use this template:

```markdown
---
name: skill-name
description: Brief description of what this skill does. Include key terms that help Claude know when to use it.
tools: Read, Edit, Write
# requires: other-skill    # Uncomment if dependencies exist
---

# Skill Name

Brief overview of the skill's purpose.

## Instructions

1. First step
2. Second step
3. Third step

## Examples

**Example 1: [Scenario]**
```
User: "[example request]"
Claude: [expected behavior]
```

**Example 2: [Another scenario]**
```
User: "[another request]"
Claude: [expected behavior]
```

## Resources

- [Workflow name](workflows/name.md) - Description
```

### 5. Add to Index

Update `~/.pai/skills/index.md`:

```markdown
## Available Skills

- **[skill-name](skill-name/SKILL.md)** - Brief description
```

### 6. Validate

Run validation to ensure compliance:

```bash
# Quick manual check
cat ~/.pai/skills/skill-name/SKILL.md | head -20

# Or use validate workflow
# (see workflows/validate.md)
```

### 7. Test

Invoke the skill to verify it works:
- Try the example scenarios
- Verify Claude understands when to use it
- Check that all referenced files exist

## Checklist

Before considering the skill complete:

- [ ] SKILL.md created with proper frontmatter
- [ ] name: matches directory name
- [ ] description: is single-line and descriptive
- [ ] Instructions or Workflows section present
- [ ] At least 2 examples provided
- [ ] All referenced files exist
- [ ] Added to skills/index.md
- [ ] Tested invocation works
