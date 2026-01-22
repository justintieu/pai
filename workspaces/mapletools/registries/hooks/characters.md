# Character Hooks

**File:** `hooks/useCharacters.ts`
**Dependencies:** `@/services/characterService`, `@/lib/queryKeys`

## Queries

### useSavedCharacters
Fetch all saved characters for the current user.

```typescript
function useSavedCharacters(session: Session | null): UseQueryResult<SavedCharacter[]>
```
**Query Key:** `queryKeys.characters.saved()`

### useMainCharacter
Fetch the main character.

```typescript
function useMainCharacter(session: Session | null): UseQueryResult<SavedCharacter | null>
```
**Query Key:** `queryKeys.characters.main()`

### useSavedCharacter
Fetch a single saved character by ID.

```typescript
function useSavedCharacter(id: string, session: Session | null): UseQueryResult<SavedCharacter>
```
**Query Key:** `queryKeys.characters.detail(id)`

## Mutations

### useSaveCharacter
Save a new character.

```typescript
function useSaveCharacter(): UseMutationResult<
  SavedCharacter,
  Error,
  { character: SaveCharacterRequest; session: Session }
>
```
**Invalidates:** `queryKeys.characters.all`

### useUpdateCharacter
Update an existing character.

```typescript
function useUpdateCharacter(): UseMutationResult<
  SavedCharacter,
  Error,
  { id: string; session: Session; updates: UpdateCharacterRequest }
>
```
**Invalidates:** `queryKeys.characters.all`, `queryKeys.characters.detail(id)`

### useDeleteCharacter
Delete a character.

```typescript
function useDeleteCharacter(): UseMutationResult<void, Error, { id: string; session: Session }>
```
**Invalidates:** `queryKeys.characters.all`

### useSetMainCharacter
Set a character as the main character.

```typescript
function useSetMainCharacter(): UseMutationResult<void, Error, { id: string; session: Session }>
```
**Invalidates:** `queryKeys.characters.all`, `queryKeys.characters.main()`
