# Tree Orchestration Protocol

Recursive agent decomposition for context-efficient task execution. Agents spawn agents until reaching leaf nodes, then synthesize results bottom-up.

## Core Principle

**Main agent never does the work.** It understands the request, spawns a root agent, and waits for completion. All exploration, analysis, and execution happens in the tree.

## Pattern

```
USER REQUEST
     │
     ▼
MAIN AGENT (Atlas)
  - Parse request
  - Spawn root agent
  - Wait for "done"
  - Present result to user
     │
     ▼
ROOT AGENT
  - Decompose task
  - Spawn child agents (parallel)
  - Wait for children
  - Synthesize results
  - Report to parent
     │
     ├──► CHILD AGENT A ──► grandchildren... ──► synthesize up
     ├──► CHILD AGENT B ──► grandchildren... ──► synthesize up
     └──► CHILD AGENT C ──► grandchildren... ──► synthesize up
```

## Traversal

| Phase | Direction | Parallelism |
|-------|-----------|-------------|
| **Spawn** | Top-down (BFS) | All siblings spawn in parallel |
| **Execute** | Leaves work | Maximum parallelism at leaf level |
| **Synthesize** | Bottom-up | As children complete, parent synthesizes |

## Agent Decision Logic

Every agent asks: **"Can I do this alone, or decompose?"**

```
if task_is_atomic:
    # I'm a leaf - do the work
    execute_task()
    write_manifest(status: complete, summary: "...")
else:
    # I'm a branch - decompose
    children = decompose_task()
    spawn_all(children)  # parallel
    wait_for_all()
    synthesize(child_summaries)
    write_manifest(status: complete, summary: "...")
```

### Decomposition Heuristics

**For code tasks:**
- Feature → Areas of impact (API, UI, DB, tests)
- Area → Directories within that area
- Directory → Files within that directory
- File → Single file (leaf)

**For research tasks:**
- Topic → Sub-topics or sources
- Source → Specific documents or sections
- Section → Atomic analysis unit (leaf)

**Rule of thumb:** If you'd read 2+ files or search multiple locations, decompose.

## Scratchpad Structure

```
/scratchpad/
  tree-{root-id}/
    manifest.yaml           # Root manifest
    area-api/
      manifest.yaml         # Area manifest
      handlers/
        manifest.yaml       # Directory manifest
        login.md            # Leaf output
        logout.md           # Leaf output
      synthesized.md        # Area synthesis
    area-ui/
      manifest.yaml
      ...
    final.md                # Root synthesis (user sees this)
```

## Manifest Schema (Extended)

```yaml
# /scratchpad/tree-{id}/area-api/manifest.yaml
status: complete | partial | failed | waiting
summary: "One sentence describing what was accomplished"
depth: 2                    # Distance from root
parent: tree-{id}           # Parent folder
children:                   # Only for branch nodes
  - handlers/
  - middleware/
children_status:            # Tracking
  handlers/: complete
  middleware/: complete
outputs:
  - synthesized.md          # This level's synthesis
continuation: "..."         # If partial
error: "..."                # If failed
```

### Status Values

| Status | Meaning |
|--------|---------|
| `waiting` | Spawned children, waiting for completion |
| `complete` | All children done, synthesis complete |
| `partial` | Some children done, work remains |
| `failed` | Error occurred, see `error` field |

## Synthesis Protocol

Each branch agent produces a synthesis from its children:

1. **Collect** - Read each child's `manifest.yaml` summary
2. **Aggregate** - Combine insights/changes from all children
3. **Synthesize** - Produce coherent output for this level
4. **Report** - Write own manifest with summary for parent

**Synthesis gets progressively more abstract up the tree:**
- Leaf: "Modified login.ts to add JWT validation"
- Directory: "Updated auth handlers to support JWT across login/logout/refresh"
- Area: "API layer now supports JWT authentication with middleware validation"
- Root: "Added user authentication with JWT tokens, covering API, UI, and tests"

## Main Agent Behavior

Atlas uses tree orchestration by default for non-trivial tasks:

```markdown
## When to Use Tree Orchestration

ALWAYS spawn a root agent when:
- Task involves multiple files
- Task requires exploration before execution
- Task spans multiple areas/concerns
- Task is a feature, not a fix

DO NOT use tree orchestration for:
- Single file, known location edits
- Running explicit user commands
- Answering questions from memory
- Simple clarifications
```

### Atlas Workflow

```
1. User: "Add user authentication"

2. Atlas thinks:
   - This spans multiple areas (API, UI, DB, tests)
   - Use tree orchestration

3. Atlas spawns root agent:
   Task(
     prompt: "Implement user authentication. Use tree orchestration protocol.
              Decompose by area, then by directory, then by file.
              Write final synthesis to /scratchpad/tree-auth/final.md",
     subagent_type: "general-purpose"
   )

4. Atlas waits for completion

5. Atlas reads /scratchpad/tree-auth/final.md

6. Atlas presents to user:
   "Authentication implemented. Here's the summary: [final.md contents]"
```

## Benefits

1. **Context isolation** - Main agent stays clean, only sees final summary
2. **Maximum parallelism** - All siblings spawn simultaneously
3. **Natural decomposition** - Mirrors code/problem structure
4. **Incremental synthesis** - Each level summarizes, abstractions bubble up
5. **Fault isolation** - Failed branch doesn't pollute other branches
6. **Resumability** - Partial trees can be continued from manifests

## Integration with Existing Protocols

- Extends `subagent-manifest.md` with tree-specific fields
- Each node follows manifest protocol for status reporting
- Synthesis outputs follow same pattern as leaf outputs

## Example: Feature Implementation

```
User: "Add dark mode toggle to settings"

Atlas spawns:
  Root Agent: "Implement dark mode toggle"
    │
    ├─► UI Agent: "Dark mode UI components"
    │       ├─► components/settings/ Agent
    │       │       ├─► ToggleSwitch.tsx (leaf)
    │       │       └─► ThemePreview.tsx (leaf)
    │       │       └─► Synthesize: "Added toggle and preview components"
    │       ├─► components/layout/ Agent
    │       │       └─► ThemeProvider.tsx (leaf)
    │       │       └─► Synthesize: "Added context provider for theme"
    │       └─► Synthesize: "UI supports theme switching via toggle in settings"
    │
    ├─► State Agent: "Dark mode state management"
    │       └─► store/theme.ts (leaf)
    │       └─► Synthesize: "Added theme slice with persist"
    │
    ├─► Styles Agent: "Dark mode CSS variables"
    │       └─► styles/themes/ Agent
    │               ├─► light.css (leaf)
    │               └─► dark.css (leaf)
    │               └─► Synthesize: "CSS custom properties for both themes"
    │       └─► Synthesize: "Theme system uses CSS variables"
    │
    └─► Synthesize: "Dark mode implemented with toggle in settings,
                     persisted theme preference, CSS variable theming"

Atlas reads final synthesis, presents to user.
```

## Notes

- Depth is dynamic, determined by problem structure
- Leaf granularity: 1 agent = 1 file (for code) or 1 atomic unit (for research)
- Synthesis happens as soon as all children complete (not waiting for whole tree)
- Branch agents can spawn children in parallel within their subtree
