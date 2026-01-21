---
name: pai-research
description: Multi-source research with parallel agents. Quick (1 agent), Standard (2 agents), or Extensive (6+ agents) modes. USE WHEN research, find out about, look into, investigate, learn about.
tools: WebSearch, WebFetch, Task, Read, Write
---

# PAI Research

Multi-source research skill with parallel agent execution for depth and speed.

## Workflows

| Workflow | Use When | Agents | Speed |
|----------|----------|--------|-------|
| **Quick** | Simple questions, fact checks | 1 | 10-15s |
| **Standard** | Most research needs | 2 | 15-30s |
| **Extensive** | Deep dives, complex topics | 6 | 60-90s |
| **Extract** | Distill insights from content | 1 | 30-60s |

## Mode Selection

**Quick** - "quick research on X", "just find out X", single fact
**Standard** (default) - "research X", "find out about X"
**Extensive** - "deep dive on X", "thoroughly research X", "extensive research on X"
**Extract** - "extract insights from X", "what's the alpha in X"

## Instructions

### 1. Determine Mode

Parse user request for mode indicators:
- Quick: "quick", "fast", "just", "briefly"
- Extensive: "deep", "thorough", "extensive", "comprehensive"
- Extract: "extract", "distill", "alpha", "insights from"
- Default: Standard

### 2. Execute Research

Load the appropriate workflow:
- Quick: `workflows/quick.md`
- Standard: `workflows/standard.md`
- Extensive: `workflows/extensive.md`
- Extract: `workflows/extract.md`

### 3. Verify URLs (Critical)

**Never deliver unverified URLs.** Research agents hallucinate URLs.

For each URL in results:
```bash
# Test if URL returns 200
curl -s -o /dev/null -w "%{http_code}" -L "URL"
```

If URL fails:
1. Remove it from results
2. Find alternative via WebSearch
3. Verify replacement
4. Only then include in output

### 4. Deliver Results

Format output as:

```markdown
## Research: [Topic]

**Mode:** [Quick/Standard/Extensive] | **Agents:** [N] | **Time:** [Xs]

### Key Findings
[Synthesized answer with verified sources]

### Sources
- [Title](verified-url) - Brief description

### Next Steps
[Suggestions for deeper research if applicable]
```

## Examples

**Example 1: Quick research**
```
User: "quick research on Rust's ownership model"
Claude: Executes Quick workflow (1 agent)
        Returns concise answer in ~15 seconds
```

**Example 2: Standard research**
```
User: "research the latest developments in WebAssembly"
Claude: Executes Standard workflow (2 parallel agents)
        Synthesizes findings from multiple perspectives
        Returns comprehensive answer in ~30 seconds
```

**Example 3: Extensive research**
```
User: "do a deep dive on the current state of AI agents"
Claude: Executes Extensive workflow (6 parallel agents)
        Explores multiple angles and domains
        Returns thorough analysis in ~90 seconds
```

**Example 4: Extract insights**
```
User: "extract the key insights from this article: [URL]"
Claude: Executes Extract workflow
        Identifies high-novelty, non-obvious insights
        Returns distilled alpha
```

## Resources

- [Quick workflow](workflows/quick.md) - Single agent, fast answers
- [Standard workflow](workflows/standard.md) - Two agents, balanced depth
- [Extensive workflow](workflows/extensive.md) - Six agents, comprehensive
- [Extract workflow](workflows/extract.md) - Insight distillation
