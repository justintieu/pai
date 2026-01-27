<!--
GOAL FILE SCHEMA
================
This template defines the structure for learning goal files.

Frontmatter fields:
- id: kebab-case identifier (derived from title, e.g., "learn-rust")
- title: Human-readable goal name
- created: ISO date of goal creation (YYYY-MM-DD)
- status: active | paused | completed | archived
- timeframe: Optional target completion date (YYYY-MM-DD or empty)
- why: Optional motivation note (free text)
- last_activity: ISO date of last task completion or edit

Sections:
- Journey: ASCII visualization of milestone progress
- Milestones: Hierarchical breakdown with checkbox tasks
- Resources: PAI-suggested learning materials
- Roadmap: Collapsible full learning plan
- Notes: Free-form personal notes
-->
---
id: {goal-id}
title: {Goal Title}
created: {YYYY-MM-DD}
status: active
timeframe:
why:
last_activity: {YYYY-MM-DD}
---

# {Goal Title}

[Describe your goal here]

## Journey

```
[ ] First milestone ──────[ ] Second ──────[ ] Third
```

## Milestones

### M1: [First Milestone] (Planned)

- [ ] First task
- [ ] Second task

## Resources

PAI-suggested resources:
- [To be added]

## Roadmap (Full)

<details>
<summary>View full roadmap</summary>

[PAI will help generate this during milestone definition]

</details>

## Notes

