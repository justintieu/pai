# Progress Tracking Protocol

Calculate learning progress from checkbox completion and visualize as journey view.

## Problem

Users need to see their learning progress visually and understand where they are in their journey:

- Raw task lists lack visual progress indication
- Progress calculation must be simple and reliable
- Journey visualization should show both completed and upcoming milestones
- Skipped tasks need automatic handling without user intervention
- Progress must update in real-time as tasks complete

## Solution

Calculate progress from checkbox completion in goal files and display via journey view visualization. Progress is derived, not stored - always reflects actual state.

## Progress Calculation

### Goal-Level Progress

```
completed_tasks = count of "- [x]" lines in goal file
total_tasks = count of "- [.]" lines in goal file (both checked and unchecked)
progress_percent = (completed_tasks / total_tasks) * 100
```

**Edge cases:**
- No tasks yet = 0% (not error)
- All complete = 100%
- Empty milestones still count if defined
- Division by zero protected (total=0 returns 0%)

### Milestone-Level Progress

Same calculation but scoped to milestone section (between H3 headers):

```
# Within ### M2: Ownership section only
completed_in_milestone = count of "- [x]" in section
total_in_milestone = count of "- [.]" in section
milestone_progress = (completed_in_milestone / total_in_milestone) * 100
```

### Shell Script Algorithm

```bash
calculate_progress() {
  local goal_file="$1"

  # Count completed tasks (checked boxes)
  completed=$(grep -c '^\s*- \[x\]' "$goal_file" 2>/dev/null || echo 0)

  # Count total tasks (any checkbox)
  total=$(grep -c '^\s*- \[.\]' "$goal_file" 2>/dev/null || echo 0)

  # Avoid division by zero
  if [ "$total" -eq 0 ]; then
    echo "0"
  else
    echo "$((completed * 100 / total))"
  fi
}

# Calculate milestone progress
calculate_milestone_progress() {
  local goal_file="$1"
  local milestone="$2"

  # Extract section between this milestone header and next
  awk "/^### $milestone/,/^### [^$milestone]|^## [^M]/" "$goal_file" | \
    grep -c '^\s*- \[x\]' 2>/dev/null || echo 0
}
```

## Journey View Visualization

### Linear Format (for 4-5 milestones)

Best for goals with few milestones - shows progression as connected waypoints:

```
[=======]──────[=======]──────[====   ]──────[       ]
 Basics         Ownership       Async          Projects
  100%            100%           60%             0%
```

**Visual elements:**
- `[=======]` - Complete milestone (filled)
- `[====   ]` - In-progress milestone (partial fill)
- `[       ]` - Planned milestone (empty)
- `──────` - Connection between milestones

### Vertical Format (for many milestones)

Better when space is limited or milestones exceed 5:

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

**Visual elements:**
- `[x]` - Complete milestone
- `[>]` - Current milestone (in progress)
- `[ ]` - Planned milestone
- `...` dots - Visual connection between name and percentage

### Format Selection

| Condition | Format |
|-----------|--------|
| < 6 milestones | Linear format |
| >= 6 milestones | Vertical format |
| User preference | Respect if set |

**Current milestone marker:** Always `[>]` or equivalent in either format.

## Task Surfacing

### Default View

Only show minimal context to avoid overwhelm:

- **Current milestone tasks** (all tasks in active milestone)
- **Next milestone preview** (2-3 tasks from upcoming milestone)
- **Overall progress** (percentage and journey view)

```markdown
## Current Focus

### M3: Async Rust (60% complete)
- [x] Read Async Rust book introduction
- [ ] **Next:** Build a simple web scraper with reqwest  <-- Highlighted
- [ ] Understand Tokio runtime basics

### Coming Up: M4 Projects
- [ ] Contribute to a Rust open-source project
- [ ] Build a CLI tool solving a real problem
```

### Full Roadmap

Hidden in collapsible details section:

```markdown
## Roadmap (Full)

<details>
<summary>View full roadmap (PAI-generated)</summary>

Week 1-2: Basics and syntax
Week 3-4: Ownership and borrowing deep dive
Week 5-6: Error handling and testing
Week 7-8: Async programming
Week 9-10: Web development with Actix
Week 11-12: Systems programming
Week 13+: Real project contributions

</details>
```

**Roadmap access:**
- Accessible on demand ("show full roadmap")
- Can be regenerated when direction changes
- Stored in goal file but collapsed by default

## Auto-Reschedule Behavior

### When Tasks Are Skipped

When a user skips or deprioritizes a task within a milestone:

1. **Detect skip intent:** User says "skip this for now" or "do that later"
2. **Move task to end:** Skipped task moves to end of current milestone's task list
3. **Preserve checkbox:** Task remains unchecked but repositioned
4. **Notify user:** "Moved [task] to later in the milestone"
5. **Progress unaffected:** Still counted as pending in calculations

**Example:**
```
Before:
- [ ] Build web scraper (user says "skip for now")
- [ ] Understand Tokio basics
- [ ] Write async tests

After:
- [ ] Understand Tokio basics
- [ ] Write async tests
- [ ] Build web scraper (moved to end)

PAI: "Moved 'Build web scraper' to later in this milestone."
```

### Missed Tasks Shift Automatically

If user completes tasks out of order:

- **Completed tasks marked [x]** regardless of original position
- **Uncompleted tasks remain visible** in their positions
- **No forced ordering** - user controls their path
- **Progress still accurate** - based on checkbox state only

### Roadmap Revision vs Auto-Reschedule

| Type | Scope | Trigger | Confirmation |
|------|-------|---------|--------------|
| **Auto-reschedule** | Task reorder within milestone | "Skip this", "do later" | None (automatic) |
| **Roadmap revision** | Milestones added/removed/reordered | "Change direction", "add milestone" | Required |

### Implementation Note

Auto-reschedule is a **PAI behavior**, not a shell script:

```bash
# This is illustrative - actual implementation is PAI-directed
reschedule_task() {
  local goal_file="$1"
  local task_text="$2"
  local milestone="$3"

  # Find task line in milestone section
  # Remove from current position
  # Append to end of milestone section (before next H3 or H2)
  # PAI handles the file edit via Edit tool
}
```

PAI detects reschedule intent conversationally and makes the edit.

## Updating Progress

### Task Completion

When user completes a task:

1. **Mark checkbox:** Change `[ ]` to `[x]`
2. **Update last_activity:** Set to today's date in frontmatter
3. **Recalculate progress:** Display new percentage
4. **Check milestone:** If milestone complete, trigger reflection prompt

**Example interaction:**
```
User: "Done with the async book chapter"

PAI: [marks checkbox]
"Great! M3: Async Rust is now 67% complete (2/3 tasks).
One more task to finish this milestone!"
```

### last_activity Update Triggers

Update `last_activity` in goal frontmatter when:

| Trigger | Example |
|---------|---------|
| Task completed | User marks task done |
| Milestone completed | All tasks in milestone finished |
| Goal modified | Tasks added or removed |
| Reflection added | User provides milestone reflection |
| Progress checked | User views goal status |

```bash
update_activity() {
  local goal_file="$1"
  local today=$(date +%Y-%m-%d)

  # Update last_activity field in YAML frontmatter
  sed -i '' "s/^last_activity:.*/last_activity: $today/" "$goal_file"
}
```

### Milestone Completion

When a milestone reaches 100%:

1. **Mark milestone header** as "(Complete)"
2. **Add completion date:** `*Completed: YYYY-MM-DD*`
3. **Prompt for reflection:** One question from reflection bank
4. **Store reflection:** In milestone section
5. **Update journey view:** Milestone shows as [x]

## Display Commands

| Command | Output |
|---------|--------|
| "Show progress" | Journey view for all active goals |
| "Goal: [name]" | Detailed view with current tasks |
| "Full roadmap for [name]" | Expanded view with all milestones and tasks |
| "Learning status" | Summary across all goals with pending counts |

**Example: "Show progress"**
```
Learning Goals
══════════════════════════════════════
  [>] Learn Rust ................. 65%
      Current: M3 Async (60%)
  [>] Piano Practice ............. 40%
      Current: M2 Chords (50%)
══════════════════════════════════════
```

**Example: "Goal: Learn Rust"**
```
Learn Rust Programming
═══════════════════════════════════════

[x] Basics ──────[x] Ownership ──────[>] Async ──────[ ] Projects
    100%             100%                60%             0%

## Current: M3 Async Rust
- [x] Read Async Rust book introduction
- [ ] Build a simple web scraper with reqwest
- [ ] Understand Tokio runtime basics

Last activity: 2 days ago
═══════════════════════════════════════
```

## Related Protocols

- [learning-goals](learning-goals.md) - Goal file schema and lifecycle
- [milestone-definition](milestone-definition.md) - Collaborative milestone creation
- [learning-nudges](learning-nudges.md) - Session-start reminders
- [draft-approve](draft-approve.md) - Confirmation workflow for roadmap changes

---

*Protocol: progress-tracking*
*Applies to: Learning domain progress visualization*
*Storage: Derived from core/context/learning/goals/*
