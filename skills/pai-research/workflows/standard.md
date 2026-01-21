# Standard Research Workflow

Two parallel agents for balanced depth and perspective.

## Configuration

- **Agents:** 2 (parallel)
- **Queries:** 1 per agent (different angles)
- **Target time:** 15-30 seconds
- **Timeout:** 60 seconds

## Process

### Step 1: Generate Two Query Angles

Split the research into complementary angles:

| Agent | Focus | Query Style |
|-------|-------|-------------|
| **Agent 1** | Depth | Technical details, authoritative sources, how it works |
| **Agent 2** | Breadth | Use cases, comparisons, community perspectives, recent developments |

### Step 2: Launch Parallel Agents

**Critical:** Launch BOTH agents in a single message for parallel execution.

```typescript
// Single message with both Task calls
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] depth analysis",
  prompt: `
    Search for: [depth-focused query]

    Focus on:
    - Technical details and mechanisms
    - Authoritative/official sources
    - How it works under the hood

    Return findings with source URLs.
  `
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] breadth analysis",
  prompt: `
    Search for: [breadth-focused query]

    Focus on:
    - Practical applications and use cases
    - Comparisons and alternatives
    - Community opinions and recent developments

    Return findings with source URLs.
  `
})
```

### Step 3: Synthesize Results

Once both agents return:

1. **Identify convergence** - Points both agents agree on (high confidence)
2. **Capture unique insights** - Valuable info from each perspective
3. **Note conflicts** - Where sources disagree (flag for user)

### Step 4: Verify URLs

For each URL from both agents:
```bash
curl -s -o /dev/null -w "%{http_code}" -L "URL"
```

Remove any URLs that don't return 200.

### Step 5: Format Output

```markdown
## Research: [Topic]

**Mode:** Standard | **Agents:** 2 | **Time:** [X]s

### Key Findings

[Synthesized answer combining both perspectives]

**Technical depth:**
[Insights from Agent 1]

**Practical context:**
[Insights from Agent 2]

### Sources
- [Source 1](verified-url) - [Brief description]
- [Source 2](verified-url) - [Brief description]

### Conflicts/Uncertainties
[Note any disagreements between sources, if applicable]

### Next Steps
[Suggestions for extensive research if topic warrants deeper investigation]
```

## Example

**Request:** "research the current state of WebAssembly"

**Agent 1 Query:** "WebAssembly technical specification 2024 features components"
**Agent 2 Query:** "WebAssembly real world applications adoption trends"

**Output:**
```markdown
## Research: Current State of WebAssembly

**Mode:** Standard | **Agents:** 2 | **Time:** 24s

### Key Findings

WebAssembly has matured significantly, with the Component Model nearing standardization. Browser support is universal, and server-side adoption is growing through WASI.

**Technical depth:**
- Component Model (Phase 3) enables module composition
- Garbage collection proposal shipped in major browsers (2023)
- WASI 0.2 provides standardized system interface

**Practical context:**
- Figma, Google Earth, and AutoCAD use WASM for performance
- Cloudflare Workers and Fastly Compute use WASM for edge computing
- Growing adoption in plugin systems (VS Code, Zed)

### Sources
- [WebAssembly Roadmap](https://webassembly.org/roadmap/) - Official status
- [State of WebAssembly 2024](https://blog.example.com/...) - Survey results

### Next Steps
Run extensive research for deep dive on Component Model or WASI specifically.
```

## When to Use

- Most research requests (default mode)
- "Tell me about X"
- "What's the current state of X"
- Technology evaluations
- Concept explanations with context
