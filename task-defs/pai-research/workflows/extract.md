# Extract Alpha Workflow

Distill high-novelty insights from content using information theory principles.

## Configuration

- **Agents:** 1 (deep analysis)
- **Target time:** 30-60 seconds
- **Input:** URL, text, or transcript

## Concept: What is "Alpha"?

**Alpha** = Information with high surprise value (Shannon entropy)

**High Alpha (SEEK):**
- Surprising reframings of familiar concepts
- Unexpected cross-domain connections
- Challenges to consensus views
- Counterintuitive but coherent insights
- Unstated implications the author didn't explicitly draw

**Low Alpha (AVOID):**
- Common knowledge restated
- Obvious implications
- Generic advice
- Surface-level observations
- What everyone already knows

## Process

### Step 1: Extract Content

**From URL:**
```typescript
WebFetch(url, "Extract the full article text")
```

**From YouTube:**
```
If user provides YouTube URL, note that we need the transcript.
Ask user to provide transcript or use a transcript extraction tool.
```

**From text:**
User provides content directly.

### Step 2: Deep Analysis (10 Dimensions)

Analyze the content across these dimensions:

1. **Surface points** - What does it explicitly say?
2. **Unstated implications** - What follows logically but isn't said?
3. **Cross-domain connections** - How does this apply elsewhere?
4. **Challenged assumptions** - What conventional wisdom is questioned?
5. **Novel elements** - What's genuinely new here?
6. **Mental models** - What frameworks emerge?
7. **Quiet profundity** - Subtle but important observations
8. **Contrarian angles** - Where does this go against the grain?
9. **Future signals** - What does this predict or enable?
10. **Synthesis opportunities** - How does this combine with other knowledge?

### Step 3: Extract Insights

Generate 15-25 high-alpha bullet points:

**Format:**
- 8-15 words per bullet (flexible for clarity)
- Start with the insight, not meta-commentary
- Paul Graham's approachable tone
- Each bullet should make the reader think "huh, I hadn't considered that"

**Quality filter:**
For each candidate insight, ask:
- Would an expert in this field find this non-obvious?
- Does this reframe something familiar?
- Could this change how someone acts or thinks?

If no to all three, discard it.

### Step 4: Format Output

```markdown
## Extracted Alpha: [Source Title/Description]

**Source:** [URL or description]
**Content type:** [Article/Video/Paper/etc.]

### High-Alpha Insights

- [Insight 1]

- [Insight 2]

- [Insight 3]

...

### Meta-Observations

[1-2 sentences on the overall thesis or framework, if applicable]

### Connections

[Optional: How this connects to other domains or your existing knowledge]
```

## Example

**Request:** "extract the key insights from Paul Graham's essay on founder mode"

**Output:**
```markdown
## Extracted Alpha: Founder Mode (Paul Graham)

**Source:** paulgraham.com/foundermode.html
**Content type:** Essay

### High-Alpha Insights

- The "hire good people and give them room" advice systematically fails for founders

- Founders running companies like managers creates a telephone-game of declining information quality

- Professional managers optimize for defensibility of decisions, not quality of outcomes

- Skip-level meetings aren't micromanagement—they're information gathering the org chart blocks

- Brian Chesky's "founder mode" at Airbnb succeeded precisely because it violated conventional advice

- The management advice industry is optimized for non-founders managing other people's companies

- Founder mode requires knowing which details matter, not attending to all details

- The delegation default assumes the CEO has worse judgment than their reports, which inverts the startup's original thesis

### Meta-Observations

The essay argues that standard management advice is calibrated for professional managers, not founders, and that founders who follow it often fail precisely because of their compliance.

### Connections

Relates to principal-agent problems, the difference between exploration and exploitation phases, and why founder-led companies often outperform professionally-managed ones in innovation metrics.
```

## When to Use

- "Extract insights from X"
- "What's the alpha in this?"
- "Distill the key points from X"
- "What's non-obvious about X?"
- After reading something valuable, wanting to capture the best parts
- Processing content for learning/memory
