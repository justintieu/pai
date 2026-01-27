---
name: pai-createskill
description: Create new PAI skills following conventions. USE WHEN create skill, new skill, make skill, build skill, scaffold skill.
tools: Read, Edit, Write, Bash, Glob
requires: pai-validate
---

# PAI CreateSkill

Create new skills for the PAI ecosystem, ensuring they follow our conventions and are ready for immediate use.

## Workflows

| Workflow | Use When | File |
|----------|----------|------|
| **Create** | "create a skill", "new skill" | `workflows/create.md` |
| **Update** | "add workflow", "update skill" | `workflows/update.md` |

## Skill Types & Locations

Skills are created in different locations based on type:

| Skill Type | Prefix | Location | When to Use |
|------------|--------|----------|-------------|
| **Infrastructure** | `pai-*` | PAI source repo's `core/skills/` | Building skills that ship with PAI (requires maintainer access) |
| **Personal** | No prefix | `~/.pai/skills/` | Your own skills, project-specific tools, personal workflows |

**How to decide:**
- Creating a skill for PAI infrastructure? → Use `pai-` prefix, create in source repo
- Creating a skill for yourself or a specific project? → No prefix, create in `~/.pai/skills/`

Most users will create **personal skills**. Infrastructure skills are only created when contributing to PAI itself.

## Quick Create

For simple personal skills, use this inline process:

1. **Determine name:** kebab-case, no `pai-` prefix (e.g., `code-review`, `morning-routine`)
2. **Create directory:** `~/.pai/skills/[skill-name]/`
3. **Write SKILL.md** with frontmatter and sections
4. **Validate** using pai-validate

## Our Conventions

### Naming (kebab-case everywhere)

| Component | Format | Example |
|-----------|--------|---------|
| Skill directory | kebab-case | `pai-research`, `morning-routine` |
| Workflow files | kebab-case | `create.md`, `quick-check.md` |
| Tool files | kebab-case | `validate.sh`, `fetch-data.ts` |

### Directory Structure

```
~/.pai/skills/skill-name/
├── SKILL.md              # Required: main definition
├── workflows/            # Optional: multi-step procedures
│   └── workflow-name.md
├── tools/                # Optional: utility scripts
│   └── tool-name.sh
└── reference/            # Optional: detailed docs
```

**Rules:**
- Maximum 2 levels deep (skill → subdirectory → files)
- No `backups/` subdirectories inside skills
- Keep SKILL.md under 500 lines
- No `Context/` or `Docs/` folders - reference files go in `reference/`

### SKILL.md Template

```yaml
---
name: skill-name
description: Brief description. USE WHEN trigger1, trigger2, trigger3.
tools: Read, Edit, Write
# requires: other-skill
---

# Skill Name

Overview of what this skill does.

## Instructions

1. First step
2. Second step
3. Third step

## Examples

**Example 1: [Scenario]**
...

**Example 2: [Another Scenario]**
...

## Resources

- [Workflow](workflows/name.md) - Description
```

### Frontmatter Rules

| Field | Required | Format |
|-------|----------|--------|
| `name` | Yes | kebab-case, matches directory |
| `description` | Yes | Single-line, ends with `USE WHEN` triggers |
| `tools` | No | Comma-separated system tools |
| `requires` | No | Dependent skill names |
| `hooks` | No | before/after scripts |

**Description format:**
- Start with what the skill does
- End with `USE WHEN` followed by trigger phrases
- Keep on single line (no `|` multiline)

## Examples

**Example 1: Create a simple skill**
```
User: "create a skill for code review"

Claude:
1. Creates ~/.pai/skills/code-review/
2. Writes SKILL.md:
   ---
   name: code-review
   description: Review code for quality, security, and best practices. USE WHEN review code, check code, code quality.
   tools: Read, Grep
   ---

   # Code Review
   ...
3. Updates skills/index.md
4. Reports completion
```

**Example 2: Create a personal skill with workflows**
```
User: "create a skill for managing my morning routine with planning and review workflows"

Claude:
1. Creates ~/.pai/skills/morning-routine/  (no pai- prefix for personal skills)
2. Creates workflows/plan.md
3. Creates workflows/review.md
4. Writes SKILL.md with workflow routing table
5. Validates using pai-validate
6. Updates ~/.pai/skills/index.md
```

**Example 3: Create from template**
```
User: "create a skill like pai-research but for bookmarks"

Claude:
1. Reads pai-research/SKILL.md as reference
2. Adapts structure for bookmarks use case
3. Creates ~/.pai/skills/bookmarks/ (personal skill, no pai- prefix)
4. Validates and updates index
```

## After Creation

After creating a skill:

1. **Validate:** Run pai-validate to ensure compliance
2. **Test:** Try the example scenarios
3. **Update index:** Add to `~/.pai/skills/index.md`
4. **Update orchestrate catalog:** Ask if skill should be added to pai-orchestrate's skill catalog for tree-based orchestration
5. **Iterate:** Refine based on usage

## Resources

- [Create workflow](workflows/create.md) - Full creation process
- [Update workflow](workflows/update.md) - Add workflows or modify skills
- [pai-validate](../pai-validate/SKILL.md) - Validation and fixing
