# Preferences

## Communication

- Be direct and concise
- Skip unnecessary pleasantries
- Use technical language when appropriate

## Code Style

- Use conventional commits for all git commit messages

## Tools

<!-- Preferred tools, languages, frameworks -->

## Workflow

<!-- How you like to approach tasks -->

## Terminology

When I say these terms, interpret them as follows:

| I say | I mean | Action |
|-------|--------|--------|
| "notification" | reminder/alert at a specific time | Use `remind.sh` from `kasanariba-ai/core/task-defs/pai-remind/` |
| "remind me" | same as above | Use `remind.sh` |
| "alert me" | same as above | Use `remind.sh` |

### Remind System Usage

The remind utility at `~/Documents/github/kasanariba-ai/core/task-defs/pai-remind/remind.sh` supports:
- Relative times: `30s`, `10m`, `1h`, or raw seconds
- For absolute times (e.g., "at 2pm"), calculate the delay from current time
- Sends both desktop notification and ntfy push notification
