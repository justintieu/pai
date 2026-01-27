---
name: pai-redteam
description: Military-grade adversarial analysis deploying 32 parallel agents to stress-test arguments and validate decisions through structured critique. USE WHEN red team, attack idea, counterarguments, critique, stress test, validate argument, find flaws, challenge assumptions, devil's advocate.
tools: Task
---

# PAI Red Team

Adversarial analysis system that deploys 32 specialized agents to systematically attack arguments from multiple expert perspectives, revealing hidden assumptions and fundamental flaws.

## Workflows

| Workflow | Use When | Agents | Purpose |
|----------|----------|--------|---------|
| **Parallel Analysis** | Stress-test existing content, arguments, proposals | 32 | Find fundamental flaws in existing ideas |
| **Adversarial Validation** | Generate new solutions through competition | 3+ teams | Produce superior output via competing proposals |

## The 32 Agents

Four specialized categories, each with 8 agents bringing distinct perspectives:

| Category | Focus | Example Questions |
|----------|-------|-------------------|
| **Engineers** | Technical rigor, logical consistency, failure modes | "What happens at scale? What breaks under load?" |
| **Architects** | Structural vulnerabilities, systemic issues | "Where are the single points of failure?" |
| **Pentesters** | Adversarial exploitation, edge cases | "How would a malicious actor abuse this?" |
| **Interns** | Fresh perspective, obvious questions, unconventional views | "Why does everyone assume X is true?" |

## Philosophy

The goal is NOT destruction - it's discovery. We seek **the assumption that, if challenged, causes the entire structure to collapse**.

**Most devastating critiques target:**
- Hidden assumptions that prove false
- Logical gaps in reasoning chains
- Category mistakes (misclassifying X as Y)
- Overlooked historical parallels that contradict the argument

## Instructions

### 1. Determine Workflow

Parse user request:
- **Parallel Analysis** (default): "red team X", "stress test X", "attack this argument", "find flaws in X"
- **Adversarial Validation**: "generate competing solutions", "battle of bots", "competitive proposals for X"

### 2. Execute Workflow

Load the appropriate workflow:
- Parallel Analysis: `workflows/parallel-analysis.md`
- Adversarial Validation: `workflows/adversarial-validation.md`

### 3. Output Requirements

**Steelman format:** 8 numbered points, 12-16 words each
**Counter-argument format:** 8 numbered points, 12-16 words each, escalating toward knockout conclusion

**Tone requirements:**
- Direct and substantive
- NO performative language ("Great point!", "Interesting...")
- NO nitpicking or strawmanning
- NO generic objections - all critiques must be specific

## Integration with Other Skills

**Before red teaming:**
- Use `pai-research` to gather context and precedents

**During analysis:**
- Invoke `pai-firstprinciples` for decomposition (Phase 1)
- Use FirstPrinciples/Challenge to classify constraints as HARD/SOFT/ASSUMPTION (Phase 5)

**After red teaming:**
- Extract key insights for action items

## Examples

**Example 1: Stress-test an argument**
```
User: "red team my argument that we should switch to microservices"
Claude: Executes Parallel Analysis workflow
        - Decomposes into 24 atomic claims
        - Deploys 32 agents across 4 categories
        - Synthesizes findings
        - Produces steelman + 8-point counter-argument
        Time: ~90 seconds
```

**Example 2: Validate architectural decision**
```
User: "stress test our decision to use PostgreSQL over MongoDB"
Claude: Executes Parallel Analysis
        Engineers focus on performance edge cases
        Architects examine scaling patterns
        Pentesters probe data integrity scenarios
        Interns ask "why not both?"
```

**Example 3: Generate competing solutions**
```
User: "battle of bots for our authentication system design"
Claude: Executes Adversarial Validation
        Round 1: 3 teams generate competing proposals
        Round 2: Critic evaluates each proposal harshly
        Round 3: Teams collaborate on synthesized solution
```

## Success Criteria

Effective red teaming produces:
- A steelman interpretation proponents would affirm captures their position
- Counter-arguments that dismantle the strongest version, not strawmen
- Consensus across independent reviewers on key vulnerabilities
- Novel insights that prompt genuine reflection

## Resources

- [Parallel Analysis workflow](workflows/parallel-analysis.md) - 5-phase 32-agent attack protocol
- [Adversarial Validation workflow](workflows/adversarial-validation.md) - Competitive proposal generation
