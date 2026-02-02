# Implementation Prompt Template

Use for: create, edit, refactor, implement, add, fix, update

## Template

```markdown
## Task
{what to implement/change}

## Context to Read
- {file path}: {why to read it}
- {file path}: {why to read it}

## Requirements
1. {requirement}
2. {requirement}
3. {requirement}

## Constraints
- Follow existing patterns in the codebase
- {project-specific constraint}

## Manifest Protocol
Create folder: /scratchpad/task-{slug}/
Write outputs as you work.
Final manifest.yaml:
---
status: complete | partial | failed
summary: "One sentence of what you accomplished"
outputs:
  - {list of files created/modified}
continuation: "What remains" # only if partial
---

## Success Criteria
{how to know this is done correctly}
```

## Placeholder Reference

| Placeholder | Source |
|-------------|--------|
| {what to implement} | User's implementation request |
| {file path} | Files subagent needs to understand context |
| {why to read it} | What that file provides |
| {requirement} | Specific requirements from user |
| {project-specific constraint} | From project CLAUDE.md or conventions |
| {slug} | Descriptive task identifier |
| {success criteria} | Observable outcome that proves completion |

## Key Principle: Context to Read, Not Context Dump

**Wrong:** Passing file contents in the prompt
```markdown
## Context
Here's the current auth.ts file:
[500 lines of code...]
```

**Right:** Telling subagent what to read
```markdown
## Context to Read
- src/lib/auth.ts: Current authentication implementation
- src/types/user.ts: User type definitions
```

The subagent has fresh context - let it load only what it needs.

## When to Use

Spawn implementation subagent when user asks:
- "Create a new X"
- "Add feature Y"
- "Fix bug in Z"
- "Refactor W"
- "Update X to do Y"

## Model Selection

| Complexity | Model | Rationale |
|------------|-------|-----------|
| Simple edits | sonnet | Fast, reliable |
| New features | sonnet | Good balance |
| Complex refactors | opus | Better planning |
| Architecture changes | opus | System thinking |

## Integration

- References: [subagent-manifest.md](../subagent-manifest.md) for status reporting
- Verification: Always spawn verifier after implementation completes
- Coordination: [subagent-coordination.md](../subagent-coordination.md) for orchestration
