# Add Command Workflow

Extend an existing CLI with new commands while maintaining code quality and consistency.

## Prerequisites

- Existing CLI project with Tier 1 or Tier 2 structure
- Clear specification for the new command

## Steps

### 1. Locate and Analyze CLI

Find the CLI and understand its current structure:

```bash
# Examine CLI structure
ls -la src/
ls -la src/commands/  # if commands are separated

# Review existing interfaces
cat src/types.ts

# Check current commands
cat src/cli.ts
```

### 2. Create Interface (if needed)

If the new command returns new data types, add interfaces:

```typescript
// Add to src/types.ts

export interface NewCommandResult {
  id: string;
  status: string;
  metadata: Record<string, unknown>;
}
```

### 3. Write Command Function

Create the command function following existing patterns:

```typescript
// src/commands/newcommand.ts
import type { Config, ApiResponse, NewCommandResult } from "../types";

interface NewCommandOptions {
  dryRun?: boolean;
  force?: boolean;
}

export async function newCommand(
  config: Config,
  input: string,
  options: NewCommandOptions = {}
): Promise<ApiResponse<NewCommandResult>> {
  const { dryRun = false, force = false } = options;

  // Validate input
  if (!input || input.trim().length === 0) {
    return {
      success: false,
      error: "Input is required"
    };
  }

  // Dry run handling
  if (dryRun) {
    return {
      success: true,
      data: {
        id: "dry-run",
        status: "would-execute",
        metadata: { input, force }
      }
    };
  }

  try {
    const response = await fetch(`${config.baseUrl}/newcommand`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input, force })
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error"
    };
  }
}
```

### 4. Integrate Into Switch Statement

Add the command to the main entry point:

```typescript
// In src/cli.ts

import { newCommand } from "./commands/newcommand";

// Add to switch statement:
case "newcmd":
  const newInput = args[1];
  if (!newInput) {
    console.error(JSON.stringify({ error: "newcmd requires an input argument" }));
    process.exit(1);
  }
  result = await newCommand(config, newInput, {
    dryRun: options.dryRun,
    force: args.includes("--force")
  });
  break;
```

### 5. Update Help Documentation

Add the new command to help output:

```typescript
// In showHelp() function

COMMANDS:
  list [--limit N]      List all items
  get <id>              Get item by ID
  create <name>         Create new item
  delete <id>           Delete item
  newcmd <input>        Description of new command    // ADD THIS

// Add to OPTIONS if new flags:
  --force               Force action without confirmation
```

### 6. Update README

Document the new command:

```markdown
## Commands

| Command | Description |
|---------|-------------|
| `list` | List all items |
| `get <id>` | Get item by ID |
| `create <name>` | Create new item |
| `delete <id>` | Delete item |
| `newcmd <input>` | Description of new command |  <!-- ADD THIS -->

## Examples

### New Command

\`\`\`bash
# Basic usage
my-cli newcmd "some input"

# With dry run
my-cli newcmd "some input" --dry-run

# Force execution
my-cli newcmd "some input" --force
\`\`\`
```

### 7. Validate

Run through validation checklist:

- [ ] TypeScript compiles: `bun run typecheck`
- [ ] New command appears in help: `bun run src/cli.ts --help`
- [ ] Command executes correctly with valid input
- [ ] Command handles invalid input gracefully
- [ ] Error messages are helpful
- [ ] Exit codes are correct (0 for success, 1 for error)
- [ ] JSON output is valid
- [ ] Documentation updated

## Checklist Summary

Before marking complete:

1. Function implementation is complete
2. Switch statement routes to new function
3. Help text includes new command
4. README documents usage and examples
5. TypeScript types are defined
6. Error handling is robust
7. Tests added (if test suite exists)
8. Dry run support (if applicable)
