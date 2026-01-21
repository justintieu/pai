---
name: pai-agents
description: Dynamic agent composition and management system for creating specialized agents with distinct traits, spawning parallel workers, and orchestrating multi-agent tasks. USE WHEN create custom agents, spawn agents, parallel processing, need specialists, compose agent team, launch workers, bulk tasks.
tools: Task
---

# PAI Agents

Dynamic agent composition and management system that handles custom agent creation, trait-based composition, and parallel orchestration.

## Workflows

| Workflow | Use When | Agents | Time |
|----------|----------|--------|------|
| **Create Custom** | Need specialized agents with unique traits | 1-5 | 10-30s |
| **Spawn Parallel** | Bulk processing with generic workers | 3-10 | 20-60s |
| **List Traits** | See available composition options | 0 | Instant |

## Core Concepts

### Agent Types

| Type | When to Use | Traits |
|------|-------------|--------|
| **Custom Agent** | Specialized analysis, unique perspective needed | Varied per agent |
| **Intern Agent** | Parallel grunt work, bulk processing | Shared traits |

**Key distinction:** Custom agents receive unique trait combinations for distinct perspectives; Intern agents use identical configurations for parallel processing efficiency.

### Trait Composition

Agents are composed from three dimensions:

**Expertise (10):** security, legal, finance, medical, technical, research, creative, business, data, communications

**Personality (10):** skeptical, enthusiastic, cautious, bold, analytical, creative, empathetic, contrarian, pragmatic, meticulous

**Approach (8):** thorough, rapid, systematic, exploratory, comparative, synthesizing, adversarial, consultative

## Instructions

### 1. Identify Agent Type

Parse user request for keywords:
- **Custom:** "custom agents", "specialized", "unique perspectives", "varied traits"
- **Parallel:** "launch agents", "spin up", "spawn", "bulk", "interns"
- **Traits:** "list traits", "what traits", "available options"

### 2. Route to Workflow

| Detected Pattern | Workflow |
|------------------|----------|
| Custom + agents | `workflows/create-custom.md` |
| Spawn/launch + agents | `workflows/spawn-parallel.md` |
| List + traits | `workflows/list-traits.md` |

### 3. Execute Workflow

Load and execute the appropriate workflow file.

## Model Selection

| Model | Use For | Speed |
|-------|---------|-------|
| `haiku` | Parallel workers, simple tasks | Fastest |
| `sonnet` | Standard analysis, code review | Balanced |
| `opus` | Deep reasoning, strategic analysis | Thorough |

**Guidance:** Haiku for parallel grunt work (10 haiku agents beats 1 sequential opus).

## Preset Compositions

| Preset | Expertise | Personality | Approach |
|--------|-----------|-------------|----------|
| **Security Audit** | security | skeptical | adversarial |
| **Code Review** | technical | meticulous | systematic |
| **Market Analysis** | business | analytical | comparative |
| **Creative Brief** | creative | enthusiastic | exploratory |
| **Risk Assessment** | finance | cautious | thorough |
| **Red Team** | security | contrarian | adversarial |

## Examples

**Example 1: Custom agents for code review**
```
User: "create custom agents to review this PR from different angles"
Claude: Creates 3 custom agents with varied traits
        - Technical + meticulous + systematic (quality focus)
        - Security + skeptical + adversarial (vulnerability focus)
        - Business + pragmatic + consultative (value focus)
        Time: ~20 seconds
```

**Example 2: Parallel URL validation**
```
User: "spawn agents to check if these 20 URLs are still valid"
Claude: Launches 20 parallel Intern agents with haiku
        Each validates one URL
        Returns consolidated results
        Time: ~15 seconds total
```

**Example 3: Research with varied perspectives**
```
User: "custom agents to research competitor pricing strategies"
Claude: Creates 4 custom agents
        - Research + analytical + thorough
        - Business + bold + comparative
        - Finance + cautious + systematic
        - Data + meticulous + synthesizing
        Time: ~30 seconds
```

**Example 4: List available options**
```
User: "what traits can I use for custom agents?"
Claude: Returns formatted list of all 28 traits across 3 categories
```

## Resources

- [Create Custom workflow](workflows/create-custom.md) - Build specialized agents with unique traits
- [Spawn Parallel workflow](workflows/spawn-parallel.md) - Launch generic workers for bulk tasks
- [List Traits workflow](workflows/list-traits.md) - Display available trait options
