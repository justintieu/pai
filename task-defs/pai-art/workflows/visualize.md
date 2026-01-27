---
name: visualize
description: Adaptive content visualization for infographics, charts, and complex data displays. USE WHEN infographic, data visualization, chart, graph, complex information display.
---

# Visualize Workflow

An intelligent visualization orchestrator that analyzes content and selects optimal visualization strategies.

## Core Process

```
ANALYZE -> STRATEGIZE -> DESIGN -> PROMPT -> GENERATE -> VALIDATE
```

## When to Use

Use this workflow when you have:
- Multidimensional content needing visual representation
- Data that could be visualized multiple ways
- Complex information requiring sophisticated presentation
- Infographics combining multiple element types

## Instructions

### Step 1: Deep Content Analysis

Analyze the content to identify:
- **Information types**: Numbers, comparisons, processes, relationships
- **Communication goals**: Inform, persuade, compare, explain
- **Audience context**: Technical level, familiarity with topic
- **Complexity level**: Simple (1-3 points) to complex (7+ elements)

### Step 2: Strategy Selection

Choose visualization approach based on analysis:

| Strategy | When to Use |
|----------|-------------|
| Single-mode | One clear data type, simple message |
| Hybrid (2-3 elements) | Related data types, moderate complexity |
| Multi-panel | Multiple distinct but connected visualizations |

### Step 3: Design Composition

**Layout Planning**:
- Establish visual hierarchy (what should viewers see first?)
- Plan spatial arrangement
- Determine typography tiers needed

**Aesthetic Requirements** (Excalidraw whiteboard style):
- Wobbly boxes, sketchy lines
- Imperfect shapes that feel hand-drawn
- NOT polished digital precision

**Color Strategy**:
- Background: Light Cream (#F5E6D3) - white only if explicitly requested
- Structure: Black (#000000)
- Critical elements: Deep Purple (#4A148C)
- Secondary highlights: Deep Teal (#00796B)
- Text: Charcoal (#2D2D2D)

**Typography Tiers**:
- **Tier 1**: Elegant serif italic for titles (Valkyrie-style, left-justified)
- **Tier 2**: Geometric sans for labels and data (Concourse-style)
- **Tier 3**: Condensed italic for annotations and editorial voice (Advocate-style)

### Step 4: Construct Prompt

Build comprehensive generation prompt:

```
[Visualization type and overall concept]
[Specific data/content to display]
[Excalidraw whiteboard sketch aesthetic - hand-drawn, imperfect geometry]
[Light cream (#F5E6D3) background]
[Color strategy: black structure, purple critical, teal secondary, charcoal text]
[Three-tier typography: serif headers, sans labels, condensed annotations]
[Wobbly lines, sketchy arrows, organic feel]
```

### Step 5: Generate Image

Parameters:
- Model: Prefer models with strong text rendering
- Aspect ratio: Based on content (16:9 for presentations, 1:1 for social)
- Resolution: 1024px minimum on shortest side

### Step 6: Comprehensive Validation

**Information Effectiveness**:
- [ ] Key message is immediately clear
- [ ] Data is accurately represented
- [ ] Hierarchy guides viewing order

**Design Quality**:
- [ ] Hand-drawn aesthetic achieved
- [ ] Color discipline maintained (mostly greyscale with accent)
- [ ] Typography tiers are distinct

**Technical Execution**:
- [ ] Text is legible
- [ ] Elements are distinguishable
- [ ] Composition is balanced

## Examples

### Example 1: Comparison Infographic

**Content**: Comparing three approaches to a problem

**Strategy**: Hybrid - use columns/cards with icons and text

**Composition**:
- Three columns, cream background
- Each with icon (sketchy style), heading, bullet points
- Purple highlights for recommended option

### Example 2: Process Flow

**Content**: 5-step process explanation

**Strategy**: Single-mode flow diagram with infographic styling

**Composition**:
- Horizontal flow with numbered sketchy circles
- Connecting wobbly arrows
- Brief text labels under each step
- Purple accent on final outcome

### Example 3: Data Dashboard

**Content**: Multiple metrics needing display

**Strategy**: Multi-panel with unified styling

**Composition**:
- Grid of small visualizations
- Consistent sketch aesthetic across all
- Color coding to group related metrics

## Anti-Patterns

- Over-polished digital look
- Too many colors (stick to palette)
- Cluttered compositions without clear hierarchy
- Perfect geometric shapes (embrace imperfection)
- White backgrounds (use cream unless specified)
