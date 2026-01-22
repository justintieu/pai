# Server Status Hooks

**File:** `hooks/useServerStatus.ts`
**Dependencies:** `@/services/serverStatusService`, `@/lib/queryKeys`

## useMaintenanceStatus
Fetch maintenance status.

```typescript
function useMaintenanceStatus(): UseQueryResult<NexonMaintenanceResponse>
```
**Query Key:** `queryKeys.serverStatus.maintenance()`
**Refetch Interval:** 1 minute

## useRegionsWithWorlds
Fetch regions with worlds.

```typescript
function useRegionsWithWorlds(): UseQueryResult<RegionsResponse>
```
**Query Key:** `queryKeys.serverStatus.regions()`
**Stale Time:** 7 days

## useWorldChannels
Fetch world channels.

```typescript
function useWorldChannels(
  region: Region,
  worldId: string,
  options?: { enabled?: boolean }
): UseQueryResult<WorldChannelsResponse>
```
**Query Key:** `queryKeys.serverStatus.channels(worldId)`
**Refetch Interval:** 30 seconds

## useWorldPingStats
Fetch world ping stats.

```typescript
function useWorldPingStats(
  region: Region,
  worldId: string,
  options?: { enabled?: boolean }
): UseQueryResult<ChannelPingStats | null>
```
**Query Key:** `queryKeys.serverStatus.pingStats(worldId)`
**Refetch Interval:** 30 seconds
