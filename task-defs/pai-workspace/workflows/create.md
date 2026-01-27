# Create Workspace Workflow

Guided workflow for creating a new PAI workspace with proper context setup.

## When to Use

- Starting a new project or initiative
- Need organized context for ongoing work
- Want to track progress on a specific effort

## Process

### 1. Gather Information

Ask for (if not provided):
- **Name**: kebab-case identifier (e.g., `my-project`, `api-v2`)
- **Description**: Brief description of what this workspace is for
- **Initial goals**: What are you trying to achieve?

### 2. Create Workspace

Execute via CLI:
```bash
pai workspace create <name> -d "<description>"
```

### 3. Enhance Workspace (Optional)

After creation, offer to:
1. Add detailed goals to the workspace.md
2. Set initial phase (Planning, Research, Building, etc.)
3. Create additional directories (research/, notes/)
4. Add architecture notes or key decisions

### 4. Confirm Setup

Show the user:
- Location of new workspace
- How to access workspace.md
- How to update progress going forward

## Example Interaction

```
User: I want to start a new project for building a CLI tool

Claude: I'll help you create a workspace for your CLI tool project.

What would you like to call it? (use kebab-case, e.g., my-cli-tool)

User: task-runner

Claude: Great! Can you give me a brief description of what this CLI tool will do?

User: A task runner that executes predefined workflows

Claude: Creating your workspace now...

[Executes: pai workspace create task-runner -d "A task runner that executes predefined workflows"]

Done! Your workspace is ready at ~/.pai/workspaces/task-runner/

Would you like me to:
1. Add detailed goals to the workspace?
2. Set up a research/ directory for notes?
3. Start with Planning phase and outline next steps?
```

## Tips

- Keep names short but descriptive
- One workspace per major project/initiative
- Use phases to track where you are: Planning → Research → Building → Testing → Launched
- Archive workspaces when complete rather than deleting (preserves history)