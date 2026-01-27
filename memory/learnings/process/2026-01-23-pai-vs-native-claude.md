# PAI vs Native Claude: When Each Makes Sense

**Date:** 2026-01-23
**Session:** PAI Life OS project initialization

---

## When Native Claude Config Is Enough

Use CLAUDE.md + .claude/rules when you need:
- Consistent coding conventions
- Project-specific rules
- Custom agent definitions (AGENTS.md)
- Static instructions that don't change

**Example:**
```
CLAUDE.md:
  "Always use TypeScript"
  "Run tests before committing"
  "Use our error handling pattern"
```

---

## When PAI Adds Value

Use PAI architecture when you need:
- Dynamic state that persists across /clear
- Progress tracking ("I'm 60% through refactor")
- Learnings that accumulate automatically
- Self-improvement over time

**The delta:**
- CLAUDE.md = static instructions
- PAI = dynamic state + auto-learning + compilation to rules

---

## Decision Framework

| Need | Use |
|------|-----|
| "Always do X in this project" | CLAUDE.md |
| "Remember what I was working on" | PAI (STATE.md) |
| "Don't make that mistake again" | PAI (learnings → rules) |
| "Consistent coding style" | .claude/rules |
| "Resume after /clear" | PAI (file-based state) |

---

## Honest Assessment

**Worth the PAI complexity if:**
- Work on same codebase across many sessions
- Want automatic learning capture
- Find yourself re-explaining after /clear
- Long sessions where context rot hurts

**Overkill if:**
- Short, isolated tasks
- Don't mind re-prompting
- Rarely resume previous work
- Context limits aren't an issue

---

*Captured from architecture discussion*
