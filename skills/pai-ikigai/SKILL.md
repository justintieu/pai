---
name: pai-ikigai
description: Guided setup for PAI context files. Helps articulate identity, mission, goals, challenges, preferences, and strategies through conversational questions. Use for first-time setup or expanding context.
tools: [Read, Write, Edit]
---

# PAI Ikigai

Guide users through setting up their PAI context files. Helps articulate who you are, what you're working toward, and how you work best.

Inspired by the Japanese concept of ikigai (生きがい) - finding purpose at the intersection of what you love, what you're good at, what the world needs, and what you can be paid for.

## When to Use

- First time setting up PAI
- Context files are empty or minimal
- User wants to reflect on and document their purpose, goals, or working style
- User invokes `/pai ikigai`

## Approach

### Philosophy

Rather than filling out forms, this is a guided conversation. Ask thoughtful questions, listen to responses, and help the user articulate things they may not have put into words before.

### Principles

1. **Start with identity** - Understanding who someone is creates context for everything else
2. **Move from self to purpose** - Identity flows into mission, mission into goals
3. **Be conversational** - Ask follow-up questions, reflect back what you hear
4. **Capture essence, not exhaustive detail** - A few meaningful insights beat lengthy documentation
5. **Respect pace** - Users can do one section at a time or all at once

### The Ikigai Framework Applied

| Ikigai Question | PAI Context |
|-----------------|-------------|
| What do you love? | identity, beliefs |
| What are you good at? | identity (skills), strategies |
| What does the world need? | mission, goals |
| What can you be paid for? | goals, challenges |

## Instructions

### Full Setup

1. Introduce the process - explain we'll explore identity, purpose, and working style
2. Guide through each context area in order:
   - Identity (who you are, background, working style)
   - Mission (core purpose, impact you want to have)
   - Goals (current focus, short/long-term)
   - Challenges (current obstacles, growth areas)
   - Preferences (communication, code style, tools)
   - Strategies (how you solve problems, make decisions, learn)
3. For each area, ask 2-3 thoughtful questions
4. Synthesize responses and write to the appropriate context file
5. Summarize what was captured and suggest next steps

### Quick Start

1. Focus on the three essentials: identity, mission, goals
2. Ask one key question per area:
   - "How would you describe yourself and what you do?"
   - "What's the impact you want to have?"
   - "What are you focused on right now?"
3. Write concise entries to each context file
4. Note which areas could be expanded later

### Single Section

1. Identify which context area to focus on
2. Read current content (if any) from that file
3. Ask relevant questions for that section
4. Update the file with new insights, preserving existing content

### Guided Reflection

For deeper exploration using the ikigai framework:

1. Explore each quadrant through conversation:
   - "What activities make you lose track of time?"
   - "What do people come to you for help with?"
   - "What problems in the world bother you most?"
   - "How do you currently make a living, and how does that align?"
2. Help find the intersections
3. Document insights across relevant context files

## Examples

**User:** `/pai ikigai`
**Response:** Introduce the process, then ask about identity first. After they respond, synthesize and ask about mission. Continue through all sections, writing to context files at the end.

**User:** `/pai ikigai --quick`
**Response:** Ask three focused questions (identity, mission, goals), write concise entries.

**User:** `/pai ikigai identity`
**Response:** Focus only on identity - read existing content, ask relevant questions, update the file.

## Tips

- Let the user drive the pace - some want to go deep, others want quick setup
- Read existing context files first to avoid overwriting previous content
- Use the user's own words when writing to context files
- It's okay to leave sections empty - context can be built up over time
- After setup, remind users they can expand sections later with `/pai ikigai [section]`
