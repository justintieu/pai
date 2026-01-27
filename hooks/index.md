# Hooks

Claude Code hook configurations for automation and lifecycle events.

## Development Workflow

When editing hooks in this repo:

1. Edit files in `core/hooks/` (NOT `~/.pai/hooks/`)
2. Run `pai update` to copy changes to `~/.pai/`
3. Rebuild: `cd ~/.pai/hooks && bun run build`
4. Test the changes

Never edit `~/.pai/hooks/` directly - those changes will be overwritten by `pai update`.

## Contents

- **[claude-code.md](claude-code.md)** - Claude Code hooks for automatic maintenance

## When to Load

- Setting up automation for PAI maintenance
- Configuring lifecycle events (session start/end)
- Integrating with CI/CD or other workflows
