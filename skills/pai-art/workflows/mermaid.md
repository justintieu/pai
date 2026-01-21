---
name: mermaid
description: Hand-drawn technical diagrams combining structured grammar with sketch aesthetics. USE WHEN flowchart, sequence diagram, state machine, process flow, entity relationship diagram, git graph.
---

# Mermaid Diagram Workflow

Create hand-drawn technical diagrams that combine structured diagram concepts with Excalidraw's sketchy whiteboard aesthetic.

## Core Process

```
ANALYZE -> SELECT TYPE -> EXTRACT -> DESIGN -> PROMPT -> GENERATE -> VALIDATE
```

## Diagram Types

| Type | Use Case | Key Elements |
|------|----------|--------------|
| Flowchart | Decision processes, workflows | Nodes, arrows, decision diamonds |
| Sequence | Interactions over time | Actors, messages, lifelines |
| State | System states and transitions | States, events, guards |
| Class | Object relationships | Classes, inheritance, associations |
| ER | Data models | Entities, relationships, cardinality |
| Gantt | Timelines, schedules | Tasks, durations, dependencies |
| Git Graph | Branch histories | Commits, branches, merges |

## Instructions

### Step 1: Analyze Content

Identify:
- What process/system needs diagramming?
- What are the key components?
- What relationships need showing?
- What is the narrative flow?

### Step 2: Select Diagram Type

Choose based on what you're representing:
- **Processes with decisions** -> Flowchart
- **Component interactions** -> Sequence diagram
- **Object lifecycles** -> State diagram
- **Data relationships** -> ER diagram
- **Time-based activities** -> Gantt chart

### Step 3: Extract Components

From your content, identify:
- **Nodes/Actors**: Main elements
- **Flows/Messages**: Connections between elements
- **Conditions/Guards**: Decision points
- **Groups/Swimlanes**: Logical groupings

### Step 4: Design Layout

**Aesthetic Requirements** (critical):
- Wobbly, asymmetric shapes - NEVER perfect geometry
- Sketchy arrows with organic curves
- Hand-lettered text appearance
- Variable line weight
- Whiteboard sketch feel throughout

**Color Strategy**:
- **Deep Purple (#4A148C)**: Critical paths, important nodes
- **Deep Teal (#00796B)**: Alternatives, secondary paths
- **Black (#000000)**: Structural framework
- **Charcoal (#2D2D2D)**: All text labels

**Typography**:
- Diagram headers: Elegant serif italic
- Node labels: Mix of serif and geometric sans
- Edge annotations: Condensed italic

### Step 5: Construct Prompt

```
[Diagram type] showing [what process/system]
[List key components and their relationships]
Hand-drawn Excalidraw whiteboard aesthetic:
- Wobbly edges, sketchy lines
- Imperfect shapes, not geometric
- Variable line weight
- Organic arrow curves
Light cream (#F5E6D3) or white background
Critical path highlighted in deep purple (#4A148C)
Alternative paths in deep teal (#00796B)
Black structural lines, charcoal text
Hand-lettered feel for all labels
```

### Step 6: Determine Aspect Ratio

| Diagram Type | Typical Ratio |
|--------------|---------------|
| Flowchart | 4:3 or 1:1 |
| Sequence | 3:4 (vertical) |
| State | 16:9 (horizontal) |
| ER | 4:3 |
| Gantt | 16:9 (horizontal) |

### Step 7: Generate

Use AI image generation with:
- Model: Prefer models strong at text rendering
- Resolution: 1024px+ for readability

### Step 8: Validate

**Structure**:
- [ ] All components from content are present
- [ ] Relationships are accurately shown
- [ ] Flow/sequence is logical

**Aesthetic**:
- [ ] Genuinely hand-drawn feel (no digital perfection)
- [ ] Color used strategically (not overwhelming)
- [ ] Typography hierarchy is clear

**Editorial**:
- [ ] Critical path is visually obvious
- [ ] Diagram tells the story
- [ ] Insights are highlighted appropriately

**Readability**:
- [ ] All text is legible
- [ ] Labels don't overlap
- [ ] Diagram works at intended size

## Examples

### Example 1: User Authentication Flow

**Type**: Flowchart

**Components**:
- Start: User visits login
- Decision: Has account?
- Paths: Register or Login
- Decision: Valid credentials?
- End: Dashboard or Error

**Prompt includes**:
- Sketchy rounded rectangles for steps
- Wobbly diamond for decisions
- Purple highlight on successful path
- Teal for error/alternative paths

### Example 2: API Request Sequence

**Type**: Sequence diagram

**Components**:
- Actors: Client, API Gateway, Auth Service, Database
- Messages: Request, validate, query, response

**Prompt includes**:
- Hand-drawn stick figures or boxes for actors
- Dashed lifelines (imperfect)
- Curved message arrows
- Purple for main request flow

### Example 3: Order State Machine

**Type**: State diagram

**Components**:
- States: Created, Pending, Paid, Shipped, Delivered
- Transitions: Pay, Ship, Deliver, Cancel

**Prompt includes**:
- Wobbly rounded shapes for states
- Organic arrows between states
- Purple for happy path states
- Teal for cancelled/exception states

## Anti-Patterns

- Perfect geometric shapes (must feel hand-drawn)
- Digital precision in arrows or lines
- Too many colors (stick to palette)
- Overcrowded diagrams (simplify if needed)
- Illegible text labels
- Missing the critical path highlight
