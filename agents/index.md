# Agents

Custom agent personas for specialized tasks.

## Structure

Each agent file should include:
- **Role** - What this agent specializes in
- **Personality** - How it communicates and approaches problems
- **Capabilities** - What it can do
- **Limitations** - What it should avoid

## Adding Agents

Create a new `[agent-name].md` file in this directory.

## Available Agents

### pai-assistant (Atlas)
Personal life OS assistant. Helps with planning, goal tracking, decision support, and navigating PAI context. Runs on **opus** for deep thinking, delegates to sub-agents for efficiency.

### PAI Sub-Agents

Used by Atlas (or directly) for PAI operations:

| Agent | Model | Purpose |
|-------|-------|---------|
| `pai-reader` | haiku | Fast PAI lookups and searches |
| `pai-logger` | sonnet | Work status, learnings, decisions |
| `pai-editor` | opus | Goals, beliefs, strategies, identity |

```
┌─────────────────────────────────────┐
│  pai-assistant (Atlas) - opus       │
│    │                                │
│    ├── pai-reader (haiku)           │
│    ├── pai-logger (sonnet)          │
│    └── pai-editor (opus)            │
└─────────────────────────────────────┘
```

### pai-scout
Research agent for evaluating external PAI skills/packs. Spawns parallel sub-agents to analyze repositories (like Daniel Miessler's PAI) and recommend skills worth porting. Runs on **opus**, delegates to **haiku** for quick scans and **sonnet** for deep dives.

### pai-porter
Ports skills from Daniel Miessler's PAI to our PAI structure. Handles convention conversion (TitleCase → kebab-case), dependency adaptation, and structure mapping. Runs on **opus**.

```
┌─────────────────────────────────────┐
│  pai-scout (opus)                   │
│    │                                │
│    ├── Explore agents (haiku)       │
│    │    └── Quick skill scans       │
│    └── Explore agents (sonnet)      │
│         └── Deep implementation     │
└─────────────────────────────────────┘
```

## Example Agent Ideas

- `code-reviewer.md` - Focused code review agent
- `architect.md` - System design and architecture
- `debugger.md` - Systematic debugging approach
