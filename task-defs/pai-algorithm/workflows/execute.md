---
name: execute
description: Implement ISC rows using appropriate capabilities for the effort level.
---

# EXECUTE Phase

Implement ISC rows using appropriate capabilities for the effort level.

## Purpose

Operationalize the plan:
- Execute rows in planned order
- Use capabilities appropriate to effort level
- Track status transitions

## Status Progression

```
PENDING -> ACTIVE -> DONE | ADJUSTED | BLOCKED
```

- **ACTIVE**: Mark when starting work on a row
- **DONE**: Row completed, meets success criteria
- **ADJUSTED**: Completed with documented deviation
- **BLOCKED**: Cannot proceed, needs resolution

## Execution by Effort Level

### QUICK
- Direct implementation
- No sub-agents
- Inline verification

### STANDARD
- Deep thinking for complex decisions
- Single research query if needed
- Sequential execution

### THOROUGH
- Council debate for major decisions
- Parallel execution where marked [P]
- First principles analysis for assumptions
- Multiple research queries

### DETERMINED
- Unlimited iteration until success
- Adversarial review of solutions
- Red team challenges
- Parallel agents for independent work

## Process

### Step 1: Execute Parallel Rows

For rows marked [P] in same group:
- Start all simultaneously
- Track individual status
- Proceed when all complete

### Step 2: Execute Sequential Rows

For dependent rows:
- Complete prerequisites first
- Verify before proceeding
- Update status immediately

### Step 3: Handle Blockers

When a row becomes BLOCKED:
1. Document the blocker
2. Determine if it blocks other rows
3. Either resolve or escalate
4. Consider returning to earlier phase

### Step 4: Track Progress

Update ISC after each row:

| ID | Description | Status | Notes |
|----|-------------|--------|-------|
| 1 | Create user model | DONE | |
| 2 | Add auth controller | ACTIVE | In progress |
| 3 | Login endpoint | PENDING | Waiting on 2 |

## Capability Reference

| Capability | Effort Level | Use Case |
|------------|--------------|----------|
| Direct implementation | All | Standard coding tasks |
| Deep thinking | STANDARD+ | Complex logic, architecture |
| First principles | THOROUGH+ | Challenge assumptions |
| Council debate | THOROUGH+ | Major decisions, tradeoffs |
| Research | STANDARD+ | External information needs |
| Parallel execution | THOROUGH+ | Independent work streams |
| Adversarial review | DETERMINED | Critical path validation |

## Exit Criteria

- [ ] All rows reach terminal status (DONE/ADJUSTED/BLOCKED)
- [ ] No rows remain PENDING or ACTIVE
- [ ] Capabilities executed in planned order
- [ ] BLOCKED items documented with reason

## Example

**Execution trace**:
```
[Group 1 - Parallel]
  Row 1 (user model): PENDING -> ACTIVE -> DONE
  Row 3 (password util): PENDING -> ACTIVE -> DONE
  Row 6 (session middleware): PENDING -> ACTIVE -> DONE

[Group 2 - Sequential]
  Row 2 (auth controller): PENDING -> ACTIVE -> DONE

[Group 3 - Parallel]
  Row 4 (login endpoint): PENDING -> ACTIVE -> DONE
  Row 5 (logout endpoint): PENDING -> ACTIVE -> DONE

[Group 4 - Sequential]
  Row 7 (auth tests): PENDING -> ACTIVE -> DONE

All rows complete. Advancing to VERIFY.
```
