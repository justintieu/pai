# Validate Skill Workflow

Audit an existing skill against our PAI conventions.

## Steps

### 1. Locate the Skill

```bash
SKILL_DIR="~/.pai/skills/skill-name"
SKILL_FILE="$SKILL_DIR/SKILL.md"
```

### 2. Check File Existence

```bash
# Required
[ -f "$SKILL_FILE" ] && echo "PASS: SKILL.md exists"

# Optional directories (not required, but if present should follow conventions)
[ -d "$SKILL_DIR/workflows" ] && echo "INFO: Has workflows/"
[ -d "$SKILL_DIR/tools" ] && echo "INFO: Has tools/"
[ -d "$SKILL_DIR/reference" ] && echo "INFO: Has reference/"
```

### 3. Validate Frontmatter

**Check: name field exists**
```bash
grep -q "^name:" "$SKILL_FILE"
```

**Check: description field exists**
```bash
grep -q "^description:" "$SKILL_FILE"
```

**Check: description is single-line (no multiline pipe)**
```bash
! grep -q "^description: |" "$SKILL_FILE"
```

**Check: USE WHEN triggers present**
```bash
grep -q "USE WHEN" "$SKILL_FILE"
```

**Check: name matches directory**
```bash
SKILL_NAME=$(grep "^name:" "$SKILL_FILE" | cut -d: -f2 | tr -d ' ')
DIR_NAME=$(basename "$SKILL_DIR")
[ "$SKILL_NAME" = "$DIR_NAME" ]
```

### 4. Validate Naming Conventions

**Check: Directory uses kebab-case**
```bash
DIR_NAME=$(basename "$SKILL_DIR")
[[ "$DIR_NAME" =~ ^[a-z0-9-]+$ ]]
```

**Check: Workflow files use kebab-case (if workflows/ exists)**
```bash
if [ -d "$SKILL_DIR/workflows" ]; then
  ls "$SKILL_DIR/workflows/" | while read f; do
    [[ "$f" =~ ^[a-z0-9-]+\.md$ ]] || echo "FAIL: $f not kebab-case"
  done
fi
```

### 5. Validate Structure

**Check: Max 2 directory levels**
```bash
DEPTH=$(find "$SKILL_DIR" -type d | awk -F/ '{print NF}' | sort -rn | head -1)
BASE_DEPTH=$(echo "$SKILL_DIR" | awk -F/ '{print NF}')
[ $((DEPTH - BASE_DEPTH)) -le 2 ]
```

**Check: No backups/ subdirectory**
```bash
[ ! -d "$SKILL_DIR/backups" ]
```

### 6. Validate Content

**Check: Has section headers**
```bash
grep -q "^## " "$SKILL_FILE"
```

**Check: Has Instructions or Workflows section**
```bash
grep -qi "^## instruction\|^## workflow" "$SKILL_FILE"
```

**Check: Has Examples section**
```bash
grep -qi "^## example" "$SKILL_FILE"
```

**Check: All referenced files exist**
```bash
# Extract file references like (workflows/name.md) and check they exist
grep -oE '\([^)]+\.md\)' "$SKILL_FILE" | tr -d '()' | while read ref; do
  [ -f "$SKILL_DIR/$ref" ] || echo "FAIL: Missing $ref"
done
```

### 7. Report Results

Format output as:

```
=== Validating: skill-name ===

[PASS] SKILL.md exists
[PASS] name: field present
[PASS] description: field present
[PASS] description is single-line
[PASS] Directory uses kebab-case
[PASS] Max 2 directory levels
[FAIL] Missing examples section

=== Results: 6 passed, 1 failed ===
```

## Validation Checklist

| Check | Rule | Severity |
|-------|------|----------|
| SKILL.md exists | Required at skill root | Error |
| name: present | Required in frontmatter | Error |
| description: present | Required in frontmatter | Error |
| USE WHEN present | Trigger phrases required | Error |
| description single-line | No multiline `\|` syntax | Error |
| name matches directory | Must be identical | Error |
| kebab-case naming | Directories and files | Error |
| Max 2 levels deep | No deeply nested folders | Error |
| No backups/ folder | Keep backups elsewhere | Warning |
| Has ## sections | At least one section header | Error |
| Has Instructions/Workflows | How to use the skill | Warning |
| Has Examples | At least 2 examples | Warning |
| Referenced files exist | All links resolve | Error |

## Common Issues

| Issue | Fix |
|-------|-----|
| TitleCase directory | Rename to kebab-case |
| Multiline description | Collapse to single line |
| Missing examples | Add 2+ usage examples |
| Deep nesting | Flatten to max 2 levels |
| name/directory mismatch | Update name: to match directory |
