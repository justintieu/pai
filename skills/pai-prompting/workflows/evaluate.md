---
name: evaluate
description: Score prompt quality using structured rubrics
---

# Evaluate Prompt Workflow

Systematically assess prompt quality using multi-dimensional rubrics.

## Evaluation Dimensions

Score each dimension 1-5:

### 1. Clarity (Weight: 25%)

| Score | Description |
|-------|-------------|
| 5 | Crystal clear, no ambiguity |
| 4 | Clear with minor ambiguities |
| 3 | Generally clear, some confusion possible |
| 2 | Multiple unclear elements |
| 1 | Vague and confusing |

**Indicators:**
- Instructions use active voice
- No jargon without definition
- Single interpretation possible

### 2. Specificity (Weight: 25%)

| Score | Description |
|-------|-------------|
| 5 | Precise requirements, concrete criteria |
| 4 | Mostly specific, few vague areas |
| 3 | Mix of specific and general |
| 2 | Mostly general, few specifics |
| 1 | Entirely vague |

**Indicators:**
- Quantifiable targets when possible
- Clear success criteria
- Explicit scope boundaries

### 3. Structure (Weight: 20%)

| Score | Description |
|-------|-------------|
| 5 | Optimal organization, logical flow |
| 4 | Well-organized, good flow |
| 3 | Adequate organization |
| 2 | Poor organization, jumbled |
| 1 | No discernible structure |

**Indicators:**
- Logical section ordering
- Appropriate use of formatting
- Clear hierarchy of information

### 4. Completeness (Weight: 15%)

| Score | Description |
|-------|-------------|
| 5 | All necessary components present |
| 4 | Most components, minor gaps |
| 3 | Core components present |
| 2 | Missing important elements |
| 1 | Severely incomplete |

**Components to check:**
- Role/persona
- Task description
- Output format
- Constraints
- Examples (if needed)

### 5. Efficiency (Weight: 15%)

| Score | Description |
|-------|-------------|
| 5 | Maximum signal, zero waste |
| 4 | Efficient, minimal redundancy |
| 3 | Acceptable length |
| 2 | Notable redundancy |
| 1 | Verbose, low signal-to-noise |

**Indicators:**
- No repeated information
- Each word serves a purpose
- Context is valuable, not filler

## Scoring Process

### Step 1: Read Completely
Read the entire prompt before scoring.

### Step 2: Score Each Dimension
For each dimension:
1. Quote specific evidence from the prompt
2. Explain alignment or gaps
3. Assign score with reasoning

### Step 3: Calculate Weighted Score
```
Total = (Clarity * 0.25) + (Specificity * 0.25) + (Structure * 0.20)
      + (Completeness * 0.15) + (Efficiency * 0.15)
```

### Step 4: Determine Grade

| Score Range | Grade | Assessment |
|-------------|-------|------------|
| 4.5 - 5.0 | A | Excellent, minimal improvement needed |
| 3.5 - 4.4 | B | Good, some improvements possible |
| 2.5 - 3.4 | C | Adequate, significant room for improvement |
| 1.5 - 2.4 | D | Poor, major revision needed |
| 1.0 - 1.4 | F | Inadequate, complete rewrite needed |

## Output Format

```markdown
## Prompt Evaluation

### Scores

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Clarity | X/5 | 25% | X.XX |
| Specificity | X/5 | 25% | X.XX |
| Structure | X/5 | 20% | X.XX |
| Completeness | X/5 | 15% | X.XX |
| Efficiency | X/5 | 15% | X.XX |
| **Total** | | | **X.XX** |

### Grade: [A/B/C/D/F]

### Strengths
- [What works well]

### Improvement Areas
- [Specific suggestions with examples]

### Revised Prompt (if requested)
[Improved version addressing identified issues]
```
