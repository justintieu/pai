# Hooks Registry Index

**Total: 72 hooks** across 11 files in `apps/web/src/hooks/`

## Quick Lookup

| I need to... | Load |
|--------------|------|
| Check auth state | [auth.md](./auth.md) |
| Work with characters | [characters.md](./characters.md) |
| Work with bosses | [bosses.md](./bosses.md) |
| Work with task tracker | [tracker.md](./tracker.md) (43 hooks) |
| Work with reports | [reports.md](./reports.md) |
| Check server status | [server-status.md](./server-status.md) |
| Use UI utilities | [ui.md](./ui.md) |

## Registry Files

| File | Hooks | Tokens | Description |
|------|-------|--------|-------------|
| [auth.md](./auth.md) | 1 | ~300 | Authentication context |
| [characters.md](./characters.md) | 7 | ~800 | Character CRUD |
| [bosses.md](./bosses.md) | 4 | ~500 | Boss data queries |
| [tracker.md](./tracker.md) | 43 | ~4k | Task/boss tracking, presets, drops |
| [reports.md](./reports.md) | 6 | ~600 | Analytics and reporting |
| [server-status.md](./server-status.md) | 4 | ~400 | Server/maintenance status |
| [ui.md](./ui.md) | 7 | ~800 | Toast, modals, filtering, reset detection |

## Common Patterns

### Query Hook
```typescript
const { data, isLoading, error } = useQueryHook(session);
```

### Mutation Hook
```typescript
const mutation = useMutationHook();
await mutation.mutateAsync({ session, ...data });
```

### Query Keys
All hooks use `@/lib/queryKeys` for cache management. Mutations invalidate related keys.
