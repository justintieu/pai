# Boss Hooks

**File:** `hooks/useBosses.ts`
**Dependencies:** `@/services/bossService`, `@/lib/queryKeys`

## useBosses
Fetch all bosses.

```typescript
function useBosses(): UseQueryResult<BossListResponse>
```
**Query Key:** `queryKeys.bosses.lists()`

## useLiberationBosses
Fetch liberation-specific bosses (destiny, destiny2, or genesis).

```typescript
function useLiberationBosses(type: 'destiny' | 'destiny2' | 'genesis'): UseQueryResult<BossListResponse>
```
**Query Key:** `queryKeys.bosses.liberation(type)`
**Stale Time:** 5 minutes

## useBoss
Fetch a single boss by slug.

```typescript
function useBoss(
  slug: string,
  options?: { enabled?: boolean }
): UseQueryResult<BossDetailResponse | null>
```
**Query Key:** `queryKeys.bosses.detail(slug)`

## useBossDifficulty
Fetch a specific boss difficulty.

```typescript
function useBossDifficulty(
  slug: string,
  difficulty: string,
  options?: { enabled?: boolean }
): UseQueryResult<BossDifficulty>
```
**Query Key:** `queryKeys.bosses.difficulty(slug, difficulty)`
