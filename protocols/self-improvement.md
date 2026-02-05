# Self-Improvement Protocol

Defines the learnings-to-rules pipeline: how PAI captures insights, detects patterns, and compiles them into actionable rules.

## Overview

The self-improvement system treats learnings as "source code" and rules as "compiled binaries":

| Concept | Analogy | Description |
|---------|---------|-------------|
| **Learning** | Source code | Raw insight captured during a session |
| **Pattern** | Intermediate representation | 3+ similar learnings grouped together |
| **Rule** | Compiled binary | Actionable guidance derived from patterns |

**Why this matters:**
- Learnings accumulate across sessions
- Patterns emerge from repeated observations
- Rules encode validated behavior for consistent application
- The pipeline ensures rules are grounded in real experience, not speculation

**Flow:**
```
Session 1: Learning A captured
Session 2: Learning B captured (similar)
Session 3: Learning C captured (similar)
→ Pattern detected: A + B + C
→ Rule proposal generated
→ User approves
→ Rule written to appropriate location
→ Source learnings archived
```

## Learning Capture

Learnings enter the system through multiple channels:

### Real-Time Capture

**Mid-session corrections:** When a user corrects PAI behavior mid-session, capture the insight immediately:

```
User: No, don't use var, use const
PAI: Noted. [Captures: prefer-const-over-var]
```

**Explicit command:** User invokes `/pai learn <insight>`:

```
/pai learn Always check for null before accessing nested properties
PAI: Noted.
```

**Brief acknowledgment:** For mid-session captures, respond with "Noted." and continue. Do not interrupt flow with verbose confirmations.

### Session-End Capture

**WorkCompletionLearning hook:** At session end, review significant discoveries:
- New patterns that emerged
- Corrections that were made
- Approaches that worked well
- Mistakes to avoid

This hook should surface 0-3 learnings per session. Not every session produces learnings.

### Capture Principles

1. **Capture immediately** - Don't wait for session end
2. **Capture concisely** - One insight per learning
3. **Capture context** - Include enough detail to understand later
4. **Don't over-capture** - Not every observation is a learning

## Learning Format

Each learning is stored as a markdown file with structured frontmatter.

### Required Fields

```yaml
---
date: YYYY-MM-DD
domain: <domain-value>
tags:
  - tag-1
  - tag-2
  - tag-3
confidence: HIGH|MEDIUM|LOW
---

# Learning Title

[Learning content - what was discovered, why it matters]
```

### Domain Values

| Domain | Description | Rule Routing Target |
|--------|-------------|---------------------|
| `technical` | General technical knowledge | `~/.pai/rules/technical.md` |
| `process` | Better ways of working | `core/context/strategies/` |
| `mistake` | Things that didn't work | `~/.pai/rules/anti-patterns.md` |
| `coding` | Code patterns and practices | `~/.pai/rules/coding.md` |
| `communications` | Writing and communication | `core/context/voice/style-rules.md` |
| `scheduling` | Time and calendar management | `core/context/preferences/scheduling.md` |
| `finance` | Financial patterns | `~/.pai/rules/finance.md` |
| `learning` | Learning and goal tracking | `~/.pai/rules/learning.md` |
| `general` | Miscellaneous | `core/context/strategies/` |

### Tags

- **Count:** 2-5 tags per learning
- **Selection:** Claude's discretion based on content
- **Purpose:** Enable pattern matching across learnings
- **Style:** lowercase, hyphenated (e.g., `context-management`, `error-handling`)

### Confidence Levels

| Level | Meaning | When to Use |
|-------|---------|-------------|
| `HIGH` | Verified pattern | Observed 2+ times, consistently valuable |
| `MEDIUM` | Promising | Single observation with clear rationale |
| `LOW` | Observation | Noted but not yet validated |

### File Storage

```
~/.pai/memory/learnings/
  technical/
    2026-01-27-prefer-const-over-var.md
  coding/
    2026-01-27-null-check-before-nested.md
  process/
    2026-01-27-context-saving-pattern.md
  archived/
    [learnings that became rules]
```

## Pattern Detection

Patterns are detected when similar learnings accumulate.

### Detection Threshold

**Minimum:** 3 learnings required to form a pattern candidate

**Similarity criteria (both required):**
1. Same domain
2. 2+ overlapping tags

### Detection Trigger

Pattern detection runs:
- On every new learning capture (check against existing learnings)
- On `/pai compile-rules` command (full scan)

### Detection Algorithm

```
For each new learning L:
  1. Load learnings in same domain
  2. For each existing learning E:
     - Count tag overlap
     - If overlap >= 2, mark as similar
  3. Group similar learnings
  4. If group size >= 3, flag as pattern candidate
```

### Pattern Storage

Detected patterns are stored in `~/.pai/memory/patterns/`:

```yaml
---
id: pattern-001
status: pending|approved|rejected
detected: 2026-01-27
domain: coding
tags: [null-check, defensive, error-handling]
source_learnings:
  - 2026-01-20-null-check-before-nested.md
  - 2026-01-23-defensive-null-handling.md
  - 2026-01-27-optional-chaining-preference.md
---

# Proposed Rule: Defensive Null Handling

[Generated rule content based on source learnings]
```

## Rule Proposal

When a pattern is detected, a rule proposal is generated.

### Proposal Generation

1. **Analyze source learnings** - Extract common theme and guidance
2. **Draft rule content** - Clear, actionable statement
3. **Determine routing** - Based on domain (see Rule Routing)
4. **Generate proposal file** - Store in patterns/ with status: pending

### Notification

**Hybrid notification approach:**

1. **Inline notification** (immediate):
   ```
   Pattern detected: Defensive Null Handling
   Run `/pai review-rules` to see proposal.
   ```

2. **Session-end reminder** (if not reviewed):
   ```
   Pending rule proposals: 1
   Run `/pai review-rules` to review.
   ```

### Approval Flow

User reviews proposal via `/pai review-rules`:

| Action | Result |
|--------|--------|
| **Approve** | Rule written, learnings archived, CHANGELOG updated |
| **Reject** | Pattern marked as reviewed, won't re-propose |
| **Edit** | Modify proposal, then approve or reject |

## Rule Routing

Rules are written to different locations based on domain.

### Routing Table

| Domain | Target Location | Format |
|--------|-----------------|--------|
| `coding` | `~/.pai/rules/coding.md` | Append to existing |
| `technical` | `~/.pai/rules/technical.md` | Append to existing |
| `mistake` | `~/.pai/rules/anti-patterns.md` | Append to existing |
| `communications` | `core/context/voice/style-rules.md` | Append to existing |
| `scheduling` | `core/context/preferences/scheduling.md` | Append to existing |
| `finance` | `~/.pai/rules/finance.md` | Append to existing |
| `learning` | `~/.pai/rules/learning.md` | Append to existing |
| `process` | `core/context/strategies/{name}.md` | New file |
| `general` | `core/context/strategies/{name}.md` | New file |

### Rule Format

When appending to existing files:

```markdown
### [Rule Name]

**Source:** Compiled from [N] learnings on [date]
**Confidence:** HIGH

[Rule content - clear, actionable guidance]
```

When creating new strategy files:

```markdown
# [Strategy Name]

**Compiled:** [date]
**Source learnings:** [count]
**Domain:** [domain]

## Guidance

[Strategy content]

---
*Compiled from learnings by self-improvement protocol*
```

## Guardrails

Safety constraints on self-modification.

### Allowed Modifications

**Only these directories:**
- `~/.pai/rules/` - Rule files
- `core/context/` - Context files (voice, preferences, strategies)

**Never modify:**
- Source code files
- Configuration files
- System files
- Files outside PAI infrastructure

### Auto-Apply Allowlist

Low-risk rules that can be applied without explicit approval:

| Type | Examples |
|------|----------|
| `naming-convention` | File naming, variable naming patterns |
| `code-formatting` | Indentation, bracket style preferences |
| `comment-style` | Documentation comment format |
| `import-order` | Module import organization |
| `file-naming` | File naming conventions |

**All other rules require explicit user approval.**

### Change Tracking

Every rule modification:
1. **Git commit** - Atomic commit with clear message
2. **CHANGELOG.md** - Entry describing the change
3. **Pattern status** - Updated to `approved`

Commit message format:
```
rule(domain): add [rule-name]

Compiled from [N] learnings:
- [learning-1]
- [learning-2]
- [learning-3]
```

## Archival

Managing learnings after rules are compiled.

### Source Learning Archival

After a rule is approved:
1. Move source learnings to `~/.pai/memory/learnings/archived/`
2. Preserve original content and metadata
3. Add `archived_to` field referencing the rule

**Timing:** Claude's discretion. Can archive immediately or batch during `/pai compile-rules`.

### Rejected Pattern Handling

When a pattern is rejected:
1. Mark pattern status as `rejected`
2. Add `rejection_reason` if provided
3. Pattern won't be re-proposed
4. Source learnings remain active (may form different pattern)

### Pattern Index

Maintain index at `~/.pai/memory/patterns/index.md`:

```markdown
# Pattern Index

## Pending
- pattern-001: Defensive Null Handling (3 learnings)

## Approved
- pattern-002: Context-Saving Delegation (2026-01-25)

## Rejected
- pattern-003: Aggressive Caching (2026-01-20) - User prefers explicit caching
```

---

*Protocol: self-improvement*
*Referenced by: /pai learn, /pai compile-rules, /pai review-rules*
*See also: [Learning Format](../memory/learnings/index.md)*
