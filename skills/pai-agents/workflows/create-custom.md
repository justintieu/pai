# Create Custom Agents Workflow

Build specialized agents with distinct trait combinations for unique perspectives on a task.

## Configuration

- **Agents:** 1-5 custom agents
- **Target time:** 10-30 seconds
- **Timeout:** 2 minutes

## Trigger Recognition

The word "custom" differentiates this from generic parallel agents. Look for:
- "custom agents"
- "specialized agents"
- "unique perspectives"
- "different viewpoints"
- "varied traits"

## Process

### Step 1: Extract Requirements

From the user request, identify:
- **Agent count:** How many agents needed (default: 3)
- **Task:** What they should analyze/do
- **Trait preferences:** Any specific expertise/personality hints

### Step 2: Compose Trait Combinations

**Critical:** Each agent MUST have different trait combinations for distinct perspectives.

Select from:
- **Expertise:** security, legal, finance, medical, technical, research, creative, business, data, communications
- **Personality:** skeptical, enthusiastic, cautious, bold, analytical, creative, empathetic, contrarian, pragmatic, meticulous
- **Approach:** thorough, rapid, systematic, exploratory, comparative, synthesizing, adversarial, consultative

**Example compositions for code review:**
| Agent | Expertise | Personality | Approach |
|-------|-----------|-------------|----------|
| Agent 1 | technical | meticulous | systematic |
| Agent 2 | security | skeptical | adversarial |
| Agent 3 | business | pragmatic | consultative |

### Step 3: Launch All Agents in Parallel

**Critical:** Send all Task calls in a SINGLE message for true parallel execution.

```typescript
Task({
  subagent_type: "Explore",
  model: "sonnet",  // or haiku for faster
  description: "Custom Agent 1 - [task]",
  prompt: `You are a specialized analyst.
    EXPERTISE: [expertise]
    PERSONALITY: [personality]
    APPROACH: [approach]

    TASK: [user's task]

    Analyze from your unique perspective. Be specific and opinionated.
    Output: 100-200 words.`
})

Task({
  subagent_type: "Explore",
  model: "sonnet",
  description: "Custom Agent 2 - [task]",
  prompt: `You are a specialized analyst.
    EXPERTISE: [different expertise]
    PERSONALITY: [different personality]
    APPROACH: [different approach]

    TASK: [user's task]

    Analyze from your unique perspective. Be specific and opinionated.
    Output: 100-200 words.`
})

// Repeat for each agent
```

### Step 4: Synthesize Results

After all agents complete:

```markdown
## Custom Agent Analysis: [Task]

**Agents Deployed:** [count] with varied traits

---

### Agent 1: [Expertise + Personality]
[Response]

### Agent 2: [Expertise + Personality]
[Response]

### Agent 3: [Expertise + Personality]
[Response]

---

## Synthesis

### Points of Convergence
[Where agents agree]

### Divergent Perspectives
[Where they differ - this is the valuable part]

### Recommended Action
[Based on synthesized insights]
```

## Common Mistakes to Avoid

| Mistake | Problem | Solution |
|---------|---------|----------|
| Same traits for all | Identical perspectives | Vary at least 2 of 3 dimensions |
| Sequential execution | Slow | All Task calls in one message |
| Too many agents | Diminishing returns | 3-5 usually optimal |
| Vague task prompt | Generic responses | Be specific about what to analyze |

## When to Use

- Design decisions requiring multiple viewpoints
- Code review needing security + quality + UX perspectives
- Research where bias diversity matters
- Any task where "healthy tension" reveals insights
