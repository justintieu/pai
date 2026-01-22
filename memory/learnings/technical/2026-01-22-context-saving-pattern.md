# Context-Saving Pattern

**Date:** 2026-01-22
**Source:** [Medium article](https://medium.com/@alebasterr/how-we-achieved-95-context-savings-in-claude-code-without-losing-a-single-byte-of-information-e2b956e7587d)

## Core Pattern: Process → Save → Summarize

1. Agents process verbose data in their own dedicated context
2. Save full details to timestamped files
3. Return only concise summaries to main chat

**Result:** 95-99% context reduction with zero information loss

## Key Insight

Specialized agents with dedicated contexts outperform one generalist LLM trying to manage everything.

## Six Agent Types from Article

| Agent | Purpose | Output |
|-------|---------|--------|
| BishBash | Command runner (builds, tests) | Saves logs, returns pass/fail |
| Bookworm | Documentation lookup | Synthesizes, returns answer + refs |
| File Warden | Large file analyzer (>100KB) | Extracts patterns, returns summary |
| Historian | Context archiver | Extracts decisions, returns continuity |
| Thinker | Analytical reasoning | Documents process, returns conclusion |
| Researcher | Deep investigation | Saves report, returns key risks |

## Output Structure

```
~/.pai/output/
├── research/   # Full research results
├── builds/     # Build/test logs
├── analysis/   # Large file analysis
├── sessions/   # Archived sessions
└── reports/    # Generated reports
```

## Applied To PAI

- Updated `pai-research` to save full results, return summaries
- Created `pai-historian` for session archiving
- Added output directory to build script
