# Quick Research Workflow

Single agent, single query. Fast answers for simple questions.

## Configuration

- **Agents:** 1
- **Queries:** 1
- **Target time:** 10-15 seconds
- **Timeout:** 30 seconds

## Process

### Step 1: Execute Single Query

```typescript
Task({
  subagent_type: "Explore",
  model: "haiku",
  description: "[topic] quick lookup",
  prompt: `
    Do ONE web search for: [optimized query]

    Return:
    - Direct answer to the question
    - 1-2 key supporting facts
    - Source URL (will be verified)

    Keep it brief and factual. No speculation.
  `
})
```

**Query optimization:**
- Remove filler words
- Add specificity (year, version, context)
- Focus on the core question

### Step 2: Verify URL

Before delivering, verify any URL returned:

```bash
curl -s -o /dev/null -w "%{http_code}" -L "URL"
```

- 200: Include URL
- Other: Remove URL, note "source not directly linkable"

### Step 3: Format Output

```markdown
## Quick Research: [Topic]

**Mode:** Quick | **Agents:** 1 | **Time:** [X]s

### Answer
[Direct answer with key facts]

### Source
- [Title](verified-url) (if available)

### Need More?
Run standard research for deeper analysis.
```

## Example

**Request:** "quick research on when Python 3.12 was released"

**Query:** "Python 3.12 release date official"

**Output:**
```markdown
## Quick Research: Python 3.12 Release Date

**Mode:** Quick | **Agents:** 1 | **Time:** 12s

### Answer
Python 3.12 was released on October 2, 2023. Key features include improved error messages, faster startup time, and the new type parameter syntax (PEP 695).

### Source
- [Python 3.12 Release](https://www.python.org/downloads/release/python-3120/)

### Need More?
Run standard research for full feature breakdown.
```

## When to Use

- Single fact lookups
- Date/version checks
- Quick definitions
- "What is X?" questions
- Time-sensitive queries
