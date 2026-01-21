# Create CLI Workflow

Generate a production-ready TypeScript CLI following the llcli pattern and CLI-First Architecture.

## Prerequisites

- Bun installed (`bun --version`)
- Target directory for new CLI

## Steps

### 1. Gather Requirements

Identify these details before starting:

```
CLI Name: _______________
Purpose: _______________
Target API/Service: _______________
Authentication: [ ] API Key [ ] OAuth [ ] None
Commands needed: _______________
```

### 2. Determine Tier

**Use Tier 1 (default) if:**
- 2-10 simple commands
- API wrapper or file processor
- No subcommands needed
- Single output format

**Escalate to Tier 2 if:**
- 10+ commands
- Subcommand hierarchy needed
- Plugin architecture required
- Multiple output formats

### 3. Generate TypeScript Interfaces

Create interfaces for all data structures:

```typescript
// src/types.ts
export interface Config {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ListResult {
  items: Item[];
  total: number;
  page: number;
}

export interface Item {
  id: string;
  name: string;
  createdAt: string;
}
```

### 4. Create Configuration Handling

```typescript
// src/config.ts
import type { Config } from "./types";

export function loadConfig(): Config {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error(JSON.stringify({
      error: "Configuration error",
      message: "API_KEY environment variable not set",
      hint: "Create a .env file with API_KEY=your-key"
    }));
    process.exit(1);
  }

  return {
    apiKey,
    baseUrl: process.env.BASE_URL || "https://api.example.com",
    timeout: parseInt(process.env.TIMEOUT || "30000", 10)
  };
}
```

### 5. Design Configuration Flags

Every CLI should expose behavioral options:

```typescript
interface CliOptions {
  // Mode flags
  dryRun: boolean;    // --dry-run
  verbose: boolean;   // --verbose, -v
  quiet: boolean;     // --quiet, -q

  // Output flags
  format: "json" | "text";  // --format
  noColor: boolean;         // --no-color

  // Resource flags
  limit: number;      // --limit
  timeout: number;    // --timeout
}

function parseOptions(args: string[]): CliOptions {
  return {
    dryRun: args.includes("--dry-run"),
    verbose: args.includes("--verbose") || args.includes("-v"),
    quiet: args.includes("--quiet") || args.includes("-q"),
    format: args.includes("--format=text") ? "text" : "json",
    noColor: args.includes("--no-color"),
    limit: parseInt(args.find(a => a.startsWith("--limit="))?.split("=")[1] || "100", 10),
    timeout: parseInt(args.find(a => a.startsWith("--timeout="))?.split("=")[1] || "30000", 10)
  };
}
```

### 6. Generate Command Functions

Each command should:
- Validate inputs
- Load configuration
- Execute operation
- Return structured output

```typescript
// src/commands/list.ts
import type { Config, ApiResponse, ListResult } from "../types";

export async function listItems(
  config: Config,
  options: { limit?: number; page?: number }
): Promise<ApiResponse<ListResult>> {
  const { limit = 100, page = 1 } = options;

  try {
    const response = await fetch(
      `${config.baseUrl}/items?limit=${limit}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

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

### 7. Create Help Documentation

```typescript
function showHelp(): void {
  console.log(`
my-cli v1.0.0 - Brief description

USAGE:
  my-cli <command> [options]

COMMANDS:
  list [--limit N]      List all items
  get <id>              Get item by ID
  create <name>         Create new item
  delete <id>           Delete item

OPTIONS:
  --format json|text    Output format (default: json)
  --limit N             Limit results (default: 100)
  --timeout N           Request timeout in ms (default: 30000)
  --dry-run             Preview action without executing
  --verbose, -v         Verbose output
  --quiet, -q           Suppress non-error output
  --help, -h            Show this help

CONFIGURATION:
  API_KEY               Required: Your API key
  BASE_URL              Optional: API base URL

EXAMPLES:
  my-cli list
  my-cli list --limit 10 --format text
  my-cli get abc123
  my-cli create "New Item"
  my-cli delete abc123 --dry-run

EXIT CODES:
  0   Success
  1   Error
`);
}
```

### 8. Build Main Entry Point

```typescript
#!/usr/bin/env bun
// src/cli.ts

import { loadConfig } from "./config";
import { listItems } from "./commands/list";
import { getItem } from "./commands/get";
import { createItem } from "./commands/create";
import { deleteItem } from "./commands/delete";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = parseOptions(args);

  if (!command || command === "--help" || command === "-h") {
    showHelp();
    process.exit(0);
  }

  if (command === "--version") {
    console.log("1.0.0");
    process.exit(0);
  }

  const config = loadConfig();

  let result;
  switch (command) {
    case "list":
      result = await listItems(config, { limit: options.limit });
      break;
    case "get":
      const getId = args[1];
      if (!getId) {
        console.error(JSON.stringify({ error: "get requires an ID argument" }));
        process.exit(1);
      }
      result = await getItem(config, getId);
      break;
    case "create":
      const name = args[1];
      if (!name) {
        console.error(JSON.stringify({ error: "create requires a name argument" }));
        process.exit(1);
      }
      result = await createItem(config, name, options);
      break;
    case "delete":
      const deleteId = args[1];
      if (!deleteId) {
        console.error(JSON.stringify({ error: "delete requires an ID argument" }));
        process.exit(1);
      }
      result = await deleteItem(config, deleteId, options);
      break;
    default:
      console.error(JSON.stringify({ error: `Unknown command: ${command}` }));
      process.exit(1);
  }

  // Output result
  if (options.format === "text") {
    console.log(formatAsText(result));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }

  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
```

### 9. Generate Support Files

**package.json:**
```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "description": "Brief description",
  "type": "module",
  "bin": {
    "my-cli": "./src/cli.ts"
  },
  "scripts": {
    "dev": "bun run src/cli.ts",
    "build": "bun build src/cli.ts --outdir dist --target bun",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**.env.example:**
```bash
# Required
API_KEY=your-api-key-here

# Optional
BASE_URL=https://api.example.com
TIMEOUT=30000
```

**README.md template:**
```markdown
# my-cli

Brief description of what this CLI does.

## Installation

\`\`\`bash
bun install
\`\`\`

## Configuration

Copy `.env.example` to `.env` and fill in your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

## Usage

\`\`\`bash
# List items
bun run src/cli.ts list

# Get specific item
bun run src/cli.ts get abc123

# Create item
bun run src/cli.ts create "New Item"
\`\`\`

## Commands

| Command | Description |
|---------|-------------|
| `list` | List all items |
| `get <id>` | Get item by ID |
| `create <name>` | Create new item |
| `delete <id>` | Delete item |

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format` | Output format (json/text) | json |
| `--limit` | Limit results | 100 |
| `--dry-run` | Preview without executing | false |
| `--verbose` | Verbose output | false |

## Exit Codes

- `0` - Success
- `1` - Error
```

### 10. Validate

Run validation checklist:

- [ ] TypeScript compiles: `bun run typecheck`
- [ ] CLI runs: `bun run src/cli.ts --help`
- [ ] Commands work: Test each command
- [ ] JSON output is valid
- [ ] Exit codes are correct
- [ ] Documentation is complete
- [ ] .env.example has all variables

## File Structure

```
my-cli/
├── src/
│   ├── cli.ts           # Entry point
│   ├── config.ts        # Configuration loading
│   ├── types.ts         # TypeScript interfaces
│   └── commands/
│       ├── list.ts
│       ├── get.ts
│       ├── create.ts
│       └── delete.ts
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```
