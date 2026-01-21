---
name: plan
description: Order ISC rows for execution by identifying dependencies and marking parallel work.
---

# PLAN Phase

Order ISC rows for execution by identifying dependencies and marking parallel work.

## Purpose

Determine execution sequence:
- Map dependencies between rows
- Identify parallelization opportunities
- Create execution groups

## Process

### Step 1: Map Dependencies

For each row, identify:
- What must complete before this row?
- What does this row enable?

### Step 2: Flag Parallel Work

Mark rows with `[P]` when they:
- Don't depend on other rows' output
- Don't modify the same files
- Can be verified independently

### Step 3: Create Execution Groups

Group rows into sequential batches:

```
Group 1: [P] rows 1, 2, 3 (parallel)
Group 2: row 4 (depends on 1)
Group 3: [P] rows 5, 6 (parallel, depend on 4)
Group 4: row 7 (final verification)
```

### Step 4: Identify Blockers

Flag any rows that:
- Have unclear dependencies
- Require external input
- Have circular dependencies

## Parallelization Criteria

| Qualifies for Parallel | Does NOT Qualify |
|------------------------|------------------|
| Independent research tasks | Sequential data transformations |
| Isolated file modifications | Shared state mutations |
| Separate test suites | Integration tests |
| Unrelated UI components | Parent-child components |

## Exit Criteria

- [ ] Dependencies fully identified
- [ ] Parallel opportunities marked with [P]
- [ ] Execution sequence determined
- [ ] No blocking issues remain (or escalated)

## Example

**Input ISC**:
| ID | Description | Status |
|----|-------------|--------|
| 1 | Create user model | PENDING |
| 2 | Create auth controller | PENDING |
| 3 | Add password hashing utility | PENDING |
| 4 | Implement login endpoint | PENDING |
| 5 | Implement logout endpoint | PENDING |
| 6 | Add session middleware | PENDING |
| 7 | Write auth tests | PENDING |

**After PLAN**:
| ID | Description | Status | Parallel | Group |
|----|-------------|--------|----------|-------|
| 1 | Create user model | PENDING | [P] | 1 |
| 3 | Add password hashing utility | PENDING | [P] | 1 |
| 6 | Add session middleware | PENDING | [P] | 1 |
| 2 | Create auth controller | PENDING | | 2 |
| 4 | Implement login endpoint | PENDING | [P] | 3 |
| 5 | Implement logout endpoint | PENDING | [P] | 3 |
| 7 | Write auth tests | PENDING | | 4 |

**Execution order**: Group 1 (parallel) -> Group 2 -> Group 3 (parallel) -> Group 4
