# Skills

Reusable PAI skills with workflows and best practices.

## Available Skills

- **[pai-ikigai](pai-ikigai/SKILL.md)** - Guided setup for PAI context files (identity, mission, goals, etc.)
- **[pai-work-status](pai-work-status/SKILL.md)** - Maintain work status tracking, daily logs, and monthly archival

## Structure

Each skill directory contains:
- `SKILL.md` - Main skill definition (required)
- `workflows/` - Optional: multi-step procedures
- `tools/` - Optional: utility scripts
- `reference/` - Optional: detailed documentation

## Adding Skills

1. Create a new directory: `mkdir ~/.pai/skills/my-skill`
2. Copy template: `cp ~/.pai/skills/_template/SKILL.md ~/.pai/skills/my-skill/SKILL.md`
3. Edit `SKILL.md` with your skill content
4. Add to this index

PAI-related skills should be prefixed with `pai-` (e.g., `pai-work-status`).
