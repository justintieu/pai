---
name: pai-algorithm
description: Universal execution engine using structured scientific methodology to transform requests into exceptional results. Classifies task complexity into effort levels and unlocks progressively more powerful capabilities. USE WHEN complex task, multi-step work, execute thoroughly, execute determined, run the algorithm, systematic approach, structured execution, need rigor.
tools: [Read, Write, Edit, Task, Bash, Glob, Grep]
requires: [pai-council, pai-firstprinciples]
---

# The Algorithm - Universal Execution Engine

A comprehensive execution framework that transforms requests into exceptional results through structured, scientific methodology. The system classifies task complexity into effort levels (TRIVIAL to DETERMINED) and unlocks progressively more powerful capabilities accordingly.

## Core Philosophy

Move from **current state** to **ideal state** using the ISC (Ideal State Criteria). The goal is to create exceptional outcomes by systematically identifying what "ideal" looks like and executing with appropriate rigor.

## Seven Execution Phases

```
OBSERVE -> THINK -> PLAN -> BUILD -> EXECUTE -> VERIFY -> LEARN
```

Each phase mutates the ISC, creating an evolving specification of what success looks like.

## Effort-Based Capability Access

| Effort Level | Detection Signals | Capabilities |
|--------------|-------------------|--------------|
| **TRIVIAL** | "quick answer", simple lookup | Direct response only |
| **QUICK** | "just do X", "quickly" | Basic execution, 1-3 ISC rows |
| **STANDARD** | Most requests (default) | Deep thinking, research, 5-10 ISC rows |
| **THOROUGH** | "thoroughly", "carefully", complex domain | Council debate, parallel research, 10-25 ISC rows |
| **DETERMINED** | "until done", "whatever it takes", mission-critical | Unlimited iteration, adversarial review, 25-100+ ISC rows |

## The ISC (Ideal State Criteria)

A tracking table that defines what "ideal" looks like for each task:

| ID | Description | Source | Status | Parallel |
|----|-------------|--------|--------|----------|
| 1 | Specific success criterion | EXPLICIT/INFERRED/IMPLICIT | PENDING/ACTIVE/DONE/BLOCKED | [P] |

**Source Types:**
- **EXPLICIT**: Directly stated by user
- **INFERRED**: Derived from context, preferences, patterns
- **IMPLICIT**: Universal standards (security, testing, quality)

**Status Values:**
- **PENDING**: Not yet started
- **ACTIVE**: Currently being worked on
- **DONE**: Completed successfully
- **ADJUSTED**: Completed with documented deviation
- **BLOCKED**: Cannot proceed, needs resolution

## Instructions

### 1. Classify Effort

Parse the request for effort signals:

| Signal | Level |
|--------|-------|
| "quick", "just", "simple" | QUICK |
| Default (no signals) | STANDARD |
| "thorough", "careful", "complex" | THOROUGH |
| "until done", "whatever it takes", "critical" | DETERMINED |

### 2. Execute Phases

For QUICK effort, execute phases inline. For STANDARD and above, track ISC explicitly.

**Phase Workflows:**
- [Observe](workflows/observe.md) - Create ISC rows from request and context
- [Think](workflows/think.md) - Complete ISC rows, identify gaps
- [Plan](workflows/plan.md) - Order rows, identify parallelization
- [Build](workflows/build.md) - Refine rows for testability
- [Execute](workflows/execute.md) - Implement with appropriate capabilities
- [Verify](workflows/verify.md) - Test against success criteria
- [Learn](workflows/learn.md) - Present results, capture learnings

### 3. Phase Transitions

Only advance when phase exit criteria are met:
- OBSERVE: Minimum 2 ISC rows, context consulted
- THINK: All rows precise and specific
- PLAN: Dependencies mapped, parallel work flagged
- BUILD: Every row has verification method
- EXECUTE: All rows reach terminal status
- VERIFY: All rows pass or have documented status
- LEARN: Results presented for user evaluation

## Examples

**Example 1: Quick effort**
```
User: "Add a logout button to the navbar"
Claude: [QUICK effort detected]
        OBSERVE: 2 rows - logout functionality, UI placement
        THINK-PLAN-BUILD: Combined inline
        EXECUTE: Implement button
        VERIFY: Visual check, click test
        LEARN: "Added logout button to navbar"
```

**Example 2: Standard effort**
```
User: "Implement user authentication"
Claude: [STANDARD effort detected]
        OBSERVE: 7 rows covering login, logout, session, security...
        Shows ISC table
        THINK: Adds edge cases, error handling
        PLAN: Identifies dependencies
        BUILD: Adds verification criteria
        EXECUTE: Implements systematically
        VERIFY: Tests each criterion
        LEARN: Presents results
```

**Example 3: Determined effort**
```
User: "Redesign the payment flow - whatever it takes to get it right"
Claude: [DETERMINED effort detected]
        OBSERVE: 25+ rows with interview protocol
        THINK: Council debate on architecture
        PLAN: Detailed dependency graph
        BUILD: Comprehensive verification matrix
        EXECUTE: Parallel agents, iterative refinement
        VERIFY: Adversarial testing
        LEARN: Full capability report
```

## Key Principles

- **ISC size is NOT strictly bounded** - Complex problems can generate many rows
- **Research can override assumptions** - Best practices contradict initial beliefs sometimes
- **Verification methods paired at creation** - Every row gets a test method when created
- **No self-rating** - Present results for user evaluation, don't grade own work

## Resources

- [Effort Matrix](reference/effort-matrix.md) - Detailed effort classification
- [ISC Format](reference/isc-format.md) - ISC structure and lifecycle
- [Capability Matrix](reference/capability-matrix.md) - Capabilities by effort level
