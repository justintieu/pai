# Prompt Engineering Standards

Evidence-based guidance for crafting effective prompts, grounded in research spanning 1,500+ academic papers and Anthropic's Claude best practices.

## Core Concept: Context Engineering

The foundation of effective prompting is **context engineering** - strategically selecting high-value tokens to maximize desired outcomes while respecting the model's finite attention capacity.

Every token has a cost (attention, noise potential) and a value (information, guidance). Optimize for maximum value per token.

## Structural Guidelines

### Use Markdown, Not XML

Modern Claude models respond better to markdown formatting:

```markdown
# Good
## Instructions
1. First, analyze the input
2. Then, extract key points

# Avoid
<instructions>
<step1>First, analyze the input</step1>
</instructions>
```

### Be Explicit and Positive

State what to do, not what to avoid:

```markdown
# Good
"Use 2-3 sentences per paragraph"
"Focus on the main argument"

# Avoid
"Don't be too verbose"
"Don't go off-topic"
```

### Explain the Why

Reasoning improves compliance:

```markdown
# Good
"Use bullet points for lists of 3+ items (improves scanability
and retention)"

# Less effective
"Use bullet points for lists"
```

## Content Optimization

### Signal-to-Noise Ratio

Every sentence should add value:

| Type | Example | Value |
|------|---------|-------|
| Signal | "Output as JSON with keys: title, summary, score" | High |
| Noise | "Please try your best to format nicely" | Low |
| Filler | "It would be great if you could..." | None |

### Example Count: 1-3 Optimal

Research shows diminishing returns beyond 3 examples:

| Count | Accuracy | Cost |
|-------|----------|------|
| 0 | Baseline | Minimal |
| 1-3 | +15-25% | Moderate |
| 4-7 | +5-10% | High |
| 8+ | Diminishing | Very High |

One high-quality example often beats multiple mediocre ones.

### Context Placement

For Claude models:
- Important instructions should appear early and be reinforced at end
- Examples work best in the middle section
- Constraints near the output specification

## Claude 4.x Specifics

### Softer Framing

Replace aggressive requirements:

```markdown
# Good
"use when the input contains dates"
"consider whether the tone matches"

# Avoid
"MUST ALWAYS format dates"
"You MUST think about tone"
```

### Thinking vs. Consider

When extended thinking is disabled:

```markdown
# Good
"Consider the implications of each option"
"Evaluate the trade-offs"

# May cause issues
"Think through each step carefully"
"Think about what could go wrong"
```

### Progress Updates

Prefer factual progress over explanatory:

```markdown
# Good
"Analyzed 3/5 documents. Key finding: ..."

# Verbose
"I've been working through the documents and I wanted to let
you know that I've completed three of them so far..."
```

## Prompt Structure Template

The optimal prompt includes (select as appropriate):

### 1. Context & Motivation
Why this task matters. Sets the frame.

### 2. Role/Identity
Who the model should embody. Improves consistency.

### 3. Background
Domain knowledge needed. Reduces hallucination.

### 4. Instructions
Clear, numbered steps. The core of the prompt.

### 5. Examples
1-3 demonstrations. Show, don't just tell.

### 6. Constraints
Boundaries and limitations. Prevents overreach.

### 7. Output Format
Expected structure. Enables parsing and validation.

## Impact Data

Research shows structured prompting improvements:

| Component | Improvement |
|-----------|-------------|
| Clear role | +10-15% consistency |
| Explicit format | +20% parseability |
| 1-3 examples | +15-25% accuracy |
| Positive framing | +5-10% compliance |
| Full integration | ~25% on complex tasks |

## Anti-Patterns

Avoid these common mistakes:

1. **Vague instructions**: "Do a good job" provides no guidance
2. **Negative framing**: "Don't make mistakes" focuses on failure
3. **Over-constraining**: Too many rules create conflicts
4. **Under-specifying format**: Leads to inconsistent outputs
5. **Ignoring context limits**: Overloading causes attention dilution

## Validation Checklist

Before deploying a prompt:

- [ ] Role/identity clearly defined?
- [ ] Instructions use positive framing?
- [ ] Examples demonstrate (not just describe)?
- [ ] Output format explicitly specified?
- [ ] Constraints reasonable and non-conflicting?
- [ ] Signal-to-noise ratio optimized?
- [ ] Tested with edge cases?
