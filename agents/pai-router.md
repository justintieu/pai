# PAI Task Router

> **Load on demand** - This file contains the full routing catalog. Only load when `task-defs/index.md` doesn't provide enough detail.

## Invocation Patterns

**Skill tool** (pai-orchestrate only):
```
Skill(skill: "pai-orchestrate", args: "[task description]")
```

**Task pattern** (everything else):
```
1. Read: ~/.pai/task-defs/{name}/SKILL.md
2. Spawn Task with SKILL.md content + user request
```

## Full Routing Catalog

### Reasoning & Analysis

| Patterns | Task-Def | Invocation |
|----------|----------|------------|
| "question assumptions", "costs too high", "rethink from scratch", "first principles" | `pai-firstprinciples` | Task |
| "multiple perspectives", "debate this", "review decision", "architectural review" | `pai-council` | Task |
| "stress test", "find flaws", "attack this idea", "counterarguments", "red team" | `pai-redteam` | Task |
| "complex task", "execute thoroughly", "systematic approach", "run the algorithm" | `pai-algorithm` | Task |

### Research & Intelligence

| Patterns | Task-Def | Invocation |
|----------|----------|------------|
| "research", "find out about", "investigate topic", "look into", "learn about" | `pai-research` | Task |
| "OSINT", "background check", "due diligence", "vet company", "research person" | `pai-osint` | Task |
| "recon", "map infrastructure", "enumerate subdomains", "scan target" | `pai-recon` | Task |
| "annual reports", "security reports", "threat intelligence", "vendor reports" | `pai-annualreports` | Task |

### Development & Code

| Patterns | Task-Def | Invocation |
|----------|----------|------------|
| "implement feature", "add feature", "build feature", "refactor", "multi-file change" | `pai-orchestrate` | **Skill** |
| "understand codebase", "index project", "new project", "find what to change" | `pai-codebase` | Task |
| "create cli", "build command-line tool", "typescript cli", "wrap api" | `pai-createcli` | Task |
| "create prompt", "improve prompt", "prompt engineering" | `pai-prompting` | Task |

### Web & Scraping

| Patterns | Task-Def | Invocation |
|----------|----------|------------|
| "browse website", "take screenshot", "fill form", "click button" | `pai-browser` | Task |
| "scrape URL", "can't access site", "bot detection", "403 error", "CAPTCHA" | `pai-brightdata` | Task |

### Visual & Creative

| Patterns | Task-Def | Invocation |
|----------|----------|------------|
| "create image", "generate illustration", "make diagram", "visualize data" | `pai-art` | Task |

### Context & Memory

| Patterns | Task-Def | Invocation |
|----------|----------|------------|
| "archive session", "save context", "extract decisions", "context getting long" | `pai-historian` | Task |
| "setup PAI", "define goals", "track goals", "update beliefs", "reflect on life" | `pai-telos` | Task |
| "new workspace", "project context", "organize work" | `pai-workspace` | Task |
| "starting session", "ending session", "work history", "daily log" | `pai-work-status` | Task |

### PAI Infrastructure

| Patterns | Task-Def | Invocation |
|----------|----------|------------|
| "improve PAI", "update PAI", "add skill to PAI", "modify context" | `pai-improve` | Task |
| "create skill", "new skill", "scaffold skill" | `pai-createskill` | Task |
| "validate skill", "check skill", "fix skill" | `pai-validate` | Task |
| "integrity check", "system health", "secret scan" | `pai-system` | Task |

### Utility

| Patterns | Task-Def | Invocation |
|----------|----------|------------|
| "spawn agents", "parallel processing", "need specialists", "compose agent team" | `pai-agents` | Task |
| "remind me", "notify me in", "set reminder", "timer" | `pai-remind` | Task |

### PAI File Operations

| Patterns | Task-Def | Model | Invocation |
|----------|----------|-------|------------|
| Quick lookups, status checks, file reads | `pai-reader` | haiku | Task |
| Work status updates, learnings, decisions | `pai-logger` | sonnet | Task |
| Goals, beliefs, strategies, identity changes | `pai-editor` | opus | Task |

## Multi-Task Sequences

Some tasks need multiple capabilities in sequence:

| User Intent | Sequence |
|-------------|----------|
| "Research X then implement" | `pai-research` → `pai-codebase` → `pai-orchestrate` |
| "Build and validate" | `pai-orchestrate` → `pai-council` → `pai-redteam` |
| "Rethink then build" | `pai-firstprinciples` → `pai-research` → `pai-orchestrate` |
| "Investigate and archive" | `pai-research` → `pai-historian` |

## Examples

**Wrong:** User says "question whether we really need microservices" → You manually analyze
**Right:** User says "question whether we really need microservices" → Read `task-defs/pai-firstprinciples/SKILL.md`, spawn Task

**Wrong:** User says "this conversation is getting long, save the key decisions" → You summarize inline
**Right:** User says "this conversation is getting long, save the key decisions" → Read `task-defs/pai-historian/SKILL.md`, spawn Task

**Wrong:** User says "implement a dark mode toggle" → You read files and edit directly
**Right:** User says "implement a dark mode toggle" → `Skill(skill: "pai-orchestrate", args: "implement dark mode toggle")`

---

*When in doubt, check `task-defs/index.md` for the authoritative trigger list.*
