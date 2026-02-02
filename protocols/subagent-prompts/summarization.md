# Summarization Prompt Template

Use for: condensing long subagent output before presenting to user

## Template

```markdown
## Task
Summarize the following output for the user.

## Raw Output
{subagent's full output}

## Context
User asked: {original request}

## Output Format
Provide a concise summary (2-5 sentences) covering:
1. What was accomplished
2. Key decisions or findings
3. Any issues or notes

Keep technical details if user will need them.
Omit process/procedural details.
```

## Placeholder Reference

| Placeholder | Source |
|-------------|--------|
| {subagent's full output} | Raw response from subagent |
| {original request} | User's original question/request |

## When to Use

Trigger summarization when subagent output exceeds threshold:
- 500+ lines OR
- 10,000+ characters

Small outputs can be passed through with light framing.

## Output Size Decision Matrix

| Output Size | Action |
|-------------|--------|
| < 100 lines | Pass through directly |
| 100-500 lines | Frame with intro ("The agent found X...") |
| > 500 lines | Spawn summarizer first |

## Summary Quality Guidelines

**Good summary:**
- "Created JWT auth with refresh tokens. Key files: auth.ts, middleware.ts. Used jose library for Edge compatibility."

**Bad summary:**
- "The task was completed successfully."
- "Implementation done. See files for details."

Summaries should tell the user what shipped, not that something shipped.

## Model Selection

Always use haiku - summarization is compression, not creation.

## Exception: When Not to Summarize

Don't summarize when output contains:
- Error details user needs for debugging
- Code snippets user explicitly asked for
- Step-by-step instructions user will follow
- Security-sensitive information that shouldn't be truncated

In these cases, pass through full output even if large.

## Integration

- Coordination: [subagent-coordination.md](../subagent-coordination.md) for orchestration
