# Notifications & Reminders

When user requests a notification, reminder, or alert at a specific time, use the PAI remind system.

## Tool Location

`~/Documents/github/kasanariba-ai/core/task-defs/pai-remind/remind.sh`

## Usage

```bash
remind.sh <time> <message>
```

## Time Formats

- Relative: `30s`, `10m`, `1h`, or raw seconds
- For absolute times (e.g., "at 2pm"), calculate delay from current time:
  ```bash
  now=$(date +%s)
  target=$(date -j -f "%Y-%m-%d %H:%M:%S" "YYYY-MM-DD HH:MM:SS" +%s)
  delay_minutes=$(( (target - now) / 60 ))
  ```

## Output

Sends both:
- Desktop notification (macOS)
- Push notification via ntfy (if configured)

## Terminology Mapping

| User says | Interpretation |
|-----------|----------------|
| "notification" | Time-based reminder |
| "remind me" | Time-based reminder |
| "alert me" | Time-based reminder |
