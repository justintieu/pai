---
name: remind
alias: pai-remind
description: Schedule timed reminders via desktop and phone notifications. USE WHEN remind me, notify me in, set reminder, timer, alert me later.
tools: [Bash]
---

# PAI Remind

Schedule notifications to fire after a delay. Useful for:
- "Remind me in 10 minutes to check the build"
- "Notify me in 1 hour about the meeting"
- "Alert me in 30 seconds when this finishes"

## Usage

When user asks for a reminder, parse the time and message, then run:

```bash
~/.pai/skills/pai-remind/remind.sh "<time>" "<message>"
```

### Time Formats

| Format | Example | Meaning |
|--------|---------|---------|
| `Ns` | `30s` | 30 seconds |
| `Nm` | `10m` | 10 minutes |
| `Nh` | `1h` | 1 hour |
| `N` | `300` | 300 seconds (raw) |

### Examples

```bash
# Remind in 10 minutes
~/.pai/skills/pai-remind/remind.sh "10m" "Check on the build"

# Remind in 1 hour
~/.pai/skills/pai-remind/remind.sh "1h" "Meeting starts soon"

# Remind in 30 seconds
~/.pai/skills/pai-remind/remind.sh "30s" "Timer done"
```

## Notification Channels

Reminders are sent to:
- **Desktop**: macOS notification (if at computer)
- **Phone**: ntfy push notification (if away)

## Instructions

1. Parse the user's request for time and message
2. Convert time to the format above (e.g., "10 minutes" → "10m")
3. Run the remind.sh script
4. Confirm to user that reminder is scheduled

### Example Interaction

User: "Remind me in 15 minutes to review the PR"

```bash
~/.pai/skills/pai-remind/remind.sh "15m" "Review the PR"
```

Response: "Reminder set for 15 minutes from now."
