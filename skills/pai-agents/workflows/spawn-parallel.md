# Spawn Parallel Agents Workflow

Launch multiple generic Intern agents simultaneously for parallel processing tasks.

## Configuration

- **Agents:** 3-20 (all execute in parallel)
- **Model:** haiku (optimal for parallel work)
- **Target time:** 20-60 seconds
- **Timeout:** 5 minutes
- **Protocol:** [Subagent Manifest](/protocols/subagent-manifest.md)

## Trigger Recognition

Use this workflow when someone says:
- "launch agents to research"
- "spin up agents to process"
- "spawn agents to analyze"
- "use interns to check"

**Key:** No "custom" keyword present.

## Process

### Step 1: Extract Task List

Identify what needs parallel processing:
- URLs to validate
- Files to analyze
- Items to research
- Checks to perform

### Step 2: Create Detailed Prompts

Give each agent full context and success criteria.

**Good prompt:**
```
Check if this URL returns 200 OK: [url]
Report: URL, status code, redirect chain (if any), final destination
```

**Bad prompt:**
```
Check this URL: [url]
```

### Step 3: Launch All Agents in One Message

**Critical:** Send all Task calls together for true parallel execution.

Each prompt should include the **manifest protocol** for status tracking:

```typescript
// DO THIS - all in one message
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Intern 1 - [task summary]",
  prompt: `[Full task context and success criteria]

## Manifest Protocol
Write status to /scratchpad/task-intern-1/manifest.yaml:
- status: complete | partial | failed
- summary: "One sentence of what you accomplished"
- outputs: [list of files you created]
If incomplete, include: continuation: "What remains to do"
`
})

Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "Intern 2 - [task summary]",
  prompt: `[Full task context and success criteria]

## Manifest Protocol
Write status to /scratchpad/task-intern-2/manifest.yaml:
- status: complete | partial | failed
- summary: "One sentence of what you accomplished"
- outputs: [list of files you created]
If incomplete, include: continuation: "What remains to do"
`
})
// Continue for all tasks
```

**Never do this:**
```typescript
// DON'T - sequential execution blocks parallelism
const result1 = await Task(...)
const result2 = await Task(...)
```

### Step 4: Read Manifests First

After all agents complete, read manifests before loading full results:

```bash
# Check all manifests
cat /scratchpad/task-intern-*/manifest.yaml
```

For each manifest:
- `complete` → Ready for synthesis
- `partial` → Spawn continuation subagent with `continuation` field as task
- `failed` → Log error, decide whether to retry

**Only read full outputs after confirming status.** This keeps your context clean.

### Step 5: Collect & Spotcheck Results

After confirming all tasks complete via manifests:

1. **Aggregate results** into consistent format
2. **Spotcheck** - Randomly verify 10-20% of results manually
3. **Flag anomalies** - Unexpected results, failures, outliers

```markdown
## Parallel Processing Results

**Task:** [Description]
**Agents:** [count] Interns (haiku)
**Time:** [Xs]
**Success rate:** [X/Y]

---

### Results

| Item | Status | Notes |
|------|--------|-------|
| [item1] | [pass/fail] | [details] |
| [item2] | [pass/fail] | [details] |
...

### Spotcheck
[X of Y spotchecked items verified correct]

### Anomalies
[List any failures or unexpected results]
```

## Model Selection

| Task Type | Model | Rationale |
|-----------|-------|-----------|
| URL validation | haiku | Simple checks |
| Basic research | haiku | Fast lookups |
| Code review | sonnet | Needs reasoning |
| Complex analysis | sonnet/opus | Depth required |

**Rule of thumb:** If the task has a clear yes/no or simple output, use haiku. 10 haiku agents finish faster than 1 sequential sonnet.

## Common Mistakes to Avoid

| Mistake | Why It's Bad | Solution |
|---------|--------------|----------|
| Sequential await | Blocks parallelism | All Tasks in one message |
| Skip spotchecking | Undetected errors | Always verify sample |
| Opus for simple tasks | Slow, wasteful | Use haiku |
| Vague prompts | Inconsistent outputs | Define success criteria |

## When to Use

- Batch URL validation
- Parallel file processing
- Research across multiple sources
- Data validation at scale
- Any "embarrassingly parallel" task

## When NOT to Use

- Tasks requiring unique perspectives (use Create Custom)
- Tasks with dependencies between items
- Tasks requiring deep reasoning on each item (consider sonnet)
