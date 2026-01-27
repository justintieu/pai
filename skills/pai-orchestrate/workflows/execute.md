# Execute Workflow

Full orchestration: decompose, spawn, execute, synthesize.

## When to Use

- Default workflow for pai-orchestrate
- Any multi-file or multi-area task
- Feature implementation, refactoring, investigation

## Phases

### Phase 1: Understand (Optional)

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

### Phase 2: Plan

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

### Phase 3: Execute

Spawn the tree with BFS (all siblings in parallel).

**For each area, spawn an area agent:**
```
Task(
  prompt: "You are the [AREA] area agent for: [TASK]

  ## Your Scope
  [List of directories/files in this area]

  ## Instructions
  1. For each directory in your scope, spawn a directory agent
  2. Directory agents spawn file agents for each file
  3. File agents do the actual work (1 file = 1 agent)
  4. Collect summaries from children
  5. Write synthesized.md combining all changes in your area
  6. Write manifest.yaml with status

  ## Output Location
  /scratchpad/orchestrate-{slug}/areas/[area]/

  ## Manifest Protocol
  When done, write manifest.yaml:
  ```yaml
  status: complete
  summary: 'One sentence of what was accomplished in this area'
  outputs:
    - synthesized.md
  ```",
  subagent_type: "general-purpose"
)
```

**Spawn all area agents in parallel** using multiple Task calls in one message.

### Phase 4: Validate (Optional)

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

### Phase 5: Synthesize

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

### Phase 6: Return

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

## Leaf Agent Template

For the deepest level (file agents):

```
Task(
  prompt: "You are a file agent for: [FILE_PATH]

  ## Task
  [Specific change needed for this file]

  ## Context
  - Parent task: [overall goal]
  - Area: [which area]
  - Related files: [siblings if relevant]

  ## Instructions
  1. Read the file
  2. Make the required changes
  3. Write summary to /scratchpad/orchestrate-{slug}/areas/[area]/[dir]/[filename].md

  ## Output Format
  Your summary should include:
  - What was changed
  - Why
  - Any concerns or notes

  You are a LEAF - do not spawn children.",
  subagent_type: "general-purpose",
  model: "sonnet"
)
```

## Error Handling

If an agent fails:
1. Mark in manifest: `status: failed`, `error: "message"`
2. Continue with siblings (don't block the whole tree)
3. Surface failures in final synthesis
4. Let user decide to retry or accept partial

## Checklist

- [ ] Created scratchpad directory
- [ ] Ran understand phase (if needed)
- [ ] Wrote plan.md
- [ ] Spawned all area agents in parallel
- [ ] Waited for all areas to complete
- [ ] Ran validation (if needed)
- [ ] Wrote final.md
- [ ] Returned summary to Atlas
