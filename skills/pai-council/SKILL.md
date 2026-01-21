---
name: pai-council
description: Multi-agent debate system where specialized agents discuss topics in rounds, respond to each other's points, and surface insights through intellectual friction. USE WHEN need multiple perspectives, evaluate design decisions, architectural review, before major decisions, debate tradeoffs, collaborative analysis.
tools: Task
---

# PAI Council

Multi-agent debate system where specialized agents discuss topics in rounds, challenge each other's perspectives, and surface insights through intellectual friction.

## Workflows

| Workflow | Use When | Rounds | Agents | Time |
|----------|----------|--------|--------|------|
| **Debate** | Major decisions, architectural review, complex tradeoffs | 3 | 4-7 | 30-90s |
| **Quick** | Sanity checks, rapid validation, simple decisions | 1 | 4 | 10-20s |

## Council Members

### Default Team (4 agents)

| Role | Name | Focus |
|------|------|-------|
| **Architect** | Serena Blackwood | System design, patterns, scalability, long-term architectural implications |
| **Designer** | Aditi Sharma | UX, user needs, accessibility, human factors |
| **Engineer** | Marcus Webb | Implementation reality, tech debt, maintainability |
| **Researcher** | Ava Chen | Data, precedent, external examples, evidence |

### Optional Members

| Role | Name | When to Include |
|------|------|-----------------|
| **Security** | Rook Blackburn | Authentication, data handling, APIs, security concerns |
| **Intern** | Dev Patel | Fresh perspective, onboarding lens, obvious questions |
| **Writer** | Emma Hartley | Public-facing content, documentation, communication clarity |

## Mode Selection

**Quick** - "quick check on X", "sanity check X", "fast council on X"
**Debate** (default) - "council on X", "debate X", "evaluate X"

## Instructions

### 1. Determine Mode

Parse user request for mode indicators:
- Quick: "quick", "sanity check", "fast", "briefly"
- Debate: Default for most requests requiring deliberation

### 2. Determine Council Composition

**Default:** Architect, Designer, Engineer, Researcher

**Add Security if:** Authentication, data handling, API design, security-sensitive
**Add Intern if:** Complex design needing fresh eyes, onboarding materials
**Add Writer if:** Public-facing content, documentation strategy

### 3. Execute Workflow

Load the appropriate workflow:
- Quick: `workflows/quick.md`
- Debate: `workflows/debate.md`

## Key Principles

- **Intellectual friction over forced consensus** - Value emerges from genuine disagreement
- **Specific engagement** - Round 2+ must reference specific points from others
- **Collaborative-adversarial** - Challenge assumptions while building on good ideas
- **Parallel execution** - All agents within a round execute simultaneously
- **Escalation path** - Quick mode should recommend full debate if significant disagreement emerges

## Examples

**Example 1: Quick sanity check**
```
User: "quick council on adding Redis caching to our API"
Claude: Executes Quick workflow (4 agents in parallel)
        Returns 4 brief perspectives + synthesis
        Time: ~15 seconds
```

**Example 2: Architectural decision**
```
User: "council debate on microservices vs monolith for our SaaS"
Claude: Executes Debate workflow (3 rounds, 4 agents)
        Round 1: Each agent states position
        Round 2: Agents challenge each other's points
        Round 3: Final synthesis with recommendations
        Time: ~60 seconds
```

**Example 3: Security-focused debate**
```
User: "council on our OAuth implementation - include security"
Claude: Adds Security agent to default team (5 agents)
        Executes Debate workflow
        Time: ~75 seconds
```

## Resources

- [Debate workflow](workflows/debate.md) - Full 3-round structured discussion
- [Quick workflow](workflows/quick.md) - Rapid single-round validation
