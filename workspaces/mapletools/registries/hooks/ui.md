# UI Hooks

## useToast
**File:** `hooks/useToast.ts`

Toast notification system.

```typescript
function useToast(): {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}
```

**Usage:**
```typescript
const { success, error } = useToast();
success('Character saved!');
error('Failed to save');
```

---

## useModalScrollLock
**File:** `hooks/useModalScrollLock.ts`

Lock body scroll when modal is open.

```typescript
function useModalScrollLock(isOpen: boolean): void
```

**Features:** Preserves scroll position, handles scrollbar width

---

## useToolFiltering
**File:** `hooks/useToolFiltering.ts`

Tool filtering with URL sync for the tools page.

```typescript
function useToolFiltering(): {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: ToolCategory | 'all';
  setCategoryFilter: (category: ToolCategory | 'all') => void;
  tagFilters: ToolTag[];
  setTagFilters: (tags: ToolTag[]) => void;
  toggleTag: (tag: ToolTag) => void;
  filteredTools: ToolMetadata[];
  clearAllFilters: () => void;
}
```

**Features:** URL params sync, category/tag/search filtering

---

## useResetDetection
**File:** `hooks/useResetDetection.ts`

Detect MapleStory resets (daily/weekly/monthly).

```typescript
type ResetType = 'daily' | 'wednesday' | 'thursday' | 'monthly';

function useResetDetection(options?: {
  enabled?: boolean;
  resetTypes?: ResetType[];
  onReset?: (resetType: ResetType) => void;
}): void
```

**Features:** Checks every second, triggers callback when reset boundary crossed

---

## useFamiliarPotentials
**File:** `hooks/useFamiliarPotentials.ts`

Fetch all familiar potentials.

```typescript
function useFamiliarPotentials(): UseQueryResult<FamiliarPotentialsResponse>
```

**Query Key:** `queryKeys.familiars.lists()`
