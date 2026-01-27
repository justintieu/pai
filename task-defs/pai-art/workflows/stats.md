---
name: stats
description: Single-statistic visual cards for newsletters and social media. USE WHEN stat card, number highlight, statistic visualization, newsletter graphic, social media stat.
---

# Stats Workflow

Create single-statistic visual cards designed for newsletters and social media, where one number dominates the composition.

## Core Process

```
SELECT -> DESIGN -> PROMPT -> GENERATE -> VALIDATE
```

## Key Principle

**The statistic IS the primary visual.**

The number itself occupies 60-70% of the composition. Supporting illustration is secondary (20-30%), providing context without competing for attention.

## Instructions

### Step 1: Select Statistic

Identify:
- **The number**: What is the striking statistic?
- **The meaning**: What does this number represent?
- **The context**: What makes this number significant?
- **The emotion**: Surprising? Alarming? Hopeful?

Choose statistics that are:
- Immediately impactful
- Easy to remember
- Meaningful to the audience

### Step 2: Design Layout

**Composition**:
- Number: 60-70% of visual space
- Supporting illustration: 20-30%
- Text label/context: 10-15%

**Number Styling**:
- Hand-lettered appearance with imperfections
- Wobbly lines, character, personality
- NOT perfect digital fonts
- Large and dominant

**Illustration Styling**:
- Small, simple, supporting
- Relates to what the number measures
- Black linework with minimal purple accents
- Does not compete with the number

**Color Palette**:
- **Numbers**: Deep Purple (#4A148C) or Black (#000000)
- **Illustrations**: Black linework, purple accents
- **Background**: Light Cream (#F5E6D3) or White
- **Text**: Charcoal (#2D2D2D)

### Step 3: Construct Prompt

```
Single statistic visual card

Dominant element: [THE NUMBER] in [color choice]
- Hand-lettered style with imperfections
- Wobbly lines, organic character
- Takes up 60-70% of composition

Supporting illustration: [simple visual of what number measures]
- Small, 20-30% of space
- Black linework with purple accents
- Does not compete with number

Context text: "[Brief label explaining the number]"
- Charcoal text, small
- Positions below or beside number

[Light cream OR white] background
Square aspect ratio (1:1)
Newsletter/social media optimized
Immediately scannable - number jumps out at thumbnail size
```

### Step 4: Generate

Parameters:
- Aspect ratio: 1:1 (square) is default for social/newsletter
- Resolution: 1024x1024
- Model: Prefer models with good text/number rendering

### Step 5: Validate

**Dominance**:
- [ ] Number is immediately visible
- [ ] Number takes 60-70% of composition
- [ ] Illustration doesn't compete

**Readability**:
- [ ] Number is legible at thumbnail size
- [ ] Context text is readable
- [ ] Scannable in <2 seconds

**Aesthetic**:
- [ ] Hand-lettered feel (not digital font)
- [ ] Illustration is simple and supporting
- [ ] Color palette is maintained

**Impact**:
- [ ] Number "jumps out" at viewer
- [ ] Meaning is immediately clear
- [ ] Shareable and memorable

## Examples

### Example 1: Productivity Statistic

**Number**: 73%

**Meaning**: Percentage of meetings that could be emails

**Illustration**: Simple sketchy calendar with X marks

**Layout**: Large "73%" in purple, small crossed-out calendar below, "of meetings could be emails" as context text

### Example 2: Startup Failure Rate

**Number**: 9/10

**Meaning**: Startups that fail within 5 years

**Illustration**: Row of 10 simple building shapes, 9 faded/crossed

**Layout**: Large "9/10" in black, building illustration to side, "startups fail within 5 years" below

### Example 3: Time Statistic

**Number**: 2.5 hours

**Meaning**: Time lost daily to context switching

**Illustration**: Simple clock with fragmented pieces

**Layout**: Large "2.5 hours" in purple, small broken clock, "lost to context switching daily" as context

### Example 4: Cost Statistic

**Number**: $400M

**Meaning**: Cost of bad data to average enterprise

**Illustration**: Simple stack of coins with cracks

**Layout**: Large "$400M" in black, small cracked coin stack, "yearly cost of bad data per enterprise"

## Anti-Patterns

- Illustration larger than number (number must dominate)
- Perfect digital typography (needs hand-lettered feel)
- Too much context text (keep minimal)
- Complex illustrations (keep simple and small)
- Number hard to read at small sizes
- Competing visual elements
- Multiple statistics (one number per card)
