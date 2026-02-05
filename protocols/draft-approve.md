# Draft-Approve Protocol

The workflow for [Collaborator-level](autonomy-levels.md) domains where AI creates drafts for user review before execution.

## When to Use

This protocol applies to domains configured at **Collaborator** autonomy level, such as:
- Communications (emails, messages)
- Scheduling (calendar events, meeting requests)
- Document preparation

**Key principle:** The AI never executes until explicitly confirmed. Drafts are proposals, not actions.

## Phase 1: Draft Creation

When a Collaborator-level action is needed:

1. **Create draft without executing**
   - Generate complete draft content
   - Do NOT send, schedule, or execute anything
   - Draft exists only in conversation

2. **Present draft clearly**
   - Use clear formatting (blockquotes, code blocks, or preview format)
   - Label as "DRAFT" explicitly
   - Show all relevant details (recipients, times, attachments)

3. **Offer iteration options**
   - "Edit this draft"
   - "Regenerate with different approach"
   - "Approve and send"

**Example:**
```
Here's a draft email:

---
**To:** alice@company.com
**Subject:** Project Update

Hi Alice,

Quick update on the dashboard project...

---

Options: edit / regenerate / approve
```

## Phase 2: Iteration

Handle user feedback on the draft:

### Conversational Edits
On feedback like "make it shorter", "more formal", "add the deadline":
1. Revise draft incorporating feedback
2. Present updated draft
3. Continue iteration or move to approval

### Direct Text Edits
On user providing edited text:
1. Incorporate the exact changes
2. Present updated draft with changes highlighted
3. Continue iteration or move to approval

### Regeneration
On "try again", "different approach", "start over":
1. Generate fresh draft with new approach
2. Present new draft
3. Continue iteration cycle

**Exit to Phase 3:** User says "approve", "looks good", "that's good", or similar positive acknowledgment of draft content.

## Phase 3: Execution Confirmation

**Critical:** Approval of draft content is NOT approval to execute. Always require explicit execution confirmation.

### Confirmation Required
When user approves the draft content, ask for execution confirmation:

```
Draft approved. Ready to send?
[confirm / wait]
```

### Execution Keywords
Only execute on explicit confirmation:
- "confirm"
- "yes"
- "send it"
- "do it"
- "execute"
- "go"
- "proceed"

### Execute and Report
On confirmation:
1. Execute the action (send email, create event, etc.)
2. Report success with details
3. Note any follow-up needed

## Approval Keywords

These phrases trigger **execution** (use in Phase 3 only):

| Phrase | Action |
|--------|--------|
| "confirm" | Execute |
| "yes" | Execute |
| "send it" | Execute |
| "do it" | Execute |
| "execute" | Execute |
| "go" | Execute |
| "proceed" | Execute |
| "go ahead" | Execute |

## Non-Approval Acknowledgments

These phrases sound positive but are NOT execution approval:

| Phrase | Meaning | Action |
|--------|---------|--------|
| "sounds good" | Content looks fine | Move to execution confirmation |
| "looks good" | Content looks fine | Move to execution confirmation |
| "that works" | Content is acceptable | Move to execution confirmation |
| "perfect" | Satisfied with draft | Move to execution confirmation |
| "great" | Positive feedback | Move to execution confirmation |
| "okay" | Acknowledgment | Clarify: "Ready to send?" |
| "sure" | Vague agreement | Clarify: "Shall I send this?" |

**Rule:** When in doubt, ask for explicit confirmation.

## Learning Integration

Edit patterns and rejections are valuable feedback for improving future drafts:

1. **Track patterns** - Note what types of edits user frequently makes
2. **Log to memory** - Store patterns in `memory/learnings/` for Phase 7 analysis
3. **Apply learning** - Use patterns to improve first drafts over time

**Example patterns to track:**
- "User always wants emails shorter"
- "User prefers bullet points over paragraphs"
- "User removes formal greetings"

---

*Protocol: draft-approve*
*Applies to: Collaborator-level domains*
*See also: [Autonomy Levels](autonomy-levels.md)*
