---
name: generate
description: Create new prompts from scratch using primitives
---

# Generate Prompt Workflow

Build prompts from scratch using structured primitives.

## Steps

### 1. Clarify Requirements

Gather essential information:
- **Purpose**: What should the prompt accomplish?
- **Audience**: Who/what will execute this prompt?
- **Context**: What background is needed?
- **Output**: What format/structure is expected?

### 2. Select Primitives

Choose which primitives to use:

| Primitive | Include When |
|-----------|--------------|
| Roster | Need defined agent/persona |
| Voice | Specific communication style needed |
| Structure | Multi-step workflow |
| Briefing | Handing off to another agent |
| Gate | Quality validation needed |

### 3. Build the Prompt

Assemble components in this order:

#### A. Identity (Roster Primitive)
```markdown
# Role
You are [ROLE] with expertise in [DOMAIN].

# Perspective
You approach problems [PERSPECTIVE DESCRIPTION].

# Traits
- [Trait 1]: [How it manifests]
- [Trait 2]: [How it manifests]
```

#### B. Voice (Voice Primitive)
```markdown
# Communication Style
- Tone: [formal/casual/technical/friendly]
- Length: [concise/detailed/adaptive]
- Format preference: [bullets/prose/structured]
```

#### C. Task Structure (Structure Primitive)
```markdown
## Task

[Clear description of what to accomplish]

## Steps

1. [First step with clear action]
2. [Second step with clear action]
3. [Third step with clear action]

## Deliverables

- [Expected output 1]
- [Expected output 2]
```

#### D. Context (Briefing Primitive)
```markdown
## Background

[Relevant context the executor needs]

## Constraints

- [Constraint 1]
- [Constraint 2]

## Resources

- [Available information/tools]
```

#### E. Quality Check (Gate Primitive)
```markdown
## Validation Checklist

Before delivering output:
- [ ] [Quality criterion 1]
- [ ] [Quality criterion 2]
- [ ] [Quality criterion 3]

If any check fails: [Remediation action]
```

### 4. Add Examples

Include 1-3 examples demonstrating expected behavior:

```markdown
## Examples

**Example 1: [Scenario]**
Input: [Sample input]
Output: [Expected output]

**Example 2: [Different scenario]**
Input: [Sample input]
Output: [Expected output]
```

### 5. Specify Output Format

Define the expected response structure:

```markdown
## Output Format

[Description or template of expected format]

Example:
```
[Concrete example of output structure]
```
```

### 6. Validate the Prompt

Before delivering, verify:
- [ ] Role clearly defined
- [ ] Instructions are actionable
- [ ] Examples demonstrate behavior
- [ ] Output format specified
- [ ] Constraints are reasonable
- [ ] Length is appropriate

## Output Format

```markdown
## Generated Prompt

---
[The complete prompt]
---

## Primitives Used

- **Roster**: [Yes/No - description]
- **Voice**: [Yes/No - description]
- **Structure**: [Yes/No - description]
- **Briefing**: [Yes/No - description]
- **Gate**: [Yes/No - description]

## Design Decisions

1. [Why certain primitives were included/excluded]
2. [Why specific examples were chosen]
3. [Any trade-offs made]

## Usage Notes

[How to use this prompt, any customization points]
```
