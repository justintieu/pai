# Pre-Compact Hook Pattern

**Source**: Continuous-Claude-v3 research
**Date**: 2026-01-28

## Insight

Claude Code compacts context when the window fills, losing nuanced understanding. A PreCompact hook can generate a structured handoff BEFORE this happens, preserving:
- Current task state (pending/in_progress/completed)
- Modified files list
- Error context
- Next steps

## Implementation

Continuous-Claude uses a hook that:
1. Parses the JSONL transcript
2. Extracts TodoWrite calls for task state
3. Extracts Edit/Write calls for modified files
4. Captures errors and last assistant message
5. Writes structured YAML handoff

## Handoff Format

```yaml
---
session: session-name
goal: current-task-goal
focus: current-focus-area
timestamp: 2026-01-28T...
---

## Current Task State
- [pending] Tasks waiting
- [in_progress] Active work
- [completed] Finished

## Modified Files
- list of changed files

## Errors Encountered
- context around failures

## Next Steps
- suggested resumption points
```

## Applicability

- Create new `PreCompact.hook.ts` or trigger from dirty flag threshold
- Store in `~/.pai/memory/handoffs/`
- Load on SessionStart via `LoadContext.hook.ts`

## Tags

handoff, context-preservation, session-continuity
