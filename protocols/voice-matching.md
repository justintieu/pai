# Voice Matching Protocol

Protocol for drafting messages in the user's authentic voice using writing samples.

## When to Use

This protocol applies when:
- Communications domain requests at Collaborator level
- User asks to draft email, message, or any written communication
- Keywords: draft, compose, write, email, message, reply, send

**Prerequisites:**
- Minimum 4 samples in `context/voice/samples/`
- If insufficient samples: redirect to [voice-capture](voice-capture.md) wizard

**Check readiness:**
```
1. Read context/voice/samples/index.md
2. Check Sample Count value
3. If count < 4: "I need more writing samples to draft in your voice. Run the voice wizard? (Say 'set up my voice')"
4. If count >= 4: proceed with drafting
```

## Sample Selection

Load 2-4 samples per draft, not all samples (context efficiency).

**Selection Logic:**

```
1. Filter by context tags (work/personal)
   - Match user's stated or inferred context

2. Filter by formality (formal/casual)
   - Match request tone or recipient relationship

3. If recipient known, prioritize similar recipient_type
   - Manager, colleague, friend, client, etc.

4. If platform known, prioritize matching platform
   - Email, slack, text, other

5. Select top 2-4 matches for inclusion in prompt
   - Prefer diversity within the filtered set
   - Recent samples over older ones if equal match
```

**Why limit to 2-4:**
- Diminishing returns after 4-5 samples
- Preserves context for draft iteration
- Faster response times
- More consistent voice extraction

## Prompt Template

Use this template when constructing the drafting prompt:

```markdown
You are drafting a {type} in the user's authentic voice.

## User's Writing Style

Study these examples of their actual writing:

---
**Sample 1** ({context}, {formality})
{sample_content_1}
---

---
**Sample 2** ({context}, {formality})
{sample_content_2}
---

[Additional samples as needed, up to 4 total]

## Style Observations

Based on these samples, notice the user's:
- Greeting style (how they open messages)
- Sentence length and structure
- Vocabulary choices (formal vs colloquial)
- Sign-off patterns (how they close)
- Tone and energy level
- Punctuation habits

## Known Preferences

{from context/voice/style-learnings.md if relevant entries exist}

If no learnings: "No specific preferences recorded yet."

## Anti-Patterns

CRITICAL - Do NOT use:
- "I hope this finds you well"
- "Please don't hesitate to"
- "I wanted to reach out"
- "Please let me know if you have any questions or concerns"
- Excessive hedging ("just", "maybe", "perhaps" overuse)
- Overly formal language unless samples show it
- Exclamation marks unless samples show them
- Long greetings or sign-offs unless samples show them
- Adverb-heavy sentences

Match the user's actual style from samples. Sound like them, not like AI.

## Task

Draft a {type} to {recipient} about {topic}.
Context: {work/personal}, {formal/casual}

Write in their authentic voice as demonstrated in the samples.
```

## Draft Presentation

Present drafts in this format:

```markdown
> **DRAFT**
>
> [Complete draft content here]
>
> [Sign-off]
> [Name]

**Options:** Approve / Edit / Regenerate
(Or just tell me what to change)
```

**Format notes:**
- Blockquote for visual distinction
- Bold DRAFT label for clarity
- Complete draft (not truncated)
- Options on separate line
- Accept natural language alternatives

## Revision Handling

When user requests changes:

**"Make it shorter" / "Too long":**
- Revise keeping the same structure
- Preserve key points
- Include current draft as base

**User provides edits:**
- Incorporate exact changes
- Show changes with highlighting

**"Try again" / "Different approach":**
- Regenerate with fresh approach
- Still include current draft context to preserve any implicit preferences

**Revision format:**

```markdown
> **DRAFT** (revised)
>
> [Opening content...]
> ~~[Old text]~~ **[New text]**
> [Remaining content...]
>
> Best,
> Justin

**Changed:** [Brief description of what changed]
```

**IMPORTANT:** Always include the current draft as base when revising. This preserves user edits and prevents losing work.

## Feedback Capture

Capture patterns for `context/voice/style-learnings.md`:

### When to Capture

**Structural changes:**
- User changes greeting style
- User changes sign-off pattern
- User restructures paragraphs

**Repeated corrections:**
- Same type of edit 3+ times becomes a pattern
- Track across sessions

**Major adjustments:**
- Significant tone changes
- Large length adjustments
- Formality shifts

**Explicit feedback:**
- User says "remember: ..."
- User says "I always..." or "I never..."
- User gives direct style instruction

### Capture Format

For edit patterns, add to `## Edit Patterns` section:

```markdown
### {DATE}: {Brief pattern description}
**Session:** {What was being drafted - recipient/purpose}
**Original:** "{The text before user edit}"
**Edited to:** "{The text after user edit}"
**Pattern:** {What this reveals about user preference}
**Tags:** {context}, {element}, {trait}
```

For explicit feedback, add to `## Explicit Feedback` section:

```markdown
### {DATE}: {Brief feedback summary}
**Feedback:** "{User's exact words}"
**Applied to:** {context - work/personal/all}
**Tags:** {context}, {element}, {trait}
```

### What NOT to Capture

- Minor typo fixes
- One-off context-specific changes
- Factual corrections (not style)
- Approved drafts (these do NOT become voice samples)

## Context Ambiguity

When context is unclear:

**Ask clarification:**
"Is this for work or personal?"

**Default behavior:**
- Ambiguous professional contexts → work-formal
- Ambiguous personal contexts → personal-casual
- Unknown recipient → neutral-professional

**Trust explicit signals:**
- User says "casual" → casual even if recipient sounds formal
- User says "work" → work samples even if tone is casual
- User specifies formality → honor their choice

## Quick Reference

| Step | Action |
|------|--------|
| 1 | Check sample count >= 4 |
| 2 | Select 2-4 matching samples |
| 3 | Load relevant style-learnings |
| 4 | Construct prompt with template |
| 5 | Generate draft |
| 6 | Present with DRAFT label + options |
| 7 | Iterate via draft-approve protocol |
| 8 | Capture significant feedback |

---

*Protocol: voice-matching*
*Requires: voice-capture (for samples), draft-approve (for workflow)*
*See also: [Voice Capture](voice-capture.md), [Draft-Approve](draft-approve.md)*
