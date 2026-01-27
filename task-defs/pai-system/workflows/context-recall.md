# Context Recall Workflow

Search memory and history to reconstruct past work context.

## When to Use

- "What did we do about X?"
- "Why did we change Y?"
- "We fixed that before..."
- "What was the decision on Z?"
- Resuming work after a break

## Steps

### 1. Extract Search Keywords

From the user's question, identify:
- **Topics:** Main subjects (e.g., "authentication", "skill porting")
- **Time references:** "last week", "when we fixed", "before"
- **Actions:** "changed", "decided", "fixed", "created"

### 2. Search Memory Locations

Search these areas in parallel:

```bash
PAI_ROOT=~/.pai

# Primary search locations
LOCATIONS=(
  "$PAI_ROOT/memory/sessions"      # Session documentation
  "$PAI_ROOT/memory/learnings"     # Patterns and insights
  "$PAI_ROOT/memory/work_status.md"  # Current/recent work
  "$PAI_ROOT/workspaces"           # Project-specific context
)

KEYWORDS="$1"  # Search terms

for loc in "${LOCATIONS[@]}"; do
  if [ -d "$loc" ]; then
    echo "=== $loc ==="
    grep -ril "$KEYWORDS" "$loc" | head -5
  elif [ -f "$loc" ]; then
    grep -il "$KEYWORDS" "$loc"
  fi
done
```

### 3. Search Git History

```bash
cd ~/.pai

# Search commit messages
git log --oneline --grep="$KEYWORDS" | head -10

# Search code changes
git log -p --all -S "$KEYWORDS" --source --remotes | head -50

# Search by date range
git log --oneline --since="2 weeks ago" --until="1 week ago"
```

### 4. Prioritize by Recency

Sort findings by timestamp:

```bash
# List files by modification time
find ~/.pai/memory -name "*.md" -mtime -30 -exec ls -lt {} \; | head -10
```

### 5. Deep Read Top Matches

For the top 3-5 matches:
1. Read the full file content
2. Extract relevant sections
3. Note dates and context
4. Identify related files

### 6. Synthesize Response

Structure the recall response:

```markdown
## Context Recall: [Topic]

### What Was Done
- [Action 1] on [date]
- [Action 2] on [date]

### Decisions Made
- Decided to [X] because [reason]
- Chose [Y] over [Z] due to [factors]

### Outcomes
- [Result 1]
- [Result 2]

### Relevant Files
- `memory/sessions/2024-01-10-topic.md`
- `workspaces/project/notes.md`

### Related Work
- This connects to [other topic]
- See also: [related file]

### Open Questions
- [Anything unresolved]
```

## Search Strategies

### By Topic

```bash
# Find all mentions of a topic
grep -ril "authentication" ~/.pai/memory ~/.pai/workspaces
```

### By Time Period

```bash
# Files modified in last 7 days
find ~/.pai -name "*.md" -mtime -7

# Git commits in date range
git log --oneline --after="2024-01-01" --before="2024-01-15"
```

### By File Type

```bash
# Session docs only
ls -lt ~/.pai/memory/sessions/*.md | head -10

# Workspace notes
find ~/.pai/workspaces -name "*.md" -exec grep -l "keyword" {} \;
```

### By Action

```bash
# Find "fixed" or "resolved"
grep -ril "fixed\|resolved" ~/.pai/memory

# Find decisions
grep -ril "decided\|chose\|selected" ~/.pai/memory
```

## Response Guidelines

**Do:**
- Acknowledge the user's frustration if context is fragmented
- Explain WHY decisions were made, not just what
- Offer to dig deeper into specific areas
- Provide dates and file references

**Don't:**
- Make up context that doesn't exist
- Guess at decisions without evidence
- Overwhelm with irrelevant matches

## Example Recall

User: "Why did we use kebab-case for skill names?"

```markdown
## Context Recall: Skill Naming Convention

### What Was Found

**Session doc from 2024-01-05:**
> Decided on kebab-case for all PAI directories and files to maintain
> consistency with our existing patterns and improve readability.

**Reasoning noted:**
- Consistent with URL/path conventions
- Easier to type than TitleCase
- Matches existing codebase style
- Avoids case-sensitivity issues

### Related Decisions
- Also chose `SKILL.md` (uppercase) as the standard filename
- Prefixed PAI-specific skills with `pai-`

### Source Files
- `memory/sessions/2024-01-05-pai-conventions.md`
- `skills/pai-validate/SKILL.md` (documents the convention)
```

## Limitations

Context recall depends on:
- Documentation quality in memory/
- Commit message clarity
- How much context was captured

If nothing is found:
- Acknowledge the gap
- Suggest what we can infer from current state
- Offer to document going forward
