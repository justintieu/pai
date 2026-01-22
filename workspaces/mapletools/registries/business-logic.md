# MapleTools Business Logic Registry

This registry documents the actual business rules implemented across the MapleTools codebase, verified against source code.

---

## 1. Task Tracker

### Key Files
- `packages/core/src/services/tasks/TaskCompletionService.ts` - Core completion logic
- `packages/core/src/services/tasks/TaskDefinitionService.ts` - Task definitions
- `packages/core/src/types/tasks.ts` - Task type definitions
- `apps/web/src/services/tracker/trackerService.ts` - Frontend tracker API

### Business Rules

#### Task Types
- **Tracking Types**: `checkbox`, `number`, `text`, `boss`
- Boss tasks have associated `crystalValue` and `maxPartySize`

#### Reset Logic
Reset types determine when task completions expire:
- **daily**: Resets at 00:00 UTC daily
- **weekly**: Resets on specified `resetDay` (0=Sunday, 4=Thursday)
- **monthly**: Resets on 1st of each month at 00:00 UTC
- **never**: One-time tasks, never reset

Default weekly reset day is Thursday (4) if not specified.

#### Period Calculation (from `TaskCompletionService.ts`)
```typescript
// Weekly period starts on the reset day, looking backwards
const targetDay = resetDay ?? 4; // Thursday default
const currentDay = utcNow.getUTCDay();
let daysToSubtract = currentDay - targetDay;
if (daysToSubtract < 0) daysToSubtract += 7;
```

#### Completion Rules
- Completions are unique per: `user_id + character_id + task_definition_id + reset_period_start`
- Party size can be stored with boss completions (1-6)
- Optional tracking: `clearTimeSeconds`, `deathCount`, `notes`, `numericValue`, `textValue`

#### Task Overrides ("This Week Only")
- Allows temporary difficulty changes without modifying permanent assignments
- Override stored in `character_task_overrides` table
- Override only applies to current reset period
- Original task stays enabled; UI shows override task instead

### Cross-Cutting Concerns
- All timestamps use UTC
- Character-specific task settings (enabled, sort order, preferred party size)
- Custom tasks created by users have `is_system = false`

### Regression Checklist
- [ ] Verify reset period calculation for all reset types
- [ ] Test task override creation and expiration
- [ ] Confirm completion uniqueness constraint
- [ ] Test bulk complete/uncomplete operations

---

## 2. Boss Tracking

### Key Files
- `packages/core/src/types/boss.ts` - Boss type definitions
- `apps/web/src/services/calculations/mesoCalculationService.ts` - Crystal calculations
- `apps/web/src/utils/world.ts` - World/meso multiplier logic
- `apps/web/src/services/tracker/trackerService.ts` - Boss preset APIs

### Business Rules

#### Boss Difficulties
Valid difficulty levels: `'Easy' | 'Normal' | 'Hard' | 'Chaos' | 'Extreme'`

#### Boss Mechanics (from `BossMechanics` type)
```typescript
interface BossMechanics {
  maxPartySize?: number;    // Default: 6
  timeLimit?: number;       // In seconds
  livesType?: 'individual' | 'shared';
  livesCount?: number;
  livesShared?: boolean;
  phases?: BossPhase[];
}
```

#### Crystal Calculations

**Formula** (from `world.ts`):
```typescript
crystalMesos = Math.floor((crystalValue * worldMultiplier) / partySize)
```

**World Multipliers**:
- Regular worlds: 1x
- Reboot/Heroic worlds: 5x (REBOOT_MESO_MULTIPLIER)

**Reboot Worlds** (case-insensitive):
- kronos
- hyperion
- solis
- challengers-heroic

#### Weekly Crystal Cap (from `mesoCalculationService.ts`)
- **180 crystals per world per week**
- Cap applied per world, not per account
- Top 14 weekly bosses by meso value count towards cap
- Daily bosses count as 7 potential crystals/week each
- Monthly bosses count as 1 crystal

#### Party Size
- Range: 1-6
- Affects meso calculation: `crystalValue / partySize`
- Stored per task as `preferredPartySize` in character settings

### Boss Presets
- User-created collections of bosses with party sizes
- Can be applied to multiple characters
- Presets store: `bossDifficultyId` + optional `partySize`

### Cross-Cutting Concerns
- Crystal values stored in database as strings (parsed to int)
- Boss frequency: `'daily' | 'weekly' | 'monthly'`
- Boss drops tracked separately with `dropWeek` date

### Regression Checklist
- [ ] Verify 5x multiplier for reboot worlds
- [ ] Test 180 crystal cap calculation
- [ ] Confirm party size affects meso calculation correctly
- [ ] Test boss preset creation and application

---

## 3. StarForce Calculator

### Key Files
- `packages/core/src/constants/starforceRates.ts` - Success rates and cost formulas
- `apps/web/src/services/calculations/starforceCalculationService.ts` - Simulation logic

### Business Rules

#### Star Catch Multiplier
**Verified: Star catch multiplies success rate by 1.05x** (5% relative increase)

From `starforceCalculationService.ts` line 199:
```typescript
if (starCatch) {
  const newSuccess = success * 1.05;
  // ... redistributes remaining probability
}
```

#### Server Types
- `GMS` - Current GMS (30-star system, uses KMS rates post-Ignition)
- `GMS_PRE_30` - GMS before 30 star patch
- `GMS_PRE_SAVIOR` - GMS before Savior update
- `KMS` - Korean MapleStory
- `TMS` - Taiwan MapleStory
- `TMS_REBOOT` - Taiwan Reboot (caps item level at 150)

#### Success Rate Ranges (GMS/KMS)
| Stars | Success | Notes |
|-------|---------|-------|
| 0-10 | 95% to 50% | No boom, no decrease |
| 11-14 | 45% to 30% | No boom, no decrease (maintain instead) |
| 15-19 | 30% to 15% | Boom enabled (2.1% to 8.5%) |
| 20 | 30% | 10.5% boom |
| 21-29 | 15% to 1% | Increasing boom rates |

#### Safeguard
- Available at stars 12-17 (GMS/KMS)
- Prevents boom at cost of extra mesos
- Multiplier increase for GMS/KMS stars 15-17: +2x base cost

#### Boom Reset Levels (GMS 30-star system)
| Current Star | Reset To |
|--------------|----------|
| < 20 | 12 |
| 20 | 15 |
| 21-22 | 17 |
| 23-25 | 19 |
| 26+ | 20 |

All other servers reset to 12.

#### Cost Formula
```
100 * Math.round(multiplier * (floor(itemLevel/10)*10)^3 * (currentStar+1)^exponent / divisor + 10)
```

#### Discount Rules
- MVP discount (3%, 5%, 10%): Only applies to stars 0-15
- 30% event discount: Applies to base cost only, not safeguard premium

#### Events
- **5/10/15 Event**: 100% success at stars 5, 10, 15 (old systems only, not GMS)
- **+2 Stars Event**: Gain 2 stars on success (up to star 10)
- **30% Boom Reduction**: Converts 30% of boom chance to maintain

### Cross-Cutting Concerns
- Monte Carlo simulation with configurable trial count (default: 1000)
- Statistics include: avg, median, percentiles (75th, 85th, 95th)
- Boom distribution histogram available

### Regression Checklist
- [ ] Verify star catch is exactly 1.05x multiplier
- [ ] Test safeguard cost calculation
- [ ] Confirm boom reset levels for GMS 30-star
- [ ] Test MVP discount only applies to stars 0-15
- [ ] Verify 30% event discount doesn't affect safeguard

---

## 4. Character Management

### Key Files
- `apps/web/src/types/character.ts` - Character types
- `apps/web/src/services/characterService.ts` - Character CRUD
- `apps/web/src/app/characters/components/EditCharacterModal.tsx` - Edit form
- `packages/core/src/constants/userTiers.ts` - Tier limits

### Business Rules

#### Level Range
- **Minimum**: 1
- **Maximum**: 300

From `EditCharacterModal.tsx` line 49-51:
```typescript
max="300"
min="1"
onChange={(e) => onFormChange({ ...formData, level: Math.max(1, Math.min(300, parseInt(e.target.value) || 1)) })}
```

#### Character Limits
**All tiers have Infinity characters** (no tier-based limits)

From `userTiers.ts`:
```typescript
FREE: { characters: Infinity, ... },
PAID: { characters: Infinity, ... },
BLOGGER: { characters: Infinity, ... },
DEVELOPER: { characters: Infinity, ... },
ADMIN: { characters: Infinity, ... },
SUPER_ADMIN: { characters: Infinity, ... },
```

#### Character Properties
- `name`: Required
- `level`: 1-300 (optional)
- `region`: `'na' | 'eu'`
- `world`: Server name (e.g., "Bera", "Kronos")
- `isMain`: Boolean, one per user
- `avatarImage`: Character image URL
- `hasGenesisPass`: Boolean
- `jobId` / `jobDetail`: Class information
- `sequence`: Order/position

### Cross-Cutting Concerns
- Characters belong to users (user_id foreign key)
- Main character used as default for certain operations
- Character world affects boss meso calculations (reboot multiplier)

### Regression Checklist
- [ ] Verify level clamping between 1-300
- [ ] Test main character designation
- [ ] Confirm character limit is unlimited for all tiers
- [ ] Test region/world selection

---

## 5. Reset Timers

### Key Files
- `apps/web/src/services/resetTimerService.ts` - All reset calculations

### Business Rules

#### Daily Reset
- Resets at **00:00 UTC**
- If current hour >= 0, next reset is tomorrow

```typescript
if (now.getUTCHours() >= 0) {
  nextDaily.setUTCDate(now.getUTCDate() + 1);
}
nextDaily.setUTCHours(0, 0, 0, 0);
```

#### Wednesday Reset (Boss Reset for some regions)
- Resets every **Wednesday at 00:00 UTC**
- Day calculation: Wednesday = 3

```typescript
const currentDay = now.getUTCDay();
const daysUntilWednesday = currentDay === 3 ? 7 : currentDay < 3 ? 3 - currentDay : 10 - currentDay;
```

#### Thursday Reset (Boss Reset for GMS)
- Resets every **Thursday at 00:00 UTC**
- Day calculation: Thursday = 4

```typescript
const currentDay = now.getUTCDay();
const daysUntilThursday = currentDay === 4 ? 7 : currentDay < 4 ? 4 - currentDay : 11 - currentDay;
```

#### Monthly Reset
- Resets on **1st of each month at 00:00 UTC**

```typescript
if (now.getUTCDate() >= 1) {
  nextMonthly.setUTCMonth(now.getUTCMonth() + 1);
}
nextMonthly.setUTCDate(1);
nextMonthly.setUTCHours(0, 0, 0, 0);
```

### Time Remaining Format
Display format: `{days}d {HH}h {MM}m {SS}s`
- Days only shown if > 0
- Hours/minutes/seconds always zero-padded to 2 digits

### Cross-Cutting Concerns
- All calculations use UTC to avoid timezone issues
- Weekly task reset day configurable per task (default: Thursday)

### Regression Checklist
- [ ] Verify Wednesday reset calculation
- [ ] Verify Thursday reset calculation
- [ ] Test monthly reset at end of month (28/29/30/31 days)
- [ ] Confirm time remaining formatting

---

## 6. User Settings

### Key Files
- `apps/web/src/app/settings/page.tsx` - Settings UI
- `apps/web/src/services/tracker/trackerService.ts` - Difficulty preference API

### Business Rules

#### Settings Sections
1. **Account** (logged-in only)
   - Email (read-only)
   - Username (min 3 chars, no spaces)
   - Display Name (min 3 chars)
   - Profile Picture (select from saved characters)

2. **Preferences** (logged-in only)
   - Public Profile toggle
   - Boss Difficulty Change preference:
     - "Always ask" (null/undefined)
     - "This week only" (`'thisWeek'`)
     - "Remember my choice" (`'permanent'`)

3. **Notifications** (all users)
   - Push Notifications toggle (browser)
   - Email Notifications toggle (logged-in only)

4. **Data Management** (all users)
   - Storage Usage display (localStorage, 5MB max)
   - Export Data (JSON backup)
   - Import Data (restore from backup)
   - Clear Local Storage
   - Clear Cache (IndexedDB + service worker)
   - Clear All Data

#### Storage Calculation
```typescript
const MAX_STORAGE_BYTES = 5 * 1024 * 1024; // 5MB
// JS strings are UTF-16, so each character is 2 bytes
totalSize += (key.length + value.length) * 2;
```

### Settings That Do NOT Exist
- Theme toggle (not in current settings page)
- Compact Mode (not in current settings page)

### Cross-Cutting Concerns
- Sensitive keys preserved during clear: `supabase.auth.token`
- Export excludes auth tokens for security
- Push notification state stored in localStorage

### Regression Checklist
- [ ] Verify username validation (3 chars, no spaces)
- [ ] Test export/import data flow
- [ ] Confirm difficulty preference persistence
- [ ] Test push notification permission flow

---

## 7. User Tiers

### Key Files
- `packages/core/src/constants/userTiers.ts` - Tier definitions and limits

### Business Rules

#### Tier Types
```typescript
const USER_TIERS = {
  ADMIN: 'ADMIN',
  BLOGGER: 'BLOGGER',
  DEVELOPER: 'DEVELOPER',
  FREE: 'FREE',
  PAID: 'PAID',
  SUPER_ADMIN: 'SUPER_ADMIN',
};
```

#### Tier Limits

| Tier | Characters | API Requests/Hour | Blog Posts/Month | Webhooks |
|------|------------|-------------------|------------------|----------|
| FREE | Infinity | 60 | 0 | 0 |
| PAID | Infinity | 1,000 | 50 | 10 |
| BLOGGER | Infinity | 60 | 10 | 0 |
| DEVELOPER | Infinity | 60 | 0 | 1 |
| ADMIN | Infinity | 5,000 | 200 | 50 |
| SUPER_ADMIN | Infinity | Infinity | Infinity | Infinity |

**Key Finding**: All tiers have unlimited characters (`Infinity`).

### Cross-Cutting Concerns
- Tier determines API rate limits
- Webhook limits for Discord/external integrations
- Blog post limits for content creation features

### Regression Checklist
- [ ] Verify API rate limiting per tier
- [ ] Test webhook limit enforcement
- [ ] Confirm character creation has no limit
- [ ] Test blog post limit for BLOGGER tier

---

## Cross-Feature Business Rules

### UTC Consistency
- All server-side timestamps use UTC
- Reset timers calculated in UTC
- Period start calculations use `getUTCDay()`, `getUTCDate()`, etc.

### Authentication Flow
- Session tokens stored in localStorage
- Bearer token authentication for API calls
- Automatic 401 handling with redirect to login

### Offline Support
- Service worker caching for PWA
- IndexedDB for offline data storage
- localStorage for quick settings access

### Meso Calculation Chain
1. Boss has `crystalValue` (base mesos)
2. Party size divides value
3. World type applies multiplier (1x or 5x)
4. 180 weekly cap applied per world
5. Top 14 weekly bosses prioritized by value

---

## Calculation Services Reference

All game math must go through these services. Never inline calculations.

| Service | Purpose | Key Functions |
|---------|---------|---------------|
| `starforceCalculationService.ts` | SF enhancement | `calculateStarforceCost`, `getStarforceSuccessRate`, `runStarforceSimulation` |
| `cubingCalculationService.ts` | Cube probabilities | Cube tier calculations |
| `flameCalculationService.ts` | Flame stat values | Flame score calculations |
| `mesoCalculationService.ts` | Meso calculations | `calculateBossMesos`, `calculateWeeklyMesoStats`, `calculateAccountWideMesoStats` |

**Rule:** If you change calculation logic, verify against in-game values and update Discord commands too.
