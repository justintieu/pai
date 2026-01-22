# Tracker Hooks

**File:** `hooks/useTracker.ts`
**Dependencies:** `@/services/tracker/trackerService`, `@/lib/queryKeys`
**Count:** 43 hooks

---

## Task Definition Queries

### useTaskDefinitions
```typescript
function useTaskDefinitions(session: Session | null): UseQueryResult<TaskDefinitionBasic[]>
```
**Query Key:** `queryKeys.tasks.definitions()`

### useBossDifficulties
```typescript
function useBossDifficulties(session: Session | null): UseQueryResult<BossDifficultyBasic[]>
```
**Query Key:** `[...queryKeys.bosses.all, 'difficulties']`

---

## Task Completion Hooks

### useTasksWithCompletions
```typescript
function useTasksWithCompletions(
  session: Session | null,
  options?: { characterId?: string; periodDate?: Date; resetType?: 'daily' | 'weekly' | 'monthly' | 'never' }
): UseQueryResult<TaskWithCompletion[]>
```
**Query Key:** `queryKeys.tasks.completions({ characterId, resetType })`

### useTasksByCharacters
```typescript
function useTasksByCharacters(session: Session | null): UseQueryResult<CharacterTasksData[]>
```
**Query Key:** `[...queryKeys.tasks.all, 'by-characters']`

### useCompleteTask
```typescript
function useCompleteTask(): UseMutationResult<
  TaskCompletion, Error,
  { session: Session; taskDefinitionId: string; data?: { characterId?; partySize?; notes?; ... } }
>
```
**Invalidates:** `queryKeys.tasks.all`

### useUncompleteTask
```typescript
function useUncompleteTask(): UseMutationResult<
  void, Error,
  { session: Session; taskDefinitionId: string; characterId?: string; periodDate?: Date }
>
```
**Invalidates:** `queryKeys.tasks.all`

### useBulkCompleteTasks
```typescript
function useBulkCompleteTasks(): UseMutationResult<
  void, Error,
  { session: Session; tasks: { taskDefinitionId: string; characterId?; partySize? }[] }
>
```
**Invalidates:** `queryKeys.tasks.all`

### useBulkUncompleteTasks
```typescript
function useBulkUncompleteTasks(): UseMutationResult<
  void, Error,
  { session: Session; tasks: { taskDefinitionId: string; characterId? }[] }
>
```
**Invalidates:** `queryKeys.tasks.all`

### useUpdateTaskCompletion
```typescript
function useUpdateTaskCompletion(): UseMutationResult<
  void, Error,
  { session: Session; completionId: string; data: { partySize?; notes?; numericValue?; ... } }
>
```
**Invalidates:** `queryKeys.tasks.all`

---

## Task Assignment Hooks

### useAssignTasksToCharacters
```typescript
function useAssignTasksToCharacters(): UseMutationResult<
  void, Error,
  { session: Session; characterIds: string[]; partySizes: Record<string, number | null> }
>
```
**Invalidates:** `queryKeys.tasks.all`, `queryKeys.characters.all`

### useCharactersForTask
```typescript
function useCharactersForTask(taskDefinitionId: string, session: Session | null): UseQueryResult<string[]>
```
**Query Key:** `[...queryKeys.tasks.all, 'characters', taskDefinitionId]`

---

## Task Settings Hooks

### useSetTasksEnabled
```typescript
function useSetTasksEnabled(): UseMutationResult<
  void, Error,
  { session: Session; characterId: string; taskDefinitionIds: string[]; enabled: boolean }
>
```
**Invalidates:** `queryKeys.tasks.all`

### useUpdateTaskSortOrders
```typescript
function useUpdateTaskSortOrders(): UseMutationResult<
  void, Error,
  { session: Session; characterId: string; taskOrders: { taskDefinitionId: string; sortOrder: number }[]; reorderedTasks?: TaskWithCompletion[] },
  { previousData: CharacterTasksData[] | undefined }
>
```
**Features:** Optimistic updates with rollback

### useUpdatePreferredPartySize
```typescript
function useUpdatePreferredPartySize(): UseMutationResult<
  void, Error,
  { session: Session; characterId: string; taskDefinitionId: string; partySize: number }
>
```
**Invalidates:** `queryKeys.tasks.all`

### useChangeBossDifficulty
```typescript
function useChangeBossDifficulty(): UseMutationResult<
  void, Error,
  { session: Session; characterId: string; currentTaskDefinitionId: string; newTaskDefinitionId: string; mode: 'thisWeek' | 'permanent'; completion: {...} | null; resetType?; originalTaskId? }
>
```
**Invalidates:** `queryKeys.tasks.all`

---

## Template Hooks

### useTemplates
```typescript
function useTemplates(session: Session | null): UseQueryResult<TaskTemplateListResponse>
```
**Query Key:** `queryKeys.tasks.templates()`

### useApplyTemplate
```typescript
function useApplyTemplate(): UseMutationResult<
  void, Error, { session: Session; templateId: string; characterId: string }
>
```
**Invalidates:** `queryKeys.tasks.all`

---

## Boss Drop Hooks

### useDropsWithDetails
```typescript
function useDropsWithDetails(
  session: Session | null,
  options?: { characterId?; bossDifficultyId?; dropWeek?; limit?; offset? }
): UseQueryResult<BossDropWithDetails[]>
```
**Query Key:** `queryKeys.drops.list({ bossDifficultyId, dropWeek })`

### useRecentWeeks
```typescript
function useRecentWeeks(session: Session | null, count?: number): UseQueryResult<string[]>
```
**Query Key:** `queryKeys.drops.recentWeeks()`

### useDropStats
```typescript
function useDropStats(session: Session | null): UseQueryResult<DropStats>
```
**Query Key:** `queryKeys.drops.stats()`

### useCreateDrop / useUpdateDrop / useDeleteDrop
CRUD mutations for boss drops. All invalidate `queryKeys.drops.all`.

---

## Custom Task Hooks

### useCustomTasks
```typescript
function useCustomTasks(session: Session | null): UseQueryResult<TaskDefinitionBasic[]>
```
**Query Key:** `[...queryKeys.tasks.all, 'custom']`

### useCreateCustomTask / useUpdateCustomTask / useDeleteCustomTask
CRUD mutations for custom tasks. All invalidate `queryKeys.tasks.all`.

---

## Recent Activity Hooks

### useRecentCompletions
```typescript
function useRecentCompletions(session: Session | null, characterId: string, limit?: number): UseQueryResult<RecentCompletion[]>
```
**Query Key:** `[...queryKeys.tasks.byCharacter(characterId), 'recent']`

### useRecentCompletionsAllCharacters
```typescript
function useRecentCompletionsAllCharacters(session: Session | null, limit?: number): UseQueryResult<RecentCompletionResult[]>
```
**Query Key:** `[...queryKeys.tasks.all, 'recent-all']`

---

## Task Preset Hooks

### useTaskPresets / useTaskPreset
Query hooks for task presets. Keys: `queryKeys.tasks.presets()`, `queryKeys.tasks.preset(id)`

### useCreateTaskPreset / useUpdateTaskPreset / useDeleteTaskPreset
CRUD mutations. Invalidate `queryKeys.tasks.presets()`.

### useApplyTaskPreset
```typescript
function useApplyTaskPreset(): UseMutationResult<
  void, Error, { session: Session; presetId: string; characterIds: string[] }
>
```
**Invalidates:** `queryKeys.tasks.all`, `queryKeys.characters.all`

---

## Boss Preset Hooks

### useBossPresets / useBossPreset
Query hooks for boss presets. Keys: `queryKeys.bossPresets.list()`, `queryKeys.bossPresets.detail(id)`

### useCreateBossPreset / useUpdateBossPreset / useDeleteBossPreset
CRUD mutations. Invalidate `queryKeys.bossPresets.all`.

### useApplyBossPreset
```typescript
function useApplyBossPreset(): UseMutationResult<
  void, Error, { session: Session; presetId: string; characterIds: string[] }
>
```
**Invalidates:** `queryKeys.tasks.all`, `queryKeys.characters.all`

---

## User Settings Hooks

### useDifficultyChangePreference
```typescript
function useDifficultyChangePreference(session: Session | null): UseQueryResult<'thisWeek' | 'permanent'>
```
**Query Key:** `['settings', 'difficultyChangePreference']`
**Stale Time:** Infinity

### useUpdateDifficultyChangePreference
```typescript
function useUpdateDifficultyChangePreference(): UseMutationResult<
  'thisWeek' | 'permanent', Error, { session: Session; preference: 'thisWeek' | 'permanent' }
>
```
**Cache Update:** Sets query data directly

---

## Composite Hooks

### useTaskTracker (hooks/useTaskTracker.ts)
Shared hook for Dashboard and Tracker pages. Combines multiple hooks with handlers.

```typescript
function useTaskTracker(options: {
  session: Session | null;
  mode: 'consolidated' | 'per-character';
  selectedPeriod?: TodoPeriod;
  onRefetchComplete?: () => void;
}): UseTaskTrackerReturn
```

**Returns:** characters, characterTasks, bossDifficulties, loading states, handlers for toggle/reorder/difficulty change

### useBatchedTaskToggle (hooks/useBatchedTaskToggle.ts)
Batches rapid task toggles into single API calls.

```typescript
function useBatchedTaskToggle(options: {
  session: Session | null;
  batchWindowMs?: number; // Default: 500ms
  onSuccess?: () => void;
}): {
  batchToggleTask: (characterId, task, partySize?) => void;
  togglingTasks: Set<string>;
  pendingCount: number;
  isPending: (characterId, taskId) => boolean;
  isFlushing: boolean;
}
```
