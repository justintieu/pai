# PAI Ideas & Backlog

Feature ideas and enhancements for Personal AI Infrastructure.

---

## Proactive Reminders & Scheduling

**Added:** 2026-01-21
**Status:** Idea

Make PAI proactive by enabling scheduled reminders and triggered actions.

### Problem
Claude only exists during active conversations. No way to:
- Send reminders at a future time
- Trigger actions based on events
- Proactively reach out to the user

### Proposed Solution

| Component | Purpose | Options |
|-----------|---------|---------|
| **Storage** | Persist scheduled tasks | `~/.pai/memory/reminders.yaml` |
| **Scheduler** | Trigger at the right time | `cron`, `launchd` (macOS), daemon |
| **Executor** | Run Claude when triggered | Claude Code CLI |
| **Notifier** | Reach the user | `terminal-notifier`, `ntfy.sh`, email, SMS |

### MVP Scope
1. `/pai remind` skill to capture reminders
2. Cron job + shell script to check and notify
3. `terminal-notifier` for macOS notifications

### Future Features
- Recurring reminders
- Context-aware triggers ("when I open this project...")
- Daily briefings / proactive check-ins
- Event watching (file changes, git pushes, CI results)

---
