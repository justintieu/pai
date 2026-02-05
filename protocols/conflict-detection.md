# Conflict Detection Protocol

Proactive scheduling conflict detection with severity levels.

## Problem Being Solved

- Users don't always notice scheduling conflicts until too late
- Back-to-back meetings leave no buffer for travel/prep
- Heavy meeting days cause burnout but aren't obvious from calendar view
- **Solution:** Proactive detection with appropriate severity levels

## Conflict Types

### True Overlap (HIGH Severity)

Two events with overlapping start/end times.

**Example:**
- Meeting A: 2:00pm - 3:00pm
- Meeting B: 2:30pm - 3:30pm
- Overlap: 30 minutes

**Action:** Immediate notification when new conflict detected.

**Tone:** "I notice [Event A] overlaps with [Event B] on [date]."

### Buffer Conflict (MEDIUM Severity)

Back-to-back meetings without 15-minute buffer.

**Example:**
- Meeting A: 2:00pm - 3:00pm
- Meeting B: 3:00pm - 4:00pm
- Gap: 0 minutes (no buffer)

**Action:** Note in summary, not alarming.

**Tone:** "Heads up: only [X] minutes between [A] and [B]."

**Important:** This is a preference, not an emergency. User may intentionally schedule back-to-back meetings.

### Meeting Overload (LOW Severity)

Days exceeding meeting threshold.

**Default Thresholds:**
- 5+ hours of meetings in a day, OR
- 6+ meetings in a day

**Action:** Mention in daily/session summary.

**Tone:** "[Day] has [X] hours of meetings - consider if any can move."

## When to Check

| Trigger | Action |
|---------|--------|
| Session start | Summarize existing conflicts in 2-week lookahead |
| New event detected | Check for new conflicts immediately |
| User asks | "Any conflicts?" triggers full check |

## Lookahead Window

**Default:** 2 weeks

Configurable if user requests different window.

## Detection Algorithm

Pseudocode for reference:

```
For each event in sorted order by start time:
  Check overlap with subsequent events
  If overlap found: HIGH conflict
  If gap < 15 min: MEDIUM conflict (buffer)

For each day in window:
  If total meeting hours >= 5 OR meeting count >= 6:
    LOW conflict (overload)
```

## Reschedule Workflow

When conflicts are detected and user wants to resolve:

1. **Ask which event** - Never assume which event should move
2. **Draft suggestion** - Propose alternative time(s)
3. **Minimize ripple effects** - Prefer moves that don't cascade to other changes
4. **Get explicit confirmation** - Follow [draft-approve](draft-approve.md) protocol before execution

**Autonomy Level:** Collaborator - always draft changes for approval, never execute without explicit confirmation.

## Severity Communication

| Severity | Prefix | Urgency |
|----------|--------|---------|
| HIGH | "Conflict detected" | Requires attention |
| MEDIUM | "Heads up" | Informational, no action required |
| LOW | "FYI" | General awareness |

## Response Formats

### Session Start Summary

```
Checking your calendar for the next 2 weeks...

**Conflicts found:**
- HIGH: [Event A] overlaps with [Event B] on [date]

**Buffer alerts:**
- [Day]: Only 5 minutes between [Meeting 1] and [Meeting 2]

**Heavy days:**
- [Day] has 6 hours of meetings (8 total meetings)

Would you like me to help reschedule anything?
```

### New Conflict Alert

```
I notice a new conflict on your calendar:

[Event A] (2:00pm - 3:00pm) overlaps with [Event B] (2:30pm - 3:30pm) on [date]

Which event would you like to reschedule?
```

## Future Enhancements

### Mirror Event Detection

**Problem:** Users often block time on one calendar for an event that lives on another (e.g., "Doctor Appointment" placeholder on work calendar, real event on personal calendar). These appear as conflicts but are actually the same event.

**Proposed solutions:**
- Time-based deduplication (>90% overlap = same event, keep one with more details)
- Fuzzy title matching ("Doctor" / "Doctor Appointment" / "Dr Appt")
- Primary calendar designation (authoritative source for overlapping events)
- Explicit linking (prefix like "[BLOCK]" to mark mirror events)

## Related Protocols

- [autonomy-levels.md](autonomy-levels.md) - Scheduling is Collaborator level
- [draft-approve.md](draft-approve.md) - Workflow for reschedule suggestions
- [calendar-sync.md](calendar-sync.md) - How events are fetched

---

*Protocol: conflict-detection*
*Applies to: Scheduling domain*
*Severity levels: HIGH (overlap), MEDIUM (buffer), LOW (overload)*
