# Calendar

Calendar sources and scheduling configuration for schedule visibility and conflict management.

## Purpose

This directory stores your calendar source configuration so PAI can understand your schedule, detect conflicts, and provide scheduling recommendations. The more calendars you configure, the more complete the picture.

## Contents

| Path | Purpose |
|------|---------|
| [sources.md](sources.md) | Configured calendar sources with access methods |

## How It Works

1. **Configure sources** - Add calendars to sources.md (Google Calendar, ICS URLs)
2. **Sync on session start** - PAI fetches events from all configured sources
3. **Conflict detection** - 2-week lookahead for overlaps and buffer issues
4. **Draft-approve workflow** - Any calendar modifications require your explicit approval

## Managing Your Calendar

### Add Sources

Edit `sources.md` directly to add or modify calendar sources:
- Google Calendars: Uses gcalcli (requires one-time OAuth setup)
- ICS URLs: Read-only subscriptions (team calendars, holidays, etc.)

### View Schedule

- "Show my calendar" - See your upcoming schedule
- "When am I free?" - Find available time slots
- "What's on my schedule this week?" - Weekly overview

### Check Conflicts

- "Any scheduling conflicts?" - Check for overlaps and buffer issues
- "Show conflicts for next week" - Scoped conflict check
- "Is Tuesday overloaded?" - Check specific day

### Reschedule Requests

PAI can suggest reschedules for conflicts, but always:
1. Asks which event can be moved
2. Drafts the change for your review
3. Only executes after explicit approval

## Sync Behavior

| Trigger | Action |
|---------|--------|
| Session start | Full sync of all configured sources |
| During session | Use cached data (fresh within 15 minutes) |
| "Refresh calendar" | Force re-sync of all sources |
| After modification | Immediate re-sync of affected calendar |

## Related

- [Calendar Sync Protocol](../../protocols/calendar-sync.md) - Multi-source sync details
- [Autonomy Levels](../../protocols/autonomy-levels.md) - Scheduling is Collaborator level
- [Draft-Approve Protocol](../../protocols/draft-approve.md) - How modifications are presented
