---
name: pai-firstprinciples
description: Foundational reasoning methodology based on physics-based thinking. Deconstructs problems to fundamental truths, classifies constraints by type, and reconstructs optimal solutions from verified principles. USE WHEN questioning assumptions, high costs seem fixed, inherited solutions feel inadequate, seeking breakthrough approaches, challenging conventional wisdom.
tools: [Read, Write]
---

# First Principles Reasoning

A systematic methodology for deconstructing problems to their fundamental truths and reconstructing optimal solutions from verified principles rather than inherited conventions.

## Problem Statement

Common reasoning failures include:
- **Reasoning by analogy**: Copying existing approaches without questioning fundamentals
- **Constraint worship**: Treating soft limitations as immutable laws
- **Local optimization**: Incrementally improving existing forms instead of reimagining from basics
- **Assumption inheritance**: Accepting unvalidated beliefs as facts

## Core Framework

```
DECONSTRUCT → CHALLENGE → RECONSTRUCT
```

1. **Deconstruct**: Break problems into constituent parts and identify fundamental truths
2. **Challenge**: Classify constraints as hard (physics), soft (policy), or assumptions
3. **Reconstruct**: Build optimal solutions from only the irreducible facts

---

## Step 1: Deconstruct

Break down problems into fundamental parts and irreducible truths.

### Process

**Identify the target** - What are we deconstructing? (cost structure, architecture, process, limitation)

**Catalog accepted components** - List what "everyone knows" without judgment

**Examine actual constituents** - For each component:
- What is this actually made of?
- What are the material/fundamental requirements?
- What's the minimum viable version?
- What portion is substance vs. margin vs. convention?

**Identify fundamental truths** - Distinguish irreducible facts from conventions:

| Fundamental Truths (qualify) | NOT Fundamental (don't qualify) |
|------------------------------|--------------------------------|
| Laws of physics | Industry conventions |
| Mathematical certainties | "Enterprise-grade" qualifiers |
| Empirically verified facts | Market prices |
| Physical material requirements | Traditional practices |

**Map the gaps** - Compare stated requirements to actual fundamentals

### Example: Rocket Launch Costs

**Industry statement**: Launches cost $65 million due to aerospace complexity.

**Deconstruction reveals**:
- Aluminum and titanium: ~2% of costs
- Fuel: ~$200,000
- "Aerospace-grade engineering": Convention, not physics

**Fundamental truths**:
- Must achieve orbital velocity (~7.8 km/s)
- Must survive thermal loads
- Rocket equation governs propellant ratios

**Gap insight**: $49 million gap represents margin and convention, not physics.

---

## Step 2: Challenge

Systematically evaluate constraints to distinguish genuine limitations from inherited choices.

### Central Question

**"Is this a law of physics, or is it a choice someone made?"**

### Three-Part Classification

**HARD Constraints** (Physics/Reality):
- Violations would break natural laws
- Examples: Speed of light, thermodynamic limits
- Cannot be changed regardless of resources

**SOFT Constraints** (Policy/Choice):
- Decision-makers could modify if warranted
- Examples: Budget allocations, compliance requirements
- Changeable through decisions

**ASSUMPTIONS** (Unvalidated):
- Beliefs lacking evidence
- Examples: "Users won't understand that", "Must be real-time"
- Potentially false, need validation

### Challenge Questions by Domain

**Technical**: "Is this language limitation fundamental or current implementation?"
**Business**: "Is this budget fixed, or does it depend on solution?"
**Security**: "Is this threat realistic for our context?"
**UX**: "Do we have data supporting this?"
**Architecture**: "Is this pattern necessary or just familiar?"

### The "Remove It" Test

For each constraint:
- What if we completely removed it?
- What value would be unlocked?
- What would actually break?
- Is the breakage acceptable?

---

## Step 3: Reconstruct

Build optimal solutions from foundational principles rather than existing approaches.

### Central Question

**"If we knew nothing about how this currently works, and only knew the fundamental truths, what would we build?"**

### Process

**State hard constraints only** - List only immutable requirements (physics, math, verified facts)

**Define the function** - Articulate actual outcome, not solution

| Form-based (avoid) | Function-based (use) |
|--------------------|---------------------|
| "We need a database" | "We need to persist and retrieve data reliably" |
| "We need a REST API" | "We need remote systems to query our data" |
| "We need microservices" | "We need independent deployment of features" |

**Blank slate design** - Generate 3+ approaches ignoring current implementation:
- Think about function only
- Draw from unrelated domains
- Don't optimize existing approach

**Cross-domain synthesis** - Examine analogous solutions from unrelated fields

**Evaluate against function** - Compare solutions using:

| Solution | Satisfies Hard Constraints? | Achieves Function? | Simplicity | Trade-offs |
|----------|---------------------------|-------------------|-----------|------------|

---

## Examples

### Example 1: Database Selection

**Problem**: "Choose between PostgreSQL and MongoDB"

**Deconstruct**: Function is "persist data, support queries, ensure reliability"

**Challenge**:
- "Must be ACID" → ASSUMPTION (depends on use case)
- "Must scale to millions" → ASSUMPTION (validated scale needs?)
- "Relational model" → ASSUMPTION (based on familiarity?)

**Reconstruct**: Document store best matches actual query patterns, removes ORM complexity

### Example 2: API Complexity

**Problem**: "REST API has too many endpoints"

**Deconstruct**: Function is "frontend queries and modifies backend data"

**Challenge**:
- "Must be RESTful" → SOFT (convention)
- "Must support all CRUD" → ASSUMPTION
- "Must be synchronous" → ASSUMPTION

**Reconstruct**: GraphQL eliminates over-fetching, reduces 40 endpoints to 1

### Example 3: Slow Test Suite

**Problem**: "Test suite takes 45 minutes"

**Deconstruct**: Function is "confidence code works before deploying"

**Challenge**:
- "Need 80% coverage" → ASSUMPTION (arbitrary metric)
- "Must test every function" → ASSUMPTION
- "Must catch all bugs" → SOFT (impossible, degree is choice)

**Reconstruct**: Type system + contract tests + focused integration = 5 minutes

---

## Anti-Patterns to Avoid

- Skip to reconstruction without understanding fundamentals
- Treat soft constraints as hard constraints
- Optimize existing forms instead of reimagining function
- Reason by analogy when physics-based thinking is needed
- Accept industry conventions as immutable truths

---

## When to Use

- Problems seem intractable
- Costs appear fixed
- Inherited solutions feel inadequate
- Seeking breakthrough improvements
- Before major architectural decisions
- When "requirements" feel arbitrary
