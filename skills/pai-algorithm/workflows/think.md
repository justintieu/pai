---
name: think
description: Complete ISC rows by identifying and filling gaps in requirements.
---

# THINK Phase

Complete ISC rows by identifying and filling gaps in requirements.

## Purpose

Review existing rows for completeness:
- Check for missing elements
- Refine vague descriptions
- Consider edge cases
- Anticipate failure scenarios

## Process

### Step 1: Review Existing Rows

For each row, ask:
- Is this specific enough to implement?
- Is this specific enough to verify?
- What could go wrong?

### Step 2: Identify Gaps

Check the completeness checklist:

| Area | Question |
|------|----------|
| Explicit requirements | All user asks captured? |
| Tech stack alignment | Matches project conventions? |
| Security measures | Attack vectors considered? |
| Error handling | Failure modes addressed? |
| Edge cases | Boundary conditions covered? |
| Testing clarity | Know how to verify? |
| Performance | Acceptable parameters defined? |
| Deployment | Integration points clear? |

### Step 3: Add Missing Rows

Create new rows for identified gaps.

### Step 4: Refine Descriptions

Transform vague to specific:

| Before | After |
|--------|-------|
| "Works well" | "Response time < 200ms" |
| "Looks good" | "Matches design mockup" |
| "Secure" | "No XSS, SQL injection, or CSRF" |
| "Handles errors" | "Returns structured error with code and message" |

### Step 5: Consider Deeper Analysis

For THOROUGH+ effort, consider:
- **First Principles**: Challenge assumptions about requirements
- **Council**: Multiple perspectives on architecture decisions

## Exit Criteria

- [ ] All rows are precise and specific
- [ ] Obvious gaps eliminated
- [ ] Edge cases addressed
- [ ] Ready for PLAN phase

## Example

**Before THINK**:
| ID | Description | Source | Status |
|----|-------------|--------|--------|
| 1 | Users can logout | EXPLICIT | PENDING |

**After THINK**:
| ID | Description | Source | Status |
|----|-------------|--------|--------|
| 1 | Logout button visible when authenticated | EXPLICIT | PENDING |
| 2 | Click destroys server session | INFERRED | PENDING |
| 3 | Click clears client tokens/cookies | INFERRED | PENDING |
| 4 | Redirects to login page after logout | INFERRED | PENDING |
| 5 | Logout works even if server unreachable | IMPLICIT | PENDING |
| 6 | Cannot access protected routes after logout | IMPLICIT | PENDING |
| 7 | Verify: Click logout, attempt protected route | IMPLICIT | PENDING |
