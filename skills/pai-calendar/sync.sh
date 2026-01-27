#!/bin/bash
# PAI Calendar Sync - Fetch events from configured sources
# Usage: sync.sh [days_ahead] (default: 14)
#
# Outputs normalized JSON to /tmp/pai-calendar-cache.json
# Supports: gcalcli (Google Calendar), icalendar-events-cli (ICS URLs)

set -e

DAYS_AHEAD="${1:-14}"
OUTPUT_FILE="/tmp/pai-calendar-cache.json"
SOURCES_FILE="$HOME/Documents/github/kasanariba-ai/core/context/calendar/sources.md"

# Initialize cache file
echo "{\"events\": [], \"synced_at\": \"$(date -Iseconds)\", \"lookahead_days\": $DAYS_AHEAD}" > "$OUTPUT_FILE"

# Calculate date range
START_DATE=$(date +%Y-%m-%d)
# macOS vs Linux date handling
if date -v+1d > /dev/null 2>&1; then
  # macOS
  END_DATE=$(date -v+${DAYS_AHEAD}d +%Y-%m-%d)
  END_ISO=$(date -v+${DAYS_AHEAD}d +"%Y-%m-%dT23:59:59")
else
  # Linux
  END_DATE=$(date -d "+$DAYS_AHEAD days" +%Y-%m-%d)
  END_ISO=$(date -d "+$DAYS_AHEAD days" +"%Y-%m-%dT23:59:59")
fi

echo "Syncing calendars for $START_DATE to $END_DATE..."
echo ""

# Temporary files for collecting events
GCAL_EVENTS="/tmp/pai-calendar-gcal.jsonl"
ICS_EVENTS="/tmp/pai-calendar-ics.jsonl"
rm -f "$GCAL_EVENTS" "$ICS_EVENTS"

# =============================================================================
# Google Calendar via gcalcli
# =============================================================================
if command -v gcalcli &> /dev/null; then
  echo "Fetching Google Calendar events..."

  # Get list of calendars
  CALENDARS=$(gcalcli list 2>/dev/null | grep -E "^\s" | awk '{print $1}' 2>/dev/null || true)

  if [[ -n "$CALENDARS" ]]; then
    # Fetch events in TSV format for each calendar
    for cal in $CALENDARS; do
      echo "  - Calendar: $cal"

      # Get events in TSV format
      gcalcli --calendar="$cal" agenda "$START_DATE" "$END_DATE" \
        --details=all \
        --tsv 2>/dev/null | while IFS=$'\t' read -r start end title location description; do

        # Skip header or empty lines
        [[ -z "$start" || "$start" == "Start" ]] && continue

        # Escape quotes in strings for JSON
        title_escaped=$(echo "$title" | sed 's/"/\\"/g' | tr -d '\n')
        location_escaped=$(echo "$location" | sed 's/"/\\"/g' | tr -d '\n')

        # Output JSON line
        echo "{\"title\": \"$title_escaped\", \"start\": \"$start\", \"end\": \"$end\", \"location\": \"$location_escaped\", \"source\": \"google\"}"
      done >> "$GCAL_EVENTS" 2>/dev/null || true
    done
  else
    echo "  (No Google calendars configured or gcalcli not authenticated)"
  fi
else
  echo "gcalcli not installed - skipping Google Calendar"
fi

# =============================================================================
# ICS URLs via icalendar-events-cli
# =============================================================================
if command -v icalendar-events-cli &> /dev/null; then
  echo ""
  echo "Checking for ICS URL sources..."

  if [[ -f "$SOURCES_FILE" ]]; then
    # Extract ICS URLs from sources.md
    ICS_URLS=$(grep -oE 'https?://[^ ]+\.ics' "$SOURCES_FILE" 2>/dev/null || true)

    if [[ -n "$ICS_URLS" ]]; then
      echo "$ICS_URLS" | while read -r ics_url; do
        [[ -z "$ics_url" ]] && continue
        echo "  - Fetching ICS: ${ics_url:0:50}..."

        icalendar-events-cli \
          --calendar.url "$ics_url" \
          --filter.start-date "$(date -Iseconds)" \
          --filter.end-date "$END_ISO" \
          --output.format json 2>/dev/null | \
          jq -c '.events[]? | {title: .summary, start: ."start-date", end: ."end-date", location: (.location // ""), source: "ics"}' \
          >> "$ICS_EVENTS" 2>/dev/null || echo "    (failed to fetch)"
      done
    else
      echo "  (No ICS URLs found in sources.md)"
    fi
  else
    echo "  (sources.md not found at $SOURCES_FILE)"
  fi
else
  echo "icalendar-events-cli not installed - skipping ICS sources"
fi

# =============================================================================
# Merge all events into cache
# =============================================================================
echo ""
echo "Merging events..."

# Combine all event sources
ALL_EVENTS="/tmp/pai-calendar-all.jsonl"
cat "$GCAL_EVENTS" "$ICS_EVENTS" 2>/dev/null > "$ALL_EVENTS" || true

# Count events
if [[ -s "$ALL_EVENTS" ]]; then
  # Convert JSONL to JSON array and merge into cache
  jq -s '.' "$ALL_EVENTS" > /tmp/pai-cal-events-array.json 2>/dev/null || echo "[]" > /tmp/pai-cal-events-array.json

  # Update cache with events, sorted by start time
  jq --slurpfile events /tmp/pai-cal-events-array.json \
    '.events = ($events[0] | sort_by(.start))' "$OUTPUT_FILE" > /tmp/pai-cal-tmp.json 2>/dev/null && \
    mv /tmp/pai-cal-tmp.json "$OUTPUT_FILE"

  EVENT_COUNT=$(jq '.events | length' "$OUTPUT_FILE" 2>/dev/null || echo "0")
else
  EVENT_COUNT=0
fi

# Cleanup temp files
rm -f "$GCAL_EVENTS" "$ICS_EVENTS" "$ALL_EVENTS" /tmp/pai-cal-events-array.json

echo ""
echo "========================================"
echo "Calendar sync complete"
echo "  Events: $EVENT_COUNT"
echo "  Range: $START_DATE to $END_DATE"
echo "  Cache: $OUTPUT_FILE"
echo "========================================"
