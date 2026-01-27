---
name: pai-calendar
description: Calendar visibility with sync, conflict detection, and time blocking. USE WHEN calendar, schedule, free time, busy, conflicts, meetings, when am I free, time block, focus time, my schedule, availability, reschedule.
tools: [Bash, Read]
---

# PAI Calendar

Calendar assistant that syncs multi-source calendars, detects conflicts, analyzes availability, and provides time blocking recommendations.

## Philosophy

**Process -> Analyze -> Report** (not create)

- Fetch real calendar data from configured sources
- Analyze for conflicts, availability, time blocking opportunities
- Report findings clearly with actionable insights
- Advisory mode for time blocking (no auto-creating events)
- Collaborator autonomy (draft-approve for any calendar modifications)

**Key Principles:**
- Never modify calendar without explicit user request and confirmation
- Buffer preferences (15-min) are soft guidance, not emergencies
- Proactive conflict detection on session start
- All analysis uses cached data (refreshed on demand)

## Workflows

| Workflow | Trigger | Output |
|----------|---------|--------|
| **Sync** | Session start, "refresh calendar" | Cached events in /tmp |
| **Availability** | "when am I free", "my schedule" | Free time windows |
| **Conflicts** | "any conflicts", session start | Conflict report with severity |
| **Time Blocking** | "time blocking", "focus time" | Advisory recommendations |
| **Reschedule** | "help reschedule", conflicts found | Event moved after approval |

## Instructions

### 1. Calendar Sync

Fetch events from all configured sources and cache for session use.

**When to sync:**
- Session start (proactive)
- User requests: "refresh calendar", "sync calendars"
- After any calendar modification

**How:**
```bash
~/.pai/skills/pai-calendar/sync.sh [days_ahead]
```

Default lookahead: 14 days. Output: `/tmp/pai-calendar-cache.json`

**Cache format:**
```json
{
  "events": [
    {
      "title": "Team Standup",
      "start": "2026-01-25T10:00:00",
      "end": "2026-01-25T10:30:00",
      "location": "Zoom",
      "source": "google"
    }
  ],
  "synced_at": "2026-01-25T20:45:00Z",
  "lookahead_days": 14
}
```

**Tools used:**
- `gcalcli` for Google Calendar (full read/write)
- `icalendar-events-cli` for ICS URL subscriptions (read-only)

### 2. Answering Availability Questions

When user asks about their schedule:

**"When am I free this week?"**
1. Read cached events from `/tmp/pai-calendar-cache.json`
2. Find gaps >= 30 minutes between events
3. Report free windows by day

**"Show my schedule" / "What's on my calendar?"**
1. Read cached events
2. List events chronologically
3. Include calendar source in display

**Response format:**
```
Your free time this week:

**Monday:**
- 9:00am - 10:00am (1 hour before standup)
- 2:00pm - 5:00pm (3 hours in afternoon)

**Tuesday:**
- Morning fully booked
- 3:30pm - 6:00pm (2.5 hours)

...
```

### 3. Conflict Detection

Detect and report scheduling conflicts with three severity levels.

**Run:**
```bash
~/.pai/skills/pai-calendar/conflicts.sh
```

**Severity Levels:**

| Severity | Type | Action | Communication |
|----------|------|--------|---------------|
| **HIGH** | True overlap | Immediate notification | "Conflict detected: [A] overlaps with [B]" |
| **MEDIUM** | Buffer conflict | Note in summary | "Heads up: only [X] min between [A] and [B]" |
| **LOW** | Overload day | General awareness | "FYI: [Day] has [X] hours of meetings" |

**When to check:**
- Session start (proactive summary)
- User asks: "any conflicts?", "schedule conflicts"
- After new event detected

**Response format:**
```
Checking your calendar for the next 2 weeks...

**Conflicts found:**
- HIGH: "Meeting A" overlaps with "Meeting B" on Tuesday

**Buffer alerts:**
- Thursday: Only 0 minutes between "Standup" and "1:1 with Manager"

**Heavy days:**
- Friday has 6 hours of meetings (8 total meetings)

Would you like me to help reschedule anything?
```

### 4. Time Blocking Recommendations

Provide advisory analysis for focus time and schedule optimization.

**ONLY when user explicitly asks:**
- "Help me find focus time"
- "Where can I do deep work?"
- "Time blocking suggestions"

**What to analyze:**
- Focus time opportunities: gaps >= 90 minutes (good for deep work)
- Buffer recommendations: back-to-back meetings needing breathing room
- Overload alerts: days with 5+ hours or 6+ meetings

**Response format:**
```
Based on your calendar for the next 2 weeks:

**Focus Time Opportunities:**
- Monday 2pm-5pm (3 hours, no meetings)
- Wednesday 9am-11:30am (2.5 hours morning gap)

**Buffer Recommendations:**
- Add 15-min buffer before your 3pm client call on Tuesday

**Overload Alert:**
- Thursday has 6.5 hours of meetings

Would you like me to help reschedule anything?
```

**Important - What we DON'T do:**
- Auto-create calendar events (advisory only)
- Proactively suggest time blocking (only when asked)
- Create recurring focus blocks
- Block time without confirmation

**If user wants events created:**
1. Clarify details (title, time, duration)
2. Follow draft-approve protocol
3. Get explicit confirmation before creating

### 5. Reschedule Workflow

Handle conflict resolution by moving events to better times.

**When to trigger:**
- After conflicts.sh reports HIGH severity conflicts
- User asks: "help reschedule", "resolve conflict", "move this meeting", "fix that conflict"

**Step-by-step workflow:**

1. **Identify the conflict** - Show user which events conflict with times and dates
2. **Ask which event to move** - Never assume; always ask user which event should be rescheduled
3. **Analyze free slots** - Read `/tmp/pai-calendar-cache.json` for available windows
4. **Minimize ripple effects** - Prefer moves that don't cascade to other changes (key principle)
5. **Draft alternative time(s)** - Propose 2-3 options if available, with reasons why each is good
6. **Get user approval** - Present draft, wait for confirmation
7. **Execute with gcalcli** - Only after explicit "confirm/yes/do it":
   ```bash
   # Delete original event
   gcalcli delete --calendar="[calendar-name]" "[event title]" --iamaexpert

   # Add at new time
   gcalcli add --calendar="[calendar-name]" \
     --title="[event title]" \
     --when="[new datetime]" \
     --duration=[minutes] \
     --noprompt
   ```
8. **Re-sync and verify** - Run sync.sh, confirm change appears correctly in cache
9. **Check for new conflicts** - Run conflicts.sh to ensure move didn't create new issues

**Response format templates:**

**After detecting conflict:**
```
I found a conflict:
- "[Event A]" overlaps with "[Event B]" on [date]

Which event would you like to move?
```

**After user chooses event:**
```
Looking at your calendar, here are some options for moving "[Event]":

**Option 1:** [Day] [time] - [reason why good, e.g., "no other meetings nearby"]
**Option 2:** [Day] [time] - [reason, e.g., "2-hour gap, quiet afternoon"]
**Option 3:** [Day] [time] - [reason, e.g., "morning slot before standup"]

Which works for you? (or suggest a different time)
```

**Draft change presentation:**
```
Draft change:
- Move "[Event]" from [original day/time] to [new day/time]

Ready to update your calendar? [confirm / edit]
```

**After execution:**
```
Done. "[Event]" has been moved to [new day/time].

Re-syncing calendar... No new conflicts detected.
```

**Important notes:**
- **Movable events:** Ask user each time whether a specific event can be moved - don't assume
- **Draft-approve required:** Never modify calendar without explicit confirmation (see [draft-approve protocol](core/protocols/draft-approve.md))
- **Re-sync after:** Always refresh cache after any modification
- **Verify no cascades:** Run conflicts.sh after move to catch any new issues created

## Protocol References

- @core/protocols/calendar-sync.md - Sync strategy and CLI commands
- @core/protocols/conflict-detection.md - Conflict types and severity levels
- @core/protocols/time-blocking.md - Advisory recommendation guidelines
- @core/protocols/draft-approve.md - Required for any calendar modifications

## Example Interactions

**Example 1: Availability query**
```
User: "When am I free tomorrow?"

Action:
1. Read /tmp/pai-calendar-cache.json (or run sync.sh if stale)
2. Filter events for tomorrow
3. Identify gaps >= 30 minutes
4. Report free windows
```

**Example 2: Conflict check**
```
User: "Any scheduling conflicts this week?"

Action:
1. Run ~/.pai/skills/pai-calendar/conflicts.sh
2. Report conflicts by severity
3. Offer to help reschedule if HIGH conflicts found
```

**Example 3: Focus time request**
```
User: "Help me find focus time next week"

Action:
1. Analyze calendar for gaps >= 90 minutes
2. Identify best focus opportunities
3. Report as advisory recommendations
4. DO NOT create events unless explicitly asked
```

**Example 4: Full schedule view**
```
User: "What's my week look like?"

Action:
1. Read cached events
2. Group by day
3. Display chronologically with sources
```

**Example 5: Reschedule conflicting event**
```
User: "Help me fix that conflict"

Action:
1. Reference conflicts.sh output for conflict details
2. Ask which event to move: "Would you like to move Meeting A or Meeting B?"
3. User: "Move Meeting A"
4. Analyze cache for free slots that day/week
5. Present options: "I see two options for Meeting A:
   - Option 1: Thursday 3pm (2-hour gap, no conflicts)
   - Option 2: Friday 10am (quiet morning)"
6. User: "Thursday 3pm"
7. Draft change: "Move Meeting A from Tuesday 2pm to Thursday 3pm"
8. Wait for explicit confirmation: "Ready to update? [confirm]"
9. User: "confirm"
10. Execute: gcalcli delete + gcalcli add
11. Re-sync: sync.sh
12. Verify: "Meeting A now shows at Thursday 3pm. No new conflicts detected."
```

## Session Start Checklist

When starting a new session with calendar context:

1. **Sync calendars** (if cache older than 15 minutes)
2. **Check for HIGH conflicts** (report immediately if found)
3. **Note heavy days** (brief mention, not alarming)
4. **Ready for queries**

## Related

- [Calendar Sources](core/context/calendar/sources.md) - User's configured calendars
- [Scheduling Domain](core/agents/pai-domains.md) - Autonomy level (Collaborator)
