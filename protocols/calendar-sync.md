# Calendar Sync Protocol

Multi-source calendar synchronization for the Scheduling domain.

## Problem Being Solved

Users have calendars spread across multiple sources:
- Work Google Calendar
- Personal Google Calendar
- Shared team calendars (ICS subscriptions)
- External calendars (holidays, partner schedules)

PAI needs a unified view of all events with full details (title, time, location, description) for:
- Conflict detection
- Availability queries
- Reschedule suggestions

**Note:** keeper.sh (a calendar aggregation tool) only syncs busy/free timeslots, not event details. This protocol uses direct source access for full event visibility.

## Calendar Source Types

### Google Calendar (gcalcli)

**Capabilities:** Full read/write access, event details, reminders, search
**Authentication:** OAuth2 (one-time browser flow)
**Operations:**
- View agenda with full details
- Search events
- Add/modify/delete events
- Access multiple calendars per account

**Access command:**
```bash
gcalcli --calendar="Work" --calendar="Personal" \
  agenda "today" "+2 weeks" \
  --details=all \
  --tsv
```

### ICS URL (icalendar-events-cli)

**Capabilities:** Read-only access, full event details, filtering
**Authentication:** URL-based (may include auth token in URL)
**Operations:**
- View events with full details
- Filter by date range
- JSON output for parsing

**Access command:**
```bash
icalendar-events-cli \
  --calendar.url "https://calendar.example.com/feed.ics" \
  --filter.start-date "$(date -Iseconds)" \
  --filter.end-date "$(date -d '+14 days' -Iseconds)" \
  --output.format json
```

### iCloud / Outlook via ICS

Convert webcal:// URLs to https:// for access:
```bash
# Original: webcal://p123-caldav.icloud.com/calendar/xyz
# Convert to: https://p123-caldav.icloud.com/calendar/xyz

curl -s "https://p123-caldav.icloud.com/calendar/xyz" | \
  icalendar-events-cli --calendar.url "file:///dev/stdin" --output.format json
```

## Sync Strategy

### On Session Start

Full sync of all configured sources. Cache results for session duration.

```bash
# 1. Sync Google Calendars
gcalcli --calendar="Work" --calendar="Personal" \
  agenda "today" "+2 weeks" \
  --details=all \
  --tsv > /tmp/pai-gcal-cache.tsv

# 2. Sync ICS sources (for each URL in sources.md)
icalendar-events-cli \
  --calendar.url "$ICS_URL" \
  --filter.start-date "$(date -Iseconds)" \
  --filter.end-date "$(date -d '+14 days' -Iseconds)" \
  --output.format json >> /tmp/pai-ics-cache.json
```

### During Session

Use cached data when:
- Cache is less than 15 minutes old
- No calendar modifications have been made since cache

Re-sync when:
- User explicitly requests: "refresh calendar"
- Cache is stale (>15 minutes for active scheduling work)
- After any calendar modification

### On Demand

User can force refresh anytime:
- "Refresh my calendar"
- "Re-sync calendars"
- "Get latest calendar data"

### After Modification

When PAI makes a calendar change (approved by user):
1. Execute the modification via gcalcli
2. Immediately re-sync the affected calendar
3. Update cache with new data
4. Verify the change appears correctly

## Data Format

### Normalized Event Structure

All events from all sources are normalized to:

```json
{
  "title": "Team Standup",
  "start": "2026-01-25T10:00:00-08:00",
  "end": "2026-01-25T10:30:00-08:00",
  "location": "Zoom",
  "description": "Daily sync",
  "calendar_source": "Work (Google)",
  "source_type": "gcalcli",
  "read_write": true
}
```

### Timezone Normalization

All times are normalized to user's local timezone before:
- Display to user
- Conflict detection
- Availability calculations

**From gcalcli:** Already in local timezone by default
**From ICS:** Use system timezone or explicit conversion

### Recurring Event Handling

Recurring events are expanded to individual occurrences:
- gcalcli handles expansion natively
- icalendar-events-cli uses recurring-ical-events library internally

Expansion covers the lookahead window (2 weeks by default).

## Error Handling

### Authentication Errors

**Symptom:** gcalcli returns "Not authenticated" or OAuth errors

**Recovery:**
1. Prompt user: "Your Google Calendar authentication has expired."
2. Instruct: "Run `gcalcli init` to re-authenticate."
3. Wait for confirmation
4. Retry sync

### Network Errors

**Symptom:** Connection timeout, DNS failure, HTTP errors

**Recovery:**
1. Note in session: "Calendar sync failed - using cached data"
2. Include staleness warning: "Calendar data may be up to [X hours] old"
3. Retry on next explicit sync request

### Parse Errors

**Symptom:** Malformed ICS, unexpected data format

**Recovery:**
1. Log the problematic source and error
2. Skip the problematic events
3. Continue with successfully parsed events
4. Warn user: "Some events from [source] couldn't be read"

**Never fail the entire sync** due to one problematic source.

## Usage Examples

### Full Session Start Sync

```bash
# Sync all Google calendars
CALENDARS=$(gcalcli list 2>/dev/null | grep -E "^\s" | awk '{print $1}')
for cal in $CALENDARS; do
  gcalcli --calendar="$cal" \
    agenda "today" "+2 weeks" \
    --details=all \
    --tsv
done

# Sync ICS sources from sources.md
# (Parse sources.md for ICS URLs, fetch each)
```

### Quick Availability Check

```bash
# Get today's events
gcalcli --calendar="Work" --calendar="Personal" \
  agenda "today" "tomorrow" \
  --details=all \
  --tsv
```

### Search for Specific Event

```bash
gcalcli search "Team Standup" --calendar="Work" --details=all
```

### Add Event (After User Approval)

```bash
# Draft mode (show what would happen)
gcalcli add --calendar="Work" \
  --title="Focus Time" \
  --when="tomorrow 9am" \
  --duration=120 \
  --noprompt \
  --dry-run

# Execute (only after user confirms)
gcalcli add --calendar="Work" \
  --title="Focus Time" \
  --when="tomorrow 9am" \
  --duration=120 \
  --noprompt
```

## Related

- [Calendar Sources](../context/calendar/sources.md) - User's configured calendars
- [Conflict Detection Protocol](conflict-detection.md) - How conflicts are identified
- [Autonomy Levels](autonomy-levels.md) - Scheduling is Collaborator level
- [Draft-Approve Protocol](draft-approve.md) - Required for calendar modifications

## Implementation Notes

### Tool Installation

```bash
# gcalcli for Google Calendar
pip install gcalcli
# or
brew install gcalcli

# icalendar-events-cli for ICS parsing
pipx install icalendar-events-cli
# or
pip install icalendar-events-cli
```

### First-Time Setup

Users need to authenticate once:
```bash
# Google Calendar
gcalcli init
# Opens browser, grants OAuth access
# Stores credentials locally

# Verify
gcalcli list
```

### Cache Location

Cache files are ephemeral per session:
- `/tmp/pai-gcal-cache.tsv` - Google Calendar data
- `/tmp/pai-ics-cache.json` - ICS subscription data

Cache is refreshed on new session or explicit request.
