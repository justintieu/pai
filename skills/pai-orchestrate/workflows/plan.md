# Plan Workflow

Show the decomposition tree without executing. Useful for understanding scope before committing.

## When to Use

- User says "plan", "show me the tree", "what would you do"
- Want to verify scope before executing
- Estimating complexity

## Steps

### 1. Understand (Quick)

If unfamiliar with codebase:
```
Task(
  prompt: "Quick scan: What are the main areas of this codebase relevant to [task]?
           List directories and their purposes. Keep it brief.",
  subagent_type: "Explore"
)
```

### 2. Identify Impact Areas

Based on the task, identify which areas will be affected:

| Area Type | Examples |
|-----------|----------|
| **API** | Routes, handlers, middleware |
| **UI** | Components, pages, styles |
| **Database** | Migrations, models, queries |
| **State** | Stores, context, reducers |
| **Tests** | Unit, integration, e2e |
| **Config** | Environment, build, deploy |
| **Docs** | README, API docs, comments |

### 3. Decompose Each Area

For each impact area:
1. List affected directories
2. List affected files in each directory
3. Note what changes are needed

### 4. Identify Skills Needed

Which pai-* skills should be part of the tree?

| Scenario | Skills |
|----------|--------|
| Unfamiliar codebase | `pai-codebase` (understand) |
| External best practices needed | `pai-research` |
| Security-sensitive | `pai-redteam` |
| Major architectural decision | `pai-council` |
| Complex multi-phase work | `pai-algorithm` |

### 5. Output Plan

Present to user:

```markdown
# Orchestration Plan: [Task]

## Tree Structure

```
[Task]
├─► Understand
│   ├─► pai-codebase (index relevant areas)
│   └─► pai-research (best practices)
│
├─► Execute
│   ├─► API (3 dirs, 8 files)
│   │   ├─► handlers/ (4 files)
│   │   ├─► middleware/ (2 files)
│   │   └─► routes/ (2 files)
│   │
│   ├─► UI (2 dirs, 5 files)
│   │   ├─► components/ (3 files)
│   │   └─► pages/ (2 files)
│   │
│   ├─► Database (2 dirs, 3 files)
│   │   ├─► migrations/ (1 file)
│   │   └─► models/ (2 files)
│   │
│   └─► Tests (1 dir, 4 files)
│       └─► __tests__/ (4 files)
│
└─► Validate
    └─► pai-council (review)
```

## Estimated Scope

- **Areas**: 4
- **Directories**: 9
- **Files**: 20 leaf agents
- **Skills**: pai-codebase, pai-research, pai-council

## Execution Order

1. Understand (sequential)
2. Execute areas (parallel)
   - Within each area, directories parallel
   - Within each directory, files parallel
3. Validate (sequential)

## Ready to Execute?

Reply "go" to start orchestration, or ask questions about the plan.
```

### 6. Wait for Confirmation

Do NOT execute until user confirms. They may want to:
- Adjust scope
- Add/remove areas
- Skip validation
- Ask clarifying questions

## Example

**User:** "plan adding user authentication"

**Response:**
```markdown
# Orchestration Plan: Add User Authentication

## Tree Structure

```
Add User Authentication
├─► Understand
│   ├─► pai-codebase (current auth patterns)
│   └─► pai-research (JWT best practices)
│
├─► Execute
│   ├─► API (2 dirs, 6 files)
│   │   ├─► auth/ (new)
│   │   │   ├─► handlers/login.ts
│   │   │   ├─► handlers/logout.ts
│   │   │   ├─► handlers/refresh.ts
│   │   │   └─► middleware/validate.ts
│   │   └─► routes/
│   │       └─► auth.ts
│   │
│   ├─► UI (1 dir, 3 files)
│   │   └─► components/auth/
│   │       ├─► LoginForm.tsx
│   │       ├─► LogoutButton.tsx
│   │       └─► AuthProvider.tsx
│   │
│   ├─► Database (2 dirs, 2 files)
│   │   ├─► migrations/
│   │   │   └─► 001_add_users.ts
│   │   └─► models/
│   │       └─► User.ts
│   │
│   └─► Tests (2 files)
│       ├─► auth.api.test.ts
│       └─► auth.ui.test.tsx
│
└─► Validate
    ├─► pai-council (architecture review)
    └─► pai-redteam (security review)
```

## Estimated Scope

- **Areas**: 4
- **Directories**: 6
- **Files**: 13 leaf agents
- **Skills**: pai-codebase, pai-research, pai-council, pai-redteam

## Notes

- Security-sensitive task → including pai-redteam
- New auth/ directory will be created
- JWT tokens with refresh flow

Ready to execute? Reply "go" or ask questions.
```

## Checklist

- [ ] Identified impact areas
- [ ] Listed directories per area
- [ ] Listed files per directory
- [ ] Identified skills needed
- [ ] Presented tree visualization
- [ ] Gave estimated scope
- [ ] Waited for user confirmation
