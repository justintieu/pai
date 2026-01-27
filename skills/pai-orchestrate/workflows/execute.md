# Execute Workflow

Full orchestration: decompose, spawn, execute, synthesize.

## When to Use

- Default workflow for pai-orchestrate
- Any multi-file or multi-area task
- Feature implementation, refactoring, investigation

## Phases

### Phase 1: DISCUSS (Optional)

Skip if requirements are already clear and unambiguous.

**When to include:**
- User request is vague or open-ended
- Multiple valid interpretations exist
- Need to capture preferences or constraints
- First time working with this user on this topic

**Steps:**
1. Identify ambiguities or missing information in the request
2. Use AskUserQuestion to clarify requirements
3. Capture decisions and constraints
4. Write CONTEXT.md with clarified requirements

**Output:** `/scratchpad/orchestrate-{slug}/context.md`

```markdown
# Context: [Task Name]

## Original Request
[User's original request]

## Clarifications
- Q: [question asked]
  A: [user's answer]
- Q: [question asked]
  A: [user's answer]

## Decisions Made
- [Decision 1]: [rationale]
- [Decision 2]: [rationale]

## Constraints
- [Constraint 1]
- [Constraint 2]

## Out of Scope
- [What we explicitly won't do]
```

**Why optional:**
- If user provides detailed spec, skip directly to Plan
- If task is clear from context, skip
- Only run when clarification would save wasted effort

### Phase 2: Understand (Optional)

Skip if you're already familiar with the codebase/domain.

**When to include:**
- First time working in this codebase
- Task involves unfamiliar domain
- Need external best practices

**Spawn:**
```
Task(
  prompt: "Use pai-codebase to index and understand the relevant parts of this codebase for: [task]
           Write findings to /scratchpad/orchestrate-{slug}/understand/codebase.md",
  subagent_type: "general-purpose",
  model: "sonnet"
)

Task(
  prompt: "Use pai-research to find best practices for: [relevant topic]
           Write findings to /scratchpad/orchestrate-{slug}/understand/research.md",
  subagent_type: "general-purpose",
  model: "sonnet"
)
```

### Phase 3: Plan

Decompose the task into a tree structure.

**Steps:**
1. Identify impact areas (API, UI, DB, tests, etc.)
2. For each area, identify directories/files affected
3. Write plan to `/scratchpad/orchestrate-{slug}/plan.md`

**Plan format:**
```markdown
# Orchestration Plan: [Task]

## Areas of Impact

### 1. API
- src/api/auth/
  - handlers/login.ts
  - handlers/logout.ts
  - middleware/validate.ts

### 2. UI
- src/components/auth/
  - LoginForm.tsx
  - LogoutButton.tsx

### 3. Database
- src/db/migrations/
  - add-users-table.ts
- src/db/models/
  - User.ts

### 4. Tests
- tests/api/auth.test.ts
- tests/components/auth.test.tsx

## Execution Order
1. Database (schema first)
2. API (backend logic)
3. UI (frontend)
4. Tests (verify)

## Skills to Use
- pai-codebase: Already indexed
- pai-council: Review after implementation
```

### Phase 4: Execute

Execute tasks in waves - each wave runs in parallel, waves run sequentially.

**Wave Execution:**
1. Parse plan.md for `<task>` elements
2. Build dependency graph from `<depends>` tags
3. Calculate waves (tasks with no dependencies = wave 1)
4. For each wave in order:
   a. Spawn all tasks in wave in parallel (single message with multiple Tasks)
   b. Wait for all to complete
   c. Verify manifests created
   d. Proceed to next wave only if all passed

**Wave Structure Example:**
| Wave | Tasks | Dependencies |
|------|-------|--------------|
| 1 | task-01, task-02 | None (foundation) |
| 2 | task-03 | Depends on task-01 |
| 3 | task-04, task-05 | Depends on task-03 |

**For each task in wave, spawn executor:**
```
Task(
  prompt: "Execute this task from the orchestration plan:

  ## Task
  [task XML from plan]

  ## Context
  - Orchestration: [task name]
  - Wave: [wave number]
  - Dependencies completed: [list]

  ## Instructions
  1. Read affected files
  2. Implement the action steps
  3. Verify using the <verify> criteria
  4. Write summary to /scratchpad/orchestrate-{slug}/tasks/[task-id].md

  ## Output Format
  ```yaml
  status: complete | failed
  summary: 'What was accomplished'
  files_changed:
    - path/to/file.ts
  verification: 'How it was verified'
  ```",
  subagent_type: "general-purpose",
  model: "sonnet"
)
```

**Spawn all tasks in a wave in a SINGLE message** for true parallelism.

**Error Handling:**
- If any task in a wave fails:
  1. Mark task as failed in manifest
  2. Check if dependent tasks can proceed
  3. If critical path blocked, stop and report
  4. If non-critical, continue with remaining tasks

**Area Aggregation:**
After all waves complete, aggregate by area:
- Group task outputs by area (API, UI, DB, etc.)
- Write `/scratchpad/orchestrate-{slug}/areas/[area]/synthesized.md`
- Each area synthesis combines all task outputs for that area

### Phase 5: Validate (Optional)

After all areas complete, optionally run validation.

**When to include:**
- Security-sensitive changes
- Major architectural changes
- User requested review

**Spawn:**
```
Task(
  prompt: "Use pai-council quick to review the implementation at /scratchpad/orchestrate-{slug}/
           Focus on: [specific concerns]
           Write review to /scratchpad/orchestrate-{slug}/validate/council.md",
  subagent_type: "general-purpose"
)
```

For security-sensitive:
```
Task(
  prompt: "Use pai-redteam to find security issues in /scratchpad/orchestrate-{slug}/
           Write findings to /scratchpad/orchestrate-{slug}/validate/redteam.md",
  subagent_type: "general-purpose"
)
```

### Phase 6: Synthesize

Combine all area syntheses into final deliverable.

**Read:**
- Each `areas/[area]/synthesized.md`
- Each `areas/[area]/manifest.yaml` for status
- Any validation outputs

**Write `/scratchpad/orchestrate-{slug}/final.md`:**
```markdown
# [Task] - Implementation Complete

## Summary
[2-3 sentences describing what was accomplished]

## Changes by Area

### API
[Summary from api/synthesized.md]

### UI
[Summary from ui/synthesized.md]

### Database
[Summary from database/synthesized.md]

### Tests
[Summary from tests/synthesized.md]

## Validation
- Council: [summary or "not run"]
- Redteam: [summary or "not run"]

## Files Changed
- src/api/auth/handlers/login.ts
- src/api/auth/handlers/logout.ts
- ...

## Next Steps
[Any follow-up actions needed]
```

### Phase 7: Return

Return summary to Atlas (main agent):

```markdown
## Orchestration Complete

**Task**: [original task]
**Status**: Complete

### Summary
[From final.md]

### Deliverable
/scratchpad/orchestrate-{slug}/final.md

### Areas
- [x] API: [summary]
- [x] UI: [summary]
- [x] Database: [summary]
- [x] Tests: [summary]
```

## Task Output Format

Each task executor writes to `/scratchpad/orchestrate-{slug}/tasks/[task-id].md`:

```yaml
status: complete | failed
summary: 'What was accomplished'
files_changed:
  - path/to/file.ts
verification: 'How it was verified'
```

## Checklist

- [ ] Created scratchpad directory
- [ ] Ran discuss phase (if needed)
- [ ] Ran understand phase (if needed)
- [ ] Wrote plan.md with XML task specs
- [ ] Calculated wave execution order
- [ ] Executed each wave (parallel tasks, sequential waves)
- [ ] Aggregated task outputs by area
- [ ] Ran validation (if needed)
- [ ] Wrote final.md
- [ ] Returned summary to Atlas
