# Voice Capture Wizard

Guided import of writing samples for voice matching.

## Trigger Phrases

- "Set up my voice"
- "Import writing samples"
- "Teach you my writing style"
- "Voice wizard"
- "Add voice sample" (for adding more after initial setup)

## Wizard Flow

### Step 1: Introduction

Present purpose and expectations:

```
I'll help you import writing samples so I can draft messages in your voice.

I need 4-6 samples of your actual writing. These can be:
- Emails you've sent
- Slack/Teams messages
- Text messages
- Any written communication

The more variety (work vs personal, formal vs casual), the better I can match your voice in different situations.

**Ready to start?**
```

### Step 2: Sample Import Loop

For each sample:

**2a. Request sample:**
```
**Sample {N} of 4-6**

Paste a piece of writing you want me to learn from.
(Previous messages, emails, anything in your voice)
```

**2b. After paste, request categorization:**
```
Got it! Now let me categorize this:

**Context:** Is this work or personal?
**Formality:** Formal, casual, or somewhere in between?
**Platform:** Email, slack, text, or other?

(Just answer like "work, casual, slack" or I'll ask follow-up)
```

**2c. Offer anonymization:**
```
**Anonymize?** I can replace names and dates with placeholders like [NAME] and [DATE] for privacy. Want me to do that? (y/n)
```

If yes:
- Apply anonymization patterns (see below)
- Show anonymized version for confirmation
- User can adjust if needed

**2d. Save and continue:**
- Save to file with naming: `{context}-{formality}-{NNN}.md`
- Update samples/index.md
- Prompt: "Sample saved! {remaining} more to go, or say 'done' if you have enough."

### Step 3: Completion

When 4+ samples collected or user says 'done':

```
Voice capture complete! I have {N} samples covering:
- Work: {count} ({formality breakdown})
- Personal: {count} ({formality breakdown})

You can:
- **Test it:** "Write a thank you note as me"
- **Add more:** "Add another sample"
- **View samples:** "Show my voice samples"
- **Reset:** "Clear all samples and start over"

Your samples are in `context/voice/samples/`.
```

## Sample File Format

Each sample is stored as a markdown file with YAML frontmatter.

### Frontmatter Fields

| Field | Values | Required |
|-------|--------|----------|
| id | `{context}-{formality}-{sequence}` | Yes |
| context | `work` or `personal` | Yes |
| formality | `formal`, `casual`, or `between` | Yes |
| platform | `email`, `slack`, `text`, `other` | Yes |
| recipient_type | `manager`, `colleague`, `friend`, etc. | Optional |
| imported | `YYYY-MM-DD` | Yes |
| source | `imported` | Yes |
| anonymized | `true` or `false` | Yes |

### Example File

```markdown
---
id: work-formal-001
context: work
formality: formal
platform: email
recipient_type: executive
imported: 2026-01-25
source: imported
anonymized: true
---

# Sample

Hi [NAME],

Thank you for your time yesterday. I wanted to follow up on our discussion about the Q3 priorities...

Best regards,
[USER]
```

### File Naming Convention

```
{context}-{formality}-{sequence}.md
```

Examples:
- `work-formal-001.md`
- `work-casual-002.md`
- `personal-casual-003.md`
- `personal-formal-004.md`

Sequence is three digits, zero-padded, incrementing across all samples (not per category).

## Anonymization Patterns

Simple placeholder replacement for sample privacy.

### Replacement Rules

| Pattern | Placeholder | Example |
|---------|-------------|---------|
| Person names | [NAME] | "Hi Sarah" -> "Hi [NAME]" |
| Company names | [COMPANY] | "at Acme Corp" -> "at [COMPANY]" |
| Dates | [DATE] | "January 25th" -> "[DATE]" |
| Times | [TIME] | "at 3pm" -> "at [TIME]" |
| Phone numbers | [PHONE] | "555-1234" -> "[PHONE]" |
| Email addresses | [EMAIL] | "bob@example.com" -> "[EMAIL]" |
| Addresses | [ADDRESS] | "123 Main St" -> "[ADDRESS]" |
| Money amounts | [AMOUNT] | "$500" -> "[AMOUNT]" |
| Project names | [PROJECT] | "Dashboard v2" -> "[PROJECT]" |
| User's own name | [USER] | Sign-off name -> "[USER]" |

### Anonymization Process

1. User pastes sample
2. Claude identifies likely PII using patterns
3. Claude shows anonymized version
4. User confirms or adjusts placeholders
5. Store anonymized version (original never stored)

### Notes

- Anonymization is **optional** - offered on each import
- User can edit placeholders if needed
- **Conservative approach:** Only replace clear PII, preserve style-relevant words
- Emotional words, greetings, sign-offs are NOT replaced (they define style)

## Notes

### Sample Acceptance

- Accept any sample the user provides
- No validation or quality checks
- User knows their own writing best
- Short samples are fine (even a few sentences)

### User Control

- User has full control to edit, delete, or reset samples at any time
- All samples stored in `context/voice/samples/` for direct access
- No automatic modification of samples after import

### Integration

- Samples are used by voice matching during draft generation
- Style learnings from feedback go to `style-learnings.md`, not here
- This protocol only handles import; draft-approve handles output

## Related

- [Voice System](../context/voice/index.md) - Overview of voice matching
- [Sample Catalog](../context/voice/samples/index.md) - Where samples are stored
- [Style Learnings](../context/voice/style-learnings.md) - Feedback patterns
- [Draft-Approve](draft-approve.md) - How drafts are presented
