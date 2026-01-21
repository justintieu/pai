---
name: isc-format
description: Reference for ISC (Ideal State Criteria) structure and lifecycle.
---

# ISC Format Reference

The ISC (Ideal State Criteria) is a central tracking document measuring progress between current and desired states.

## Core Structure

| Column | Description |
|--------|-------------|
| ID | Sequential number, remains constant |
| Description | Success criterion (refined through phases) |
| Source | EXPLICIT, INFERRED, or IMPLICIT |
| Status | PENDING, ACTIVE, DONE, ADJUSTED, BLOCKED |
| Parallel | [P] flag if can execute in parallel |
| Verify | Verification method (added in BUILD) |

## Source Categories

| Source | Definition | Example |
|--------|------------|---------|
| EXPLICIT | Directly stated by user | "Add a login button" |
| INFERRED | Derived from context/preferences | "Use bcrypt (per tech prefs)" |
| IMPLICIT | Universal standards | "Tests must pass" |

When uncertain, default to INFERRED.

## Status Progression

```
PENDING -> ACTIVE -> DONE | ADJUSTED | BLOCKED
```

| Status | Meaning |
|--------|---------|
| PENDING | Not yet started |
| ACTIVE | Currently being worked on |
| DONE | Completed, meets criteria |
| ADJUSTED | Completed with documented deviation |
| BLOCKED | Cannot proceed, needs resolution |

## ISC Lifecycle

```
CREATE (OBSERVE)
   |
   v
COMPLETE (THINK)
   |
   v
ORDER (PLAN)
   |
   v
REFINE (BUILD)
   |
   v
STATUS CHANGES (EXECUTE)
   |
   v
VERIFY RESULTS (VERIFY)
   |
   v
ARCHIVE (LEARN)
```

## Quality Guidelines

### Descriptions Should Be

| Good | Avoid |
|------|-------|
| Specific | Vague |
| Testable | Subjective |
| Outcome-focused | Process-focused |
| Single responsibility | Multiple concerns |

### Examples

| Vague | Specific |
|-------|----------|
| "Works well" | "Returns 200 status in < 200ms" |
| "User-friendly" | "Completes task in < 3 clicks" |
| "Secure" | "No OWASP Top 10 vulnerabilities" |
| "Good error handling" | "Returns {code, message} on all errors" |

## ISC Size

**ISC size is NOT strictly bounded by effort level.**

Complex problems can generate many rows:
- Research findings
- Anti-patterns to avoid
- Best practices
- Edge cases
- Verification criteria
- Security considerations

Typical ranges:
- QUICK: 2-4 rows
- STANDARD: 5-10 rows
- THOROUGH: 10-25 rows
- DETERMINED: 25-100+ rows

## Parallel Execution

Mark rows with `[P]` when they:
- Don't depend on other rows' output
- Don't modify the same files
- Can be verified independently

Assume independence unless clear dependencies exist.

## Example ISC

```
| ID | Description | Source | Status | [P] | Verify |
|----|-------------|--------|--------|-----|--------|
| 1 | Login returns JWT on valid creds | EXPLICIT | DONE | | Test |
| 2 | Login returns 401 on invalid creds | INFERRED | DONE | | Test |
| 3 | Logout destroys session | EXPLICIT | DONE | [P] | Test |
| 4 | Rate limit: 5 req/min per IP | IMPLICIT | ADJUSTED | [P] | Test |
| 5 | All passwords bcrypt hashed | IMPLICIT | DONE | | Review |
| 6 | No secrets in logs | IMPLICIT | DONE | | Grep |
```
