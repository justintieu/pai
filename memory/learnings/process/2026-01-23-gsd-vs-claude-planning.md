# GSD/Tree Orchestration vs Claude Plan Mode

**Date:** 2026-01-23
**Session:** PAI Life OS project initialization

---

## They're Not Mutually Exclusive

```
Claude Plan Mode:  PLAN → EXECUTE (single agent)
GSD Architecture:  PLAN → EXECUTE (parallel agents)
```

**Planning is the same.** The difference is execution:
- Plan mode: one agent does all work, context accumulates
- GSD: spawns parallel agents, each with fresh context

---

## When Plan Mode Works Fine

- Small tasks (1-2 files, <500 lines)
- Single-domain work (just API, just UI)
- Short sessions (<30 min)

---

## When Tree Orchestration Helps

- Large refactors (1000+ lines)
- Multi-domain changes (API + UI + tests)
- Long sessions (context would exceed 70%)
- Need consistent quality throughout

---

## The Honest Truth About Subagents

**You can prompt this.** The Task tool is native. You could say:
> "For complex tasks, spawn parallel agents, return summaries, write details to files"

And it would work.

**GSD's value is:**
- Pre-written prompts (don't re-type every time)
- File-based state (survives /clear)
- Consistency (same pattern every time)
- Accumulated wisdom in the prompts

---

## Key Difference: State Persistence

**Claude Plan Mode:**
```
/clear → State lost → Re-explain everything
```

**GSD:**
```
/clear → Read STATE.md → Continue where you left off
```

This is the actual differentiator, not the subagent pattern itself.

---

*Captured from architecture discussion*
