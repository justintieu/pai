# Workspaces

Active workspaces and their context. Each workspace has its own directory with research, notes, and status.

## Active
- **[pai](pai/workspace.md)** - Personal AI Infrastructure - context, memory, and tools system for Claude
- **[workspace-name](workspace-name/workspace.md)** - Brief description
  Status: Current phase or focus
-->

## On Hold

<!-- Workspaces paused but not abandoned -->

## Completed

<!-- Finished workspaces for reference -->

## When to Load

- Starting work on a workspace → load its `workspace.md`
- Need research context → load workspace's `research/` files
- Cross-workspace decisions → load multiple `workspace.md` files
- Resuming after break → check workspace's status section

## Creating a New Workspace

```bash
mkdir -p ~/.pai/workspaces/my-workspace
cp ~/.pai/workspaces/_template/workspace.md ~/.pai/workspaces/my-workspace/
```

Then edit `workspace.md` and add to the Active section above.
