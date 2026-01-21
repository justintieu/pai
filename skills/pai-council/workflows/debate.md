# Debate Workflow

Full structured discussion across three rounds with intellectual friction and synthesis.

## Configuration

- **Agents:** 4-7 (parallel within rounds, sequential between rounds)
- **Rounds:** 3
- **Target time:** 30-90 seconds
- **Timeout:** 5 minutes

## Process

### Step 0: Announce Council

```markdown
## Council Debate: [Topic]

**Participants:** Architect, Designer, Engineer, Researcher [+ optional]
**Format:** 3 rounds | Parallel execution within rounds
```

### Step 1: Round 1 - Initial Positions

Launch ALL agents in a SINGLE message for true parallel execution.

```typescript
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Council Architect - [topic]",
  prompt: `You are Serena Blackwood, the Architect.
    ROLE: System design, patterns, scalability, long-term implications
    TOPIC: [debate topic]
    ROUND 1: Provide your initial take (50-150 words). Be specific, no fluff.`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Council Designer - [topic]",
  prompt: `You are Aditi Sharma, the Designer.
    ROLE: UX, user needs, accessibility, human factors
    TOPIC: [debate topic]
    ROUND 1: Provide your initial take (50-150 words). Advocate for users.`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Council Engineer - [topic]",
  prompt: `You are Marcus Webb, the Engineer.
    ROLE: Implementation reality, tech debt, maintainability
    TOPIC: [debate topic]
    ROUND 1: Provide your initial take (50-150 words). Ground in reality.`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Council Researcher - [topic]",
  prompt: `You are Ava Chen, the Researcher.
    ROLE: Data, precedent, external examples, evidence
    TOPIC: [debate topic]
    ROUND 1: Provide your initial take (50-150 words). Bring evidence.`
})
```

### Step 2: Round 2 - Engagement & Challenge

Pass the FULL Round 1 transcript to each agent.

```typescript
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Council Architect R2 - [topic]",
  prompt: `You are Serena Blackwood, Architect.
    TOPIC: [debate topic]
    ROUND 2: Read transcript and RESPOND to specific points.

    ROUND 1 TRANSCRIPT:
    ${round1Transcript}

    Requirements:
    - Reference SPECIFIC points from others
    - Challenge assumptions or build on good ideas
    - Create intellectual friction where you disagree
    - 50-150 words`
})
// Repeat for Designer, Engineer, Researcher
```

### Step 3: Round 3 - Synthesis & Recommendations

Pass BOTH Round 1 and Round 2 transcripts.

```typescript
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Council Architect R3 - [topic]",
  prompt: `You are Serena Blackwood, Architect.
    TOPIC: [debate topic]
    ROUND 3: Final synthesis after reading the full debate.

    FULL TRANSCRIPT:
    ${round1Transcript}
    ${round2Transcript}

    Requirements:
    - Identify convergence with others
    - Note where you still disagree
    - Provide final recommendation
    - 50-150 words

    Remember: Acknowledged tension is better than fake consensus.`
})
// Repeat for Designer, Engineer, Researcher
```

### Step 4: Council Synthesis

After all three rounds:

```markdown
## Council Synthesis

### Points of Convergence
[What the council broadly agrees on]

### Remaining Disagreements
[Where meaningful tension remains]

### Recommended Path Forward
[Synthesized recommendation]

### Key Trade-offs
[What's being optimized vs sacrificed]
```

## Output Format

```markdown
# Council Debate: [Topic]

**Participants:** [List]
**Time:** [Xs]

---

### Round 1: Initial Positions
**Architect Serena:** [response]
**Designer Aditi:** [response]
**Engineer Marcus:** [response]
**Researcher Ava:** [response]

---

### Round 2: Engagement & Challenge
[Each agent responds to specific points from Round 1]

---

### Round 3: Synthesis & Recommendations
[Final positions acknowledging convergence and tension]

---

## Council Synthesis
[Points of convergence, disagreements, path forward, trade-offs]
```

## When to Use

- Major architectural decisions
- Technology selection
- Design pattern debates
- Before committing to significant refactors
- When you need multiple expert perspectives challenging each other
