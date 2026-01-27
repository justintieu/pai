#!/bin/bash
# PAI Calendar Conflicts - Detect scheduling conflicts
# Usage: conflicts.sh [cache_file] (default: /tmp/pai-calendar-cache.json)
#
# Detects three severity levels:
#   HIGH   - True overlaps (requires attention)
#   MEDIUM - Buffer conflicts (informational)
#   LOW    - Overload days (awareness)

set -e

CACHE_FILE="${1:-/tmp/pai-calendar-cache.json}"
BUFFER_MINUTES=15
OVERLOAD_HOURS=5
OVERLOAD_COUNT=6

# =============================================================================
# Validate cache exists
# =============================================================================
if [[ ! -f "$CACHE_FILE" ]]; then
  echo "Error: Cache file not found at $CACHE_FILE"
  echo ""
  echo "Run sync.sh first to fetch calendar events:"
  echo "  ~/.pai/skills/pai-calendar/sync.sh"
  exit 1
fi

EVENT_COUNT=$(jq '.events | length' "$CACHE_FILE" 2>/dev/null || echo "0")
if [[ "$EVENT_COUNT" -eq 0 ]]; then
  echo "No events in cache. Calendar is clear or sync hasn't run."
  exit 0
fi

SYNCED_AT=$(jq -r '.synced_at // "unknown"' "$CACHE_FILE")
LOOKAHEAD=$(jq -r '.lookahead_days // 14' "$CACHE_FILE")

echo "========================================"
echo "PAI Calendar Conflict Analysis"
echo "========================================"
echo "Events analyzed: $EVENT_COUNT"
echo "Synced at: $SYNCED_AT"
echo "Lookahead: $LOOKAHEAD days"
echo ""

# =============================================================================
# HIGH SEVERITY: True Overlaps
# =============================================================================
echo "Checking for TRUE OVERLAPS (HIGH severity)..."
echo ""

# Use jq to find overlapping events
# Events are sorted by start time, so we check if each event starts before the previous ends
HIGH_CONFLICTS=$(jq -r '
  .events |
  to_entries |
  map(
    if .key > 0 then
      {
        prev: .[-1].value,
        curr: .value,
        overlap: (
          .value.start < .[-1].value.end
        )
      } |
      select(.overlap) |
      "  - \"\(.prev.title)\" overlaps with \"\(.curr.title)\" at \(.curr.start)"
    else
      empty
    end
  )
' "$CACHE_FILE" 2>/dev/null || true)

# Alternative approach: iterate through sorted events
HIGH_COUNT=0
PREV_END=""
PREV_TITLE=""

while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  CURR_START=$(echo "$line" | jq -r '.start')
  CURR_END=$(echo "$line" | jq -r '.end')
  CURR_TITLE=$(echo "$line" | jq -r '.title')

  if [[ -n "$PREV_END" && "$CURR_START" < "$PREV_END" ]]; then
    ((HIGH_COUNT++))
    echo "  HIGH: \"$PREV_TITLE\" overlaps with \"$CURR_TITLE\""
    echo "        (Previous ends: $PREV_END, Current starts: $CURR_START)"
  fi

  PREV_END="$CURR_END"
  PREV_TITLE="$CURR_TITLE"
done < <(jq -c '.events[]' "$CACHE_FILE" 2>/dev/null)

if [[ "$HIGH_COUNT" -eq 0 ]]; then
  echo "  (No true overlaps found)"
fi
echo ""

# =============================================================================
# MEDIUM SEVERITY: Buffer Conflicts
# =============================================================================
echo "Checking for BUFFER CONFLICTS (MEDIUM severity)..."
echo "(Back-to-back meetings with < $BUFFER_MINUTES min gap)"
echo ""

MEDIUM_COUNT=0
PREV_END=""
PREV_TITLE=""

while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  CURR_START=$(echo "$line" | jq -r '.start')
  CURR_END=$(echo "$line" | jq -r '.end')
  CURR_TITLE=$(echo "$line" | jq -r '.title')

  if [[ -n "$PREV_END" ]]; then
    # Calculate gap in minutes (simplified: assumes same-day events)
    # For full accuracy, would need proper date parsing
    PREV_END_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${PREV_END:0:19}" "+%s" 2>/dev/null || date -d "${PREV_END:0:19}" "+%s" 2>/dev/null || echo "0")
    CURR_START_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${CURR_START:0:19}" "+%s" 2>/dev/null || date -d "${CURR_START:0:19}" "+%s" 2>/dev/null || echo "0")

    if [[ "$PREV_END_EPOCH" != "0" && "$CURR_START_EPOCH" != "0" ]]; then
      GAP_SECONDS=$((CURR_START_EPOCH - PREV_END_EPOCH))
      GAP_MINUTES=$((GAP_SECONDS / 60))

      # Only flag if there's no overlap (handled above) and gap is less than buffer
      if [[ "$GAP_SECONDS" -ge 0 && "$GAP_MINUTES" -lt "$BUFFER_MINUTES" ]]; then
        ((MEDIUM_COUNT++))
        echo "  MEDIUM: Only $GAP_MINUTES min between \"$PREV_TITLE\" and \"$CURR_TITLE\""
      fi
    fi
  fi

  PREV_END="$CURR_END"
  PREV_TITLE="$CURR_TITLE"
done < <(jq -c '.events[]' "$CACHE_FILE" 2>/dev/null)

if [[ "$MEDIUM_COUNT" -eq 0 ]]; then
  echo "  (No buffer conflicts found)"
fi
echo ""

# =============================================================================
# LOW SEVERITY: Overload Days
# =============================================================================
echo "Checking for OVERLOAD DAYS (LOW severity)..."
echo "(Days with >= $OVERLOAD_HOURS hours or >= $OVERLOAD_COUNT meetings)"
echo ""

LOW_COUNT=0

# Group events by day and calculate totals
jq -r '
  .events |
  group_by(.start | split("T")[0]) |
  .[] |
  {
    date: .[0].start | split("T")[0],
    count: length,
    events: .
  }
' "$CACHE_FILE" 2>/dev/null | jq -c '.' | while IFS= read -r day_data; do
  [[ -z "$day_data" ]] && continue

  DAY_DATE=$(echo "$day_data" | jq -r '.date')
  DAY_COUNT=$(echo "$day_data" | jq -r '.count')

  # Calculate total meeting hours (simplified)
  TOTAL_MINUTES=0
  while IFS= read -r event; do
    [[ -z "$event" ]] && continue

    E_START=$(echo "$event" | jq -r '.start')
    E_END=$(echo "$event" | jq -r '.end')

    START_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${E_START:0:19}" "+%s" 2>/dev/null || date -d "${E_START:0:19}" "+%s" 2>/dev/null || echo "0")
    END_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${E_END:0:19}" "+%s" 2>/dev/null || date -d "${E_END:0:19}" "+%s" 2>/dev/null || echo "0")

    if [[ "$START_EPOCH" != "0" && "$END_EPOCH" != "0" ]]; then
      DURATION=$((END_EPOCH - START_EPOCH))
      TOTAL_MINUTES=$((TOTAL_MINUTES + DURATION / 60))
    fi
  done < <(echo "$day_data" | jq -c '.events[]')

  TOTAL_HOURS=$((TOTAL_MINUTES / 60))

  if [[ "$DAY_COUNT" -ge "$OVERLOAD_COUNT" || "$TOTAL_HOURS" -ge "$OVERLOAD_HOURS" ]]; then
    ((LOW_COUNT++)) || true
    echo "  LOW: $DAY_DATE has $DAY_COUNT meetings (~$TOTAL_HOURS hours)"
  fi
done

if [[ "$LOW_COUNT" -eq 0 ]]; then
  echo "  (No overload days detected)"
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "========================================"
echo "CONFLICT SUMMARY"
echo "========================================"
echo "  HIGH (overlaps):  $HIGH_COUNT"
echo "  MEDIUM (buffers): $MEDIUM_COUNT"
echo "  LOW (overload):   Check output above"
echo ""
echo "Legend:"
echo "  HIGH   - True overlap, requires attention"
echo "  MEDIUM - Buffer conflict, informational (15-min preference)"
echo "  LOW    - Overload day, awareness"
echo ""

if [[ "$HIGH_COUNT" -gt 0 ]]; then
  echo "Action recommended: Review HIGH severity conflicts."
  echo "Would you like help rescheduling any events?"
fi
