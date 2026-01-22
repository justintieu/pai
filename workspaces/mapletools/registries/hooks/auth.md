# Auth Hooks

**File:** `hooks/useAuthContext.ts`

## useAuthContext

Access authentication state and session from AuthContext.

```typescript
function useAuthContext(): {
  displayName: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  profilePictureUrl: string | null;
  refreshAuth: () => Promise<void>;
  role: string | null;
  session: Session | null;
  signOut: () => Promise<void>;
  user: User | null;
}
```

**Dependencies:** `@/contexts/AuthContext`

**Usage:**
```typescript
const { session, user, isAdmin, signOut } = useAuthContext();

if (!session) {
  // Not logged in
}
```
