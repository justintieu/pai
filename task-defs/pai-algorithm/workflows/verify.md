---
name: verify
description: Test ISC rows against their success criteria from BUILD phase.
---

# VERIFY Phase

Test ISC rows against their success criteria from BUILD phase.

## Purpose

Quality assurance checkpoint:
- Execute verification methods defined in BUILD
- Compare actual results to success criteria
- Document outcomes

## Verification Principles

- **Independence**: Verify with fresh perspective, not confirmation bias
- **Skepticism**: Actively look for failures, not just successes
- **Objectivity**: Use defined criteria, not subjective assessment

## Process

### Step 1: Execute Verification Methods

For each row, run the verification method defined in BUILD:

| Method | Execution |
|--------|-----------|
| Automated test | Run test suite, check pass/fail |
| Type checking | Run type checker, verify no errors |
| Visual verification | Compare to design, check alignment |
| Manual testing | Execute user flow, verify behavior |
| Performance measurement | Run benchmarks, compare to criteria |
| Security scan | Run security tools, review findings |

### Step 2: Record Results

For each row, determine outcome:

| Outcome | Criteria |
|---------|----------|
| **PASS** | Meets all success criteria |
| **ADJUSTED** | Acceptable deviation, documented reason |
| **BLOCKED** | Does not meet criteria, needs resolution |

### Step 3: Document Gaps

For ADJUSTED or BLOCKED rows:
- What was expected?
- What was actual?
- Why is deviation acceptable (ADJUSTED) or problematic (BLOCKED)?

### Step 4: Handle Failures

When verification fails:
1. Determine root cause
2. Return to appropriate phase:
   - EXECUTE: Implementation issue
   - BUILD: Criteria unclear
   - PLAN: Dependency issue
   - THINK: Missing requirement

## Exit Criteria

- [ ] All rows verified against success criteria
- [ ] Results documented (PASS/ADJUSTED/BLOCKED)
- [ ] BLOCKED items have documented reason
- [ ] Ready for LEARN phase or iteration

## Verification Report Format

```
## Verification Results

| ID | Description | Expected | Actual | Result |
|----|-------------|----------|--------|--------|
| 1 | Login returns token | 200 + JWT | 200 + JWT | PASS |
| 2 | Invalid login returns 401 | 401 | 401 | PASS |
| 3 | Rate limiting | 5 req/min | 10 req/min | ADJUSTED* |

*ADJUSTED: Rate limit set to 10/min per product decision (doc: PROJ-123)

### Summary
- PASS: 2
- ADJUSTED: 1
- BLOCKED: 0

All criteria met. Ready for LEARN phase.
```

## Example

**Verification execution**:
```
Row 1: Login endpoint
  Method: Automated test
  Expected: Valid creds return 200 + token
  Actual: 200 + JWT token returned
  Result: PASS

Row 2: Logout endpoint
  Method: Automated test
  Expected: Session destroyed, subsequent 401
  Actual: Session destroyed, subsequent 401
  Result: PASS

Row 3: Error messages
  Method: Schema validation
  Expected: {code, message, field?}
  Actual: {code, message} (field missing on non-field errors)
  Result: ADJUSTED (field correctly optional)

All rows verified. Advancing to LEARN.
```
