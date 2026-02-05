# Learning Goals Protocol

File-based learning goal management with collaborative milestone definition and progress tracking.

## Problem Being Solved

Users want to track long-term learning goals with visible progress, but typical todo lists don't capture the journey or provide collaborative breakdown:

- Learning goals are open-ended, not simple checklist items
- Progress is hard to visualize without milestone structure
- Large goals feel overwhelming without collaborative breakdown
- Goals go stale without gentle accountability
- Standard task managers lack reflection and journey capture

Plain todo lists are insufficient. The system needs:
- Hierarchical structure (goals > milestones > tasks)
- Visible progress tracking and journey visualization
- Collaborative milestone definition with PAI
- Gentle reminders without guilt-inducing pressure
- File-based storage consistent with PAI architecture

## Solution

**File-based learning goals** stored as markdown files in `core/context/learning/goals/`. Each goal is one file with YAML frontmatter for metadata, milestones as H3 sections, and tasks as checkboxes.

### Why This Approach

| Alternative | Why Not |
|-------------|---------|
| Database storage | Overkill for text-based goals, loses human readability |
| Single goals.md file | Hard to manage many goals, merge conflicts |
| JSON files | Less readable, harder to edit manually |
| External service | Network dependency, privacy concerns, friction |
| **Markdown files** | Portable, versionable, editable in any text editor |

## File Storage Location

```
core/context/learning/
├── index.md              # Learning domain overview
├── goals/                # One file per goal
│   ├── learn-rust.md
│   ├── piano-practice.md
│   └── spanish-fluency.md
└── templates/
    └── goal-template.md  # Template for new goals
```

## Goal File Schema

Each learning goal is a markdown file with YAML frontmatter:

### Frontmatter Fields

```yaml
---
id: learn-rust                    # Unique identifier (kebab-case from title)
title: Learn Rust Programming     # Display name
created: 2026-01-15               # Goal creation date
status: active                    # active | paused | completed | archived
timeframe: 2026-06-01             # Optional target completion date
why: "Want to contribute..."      # Optional motivation statement
last_activity: 2026-01-25         # Last interaction date (for stale detection)
---
```

### Status Values

| Status | Meaning | Visible In |
|--------|---------|------------|
| `active` | Currently working on | Default goal list, session reminders |
| `paused` | Temporarily on hold | "Show all goals" only |
| `completed` | Finished successfully | Completed goals view |
| `archived` | No longer pursuing | "Show archived" only |

### Section Structure

```markdown
# [Goal Title]

[Free-form description in user's own words]

## Journey

```
[x] Basics ──────[x] Ownership ──────[ ] Async ──────[ ] Projects
    Jan 15          Jan 22             (next)          (future)
```

## Milestones

### M1: [Milestone Name] (Complete)
*Completed: YYYY-MM-DD*
*Reflection: "[User's reflection on what they learned]"*

- [x] Task 1
- [x] Task 2
- [x] Task 3

### M2: [Milestone Name] (In Progress)
*Started: YYYY-MM-DD*

- [x] Completed task
- [ ] Next task (highlighted as next action)
- [ ] Future task

### M3: [Milestone Name] (Planned)
*Scheduled: Month Year*

- [ ] Future task 1
- [ ] Future task 2

## Resources

PAI-suggested resources for this goal:
- [Resource 1](url)
- [Resource 2](url)

## Roadmap (Full)

<details>
<summary>View full roadmap (PAI-generated)</summary>

[Expanded timeline with all planned milestones and tasks]

</details>

## Notes

[User's ongoing notes, thoughts, and observations]
```

## File Naming Convention

- **Format:** `{id}.md` where id is kebab-case derived from title
- **Derivation:** Lowercase, spaces to hyphens, alphanumeric only
- **Examples:**
  - "Learn Rust Programming" -> `learn-rust-programming.md`
  - "Piano Practice" -> `piano-practice.md`
  - "Spanish B2 Fluency" -> `spanish-b2-fluency.md`

## Goal Lifecycle

### Create Goal

**Trigger:** User expresses learning intent ("I want to learn Rust")

**Flow:**

1. **PAI asks clarifying questions:**
   - Background: "What's your programming background?"
   - Purpose: "What do you want to build with Rust?"
   - Time: "How much time can you dedicate weekly?"

2. **PAI suggests initial milestones** (via [milestone-definition](milestone-definition.md) protocol):
   - 3-4 high-level milestones
   - Reasonable timeline based on time commitment
   - No overwhelming detail upfront

3. **User confirms or adjusts:**
   - Add/remove milestones
   - Adjust pacing
   - Modify first milestone tasks

4. **PAI creates goal file:**
   - Draft presented for review
   - File created only after explicit confirmation
   - Reports file location on success

### View Goals

**"Show my goals"** - List active goals with progress:
```
Learning Goals
══════════════════════════════════════
  [>] Learn Rust ................. 65%
      Current: M3 Async (60%)
  [>] Piano Practice ............. 40%
      Current: M2 Chords (50%)
══════════════════════════════════════
```

**"Goal details for [name]"** - Full goal view:
- Title and motivation
- Journey visualization
- Current milestone and tasks
- Progress percentage
- Last activity date

**"Learning progress"** - Summary across all goals:
- Total active goals
- Pending tasks count
- Goals needing attention (stale)

### Pause Goal

**Trigger:** User says "pause [goal]" or "put [goal] on hold"

**Actions:**
1. Set `status: paused` in frontmatter
2. Remove from session-start reminders
3. Preserve all progress and milestones
4. Confirm: "Paused '[goal]'. All progress saved. Say 'resume [goal]' when ready."

**Resume:** Set `status: active`, update `last_activity`

### Archive Goal

**Trigger:** User says "archive [goal]" or "I'm not pursuing [goal] anymore"

**Actions:**
1. Set `status: archived` in frontmatter
2. Remove from all default views
3. Keep file intact (no deletion)
4. Confirm: "Archived '[goal]'. Still accessible via 'show archived goals'."

**Note:** PAI never auto-archives. Always requires explicit user request.

### Complete Goal

**Trigger:** User marks final milestone complete or says "I've finished [goal]"

**Actions:**
1. Set `status: completed` in frontmatter
2. Prompt for final reflection: "What did completing this goal mean to you?"
3. Celebrate the accomplishment
4. Add to "completed goals" view

**Example celebration:**
```
Congratulations on completing "Learn Rust Programming"!

You've journeyed through 4 milestones over 5 months:
  [x] Basics -> [x] Ownership -> [x] Async -> [x] Projects

Your reflection: "Finally feel confident contributing to CLI tools"

This goal is now in your completed achievements.
```

### Delete Goal

**Trigger:** User says "delete [goal]" or "remove [goal] permanently"

**Flow:**
1. **Confirm intention:**
   ```
   Delete 'Learn Rust'? This cannot be undone.
   Alternative: Archive instead? (preserves history)
   [delete / archive / cancel]
   ```

2. **On explicit "delete" confirmation:**
   - Remove goal file from `goals/` directory
   - Confirm: "Deleted '[goal]' permanently."

**Safety:** PAI suggests archive as alternative. Only delete on explicit confirmation.

## Example Flows

### Example 1: Creating a New Goal

```
User: "I want to learn Rust"

PAI: "Great goal! Let me help you break this down.

A few questions:
1. What's your programming background?
2. What do you want to build with Rust?
3. How much time can you dedicate weekly?

No pressure on timeframe - we can adjust as you go."

User: "I know Python, want to build CLI tools, maybe 5 hours/week"

PAI: "Based on that, here's a suggested milestone structure:

**M1: Fundamentals** (~2 weeks)
- Syntax, ownership basics, cargo

**M2: Ownership Deep Dive** (~2 weeks)
- Borrowing, lifetimes, smart pointers

**M3: Practical Skills** (~3 weeks)
- Error handling, testing, CLI with clap

**M4: First Real Project** (~2 weeks)
- Build something useful for yourself

Does this feel right? We can adjust the pace or add/remove milestones."

User: "Looks good but add async somewhere"

PAI: "Added M4: Async Rust between Practical Skills and Projects.
Updated timeline: ~11 weeks total.

Ready to create this goal?"

User: "Yes"

PAI: "Created 'Learn Rust Programming' goal.
File: core/context/learning/goals/learn-rust-programming.md

Your first task: Read chapters 1-2 of The Rust Book

Let's do this!"
```

### Example 2: Viewing Goals and Progress

```
User: "Show my learning goals"

PAI: "
Learning Goals
══════════════════════════════════════
  [>] Learn Rust ................. 65%
      Current: M3 Async (60%)
      Last activity: 2 days ago

  [>] Piano Practice ............. 40%
      Current: M2 Chord Progressions (50%)
      Last activity: 5 days ago
══════════════════════════════════════

Which would you like to work on?"
```

### Example 3: Pausing a Goal

```
User: "Pause piano practice for now"

PAI: "Paused 'Piano Practice'.

- All progress saved (M2: 50% complete)
- Removed from session reminders
- Say 'resume piano practice' whenever you're ready

No pressure - learning is a journey, not a race."
```

### Example 4: Completing a Milestone

See [progress-tracking](progress-tracking.md) protocol for milestone completion flow with reflection prompts.

## Progress Calculation

Progress is derived from checkbox completion:

```bash
# Goal-level progress
completed=$(grep -c '^\s*- \[x\]' "$goal_file")
total=$(grep -c '^\s*- \[.\]' "$goal_file")
progress=$((completed * 100 / total))

# Milestone-level progress (within milestone section)
# Extract section, count checkboxes
```

### Display Formats

**Linear Journey** (for 4-5 milestones):
```
[=======]──────[=======]──────[====   ]──────[       ]
 Basics         Ownership       Async          Projects
  100%            100%           60%             0%
```

**Vertical Journey** (for many milestones or detailed view):
```
Learning Rust
═══════════════════════════════════════
  [x] Basics ......................... 100%
  [x] Ownership ...................... 100%
  [>] Async (current) ................ 60%
  [ ] Projects ....................... 0%
═══════════════════════════════════════
Overall Progress: 65%
```

## Stale Goal Handling

**Definition:** Goal with `last_activity` > 30 days ago and `status: active`

**Detection:** Session-start check across all active goals

**Gentle Re-engagement:**
```
PAI: "It's been a while since you worked on 'Learn Rust' (30 days).

Options:
- Pick up where you left off (M3: Async Rust, 60% done)
- Pause this goal for now (removes from reminders)
- Archive it (keeps history, removes from active)
- Revise the roadmap (adjust direction)

No rush - learning is a journey, not a race."
```

**Key principle:** Mention once per session, never guilt-inducing.

## Autonomy Level

Learning domain operates at **Collaborator** level:

- PAI suggests, user confirms before any changes
- Never create/modify goals without explicit confirmation
- Use [draft-approve](draft-approve.md) workflow for:
  - Goal creation
  - Milestone definition
  - Task additions
  - Status changes

### What PAI Does Autonomously

- Calculate and display progress
- Detect stale goals
- Suggest next tasks
- Offer encouragement

### What Requires Confirmation

- Creating new goals
- Adding/removing milestones
- Marking tasks complete (user action)
- Pausing/archiving/deleting goals
- Modifying roadmaps

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Harmful | Instead |
|--------------|------------------|---------|
| Overwhelming roadmap upfront | Discourages starting | Show 3-4 milestones, expand later |
| Rigid timeframes | Creates guilt when missed | Timeframes are suggestions, not deadlines |
| Guilt-inducing reminders | User disengages | Encouraging tone, mention once |
| Auto-archiving stale goals | Loses user agency | Always ask permission |
| Creating tasks without asking | Feels controlling | Suggest, wait for confirmation |
| Push notifications | Interrupts focus | Session-start nudges only |

## Related Protocols

- [milestone-definition](milestone-definition.md) - Collaborative milestone creation flow
- [progress-tracking](progress-tracking.md) - Progress calculation and journey visualization
- [learning-nudges](learning-nudges.md) - Session-start reminders and encouragement
- [draft-approve](draft-approve.md) - Confirmation workflow for changes
- [autonomy-levels](autonomy-levels.md) - Collaborator level behavior

## Implementation Notes

### Creating a Goal File

```bash
create_goal() {
  local title="$1"
  local goals_dir="core/context/learning/goals"

  # Generate ID from title
  local id=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
  local goal_file="$goals_dir/$id.md"

  # Check for existing
  if [ -f "$goal_file" ]; then
    echo "Goal '$id' already exists"
    return 1
  fi

  # Create from template (after user confirmation)
  # ... template expansion ...

  echo "Created: $goal_file"
}
```

### Listing Active Goals

```bash
list_goals() {
  local goals_dir="core/context/learning/goals"

  for goal_file in "$goals_dir"/*.md; do
    [ -f "$goal_file" ] || continue

    local status=$(awk '/^status:/{print $2}' "$goal_file")
    [ "$status" = "active" ] || continue

    local title=$(awk '/^title:/{gsub(/^title: ?/, ""); print}' "$goal_file")
    local progress=$(calculate_progress "$goal_file")

    echo "  [$( [ "$progress" -eq 100 ] && echo "x" || echo ">" )] $title ... $progress%"
  done
}
```

### Updating Last Activity

After any goal interaction, update `last_activity` in frontmatter:

```bash
update_activity() {
  local goal_file="$1"
  local today=$(date +%Y-%m-%d)

  # Update last_activity field
  sed -i '' "s/^last_activity:.*/last_activity: $today/" "$goal_file"
}
```

---

*Protocol: learning-goals*
*Applies to: Learning domain (Collaborator level)*
*Storage: core/context/learning/goals/*
*See also: [milestone-definition](milestone-definition.md), [progress-tracking](progress-tracking.md)*
