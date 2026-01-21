# Git Push Workflow

Safely commit and push changes to the PAI repository.

## When to Use

- After documenting a session
- After fixing integrity issues
- After any significant PAI changes
- As final step in workflow chains

## Safety Checks

Before any git operations, verify:

1. **Correct directory:** Working in `~/.pai` (your PAI installation)
2. **Correct remote:** Pointing to your private repo, not a public template
3. **No secrets:** No credentials in staged changes

## Steps

### 1. Verify Location

```bash
PAI_ROOT=~/.pai
cd "$PAI_ROOT"

# Confirm we're in the right place
[ -f "CLAUDE.md" ] || echo "ERROR: Not in PAI root"
```

### 2. Check Remote

```bash
# Show current remote
git remote -v

# Verify it's your private repo (should NOT be a public template)
REMOTE=$(git remote get-url origin)
echo "Remote: $REMOTE"

# WARNING if pointing to public template
if echo "$REMOTE" | grep -q "danielmiessler\|template"; then
  echo "WARNING: Remote appears to be a public template!"
  echo "Aborting - verify remote before pushing"
  exit 1
fi
```

### 3. Review Changes

```bash
# See what's changed
git status

# See diff of changes
git diff --stat

# Review specific files if needed
git diff [file]
```

### 4. Check for Secrets

Before staging, scan for sensitive content:

```bash
# Quick check for common patterns
git diff --staged | grep -iE '(api[_-]?key|secret|password|token|credential)'

# If any matches, review carefully before committing
```

For thorough scanning, run Secret Scan workflow first.

### 5. Stage Changes

```bash
# Stage specific files
git add path/to/file

# Or stage all changes (after review)
git add -A

# Review what's staged
git status
```

### 6. Commit

```bash
# Commit with descriptive message
git commit -m "type: brief description

- Detail 1
- Detail 2"
```

**Commit message format:**
- `feat:` New feature or skill
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code restructuring
- `chore:` Maintenance tasks

### 7. Final Verification

```bash
# One more check before push
git log -1 --stat

# Verify remote again
git remote -v
```

### 8. Push

```bash
# Push to remote
git push origin main
```

## Commit Message Examples

```
feat: add pai-system skill for maintenance

- Ported from Miessler's pai-system-skill
- Added integrity check, document session workflows
- Adapted to our kebab-case conventions
```

```
docs: document recent skill additions

- Added session docs for pai-council port
- Updated skills index with new entries
```

```
fix: correct broken reference in pai-validate

- Fixed link to workflows/create.md
- Verified all references resolve
```

## Safety Rules

**Never:**
- Force push to main
- Push without reviewing changes
- Push credentials or secrets
- Push to wrong remote

**Always:**
- Verify remote before pushing
- Review staged changes
- Use descriptive commit messages
- Run secret scan for sensitive repos

## Integration with Other Workflows

This workflow is typically the final step:

1. **Integrity Check** -> Document Session -> **Git Push**
2. **Document Session** -> **Git Push**
3. **Document Recent** -> **Git Push**
4. **Secret Scan** -> Privacy Check -> **Git Push**
