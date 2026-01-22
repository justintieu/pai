# PAI Architecture Flow

**Date:** 2026-01-22

## The Flow

```
kasanariba-ai/core/  →  ~/.pai  →  ~/.claude
     (source)          (working)    (deployed)
```

## When Modifying PAI

1. Edit files in `kasanariba-ai/core/` (the source template)
2. Run `pai sync --push` to deploy to `~/.pai` and push
3. Changes automatically reflect in `~/.claude/` via symlinks

## Key Directories

- `kasanariba-ai/core/skills/` - Source of truth for skills
- `~/.pai/skills/` - Working copy (synced from core)
- `~/.claude/skills/` - Symlink to `~/.pai/skills/`

## Commands

```bash
pai sync --push    # Commit ~/.pai, push, update from core/, rebuild
pai build          # Rebuild ~/.claude from ~/.pai
pai update         # Pull new content from core/ to ~/.pai
```
