# Learning

Personal learning goal tracking with collaborative milestone definition, progress visualization, and gentle nudges.

## Purpose

This directory stores your learning goals so PAI can help you break them into manageable milestones, track progress visually, and provide gentle reminders. Goals are free-form and self-paced. PAI acts as a collaborator, suggesting structure but never creating tasks without your approval.

## Contents

| Path | Purpose |
|------|---------|
| [goals/](goals/) | One file per active learning goal |
| [templates/](templates/) | Goal file template for scaffolding new goals |

## How It Works

1. **Define goals** - Tell PAI what you want to learn in your own words
2. **Break into milestones** - PAI asks questions and suggests milestone structure collaboratively
3. **Track progress** - Checkbox-based tasks derive progress automatically
4. **Get nudges** - Session-start reminders surface your next learning tasks

## Managing Your Learning

### Add a Goal

Tell PAI what you want to learn:
- "I want to learn Rust"
- "Help me learn piano basics"
- "Add a learning goal for public speaking"

PAI will ask clarifying questions to help define meaningful milestones.

### View Goals

- "Show my learning goals" - List active goals with progress percentages
- "How am I doing on Rust?" - Specific goal progress and journey view
- "What's next?" - Surface immediate learning tasks across all goals

### Update Progress

- Mark tasks complete directly in goal files
- "I finished the async chapter" - PAI updates the relevant task
- "Complete M2 for Rust" - Mark entire milestone done

### Manage Goals

- "Pause my piano goal" - Remove from active reminders
- "Archive the Rust goal" - Keep history, remove from active view
- "Revise my learning roadmap" - Adjust milestones as interests evolve

## Progress Display

PAI shows progress in two ways:

**Journey View** (horizontal timeline):
```
[x] Basics ──────[x] Ownership ──────[ ] Async ──────[ ] Projects
    100%             100%              60%             0%
```

**Summary View** (for multiple goals):
```
Learning Goals
==============
  [x] Learn Rust ................ 65% (M3: Async)
  [>] Piano Basics .............. 40% (M2: Chords)
  [ ] Public Speaking ........... 10% (M1: Structure)
```

## Nudge Behavior

| Trigger | Behavior |
|---------|----------|
| Session start | Mention active goals with pending tasks (once per session) |
| 30+ days inactive | Gentle check-in: continue, pause, or archive? |
| Milestone complete | Optional reflection prompt |
| "Stop reminding me" | Respects request, removes from nudges |

**Tone:** Encouraging, never guilt-inducing. Learning is a journey, not a race.

## Related

- [Learning Goals](../../protocols/learning-goals.md) - Goal creation and lifecycle management
- [Milestone Definition](../../protocols/milestone-definition.md) - Collaborative milestone creation
- [Progress Tracking](../../protocols/progress-tracking.md) - Progress calculation and journey view
- [Learning Nudges](../../protocols/learning-nudges.md) - Session-start reminders
