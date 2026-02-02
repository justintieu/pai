# Exploration Prompt Template

Use for: find, search, understand, where, how does, what is

## Template

```markdown
## Task
{description}

## Scope
{directories or files to explore}

## Questions to Answer
{specific questions user needs answered}

## Output Format
Start response with manifest:
---
status: complete | partial | failed
summary: "One sentence of findings"
continuation: "What remains" # only if partial
---

Then provide findings with file references.

## Constraints
- Read files, don't edit
- Focus on answering the questions, not comprehensive analysis
- If scope too large, return partial with continuation
```

## Placeholder Reference

| Placeholder | Source |
|-------------|--------|
| {description} | User's exploration request |
| {directories or files to explore} | Relevant paths from user context |
| {specific questions} | What user needs to know |

## When to Use

Spawn exploration subagent when user asks:
- "Where is X defined?"
- "How does X work?"
- "Find all uses of X"
- "What files are related to X?"
- "Understand the X module"

## Model Selection

| Complexity | Model | Rationale |
|------------|-------|-----------|
| Simple search | haiku | Fast, cheap, sufficient |
| Code understanding | sonnet | Better reasoning |
| Architecture analysis | sonnet/opus | Complex patterns |

## Integration

- References: [subagent-manifest.md](../subagent-manifest.md) for status reporting
- Coordination: [subagent-coordination.md](../subagent-coordination.md) for orchestration
