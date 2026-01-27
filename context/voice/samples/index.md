# Voice Samples

Writing samples for voice matching. Each file contains one sample with metadata.

## Sample Count: 4

Minimum: 4-6 samples required for effective voice matching.

## Samples by Context

### Work

| File | Formality | Platform | Added |
|------|-----------|----------|-------|
| work-casual-001.md | casual | discord | 2026-01-25 |
| work-formal-003.md | formal | other | 2026-01-25 |

### Personal

| File | Formality | Platform | Added |
|------|-----------|----------|-------|
| personal-casual-002.md | casual | discord | 2026-01-25 |
| personal-casual-004.md | casual | discord | 2026-01-25 |

## Adding Samples

Use the voice capture wizard for guided import:
- "Set up my voice"
- "Import writing samples"
- "Voice wizard"

Or create files directly following this format:

```markdown
---
id: {context}-{formality}-{sequence}
context: work | personal
formality: formal | casual | between
platform: email | slack | text | other
recipient_type: manager | colleague | friend | etc
imported: YYYY-MM-DD
source: imported
anonymized: true | false
---

# Sample

[Your writing sample content here]
```

**File Naming Convention:**
```
{context}-{formality}-{NNN}.md
```
Examples: `work-formal-001.md`, `personal-casual-002.md`

## Managing Samples

- **Add:** Use voice capture wizard or create file directly
- **View:** Read specific sample file
- **Edit:** Modify sample or metadata directly
- **Delete:** Remove file and update this index
- **Reset:** Delete all sample files to start fresh

## Testing Voice

Ask Atlas to write something to test voice matching:

- "Write a thank you note as me"
- "Draft a quick email in my voice"
- "What have you learned about my writing?"

If drafts don't sound right:
1. Check if you have samples matching the context (work vs personal)
2. Check if you have samples matching the formality (formal vs casual)
3. Add more samples from similar contexts

## Sample Selection

When drafting, Atlas:
1. Filters samples by context (work/personal)
2. Filters by formality (formal/casual)
3. Prioritizes matching platform and recipient type
4. Selects 2-4 best matches for inclusion in prompt

More samples = better matching across different situations.
