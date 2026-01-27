# Skills

This directory contains **true Skills** - modules invoked via the Skill tool that require special registration with Claude Code.

## What's Here

Only **pai-orchestrate** lives in this directory.

### pai-orchestrate

The meta-orchestrator for complex multi-step tasks. It:

1. Decomposes tasks into tree structures (areas -> directories -> files)
2. Reads task definitions from `task-defs/`
3. Spawns Tasks with appropriate prompts
4. Synthesizes results bottom-up

**Invocation:**
```
Skill(skill: "pai-orchestrate", args: "[task description]")
```

## Why Only One Skill?

Most PAI capabilities have moved to **task-defs/** and are now invoked as Tasks rather than Skills:

| Before | After |
|--------|-------|
| `Skill(skill: "pai-research")` | Read `task-defs/pai-research/SKILL.md` -> Spawn Task |
| `Skill(skill: "pai-council")` | Read `task-defs/pai-council/SKILL.md` -> Spawn Task |

**Benefits:**
- No registration required with Claude Code
- More flexible invocation patterns
- Task tool provides better isolation and context hygiene
- Easier to maintain and extend

## For Other Task Definitions

See **[../task-defs/README.md](../task-defs/README.md)** for:
- All available PAI capabilities (research, council, redteam, etc.)
- How to invoke them via the Task pattern
- The manifest protocol for status reporting
