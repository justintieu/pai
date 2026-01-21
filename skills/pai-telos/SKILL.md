---
name: pai-telos
description: Life operating system for tracking goals, beliefs, lessons, and wisdom. Helps maintain alignment between values and actions through reflection and updates. USE WHEN track goals, update beliefs, add lessons, reflect on life, check alignment, record wisdom, review progress, life review.
tools: [Read, Write, Edit, Bash]
---

# PAI Telos

A life operating system for managing your beliefs, goals, lessons, and wisdom. Helps you stay aligned with your values and track meaningful progress.

Telos (τέλος) means "purpose" or "end goal" in Greek - the ultimate aim toward which you're striving.

## Workflows

| Workflow | Use When | File |
|----------|----------|------|
| **Update** | Adding/modifying beliefs, goals, lessons, wisdom | `workflows/update.md` |
| **Review** | Checking progress, identifying blockers | `workflows/review.md` |
| **Align** | Checking consistency between values and actions | `workflows/align.md` |

## Context File Mapping

TELOS content maps to our PAI context structure:

| Content | PAI Location |
|---------|--------------|
| Beliefs | `~/.pai/context/beliefs/` |
| Goals | `~/.pai/context/goals/` |
| Mission | `~/.pai/context/mission/` |
| Wisdom | `~/.pai/memory/learnings/wisdom.md` |
| Lessons | `~/.pai/memory/learnings/lessons.md` |
| Books | `~/.pai/context/ideas/books.md` |

## Core Principles

1. **Version everything** - Create timestamped backups before updates
2. **Track changes** - Log modifications with context
3. **Preserve voice** - Use the user's own words
4. **Make it actionable** - Goals and lessons should be specific
5. **Connect the dots** - See relationships between beliefs, goals, and lessons

## Instructions

### Update Workflow

When adding/modifying content:
1. Parse what's being added and where it belongs
2. Create backup: `~/.pai/backups/telos/YYYY-MM-DD-HHMMSS/`
3. Format content appropriately
4. Update file(s)
5. Log change to `~/.pai/memory/telos-updates.md`

### Review Workflow

When reviewing progress:
1. Read current goals
2. Check in on each: progress, blockers, energy
3. Identify patterns across goals
4. Suggest adjustments (scope, timeline, priority)
5. Capture lessons learned
6. Update goals based on discussion

### Align Workflow

When checking alignment:
1. Read beliefs, mission, and goals
2. Look for: strong alignment, contradictions, missing expression
3. Surface findings as observations, not judgments
4. Ask clarifying questions
5. Suggest adjustments for better coherence

## Content Formatting

**Beliefs:**
```markdown
## [Belief Statement]
[2-3 sentences explaining why and how it guides you]
```

**Goals:**
```markdown
## [Goal Title]
**Why:** [Purpose]
**By when:** [Target date]
**Success looks like:** [Outcomes]
**Current status:** [Progress]
```

**Lessons:**
```markdown
## [Lesson Title]
**Context:** [When/where learned]
**The lesson:** [What you learned]
**Application:** [How you apply it]
```

**Wisdom:**
```markdown
> [Quote]
> — [Source]

[Your reflection on why this matters]
```

## Examples

**Example 1: Adding a goal**
```
User: "Add a goal to ship my side project by Q1"
Claude: Creates backup
        Asks: "What's the project? What does shipped mean?"
        Formats with why/when/success criteria
        Logs change
```

**Example 2: Reviewing progress**
```
User: "Review my goals"
Claude: Reads goals
        For each: "How's progress? What's blocking?"
        Identifies patterns
        Suggests adjustments
```

**Example 3: Alignment check**
```
User: "Am I aligned?"
Claude: Reads beliefs + mission + goals
        Finds: "Belief about balance, but all goals are work"
        Asks: "Temporary sprint, or need rebalancing?"
```

## Resources

- [Update workflow](workflows/update.md) - Add/modify with versioning
- [Review workflow](workflows/review.md) - Progress and adjustments
- [Align workflow](workflows/align.md) - Values and actions consistency
