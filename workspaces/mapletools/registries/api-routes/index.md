# API Routes Index

**Base URL:** `https://api.mapletools.app`
**Total Endpoints:** 151

## Quick Lookup

| I need to... | Load |
|--------------|------|
| Task/boss tracking endpoints | [v3-tracker.md](./v3-tracker.md) (46 endpoints) |
| Public data (bosses, items, servers) | [v3-public.md](./v3-public.md) (21 endpoints) |
| Authentication | [auth.md](./auth.md) (11 endpoints) |
| Admin endpoints | [admin.md](./admin.md) (67 endpoints) |

## Registry Files

| File | Endpoints | Tokens | Description |
|------|-----------|--------|-------------|
| [v3-tracker.md](./v3-tracker.md) | 46 | ~2k | Task management, completions, presets, drops |
| [v3-public.md](./v3-public.md) | 21 | ~800 | Bosses, characters, items, servers, users |
| [auth.md](./auth.md) | 11 | ~500 | Login, session, profile |
| [admin.md](./admin.md) | 67 | ~2k | Audit, bosses, tasks, users, templates |

## Summary by Category

| Category | Count |
|----------|-------|
| V3 Tracker | 46 |
| V3 Public (bosses, chars, items, servers, users) | 21 |
| Auth | 11 |
| Admin | 67 |
| Legacy | 6 |
| **Total** | **151** |

## Authentication

Most endpoints require authentication via Bearer token:
```
Authorization: Bearer <access_token>
```

Public endpoints (bosses, items, servers, character lookup) do not require auth.
