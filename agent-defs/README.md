# Agent Definitions

Specialized agent personas loaded on-demand (not auto-registered to save context).

## How It Works

Agent definitions are **lazy-loaded**: Claude reads the definition file when needed and spawns a Task with those instructions. This saves ~400 tokens vs pre-registering all agents.

**To use an agent:**
1. Read the agent definition: `~/.pai/agent-defs/[agent].md`
2. Spawn a Task with those instructions and the appropriate model

## Available Agents

### pai-assistant (Atlas)
Personal life OS assistant. Helps with planning, goal tracking, decision support, and navigating PAI context.
- **Model:** opus
- **File:** `pai-assistant.md`

### PAI Sub-Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| `pai-reader` | haiku | Fast PAI lookups and searches |
| `pai-logger` | sonnet | Work status, learnings, decisions |
| `pai-editor` | opus | Goals, beliefs, strategies, identity |

### Utility Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| `pai-scout` | opus | Research external PAI repositories for skills to port |
| `pai-porter` | opus | Port skills from external PAIs to our structure |

## Adding Agents

Create a new `[agent-name].md` file. Include:
- **Role** - What this agent specializes in
- **Capabilities** - What it can do
- **Model** - Recommended model (haiku/sonnet/opus)
- **Instructions** - How to behave when spawned
