#!/bin/bash
# PAI Remind - Schedule a notification after a delay
# Usage: remind.sh <time> <message>
# Time formats: 30s, 10m, 1h, or raw seconds

set -e

TIME="$1"
MESSAGE="$2"

if [ -z "$TIME" ] || [ -z "$MESSAGE" ]; then
  echo "Usage: remind.sh <time> <message>"
  echo "Time formats: 30s, 10m, 1h, or raw seconds"
  exit 1
fi

# Parse time to seconds
parse_time() {
  local input="$1"
  local num="${input%[smh]}"
  local unit="${input: -1}"

  case "$unit" in
    s) echo "$num" ;;
    m) echo $((num * 60)) ;;
    h) echo $((num * 3600)) ;;
    *) echo "$input" ;;  # Assume raw seconds
  esac
}

SECONDS_DELAY=$(parse_time "$TIME")

# Load ntfy topic from config
NTFY_TOPIC=$(grep -o '"topic": "[^"]*"' ~/.pai/config/notifications.json 2>/dev/null | cut -d'"' -f4 || echo "")

# Background process to send notifications after delay
(
  sleep "$SECONDS_DELAY"

  # Desktop notification
  osascript -e "display notification \"$MESSAGE\" with title \"Atlas Reminder\" sound name \"Glass\"" 2>/dev/null || true

  # Phone notification via ntfy (if configured)
  if [ -n "$NTFY_TOPIC" ]; then
    curl -s -d "$MESSAGE" -H "Title: Atlas Reminder" -H "Tags: bell" "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1 || true
  fi
) &

# Disown so it survives shell exit
disown

echo "Reminder scheduled: \"$MESSAGE\" in $TIME ($SECONDS_DELAY seconds)"
