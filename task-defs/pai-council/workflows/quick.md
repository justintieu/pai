# Quick Workflow

Rapid single-round perspective gathering for sanity checks and simple decisions.

## Configuration

- **Agents:** 4 (parallel)
- **Rounds:** 1
- **Target time:** 10-20 seconds
- **Timeout:** 60 seconds

## Process

### Step 1: Launch All Agents Simultaneously

**Key difference from Debate:** Responses are brief (30-50 words max).

```typescript
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Quick Council Architect - [topic]",
  prompt: `You are Serena Blackwood, Architect.
    QUICK COUNCIL: [topic]
    Provide your architectural perspective in 30-50 words max.
    Focus on the most critical consideration. This is a rapid sanity check.`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Quick Council Designer - [topic]",
  prompt: `You are Aditi Sharma, Designer.
    QUICK COUNCIL: [topic]
    Provide your design perspective in 30-50 words max.
    Focus on the most critical UX consideration.`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Quick Council Engineer - [topic]",
  prompt: `You are Marcus Webb, Engineer.
    QUICK COUNCIL: [topic]
    Provide your engineering perspective in 30-50 words max.
    Focus on the most critical implementation consideration.`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Quick Council Researcher - [topic]",
  prompt: `You are Ava Chen, Researcher.
    QUICK COUNCIL: [topic]
    Provide your research perspective in 30-50 words max.
    Cite precedent or data if relevant.`
})
```

### Step 2: Format Quick Output

```markdown
## Quick Council: [Topic]

**Mode:** Quick | **Agents:** 4 | **Time:** [X]s

### Perspectives

**Architect Serena:** [30-50 words]
**Designer Aditi:** [30-50 words]
**Engineer Marcus:** [30-50 words]
**Researcher Ava:** [30-50 words]

---

### Synthesis

**Consensus:** [What perspectives broadly agree on]

**Flagged Concerns:** [Any red flags or concerns raised]

**Recommendation:**
- ✅ Proceed - perspectives align, no major concerns
- ⚠️ Proceed with caution - [specific concern to watch]
- 🛑 Escalate to full debate - significant disagreement detected
```

### Step 3: Escalation Decision

If Quick Council reveals significant disagreement or complexity:

```markdown
### Escalation Recommended

The Quick Council surfaced [specific issue]. Run a full debate to explore:
- [Issue 1 needing deeper exploration]
- [Trade-off requiring careful weighing]

Run full debate? (60-90 seconds for deeper analysis)
```

## Example: Green Light

```markdown
## Quick Council: Adding API Caching Layer

**Mode:** Quick | **Agents:** 4 | **Time:** 12s

### Perspectives

**Architect Serena:**
"Natural evolution. Use Redis for session-heavy endpoints. Plan cache invalidation upfront."

**Designer Aditi:**
"Will improve perceived performance. Focus on high-latency queries users trigger frequently."

**Engineer Marcus:**
"Redis is solid. Watch memory limits. Biggest risk is cache invalidation bugs."

**Researcher Ava:**
"Standard pattern at this scale. Aim for 80%+ cache hit rate on read-heavy endpoints."

---

### Synthesis

**Consensus:** All support adding caching. Redis is appropriate. Cache invalidation is the key challenge.

**Flagged Concerns:** Cache invalidation complexity, operational overhead

**Recommendation:** ✅ Proceed - Focus on robust cache invalidation strategy
```

## When to Use

- "Quick check on X"
- "Sanity check this idea"
- Fast validation before diving deep
- Simple decisions with low risk
- As a filter before full debate
