# Workspaces

Project-specific context. Each project gets its own folder with a `workspace.md` entry point.

## Active

<!-- - **[project-name](project-name/workspace.md)** - Brief description -->

## On Hold

<!-- Projects paused but not abandoned -->

## Completed

<!-- Finished projects for reference -->

## Structure

```
workspaces/
  project-name/
    workspace.md     # Entry point - goals, status, context
    ...              # Whatever the project needs
```

Projects organize their own subfolders as needed (research/, notes/, etc.).

## Creating a Workspace

```bash
mkdir ~/.pai/workspaces/my-project
cp ~/.pai/workspaces/_template/workspace.md ~/.pai/workspaces/my-project/
```

Then add to Active section above.
