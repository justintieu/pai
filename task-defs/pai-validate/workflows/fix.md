# Fix Skill Workflow

Canonicalize a non-compliant skill to match our PAI conventions.

## Steps

### 1. Validate First

Run the validate workflow to identify issues:

```bash
# See workflows/validate.md for full validation
# Collect list of failures to fix
```

### 2. Create Backup (If Significant Changes)

```bash
SKILL_NAME="skill-name"
BACKUP_DIR="~/.pai/backups/skills"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"
cp -r ~/.pai/skills/$SKILL_NAME "$BACKUP_DIR/${SKILL_NAME}-${TIMESTAMP}"
echo "Backed up to: $BACKUP_DIR/${SKILL_NAME}-${TIMESTAMP}"
```

**Note:** Backups go in `~/.pai/backups/`, never inside the skill directory.

### 3. Fix Naming Issues

**Directory not kebab-case:**
```bash
# Example: MySkill → my-skill
OLD_NAME="MySkill"
NEW_NAME="my-skill"

mv ~/.pai/skills/$OLD_NAME ~/.pai/skills/$NEW_NAME
```

**Workflow files not kebab-case:**
```bash
# Example: CreateNew.md → create-new.md
cd ~/.pai/skills/skill-name/workflows
mv CreateNew.md create-new.md
```

**Update references:**
After renaming, update all references in:
- SKILL.md (workflow table, resource links)
- Other workflow files that reference renamed files

### 4. Fix Frontmatter Issues

**Multiline description → single-line:**
```yaml
# Before
---
name: skill-name
description: |
  This is a multiline
  description that spans
  multiple lines.
---

# After
---
name: skill-name
description: This is a single-line description that fits on one line.
---
```

**name doesn't match directory:**
```yaml
# If directory is: ~/.pai/skills/pai-research/
# Then name must be:
---
name: pai-research
---
```

**Remove outdated fields:**
```yaml
# Remove these if present (Miessler-style, not ours)
triggers: [...]     # Remove - use description instead
workflows: [...]    # Remove - use ## Workflows section
```

### 5. Fix Structure Issues

**Too deeply nested (> 2 levels):**
```bash
# Before: workflows/category/subcategory/file.md (3 levels)
# After: workflows/category-subcategory-file.md (1 level)

# Flatten by combining names
mv workflows/research/deep/analyze.md workflows/research-deep-analyze.md
rmdir workflows/research/deep
rmdir workflows/research
```

**Has backups/ subdirectory:**
```bash
# Move to central backups location
mv ~/.pai/skills/skill-name/backups/* ~/.pai/backups/skills/
rmdir ~/.pai/skills/skill-name/backups
```

### 6. Fix Content Issues

**Missing Instructions/Workflows section:**
```markdown
# Add after frontmatter

## Instructions

1. [First step of how to use this skill]
2. [Second step]
3. [Third step]
```

**Missing Examples section:**
```markdown
# Add before Resources (or at end)

## Examples

**Example 1: [Scenario name]**
```
User: "[Example request]"
Claude: [How Claude should respond]
```

**Example 2: [Another scenario]**
```
User: "[Another request]"
Claude: [Expected behavior]
```
```

**Broken file references:**
```markdown
# If reference points to non-existent file:
# Option 1: Create the missing file
# Option 2: Remove the reference
# Option 3: Update reference to correct path
```

### 7. Update Index

If skill was renamed, update `~/.pai/skills/index.md`:

```markdown
# Before
- **[MySkill](MySkill/SKILL.md)** - Description

# After
- **[my-skill](my-skill/SKILL.md)** - Description
```

### 8. Re-validate

Run validation again to confirm all issues resolved:

```bash
# All checks should pass now
```

## Fix Priority

Fix issues in this order:

1. **Critical:** File/directory naming (breaks references)
2. **High:** Frontmatter format (name, description)
3. **Medium:** Missing sections (Instructions, Examples)
4. **Low:** Structure optimization (flatten if too deep)

## Common Migrations

### From Miessler-style to Our-style

| Miessler | Ours |
|----------|------|
| `CreateSkill/` | `pai-createskill/` |
| `Workflows/CreateNew.md` | `workflows/create-new.md` |
| `USE WHEN create skill` | `description: ... Use when creating skills` |
| `## Workflow Routing` table | `## Workflows` table or `## Instructions` |
| `Tools/ToolName.ts` | `tools/tool-name.sh` (or .ts) |

### Frontmatter Migration

```yaml
# Miessler-style
---
name: CreateSkill
description: Create skills. USE WHEN create skill, new skill.
---

# Our-style
---
name: pai-createskill
description: Create and validate PAI skills. Use when creating new skills or checking skill structure.
tools: Read, Edit, Write, Bash
---
```
