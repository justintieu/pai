# Common CLI Patterns

Reusable patterns for TypeScript CLI development based on production implementations.

## 1. Configuration Loading

Load settings from environment with validation:

```typescript
interface Config {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}

function loadConfig(): Config {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error(JSON.stringify({
      error: "Configuration error",
      message: "API_KEY environment variable not set",
      hint: "Create a .env file with API_KEY=your-key or export API_KEY=your-key"
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

## 2. API Client Wrapper

Wrap fetch with error handling:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  config: Config,
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${config.baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers
      },
      signal: AbortSignal.timeout(config.timeout)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}. ${errorBody}`
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "TimeoutError") {
        return { success: false, error: `Request timed out after ${config.timeout}ms` };
      }
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}
```

## 3. Command Function Template

Standard structure for command functions:

```typescript
interface CommandOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

async function myCommand(
  config: Config,
  input: string,
  options: CommandOptions = {}
): Promise<ApiResponse<ResultType>> {
  const { dryRun = false, verbose = false } = options;

  // 1. Validate input
  if (!input || input.trim().length === 0) {
    return { success: false, error: "Input is required" };
  }

  // 2. Log verbose info
  if (verbose) {
    console.error(`[verbose] Processing: ${input}`);
  }

  // 3. Handle dry run
  if (dryRun) {
    return {
      success: true,
      data: {
        dryRun: true,
        wouldProcess: input
      }
    };
  }

  // 4. Execute operation
  const result = await apiRequest<ResultType>(config, "/endpoint", {
    method: "POST",
    body: JSON.stringify({ input })
  });

  return result;
}
```

## 4. Argument Parsing

Manual argument parsing for Tier 1:

```typescript
interface ParsedArgs {
  command: string;
  positional: string[];
  flags: Record<string, boolean>;
  options: Record<string, string>;
}

function parseArgs(args: string[]): ParsedArgs {
  const command = args[0] || "";
  const positional: string[] = [];
  const flags: Record<string, boolean> = {};
  const options: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      if (arg.includes("=")) {
        // --option=value
        const [key, value] = arg.slice(2).split("=", 2);
        options[key] = value;
      } else if (args[i + 1] && !args[i + 1].startsWith("-")) {
        // --option value
        options[arg.slice(2)] = args[++i];
      } else {
        // --flag
        flags[arg.slice(2)] = true;
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      // -f (short flag)
      flags[arg.slice(1)] = true;
    } else {
      positional.push(arg);
    }
  }

  return { command, positional, flags, options };
}

// Usage:
const { command, positional, flags, options } = parseArgs(process.argv.slice(2));
// my-cli create "name" --dry-run --format=json
// command: "create"
// positional: ["name"]
// flags: { "dry-run": true }
// options: { "format": "json" }
```

## 5. Help Text Template

Comprehensive help output:

```typescript
function showHelp(): void {
  console.log(`
${CLI_NAME} v${VERSION} - ${DESCRIPTION}

USAGE:
  ${CLI_NAME} <command> [arguments] [options]

COMMANDS:
  list              List all items
  get <id>          Get item by ID
  create <name>     Create new item
  delete <id>       Delete item

GLOBAL OPTIONS:
  --format <type>   Output format: json (default), text
  --verbose, -v     Enable verbose output
  --quiet, -q       Suppress non-error output
  --dry-run         Preview action without executing
  --help, -h        Show this help message
  --version         Show version

CONFIGURATION:
  Environment variables (or .env file):
    API_KEY         Required: Your API key
    BASE_URL        Optional: API endpoint (default: https://api.example.com)
    TIMEOUT         Optional: Request timeout in ms (default: 30000)

EXAMPLES:
  # List all items
  ${CLI_NAME} list

  # List with limit
  ${CLI_NAME} list --limit 10

  # Get specific item
  ${CLI_NAME} get abc123

  # Create with dry run
  ${CLI_NAME} create "New Item" --dry-run

  # Text output format
  ${CLI_NAME} list --format text

EXIT CODES:
  0    Success
  1    Error (check stderr for details)

DOCUMENTATION:
  https://github.com/user/repo#readme
`);
}
```

## 6. Error Handling

Custom error class with helpful context:

```typescript
class CliError extends Error {
  constructor(
    message: string,
    public code: string,
    public hint?: string
  ) {
    super(message);
    this.name = "CliError";
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      hint: this.hint
    };
  }
}

// Usage:
throw new CliError(
  "API key not found",
  "CONFIG_MISSING",
  "Set API_KEY environment variable or create a .env file"
);

// Global error handler:
process.on("uncaughtException", (err) => {
  if (err instanceof CliError) {
    console.error(JSON.stringify(err.toJSON()));
  } else {
    console.error(JSON.stringify({
      error: err.message,
      code: "UNEXPECTED_ERROR"
    }));
  }
  process.exit(1);
});
```

## 7. Output Formatting

JSON to stdout, errors to stderr:

```typescript
interface OutputOptions {
  format: "json" | "text";
  quiet: boolean;
}

function output<T>(result: ApiResponse<T>, options: OutputOptions): void {
  if (!result.success) {
    console.error(JSON.stringify({ error: result.error }));
    process.exit(1);
  }

  if (options.quiet) {
    process.exit(0);
  }

  if (options.format === "text") {
    console.log(formatAsText(result.data));
  } else {
    console.log(JSON.stringify(result.data, null, 2));
  }
}

function formatAsText(data: unknown): string {
  if (Array.isArray(data)) {
    return data.map((item, i) => `${i + 1}. ${formatItem(item)}`).join("\n");
  }
  if (typeof data === "object" && data !== null) {
    return Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  }
  return String(data);
}
```

## 8. File I/O Safety

Safe file operations with error handling:

```typescript
import { readFile, writeFile, access } from "fs/promises";
import { constants } from "fs";

async function safeReadFile(path: string): Promise<ApiResponse<string>> {
  try {
    await access(path, constants.R_OK);
    const content = await readFile(path, "utf-8");
    return { success: true, data: content };
  } catch (err) {
    if (err instanceof Error && "code" in err) {
      if (err.code === "ENOENT") {
        return { success: false, error: `File not found: ${path}` };
      }
      if (err.code === "EACCES") {
        return { success: false, error: `Permission denied: ${path}` };
      }
    }
    return { success: false, error: `Failed to read file: ${path}` };
  }
}

async function safeWriteFile(
  path: string,
  content: string,
  options: { overwrite?: boolean } = {}
): Promise<ApiResponse<void>> {
  try {
    if (!options.overwrite) {
      try {
        await access(path);
        return { success: false, error: `File already exists: ${path}` };
      } catch {
        // File doesn't exist, safe to write
      }
    }
    await writeFile(path, content, "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: `Failed to write file: ${path}` };
  }
}
```

## 9. Progress Indication

Simple progress for long operations:

```typescript
function createProgress(total: number, label: string) {
  let current = 0;

  return {
    tick(message?: string) {
      current++;
      const pct = Math.round((current / total) * 100);
      const msg = message ? ` - ${message}` : "";
      process.stderr.write(`\r[${pct}%] ${label}${msg}`);
    },
    done() {
      process.stderr.write(`\r[100%] ${label} - Done\n`);
    }
  };
}

// Usage:
const progress = createProgress(items.length, "Processing");
for (const item of items) {
  await processItem(item);
  progress.tick(item.name);
}
progress.done();
```

## 10. Testing Pattern

Vitest test structure for CLIs:

```typescript
import { describe, it, expect } from "vitest";
import { spawn } from "child_process";

function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn("bun", ["run", "src/cli.ts", ...args]);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => (stdout += data));
    proc.stderr.on("data", (data) => (stderr += data));
    proc.on("close", (code) => resolve({ code: code || 0, stdout, stderr }));
  });
}

describe("CLI", () => {
  it("shows help with --help", async () => {
    const { code, stdout } = await runCli(["--help"]);
    expect(code).toBe(0);
    expect(stdout).toContain("USAGE:");
  });

  it("returns error for unknown command", async () => {
    const { code, stderr } = await runCli(["unknown"]);
    expect(code).toBe(1);
    expect(JSON.parse(stderr)).toHaveProperty("error");
  });

  it("list command returns JSON array", async () => {
    const { code, stdout } = await runCli(["list"]);
    expect(code).toBe(0);
    const data = JSON.parse(stdout);
    expect(data).toHaveProperty("success", true);
  });
});
```
