# Registries Index

Quick navigation for codebase registries. Load specific files as needed.

## Registry Structure

```
registries/
├── index.md              (this file)
├── components.md         # 217 components
├── business-logic.md     # Feature rules, regression checks
├── hooks/
│   ├── index.md          # Hook overview (load first)
│   ├── auth.md           # 1 hook
│   ├── characters.md     # 7 hooks
│   ├── bosses.md         # 4 hooks
│   ├── tracker.md        # 43 hooks (largest)
│   ├── reports.md        # 6 hooks
│   ├── server-status.md  # 4 hooks
│   └── ui.md             # 7 hooks
└── api-routes/
    ├── index.md          # Route overview (load first)
    ├── v3-tracker.md     # 46 endpoints
    ├── v3-public.md      # 21 endpoints
    ├── auth.md           # 11 endpoints
    └── admin.md          # 67 endpoints
```

## Quick Lookups

| I need to... | Load |
|--------------|------|
| Add/modify a component | [components.md](./components.md) |
| Understand a feature's rules | [business-logic.md](./business-logic.md) |
| Work with hooks | [hooks/index.md](./hooks/index.md) → specific file |
| Work with API routes | [api-routes/index.md](./api-routes/index.md) → specific file |

## Token Budget Guide

| Scenario | Files | ~Tokens |
|----------|-------|---------|
| Quick lookup | 1 index | 300-500 |
| Component work | components.md | 1.5k |
| Character hooks | hooks/characters.md | 800 |
| Tracker work | hooks/tracker.md + api-routes/v3-tracker.md | 4k |
| Full hooks | All hooks/* | 7k |
| Full API routes | All api-routes/* | 5k |
| Everything | All registries | ~20k |

## Loading Strategy

1. **Start with index files** - Get overview, find what you need
2. **Load specific domain files** - Only load tracker.md if working on tracker
3. **Avoid loading everything** - Each file is self-contained

## Maintenance

Update when:
- Adding new components, hooks, or endpoints
- Changing business rules
- Discovering undocumented behavior
