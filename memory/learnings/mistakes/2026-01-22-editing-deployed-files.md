# Editing Deployed Files Instead of Source

**Date:** 2026-01-22

## The Mistake

Edited `~/.claude/skills/pai-research/SKILL.md` directly instead of `kasanariba-ai/core/skills/pai-research/SKILL.md`

## Why It's Wrong

`~/.claude/skills/` is symlinked to `~/.pai/skills/`. While changes work temporarily, running `pai build` or `pai sync` could overwrite them if the source in `core/` isn't updated.

## Correct Approach

Always edit `core/` → run `pai sync --push` → changes deploy everywhere.

## Detection

If you're editing a file in `~/.claude/` or `~/.pai/`, ask: "Is this also in `core/`?" If yes, edit `core/` instead.
