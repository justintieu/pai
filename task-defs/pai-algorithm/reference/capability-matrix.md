---
name: capability-matrix
description: Reference for capabilities unlocked at each effort level.
---

# Capability Matrix

Capabilities unlocked at each effort level.

## Capability Overview

| Level | Available Capabilities |
|-------|------------------------|
| TRIVIAL | Direct response only |
| QUICK | Direct implementation, basic verification |
| STANDARD | Deep thinking, single research query, systematic approach |
| THOROUGH | Council debate, parallel execution, first principles, multiple research |
| DETERMINED | Unlimited iteration, adversarial review, all capabilities |

## Detailed Capability Descriptions

### Direct Response
- Immediate answer without structured execution
- Used for definitions, explanations, simple lookups
- Available: All levels

### Direct Implementation
- Standard coding without extended analysis
- Sequential execution of straightforward tasks
- Available: QUICK+

### Deep Thinking
- Extended reasoning on complex decisions
- Working through implications systematically
- Available: STANDARD+

### Research
- Query external information sources
- Gather context, best practices, documentation
- Available: STANDARD+ (single query), THOROUGH+ (multiple)

### First Principles Analysis
- Challenge assumptions using pai-firstprinciples skill
- Deconstruct problems to fundamentals
- Available: THOROUGH+

### Council Debate
- Multi-perspective analysis using pai-council skill
- 4-7 specialized agents debate tradeoffs
- Available: THOROUGH+

### Parallel Execution
- Execute independent ISC rows simultaneously
- Maximum parallel tasks by level:
  - THOROUGH: 3-5 concurrent
  - DETERMINED: 5-10 concurrent
- Available: THOROUGH+

### Adversarial Review
- Actively attempt to break solutions
- Red team perspective on critical paths
- Challenge assumptions aggressively
- Available: DETERMINED only

### Unlimited Iteration
- Continue until success criteria met
- No arbitrary stopping point
- "Until done" mentality
- Available: DETERMINED only

## Capability Categories

### Thinking Modes
| Mode | Description | Effort |
|------|-------------|--------|
| Standard | Normal reasoning | All |
| Deep | Extended systematic thinking | STANDARD+ |
| First principles | Fundamental analysis | THOROUGH+ |
| Adversarial | Active challenge | DETERMINED |

### Analysis Tools
| Tool | Description | Effort |
|------|-------------|--------|
| Research | External information | STANDARD+ |
| Council | Multi-perspective | THOROUGH+ |
| Tree of thought | Branching exploration | THOROUGH+ |

### Execution Modes
| Mode | Description | Effort |
|------|-------------|--------|
| Sequential | One row at a time | All |
| Parallel | Independent rows concurrent | THOROUGH+ |
| Iterative | Repeat until success | DETERMINED |

## Usage Guidelines

### When to Escalate Capability

| Situation | Consider |
|-----------|----------|
| Architecture decision | Council debate |
| Assumption feels wrong | First principles |
| Need external context | Research |
| Critical path | Adversarial review |
| Complex with independence | Parallel execution |

### When NOT to Use Capabilities

| Capability | Skip When |
|------------|-----------|
| Council | Decision is clear, low stakes |
| First principles | Problem well-understood |
| Research | Internal knowledge sufficient |
| Parallel | Dependencies unclear |
| Adversarial | Non-critical, time-pressured |

## Override Syntax

Force specific capabilities regardless of effort level:

| Request | Effect |
|---------|--------|
| "use council for this" | Enable council debate |
| "think from first principles" | Enable first principles |
| "research this" | Enable research |
| "be adversarial about this" | Enable adversarial review |
