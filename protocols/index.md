# PAI Protocols

Cross-cutting behavioral patterns that apply across agents and skills.

## Available Protocols

| Protocol | Purpose |
|----------|---------|
| [Subagent Manifest](subagent-manifest.md) | Lightweight status reporting for context-aware orchestration |

## When to Use Protocols

Protocols define **how** agents behave, not **what** they do:
- Agents define capabilities and personas
- Skills define workflows and tasks
- **Protocols** define behavioral patterns that cut across both

## Adding Protocols

Create a new `[protocol-name].md` file documenting:
- Problem being solved
- Solution pattern
- Schema/format (if applicable)
- Instructions for both subagents and orchestrators
- Example flows
