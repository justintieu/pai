---
name: pai-art
description: Visual content generation system for illustrations, diagrams, and data visualizations. Creates consistent, branded editorial artwork using AI image generation. USE WHEN create image, generate illustration, make diagram, visualize data, create flowchart, design infographic, editorial art, blog header, architecture diagram, stat card, framework visualization.
tools: [Read, Write, Bash]
---

# Art Skill

A comprehensive visual content generation system for creating illustrations, diagrams, and visual assets with consistent editorial styling.

## Overview

This skill routes visual content requests to specialized workflows, each optimized for different types of visual output. All generated images follow a cohesive design system emphasizing hand-drawn aesthetics and editorial sophistication.

## Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Light Cream | #F5E6D3 | Default background |
| Deep Purple | #4A148C | Primary accent, critical elements |
| Deep Teal | #00796B | Secondary accent, alternatives |
| Charcoal | #2D2D2D | Text, labels |
| Black | #000000 | Structure, framework lines |
| Burnt Sienna | #8B4513 | Human warmth (essay illustrations) |

### Typography Hierarchy

- **Tier 1 (Headers)**: Elegant wedge-serif italic (Valkyrie-style) - titles, section headers
- **Tier 2 (Labels)**: Geometric sans-serif (Concourse-style) - data labels, node text
- **Tier 3 (Annotations)**: Condensed italic sans-serif - editorial voice, insights

### Visual Aesthetic

The skill emphasizes an **Excalidraw whiteboard sketch aesthetic**:
- Wobbly, asymmetric shapes (never perfect geometry)
- Sketchy arrows with organic curves
- Hand-lettered text with natural imperfections
- Variable line weight throughout
- Professional clarity despite hand-drawn feel

## Workflows

Route requests to the appropriate workflow based on content type:

| Request Type | Workflow | Description |
|--------------|----------|-------------|
| Blog headers, editorial illustrations | `workflows/essay.md` | Charcoal architectural sketches |
| Data visualizations, infographics | `workflows/visualize.md` | Adaptive content visualization |
| Flowcharts, sequence diagrams | `workflows/mermaid.md` | Structured diagrams with sketch style |
| System architecture | `workflows/technical.md` | Clean architect-style diagrams |
| 2x2 matrices, mental models | `workflows/frameworks.md` | Conceptual framework diagrams |
| Statistics, number highlights | `workflows/stats.md` | Single-statistic visual cards |

## Instructions

1. **Understand the request**: Identify what type of visual content is needed
2. **Select workflow**: Route to the appropriate specialized workflow
3. **Gather context**: Collect necessary information (content, topic, style preferences)
4. **Execute workflow**: Follow the selected workflow's instructions
5. **Validate output**: Ensure design system compliance and quality

## Quick Reference

### When to Use Each Workflow

**Essay** - When you need:
- Blog post header images
- Editorial illustrations for articles
- Visual metaphors for concepts

**Visualize** - When you need:
- Infographics with multiple data points
- Charts and graphs with editorial styling
- Complex information displays

**Mermaid** - When you need:
- Flowcharts and process diagrams
- Sequence diagrams
- State machines
- Entity relationship diagrams

**Technical** - When you need:
- System architecture diagrams
- Component diagrams
- Infrastructure visualizations

**Frameworks** - When you need:
- 2x2 matrices
- Venn diagrams
- Conceptual maps
- Mental model visualizations

**Stats** - When you need:
- Single statistic highlight cards
- Newsletter number visuals
- Social media stat graphics

## Examples

### Example 1: Blog Header Request
```
User: Create a header image for my article about AI replacing jobs

Route to: workflows/essay.md
Context: Article about AI job displacement, need visual metaphor
```

### Example 2: Architecture Diagram
```
User: I need a diagram showing our microservices architecture

Route to: workflows/technical.md
Context: System components and their relationships
```

### Example 3: Framework Visualization
```
User: Create a 2x2 matrix comparing build vs buy decisions

Route to: workflows/frameworks.md
Context: Decision framework with axes and quadrants
```

## Notes

- All workflows emphasize the hand-drawn aesthetic while maintaining professional clarity
- Color should be used sparingly (80% greyscale, 10-15% accent colors)
- Every visual should make its primary message "visible at a glance"
- Validate all outputs against the design system before delivery
