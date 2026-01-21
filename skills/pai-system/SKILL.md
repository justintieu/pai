---
name: pai-system
description: Maintain PAI system health through integrity checks, documentation, and security scanning. USE WHEN integrity check, audit system, document session, document recent, git push, secret scan, privacy check, system maintenance, health check.
tools: Read, Edit, Write, Bash, Glob, Grep
---

# PAI System - Infrastructure Maintenance

Maintain PAI system health through structured workflows for integrity checking, session documentation, and security scanning.

## Workflows

| Workflow | Use When | File |
|----------|----------|------|
| **Integrity Check** | "integrity check", "audit system", "health check" | `workflows/integrity-check.md` |
| **Document Session** | "document session", "record work", "capture session" | `workflows/document-session.md` |
| **Document Recent** | "document recent", "catch up docs", "what's undocumented" | `workflows/document-recent.md` |
| **Git Push** | "push to pai", "commit changes", "sync pai" | `workflows/git-push.md` |
| **Secret Scan** | "secret scan", "credential check", "security scan" | `workflows/secret-scan.md` |
| **Privacy Check** | "privacy check", "pii scan", "data isolation" | `workflows/privacy-check.md` |
| **Context Recall** | "what did we do", "find previous work", "recall context" | `workflows/context-recall.md` |

## Quick Commands

```bash
# Run integrity check
pai-system integrity

# Document current session
pai-system document

# Scan for secrets before pushing
pai-system secrets ~/.pai

# Check for PII leakage
pai-system privacy
```

## Workflow Chains

Common workflow sequences:

1. **After Refactoring:** Integrity Check -> Document Session -> Git Push
2. **Session End:** Document Session -> Git Push
3. **Before Public Push:** Secret Scan -> Privacy Check -> Git Push
4. **Periodic Maintenance:** Integrity Check -> Document Recent -> Git Push

## Instructions

### Basic System Check

1. Run integrity check to find broken references
2. Review findings (critical vs warnings)
3. Fix any critical issues
4. Document the session if significant work was done
5. Push changes to PAI repository

### Security Workflow

1. Run secret scan on target directory
2. Run privacy check for PII
3. Review any findings
4. Remediate if necessary (rotate credentials, remove PII)
5. Re-scan to verify clean

## Examples

**Example 1: Run an integrity check**
```
User: "check pai system health"
Claude: Runs integrity check workflow
        Scans for broken references, outdated patterns
        Reports: "Found 2 warnings: outdated skill reference in index.md"
        Offers to fix issues
```

**Example 2: Document a work session**
```
User: "document what we did today"
Claude: Analyzes session context (changed files, goals, outcomes)
        Creates documentation entry in memory/
        Captures: what was done, why, future implications
        Commits to PAI repository
```

**Example 3: Security scan before pushing**
```
User: "scan for secrets before I push"
Claude: Runs secret scan on ~/.pai
        Checks for API keys, tokens, credentials
        Reports: "Clean - no secrets detected" or lists findings
        Recommends remediation if secrets found
```

**Example 4: Catch up on documentation**
```
User: "what changes haven't been documented?"
Claude: Finds last documented timestamp
        Retrieves git changes since then
        Categorizes: skills, workflows, config changes
        Generates documentation for each significant change
```

## Resources

- [Integrity Check](workflows/integrity-check.md) - Audit system references
- [Document Session](workflows/document-session.md) - Capture current work
- [Document Recent](workflows/document-recent.md) - Catch up on missed docs
- [Git Push](workflows/git-push.md) - Safe commit workflow
- [Secret Scan](workflows/secret-scan.md) - Credential detection
- [Privacy Check](workflows/privacy-check.md) - PII isolation
- [Context Recall](workflows/context-recall.md) - Find past work
