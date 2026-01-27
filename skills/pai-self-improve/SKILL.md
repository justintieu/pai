---
name: pai-self-improve
description: Self-improvement feedback loop for PAI. Captures learnings, detects patterns, compiles rules, and maintains audit trail. USE WHEN /pai learn, /pai compile-rules, /pai review-rules, self-improvement, learning capture, pattern detection, rule compilation.
tools: Read, Write, Bash, Glob, Grep
model: sonnet
---

# pai-self-improve Skill

Self-improvement feedback loop for PAI. Captures learnings, detects patterns, compiles rules, and maintains audit trail.

## Philosophy

```
Learnings are "source code" - unlimited, captured broadly, never loaded into context.
Rules are "compiled binary" - small (~20 rules target), always available, curated.
Self-improvement is the compiler that transforms learnings into rules.
```

**Why this matters:**
- Learnings accumulate across sessions without context overhead
- Patterns emerge from repeated observations
- Rules encode validated behavior for consistent application
- The pipeline ensures rules are grounded in real experience, not speculation

**Core constraint:** ~20 active rules maximum. Beyond this, context becomes heavy and rules conflict. Curation over accumulation.

## Dependencies

| Dependency | Path | Purpose |
|------------|------|---------|
| Protocol | `core/protocols/self-improvement.md` | Pipeline specification |
| Pattern Detection | `core/hooks/src/lib/pattern-detection.ts` | Pattern matching algorithm |
| Rule Compiler | `core/hooks/src/lib/rule-compiler.ts` | Rule generation and routing |
| Changelog | `core/hooks/src/lib/changelog.ts` | Audit trail management |
| Learnings Storage | `core/memory/learnings/` | Learning files by domain |
| Pattern Index | `core/memory/patterns/` | Pattern tracking and proposals |
| Coding Rules | `core/rules/` | Destination for coding domain rules |
| Context Rules | `core/context/` | Destination for non-coding domain rules |

## Quick Reference

### Workflow Summary

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Learning Capture** | `/pai learn <insight>` or correction | Capture new learning |
| **Pattern Detection** | New learning captured | Check for pattern emergence |
| **Rule Proposal** | Pattern detected (3+ learnings) | Generate rule proposal |
| **Rule Review** | `/pai review-rules` | Review and approve/reject proposals |
| **Compile Rules** | `/pai compile-rules` | Batch pattern detection |
| **Session-End Reminder** | Session ending with pending | Non-blocking reminder |
| **Rule Routing** | Rule approved | Write to correct destination |
| **Learning Archival** | Post-approval | Archive source learnings |
| **Audit Trail Review** | User request | Show change history |
| **Rule Consolidation** | `/pai review-rules --all` | Reduce rule count |

### Domain Routing Table

| Domain | Destination |
|--------|-------------|
| coding | `core/rules/coding.md` |
| git | `core/rules/git.md` |
| api | `core/rules/api.md` |
| testing | `core/rules/testing.md` |
| frontend | `core/rules/frontend.md` |
| security | `core/rules/security.md` |
| communications | `core/context/voice/style-rules.md` |
| scheduling | `core/context/preferences/scheduling.md` |
| finance | `core/context/preferences/finance.md` |
| learning | `core/context/preferences/learning.md` |
| general | `core/context/strategies/general.md` |
| process | `core/context/strategies/process.md` |

## Workflows

### Workflow 1: Learning Capture (/pai learn)

**Trigger:** User runs `/pai learn <insight>` or Claude notices significant correction

**Flow:**

1. Parse insight content
2. Determine domain (from flag or infer from content)
3. Generate 2-5 tags (from flag or infer)
4. Create learning file with frontmatter (date, domain, tags, confidence)
5. Write to `core/memory/learnings/{domain}/YYYY-MM-DD-{slug}.md`
6. Brief acknowledgment: "Noted."
7. Trigger pattern check (Workflow 2)

**CLI helper:** `lib/capture.sh <domain> <slug> <tags>`

**Command syntax:**

```
/pai learn <insight>
/pai learn --domain coding --tags "error-handling,validation" <insight>
```

**Flags:**
- `--domain <domain>` - Specify domain (default: infer from content)
- `--tags <tag1,tag2>` - Specify tags (default: infer from content)
- `--confidence <HIGH|MEDIUM|LOW>` - Specify confidence (default: MEDIUM)

**Example dialogue:**

```
User: /pai learn Always use optional chaining when accessing nested properties

PAI: Noted.
     [Creates: core/memory/learnings/coding/2026-01-27-optional-chaining-nested.md]

     Pattern detected: Defensive Property Access
     Run `/pai review-rules` to see proposal.
```

**Brief acknowledgment:** For mid-session captures, respond with "Noted." to avoid interrupting flow. Only mention pattern detection if one was found.

**Learning file format:**

```yaml
---
date: 2026-01-27
domain: coding
tags:
  - optional-chaining
  - defensive
  - null-safety
confidence: MEDIUM
---

# Optional Chaining for Nested Properties

Always use optional chaining (?.) when accessing nested properties to prevent
runtime errors from null/undefined values.

---
*Captured: 2026-01-27T14:30:00-08:00*
```

---

### Workflow 2: Pattern Detection

**Trigger:** New learning captured (automatic after Workflow 1)

**Flow:**

1. Load pattern index from `core/memory/patterns/index.json`
2. Scan existing learnings in same domain
3. Calculate tag overlap (require 2+ matching tags)
4. If 3+ similar learnings found:
   - Check if pattern already exists (by ID)
   - Check if already rejected (skip if so)
   - Create pattern entry with status 'pending'
   - Trigger rule proposal (Workflow 3)
   - Notify inline: "Pattern detected: {name}. Run `/pai review-rules` to see proposal."

**Detection algorithm (from pattern-detection.ts):**

```typescript
// Pseudocode
const PATTERN_THRESHOLD = 3;
const TAG_OVERLAP_REQUIRED = 2;

for (const learning of newLearnings) {
  const similar = existingLearnings.filter(
    existing =>
      existing.domain === learning.domain &&
      countOverlap(existing.tags, learning.tags) >= TAG_OVERLAP_REQUIRED
  );

  if (similar.length >= PATTERN_THRESHOLD - 1) {
    const group = [learning, ...similar];
    createPattern(group);
  }
}
```

**Pattern ID format:** `{domain}-{primary-tag}` (e.g., `coding-null-safety`)

**Pattern index structure (index.json):**

```json
{
  "lastUpdated": "2026-01-27T14:30:00Z",
  "patterns": {
    "coding-null-safety": {
      "status": "pending",
      "detected": "2026-01-27",
      "domain": "coding",
      "primaryTag": "null-safety",
      "sourceLearnings": [
        "2026-01-20-null-check-before-nested.md",
        "2026-01-23-defensive-null-handling.md",
        "2026-01-27-optional-chaining-nested.md"
      ]
    }
  }
}
```

---

### Workflow 3: Rule Proposal Generation

**Trigger:** Pattern detected (3+ similar learnings)

**Flow:**

1. Load source learnings from pattern
2. Check if auto-apply allowed (see Auto-Apply Determination)
3. If auto-apply:
   - Generate rule content
   - Write directly to destination (per routing table)
   - Update CHANGELOG.md
   - Git commit with self-improve message
   - Brief notification: "Auto-applied rule: {name}"
4. If requires approval:
   - Generate proposal file
   - Write to `core/memory/patterns/pending/{pattern-id}.md`
   - Add to notification queue

**Auto-apply determination (from rule-compiler.ts):**

```typescript
const AUTO_APPLY_ALLOWLIST = [
  'naming-convention',
  'code-formatting',
  'comment-style',
  'import-order',
  'file-naming'
];

const REQUIRE_APPROVAL_TAGS = [
  'behavioral',
  'process',
  'communication',
  'decision',
  'strategy',
  'workflow'
];

function canAutoApply(pattern: Pattern): boolean {
  // Check if pattern is on allowlist
  if (AUTO_APPLY_ALLOWLIST.some(t => pattern.tags.includes(t))) {
    // But block if also has high-impact tags
    if (REQUIRE_APPROVAL_TAGS.some(t => pattern.tags.includes(t))) {
      return false;
    }
    return true;
  }
  return false;
}
```

**Safe default:** Require approval if uncertain. Explicit is safer than implicit.

**Proposal file format (pending/{pattern-id}.md):**

```markdown
---
pattern_id: coding-null-safety
domain: coding
tags: [null-safety, defensive, error-handling]
detected: 2026-01-27
source_learnings:
  - 2026-01-20-null-check-before-nested.md
  - 2026-01-23-defensive-null-handling.md
  - 2026-01-27-optional-chaining-nested.md
destination: core/rules/coding.md
auto_apply: false
---

# Proposed Rule: Defensive Null Safety

## Rule Content

Always use optional chaining (?.) or explicit null checks when accessing nested
properties. This prevents runtime errors from null/undefined values.

**Examples:**
- Prefer: `user?.profile?.name`
- Avoid: `user.profile.name`

## Source Learnings

### 1. 2026-01-20-null-check-before-nested.md
[Summary of learning]

### 2. 2026-01-23-defensive-null-handling.md
[Summary of learning]

### 3. 2026-01-27-optional-chaining-nested.md
[Summary of learning]

---
*Generated by self-improvement protocol*
```

---

### Workflow 4: Rule Review (/pai review-rules)

**Trigger:** User runs `/pai review-rules`

**Flow:**

1. Load pending proposals from `core/memory/patterns/pending/`
2. For each proposal:
   - Display proposed rule
   - Options: Approve / Reject / Edit
3. On Approve:
   - Write rule to destination file (append or create)
   - Update pattern index status to 'approved'
   - Add CHANGELOG entry
   - Git commit with self-improve message
   - Delete proposal file
4. On Reject:
   - Update pattern index status to 'rejected' with reason
   - Add CHANGELOG entry (rejected)
   - Delete proposal file
5. On Edit:
   - Allow user to modify rule content
   - Then proceed as Approve

**CLI helper:** `lib/review.sh --list` (show pending)

**Example dialogue:**

```
User: /pai review-rules

PAI: # Pending Rule Proposals

     ## 1. Defensive Null Safety (coding-null-safety)

     **Domain:** coding
     **Destination:** core/rules/coding.md
     **Source learnings:** 3

     ### Proposed Rule

     Always use optional chaining (?.) or explicit null checks when accessing
     nested properties.

     **Examples:**
     - Prefer: `user?.profile?.name`
     - Avoid: `user.profile.name`

     ---

     **Actions:**
     - (a) Approve - Add rule to core/rules/coding.md
     - (r) Reject - Decline and prevent re-proposal
     - (e) Edit - Modify rule content before approving
     - (s) Skip - Review later

     Your choice?

User: a

PAI: Rule approved and written to core/rules/coding.md.

     CHANGELOG updated.
     Committed: self-improve: add Defensive Null Safety rule

     Source learnings will be archived on next /pai compile-rules.

     ---

     No more pending proposals.
```

**Rejection handling:**

```
User: r

PAI: Why reject this rule? (Optional - press Enter to skip)

User: I prefer explicit null checks over optional chaining

PAI: Pattern 'coding-null-safety' marked as rejected.
     Reason: I prefer explicit null checks over optional chaining

     This pattern will not be re-proposed.
```

---

### Workflow 5: Compile Rules (/pai compile-rules)

**Trigger:** User runs `/pai compile-rules`

**Flow:**

1. Scan all learnings for frontmatter across all domains
2. Run full pattern detection across all learnings
3. Generate proposals for any new patterns found
4. Report: "Found {N} patterns, {M} new proposals"
5. Offer to review new proposals immediately

**Use when:**
- Batch check for accumulated learnings
- Periodic maintenance (monthly)
- After importing learnings from another system

**Example dialogue:**

```
User: /pai compile-rules

PAI: Scanning learnings across all domains...

     Learnings analyzed: 47
     - coding: 18
     - process: 12
     - communications: 8
     - general: 9

     Pattern detection:
     - Existing patterns: 5
     - New patterns detected: 2

     New proposals generated:
     1. Context-Saving Delegation (process-delegation)
     2. Concise Acknowledgments (communications-brevity)

     Run `/pai review-rules` to review the 2 new proposals.
```

---

### Workflow 6: Session-End Reminder

**Trigger:** Session ending with pending proposals

**Flow:**

1. Check `core/memory/patterns/pending/` for files
2. If any exist, remind (non-blocking):
   ```
   Before you go: {N} pending rule proposal(s) awaiting review.
   Run `/pai review-rules` or approve inline now?
   ```

**Non-blocking:** User can skip. Reminder does not force review.

**Example:**

```
PAI: Before you go: 2 pending rule proposal(s) awaiting review.
     Run `/pai review-rules` or approve inline now?

User: skip

PAI: No problem. They'll be waiting for next session.
```

**Inline approval option:**

```
PAI: Before you go: 1 pending rule proposal awaiting review.
     Run `/pai review-rules` or approve inline now?

User: show it

PAI: [Shows proposal summary]

     Approve? (y/n/edit)

User: y

PAI: Rule approved and written to core/rules/coding.md.
     Committed: self-improve: add Defensive Null Safety rule
```

---

### Workflow 7: Rule Routing

**Reference:** Domain routing table in Quick Reference section.

**Flow:**

1. Identify destination from pattern domain
2. Check if destination file exists
3. If exists: Append rule under appropriate section
4. If not exists: Create file with header and rule

**Coding domains (to core/rules/):**
- coding, git, api, testing, frontend, security

**Non-coding domains (to core/context/):**
- communications (voice/style-rules.md)
- scheduling (preferences/scheduling.md)
- finance (preferences/finance.md)
- learning (preferences/learning.md)
- general (strategies/general.md)
- process (strategies/process.md)

**Rule format when appending:**

```markdown
### [Rule Name]

**Source:** Compiled from [N] learnings on [date]
**Confidence:** HIGH

[Rule content - clear, actionable guidance]
```

---

### Workflow 8: Learning Archival

**Trigger:** After rule approval (Claude's discretion on timing)

**Flow:**

1. Identify source learnings from approved pattern
2. Move learning files to `core/memory/learnings/archived/`
3. Preserve original content and metadata
4. Add `archived_to` field in frontmatter
5. Update pattern index to reflect archival
6. Add CHANGELOG entry (archived)

**Not automatic:** Claude decides when learnings are fully "compiled". May batch during `/pai compile-rules`.

**Archived learning format:**

```yaml
---
date: 2026-01-20
domain: coding
tags:
  - null-check
  - defensive
  - error-handling
confidence: MEDIUM
archived_to: core/rules/coding.md
archived_date: 2026-01-27
---

# Null Check Before Nested Properties

[Original content preserved]

---
*Captured: 2026-01-20T10:15:00-08:00*
*Archived: 2026-01-27 (compiled to Defensive Null Safety rule)*
```

---

### Workflow 9: Audit Trail Review

**Trigger:** User wants to understand rule changes

**Flow:**

1. Point user to `core/memory/CHANGELOG.md`
2. Show recent entries if requested
3. For revert needs: `git log --oneline -- core/rules/`

**Changelog location:** `core/memory/CHANGELOG.md`

**Example dialogue:**

```
User: What rules have changed recently?

PAI: Recent self-improvement changes (from CHANGELOG.md):

     ## 2026-01-27

     ### Added
     - **Defensive Null Safety** (coding)
       - Source: 3 learnings
       - Destination: core/rules/coding.md

     ### Rejected
     - **Aggressive Caching** (process)
       - Reason: User prefers explicit caching

     ---

     For full history: `cat core/memory/CHANGELOG.md`
     To revert a change: `git log --oneline -- core/rules/`
```

**Revert flow:**

```
User: I want to revert the Defensive Null Safety rule

PAI: Finding commit...

     Recent commits to core/rules/:
     abc123f self-improve: add Defensive Null Safety rule
     def456g self-improve: add Import Organization rule

     To revert: `git revert abc123f`

     This will create a new commit that undoes the change.
     Proceed?
```

---

### Workflow 10: Rule Consolidation

**Trigger:** User runs `/pai review-rules --all`

**Flow:**

1. Load all rules from destination files
2. Identify overlapping or stale rules
3. Propose consolidation or archival
4. Target: ~20 active rules maximum

**Use when:**
- Rules have accumulated beyond target
- Context getting heavy
- Periodic maintenance (quarterly)

**Example dialogue:**

```
User: /pai review-rules --all

PAI: # Rule Consolidation Review

     Current rule count: 28 (target: ~20)

     ## Consolidation Opportunities

     ### 1. Merge: Null Handling Rules

     Found 3 related rules in core/rules/coding.md:
     - Defensive Null Safety
     - Optional Chaining Preference
     - Null Check Before Access

     **Proposed:** Merge into single "Defensive Property Access" rule

     Merge? (y/n/skip)

     ---

     ### 2. Archive: Outdated Rule

     **Rule:** Legacy Module Format
     **Reason:** Project no longer uses CommonJS
     **Location:** core/rules/coding.md

     Archive this rule? (y/n/skip)
```

---

## Guardrails

Safety constraints on self-modification:

| Guardrail | Description |
|-----------|-------------|
| **File scope** | Only modify `core/rules/` and `core/context/` (never code files) |
| **Auto-apply allowlist** | Only low-risk rules (naming, formatting) auto-apply |
| **Git + CHANGELOG** | Every change tracked with commit and changelog entry |
| **Rejected persistence** | Rejected patterns are never re-proposed |
| **Rule target** | ~20 active rules maximum (curation over accumulation) |
| **User approval** | Behavioral and process rules always require explicit approval |

### Never Modify

- Source code files
- Configuration files (package.json, tsconfig.json, etc.)
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

### Require-Approval Tags

Patterns with these tags always require approval:

- `behavioral` - Changes how PAI behaves
- `process` - Changes workflow or process
- `communication` - Changes communication style
- `decision` - Affects decision-making
- `strategy` - Changes strategic approach
- `workflow` - Modifies execution flow

---

## Anti-Patterns

What NOT to do:

| Anti-Pattern | Why Avoid | Instead |
|--------------|-----------|---------|
| **Loading all learnings** | Consumes context window | Only load during pattern detection |
| **Auto-applying behavioral rules** | High impact, needs user judgment | Require explicit approval |
| **Re-proposing rejected patterns** | User already declined | Track rejection, never re-propose |
| **Immediate forced review** | Interrupts flow | Non-blocking session-end reminder |
| **Complex ML for pattern matching** | Overkill for small corpus | Simple tag overlap algorithm |
| **Rule proliferation** | Context bloat, rule conflicts | Curate to ~20 rules |
| **Skipping CHANGELOG** | Loses audit trail | Always log changes |
| **Direct code modification** | Dangerous self-modification | Only rules/context files |

---

## Shell Scripts

### capture.sh

Learning capture helper for CLI integration.

**Location:** `lib/capture.sh`

**Usage:**
```bash
./capture.sh <domain> <slug> <tags>

# Example
./capture.sh coding optional-chaining "null-safety,defensive,error-handling"
```

**Output:** Path to created learning file

### review.sh

Pending proposal listing for CLI integration.

**Location:** `lib/review.sh`

**Usage:**
```bash
./review.sh --count          # Show count of pending proposals
./review.sh --list           # List all pending pattern IDs
./review.sh --detail <id>    # Show specific proposal content
./review.sh --pending-status # Show patterns with pending status from index
```

---

## Integration Points

### Commands (core/commands/pai.md)

| Command | Invokes Workflow |
|---------|------------------|
| `/pai learn <insight>` | Workflow 1: Learning Capture |
| `/pai compile-rules` | Workflow 5: Compile Rules |
| `/pai review-rules` | Workflow 4: Rule Review |
| `/pai review-rules --all` | Workflow 10: Rule Consolidation |

### Hooks

| Hook | Invokes Workflow |
|------|------------------|
| `SessionEnd` | Workflow 6: Session-End Reminder (if pending proposals) |

### Protocol

All workflows implement the pipeline defined in `core/protocols/self-improvement.md`.

---

## Resources

- [Self-Improvement Protocol](../../protocols/self-improvement.md) - Pipeline specification
- [Pattern Detection](../../hooks/src/lib/pattern-detection.ts) - Detection algorithm
- [Rule Compiler](../../hooks/src/lib/rule-compiler.ts) - Compilation and routing
- [Changelog Utility](../../hooks/src/lib/changelog.ts) - Audit trail management
- [Learnings Index](../../memory/learnings/index.md) - Learning format specification
- [Pattern Index](../../memory/patterns/README.md) - Pattern storage structure
- [CHANGELOG](../../memory/CHANGELOG.md) - Rule change history

---

*Skill: pai-self-improve*
*Version: 1.0*
*Last updated: 2026-01-27*
