# Transcript Auto-Extraction Pattern

**Source**: Continuous-Claude-v3 research
**Date**: 2026-01-28

## Insight

Rather than relying on manual learning capture, parse Claude's transcript automatically to extract:
- Task state from TodoWrite tool calls
- Modified files from Edit/Write calls
- Errors and failure context
- Reasoning patterns and decisions

## Current Gap

PAI's `TranscriptParser.ts` focuses on response parsing (voice, structured sections). It doesn't mine the full transcript for state extraction.

## Implementation

```typescript
// Parse JSONL transcript
for (const line of transcript) {
  if (line.tool === 'TodoWrite') {
    extractTaskState(line);
  } else if (['Edit', 'Write'].includes(line.tool)) {
    trackModifiedFile(line.input.file_path);
  } else if (line.output?.includes('error')) {
    captureErrorContext(line);
  }
}
```

## Benefits

- Automatic state extraction without manual `/pai learn` calls
- Complete record of session activity
- Enables intelligent handoff generation

## Tags

transcript-parsing, automation, learning-capture
