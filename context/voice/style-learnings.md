# Style Learnings

Captured patterns from your edits and explicit feedback. Used to improve voice matching over time.

## Purpose

This file stores:
1. **Edit patterns** - What you change in drafts (implicit feedback)
2. **Explicit feedback** - Direct instructions about your writing style

These learnings feed into Atlas's drafting to avoid repeating the same mistakes.

## Edit Patterns

Patterns detected from your draft edits. Only significant changes are captured (structural changes, repeated corrections, major adjustments).

*No edit patterns captured yet.*

### Example Format

```markdown
### YYYY-MM-DD: [Pattern Name]
**Session:** [What was being drafted]
**Original:** "[What Atlas wrote]"
**Edited to:** "[What you changed it to]"
**Pattern:** [What this teaches about your style]
**Tags:** [context], [aspect], [category]
```

### Sample Entry

```markdown
### 2026-01-25: Shorter greetings
**Session:** Drafting email to manager
**Original:** "I hope this email finds you well and that you had a wonderful weekend."
**Edited to:** "Hi Sarah,"
**Pattern:** User prefers short, direct greetings in work emails
**Tags:** work, greeting, brevity
```

## Explicit Feedback

Direct instructions you've given about your writing style.

*No explicit feedback captured yet.*

### Example Format

```markdown
### YYYY-MM-DD: [Feedback Summary]
**Feedback:** "[What you said]"
**Applied to:** [context where this applies]
**Tags:** [relevant tags]
```

### Sample Entry

```markdown
### 2026-01-25: No exclamation marks
**Feedback:** "Remember: I never use exclamation marks in work emails"
**Applied to:** work context
**Tags:** work, punctuation, tone
```

## How Learnings Are Used

1. **During drafting:** Atlas checks relevant learnings before generating
2. **Pattern matching:** Tags help identify which learnings apply to current context
3. **Anti-patterns:** Known preferences become explicit "do not" instructions

## Managing Learnings

- **View:** "What have you learned about my writing?"
- **Add explicit feedback:** Just tell Atlas directly ("Remember, I always...")
- **Remove:** Edit this file to delete entries that no longer apply
- **Reset:** Clear this file to start fresh

## Integration Notes

This file is designed for Phase 7 self-improvement integration. Learnings here will be analyzed for pattern detection and rule generation.

**Tagging convention for integration:**
- Context: `work`, `personal`
- Aspect: `greeting`, `sign-off`, `tone`, `length`, `punctuation`, `structure`
- Category: `brevity`, `formality`, `vocabulary`, `phrasing`
