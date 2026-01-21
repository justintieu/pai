---
name: observe
description: Create ISC rows from user requests and context. First phase of the algorithm.
---

# OBSERVE Phase

Create ISC (Ideal State Criteria) rows from user requests and context.

## Purpose

Transform vague requests into specific, trackable success criteria by:
1. Parsing explicit requirements
2. Inferring from context and preferences
3. Adding implicit universal standards

## Process

### Step 1: Parse the Request

Identify explicit requirements directly stated by the user.

### Step 2: Load User Context

Consult available context for inference:
- Tech stack preferences
- Project conventions
- Previous patterns
- User definitions

### Step 3: Create Explicit Rows

For each direct requirement:
```
| ID | Description | Source | Status |
|----|-------------|--------|--------|
| 1 | [Direct requirement] | EXPLICIT | PENDING |
```

### Step 4: Create Inferred Rows

Add rows derived from:
- Tech preferences (language, framework choices)
- Existing patterns in codebase
- Session continuity (related previous work)
- User history and preferences

### Step 5: Create Implicit Rows

Add universal standards:
- Security (authentication, input validation, secrets handling)
- Testing (coverage, edge cases)
- Code quality (linting, formatting, documentation)
- Error handling (graceful failures, logging)

## Interview Protocol

When requirements lack clarity, use structured questions:

1. **Success definition**: "What would make this successful?"
2. **End-user identity**: "Who will use this and how?"
3. **Excellence bar**: "What would make this worth sharing?"
4. **Precedent**: "Any similar implementations to reference?"
5. **Anti-criteria**: "What should this explicitly NOT do?"

**When to interview:**
- Skip for specific, clear requests
- Full protocol for vague requests
- Selective questions based on work type

## Exit Criteria

- [ ] Minimum 2 ISC rows established
- [ ] User context consulted for inference
- [ ] Implicit standards included
- [ ] Unclear requests addressed through interview
- [ ] Each row has potential verification approach

## Example

**Request**: "Add user authentication"

**OBSERVE output**:

| ID | Description | Source | Status |
|----|-------------|--------|--------|
| 1 | Users can register with email/password | EXPLICIT | PENDING |
| 2 | Users can log in with credentials | EXPLICIT | PENDING |
| 3 | Session persists across page reloads | INFERRED | PENDING |
| 4 | Passwords hashed with bcrypt (per tech prefs) | INFERRED | PENDING |
| 5 | Failed logins don't reveal user existence | IMPLICIT | PENDING |
| 6 | Rate limiting on auth endpoints | IMPLICIT | PENDING |
| 7 | Tests cover happy path and edge cases | IMPLICIT | PENDING |
