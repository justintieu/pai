---
name: effort-matrix
description: Reference for effort level classification and characteristics.
---

# Effort Matrix

Guide for classifying work into effort levels based on detection signals.

## Five Effort Levels

| Level | Description | Typical ISC Rows |
|-------|-------------|------------------|
| TRIVIAL | Skip formal processing | 0 (direct response) |
| QUICK | Minimal resources | 1-3 |
| STANDARD | Default approach | 5-10 |
| THOROUGH | Extended analysis | 10-25 |
| DETERMINED | Unlimited commitment | 25-100+ |

## Detection Keywords

### TRIVIAL
- "what is", "define", "explain"
- Simple lookups, definitions
- No implementation required

### QUICK
- "quick", "just", "simple", "briefly"
- "real quick", "small change"
- Single-file changes, minor fixes

### STANDARD (Default)
- No explicit signals
- Most implementation requests
- Feature work, bug fixes

### THOROUGH
- "thorough", "thoroughly", "careful"
- "comprehensive", "complete"
- "make sure", "don't miss anything"

### DETERMINED
- "until done", "whatever it takes"
- "critical", "mission-critical"
- "get this right", "perfect"
- "iterate until", "keep trying"

## Capability Access by Level

| Capability | TRIVIAL | QUICK | STANDARD | THOROUGH | DETERMINED |
|------------|---------|-------|----------|----------|------------|
| Direct response | Y | Y | Y | Y | Y |
| Deep thinking | - | - | Y | Y | Y |
| Research | - | - | Y | Y | Y |
| First principles | - | - | - | Y | Y |
| Council debate | - | - | - | Y | Y |
| Parallel execution | - | - | - | Y | Y |
| Adversarial review | - | - | - | - | Y |
| Unlimited iteration | - | - | - | - | Y |

## Trait Modifiers

Each effort level applies behavioral characteristics:

| Level | Traits |
|-------|--------|
| QUICK | Rapid, pragmatic, concise |
| STANDARD | Balanced, thorough, clear |
| THOROUGH | Careful, comprehensive, analytical |
| DETERMINED | Meticulous, adversarial, exhaustive |

## Override Mechanism

Users can manually adjust detected effort:

| Override Phrase | Effect |
|-----------------|--------|
| "do this quickly" | Force QUICK |
| "take your time" | Elevate to THOROUGH |
| "this is critical" | Elevate to DETERMINED |
| "just a quick check" | Force QUICK even if complex |

## Confidence Levels

When classifying effort, report confidence:

| Confidence | Meaning |
|------------|---------|
| HIGH | Clear signals present |
| MEDIUM | Some ambiguity |
| LOW | Defaulting to STANDARD |

## Examples

| Request | Detected Level | Confidence | Reason |
|---------|----------------|------------|--------|
| "Add a logout button" | QUICK | HIGH | Simple, single change |
| "Implement user auth" | STANDARD | HIGH | Multi-step feature |
| "Thoroughly review the payment flow" | THOROUGH | HIGH | Explicit "thoroughly" |
| "Fix this bug, whatever it takes" | DETERMINED | HIGH | "whatever it takes" |
| "Update the config" | STANDARD | LOW | No signals, default |
