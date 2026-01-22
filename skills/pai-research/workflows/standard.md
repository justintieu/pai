# Standard Research Workflow

Two parallel agents for balanced depth and perspective.

## Configuration

- **Agents:** 2 (parallel)
- **Queries:** 1 per agent (different angles)
- **Target time:** 15-30 seconds
- **Timeout:** 60 seconds
- **Protocol:** [Subagent Manifest](/protocols/subagent-manifest.md)

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

    ## Output Format (REQUIRED)
    Start your response with this exact format:
    ---
    status: complete | partial | failed
    summary: "One sentence of what you found"
    continuation: "What remains to research" # only if partial
    ---

    Then provide your findings below the frontmatter.
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

    ## Output Format (REQUIRED)
    Start your response with this exact format:
    ---
    status: complete | partial | failed
    summary: "One sentence of what you found"
    continuation: "What remains to research" # only if partial
    ---

    Then provide your findings below the frontmatter.
  `
})
```

### Step 3: Check Inline Manifests

Once both agents return, parse the YAML frontmatter from each response:

```python
for response in [depth_response, breadth_response]:
    lines = response.split('\n')
    if lines[0] == '---':
        # Extract frontmatter
        end = lines[1:].index('---') + 1
        manifest = yaml.parse('\n'.join(lines[1:end]))

        if manifest.status == 'partial':
            spawn_continuation(manifest.continuation)
```

**Handle status:**
- `complete` → Ready for synthesis
- `partial` → Spawn continuation agent with `continuation` field as the new task
- `failed` → Note the error, proceed with available results

**Only proceed to synthesis after all agents are complete or continuations exhausted.**

### Step 4: Synthesize Results

Extract findings from below the frontmatter in each response, then synthesize:

1. **Identify convergence** - Points both agents agree on (high confidence)
2. **Capture unique insights** - Valuable info from each perspective
3. **Note conflicts** - Where sources disagree (flag for user)

### Step 5: Verify URLs

For each URL from both agents:
```bash
curl -s -o /dev/null -w "%{http_code}" -L "URL"
```

Remove any URLs that don't return 200.

### Step 6: Save Full Results

Save the complete research to file:

```bash
TOPIC_SLUG=$(echo "[topic]" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
OUTPUT_FILE="$HOME/.pai/output/research/$(date +%Y-%m-%d)-${TOPIC_SLUG}.md"

cat > "$OUTPUT_FILE" << 'EOF'
# Research: [Topic]

**Date:** [date]
**Mode:** Standard | **Agents:** 2 | **Time:** [X]s

## Synthesized Findings
[Full synthesized answer combining both perspectives]

## Technical Depth (Agent 1)
[Complete findings from depth-focused agent]

## Practical Context (Agent 2)
[Complete findings from breadth-focused agent]

## Sources
- [Source 1](verified-url) - [Description]
- [Source 2](verified-url) - [Description]
- [Additional sources...]

## Conflicts/Uncertainties
[Detailed notes on disagreements between sources]

## Raw Agent Outputs
[Preserved for reference if needed]
EOF
```

### Step 7: Return Summary

Return concise summary with file reference:

```markdown
## Research: [Topic]

**Mode:** Standard | **Agents:** 2 | **Saved:** `~/.pai/output/research/[filename]`

### Key Findings
- [Most important finding]
- [Second key finding]
- [Third key finding]

### Sources
- [Top source](verified-url) - Brief description

### Next Steps
[Suggestions for extensive research if topic warrants deeper investigation]

→ Full details: `~/.pai/output/research/[filename]`
```

**Context savings:** ~5,000 chars → ~400 chars (92% reduction)

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
