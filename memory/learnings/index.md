# Learnings

## Technical Insights

<!-- Patterns, solutions, and technical knowledge gained -->

### Context-Saving Pattern (2026-01-22)
**Source:** [Medium article on 95% context savings](https://medium.com/@alebasterr/how-we-achieved-95-context-savings-in-claude-code-without-losing-a-single-byte-of-information-e2b956e7587d)

**Core pattern: Process → Save → Summarize**
- Agents process verbose data in their own dedicated context
- Save full details to timestamped files
- Return only concise summaries to main chat
- Result: 95-99% context reduction with zero information loss

**Key insight:** Specialized agents with dedicated contexts outperform one generalist LLM trying to manage everything. Six focused agents from the article:
1. **BishBash** - Command runner (builds, tests) → saves logs, returns pass/fail
2. **Bookworm** - Documentation lookup → synthesizes, returns answer with refs
3. **File Warden** - Large file analyzer (>100KB) → extracts patterns, returns summary
4. **Historian** - Context archiver → extracts decisions, returns continuity summary
5. **Thinker** - Analytical reasoning → documents process, returns conclusion
6. **Researcher** - Deep investigation → saves report, returns key risks

**Output structure for artifacts:**
```
~/.pai/output/
├── research/   # Full research results
├── builds/     # Build/test logs
├── analysis/   # Large file analysis
├── sessions/   # Archived sessions
└── reports/    # Generated reports
```

## Process Improvements

<!-- Better ways of working discovered over time -->

### PAI Architecture Flow (2026-01-22)
When modifying PAI skills/content:
1. Edit files in `kasanariba-ai/core/` (the source template)
2. Run `pai sync --push` to deploy to `~/.pai` and push
3. Changes automatically reflect in `~/.claude/` via symlinks

**Don't** edit `~/.claude/skills/` directly - those are symlinks that get overwritten.

## Mistakes to Avoid

<!-- Things that didn't work and why -->

### Editing Deployed Files Instead of Source (2026-01-22)
**Mistake:** Edited `~/.claude/skills/pai-research/SKILL.md` directly instead of `kasanariba-ai/core/skills/pai-research/SKILL.md`

**Why it's wrong:** `~/.claude/skills/` is symlinked to `~/.pai/skills/`. While changes work temporarily, running `pai build` or `pai sync` could overwrite them if the source isn't updated.

**Correct flow:** Always edit `core/` → run `pai sync --push` → changes deploy everywhere.
