# Session Archive: Tree Orchestration & Context Hygiene

**Date:** 2026-01-22
**Time:** ~16:30 - 17:15
**Duration:** ~45 minutes
**Messages:** ~40

## Summary

Designed and implemented a tree orchestration pattern to prevent context bloat and auto-compact triggers. Created the `pai-orchestrate` skill that recursively decomposes complex tasks into trees of agents (BFS spawning, bottom-up synthesis), keeping main agent context minimal. Also added explicit delegation triggers to pai-assistant and fixed protocols directory syncing.

## Goals

- Prevent auto-compact from triggering by better context management
- Make delegation/sub-agent usage automatic rather than requiring reminders
- Create a scalable pattern for complex multi-file/multi-area tasks

## Decisions Made

### Decision 1: Explicit Delegation Triggers
- **Choice:** Add hard rules for when Atlas must delegate vs do directly
- **Rationale:** "Always prefer sub-agents" was too vague; needed concrete triggers
- **Triggers added:**
  - About to read 2+ files → delegate
  - About to search with uncertain results → delegate
  - User asks "where/how/what" about codebase → delegate
  - Task has 3+ independent steps → delegate
  - Research or exploration → delegate

### Decision 2: Tree Orchestration Pattern
- **Choice:** Recursive agent decomposition with BFS spawning and bottom-up synthesis
- **Rationale:** Main agent should orchestrate, not execute. Depth = folder depth for code, or conceptual depth for research.
- **Pattern:**
  ```
  User Request → Root Agent → Area Agents (parallel) → Directory Agents → File Agents (leaves)
  Synthesis bubbles up from leaves → Main agent only sees final result
  ```

### Decision 3: Create pai-orchestrate Skill
- **Choice:** Encapsulate tree orchestration in a skill rather than just protocol docs
- **Rationale:** Skills have enforceable triggers (USE WHEN) and get loaded automatically. Atlas invokes skill rather than manually implementing protocol.
- **Triggers:** "implement feature", "add feature", "build feature", "refactor", "multi-file change"

### Decision 4: Skill Composes Other Skills
- **Choice:** pai-orchestrate can invoke other pai-* skills as part of its tree
- **Rationale:** Complex tasks need research, understanding, validation - not just code changes
- **Skills integrated:** pai-codebase, pai-research, pai-council, pai-redteam

### Decision 5: Works for Non-Code Tasks Too
- **Choice:** Same tree pattern applies to research/general questions
- **Rationale:** Decomposition is universal - code uses files, research uses topics/angles
- **Example:** Research question → multiple pai-research agents → pai-council → synthesis

## Code Changes

### Files Created
- `core/protocols/tree-orchestration.md` - Full protocol spec
- `core/skills/pai-orchestrate/SKILL.md` - Skill definition
- `core/skills/pai-orchestrate/workflows/execute.md` - Main execution workflow
- `core/skills/pai-orchestrate/workflows/plan.md` - Plan-only workflow (show tree without executing)

### Files Modified
- `core/agents/pai-assistant.md` - Added delegation triggers, simplified to invoke pai-orchestrate
- `core/protocols/index.md` - Added tree-orchestration to protocol registry
- `adapters/claude-code/build.sh` - Added "protocols" to CONTENT_DIRS
- `lib/update.sh` - Added "protocols" to update dirs array

### Key Code Patterns

**Delegation Triggers (pai-assistant.md):**
```markdown
**ALWAYS delegate** when ANY of these apply:
- About to read 2+ files
- About to search with uncertain results
- User asks "where/how/what" about codebase
- Task has 3+ independent steps
- Research or exploration of any kind
```

**Tree Structure:**
```
Feature Request
    └─► Root Agent
            ├─► Understand (pai-codebase, pai-research)
            ├─► Execute (area → directory → file agents)
            ├─► Validate (pai-council, pai-redteam)
            └─► Final Synthesis → User
```

**Manifest Schema Extension:**
```yaml
status: complete | partial | failed | waiting
summary: "One sentence"
depth: 2
parent: tree-{id}
children:
  - area-api/
  - area-ui/
children_status:
  area-api/: complete
outputs:
  - synthesized.md
```

## Problems & Solutions

### Problem 1: Protocols directory not syncing
- **Symptoms:** tree-orchestration.md not appearing in ~/.pai/protocols/
- **Root cause:** "protocols" wasn't in the dirs array in lib/update.sh or CONTENT_DIRS in build.sh
- **Solution:** Added "protocols" to both arrays

### Problem 2: Rules too vague for enforcement
- **Symptoms:** "Always prefer sub-agents" wasn't specific enough
- **Root cause:** No concrete triggers for when delegation is required
- **Solution:** Added explicit trigger list (2+ files, searches, exploration, etc.)

## Insights & Learnings

- Skills with USE WHEN triggers are more enforceable than protocol docs
- Tree depth should match problem structure (folder depth for code, conceptual depth for research)
- 1 agent = 1 file (leaf granularity) prevents agents from growing too large
- BFS spawning + bottom-up synthesis maximizes parallelism while maintaining structure
- Same orchestration pattern works for code AND research tasks

## Action Items

### Completed This Session
- [x] Add explicit delegation triggers to pai-assistant
- [x] Design tree orchestration protocol
- [x] Create pai-orchestrate skill with execute and plan workflows
- [x] Add protocols directory to update/build scripts
- [x] Commit changes (2 commits)

### Remaining / Next Steps
- [ ] Push commits to origin (`git push`)
- [ ] Test pai-orchestrate on a real feature implementation
- [ ] Consider: Add non-code decomposition examples to SKILL.md
- [ ] Consider: Hook to auto-invoke historian before auto-compact
- [ ] 28 pending PAI items to sync

## Context for Resumption

**Git state:** 2 commits ahead of origin/main
- `ab67ee7` - feat(agents): add explicit delegation triggers for context hygiene
- `ea617a3` - feat(skills): add pai-orchestrate for tree-based task execution

**Key files for pai-orchestrate:**
- `~/.claude/skills/pai-orchestrate/SKILL.md` - Main definition
- `~/.claude/protocols/tree-orchestration.md` - Full protocol spec

**The pattern:**
User says "implement X" → Atlas invokes pai-orchestrate → skill decomposes into tree → agents execute in parallel → syntheses bubble up → user sees final result. Main agent context stays clean.

## References

- [pai-orchestrate SKILL.md](~/.claude/skills/pai-orchestrate/SKILL.md)
- [tree-orchestration protocol](~/.claude/protocols/tree-orchestration.md)
- [pai-assistant.md](~/.claude/agents/pai-assistant.md)
