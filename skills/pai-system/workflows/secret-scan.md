# Secret Scan Workflow

Detect sensitive credentials and secrets before they leak.

## When to Use

- Before pushing to any repository
- Before pushing to PUBLIC repositories (critical)
- After adding new configuration files
- During security audits
- When onboarding new integrations

## Steps

### 1. Choose Scan Method

**Quick scan (built-in):**
```bash
# Pattern-based search for common secrets
grep -rE '(api[_-]?key|secret|password|token|private[_-]?key)' --include="*.md" --include="*.json" --include="*.yaml" --include="*.env" ~/.pai
```

**Thorough scan (TruffleHog):**
```bash
# If TruffleHog is installed
trufflehog filesystem ~/.pai --only-verified
```

### 2. Common Secret Patterns

| Type | Pattern | Example |
|------|---------|---------|
| API Key | `[A-Za-z0-9_-]{20,}` | `sk_live_abc123...` |
| AWS Key | `AKIA[0-9A-Z]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| GitHub Token | `ghp_[a-zA-Z0-9]{36}` | `ghp_xxxx...` |
| OpenAI Key | `sk-[a-zA-Z0-9]{48}` | `sk-xxxx...` |
| Anthropic Key | `sk-ant-[a-zA-Z0-9-]+` | `sk-ant-xxxx...` |
| Private Key | `-----BEGIN.*PRIVATE KEY-----` | RSA/EC keys |
| Password in URL | `://[^:]+:[^@]+@` | `postgres://user:pass@host` |

### 3. Scan Target Directory

```bash
TARGET="${1:-$HOME/.pai}"

echo "Scanning: $TARGET"

# Check for .env files
find "$TARGET" -name ".env*" -type f

# Check for key files
find "$TARGET" -name "*.pem" -o -name "*.key" -o -name "*credentials*"

# Check for hardcoded secrets
grep -rn --include="*.md" --include="*.json" --include="*.yaml" \
  -E '(sk-|sk_live_|AKIA|ghp_|gho_|-----BEGIN)' "$TARGET"
```

### 4. Categorize Findings

**Verified Secrets (Critical):**
- Credentials that appear active/valid
- Keys with known prefixes (sk-, AKIA, ghp_)
- Private key files

**Potential Secrets (Warning):**
- Generic "password" or "secret" fields
- Base64 encoded strings
- Long random-looking strings

**False Positives (Info):**
- Example/placeholder values
- Documentation references
- Test fixtures

### 5. Report Format

```markdown
## Secret Scan Report

**Target:** ~/.pai
**Date:** YYYY-MM-DD
**Status:** [CLEAN | FINDINGS]

### Critical Findings (N)

| File | Line | Type | Action |
|------|------|------|--------|
| config.json | 15 | API Key | Rotate immediately |

### Warnings (N)

| File | Line | Type | Action |
|------|------|------|--------|
| notes.md | 42 | Password field | Review if real |

### Recommendation

[SAFE TO PUSH | DO NOT PUSH - Remediate first]
```

### 6. Remediation

If secrets are found:

1. **Rotate the credential immediately**
   - Generate new key at the source
   - Update secure storage (not in repo)

2. **Remove from code**
   - Delete or replace with placeholder
   - Use environment variables instead

3. **Clean git history** (if committed)
   ```bash
   # Use BFG Repo-Cleaner
   bfg --delete-files "*.pem" --no-blob-protection .
   bfg --replace-text passwords.txt --no-blob-protection .
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   ```

4. **Prevent future leaks**
   - Add to .gitignore
   - Set up pre-commit hooks
   - Use secret manager

### 7. Prevention

Add to `.gitignore`:
```
# Secrets
.env
.env.*
*.pem
*.key
*credentials*
secrets/
```

## Quick Commands

```bash
# Quick scan for common patterns
grep -rE '(sk-|AKIA|ghp_|-----BEGIN)' ~/.pai

# Find suspicious files
find ~/.pai -name "*.env" -o -name "*.pem" -o -name "*secret*"

# Check git history for secrets (last 10 commits)
git log -p -10 | grep -iE '(api.?key|secret|password|token)'
```

## Integration

Run before:
- Git Push workflow
- Any public repository push
- Sharing PAI configurations

Consider running after:
- Adding new API integrations
- Modifying configuration files
- Importing external content
