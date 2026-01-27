# CLI Framework Comparison

Decision guide for selecting the right CLI architecture tier.

## Three-Tier Approach

### Tier 1: Manual Parsing (Default)

**When to use:**
- 2-10 commands
- Simple API wrappers
- File processors
- Automation scripts
- Single output format

**Characteristics:**
- Zero framework dependencies
- ~300-400 lines total
- process.argv parsing
- Switch statement routing
- Full control over everything

**Example structure:**
```typescript
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "list": /* ... */ break;
  case "get": /* ... */ break;
  default: showHelp();
}
```

**Pros:**
- No dependencies to maintain
- Full control over parsing
- Smaller bundle size
- Easier to understand
- No framework quirks

**Cons:**
- Manual help generation
- Manual option parsing
- No subcommand support
- Boilerplate for complex options

### Tier 2: Commander.js

**When to use:**
- 10+ commands
- Subcommand hierarchy needed
- Complex option parsing
- Multiple output formats
- Plugin architecture

**Characteristics:**
- Single dependency (commander)
- Declarative command definition
- Auto-generated help
- Built-in subcommand routing
- Option validation

**Example structure:**
```typescript
import { Command } from "commander";

const program = new Command();
program
  .command("list")
  .option("--limit <n>", "Limit results")
  .action(listHandler);

program
  .command("users")
  .command("list")
  .action(listUsersHandler);

program.parse();
```

**Pros:**
- Auto-generated help
- Built-in option parsing
- Subcommand support
- Well-documented API
- Active maintenance

**Cons:**
- External dependency
- Framework constraints
- Slightly larger bundle

### Tier 3: oclif (Reference Only)

**When to use:**
- Enterprise-scale systems
- Plugin ecosystems
- Multiple CLI products
- Team standardization

**Note:** Most projects never need Tier 3. It's included for reference only.

**Characteristics:**
- Full framework
- Plugin architecture
- CLI generation tools
- Testing utilities
- Documentation generation

## Decision Matrix

| Factor | Tier 1 | Tier 2 | Tier 3 |
|--------|--------|--------|--------|
| Commands | 2-10 | 10-50 | 50+ |
| Dependencies | 0 | 1 | Many |
| Subcommands | No | Yes | Yes |
| Plugins | No | Manual | Built-in |
| Learning curve | Low | Low | High |
| Bundle size | Tiny | Small | Large |

## Distribution

Based on typical CLI needs:
- **80%** should use Tier 1
- **15%** need Tier 2
- **5%** might benefit from Tier 3

## Decision Flow

```
Start
  |
  v
Commands > 10? --No--> Tier 1
  |
 Yes
  |
  v
Need subcommands? --No--> Tier 1 (consider restructuring)
  |
 Yes
  |
  v
Need plugin system? --No--> Tier 2
  |
 Yes
  |
  v
Enterprise scale? --No--> Tier 2 with manual plugins
  |
 Yes
  |
  v
Tier 3 (oclif)
```

## Philosophy

> "The best framework is no framework until proven otherwise."

Manual parsing with TypeScript provides:
- Superior control
- No dependency maintenance
- Clear, debuggable code
- Exactly what you need

Only add framework complexity when the benefits clearly outweigh the costs.

## Upgrade Path

It's easier to upgrade from Tier 1 to Tier 2 than to start with Tier 2 and realize you didn't need it.

1. Start with Tier 1
2. When switch statement becomes unwieldy (15+ cases), consider Tier 2
3. When you need plugin architecture at scale, consider Tier 3

See [upgrade-tier.md](../workflows/upgrade-tier.md) for migration guidance.
