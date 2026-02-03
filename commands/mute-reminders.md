# /pai mute-reminders

Mute deadline reminders for the current day.

## Usage

```
/pai mute-reminders
```

## Behavior

When invoked:
1. Write today's date (YYYY-MM-DD format) to `~/.pai/memory/reminders/.muted-today`
2. Confirm the mute was applied
3. Reminders will not display for the rest of today

## Implementation

```bash
# Get today's date in YYYY-MM-DD format
TODAY=$(date +%Y-%m-%d)

# Create the mute file directory if needed
mkdir -p ~/.pai/memory/reminders

# Write today's date to the mute file
echo "$TODAY" > ~/.pai/memory/reminders/.muted-today
```

## Notes for AI

When the user runs `/pai mute-reminders`:
1. Execute the bash command above to write the mute file
2. Confirm: "Deadline reminders muted for today ({date}). They will appear again tomorrow."
