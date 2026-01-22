# Plan Workflow

Generate an ordered implementation plan based on analysis results.

## When to Use

- After running analyze workflow
- Ready to start implementing changes
- Need to understand optimal execution order
- Want to minimize risk during implementation
- Coordinating work across team members

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task` | No | Task slug from analysis (default: most recent analysis) |
| `scope` | No | Use existing indexed scope (default: most recent or "root") |
| `strategy` | No | Ordering strategy: `safe` (default), `fast`, `parallel` |

## Process

### 1. Load Analysis Results

Read the analysis files for the specified task:
- `analysis/{task}-changes.md` - Files to modify
- `analysis/{task}-gaps.md` - Missing abstractions
- `analysis/{task}-dupes.md` - Duplication opportunities

If no analysis exists, prompt user to run analyze workflow first.

### 2. Spawn Plan Agent

Use the Task tool to spawn a sub-agent:

```
Task(
  subagent_type: "Explore",
  prompt: """
  You are an implementation planner. Given analysis results, create an ordered execution plan.

  Task: {task}
  Scope: {scope}
  Strategy: {strategy}
  Analysis location: {output_dir}/analysis/

  First, read the analysis files to understand what needs to change.
  Then create an ordered implementation plan.

  ## Ordering Principles

  Apply these rules in priority order:

  ### 1. Dependency Order
  - Shared utilities before consumers
  - Types/interfaces before implementations
  - Config before components that read config
  - Parent modules before child modules

  ### 2. Test Order
  - Unit tests alongside their implementations
  - Integration tests after component completion
  - E2E tests last (after all components ready)

  ### 3. Risk Order (for "safe" strategy)
  - Low-risk changes first (config, types, utilities)
  - Medium-risk next (new files, isolated changes)
  - High-risk last (core logic modifications, breaking changes)

  ### 4. Logical Grouping
  - Group related files together
  - Complete one feature/module before starting another
  - Keep tests adjacent to their implementations

  ## Output Files

  Create: **{output_dir}/plans/{task-slug}-plan.md**

  Structure:
  ```markdown
  # Implementation Plan: {task}

  Generated: {timestamp}
  Strategy: {strategy}
  Analysis: {analysis-files}

  ## Overview

  [Brief summary of the implementation approach]

  ## Prerequisites

  - [ ] [Any setup needed before starting]
  - [ ] [Dependencies to install]
  - [ ] [Environment configuration]

  ## Phase 1: Foundation
  [Low-risk changes, shared utilities, types]

  ### Step 1.1: [Description]
  - **File:** `path/to/file.ts`
  - **Action:** Create | Modify | Delete
  - **Changes:** [What specifically to do]
  - **Depends on:** [Previous steps if any]
  - **Risk:** Low | Medium | High
  - **Tests:** [Related test file if any]

  ### Step 1.2: ...

  ## Phase 2: Core Implementation
  [Main feature/fix implementation]

  ### Step 2.1: ...

  ## Phase 3: Integration
  [Connecting components, integration tests]

  ### Step 3.1: ...

  ## Phase 4: Verification
  [E2E tests, manual verification steps]

  ### Step 4.1: ...

  ## Rollback Plan

  If issues arise at each phase:
  - Phase 1: [Rollback instructions]
  - Phase 2: [Rollback instructions]
  - Phase 3: [Rollback instructions]

  ## Estimated Effort

  | Phase | Steps | Est. Time | Risk |
  |-------|-------|-----------|------|
  | Foundation | X | Xm | Low |
  | Core | X | Xm | Medium |
  | Integration | X | Xm | Medium |
  | Verification | X | Xm | Low |
  | **Total** | X | Xm | - |
  ```

  Return a brief summary of the plan with an ordered checklist.
  """
)
```

### 3. Dependency Analysis

The agent builds a dependency graph:

```
file-a.ts (types)
    └── file-b.ts (uses types)
          ├── file-c.ts (uses file-b)
          └── file-d.ts (uses file-b)
                └── file-e.ts (uses file-d)
```

Topologically sorts for correct order:
1. file-a.ts
2. file-b.ts
3. file-c.ts, file-d.ts (parallel if strategy=parallel)
4. file-e.ts

### 4. Risk Assessment

For each change, assess risk:

**Low Risk:**
- Adding new files (no existing code affected)
- Configuration changes (easily reversible)
- Type definitions (compile-time only)
- Documentation updates

**Medium Risk:**
- Modifying existing functions (may affect callers)
- Adding parameters to functions
- Changing internal implementation
- Adding new dependencies

**High Risk:**
- Modifying public APIs
- Database schema changes
- Breaking interface changes
- Core algorithm modifications

### 5. Strategy Application

**Safe Strategy (default):**
- Strict dependency order
- Low risk first, high risk last
- Verification steps between phases
- Rollback points defined

**Fast Strategy:**
- Group by feature/module
- Parallel independent changes
- Minimal verification steps
- Optimized for speed

**Parallel Strategy:**
- Identify independent change sets
- Create work packages for parallel execution
- Synchronization points defined
- Good for team coordination

### 6. Return Summary

```markdown
## Plan: {task}

**Saved to:** `~/.pai/output/codebase/{project}/{scope}/plans/`

### Implementation Order

**Phase 1: Foundation** (X steps, ~Xm)
- [ ] Create shared types in `types/auth.ts`
- [ ] Add config entries in `config/index.ts`

**Phase 2: Core** (X steps, ~Xm)
- [ ] Create `middleware/rate-limit.ts`
- [ ] Update `routes/api.ts` to use middleware

**Phase 3: Integration** (X steps, ~Xm)
- [ ] Register middleware in `index.ts`
- [ ] Add integration tests

**Phase 4: Verification** (X steps, ~Xm)
- [ ] Run full test suite
- [ ] Manual API verification

**Total:** X steps, ~Xm estimated

**Full plan:** `plans/{task-slug}-plan.md`
```

## Strategy Examples

### Safe Strategy Output
```
1. Add types (no risk, enables type checking)
2. Add config (low risk, easily reversible)
3. Create utility (new file, no existing code affected)
4. Create middleware (new file, isolated)
5. Add unit tests for middleware
6. Integrate into routes (medium risk)
7. Integration tests
8. E2E tests
```

### Parallel Strategy Output
```
Work Package A (Developer 1):
1. Types + Config
2. Middleware + Unit tests

Work Package B (Developer 2):
1. Route handler updates
2. Integration tests

Sync Point: Merge and run full test suite

Work Package C (Either):
1. E2E tests
2. Documentation
```

## Context Efficiency

| Phase | Context Used | Saved |
|-------|-------------|-------|
| Analysis reading | Sub-agent | ~5,000 chars of analysis |
| Planning | Sub-agent | All planning logic |
| Storage | Files | Full detailed plan |
| Return | ~350 chars | Summary checklist only |

**Total context saved:** ~97% compared to inline planning
