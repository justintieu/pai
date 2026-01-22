# Extensive Research Workflow

Six parallel agents exploring diverse angles for comprehensive coverage.

## Configuration

- **Agents:** 6 (parallel)
- **Queries:** 1 per agent (unique angles)
- **Target time:** 60-90 seconds
- **Timeout:** 5 minutes
- **Protocol:** [Subagent Manifest](/protocols/subagent-manifest.md)

## Process

### Step 0: Deep Think for Research Angles

Before spawning agents, generate 6 diverse research angles:

**Angle categories:**
1. **Core/Technical** - How it fundamentally works
2. **Historical** - Evolution, origins, key milestones
3. **Comparative** - Alternatives, competitors, tradeoffs
4. **Practical** - Real-world applications, case studies
5. **Critical** - Limitations, criticisms, failure modes
6. **Future** - Trends, roadmap, emerging developments

**Good angles:**
- Explore unexpected domains
- Challenge obvious assumptions
- Find contrarian perspectives
- Seek primary sources

### Step 1: Launch All Agents Simultaneously

**Critical:** All 6 agents in a SINGLE message for true parallel execution.

Each agent returns an inline manifest in its response:

```typescript
// Single message with all Task calls
// Each prompt includes the inline manifest format

const inlineManifest = `
## Output Format (REQUIRED)
Start your response with this exact format:
---
status: complete | partial | failed
summary: "One sentence of what you found"
continuation: "What remains to research" # only if partial
---

Then provide your findings below the frontmatter.
`;

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] core/technical",
  prompt: `Search for: [technical deep-dive query].
${inlineManifest}`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] history/evolution",
  prompt: `Search for: [historical query].
${inlineManifest}`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] alternatives/comparison",
  prompt: `Search for: [comparative query].
${inlineManifest}`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] real-world applications",
  prompt: `Search for: [practical applications query].
${inlineManifest}`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] limitations/criticisms",
  prompt: `Search for: [critical perspective query].
${inlineManifest}`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] future/trends",
  prompt: `Search for: [future trends query].
${inlineManifest}`
})
```

### Step 2: Check Inline Manifests

Once agents return, parse the YAML frontmatter from each response:

```python
for response in all_responses:
    lines = response.split('\n')
    if lines[0] == '---':
        # Extract frontmatter
        end = lines[1:].index('---') + 1
        manifest = yaml.parse('\n'.join(lines[1:end]))

        if manifest.status == 'partial':
            spawn_continuation(manifest.continuation)
        elif manifest.status == 'failed':
            log_error(manifest)
```

**Handle status for each:**
- `complete` → Ready for synthesis
- `partial` → Spawn continuation agent with `continuation` field
- `failed` → Note error, proceed with available results

**Important:** Only proceed to synthesis after all agents are complete or continuations exhausted.

### Step 3: Extract Findings

Once all manifests show complete (or continuations handled), extract findings from below the frontmatter in each response.

### Step 4: Synthesize Across Angles

**Theme identification:**
- What patterns emerge across multiple angles?
- What do authoritative sources agree on?

**Unique insights:**
- What did each angle contribute uniquely?
- Any surprising findings from unexpected angles?

**Conflicts:**
- Where do sources disagree?
- What remains uncertain or debated?

### Step 5: Verify All URLs

Every URL must be verified:
```bash
for url in URLs; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
  [ "$status" = "200" ] || remove_url
done
```

### Step 6: Save Full Report

Save the comprehensive report to file for context efficiency:

```bash
TOPIC_SLUG=$(echo "[topic]" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
OUTPUT_FILE="$HOME/.pai/output/research/$(date +%Y-%m-%d)-${TOPIC_SLUG}.md"

# Write full report to file
cat > "$OUTPUT_FILE" << 'EOF'
# Deep Dive: [Topic]

**Date:** [date]
**Mode:** Extensive | **Agents:** 6 | **Time:** [X]s

## Executive Summary
[2-3 paragraph synthesis of key findings]

## Technical Foundation
[Core/technical angle findings]

## Historical Context
[Evolution and key milestones]

## Competitive Landscape
[Alternatives and tradeoffs]

## Real-World Applications
[Case studies and practical use]

## Limitations & Criticisms
[Known issues and challenges]

## Future Outlook
[Trends and predictions]

## Cross-Cutting Themes
[Patterns that emerged across multiple angles]

## Conflicting Information
[Areas where sources disagree - flag for user judgment]

## Sources
[All verified URLs organized by section]

## Research Metrics
- Agents: 6
- Angles explored: [list]
- High-confidence findings: [count]
- Areas needing more research: [list]
EOF
```

### Step 7: Return Summary

Return concise summary with file reference:

```markdown
## Deep Dive: [Topic]

**Mode:** Extensive | **Agents:** 6 | **Saved:** `~/.pai/output/research/[filename]`

### Key Findings
- [Most important finding 1]
- [Key finding 2]
- [Key finding 3]
- [Key finding 4]
- [Key finding 5]

### Top Sources
- [Primary source](url) - Why it's authoritative
- [Secondary source](url) - Key contribution

### Notable Insights
[1-2 surprising or non-obvious findings from the research]

### Areas of Uncertainty
[Key points where sources disagreed]

→ Full report: `~/.pai/output/research/[filename]`
```

**Context savings:** ~15,000 chars → ~800 chars (95% reduction)

## Example

**Request:** "do a deep dive on the current state of AI agents"

**6 Angles:**
1. Technical: "AI agent architectures 2024 ReAct tool use"
2. Historical: "AI agents evolution from GOFAI to LLMs"
3. Comparative: "AI agent frameworks compared AutoGPT CrewAI LangGraph"
4. Practical: "AI agents production deployments case studies"
5. Critical: "AI agent limitations reliability hallucination problems"
6. Future: "AI agent research trends 2024 2025 multi-agent"

**Output:** [Comprehensive 6-section report with synthesis]

## When to Use

- "Deep dive on X"
- "Thoroughly research X"
- "I need a comprehensive understanding of X"
- Strategic decisions requiring full context
- New domain exploration
- Due diligence research
