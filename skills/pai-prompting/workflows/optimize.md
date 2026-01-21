---
name: optimize
description: Improve an existing prompt using evidence-based practices
---

# Optimize Prompt Workflow

Take an existing prompt and systematically improve it.

## Steps

### 1. Analyze Current Prompt

Identify what exists:
- [ ] Role/identity defined?
- [ ] Clear instructions?
- [ ] Examples provided?
- [ ] Output format specified?
- [ ] Constraints stated?

### 2. Identify Gaps

Common issues to address:
- **Vague role**: Add specific persona/expertise
- **Unclear instructions**: Make explicit and positive
- **No examples**: Add 1-3 concrete demonstrations
- **Missing format**: Specify expected output structure
- **No constraints**: Add reasonable boundaries

### 3. Apply Improvements

For each gap, apply the appropriate fix:

**Role Enhancement:**
```markdown
# Before
"Summarize this article"

# After
"You are a technical editor specializing in making complex topics
accessible. Summarize this article..."
```

**Instruction Clarity:**
```markdown
# Before
"Don't be too verbose"

# After
"Keep each paragraph to 2-3 sentences. Use bullet points
for lists of more than 3 items."
```

**Add Examples:**
```markdown
# Before
"Extract key points"

# After
"Extract key points in this format:
- [Topic]: [Single sentence insight]

Example:
- Performance: Response times improved 40% after caching
- Security: OAuth2 replaced basic auth for API access"
```

### 4. Explain Changes

Document each improvement:
1. What was changed
2. Why (cite the principle)
3. Expected impact

### 5. Validate Improved Prompt

Run the improved prompt through the evaluation checklist:
- [ ] Clearer than original?
- [ ] More actionable?
- [ ] Better scoped?
- [ ] Appropriate length?

## Output Format

```markdown
## Optimized Prompt

[The improved prompt]

## Changes Made

| Change | Principle Applied | Impact |
|--------|-------------------|--------|
| Added role | Persona improves consistency | +clarity |
| Specified format | Explicit > implicit | +structure |
| Added example | 1-3 examples optimal | +accuracy |

## Before/After Comparison

**Before:** [N words], [issues list]
**After:** [N words], [improvements list]
```
