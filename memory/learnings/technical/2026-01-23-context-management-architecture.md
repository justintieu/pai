# Context Management Architecture Learnings

**Date:** 2026-01-23
**Session:** PAI Life OS project initialization

---

## Key Insight: Learnings → Rules Pipeline

**The paradox:** Storing learnings causes the context bloat you're trying to avoid.

**The solution:** Don't load learnings. Compile them into rules.

```
Learnings = source code (unlimited, never loaded into context)
Rules = compiled binary (small ~2K tokens, always loaded)
Self-improvement = the compiler
```

**Flow:**
1. Capture learnings to files (unlimited storage)
2. Periodically detect patterns (3+ similar = pattern)
3. Generate rule proposal
4. Human approves
5. Add to .claude/rules or CLAUDE.md (for coding)
6. Archive source learnings

---

## Context Rot Prevention

**Proactive delegation, not reactive:**
- Bad: Wait until context is 70% full, then suggest delegation
- Good: Assess task complexity FIRST, delegate before starting

**Complexity heuristics:**
- File count is misleading (1 file × 2000 lines > 5 files × 50 lines)
- Use estimated tokens instead
- Threshold: ~5K tokens inline, above that delegate

**Subagent pattern:**
- Each agent gets fresh context
- Returns summary only (~100 tokens)
- Details written to files
- Parent context grows minimally

---

## What's Actually Unique vs Promptable

**Unique (can't just prompt):**
- File-based state persistence (survives /clear)
- Lifecycle hooks (session start/end automation)
- Learnings → rules compilation

**Just convenience (could prompt it):**
- Subagent spawning
- Parallel execution
- Summary returns
- Complexity assessment

---

## Native Claude Config Comparison

| Feature | CLAUDE.md/rules | This Architecture |
|---------|-----------------|-------------------|
| Static instructions | ✓ | Same |
| Project conventions | ✓ | Same |
| **Dynamic state** | ❌ | ✓ STATE.md |
| **Auto-learnings** | ❌ | ✓ Hooks |
| **Learnings → rules** | ❌ | ✓ Pipeline |

---

## Domain-Specific Outputs

Rules location depends on domain:

| Domain | Learnings Compile Into |
|--------|------------------------|
| Coding | `.claude/rules`, `CLAUDE.md` |
| Scheduling | `context/preferences/scheduling.md` |
| Communications | `context/voice/style-rules.md` |
| General | `context/strategies/` or `context/beliefs/` |

---

## Tiered Context Loading

```
HOT:  Current conversation (always present)
WARM: Index files loaded on-demand (~500 tokens each)
COLD: Detail files, searchable but never auto-loaded
```

Pattern: index.md contains working summary, detail files only loaded for deep dives.

---

*Captured from PAI Life OS initialization session*
