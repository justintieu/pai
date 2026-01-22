# Subagent Manifest Protocol

Lightweight status reporting for subagents to communicate completion status without forcing the main agent to fully process responses.

## Problem

When spawning subagents, the main agent has no visibility into:
- Whether the task completed fully or partially
- What work remains if incomplete
- Where to find outputs without reading everything

Loading and processing full subagent output causes **context rot** - polluting the orchestrator with work artifacts it doesn't need for decision-making.

## Solution

Two patterns based on agent capabilities:

| Agent Type | Pattern | How It Works |
|------------|---------|--------------|
| **Read-only** (Explore) | Inline manifest | YAML frontmatter in response |
| **Write-capable** (general-purpose) | File manifest | Separate manifest.yaml file |

---

## Pattern 1: Inline Manifest (Read-Only Agents)

For `Explore` and other read-only subagent types that cannot write files.

### Format

Agent response starts with YAML frontmatter:

```markdown
---
status: complete | partial | failed
summary: "One sentence describing what was accomplished"
continuation: "Next task description if status is partial"
---

[Full findings below...]
```

### Subagent Prompt Template

```markdown
## Output Format
Start your response with this exact format:
\`\`\`
---
status: complete | partial | failed
summary: "One sentence of what you accomplished"
continuation: "What remains" # only if partial
---
\`\`\`
Then provide your findings below.
```

### Main Agent Handling

```python
response = subagent_result
lines = response.split('\n')

# Parse frontmatter (lines between first --- and second ---)
if lines[0] == '---':
    frontmatter_end = lines[1:].index('---') + 1
    manifest = yaml.parse('\n'.join(lines[1:frontmatter_end]))

    if manifest.status == 'partial':
        spawn_continuation(manifest.continuation)
    elif manifest.status == 'complete':
        # Process findings only if needed for synthesis
        findings = '\n'.join(lines[frontmatter_end+1:])
```

**Note:** This doesn't prevent the response from loading into context, but it does let the main agent quickly check status and decide whether to spawn continuations before fully processing.

---

## Pattern 2: File Manifest (Write-Capable Agents)

For `general-purpose` and other agents with Write tool access.

### Manifest Schema

```yaml
# /scratchpad/task-{id}/manifest.yaml
status: complete | partial | failed
summary: "One sentence describing what was accomplished"
continuation: "Next task description if status is partial"
outputs:
  - findings.md
  - data.json
error: "Error message if status is failed"
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `status` | Yes | `complete`, `partial`, or `failed` |
| `summary` | Yes | 1-2 sentence description of work done |
| `continuation` | If partial | What remains to be done (becomes next subagent's task) |
| `outputs` | No | List of output filenames in the task folder |
| `error` | If failed | Error message explaining the failure |

## Directory Convention

```
/scratchpad/
  task-{id}/
    manifest.yaml     # Status file (main agent reads this)
    findings.md       # Work output (only read if needed)
    data.json         # Additional outputs
```

The `{id}` should be a short descriptive slug, e.g., `task-research-kiro`, `task-validate-urls-batch1`.

## For Subagents

Include this in subagent prompts:

```markdown
## Manifest Protocol

Before returning, write a manifest to track your work status:

1. Create folder: `/scratchpad/task-{descriptive-id}/`
2. Write outputs to that folder as you work
3. Write `manifest.yaml` with your final status

**If task is too large:**
- Complete what you can
- Write partial results to outputs
- Set status: partial
- Describe remaining work in continuation field

**Manifest template:**
```yaml
status: complete
summary: "Found 3 primary sources on topic X"
outputs:
  - findings.md
```

**If incomplete:**
```yaml
status: partial
summary: "Analyzed 2 of 5 sources"
continuation: "Analyze remaining sources: [list them]"
outputs:
  - partial-findings.md
```
```

## For Main Agent (Orchestrator)

After subagent returns:

```
1. Read /scratchpad/task-{id}/manifest.yaml
2. Check status:
   - complete → task done, optionally read outputs if synthesis needed
   - partial → spawn continuation subagent with manifest.continuation as task
   - failed → handle error, retry or escalate
3. Do NOT read outputs unless you need to synthesize them
```

### Orchestration Loop

```
while has_pending_work:
    spawn subagent with manifest protocol
    read manifest.yaml

    if status == "complete":
        mark task done
    elif status == "partial":
        spawn new subagent with continuation task
    elif status == "failed":
        handle_error()
```

## Example Flow

```
Main Agent: "Research Kiro's context management philosophy"
    │
    ├─► Spawn Subagent 1
    │   └─► Writes to /scratchpad/task-kiro-research/
    │       ├── manifest.yaml (status: partial, continuation: "analyze docs")
    │       └── initial-findings.md
    │
    ├─► Reads manifest.yaml (50 bytes)
    │   Status: partial → spawn continuation
    │
    ├─► Spawn Subagent 2 (task: "analyze docs")
    │   └─► Writes to /scratchpad/task-kiro-docs/
    │       ├── manifest.yaml (status: complete)
    │       └── analysis.md
    │
    └─► Reads manifest.yaml
        Status: complete → synthesize if needed
```

## Benefits

1. **Context hygiene** - Main agent stays clean, only reads what it needs
2. **Visibility** - Know if work is done without loading everything
3. **Continuation** - Partial work can be continued by new subagents
4. **Debugging** - Manifests provide audit trail of what happened

## Integration with PAI Skills

Skills that spawn subagents should:
1. Include manifest protocol in subagent prompts
2. Check manifests before synthesizing results
3. Handle partial completions with continuation spawns

Update `pai-agents`, `pai-research`, and other multi-agent skills to use this protocol.
