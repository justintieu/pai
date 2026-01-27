# Task Definitions

PAI capabilities invoked via the Task tool. These used to be called "skills" (in `skills/`) and "agent-defs" (in `agent-defs/`, now deleted).

## How It Works

### Invocation Pattern

1. **Read** the task definition from this directory
2. **Spawn a Task** with that content + user request
3. **Task writes manifest** to scratchpad, returns results

```
# Example: Invoke pai-research
1. Read: task-defs/pai-research/SKILL.md
2. Spawn Task with:
   - Prompt: [SKILL.md content]
   - Args: "Research quantum computing"
3. Task executes, writes manifest to /scratchpad/task-{id}/manifest.yaml
4. Check manifest for status (complete/partial/failed)
```

### Manifest Protocol

Tasks report completion status via the **Subagent Manifest Protocol**.

See: **[../protocols/subagent-manifest.md](../protocols/subagent-manifest.md)**

Key fields:
- `status`: complete | partial | failed
- `summary`: One sentence description
- `continuation`: What remains (if partial)
- `outputs`: List of output files

## Available Task Definitions

### Reasoning & Analysis
| Task | Description |
|------|-------------|
| [pai-firstprinciples](pai-firstprinciples/SKILL.md) | Deconstruct to fundamentals, challenge assumptions, reconstruct |
| [pai-council](pai-council/SKILL.md) | Multi-agent debate for decisions and reviews |
| [pai-redteam](pai-redteam/SKILL.md) | Adversarial analysis with parallel agents |
| [pai-algorithm](pai-algorithm/SKILL.md) | Structured scientific methodology execution |

### Research & Intelligence
| Task | Description |
|------|-------------|
| [pai-research](pai-research/SKILL.md) | Multi-source research with parallel agents |
| [pai-osint](pai-osint/SKILL.md) | Open source intelligence gathering |
| [pai-recon](pai-recon/SKILL.md) | Security reconnaissance and mapping |
| [pai-annualreports](pai-annualreports/SKILL.md) | Aggregate 570+ security vendor reports |

### Development & Code
| Task | Description |
|------|-------------|
| [pai-codebase](pai-codebase/SKILL.md) | Index and understand codebases |
| [pai-createcli](pai-createcli/SKILL.md) | Generate TypeScript CLI tools |
| [pai-prompting](pai-prompting/SKILL.md) | Prompt engineering and optimization |
| [pai-createskill](pai-createskill/SKILL.md) | Create new PAI skills |
| [pai-validate](pai-validate/SKILL.md) | Validate PAI skills |

### Web & Scraping
| Task | Description |
|------|-------------|
| [pai-browser](pai-browser/SKILL.md) | Browser automation with Playwright |
| [pai-brightdata](pai-brightdata/SKILL.md) | Progressive URL scraping with fallback |

### Visual & Creative
| Task | Description |
|------|-------------|
| [pai-art](pai-art/SKILL.md) | Illustrations, diagrams, data visualizations |

### Context & Memory
| Task | Description |
|------|-------------|
| [pai-historian](pai-historian/SKILL.md) | Archive sessions, extract decisions |
| [pai-telos](pai-telos/SKILL.md) | Life OS: goals, beliefs, alignment |
| [pai-workspace](pai-workspace/SKILL.md) | Project-specific context management |
| [pai-work-status](pai-work-status/SKILL.md) | Work tracking and daily logs |

### PAI Infrastructure
| Task | Description |
|------|-------------|
| [pai-improve](pai-improve/SKILL.md) | Self-improvement of PAI repo |
| [pai-system](pai-system/SKILL.md) | System health and integrity |

### Utility
| Task | Description |
|------|-------------|
| [pai-agents](pai-agents/SKILL.md) | Dynamic agent composition |
| [pai-remind](pai-remind/SKILL.md) | Scheduled reminders |

### Sub-Agent Definitions (Lightweight)
Single-file task definitions for common operations:

| File | Purpose |
|------|---------|
| [pai-reader.md](pai-reader.md) | Read-only PAI file lookups |
| [pai-logger.md](pai-logger.md) | Memory and learning updates |
| [pai-editor.md](pai-editor.md) | Core context modifications |
| [pai-scout.md](pai-scout.md) | Codebase exploration |
| [pai-porter.md](pai-porter.md) | Code porting tasks |

## Structure

Each task definition directory contains:
- `SKILL.md` - Main definition (required)
- `workflows/` - Optional: multi-step procedures
- `tools/` - Optional: utility scripts
- `reference/` - Optional: detailed documentation

Single-file definitions (e.g., `pai-reader.md`) are for simple sub-agents.

## Adding New Task Definitions

1. Create directory: `mkdir task-defs/my-task`
2. Copy template: `cp task-defs/_template/SKILL.template task-defs/my-task/SKILL.md`
3. Edit `SKILL.md` with your content
4. Update this README

PAI-related tasks should be prefixed with `pai-` (e.g., `pai-my-task`).

## Migration Note

This directory consolidates:
- Former `skills/` directory content (except pai-orchestrate)
- Former `agent-defs/` directory content (deleted)

The only true Skill (invoked via Skill tool) is **pai-orchestrate** in `../skills/`.
