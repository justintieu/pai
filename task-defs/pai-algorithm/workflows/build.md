---
name: build
description: Refine ISC rows to ensure testability with specific verification methods.
---

# BUILD Phase

Refine ISC rows to ensure testability with specific verification methods.

## Purpose

Transform requirements into verifiable specifications:
- Make outcomes measurable
- Define success criteria
- Document verification methods

## Process

### Step 1: Review Each Row

For each row, ask: **"Is this specific enough to verify?"**

### Step 2: Add Success Criteria

Each row should have:
- Clear pass/fail conditions
- Measurable outcomes
- Objective completion criteria

### Step 3: Define Verification Methods

Assign verification approach to each row:

| Method | When to Use |
|--------|-------------|
| Automated test | Logic, calculations, state changes |
| Type checking | Interface contracts, schema validation |
| Visual verification | UI appearance, layout |
| Manual testing | User flows, integration |
| Performance measurement | Speed, resource usage |
| Security scan | Vulnerabilities, compliance |

### Step 4: Refine Vague Rows

| Vague | Specific |
|-------|----------|
| "Works well" | "Response time < 200ms under 100 concurrent users" |
| "Looks good" | "Matches Figma design, passes visual diff" |
| "Secure" | "Passes OWASP Top 10 checks, no high-severity findings" |
| "User-friendly" | "Task completion in < 3 clicks, zero errors in usability test" |
| "Scalable" | "Handles 10x current load with < 500ms p99 latency" |

## Testability Checklist

Before advancing, every row should satisfy:

- [ ] A test can be written for it
- [ ] Visual verification is possible (if UI)
- [ ] Measurable outcomes exist
- [ ] Completion is objectively determinable

## Exit Criteria

- [ ] All rows have clear success criteria
- [ ] Verification method identified for each row
- [ ] No ambiguous completion conditions
- [ ] Ready for EXECUTE phase

## Example

**Before BUILD**:
| ID | Description | Verify |
|----|-------------|--------|
| 1 | Login works | ? |
| 2 | Logout works | ? |
| 3 | Good error messages | ? |

**After BUILD**:
| ID | Description | Success Criteria | Verify |
|----|-------------|------------------|--------|
| 1 | Login works | Valid creds return 200 + token; invalid return 401 | Automated test |
| 2 | Logout works | Session destroyed; subsequent requests return 401 | Automated test |
| 3 | Good error messages | Error responses include code, message, and field (if applicable) | Schema validation |
