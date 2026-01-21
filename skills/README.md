# Skills

Reusable PAI skills with workflows and best practices.

## Available Skills

- **[pai-council](pai-council/SKILL.md)** - Multi-agent debate system for decisions and architectural review
- **[pai-firstprinciples](pai-firstprinciples/SKILL.md)** - Foundational reasoning: deconstruct, challenge, reconstruct
- **[pai-research](pai-research/SKILL.md)** - Multi-source research with parallel agents (Quick/Standard/Extensive modes)
- **[pai-telos](pai-telos/SKILL.md)** - Life OS: setup context, track goals/beliefs/lessons, maintain alignment
- **[pai-validate](pai-validate/SKILL.md)** - Validate and create PAI skills following our conventions
- **[pai-work-status](pai-work-status/SKILL.md)** - Maintain work status tracking, daily logs, and monthly archival

## Structure

Each skill directory contains:
- `SKILL.md` - Main skill definition (required)
- `workflows/` - Optional: multi-step procedures
- `tools/` - Optional: utility scripts
- `reference/` - Optional: detailed documentation

## Adding Skills

1. Create a new directory: `mkdir ~/.pai/skills/my-skill`
2. Copy template: `cp ~/.pai/skills/_template/SKILL.template ~/.pai/skills/my-skill/SKILL.md`
3. Edit `SKILL.md` with your skill content
4. Add to this index

PAI-related skills should be prefixed with `pai-` (e.g., `pai-work-status`).
