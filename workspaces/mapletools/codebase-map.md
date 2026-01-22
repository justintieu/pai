# Codebase Map

Quick navigation reference for the mapletools monorepo. Use this instead of exploring.

## Directory Structure

### Apps

| Directory | Purpose | Key Entry Points |
|-----------|---------|------------------|
| `apps/web/src/app/` | Next.js pages (App Router) | `page.tsx`, `layout.tsx` per route |
| `apps/web/src/components/` | Reusable UI components | `ui/` for primitives, feature folders for domain |
| `apps/web/src/hooks/` | React hooks with TanStack Query | `use[Feature].ts` pattern |
| `apps/web/src/services/` | API calls and business logic | `[feature]Service.ts` pattern |
| `apps/web/src/types/` | TypeScript interfaces | `[feature].ts` pattern |
| `apps/api/src/routes/` | Express API endpoints | `v3/` is current version |
| `apps/discord/src/commands/` | Discord bot commands | `mt.ts` main command group |
| `packages/core/src/` | Shared services, repos, types | `index.ts` exports all |

### Web App Deep Dive

```
apps/web/src/
├── app/                      # Pages (App Router)
│   ├── admin/                # Admin dashboard
│   ├── bosses/               # Boss directory & detail pages
│   ├── calculators/          # StarForce, cubing, flames
│   ├── characters/           # Character management
│   ├── compare/              # Character comparison
│   ├── dashboard/            # User dashboard
│   ├── familiar-potentials/  # Familiar system
│   ├── reports/              # Analytics & completions
│   ├── settings/             # User preferences
│   ├── simulators/           # Golden Octopus, maintenance
│   ├── status/               # Server status
│   ├── tools/                # Utility tools
│   └── tracker/              # Daily/weekly task tracker
│
├── components/
│   ├── ui/                   # Base primitives (button, card, dialog, etc.)
│   ├── common/               # Shared (Header, Footer, ErrorBoundary)
│   ├── layout/               # Navigation, Sidebar
│   ├── admin/                # Admin-specific components
│   ├── boss/                 # Boss cards, lists, filters
│   ├── boss-detail/          # Boss detail page components
│   ├── calculators/          # Calculator-specific components
│   ├── tracker/              # Task tracker components
│   └── simulators/           # Simulator-specific components
│
├── contexts/
│   ├── AuthContext.tsx       # Authentication state provider
│   ├── CommandPaletteContext.tsx # Command palette state
│   └── AdminEnvironmentContext.tsx # Admin environment state
│
├── hooks/
│   ├── useAuthContext.ts     # Auth state & session
│   ├── useCharacters.ts      # Character CRUD operations
│   ├── useBosses.ts          # Boss data queries
│   ├── useTracker.ts         # Task tracker state (997 lines - complex)
│   ├── useTaskTracker.ts     # Task toggle mutations
│   ├── useReports.ts         # Analytics data
│   └── useToast.ts           # Toast notifications
│
├── services/
│   ├── calculations/         # ALL game math goes here
│   │   ├── starforceCalculationService.ts
│   │   ├── cubingCalculationService.ts
│   │   ├── flameCalculationService.ts
│   │   └── mesoCalculationService.ts
│   ├── admin/                # Admin-specific services
│   ├── reports/              # Report aggregation services
│   ├── simulators/           # Simulator services
│   ├── tools/                # Tool services
│   ├── tracker/
│   │   └── trackerService.ts # Task API calls (1217 lines)
│   ├── characterService.ts   # Character API
│   ├── bossService.ts        # Boss API
│   └── [feature]Service.ts   # Pattern: API calls for feature
│
├── lib/
│   ├── api.ts                # API client with offline support
│   ├── queryKeys.ts          # TanStack Query key factory
│   ├── logger.ts             # Logging (use instead of console)
│   ├── utils.ts              # cn() for classnames
│   └── satori/               # Discord image generation
│       ├── components/       # Satori image components
│       └── utils/            # Satori utilities
│
├── types/
│   ├── character.ts          # Character interfaces
│   ├── tracker.ts            # Task tracker types
│   ├── boss.ts               # Boss types (also in core)
│   └── [feature].ts          # Pattern: types per feature
│
└── utils/
    ├── string.ts             # capitalize, etc.
    ├── formatNumber.ts       # Number formatting
    └── [category].ts         # Utility functions
```

## Key Files Quick Reference

### "I want to add a new page"
```
apps/web/src/app/[feature]/page.tsx     # Create page
apps/web/src/app/[feature]/layout.tsx   # Optional layout
```

### "I want to add a new component"
```
apps/web/src/components/[feature]/[ComponentName].tsx
apps/web/src/components/[feature]/index.ts  # Export from index
```

### "I want to add a new hook"
```
apps/web/src/hooks/use[Feature].ts
# Follow pattern from useCharacters.ts or useBosses.ts
```

### "I want to add a new API endpoint"
```
apps/api/src/routes/v3/[feature].ts     # Create route file
apps/api/index.ts                        # Register route
```

### "I want to add a game calculation"
```
apps/web/src/services/calculations/[feature]CalculationService.ts
# Follow pattern from starforceCalculationService.ts
```

### "I want to add a Discord command"
```
apps/discord/src/commands/subcommands/[command].ts
apps/discord/src/commands/mt.ts          # Register in main group
```

## Pattern Examples

### Component → Hook → Service Pattern

**Best example:** Character management

| Layer | File | Purpose |
|-------|------|---------|
| Component | `app/characters/components/CharacterList.tsx` | Renders UI |
| Hook | `hooks/useCharacters.ts` | TanStack Query, state |
| Service | `services/characterService.ts` | API calls |
| Types | `types/character.ts` | Interfaces |

### TanStack Query Pattern

**Best example:** `hooks/useBosses.ts`
```typescript
// Query key from factory
import { queryKeys } from '@/lib/queryKeys';

// Query with caching
const { data, isLoading } = useQuery({
  queryKey: queryKeys.bosses.all,
  queryFn: () => bossService.getBosses(),
});
```

### Calculation Service Pattern

**Best example:** `services/calculations/starforceCalculationService.ts`
- Pure functions, no side effects
- All game math constants defined at top
- Exported functions for each calculation type

### API Route Pattern

**Best example:** `apps/api/src/routes/v3/characters.ts`
- Express router with typed handlers
- Uses services from `@mapletools/core`
- Rate limiting applied per-route

## Common Modifications

### Add a new calculator

1. Create service: `services/calculations/[name]CalculationService.ts`
2. Create hook: `hooks/use[Name]Calculator.ts`
3. Create page: `app/calculators/[name]/page.tsx`
4. Create components: `components/calculators/[name]/`
5. Add navigation link to calculator list page

### Add a new tracker task type

1. Update types: `packages/core/src/types/tasks.ts`
2. Add migration: `supabase/migrations/`
3. Update service: `services/tracker/trackerService.ts`
4. Update hook: `hooks/useTracker.ts`
5. Update components: `components/tracker/`

### Add a new Discord image command

1. Create Satori component: `lib/satori/[Name]Image.tsx`
2. **Use `/satori-validator` skill** to validate
3. Create API route: `app/api/[name]/image/route.ts`
4. Create Discord command: `apps/discord/src/commands/subcommands/[name].ts`

### Add a new admin feature

1. Create page: `app/admin/[feature]/page.tsx`
2. Create components: `components/admin/[Feature]*.tsx`
3. Add API route: `apps/api/src/routes/admin/[feature].ts`
4. Add navigation link to admin layout

## Database

### Schema location
```
packages/core/src/types/database.ts  # Generated types
supabase/migrations/                  # SQL migrations
```

### Key tables
- `users` - User accounts
- `characters` - Saved characters
- `tasks` - Task definitions
- `user_task_completions` - Task tracking
- `bosses` - Boss information
- `boss_difficulties` - Difficulty levels
- `admin_audit_log` - Admin actions

### After schema changes
```bash
npm run db:types:dev  # Regenerate TypeScript types
```

## Import Aliases

Always use absolute imports with `@/` alias:
```typescript
// Good
import { Button } from '@/components/ui/button';
import { useCharacters } from '@/hooks/useCharacters';
import { characterService } from '@/services/characterService';

// Bad - never use relative imports
import { Button } from '../../../components/ui/button';
```

## File Size Reference

Large files that may need context:
| File | Lines | Notes |
|------|-------|-------|
| `trackerService.ts` | 1217 | API calls, needs authenticatedFetch refactor |
| `components/simulators/maintenance/MaintenanceSimulator.tsx` | 1216 | Complex simulator |
| `CharacterDetailClient.tsx` | 1053 | Character detail page |
| `useTracker.ts` | 997 | Task tracker state |
| `settings/page.tsx` | 975 | Settings page |
