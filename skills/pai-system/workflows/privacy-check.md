# Privacy Check Workflow

Validate that personally identifiable information (PII) remains isolated in protected directories.

## When to Use

- Before pushing to public repositories
- During security audits
- After bulk content imports
- When sharing PAI configurations
- Periodic privacy reviews

## Protected Directories

These directories may contain sensitive personal data:

| Directory | Contains |
|-----------|----------|
| `~/.pai/context/` | Personal identity, preferences |
| `~/.pai/memory/` | Personal learnings, work history |
| `~/.pai/workspaces/` | Project-specific data |

Data from these areas should NOT appear in:
- Skills (shareable)
- Agents (shareable)
- Commands (shareable)
- Public repositories

## Steps

### 1. Define PII Patterns

```bash
# Common PII patterns to detect
PII_PATTERNS=(
  '[0-9]{3}-[0-9]{2}-[0-9]{4}'           # SSN
  '[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}'  # Credit card
  '[0-9]{2}-[0-9]{7}'                     # EIN
  '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'   # Email
  '[0-9]{3}[- .]?[0-9]{3}[- .]?[0-9]{4}' # Phone
)
```

### 2. Scan Non-Protected Areas

```bash
PAI_ROOT=~/.pai

# Directories that should be clean (shareable)
SHAREABLE=(
  "$PAI_ROOT/skills"
  "$PAI_ROOT/agents"
  "$PAI_ROOT/commands"
)

for dir in "${SHAREABLE[@]}"; do
  echo "Scanning: $dir"

  # Check for PII patterns
  grep -rE '([0-9]{3}-[0-9]{2}-[0-9]{4}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})' "$dir"
done
```

### 3. Check for Personal Identifiers

Look for hardcoded personal information:

```bash
# Names (customize for your context)
grep -ri "your-name\|your-email" ~/.pai/skills ~/.pai/agents

# Addresses, phone numbers
grep -rE '[0-9]{3}[- .]?[0-9]{3}[- .]?[0-9]{4}' ~/.pai/skills

# Account numbers, IDs
grep -rE '[0-9]{8,}' ~/.pai/skills --include="*.md"
```

### 4. Verify Data Isolation

```bash
# Check that protected content hasn't leaked to shareable areas

# Extract unique identifiers from protected areas
PROTECTED_IDS=$(grep -rohE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' ~/.pai/context ~/.pai/memory 2>/dev/null | sort -u)

# Search for them in shareable areas
for id in $PROTECTED_IDS; do
  if grep -rq "$id" ~/.pai/skills ~/.pai/agents 2>/dev/null; then
    echo "LEAK DETECTED: $id found in shareable area"
  fi
done
```

### 5. Cross-Repository Check

If maintaining both private and public PAI repos:

```bash
PUBLIC_REPO=~/Projects/PAI  # Adjust path

# Ensure no private paths referenced
grep -r "~/.pai\|/Users/.*/.pai" "$PUBLIC_REPO"

# Check for personal identifiers
grep -ri "your-real-name" "$PUBLIC_REPO"
```

### 6. Report Format

```markdown
## Privacy Check Report

**Target:** ~/.pai
**Date:** YYYY-MM-DD
**Status:** [CLEAN | FINDINGS]

### Shareable Areas Scanned
- [x] skills/ - Clean
- [x] agents/ - Clean
- [ ] commands/ - 1 finding

### Findings

| Location | Type | Content | Severity |
|----------|------|---------|----------|
| agents/helper.md | Email | user@example.com | Medium |

### Cross-Contamination
- No protected data found in shareable areas

### Recommendations
1. Replace email with placeholder
2. Review before sharing
```

### 7. Remediation

If PII is found in shareable areas:

1. **Remove or replace**
   - Use placeholders: `user@example.com`, `YOUR_NAME`
   - Move to protected directory if needed

2. **Clean git history** (if committed)
   ```bash
   bfg --replace-text sensitive-strings.txt --no-blob-protection .
   ```

3. **Prevent future leaks**
   - Add pre-commit check
   - Document what goes where
   - Review before sharing

## Quick Commands

```bash
# Quick PII scan of shareable areas
grep -rE '([0-9]{3}-[0-9]{2}-[0-9]{4}|[0-9]{3}[- .]?[0-9]{3}[- .]?[0-9]{4})' ~/.pai/skills ~/.pai/agents

# Find email addresses
grep -rohE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' ~/.pai/skills

# Check for your actual name (customize)
grep -ri "$(whoami)" ~/.pai/skills ~/.pai/agents
```

## Integration

Run privacy check:
- Before Secret Scan (different scope)
- Before Git Push to public repos
- As part of pre-share review

Combine with:
- Secret Scan (credentials)
- Cross-Repo Validation (if applicable)
