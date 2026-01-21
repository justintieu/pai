# TypeScript Patterns for CLI Development

Production-tested type safety patterns from major TypeScript CLIs.

## 1. Type-Safe Argument Parsing

### Schema-Driven Approach

Use a schema to infer types automatically:

```typescript
// Define command schema
const commands = {
  list: {
    options: {
      limit: { type: "number", default: 100 },
      format: { type: "string", choices: ["json", "text"] as const }
    }
  },
  get: {
    args: ["id"] as const,
    options: {
      verbose: { type: "boolean", default: false }
    }
  }
} as const;

// Infer types from schema
type Commands = typeof commands;
type CommandName = keyof Commands;
```

### Discriminated Unions for Commands

```typescript
type Command =
  | { type: "list"; limit: number; format: "json" | "text" }
  | { type: "get"; id: string; verbose: boolean }
  | { type: "create"; name: string; dryRun: boolean }
  | { type: "help" };

function parseCommand(args: string[]): Command {
  const cmd = args[0];

  switch (cmd) {
    case "list":
      return {
        type: "list",
        limit: parseInt(getOption(args, "--limit") || "100", 10),
        format: (getOption(args, "--format") || "json") as "json" | "text"
      };
    case "get":
      return {
        type: "get",
        id: args[1] || "",
        verbose: args.includes("--verbose")
      };
    case "create":
      return {
        type: "create",
        name: args[1] || "",
        dryRun: args.includes("--dry-run")
      };
    default:
      return { type: "help" };
  }
}

// Exhaustive handling
function execute(cmd: Command): void {
  switch (cmd.type) {
    case "list":
      handleList(cmd.limit, cmd.format);
      break;
    case "get":
      handleGet(cmd.id, cmd.verbose);
      break;
    case "create":
      handleCreate(cmd.name, cmd.dryRun);
      break;
    case "help":
      showHelp();
      break;
    default:
      // TypeScript will error if a case is missed
      const _exhaustive: never = cmd;
  }
}
```

## 2. Modern TypeScript 5.x Features

### `satisfies` for Type Validation

```typescript
// Ensure object matches type while preserving literal types
const config = {
  apiKey: process.env.API_KEY!,
  baseUrl: "https://api.example.com",
  timeout: 30000
} satisfies Config;

// config.baseUrl is typed as "https://api.example.com", not string
```

### Template Literal Types

```typescript
type OutputFormat = "json" | "text" | "yaml";
type FormatFlag = `--format=${OutputFormat}`;

function parseFormat(flag: string): OutputFormat | null {
  if (flag.startsWith("--format=")) {
    const value = flag.slice(9) as OutputFormat;
    if (["json", "text", "yaml"].includes(value)) {
      return value;
    }
  }
  return null;
}
```

### Const Type Parameters

```typescript
function defineCommand<const T extends readonly string[]>(
  name: string,
  args: T
): { name: string; args: T } {
  return { name, args };
}

const cmd = defineCommand("get", ["id", "format"] as const);
// cmd.args is typed as readonly ["id", "format"], not string[]
```

## 3. Error Handling Patterns

### Custom Error Classes

```typescript
class CliError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly hint?: string
  ) {
    super(message);
    this.name = "CliError";
  }
}

type ErrorCode =
  | "CONFIG_MISSING"
  | "INVALID_INPUT"
  | "API_ERROR"
  | "FILE_NOT_FOUND"
  | "PERMISSION_DENIED";

// Usage
throw new CliError(
  "API key not configured",
  "CONFIG_MISSING",
  "Set the API_KEY environment variable"
);
```

### Discriminated Error Types

```typescript
type CliResult<T> =
  | { success: true; data: T }
  | { success: false; error: UserError }
  | { success: false; error: BugError };

interface UserError {
  type: "user";
  message: string;
  hint?: string;
}

interface BugError {
  type: "bug";
  message: string;
  stack?: string;
}

function handleResult<T>(result: CliResult<T>): void {
  if (result.success) {
    console.log(JSON.stringify(result.data));
    return;
  }

  if (result.error.type === "user") {
    console.error(result.error.message);
    if (result.error.hint) {
      console.error(`Hint: ${result.error.hint}`);
    }
  } else {
    console.error("Internal error:", result.error.message);
    if (result.error.stack) {
      console.error(result.error.stack);
    }
  }
}
```

### Result/Either Pattern

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Usage
async function fetchItem(id: string): Promise<Result<Item, string>> {
  try {
    const response = await fetch(`/items/${id}`);
    if (!response.ok) {
      return err(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Unknown error");
  }
}

// Consumer
const result = await fetchItem("123");
if (result.ok) {
  console.log(result.value.name);
} else {
  console.error(result.error);
}
```

## 4. Configuration with Zod

Type-safe configuration parsing:

```typescript
import { z } from "zod";

const ConfigSchema = z.object({
  apiKey: z.string().min(1, "API_KEY is required"),
  baseUrl: z.string().url().default("https://api.example.com"),
  timeout: z.coerce.number().positive().default(30000),
  retries: z.coerce.number().int().min(0).max(10).default(3),
  debug: z
    .string()
    .transform((v) => v === "true" || v === "1")
    .default("false")
});

type Config = z.infer<typeof ConfigSchema>;

function loadConfig(): Config {
  const result = ConfigSchema.safeParse({
    apiKey: process.env.API_KEY,
    baseUrl: process.env.BASE_URL,
    timeout: process.env.TIMEOUT,
    retries: process.env.RETRIES,
    debug: process.env.DEBUG
  });

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    console.error(`Configuration errors:\n${errors}`);
    process.exit(1);
  }

  return result.data;
}
```

## 5. Async/Await Best Practices

### Top-Level Await Pattern

```typescript
#!/usr/bin/env bun
// Modern entry point with top-level await

const config = loadConfig();
const command = parseCommand(process.argv.slice(2));

try {
  const result = await execute(command, config);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
} catch (err) {
  console.error(JSON.stringify({ error: String(err) }));
  process.exit(1);
}
```

### Promise.allSettled for Resilience

```typescript
async function processItems(items: string[]): Promise<void> {
  const results = await Promise.allSettled(
    items.map((item) => processItem(item))
  );

  const succeeded = results.filter(
    (r): r is PromiseFulfilledResult<ItemResult> => r.status === "fulfilled"
  );
  const failed = results.filter(
    (r): r is PromiseRejectedResult => r.status === "rejected"
  );

  console.log(
    JSON.stringify({
      processed: succeeded.length,
      failed: failed.length,
      errors: failed.map((f) => f.reason.message)
    })
  );
}
```

### Cleanup with Finally

```typescript
async function withTempFile<T>(
  fn: (path: string) => Promise<T>
): Promise<T> {
  const tempPath = `/tmp/cli-${Date.now()}.tmp`;

  try {
    await writeFile(tempPath, "");
    return await fn(tempPath);
  } finally {
    try {
      await unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}
```

## 6. Signal Handling

Graceful shutdown:

```typescript
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.error(`\nReceived ${signal}, shutting down gracefully...`);

  // Cleanup tasks
  await cleanup();

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Prevent accidental double Ctrl+C
process.on("SIGINT", () => {
  if (isShuttingDown) {
    console.error("Force quit");
    process.exit(1);
  }
});
```

## 7. Strict TypeScript Configuration

Recommended tsconfig.json for CLIs:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["bun-types"]
  }
}
```

Key strict options:
- `noUncheckedIndexedAccess`: Array/object indexing returns `T | undefined`
- `exactOptionalPropertyTypes`: Distinguishes `undefined` from missing
- `noImplicitReturns`: All code paths must return
- `noFallthroughCasesInSwitch`: Prevents accidental fallthrough

## Summary

For Tier 1 CLIs, start with:
1. Custom error classes with codes and hints
2. Discriminated unions for commands
3. Result type for operations that can fail
4. Strict TypeScript configuration

Graduate to more advanced patterns (Zod, complex generics) only when needed.
