---
name: pai-createcli
description: Generate production-ready TypeScript CLI tools with Bun. USE WHEN create cli, build command-line tool, cli for api, wrap api, typescript cli, bun cli.
tools: Read, Edit, Write, Bash, Glob
---

# PAI CreateCLI - TypeScript CLI Generator

Transform requests like "create a CLI for X" into production-ready command-line tools following proven patterns.

## Workflows

| Workflow | Use When | File |
|----------|----------|------|
| **Create** | "create a cli", "build cli for X" | `workflows/create.md` |
| **Add Command** | "add command to cli", "extend cli" | `workflows/add-command.md` |
| **Upgrade Tier** | "upgrade cli to commander", "cli needs more features" | `workflows/upgrade-tier.md` |

## Three-Tier Architecture

**Tier 1 (Default - Manual Parsing):**
- 2-10 commands
- Zero framework dependencies
- Bun + TypeScript
- ~300-400 lines total
- Use for: API wrappers, file processors, automation scripts

**Tier 2 (Commander.js):**
- 10+ commands with subcommands
- Complex option parsing
- Plugin architecture
- Use for: Multi-service tools, complex workflows

**Tier 3 (oclif - Reference Only):**
- Enterprise-scale systems
- Rarely needed

**Decision Rule:** 80% of CLIs should use Tier 1. Start simple, escalate only when proven necessary.

## What Gets Generated

Every CLI includes:
- TypeScript implementation with strict types
- README + QUICKSTART documentation
- Configuration templates (.env.example)
- Development setup (package.json, tsconfig.json)
- Error handling with proper exit codes
- JSON output for composability

## Technology Stack

- **Runtime:** Bun (not Node.js)
- **Language:** TypeScript (strict mode)
- **Output:** Deterministic JSON to stdout, errors to stderr
- **Testing:** Vitest when added

## Quick Start

For a simple Tier 1 CLI:

```typescript
#!/usr/bin/env bun
// src/cli.ts

interface Config {
  apiKey: string;
  baseUrl: string;
}

interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

function loadConfig(): Config {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error(JSON.stringify({ error: "API_KEY not set" }));
    process.exit(1);
  }
  return {
    apiKey,
    baseUrl: process.env.BASE_URL || "https://api.example.com"
  };
}

function showHelp(): void {
  console.log(`
my-cli - Description of what it does

USAGE:
  my-cli <command> [options]

COMMANDS:
  list              List all items
  get <id>          Get item by ID
  create <name>     Create new item

OPTIONS:
  --format json|text   Output format (default: json)
  --help, -h           Show this help

EXAMPLES:
  my-cli list
  my-cli get abc123
  my-cli create "New Item"
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    showHelp();
    process.exit(0);
  }

  const config = loadConfig();

  switch (command) {
    case "list":
      // Implementation
      break;
    case "get":
      // Implementation
      break;
    case "create":
      // Implementation
      break;
    default:
      console.error(JSON.stringify({ error: `Unknown command: ${command}` }));
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
```

## Configuration Flags Standard

Every CLI should expose behavioral options via flags, not hardcoded values:

- **Mode flags:** `--fast`, `--dry-run`, `--verbose`
- **Output flags:** `--format json|text`, `--quiet`, `--no-color`
- **Resource flags:** `--model`, `--limit`, `--timeout`

This enables workflows and users to adapt CLI behavior without code changes.

## Instructions

1. **Gather requirements** - Identify CLI name, purpose, commands needed, authentication method
2. **Select tier** - Use Tier 1 unless 10+ commands or subcommands needed
3. **Generate interfaces** - Create TypeScript interfaces for all data structures
4. **Create configuration** - Environment variables via .env, type-safe loading
5. **Design flags** - Expose behavioral options, don't hardcode values
6. **Generate commands** - Each command as a function with validation and output
7. **Build help** - Comprehensive usage, command descriptions, examples
8. **Create entry point** - Main function with argument parsing and routing
9. **Generate support files** - package.json, tsconfig.json, .env.example, README
10. **Validate** - TypeScript compiles, commands work, docs are complete

## Examples

**Example 1: Create a simple API CLI**
```
User: "create a cli for the GitHub API"
Claude: Creates github-cli/ with:
        - src/cli.ts (Tier 1, manual parsing)
        - Commands: repos list, repos get, issues list, issues create
        - .env.example with GITHUB_TOKEN
        - README.md with usage examples
```

**Example 2: Extend existing CLI**
```
User: "add a delete command to my-cli"
Claude: Reads existing CLI structure
        Adds delete command function
        Updates switch statement routing
        Revises help documentation
        Updates README
```

**Example 3: Upgrade to Commander.js**
```
User: "my cli now has 20 commands, should I upgrade?"
Claude: Analyzes command complexity
        Recommends Tier 2 if subcommands/plugins needed
        Provides migration workflow via workflows/upgrade-tier.md
```

## Resources

- [Create workflow](workflows/create.md) - Full 10-step CLI generation process
- [Add command workflow](workflows/add-command.md) - Extend existing CLIs
- [Upgrade tier workflow](workflows/upgrade-tier.md) - Migrate Tier 1 to Tier 2
- [Framework comparison](reference/framework-comparison.md) - Decision guide
- [Patterns](reference/patterns.md) - Reusable CLI patterns
- [TypeScript patterns](reference/typescript-patterns.md) - Type safety patterns
