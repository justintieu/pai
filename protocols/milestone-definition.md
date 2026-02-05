# Milestone Definition Protocol

Collaborative milestone creation through guided questions, not interrogation.

## Problem

Large learning goals feel overwhelming. Breaking them into milestones requires subject knowledge the user may not have. Without guidance:

- Users don't know where to start
- Goals remain abstract without concrete steps
- Milestones end up either too granular (tasks) or too vague (hopes)
- Time estimates become unrealistic guesses

## Solution

PAI collaboratively defines milestones through guided questions, suggesting structure based on the goal type and user's background. The process is conversational, not prescriptive.

**Key principles:**
- Questions calibrate, not interrogate
- Milestones are outcome-focused, not task-focused
- Initial structure is a draft, not a commitment
- Reflection prompts capture learning at milestone completion

## Collaborative Flow

The milestone definition process has three phases: Understanding, Suggesting, and Refining.

### Phase 1: Understanding

PAI asks 2-3 clarifying questions to understand context. These questions help calibrate the milestone suggestions.

**Core questions:**

1. **Background:** "What's your experience with [topic]?"
   - Calibrates pace and starting point
   - Identifies what can be skipped vs. needs deep coverage
   - Example: "Have you programmed before?" vs. "What languages do you know?"

2. **Purpose:** "What do you want to achieve with this?"
   - Defines end state and success criteria
   - Shapes which aspects to prioritize
   - Example: "Build CLI tools" vs. "Contribute to open source" vs. "General knowledge"

3. **Commitment:** "How much time can you dedicate weekly?"
   - Sets realistic milestone durations
   - Determines pace and depth
   - Keep optional — no pressure if user doesn't want timeframes

**Question guidelines:**
- Ask at most 3 questions upfront
- Keep questions focused and specific
- Accept partial answers gracefully
- Never pressure for timeframe commitment

**Example:**
```
User: "I want to learn Rust"

PAI: "Great goal! Let me help you break this down.

A few questions:
1. What's your programming background?
2. What do you want to build with Rust?
3. How much time can you dedicate weekly?

No pressure on timeframe - we can adjust as you go."
```

### Phase 2: Suggesting

Based on answers from Phase 1, PAI suggests 3-5 milestones as a draft.

**Suggestion principles:**
- Use context from Phase 1 to calibrate difficulty
- Keep milestones outcome-focused, not task-focused
- Provide rough time estimates only if user mentioned timeframe
- Present as draft for approval (via [draft-approve](draft-approve.md) protocol)
- Start conservative — easier to add than remove

**Good milestone names:**
- "Master Ownership & Borrowing" (outcome-focused)
- "Build Your First CLI Tool" (concrete deliverable)
- "Deploy a Production App" (measurable achievement)

**Bad milestone names:**
- "Read chapters 5-10" (task, not milestone)
- "Learn more stuff" (vague)
- "Week 3 work" (time-based, not outcome-based)

**Example:**
```
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
```

### Phase 3: Refining

User reviews and adjusts the suggested milestones. PAI supports these modifications:

**Supported actions:**

| Action | Example | PAI Response |
|--------|---------|--------------|
| Accept as-is | "Looks good" | Proceed to goal creation |
| Add milestone | "Add one for async" | Insert milestone, adjust timeline |
| Remove milestone | "Skip the basics, I know them" | Remove, adjust numbering |
| Reorder milestones | "Move projects before async" | Reorder, preserve content |
| Adjust time estimates | "2 weeks per milestone is too fast" | Revise all estimates |
| Modify scope | "Focus more on web, less on CLI" | Reshape milestone focus |

**After each modification:**
1. PAI confirms the change
2. Shows updated structure if significant
3. Asks "Anything else to adjust?"

**Example:**
```
User: "Looks good but add async somewhere"

PAI: "Added M4: Async Rust between Practical Skills and Projects.
Updated timeline: ~11 weeks total.

M1: Fundamentals (~2 weeks)
M2: Ownership Deep Dive (~2 weeks)
M3: Practical Skills (~3 weeks)
M4: Async Rust (~2 weeks)
M5: First Real Project (~2 weeks)

Ready to create this goal? Or any more adjustments?"
```

## Milestone Structure

Each milestone in the goal file follows this structure:

```markdown
### M{N}: {Name} ({Status})
*{Context note}*

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
```

### Status Values

| Status | Meaning | Display Note |
|--------|---------|--------------|
| Planned | Not yet started | "Scheduled: Month YYYY" |
| In Progress | Currently working on | "Started: YYYY-MM-DD" |
| Complete | All tasks done | "Completed: YYYY-MM-DD" |

### Context Notes

Context notes provide temporal context:
- **Started:** `*Started: 2026-01-23*`
- **Completed:** `*Completed: 2026-01-30*`
- **Scheduled:** `*Scheduled: February 2026*`

## Task Generation

Within milestones, PAI suggests tasks to make the milestone actionable.

### Task Guidelines

- **Keep visible tasks minimal:** 3-5 tasks per milestone maximum
- **Context-aware format:**
  - Course/reading: Actionable chapters or sections
  - Practice: Time-boxed exercises ("Spend 30 min on...")
  - Skills: Outcome-focused ("Build a CLI that...")
- **Time estimates optional:** Include only if user wants them
- **Full roadmap hidden:** Use collapsible `<details>` for extended task lists

### Task Generation Flow

After milestone structure is confirmed:

```
PAI: "Want me to suggest starting tasks for M1?
I can add them to the goal file, or you can add your own later."

User: "Yes, suggest some"

PAI: "Here are suggested tasks for M1: Fundamentals:

- [ ] Read chapters 1-4 of The Rust Book
- [ ] Complete Rustlings exercises (first 20)
- [ ] Write a simple CLI tool (file counter)

Want to adjust these, or shall I add them to the goal?"
```

## Reflection Prompt

When a user marks a milestone complete, PAI prompts for brief reflection.

### Reflection Guidelines

- **Pick ONE question** from the bank (vary each time)
- **Accept any length response** — even one word is valid
- **Store in milestone section** as part of completion record
- **Never require reflection** to mark milestone complete

### Reflection Question Bank

**Learning-focused:**
- "What's one thing you learned that surprised you?"
- "What concept finally 'clicked' during this milestone?"
- "What would you do differently if starting this milestone again?"

**Application:**
- "How might you use what you learned?"
- "What's one way this connects to something you already knew?"

**Process:**
- "What resources were most helpful?"
- "Was the pace right for this milestone?"

### Reflection Storage

```markdown
### M2: Ownership Deep Dive (Complete)
*Completed: 2026-01-22*
*Reflection: "Lifetimes are clearer after writing the linked list"*

- [x] Read chapters 5-10 of The Rust Book
- [x] Implement a linked list from scratch
- [x] Fix 10 borrow checker errors in practice code
```

### Quick Completion Option

For users in a hurry:
```
PAI: "M2 complete! Quick note on what you learned? (or skip)"

User: "skip"

PAI: "Got it. M2 marked complete. Ready for M3: Async Rust?"
```

## Example Conversation

Complete flow showing all phases:

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

Your first task: Read chapters 1-4 of The Rust Book

Let's do this!"
```

## Anti-Patterns

Common mistakes to avoid in milestone definition:

| Anti-Pattern | Why It's Harmful | Instead |
|--------------|------------------|---------|
| Overwhelming with too many milestones upfront | Discourages starting | Start with 3-4, add more as needed |
| Treating initial plan as fixed | Prevents natural evolution | Explicitly offer revision at any time |
| Creating tasks without asking first | Feels controlling | Offer to suggest, wait for confirmation |
| Making milestones too granular | Tasks, not stages | Milestones = achievements, tasks = steps |
| Requiring strict timeframes | Creates guilt when missed | Keep timeframes optional and flexible |
| Interrogating with too many questions | Overwhelming, feels like interview | Max 3 questions, accept partial answers |
| Generic milestones for all topics | Doesn't fit goal specifics | Tailor to user's stated purpose |

## Integration Points

This protocol integrates with:

- **[learning-goals](learning-goals.md):** Parent protocol for goal lifecycle
- **[draft-approve](draft-approve.md):** Used for confirming milestone structure
- **[progress-tracking](progress-tracking.md):** Calculates completion from milestone/task checkboxes
- **[learning-nudges](learning-nudges.md):** Reminds about stale milestones

---

*Protocol: milestone-definition*
*Applies to: Learning domain (Collaborator level)*
*Part of: Goal creation and revision workflow*
*See also: [learning-goals](learning-goals.md), [draft-approve](draft-approve.md)*
