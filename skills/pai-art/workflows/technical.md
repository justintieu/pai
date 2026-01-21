---
name: technical
description: Clean architect-style technical diagrams for system architectures and presentations. USE WHEN architecture diagram, system diagram, component diagram, infrastructure visualization, technical presentation.
---

# Technical Diagram Workflow

Generate professional technical diagrams with architect-style aesthetics for system architectures and technical presentations.

## Core Process

```
ANALYZE -> COMPOSE -> PROMPT -> GENERATE -> VALIDATE
```

## Instructions

### Step 1: Content Analysis

Identify:
- **System scope**: What system/architecture is being documented?
- **Key components**: What are the main elements?
- **Relationships**: How do components connect?
- **Key insights**: What 1-3 points should stand out?

### Step 2: Mental Composition

**Visual Layout**:
- Plan component placement for clarity
- Identify flow direction (left-to-right, top-to-bottom)
- Group related components
- Determine hierarchy (core vs. peripheral)

**Background** (mandatory):
```
Pure sepia #EAE9DF background
NO grid lines
NO texture
NO decorations
```

**Color Strategy** (10-15% of design max):
- Deep Purple (#4A148C): Primary accent
- Deep Teal (#00796B): Secondary accent
- 80% of design should be greyscale/neutral

### Step 3: Typography System

**Three Tiers** (all mandatory):

| Tier | Style | Color | Use |
|------|-------|-------|-----|
| Headers | Elegant wedge-serif italic | Black | Section titles, component names |
| Labels | Geometric sans-serif | Charcoal | Connection labels, descriptions |
| Insights | Condensed italic sans-serif | Purple | Key callouts (surrounded by asterisks) |

**Insight Format**: `*Key insight text here*`

### Step 4: Construct Prompt

```
Technical architecture diagram showing [system/concept]
Components: [list main components]
Relationships: [describe how they connect]

Visual requirements:
- Pure sepia (#EAE9DF) background, NO grid lines or texture
- Hand-drawn Excalidraw aesthetic with architect precision
- Clean, non-cartoony technical styling
- 80% greyscale, accent colors (purple #4A148C, teal #00796B) only 10-15%

Typography:
- Headers in elegant wedge-serif italic, black
- Labels in geometric sans-serif, charcoal
- 1-3 key insights in condensed italic purple, marked with asterisks

[Specific layout guidance for this diagram]
```

### Step 5: Generate

Parameters:
- Aspect ratio: Typically 16:9 for presentations, 4:3 for documentation
- Resolution: 1024px+ for clarity
- Model: Prefer models handling text well

### Step 6: Validate

**Background Check**:
- [ ] Sepia (#EAE9DF) background present
- [ ] NO grid lines visible
- [ ] NO texture or decorations

**Typography Check**:
- [ ] Three-tier hierarchy visible
- [ ] Headers are serif italic
- [ ] Labels are sans-serif
- [ ] Insights are condensed italic in purple

**Design Check**:
- [ ] Technical precision maintained
- [ ] Hand-drawn aesthetic (not clipart)
- [ ] Color used sparingly (10-15% max)
- [ ] Non-cartoony styling

**Content Check**:
- [ ] All key components included
- [ ] Relationships clearly shown
- [ ] 1-3 insights highlighted

## Examples

### Example 1: Microservices Architecture

**Components**: API Gateway, Auth Service, User Service, Order Service, Database cluster

**Layout**: Left-to-right flow from client to services to data

**Insights**:
- *Auth validates every request*
- *Services communicate via message queue*

### Example 2: CI/CD Pipeline

**Components**: Git repo, Build stage, Test stage, Deploy stages (dev/staging/prod)

**Layout**: Horizontal pipeline flow

**Insights**:
- *Automated tests gate all deployments*
- *Rollback available at each stage*

### Example 3: Data Flow Architecture

**Components**: Data sources, ETL, Data lake, Processing, Analytics, Dashboards

**Layout**: Top-to-bottom data flow

**Insights**:
- *Raw data preserved in lake*
- *Transformations are idempotent*

## Anti-Patterns

- White or colored backgrounds (use sepia only)
- Grid lines or decorative elements
- Cartoony or clipart-style icons
- Over-saturated colors
- Missing typography hierarchy
- More than 3 key insights (keep focused)
- Too much accent color (stay under 15%)
