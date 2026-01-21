# Upgrade Tier Workflow

Convert a Tier 1 CLI (manual parsing) to Tier 2 (Commander.js) when complexity demands it.

## When to Upgrade

**Upgrade signals:**
- 15+ commands making switch statement unwieldy
- Need for subcommand hierarchy (e.g., `cli users list`, `cli users create`)
- Plugin architecture requirements
- Complex option combinations
- Multiple output format handlers

**Do NOT upgrade if:**
- CLI has fewer than 10 commands
- Commands are simple and flat
- No subcommand hierarchy needed
- Tier 1 is working well

**Note:** Most CLIs never need this upgrade. Tier 1 handles 10-15 commands effectively.

## Steps

### 1. Assess Current State

Review the existing Tier 1 CLI:

```bash
# Count commands in switch statement
grep -c "case \"" src/cli.ts

# Review current structure
cat src/cli.ts | head -100

# List existing command files
ls -la src/commands/
```

Document:
- Number of commands: ___
- Subcommands needed: ___
- Complex option patterns: ___
- Plugin requirements: ___

### 2. Install Commander.js

```bash
bun add commander
```

### 3. Restructure Entry Point

**Before (Tier 1):**
```typescript
#!/usr/bin/env bun

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "list":
      // ...
      break;
    case "get":
      // ...
      break;
    case "create":
      // ...
      break;
    // ... 15 more cases
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main();
```

**After (Tier 2):**
```typescript
#!/usr/bin/env bun
import { Command } from "commander";
import { loadConfig } from "./config";
import { listItems, getItem, createItem } from "./commands";

const program = new Command();

program
  .name("my-cli")
  .description("CLI description")
  .version("2.0.0");

// Global options
program
  .option("--format <type>", "Output format (json|text)", "json")
  .option("--verbose", "Verbose output", false);

// List command
program
  .command("list")
  .description("List all items")
  .option("--limit <n>", "Limit results", "100")
  .action(async (options) => {
    const config = loadConfig();
    const result = await listItems(config, { limit: parseInt(options.limit) });
    outputResult(result, program.opts().format);
  });

// Get command
program
  .command("get <id>")
  .description("Get item by ID")
  .action(async (id, options) => {
    const config = loadConfig();
    const result = await getItem(config, id);
    outputResult(result, program.opts().format);
  });

// Create command
program
  .command("create <name>")
  .description("Create new item")
  .option("--dry-run", "Preview without executing")
  .action(async (name, options) => {
    const config = loadConfig();
    const result = await createItem(config, name, options);
    outputResult(result, program.opts().format);
  });

// Subcommand example: users
const users = program
  .command("users")
  .description("User management commands");

users
  .command("list")
  .description("List users")
  .action(async () => {
    const config = loadConfig();
    const result = await listUsers(config);
    outputResult(result, program.opts().format);
  });

users
  .command("get <id>")
  .description("Get user by ID")
  .action(async (id) => {
    const config = loadConfig();
    const result = await getUser(config, id);
    outputResult(result, program.opts().format);
  });

// Output helper
function outputResult(result: ApiResponse<unknown>, format: string) {
  if (format === "text") {
    console.log(formatAsText(result));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  process.exit(result.success ? 0 : 1);
}

program.parse();
```

### 4. Convert Commands

For each existing command:

**Tier 1 pattern:**
```typescript
case "create":
  const name = args[1];
  if (!name) {
    console.error(JSON.stringify({ error: "create requires a name" }));
    process.exit(1);
  }
  result = await createItem(config, name, { dryRun: args.includes("--dry-run") });
  break;
```

**Tier 2 pattern:**
```typescript
program
  .command("create <name>")
  .description("Create new item")
  .option("--dry-run", "Preview without executing")
  .action(async (name, options) => {
    const config = loadConfig();
    const result = await createItem(config, name, { dryRun: options.dryRun });
    outputResult(result, program.opts().format);
  });
```

### 5. Handle Custom Help

Commander provides auto-generated help, but you can customize:

```typescript
program
  .configureHelp({
    sortSubcommands: true,
    sortOptions: true
  })
  .addHelpText("after", `
EXAMPLES:
  $ my-cli list --limit 10
  $ my-cli get abc123
  $ my-cli users list
  $ my-cli users get user-456

CONFIGURATION:
  API_KEY    Required: Your API key
  BASE_URL   Optional: API base URL (default: https://api.example.com)
`);
```

### 6. Test Thoroughly

Test each command after conversion:

```bash
# Help output
bun run src/cli.ts --help
bun run src/cli.ts users --help

# Basic commands
bun run src/cli.ts list
bun run src/cli.ts get test-id
bun run src/cli.ts create "Test"

# Subcommands
bun run src/cli.ts users list
bun run src/cli.ts users get user-123

# Options
bun run src/cli.ts list --format text --limit 5
bun run src/cli.ts create "Test" --dry-run

# Error handling
bun run src/cli.ts nonexistent
bun run src/cli.ts get  # missing required arg
```

### 7. Update Documentation

Update README to reflect new structure:

```markdown
# my-cli v2.0.0

Now powered by Commander.js with subcommand support.

## Breaking Changes

- Commands now support subcommand syntax
- Some flag names may have changed

## New Structure

\`\`\`bash
# Top-level commands
my-cli list
my-cli get <id>
my-cli create <name>

# User subcommands
my-cli users list
my-cli users get <id>
my-cli users create <email>
\`\`\`

## Migration Guide

If you have scripts using the old CLI:

| Old Command | New Command |
|-------------|-------------|
| `my-cli userlist` | `my-cli users list` |
| `my-cli userget X` | `my-cli users get X` |
```

### 8. Bump Version

Update package.json to 2.0.0 to signal breaking changes:

```json
{
  "version": "2.0.0"
}
```

## Validation Checklist

- [ ] Commander.js installed
- [ ] All commands converted to Commander syntax
- [ ] Subcommands organized logically
- [ ] Help text is comprehensive
- [ ] All existing functionality preserved
- [ ] TypeScript compiles
- [ ] Tests pass
- [ ] Version bumped to 2.0.0
- [ ] README updated with migration guide
- [ ] CHANGELOG documents breaking changes

## File Structure After Upgrade

```
my-cli/
├── src/
│   ├── cli.ts           # Commander entry point
│   ├── config.ts        # Configuration (unchanged)
│   ├── types.ts         # Types (unchanged)
│   ├── output.ts        # Output formatting helpers
│   └── commands/
│       ├── index.ts     # Command exports
│       ├── list.ts      # (unchanged)
│       ├── get.ts       # (unchanged)
│       └── users/       # Subcommand group
│           ├── index.ts
│           ├── list.ts
│           └── get.ts
├── package.json         # Now includes commander dependency
├── tsconfig.json
└── README.md            # Updated with new structure
```
