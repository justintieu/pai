---
name: learn
description: Present completed work for user evaluation and capture learnings.
---

# LEARN Phase

Present completed work for user evaluation and capture learnings.

## Purpose

Final phase of the algorithm:
- Present deliverables for user review
- Document what was accomplished
- Capture learnings for future work
- Determine if iteration is needed

## Critical Principle

**NO SELF-RATING**

The assistant does NOT rate its own work. Present results objectively and let the user evaluate quality.

**Prohibited:**
- "I did a great job on this"
- "This is 8/10 quality"
- "The implementation is excellent"

**Allowed:**
- "Here's what was implemented"
- "All verification criteria passed"
- "These items were adjusted: [reasons]"

## Process

### Step 1: Present Final ISC

Show completed ISC with all statuses:

```
| ID | Description | Status | Verification |
|----|-------------|--------|--------------|
| 1 | Login endpoint | DONE | PASS |
| 2 | Logout endpoint | DONE | PASS |
| 3 | Error handling | DONE | ADJUSTED |
```

### Step 2: List Deliverables

Enumerate concrete outputs:
- Files created/modified
- Features implemented
- Tests added
- Documentation updated

### Step 3: Document Capabilities Used

For STANDARD+ effort, note which capabilities were deployed:
- Deep thinking: [where/why]
- Research: [what was learned]
- Council: [key insights]
- First principles: [assumptions challenged]

### Step 4: Determine Next Steps

Based on verification results:

| Situation | Action |
|-----------|--------|
| All PASS | Archive, work complete |
| ADJUSTED items | Document, work complete |
| BLOCKED items | Iterate or escalate |

### Step 5: Capture Learnings

For memory/future reference:
- What worked well?
- What was harder than expected?
- Any patterns to remember?

## Output Format

```
## Results

### Completed ISC
[Final ISC table]

### Deliverables
- [List of concrete outputs]

### Verification Summary
- PASS: X
- ADJUSTED: Y (with reasons)
- BLOCKED: Z (if any)

### Capabilities Used
[For STANDARD+ effort]

### Notes
[Any relevant context for future work]
```

## Exit Criteria

- [ ] Final ISC displayed
- [ ] Deliverables enumerated
- [ ] Verification summary provided
- [ ] No self-rating included
- [ ] Ready for user evaluation

## Iteration Decision

If BLOCKED items exist:

| Blocker Type | Return To |
|--------------|-----------|
| Implementation bug | EXECUTE |
| Missing requirement | THINK |
| Wrong approach | PLAN |
| Unclear criteria | BUILD |
| Fundamental issue | OBSERVE |

## Example

```
## Results

### Completed ISC
| ID | Description | Status | Verification |
|----|-------------|--------|--------------|
| 1 | User registration | DONE | PASS |
| 2 | Login endpoint | DONE | PASS |
| 3 | Logout endpoint | DONE | PASS |
| 4 | Password hashing | DONE | PASS |
| 5 | Session management | DONE | PASS |
| 6 | Rate limiting | DONE | ADJUSTED |
| 7 | Auth tests | DONE | PASS |

### Deliverables
- Created: src/models/user.ts
- Created: src/controllers/auth.ts
- Created: src/middleware/session.ts
- Created: src/utils/password.ts
- Modified: src/routes/index.ts
- Created: tests/auth.test.ts

### Verification Summary
- PASS: 6
- ADJUSTED: 1 (Rate limit set to 10/min per product requirement)
- BLOCKED: 0

### Notes
- Used bcrypt for password hashing (per tech preferences)
- Session stored in Redis (per existing infrastructure)
```
