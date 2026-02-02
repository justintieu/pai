# Subagent Coordination Protocol

How the main agent coordinates subagents without doing implementation work.

## Core Principle

Main agent is a **coordinator**, not an implementer. Fresh context windows in subagents produce better results than a crowded main context.

**Golden rule:** If the main agent is reading files to "understand" before delegating, it's doing the subagent's job.

## Coordination Flow

```
User Request
    |
    v
Main Agent (Coordinator)
    |
    +-- Parse intent
    +-- Determine task type
    +-- Decompose if needed
    +-- Select subagent type
    |
    v
Spawn Subagent(s)
    |
    v
Read Manifest(s)
    |
    +-- If complete: synthesize
    +-- If partial: spawn continuation
    +-- If failed: retry or escalate
    |
    v
Synthesize Results
```

## Task-Type Routing

| Task Type | Subagent | Model | Prompt Template |
|-----------|----------|-------|-----------------|
| Exploration | Explore | haiku/sonnet | [exploration.md](subagent-prompts/exploration.md) |
| Implementation | Task | sonnet/opus | [implementation.md](subagent-prompts/implementation.md) |
| Verification | Task | sonnet | [verification.md](subagent-prompts/verification.md) |
| Summarization | Task | haiku | [summarization.md](subagent-prompts/summarization.md) |

### Intent Detection

| User Says | Task Type | Why |
|-----------|-----------|-----|
| "Where is X?" | Exploration | Finding location |
| "How does X work?" | Exploration | Understanding code |
| "Create X" | Implementation | Building new |
| "Fix X" | Implementation | Changing existing |
| "Update X to Y" | Implementation | Modifying behavior |
| "Refactor X" | Implementation | Restructuring |

## Verifier Subagent Chain

**All implementation work flows through verification before user sees it.**

This is the quality gate that prevents raw subagent output from reaching users without review.

```
Implementation Agent completes
    |
    v
Main reads manifest (status: complete)
    |
    v
Spawn Verifier Agent with:
  - What was implemented (from manifest summary)
  - Files to check (from manifest outputs)
  - Success criteria (original task)
    |
    v
Verifier returns pass/fail + issues
    |
    +-- If pass: Synthesize for user
    +-- If fail: Retry implementation or refine prompt
```

### Verifier Input Template

```markdown
## Task
Review implementation: {manifest.summary}

## Files Changed
{manifest.outputs}

## Original Requirements
{original user request requirements}

## Verify
- Requirements met?
- Bugs or edge cases?
- Follows codebase patterns?
- Security issues?
```

## Synthesis Rules

The main agent synthesizes subagent output, never dumps it raw.

| Output Size | Action |
|-------------|--------|
| < 100 lines | Pass through with framing ("Found X in Y...") |
| 100-500 lines | Summarize key points, reference details |
| > 500 lines | Spawn summarizer subagent first |

### Framing Examples

**Good framing:**
"The implementation agent created JWT auth with refresh tokens. Key files: auth.ts, middleware.ts. Verification passed."

**Bad framing:**
"Here's what the agent returned: [500 lines of output]"

## Failure Handling

### Three-Strike Retry Policy

1. **First failure:** Retry with same prompt (transient failure assumption)
2. **Second failure:** Retry with refined prompt (clarity issue assumption)
3. **Third failure:** Escalate to user with failure context

### Timeout Handling

- Do NOT just increase timeout
- Break task into smaller subtasks
- Each subtask should be completable in standard timeout

### Partial Completion Handling

When manifest shows `status: partial`:

```python
continuation_task = manifest.continuation
spawn_subagent(task=continuation_task, context="Continue from previous work")
```

Keep spawning continuations until `status: complete` or failure.

## Parallel Subagent Spawning

For independent work, spawn all subagents in one message:

```typescript
// DO: All Task calls together (parallel execution)
Task({ description: "Part A", prompt: "..." })
Task({ description: "Part B", prompt: "..." })
Task({ description: "Part C", prompt: "..." })

// DON'T: Sequential spawning (wastes time)
const a = await Task({ description: "Part A" })
const b = await Task({ description: "Part B" })
const c = await Task({ description: "Part C" })
```

### When to Parallelize

| Scenario | Parallel? | Why |
|----------|-----------|-----|
| Multiple independent searches | Yes | No dependencies |
| Multiple files to edit | Yes | Different files |
| Implementation + verification | No | Sequential dependency |
| Feature A depends on Feature B | No | Sequential dependency |

## Anti-Patterns

| Don't | Why | Do Instead |
|-------|-----|------------|
| Read files to "understand" before delegating | Wastes main context | Delegate the exploration |
| Make "quick edits" directly | Context rot | Spawn agent even for small changes |
| Pass file contents in prompts | Token waste | Tell subagent WHAT to read |
| Wait for each subagent sequentially | Misses parallelism | All independent Tasks in one message |
| Dump raw subagent output to user | Context pollution | Synthesize key points only |
| Skip verification for "simple" changes | Quality risk | Always verify implementation |
| Retry forever | Resource waste | Three strikes then escalate |

## Main Agent Responsibilities

The coordinator's job is to:

1. **Parse** - Understand what user wants
2. **Route** - Select appropriate subagent type
3. **Decompose** - Break large tasks into subtasks
4. **Spawn** - Launch subagents with proper prompts
5. **Monitor** - Check manifests for completion status
6. **Retry** - Handle failures with refined prompts
7. **Synthesize** - Present results clearly to user

The coordinator does NOT:

- Read files to "understand context"
- Make code changes directly
- Process large amounts of subagent output
- Hold implementation details in context

## Integration

- For status tracking, see [subagent-manifest.md](subagent-manifest.md)
- For prompt templates, see [subagent-prompts/](subagent-prompts/)
- For delegation triggers, see agents/pai-assistant.md "Delegation Decision"

## Quick Reference

```
User request arrives
    |
    v
Is it exploration or implementation?
    |
    +-- Exploration --> Spawn Explore agent
    |                        |
    |                        v
    |                   Read manifest
    |                        |
    |                        v
    |                   Synthesize findings
    |
    +-- Implementation --> Spawn Task agent
                               |
                               v
                          Read manifest
                               |
                               v
                          Spawn Verifier agent
                               |
                               v
                          Pass? --> Synthesize
                          Fail? --> Retry implementation
```
