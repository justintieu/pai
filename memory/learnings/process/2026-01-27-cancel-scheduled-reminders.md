# Cancel Scheduled Reminders

**Date:** 2026-01-27
**Category:** Process
**Status:** Action needed

## Problem

Cancelling a scheduled reminder (via `pai-remind`) was too difficult. The reminder runs as a background process with `sleep`, and there's no built-in way to list or cancel pending reminders.

## Current Workaround

Find and kill the process manually:

```bash
# Find reminder processes
ps aux | grep -i "sleep\|remind" | grep -v grep

# Kill by PID
kill <pid>
```

## Suggested Improvements

1. **Add `pai remind --list`** - Show pending reminders with their PIDs and scheduled times
2. **Add `pai remind --cancel [id]`** - Cancel a specific reminder or all reminders
3. **Track reminders in a file** - Store scheduled reminders in `~/.pai/state/reminders.json` with:
   - PID
   - Scheduled time
   - Message
   - Creation time

## Example Implementation

```bash
# List pending
pai remind --list
# ID    TIME      MESSAGE
# 1     10m       "10 minute reminder"
# 2     1h        "Check build"

# Cancel specific
pai remind --cancel 1

# Cancel all
pai remind --cancel-all
```

## Priority

Medium - This is a quality-of-life improvement that reduces friction.
