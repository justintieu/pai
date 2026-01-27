# Parallel Analysis Workflow

Deploys 32 specialized agents simultaneously to systematically attack arguments from multiple expert perspectives through a 5-phase protocol.

## Configuration

- **Agents:** 32 (8 Engineers, 8 Architects, 8 Pentesters, 8 Interns)
- **Phases:** 5
- **Target time:** 60-120 seconds
- **Timeout:** 5 minutes

## The 32 Agent Roster

### Engineers (8) - Technical Rigor
Focus: Logical consistency, implementation reality, failure modes

| Agent | Specialty |
|-------|-----------|
| E1 | Performance under load |
| E2 | Edge cases and boundary conditions |
| E3 | Data integrity and consistency |
| E4 | Error handling and recovery |
| E5 | Scalability limits |
| E6 | Technical debt implications |
| E7 | Integration complexity |
| E8 | Maintenance burden |

### Architects (8) - Structural Analysis
Focus: Systemic vulnerabilities, design patterns, long-term implications

| Agent | Specialty |
|-------|-----------|
| A1 | Single points of failure |
| A2 | Coupling and dependencies |
| A3 | Evolution and extensibility |
| A4 | Pattern misapplication |
| A5 | Organizational alignment |
| A6 | Cross-cutting concerns |
| A7 | Migration complexity |
| A8 | Vendor lock-in risks |

### Pentesters (8) - Adversarial Thinking
Focus: Exploitation, malicious use, gaming the system

| Agent | Specialty |
|-------|-----------|
| P1 | Abuse cases and misuse |
| P2 | Social engineering vectors |
| P3 | Race conditions and timing |
| P4 | Trust boundary violations |
| P5 | Cascading failures |
| P6 | Information leakage |
| P7 | Denial of service vectors |
| P8 | Privilege escalation paths |

### Interns (8) - Fresh Perspective
Focus: Obvious questions, unconventional views, challenging assumptions

| Agent | Specialty |
|-------|-----------|
| I1 | "Why not the simple solution?" |
| I2 | "What if the opposite is true?" |
| I3 | "Who actually benefits?" |
| I4 | Historical parallels |
| I5 | Alternative framings |
| I6 | Hidden stakeholders |
| I7 | Unstated constraints |
| I8 | "What would make this obviously wrong?" |

## Process

### Phase 1: Decomposition

Break the argument into 24 atomic claims.

```markdown
## Phase 1: Argument Decomposition

**Original Argument:** [user's argument]

**Atomic Claims (24):**
1. [Claim 1]
2. [Claim 2]
...
24. [Claim 24]

**Core Dependencies:** Which claims depend on others being true?
**Hidden Assumptions:** What's being taken for granted?
```

**Integration:** Invoke `pai-firstprinciples` Deconstruct workflow if available.

### Phase 2: Parallel Agent Analysis

Launch ALL 32 agents examining BOTH strengths AND weaknesses.

```typescript
// Engineers (8 parallel)
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "RedTeam Engineer E1 - Performance",
  prompt: `You are Engineer E1, specializing in performance under load.
    ARGUMENT: [the argument]
    ATOMIC CLAIMS: [relevant claims]

    Analyze:
    1. What works well from a performance perspective?
    2. What breaks under load or at scale?
    3. What assumption would cause collapse if false?

    Be specific. No generic concerns. 50-100 words.`
})
// ... E2-E8 in parallel

// Architects (8 parallel)
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "RedTeam Architect A1 - Single Points of Failure",
  prompt: `You are Architect A1, specializing in identifying single points of failure.
    ARGUMENT: [the argument]
    ATOMIC CLAIMS: [relevant claims]

    Analyze:
    1. What structural strengths exist?
    2. Where are the single points of failure?
    3. What assumption would cause collapse if false?

    Be specific. No generic concerns. 50-100 words.`
})
// ... A2-A8 in parallel

// Pentesters (8 parallel)
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "RedTeam Pentester P1 - Abuse Cases",
  prompt: `You are Pentester P1, specializing in abuse cases and misuse.
    ARGUMENT: [the argument]
    ATOMIC CLAIMS: [relevant claims]

    Analyze:
    1. How could this be exploited or abused?
    2. What trust assumptions are being made?
    3. What assumption would cause collapse if false?

    Be specific. No generic concerns. 50-100 words.`
})
// ... P2-P8 in parallel

// Interns (8 parallel)
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "RedTeam Intern I1 - Simple Solutions",
  prompt: `You are Intern I1, asking "Why not the simple solution?"
    ARGUMENT: [the argument]
    ATOMIC CLAIMS: [relevant claims]

    Analyze:
    1. What obvious question is nobody asking?
    2. Why isn't the simpler alternative being considered?
    3. What assumption would cause collapse if false?

    Be fresh and direct. Challenge conventional wisdom. 50-100 words.`
})
// ... I2-I8 in parallel
```

### Phase 3: Synthesis

Identify convergent patterns across all 32 analyses.

```markdown
## Phase 3: Convergence Analysis

**Cross-Category Patterns:**
- [Pattern identified by multiple agent types]

**Most Cited Vulnerabilities:**
1. [Vulnerability] - cited by [which agents]
2. [Vulnerability] - cited by [which agents]
3. [Vulnerability] - cited by [which agents]

**Unexpected Alignments:**
- [Where Engineers and Interns agreed]
- [Where Architects and Pentesters converged]

**The Fundamental Flaw:**
[The assumption that, if challenged, causes the entire structure to collapse]
```

### Phase 4: Steelman Construction

Build the strongest possible version of the argument.

```markdown
## Phase 4: Steelman

The strongest version of this argument that proponents would affirm:

1. [Point 1 - 12-16 words]
2. [Point 2 - 12-16 words]
3. [Point 3 - 12-16 words]
4. [Point 4 - 12-16 words]
5. [Point 5 - 12-16 words]
6. [Point 6 - 12-16 words]
7. [Point 7 - 12-16 words]
8. [Point 8 - 12-16 words]
```

### Phase 5: Counter-Argument

Produce the devastating counter-argument against the steelman.

**Integration:** Invoke `pai-firstprinciples` Challenge workflow to classify each assumption:
- **HARD:** Cannot be changed (physics, regulations, math)
- **SOFT:** Changeable with effort (organizational, technical)
- **ASSUMPTION:** May not be true at all

```markdown
## Phase 5: Counter-Argument

Targeting the steelman (not a strawman), escalating toward knockout:

1. [Point 1 - addresses steelman point, 12-16 words]
2. [Point 2 - builds on point 1, 12-16 words]
3. [Point 3 - introduces new angle, 12-16 words]
4. [Point 4 - connects to fundamental flaw, 12-16 words]
5. [Point 5 - escalates severity, 12-16 words]
6. [Point 6 - shows cascading impact, 12-16 words]
7. [Point 7 - eliminates escape routes, 12-16 words]
8. [Point 8 - KNOCKOUT CONCLUSION, 12-16 words]

**Constraint Classification:**
- HARD: [constraints that cannot change]
- SOFT: [constraints that could change with effort]
- ASSUMPTION: [things assumed true that may not be]
```

## Output Format

```markdown
# Red Team Analysis: [Topic]

**Time:** [Xs]
**Agents Deployed:** 32 (8 Engineers, 8 Architects, 8 Pentesters, 8 Interns)

---

## Phase 1: Decomposition
[24 atomic claims + dependencies + hidden assumptions]

---

## Phase 2: Agent Analysis Summary
[Key findings organized by category]

---

## Phase 3: Convergence
[Cross-category patterns + fundamental flaw identified]

---

## Phase 4: Steelman
[8 numbered points, strongest version of the argument]

---

## Phase 5: Counter-Argument
[8 numbered points, escalating toward knockout conclusion]

---

## Red Team Verdict

**Fundamental Flaw:** [One sentence]
**Confidence:** [High/Medium/Low based on convergence]
**Recommendation:** [What to do with this analysis]
```

## When to Use

- Before major architectural decisions
- When evaluating controversial proposals
- To stress-test business strategies
- When you need to find flaws before critics do
- To strengthen arguments by anticipating objections
