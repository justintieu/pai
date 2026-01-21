# Work Status

## Structure

- `index.md` - Active/in-progress items only
- `yyyy-mm-dd.md` - Daily logs (current month only at top level)
- `archive/YYYY/` - Previous months' files

**Archive rule**: At month end, move previous month's files to `archive/YYYY/`.

---

## Active

### PAI System
- [x] Test `UserPromptSubmit` hook for sync check - working in project settings.local.json
- [ ] Improve `pai update` to not overwrite user content
  - Consider `*.core.md` (synced from core) vs `*.user.md` (never overwritten) pattern
  - `pai update` only touches `*.core.md` files
  - User files override/extend core files

---

## Recently Completed

- [x] Fix `pai sync --check` hook - added --quiet flag (2026-01-20)
- [x] Complete ikigai setup (2026-01-20)
- [x] Created pai-work-status and pai-ikigai skills (2026-01-20)
- [x] Updated directory structure docs and profiles (2026-01-20)
