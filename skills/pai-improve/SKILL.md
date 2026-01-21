---
name: pai-improve
description: Improve PAI infrastructure by updating the kasanariba-ai repo. USE WHEN improve PAI, update PAI, add skill, add agent, modify context, enhance infrastructure.
tools: Read, Edit, Write, Bash, Glob, Grep
---

# PAI Improve - Self-Improvement

Guide for improving PAI infrastructure. All changes go to the kasanariba-ai repo first, then sync to ~/.pai.

## Workflow

1. **Edit in repo** - Make changes in `~/Documents/github/kasanariba-ai/core/`
2. **Test locally** - Verify changes work
3. **Commit** - Commit to kasanariba-ai repo
4. **Sync** - Run `pai build` to sync to ~/.pai

## Repo Structure

```
kasanariba-ai/
├── core/                    # PAI source files
│   ├── context/             # Identity, preferences, strategies
│   ├── memory/              # Learnings, work status
│   ├── workspaces/          # Project-specific context
│   ├── skills/              # Reusable workflows
│   ├── agents/              # Specialized personas
│   ├── commands/            # Slash command definitions
│   ├── tools/               # MCP configs, custom tools
│   └── hooks/               # Lifecycle automation
├── scripts/
│   └── pai                  # CLI tool (symlinked to ~/.local/bin/pai)
└── CLAUDE.md                # Instructions for Claude
```

## What Lives Where

| Type | Location | When to Add |
|------|----------|-------------|
| **Skills** | `core/skills/skill-name/SKILL.md` | Reusable workflows |
| **Agents** | `core/agents/agent-name.md` | Specialized personas |
| **Commands** | `core/commands/command-name.md` | Slash commands |
| **Context** | `core/context/*.md` | Identity, preferences |
| **Memory** | `core/memory/*.md` | Learnings, status |
| **Workspaces** | `core/workspaces/project/` | Per-project context |

## Instructions

### Adding a Skill

1. Create directory: `core/skills/skill-name/`
2. Create `SKILL.md` with frontmatter (name, description with USE WHEN)
3. Add Instructions and Examples sections
4. Update `core/skills/index.md`
5. Validate with pai-validate

### Adding an Agent

1. Create `core/agents/agent-name.md`
2. Include: role, capabilities, when to use, instructions
3. Update `core/agents/index.md`

### Modifying Context

1. Edit files in `core/context/`
2. Keep entries concise
3. Update index if adding new files

### Adding a Command

1. Create `core/commands/command-name.md`
2. Define usage, arguments, behavior
3. Update `core/commands/index.md`

## Syncing Changes

After making changes:

```bash
# Check what changed
git status

# Commit changes
git add -A && git commit -m "feat: description"

# Sync to ~/.pai
pai build
```

## Examples

**Example 1: Add a new skill**
```
User: "create a skill for daily planning"
Claude: Creates core/skills/pai-daily/SKILL.md
        Adds frontmatter with USE WHEN triggers
        Adds Instructions and Examples
        Updates core/skills/index.md
        Commits: "feat(skills): add pai-daily skill"
```

**Example 2: Update context**
```
User: "add a new preference about code style"
Claude: Edits core/context/preferences.md
        Adds preference entry
        Commits: "feat(context): add code style preference"
```

**Example 3: Improve existing skill**
```
User: "improve the research skill"
Claude: Reads core/skills/pai-research/SKILL.md
        Identifies improvements
        Makes edits
        Commits: "improve(skills): enhance pai-research"
```
