# Integrity Check Workflow

Find and fix broken references across the PAI system.

## When to Use

- After major refactoring
- Before PAI updates
- During periodic health checks
- When something feels broken

## Steps

### 1. Scan Core Areas

Check these system areas for issues:

```bash
PAI_ROOT=~/.pai

# Areas to audit
AREAS=(
  "skills"      # Skill definitions and workflows
  "agents"      # Agent definitions
  "context"     # Identity and preferences
  "memory"      # Learnings and work status
  "commands"    # Slash command definitions
  "hooks"       # Lifecycle automation
  "tools"       # Tool configurations
)
```

### 2. Check for Broken References

For each area, look for:

**File references that don't exist:**
```bash
# Find markdown links and check they resolve
grep -roh '\[.*\]([^)]*\.md)' "$PAI_ROOT" | \
  grep -oE '\([^)]+\)' | tr -d '()' | \
  while read ref; do
    [ -f "$PAI_ROOT/$ref" ] || echo "Missing: $ref"
  done
```

**Skills referenced in index but missing:**
```bash
# Check skills/index.md references
grep -oE 'skills/[a-z0-9-]+' "$PAI_ROOT/skills/index.md" | \
  while read skill; do
    [ -d "$PAI_ROOT/$skill" ] || echo "Missing skill: $skill"
  done
```

**Outdated patterns:**
```bash
# Look for old conventions (TitleCase, etc.)
find "$PAI_ROOT" -name "*.md" -exec grep -l '[A-Z][a-z]*[A-Z]' {} \;
```

### 3. Check Skill Validity

For each skill directory:

```bash
for skill_dir in "$PAI_ROOT/skills"/*/; do
  skill_file="$skill_dir/SKILL.md"

  # Check SKILL.md exists
  [ -f "$skill_file" ] || echo "Missing SKILL.md: $skill_dir"

  # Check frontmatter
  grep -q "^name:" "$skill_file" || echo "Missing name: $skill_dir"
  grep -q "^description:" "$skill_file" || echo "Missing description: $skill_dir"
  grep -q "USE WHEN" "$skill_file" || echo "Missing triggers: $skill_dir"
done
```

### 4. Categorize Findings

**Critical Issues** (functionality-breaking):
- Missing SKILL.md files
- Broken file references in active workflows
- Missing required frontmatter

**Warnings** (outdated but functional):
- TitleCase naming
- Missing optional sections (examples)
- Unused files

### 5. Generate Report

```markdown
## Integrity Check Report

**Date:** YYYY-MM-DD
**Scope:** ~/.pai

### Critical Issues (N)
- [ ] Issue 1 - File/Location
- [ ] Issue 2 - File/Location

### Warnings (N)
- [ ] Warning 1 - File/Location
- [ ] Warning 2 - File/Location

### Clean Areas
- skills/ - No issues
- agents/ - No issues

### Recommended Actions
1. Fix critical issue 1
2. Fix critical issue 2
```

### 6. Optional: Save Report

```bash
REPORT_DIR="$PAI_ROOT/memory/state/integrity"
mkdir -p "$REPORT_DIR"
# Save report to $REPORT_DIR/YYYY-MM-DD.md
```

## Checklist

| Check | Description |
|-------|-------------|
| Skill SKILL.md | Every skill has SKILL.md |
| Skill frontmatter | name, description, USE WHEN |
| File references | All links resolve |
| Index entries | Skills in index exist |
| Naming conventions | kebab-case throughout |
| Agent definitions | Required fields present |
| Command definitions | Valid structure |

## Next Steps

After integrity check:
1. Fix any critical issues
2. Document fixes with Document Session workflow
3. Commit with Git Push workflow
