---
name: pai-validate
description: Validate and create PAI skills following our conventions. USE WHEN create skill, new skill, validate skill, check skill, fix skill, canonicalize.
tools: Read, Edit, Write, Bash, Glob, Grep
---

# PAI Validate - Skill Governance

Create, validate, and fix PAI skills to ensure consistency across the ecosystem.

## Workflows

| Workflow | Use When | File |
|----------|----------|------|
| **Create** | "create a skill", "new skill" | `workflows/create.md` |
| **Validate** | "validate skill", "check skill" | `workflows/validate.md` |
| **Fix** | "fix skill", "canonicalize" | `workflows/fix.md` |

## Quick Validation

Run this to validate a skill quickly:

```bash
# Check a specific skill
pai-validate ~/.pai/skills/skill-name

# Check all skills
pai-validate ~/.pai/skills/*/SKILL.md
```

## Our Conventions

### Naming
- **Directories:** kebab-case (`pai-validate`, `pai-research`)
- **Files:** kebab-case (`SKILL.md`, `workflows/create.md`)
- **PAI skills:** prefix with `pai-` (e.g., `pai-work-status`)

### Structure
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
- Maximum 2 levels deep
- No `backups/` subdirectories in skills
- Keep SKILL.md under 500 lines (use workflows/ for complex procedures)

### SKILL.md Format

**Required frontmatter:**
```yaml
---
name: skill-name
description: Brief description. USE WHEN trigger1, trigger2, trigger3.
---
```

**Description format:**
- Start with a brief description of what the skill does
- End with `USE WHEN` followed by comma-separated trigger phrases
- Keep single-line (no multiline `|` syntax)

**Optional frontmatter:**
```yaml
tools: Read, Edit, Write      # System tools used
requires: other-skill         # Dependencies
hooks:
  before: scripts/setup.sh
  after: scripts/cleanup.sh
```

**Required sections:**
- `## Instructions` or `## Workflows` - How to use the skill
- `## Examples` - 2-3 concrete usage examples

**Optional sections:**
- `## Resources` - Links to workflow/tool/reference files

### Validation Checklist

A valid skill must have:

- [ ] `SKILL.md` at skill root
- [ ] Frontmatter with `name:` and `description:`
- [ ] `description:` is single-line (no `|` multiline)
- [ ] `description:` contains `USE WHEN` with trigger phrases
- [ ] Directory name matches `name:` field
- [ ] kebab-case naming throughout
- [ ] Instructions or Workflows section
- [ ] Examples section with 2+ examples
- [ ] All referenced files exist
- [ ] Max 2 directory levels
- [ ] No `backups/` subdirectory

## Examples

**Example 1: Validate a skill**
```
User: "validate pai-work-status"
Claude: Reads ~/.pai/skills/pai-work-status/SKILL.md
        Checks frontmatter, structure, sections
        Reports: "PASS: 10/10 checks passed" or lists failures
```

**Example 2: Create a new skill**
```
User: "create a skill for morning routines"
Claude: Creates ~/.pai/skills/pai-morning/
        Generates SKILL.md with proper frontmatter
        Adds Instructions and Examples sections
        Updates skills/index.md
```

**Example 3: Fix a non-compliant skill**
```
User: "fix pai-research skill"
Claude: Validates current state
        Identifies issues (e.g., TitleCase → kebab-case)
        Creates backup if needed
        Applies fixes
        Re-validates to confirm
```

## Validation Script

For automated validation, use:

```bash
#!/bin/bash
# Usage: ./validate-skill.sh ~/.pai/skills/skill-name

SKILL_DIR="$1"
SKILL_FILE="$SKILL_DIR/SKILL.md"
PASS=0
FAIL=0

check() {
  if [ "$1" = "0" ]; then
    echo "[PASS] $2"
    ((PASS++))
  else
    echo "[FAIL] $2"
    ((FAIL++))
  fi
}

echo "=== Validating: $SKILL_DIR ==="

# File existence
[ -f "$SKILL_FILE" ]
check $? "SKILL.md exists"

# Frontmatter checks
grep -q "^name:" "$SKILL_FILE"
check $? "name: field present"

grep -q "^description:" "$SKILL_FILE"
check $? "description: field present"

grep -q "USE WHEN" "$SKILL_FILE"
check $? "USE WHEN triggers present"

! grep -q "^description: |" "$SKILL_FILE"
check $? "description is single-line"

# Section checks
grep -q "^## " "$SKILL_FILE"
check $? "Has section headers"

grep -qi "example" "$SKILL_FILE"
check $? "Has examples"

# Naming check (no uppercase in directory name)
DIRNAME=$(basename "$SKILL_DIR")
[[ "$DIRNAME" =~ ^[a-z0-9-]+$ ]]
check $? "Directory uses kebab-case: $DIRNAME"

# Depth check (max 2 levels)
DEPTH=$(find "$SKILL_DIR" -type d | awk -F/ '{print NF}' | sort -rn | head -1)
BASE_DEPTH=$(echo "$SKILL_DIR" | awk -F/ '{print NF}')
[ $((DEPTH - BASE_DEPTH)) -le 2 ]
check $? "Max 2 directory levels"

# No backups folder
[ ! -d "$SKILL_DIR/backups" ]
check $? "No backups/ subdirectory"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
```

## Resources

- [Create workflow](workflows/create.md) - Full skill creation process
- [Validate workflow](workflows/validate.md) - Detailed validation steps
- [Fix workflow](workflows/fix.md) - Canonicalization process
