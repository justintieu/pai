# Learning Nudges Protocol

Gentle reminders and encouragement for learning goal progress.

## Problem

Learning goals require consistent attention, but aggressive reminders create guilt and cause users to disengage:

- Users abandon goals when reminded too frequently
- Guilt-inducing messages damage trust and motivation
- Stale goals clutter active lists without re-engagement options
- Celebration is often overlooked, reducing positive reinforcement

## Solution

Gentle, session-start nudges that encourage without pressuring. Only mention once per session, celebrate wins, and respect periods of inactivity.

## Session-Start Nudges

### When to Show

- At PAI session start (first interaction)
- Only for active goals with pending tasks
- Maximum one nudge per session (don't nag)

### Pending Task Detection

Use [progress-tracking](progress-tracking.md) protocol to identify pending tasks:

```bash
get_pending_count() {
  local goals_dir="$HOME/.pai/context/learning/goals"
  local total_pending=0

  for goal_file in "$goals_dir"/*.md; do
    [ -f "$goal_file" ] || continue

    # Only count active goals
    if grep -q '^status: active' "$goal_file"; then
      pending=$(grep -c '^\s*- \[ \]' "$goal_file" 2>/dev/null || echo 0)
      total_pending=$((total_pending + pending))
    fi
  done

  echo "$total_pending"
}
```

### Message Format

Subtle mention style:

```
"You have 2 learning tasks pending."
"Ready to continue learning Rust? Your next task is waiting."
```

NOT guilt-inducing:

```
"You haven't worked on your goals in 5 days!" (BAD)
"You're falling behind on Rust!" (BAD)
```

### Information to Include

- Number of pending tasks
- Next task preview (if single goal)
- Goal name (if multiple goals)
- Current milestone context

### Example Session-Start Output

**Single active goal:**
```
You have a pending task for "Learn Rust":
  -> Build a simple web scraper with reqwest (M3: Async)

Say "next task" to continue, or just get started when ready.
```

**Multiple active goals:**
```
You have 4 pending learning tasks across 2 goals:
  - Learn Rust: 2 tasks (M3: Async)
  - Piano Practice: 2 tasks (M2: Chords)

Say "learning status" for details.
```

## Stale Goal Re-engagement

### Definition of Stale

Goal is stale if:
- status = active
- last_activity > 30 days ago

### Detection Script

```bash
is_stale() {
  local goal_file="$1"
  local last_activity=$(grep '^last_activity:' "$goal_file" | cut -d' ' -f2)

  # Handle missing last_activity
  [ -z "$last_activity" ] && return 1

  # Calculate days since last activity
  local last_epoch=$(date -j -f "%Y-%m-%d" "$last_activity" +%s 2>/dev/null || \
                     date -d "$last_activity" +%s 2>/dev/null)
  local now_epoch=$(date +%s)
  local days_ago=$(( (now_epoch - last_epoch) / 86400 ))

  [ "$days_ago" -ge 30 ]
}

find_stale_goals() {
  local goals_dir="$HOME/.pai/context/learning/goals"

  for goal_file in "$goals_dir"/*.md; do
    [ -f "$goal_file" ] || continue

    if grep -q '^status: active' "$goal_file" && is_stale "$goal_file"; then
      basename "$goal_file" .md
    fi
  done
}
```

### Gentle Re-engagement

When stale goal detected, offer options:

```
It's been a while since you worked on "Learn Rust" (last activity: 30 days ago).

Options:
- Pick up where you left off (M3: Async Rust, 60% done)
- Pause this goal for now (removes from reminders)
- Archive it (keeps history, removes from active goals)
- Revise the roadmap (adjust direction)

No rush - learning is a journey, not a race.
```

### Frequency

- Surface stale goals once per week (not every session)
- Track when last mentioned to avoid repetition
- Store last mention date in goal frontmatter or separate tracking file

### Stale Mention Tracking

```yaml
# In goal frontmatter or ~/.pai/context/learning/nudge-state.json
stale_mentioned: 2025-01-20
```

Only show stale prompt if:
- Goal is stale (30+ days)
- Last stale mention was 7+ days ago

## Milestone Completion Celebration

### Win Detection

When milestone marked complete:
- Calculate overall progress increase
- Note streak (multiple completions in short period)

### Celebration Format

Brief, encouraging:

```
"Nice work completing 'Ownership & Borrowing'! You're 50% through Learn Rust."
"That's 3 milestones this month - you're making real progress."
```

### Celebration Triggers

| Event | Celebration |
|-------|-------------|
| Milestone complete | Always celebrate with progress update |
| 3+ tasks in a week | "You've completed X tasks this week" |
| Goal 50% | "You're halfway there!" |
| Goal complete | Full celebration with reflection prompt |

### Celebration Frequency

- Always celebrate milestone completion
- Occasionally celebrate task streaks (3+ tasks in a week)
- Keep brief - don't interrupt flow

## Inactivity Encouragement

### Trigger

- Active goal with pending tasks
- 7-14 days since last activity
- Not yet stale (< 30 days)

### Message

Encouraging, not guilt-inducing:

```
"Ready to get back to 'Learn Rust'? Here's your next task: [task]"
```

### Timing

- Include in session-start nudge
- Only once, don't repeat if user doesn't engage
- Respect user's implicit decline

### Detection Script

```bash
needs_encouragement() {
  local goal_file="$1"
  local last_activity=$(grep '^last_activity:' "$goal_file" | cut -d' ' -f2)

  [ -z "$last_activity" ] && return 1

  local last_epoch=$(date -j -f "%Y-%m-%d" "$last_activity" +%s 2>/dev/null || \
                     date -d "$last_activity" +%s 2>/dev/null)
  local now_epoch=$(date +%s)
  local days_ago=$(( (now_epoch - last_epoch) / 86400 ))

  # Between 7 and 29 days
  [ "$days_ago" -ge 7 ] && [ "$days_ago" -lt 30 ]
}
```

## Anti-Patterns

These behaviors damage user trust and motivation:

### Never Do

- **Auto-archive goals** - Always ask user before changing goal state
- **Guilt-trip about missed time** - "You've been gone 2 weeks" is harmful
- **Show multiple reminders in one session** - One nudge maximum
- **Interrupt mid-conversation** - Nudges only at session start
- **Compare to others** - "Most users..." or "On average..." is demotivating
- **Count days since activity** - Except in stale re-engagement prompt
- **Use urgent language** - "Don't fall behind!" creates anxiety
- **Stack notifications** - If user has 5 goals, don't list all 5

### Instead

- **Offer, don't demand** - "Ready to continue?" not "You need to work on this"
- **Celebrate progress** - Focus on what's done, not what's left
- **Respect silence** - If user doesn't engage, drop it
- **Be patient** - Learning is lifelong, not urgent

## Implementation Notes

### Session Detection

Session start is detected when PAI is first invoked in a new conversation. Use conversation ID or timestamp gap to identify new sessions.

### Nudge State Storage

Track nudge state to avoid repetition:

```json
// ~/.pai/context/learning/nudge-state.json
{
  "last_session_nudge": "2025-01-27T08:30:00Z",
  "stale_mentions": {
    "learn-rust": "2025-01-20"
  }
}
```

### Integration with Progress Tracking

This protocol depends on [progress-tracking](progress-tracking.md) for:
- Pending task counts
- Milestone completion detection
- Progress percentage calculations

## Related Protocols

- [learning-goals](learning-goals.md) - Goal file schema and lifecycle
- [milestone-definition](milestone-definition.md) - Collaborative milestone creation
- [progress-tracking](progress-tracking.md) - Progress calculation and visualization
- [draft-approve](draft-approve.md) - Confirmation workflow for goal state changes

---

*Protocol: learning-nudges*
*Applies to: Learning domain reminder and encouragement system*
*Depends on: progress-tracking protocol for task detection*
