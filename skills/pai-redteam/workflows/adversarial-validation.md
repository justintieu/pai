# Adversarial Validation Workflow

Generates superior solutions through competing agent proposals and harsh critique. Also known as "Battle of Bots."

## Configuration

- **Teams:** 3 competing proposal teams
- **Rounds:** 3
- **Target time:** 60-90 seconds
- **Timeout:** 5 minutes

## Philosophy

AI is normally better at critiquing or editing than original writing. This pattern harnesses that strength by:

1. Creating competing proposals from distinct perspectives
2. Applying harsh, substantive critique
3. Synthesizing superior solutions from the wreckage

## Key Distinction from Parallel Analysis

| Workflow | Purpose | When to Use |
|----------|---------|-------------|
| **Parallel Analysis** | Depth - attack one idea from 32 angles | Stress-test existing content |
| **Adversarial Validation** | Synthesis - produce new output through competition | Generate new solutions |

## Process

### Round 1: Competing Proposals

Launch 3 specialized teams to generate competing solutions.

```typescript
Task({
  subagent_type: "Explore",
  model: "sonnet",
  description: "AdversarialValidation Team Engineer",
  prompt: `You are the ENGINEER TEAM proposing a solution.
    PROBLEM: [the problem to solve]

    Generate a complete proposal from an engineering-first perspective:
    - Prioritize: Technical elegance, performance, maintainability
    - De-prioritize: User experience polish, organizational concerns

    Format:
    ## Engineer Team Proposal
    **Core Approach:** [2-3 sentences]
    **Key Design Decisions:** [3-5 bullets]
    **Trade-offs Accepted:** [What you're sacrificing]
    **Why This Wins:** [Your competitive advantage]

    Be specific and concrete. 200-300 words.`
})

Task({
  subagent_type: "Explore",
  model: "sonnet",
  description: "AdversarialValidation Team Architect",
  prompt: `You are the ARCHITECT TEAM proposing a solution.
    PROBLEM: [the problem to solve]

    Generate a complete proposal from a systems-thinking perspective:
    - Prioritize: Scalability, flexibility, long-term evolution
    - De-prioritize: Immediate simplicity, short-term velocity

    Format:
    ## Architect Team Proposal
    **Core Approach:** [2-3 sentences]
    **Key Design Decisions:** [3-5 bullets]
    **Trade-offs Accepted:** [What you're sacrificing]
    **Why This Wins:** [Your competitive advantage]

    Be specific and concrete. 200-300 words.`
})

Task({
  subagent_type: "Explore",
  model: "sonnet",
  description: "AdversarialValidation Team Product",
  prompt: `You are the PRODUCT TEAM proposing a solution.
    PROBLEM: [the problem to solve]

    Generate a complete proposal from a user-value perspective:
    - Prioritize: User experience, time-to-value, adoption
    - De-prioritize: Technical purity, long-term architecture

    Format:
    ## Product Team Proposal
    **Core Approach:** [2-3 sentences]
    **Key Design Decisions:** [3-5 bullets]
    **Trade-offs Accepted:** [What you're sacrificing]
    **Why This Wins:** [Your competitive advantage]

    Be specific and concrete. 200-300 words.`
})
```

### Round 2: Harsh Critique

Deploy a critic who evaluates each proposal without mercy.

```typescript
Task({
  subagent_type: "Explore",
  model: "sonnet",
  description: "AdversarialValidation Critic",
  prompt: `You are THE CRITIC. Your job is to tear apart each proposal.
    PROBLEM: [the problem to solve]

    PROPOSALS:
    ${engineerProposal}
    ${architectProposal}
    ${productProposal}

    For EACH proposal, provide:

    ## Critique: [Team Name]

    **What They Got Right:**
    - [1-2 genuine strengths - be fair]

    **What They Got Wrong:**
    - [3-5 specific failures - be harsh but substantive]

    **The Uncomfortable Truth They're Avoiding:**
    [What this team doesn't want to admit about their approach]

    **Fatal Flaw:**
    [The one thing that would cause this proposal to fail catastrophically]

    ---

    ## Cross-Proposal Analysis

    **Best Ideas Across All Proposals:**
    [Cherry-pick the winners regardless of source]

    **Shared Blind Spots:**
    [What ALL teams missed]

    **The Real Problem Nobody Addressed:**
    [Often the framing itself is wrong]

    Be ruthless but fair. No generic objections. 400-500 words total.`
})
```

### Round 3: Collaborative Synthesis

Original teams collaborate, incorporating critique, to produce unified solution.

```typescript
Task({
  subagent_type: "Explore",
  model: "sonnet",
  description: "AdversarialValidation Synthesis",
  prompt: `You are ALL THREE TEAMS working together after receiving harsh critique.
    PROBLEM: [the problem to solve]

    ORIGINAL PROPOSALS:
    ${allProposals}

    CRITIC'S FEEDBACK:
    ${criticFeedback}

    Produce a SYNTHESIZED SOLUTION that:
    1. Takes the best ideas from each proposal
    2. Addresses every fatal flaw identified
    3. Confronts the uncomfortable truths
    4. Explicitly acknowledges trade-offs

    Format:
    ## Synthesized Solution

    **Core Approach:** [2-3 sentences]

    **From Engineer Team:** [What we kept and why]
    **From Architect Team:** [What we kept and why]
    **From Product Team:** [What we kept and why]

    **How We Addressed the Critique:**
    - [Fatal Flaw 1]: [How we solved it]
    - [Fatal Flaw 2]: [How we solved it]
    - [Fatal Flaw 3]: [How we solved it]

    **Honest Trade-offs:**
    [What we're still sacrificing and why it's acceptable]

    **Why This Solution Is Better Than Any Individual Proposal:**
    [Concrete improvements]

    300-400 words.`
})
```

## Output Format

```markdown
# Adversarial Validation: [Problem]

**Time:** [Xs]
**Teams:** Engineer, Architect, Product
**Rounds:** 3 (Compete, Critique, Synthesize)

---

## Round 1: Competing Proposals

### Engineer Team
[Full proposal]

### Architect Team
[Full proposal]

### Product Team
[Full proposal]

---

## Round 2: Critic's Assessment

[Full critique of each proposal + cross-proposal analysis]

---

## Round 3: Synthesized Solution

[Final unified solution addressing all critique]

---

## Validation Summary

**Original Diversity:** [How different were the initial proposals?]
**Critique Quality:** [Were real flaws identified?]
**Synthesis Quality:** [Is the final solution better than any individual?]
**Remaining Risks:** [What could still go wrong?]
```

## Success Signals

The workflow succeeded if:
- Round 1 proposals showed genuine perspective diversity
- Round 2 critique identified real flaws (not nitpicks)
- Round 3 synthesis demonstrably improved on all proposals
- Trade-offs are honestly acknowledged

## When to Use

- Feature specifications that need stress-testing
- Architectural decisions before implementation
- When multiple legitimate approaches exist
- When quality matters more than speed
- To prevent groupthink in design discussions
