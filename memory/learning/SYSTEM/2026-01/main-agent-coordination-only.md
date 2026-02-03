# Main Agent Coordination Only

**Source**: Session clarification
**Date**: 2026-01-28

## Insight

The main agent should NEVER do implementation work directly. Always spawn sub-agents via the Task tool. Main agent responsibilities:

- **Coordinate** - orchestrate work across sub-agents
- **Delegate** - spawn tasks for all implementation
- **Synthesize** - combine results from sub-agents
- **Decide** - make architectural/strategic choices

## Rationale

- Preserves main context for coordination
- Sub-agents have fresh context windows
- Enables parallel execution
- Matches PAI core principle: "context conservation"

## Anti-patterns

- Reading files to "understand" before delegating (delegate the exploration)
- Making "quick edits" directly (spawn agent even for small changes)
- Doing research in main context (use Explore agent)

## Tags

workflow, coordination, context-conservation
