# /context Command

Display current context usage with breakdown.

## Usage

`/context` - Show context status

## Behavior

When invoked, estimate and display:

**Context: ~{X}% used**
- Conversation: ~{Y}%
- Files loaded: ~{Z}%
- Tools/cache: ~{W}%

**Estimation method:**
1. Count conversation turns and estimate ~500-1000 tokens per turn
2. Count files read in session (visible in conversation history)
3. Estimate tool overhead at ~5-10% of total

**At different thresholds:**
- <50%: "Context is healthy"
- 50-70%: "Context is moderate"
- 70-90%: "Context is getting full - consider delegation for new tasks"
- >90%: "Context is critical - recommend /clear or delegate remaining work"

## Response Format

Display:
- Percentage bar (visual)
- Breakdown by category
- Threshold-based suggestion (if enabled in preferences)

Example:
```
Context: ~45% used
[████████░░░░░░░░░░░░] ~45%

Breakdown:
- Conversation: ~30% (15 turns)
- Files loaded: ~12% (6 files)
- Tools: ~3%

Status: Healthy
```

## Preferences

Warning behavior is controlled by `context/preferences/context-warnings.md`.
Default: Warnings off (quiet mode).
