# Extensive Research Workflow

Six parallel agents exploring diverse angles for comprehensive coverage.

## Configuration

- **Agents:** 6 (parallel)
- **Queries:** 1 per agent (unique angles)
- **Target time:** 60-90 seconds
- **Timeout:** 5 minutes

## Process

### Step 0: Deep Think for Research Angles

Before spawning agents, generate 6 diverse research angles:

**Angle categories:**
1. **Core/Technical** - How it fundamentally works
2. **Historical** - Evolution, origins, key milestones
3. **Comparative** - Alternatives, competitors, tradeoffs
4. **Practical** - Real-world applications, case studies
5. **Critical** - Limitations, criticisms, failure modes
6. **Future** - Trends, roadmap, emerging developments

**Good angles:**
- Explore unexpected domains
- Challenge obvious assumptions
- Find contrarian perspectives
- Seek primary sources

### Step 1: Launch All Agents Simultaneously

**Critical:** All 6 agents in a SINGLE message for true parallel execution.

```typescript
// Single message with all Task calls
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] core/technical",
  prompt: "Search for: [technical deep-dive query]. Return key findings with sources."
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] history/evolution",
  prompt: "Search for: [historical query]. Return key findings with sources."
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] alternatives/comparison",
  prompt: "Search for: [comparative query]. Return key findings with sources."
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] real-world applications",
  prompt: "Search for: [practical applications query]. Return key findings with sources."
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] limitations/criticisms",
  prompt: "Search for: [critical perspective query]. Return key findings with sources."
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] future/trends",
  prompt: "Search for: [future trends query]. Return key findings with sources."
})
```

### Step 2: Collect Results

Wait for all agents (most return within 30-90 seconds).

### Step 3: Synthesize Across Angles

**Theme identification:**
- What patterns emerge across multiple angles?
- What do authoritative sources agree on?

**Unique insights:**
- What did each angle contribute uniquely?
- Any surprising findings from unexpected angles?

**Conflicts:**
- Where do sources disagree?
- What remains uncertain or debated?

### Step 4: Verify All URLs

Every URL must be verified:
```bash
for url in URLs; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
  [ "$status" = "200" ] || remove_url
done
```

### Step 5: Format Comprehensive Report

```markdown
## Deep Dive: [Topic]

**Mode:** Extensive | **Agents:** 6 | **Time:** [X]s

### Executive Summary
[2-3 paragraph synthesis of key findings]

### Technical Foundation
[Core/technical angle findings]

### Historical Context
[Evolution and key milestones]

### Competitive Landscape
[Alternatives and tradeoffs]

### Real-World Applications
[Case studies and practical use]

### Limitations & Criticisms
[Known issues and challenges]

### Future Outlook
[Trends and predictions]

### Cross-Cutting Themes
[Patterns that emerged across multiple angles]

### Conflicting Information
[Areas where sources disagree - flag for user judgment]

### Sources
[All verified URLs organized by section]

### Research Metrics
- Agents: 6
- Angles explored: [list]
- High-confidence findings: [count]
- Areas needing more research: [list]
```

## Example

**Request:** "do a deep dive on the current state of AI agents"

**6 Angles:**
1. Technical: "AI agent architectures 2024 ReAct tool use"
2. Historical: "AI agents evolution from GOFAI to LLMs"
3. Comparative: "AI agent frameworks compared AutoGPT CrewAI LangGraph"
4. Practical: "AI agents production deployments case studies"
5. Critical: "AI agent limitations reliability hallucination problems"
6. Future: "AI agent research trends 2024 2025 multi-agent"

**Output:** [Comprehensive 6-section report with synthesis]

## When to Use

- "Deep dive on X"
- "Thoroughly research X"
- "I need a comprehensive understanding of X"
- Strategic decisions requiring full context
- New domain exploration
- Due diligence research
