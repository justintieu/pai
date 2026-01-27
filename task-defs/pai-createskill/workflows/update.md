# Update Skill Workflow

Add workflows, modify structure, or enhance existing skills.

## When to Use

- Adding a new workflow to an existing skill
- Modifying the skill's triggers or description
- Adding tools or reference files
- Restructuring a skill

## Steps

### 1. Review Current State

```bash
# Read the current SKILL.md
cat ~/.pai/skills/skill-name/SKILL.md

# List existing files
ls -la ~/.pai/skills/skill-name/
ls -la ~/.pai/skills/skill-name/workflows/ 2>/dev/null
```

Understand:
- Current frontmatter (name, description, tools)
- Existing workflows and their purposes
- Current trigger phrases

### 2. Clarify the Update

Determine what needs to change:

| Update Type | Action |
|-------------|--------|
| Add workflow | Create new .md file, update routing table |
| Modify triggers | Edit `description:` in frontmatter |
| Add tools | Edit `tools:` in frontmatter |
| Add dependency | Add `requires:` to frontmatter |
| Add reference | Create file in `reference/` |

### 3. Execute Changes

#### Adding a Workflow

1. Create the workflow file:
```bash
# Filename must be kebab-case
touch ~/.pai/skills/skill-name/workflows/new-workflow.md
```

2. Write workflow content:
```markdown
# New Workflow Name

Description of what this workflow does.

## Steps

### 1. First Step
...

### 2. Second Step
...

## Examples

**Example: Typical usage**
...
```

3. Update SKILL.md routing table:
```markdown
## Workflows

| Workflow | Use When | File |
|----------|----------|------|
| **Existing** | "trigger" | `workflows/existing.md` |
| **NewWorkflow** | "new trigger" | `workflows/new-workflow.md` |
```

4. Update `USE WHEN` triggers in description if needed.

#### Modifying Triggers

Edit the frontmatter:
```yaml
# Before
description: Does thing. USE WHEN old1, old2.

# After
description: Does thing. USE WHEN old1, old2, new1, new2.
```

#### Adding Tools or Dependencies

```yaml
# Add tools
tools: Read, Edit, Write, Bash, Grep

# Add dependencies
requires: pai-validate, pai-research
```

### 4. Verify Changes

Check naming:
- All new files use kebab-case
- No TitleCase or snake_case

Check structure:
- Max 2 directory levels
- No forbidden folders (backups/, Context/, Docs/)

Check references:
- All files in routing table exist
- All `requires:` skills exist

### 5. Validate

Run validation:
```bash
pai-validate ~/.pai/skills/skill-name
```

Or manual checks:
```bash
# Verify routing matches files
for f in $(grep "workflows/" ~/.pai/skills/skill-name/SKILL.md | grep -oE 'workflows/[^)]+'); do
  ls ~/.pai/skills/skill-name/$f 2>/dev/null || echo "MISSING: $f"
done
```

### 6. Test

- Try invoking with new triggers
- Test the new workflow if added
- Verify existing functionality still works

## Examples

**Example 1: Add workflow to existing skill**
```
Skill: pai-research (has quick, standard, extensive workflows)
Request: "add an interview workflow to pai-research"

Actions:
1. Create workflows/interview.md with interview research steps
2. Add row to Workflows table: **Interview** | "interview research" | workflows/interview.md
3. Update description to include "interview" in USE WHEN
4. Validate
```

**Example 2: Update triggers**
```
Skill: code-review
Current: "USE WHEN review code, check code"
Request: "add 'audit code' as a trigger"

Actions:
1. Edit description: "USE WHEN review code, check code, audit code"
2. Validate
```

**Example 3: Add tool dependency**
```
Skill: pai-morning
Request: "this skill needs to read calendar"

Actions:
1. Add to frontmatter: tools: Read, Bash
2. If using external tool: add to requires: calendar-skill
3. Validate
```

## Checklist

After updates:

- [ ] All new files use kebab-case
- [ ] Routing table matches actual files
- [ ] Triggers updated in description
- [ ] Validation passes
- [ ] Tested with example scenarios
