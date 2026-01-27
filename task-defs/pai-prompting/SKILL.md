---
name: pai-prompting
description: Prompt engineering and optimization using structured primitives. USE WHEN meta-prompting, template generation, prompt optimization, create prompt, improve prompt, evaluate prompt, rubric.
tools: Read, Write, Edit
---

# PAI Prompting

Meta-prompting skill for crafting effective prompts using structured primitives and evidence-based practices.

## Core Concepts

### Context Engineering

The foundation of effective prompting is **context engineering** - strategically selecting high-value tokens to maximize desired outcomes while respecting the model's finite attention capacity.

### Five Primitives

Build prompts modularly using these five primitive building blocks:

| Primitive | Purpose | Use When |
|-----------|---------|----------|
| **Roster** | Define agents/personas | Creating specialized agents with identity |
| **Voice** | Calibrate personality | Tuning communication style |
| **Structure** | Organize workflows | Multi-step processes |
| **Briefing** | Hand off context | Delegating tasks to agents |
| **Gate** | Validate output | Quality checkpoints |

## Workflows

| Workflow | Use When |
|----------|----------|
| **optimize** | Improving an existing prompt |
| **evaluate** | Scoring prompt quality with rubrics |
| **generate** | Creating new prompts from primitives |

## Instructions

### 1. Assess the Need

Determine which workflow applies:
- **Optimize**: User has existing prompt to improve
- **Evaluate**: User wants to score/compare prompts
- **Generate**: User needs new prompt from scratch

### 2. Apply Standards

Follow these evidence-based practices:

**Structural Guidelines:**
- Use markdown formatting (not XML tags)
- Keep instructions explicit and positive ("do X" not "don't do Y")
- Explain *why* requirements matter

**Content Optimization:**
- Treat context as precious - maximize signal-to-noise ratio
- Limit examples to 1-3 (research shows diminishing returns)
- Use clear, direct language

**Claude 4.x Specifics:**
- Use "use when..." framing instead of "MUST use"
- Prefer "consider" over "think" when extended thinking is disabled
- Provide fact-based progress updates

### 3. Structure the Prompt

Include these components (select as appropriate):

1. **Context & Motivation** - Why this task matters
2. **Background** - Relevant domain knowledge
3. **Instructions** - Clear step-by-step guidance
4. **Examples** - 1-3 concrete demonstrations
5. **Constraints** - Boundaries and limitations
6. **Output Format** - Expected response structure

### 4. Validate Quality

Run through the evaluation checklist:
- [ ] Clear role/identity defined?
- [ ] Instructions actionable and specific?
- [ ] Examples demonstrate expected behavior?
- [ ] Output format specified?
- [ ] Constraints reasonable and clear?

## Examples

**Example 1: Optimize existing prompt**
```
User: "Improve this prompt: 'Write me a good summary'"

Claude: Applies Standards workflow
- Adds role context
- Specifies summary length and format
- Includes quality criteria
- Returns improved prompt with explanation

Improved: "You are a technical writer. Summarize the following content
in 3-5 bullet points, focusing on key decisions and their rationale.
Each bullet should be one sentence, starting with an action verb."
```

**Example 2: Generate new prompt**
```
User: "Create a prompt for a code reviewer"

Claude: Uses primitives approach
- Roster: Defines reviewer persona
- Voice: Sets constructive, educational tone
- Structure: Organizes review phases
- Gate: Adds quality checklist

Returns complete prompt with explanation of choices
```

**Example 3: Evaluate prompt quality**
```
User: "How good is this prompt?"

Claude: Loads evaluate workflow
- Applies rubric across dimensions
- Scores clarity, specificity, structure
- Provides improvement suggestions
```

## Resources

- [Optimize workflow](workflows/optimize.md) - Improve existing prompts
- [Evaluate workflow](workflows/evaluate.md) - Score prompts with rubrics
- [Generate workflow](workflows/generate.md) - Create prompts from primitives
- [Standards reference](reference/standards.md) - Full prompt engineering guidance
