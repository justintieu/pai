# Time Blocking Protocol

Advisory time blocking recommendations (suggestions only, no auto-create).

## Problem Being Solved

- Users want help identifying when to do deep work
- Calendar gaps are hard to spot visually
- AI shouldn't auto-create events without explicit request
- **Solution:** Advisory time blocking (suggestions only)

## Trigger Conditions

**Only when user explicitly asks.** Examples:
- "Help me find focus time"
- "Where can I do deep work?"
- "Time blocking suggestions"
- "When am I free for deep work?"
- "Find me some focus blocks"

**NOT proactive:** Do not suggest time blocking unprompted or on a recurring basis.

## Types of Recommendations

### Focus Time Opportunities

Gaps of 90+ minutes with no meetings.

**Ideal for:** Deep work, creative tasks, complex projects.

**Format:** "[Day] [time range] (no meetings, good for deep work)"

### Buffer Recommendations

Where back-to-back meetings need breathing room.

**Format:** "Add 15-min buffer before your [time] [meeting]"

### Overload Alerts

Days that need restructuring due to excessive meetings.

**Format:** "[Day] has [X] hours of meetings - consider rescheduling one"

## Response Format

```
Based on your calendar for [timeframe], here are my suggestions:

**Focus Time Opportunities:**
- [Day] [time range] (no meetings, good for deep work)
- [Day] [time range] (afternoon gap)

**Buffer Recommendations:**
- Add 15-min buffer before your [time] [meeting]

**Overload Alert:**
- [Day] has [X] hours of meetings

Would you like me to help reschedule anything?
```

## What We DON'T Do

| Anti-Pattern | Why |
|--------------|-----|
| Auto-create calendar events | User must explicitly request event creation |
| Proactively suggest time blocking | Only respond when asked |
| Assume morning vs afternoon preference | Any gap works unless user specifies |
| Create recurring focus blocks | User controls their recurring patterns |
| Block time without confirmation | All actions require draft-approve workflow |

## If User Wants Events Created

When user explicitly requests event creation (e.g., "Create a focus block"):

1. **Clarify details** - What to call it, exact time, duration
2. **Follow draft-approve protocol** - Draft the event first
3. **Get explicit confirmation** - Only create after "confirm", "yes", etc.

**Example:**
```
User: "Create a focus block on Tuesday morning"

AI: Here's a draft event:

---
**Title:** Focus Time
**When:** Tuesday 9:00am - 11:00am
**Calendar:** [primary]
---

Ready to create this? [confirm / edit]
```

## Recommendation Logic

When analyzing calendar for time blocks:

1. **Scan lookahead window** (default: 2 weeks)
2. **Identify gaps >= 90 minutes** - These are focus time candidates
3. **Check for back-to-back meetings** - Buffer recommendations
4. **Count meeting hours per day** - Overload detection
5. **Present suggestions** - Never create automatically

## Related Protocols

- [conflict-detection.md](conflict-detection.md) - Identifies overload days
- [draft-approve.md](draft-approve.md) - Workflow if user requests event creation
- *calendar-sync.md* - Fetches schedule data (future)

---

*Protocol: time-blocking*
*Applies to: Scheduling domain*
*Mode: Advisory only (no auto-create)*
