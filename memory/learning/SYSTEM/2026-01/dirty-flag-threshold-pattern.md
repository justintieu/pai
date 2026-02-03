# Dirty Flag Threshold Pattern

**Source**: Continuous-Claude-v3 research
**Date**: 2026-01-28

## Insight

Use a simple counter to track file modifications. At a threshold (e.g., 20 edits), auto-trigger handoff/checkpoint generation. This prevents data loss without constant manual saves.

## Implementation

```typescript
// In PostToolUse hook
let dirtyCount = 0;

if (tool === 'Edit' || tool === 'Write') {
  dirtyCount++;
  if (dirtyCount >= 20) {
    await generateHandoff();
    dirtyCount = 0;
  }
}
```

## Applicability

- Add to `SecurityValidator.hook.ts` which already tracks file operations
- Store dirty count in `~/.pai/memory/state/dirty-count.yaml`
- Reset on handoff generation or session end

## Tags

context-management, auto-save, handoff
