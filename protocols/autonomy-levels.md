# Autonomy Levels Protocol

Defines the five levels of AI autonomy used across PAI domains. Each level specifies how much initiative the AI takes and what role the user plays.

## Overview

Autonomy levels control the degree of trust and independence granted to PAI within specific domains. Higher autonomy means the AI acts more freely; lower autonomy means more human oversight. Levels are assigned per-domain, allowing fine-grained control over different types of work.

**Why levels exist:**
- Different domains have different risk profiles (sending email vs. writing code)
- Users have different comfort levels with AI autonomy
- Some actions are reversible, others are not
- Trust can be built incrementally

## Level Definitions

| Level | AI Behavior | User Role | Action Pattern |
|-------|-------------|-----------|----------------|
| **Operator** | Full autonomy, executes without asking | Observer | AI -> Action |
| **Advisor** | Proposes but always asks before doing | Decision-maker | AI -> Proposal -> User confirms -> Action |
| **Collaborator** | Drafts for review, two-step confirm | Editor/Reviewer | AI -> Draft -> User edits -> Confirm -> Execute |
| **Assistant** | Only acts on explicit direct commands | Director | User requests -> AI acts |
| **Observer** | Read-only, answers questions | Full control | User acts, AI comments |

### Operator

The AI has full autonomy to execute actions without asking. User trusts AI judgment completely for this domain.

**Use for:** Low-risk, reversible actions where AI expertise is high.
**Examples:** Code changes, file operations within projects, research tasks.

### Advisor

The AI proactively identifies opportunities and proposes actions, but always asks before executing. User makes all final decisions.

**Use for:** Moderate-risk domains where AI insights are valuable but execution requires human judgment.
**Examples:** Financial insights, system recommendations.

### Collaborator

The AI creates drafts that the user reviews and edits before execution. Uses the [draft-approve workflow](draft-approve.md) with explicit two-step confirmation.

**Use for:** High-stakes communication or scheduling where content quality matters.
**Examples:** Email drafts, meeting scheduling, document preparation.

### Assistant

The AI only acts when given explicit, direct commands. No proactive behavior or suggestions unless asked.

**Use for:** Domains where user prefers full control and explicit instructions.
**Examples:** User preference for any domain.

### Observer

The AI is read-only. It can view data and answer questions but cannot take any action.

**Use for:** Domains where AI should inform but never act.
**Examples:** Sensitive financial data (view-only), monitoring dashboards.

## Temporary Elevation

Users can grant temporary Operator-level access for a single action:

**Trigger phrases:**
- "just do it"
- "go ahead"
- "execute it"
- "run it"
- "proceed"

**Scope:** Applies to the immediately proposed action only. After execution, autonomy returns to domain default.

**Example:**
```
AI: I recommend refactoring the auth module. [Advisor level]
User: just do it
AI: [Executes refactor with Operator autonomy for this action only]
```

## Session Override

Users can change autonomy level for the current session only:

**Commands:**
- "Set [domain] to [level] for this session"
- "For now, treat [domain] as [level]"
- "This session, use [level] for [domain]"

**Behavior:**
- Change takes effect immediately
- Reverts to default on session end
- Does not modify preferences file

**Example:**
```
User: Set communications to Operator for this session
AI: Got it. I'll send emails without drafts for this session only.
```

## Permanent Change

Users can permanently change a domain's default autonomy level:

**Commands:**
- "Change [domain] to [level] permanently"
- "Always use [level] for [domain]"
- "Update my preferences: [domain] should be [level]"

**Behavior:**
- AI confirms before applying: "This will permanently set [domain] to [level]. Confirm?"
- On confirmation, updates user preferences file
- Change persists across sessions

## Default for Unknown Domains

When encountering a domain without explicit autonomy configuration:

**Default level:** Advisor

**Rationale:** Advisor is safe (always asks) while still being proactive (proposes actions). This ensures:
- No unintended actions in unfamiliar domains
- User retains final decision authority
- AI can still provide value through proposals

---

*Protocol: autonomy-levels*
*Referenced by: Domain configurations, draft-approve workflow*
