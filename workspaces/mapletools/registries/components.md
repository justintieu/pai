# Component Registry

Comprehensive catalog of all components in the MapleTools codebase.

**Total Components: 217**

---

## UI Primitives (`components/ui/`)

**Count: 19 components**

Base components from shadcn/ui built with Radix primitives. Use these as building blocks.

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| `Accordion` | `accordion.tsx` | Collapsible content sections | `type`, `collapsible`, `defaultValue` |
| `Badge` | `badge.tsx` | Status indicators and labels | `variant` (default, secondary, destructive, outline) |
| `Button` | `button.tsx` | Actions and navigation | `variant` (default, destructive, outline, secondary, ghost, link), `size` (default, sm, lg, icon), `asChild` |
| `Card` | `card.tsx` | Content containers | Exports: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `Command` | `command.tsx` | Command palette / searchable list | Built on cmdk. Exports: `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator` |
| `Dialog` | `dialog.tsx` | Modal dialogs | `open`, `onOpenChange`, `hideCloseButton`. Exports: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` |
| `DropdownMenu` | `dropdown-menu.tsx` | Action menus and context menus | Radix-based. Exports: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuGroup`, `DropdownMenuSub` |
| `Input` | `input.tsx` | Text input field | Standard HTML input props |
| `MultiSelect` | `multi-select.tsx` | Multi-selection dropdown with search | `options`, `value`, `onValueChange`, `placeholder`, `variant`, `animation`, `maxCount` |
| `NavigationMenu` | `navigation-menu.tsx` | Site navigation with mega menu support | Radix-based. Exports: `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink` |
| `Popover` | `popover.tsx` | Floating content container | `open`, `onOpenChange`. Exports: `Popover`, `PopoverTrigger`, `PopoverContent` |
| `Select` | `select.tsx` | Single-selection dropdown | `value`, `onValueChange`, `noBackground`, `noBorder`, `showChevron`, `width`. Exports: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator` |
| `Separator` | `separator.tsx` | Visual divider line | `orientation` (horizontal, vertical), `decorative` |
| `Sheet` | `sheet.tsx` | Slide-out panel (drawer) | `side` (top, right, bottom, left). Exports: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose` |
| `Tabs` | `tabs.tsx` | Tab navigation | `value`, `onValueChange`, `defaultValue`. Exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `Toast` | `toast.tsx` | Toast notification primitives | Used with `useToast()` hook. Exports: `Toast`, `ToastAction`, `ToastClose`, `ToastTitle`, `ToastDescription`, `ToastProvider`, `ToastViewport` |
| `Toaster` | `toaster.tsx` | Toast container component | Place in layout to enable toasts |
| `Tooltip` | `tooltip.tsx` | Hover tooltips | Exports: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` |
| `use-toast.ts` | `use-toast.ts` | Toast hook | `toast()`, `dismiss()` |

---

## Layout Components (`components/layout/`)

**Count: 9 components**

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| `AdScript` | `AdScript.tsx` | Ad script injection | - |
| `Footer` | `Footer.tsx` | Site footer with links | - |
| `Header` | `Header.tsx` | Top navigation bar with mega menu | - |
| `HeaderUserMenu` | `HeaderUserMenu.tsx` | User dropdown menu in header | - |
| `MegaMenu` | `MegaMenu.tsx` | Mega menu navigation dropdown | - |
| `MobileBottomSheet` | `MobileBottomSheet.tsx` | Mobile navigation bottom sheet | - |
| `NavigationLoader` | `NavigationLoader.tsx` | Page transition loading indicator | - |
| `SearchBar` | `SearchBar.tsx` | Global search input | - |
| `ServiceWorkerRegister` | `ServiceWorkerRegister.tsx` | PWA service worker registration | - |

---

## Common Components (`components/common/`)

**Count: 7 components**

| Component | File | Purpose | Key Props |
|-----------|------|---------|-----------|
| `Calendar` | `Calendar.tsx` | Date picker calendar | Custom calendar implementation |
| `CharacterDropdown` | `CharacterDropdown.tsx` | Character selector dropdown | `characters`, `value`, `onChange`, `searchable`, `placeholder` |
| `CollapsibleCard` | `CollapsibleCard.tsx` | Expandable card with header | `title`, `children`, `expanded`, `onExpandedChange`, `avatarUrl`, `world`, `isMain`, `isComplete`, `progress`, `actions` |
| `ComingSoon` | `ComingSoon.tsx` | Coming soon placeholder | - |
| `ComingSoonCard` | `ComingSoonCard.tsx` | Coming soon card variant | - |
| `GlobalNotificationPopup` | `GlobalNotificationPopup.tsx` | Site-wide notification popup | - |
| `ResetTimers` | `ResetTimers.tsx` | Daily/weekly reset countdown timers | - |

---

## Filter Components (`components/filters/`)

**Count: 3 components**

| Component | File | Purpose |
|-----------|------|---------|
| `ActiveFilters` | `ActiveFilters.tsx` | Display active filter badges |
| `FilterSheet` | `FilterSheet.tsx` | Filter panel in sheet/drawer |
| `SearchInput` | `SearchInput.tsx` | Search input field |

---

## Admin Components (`components/admin/`)

**Count: 46 components**

### User Management

| Component | File | Purpose |
|-----------|------|---------|
| `UserTable` | `UserTable.tsx` | User management data table |
| `UserCard` | `UserCard.tsx` | User info card display |
| `UserDetailsModal` | `UserDetailsModal.tsx` | Detailed user information modal |
| `UserStatsModal` | `UserStatsModal.tsx` | User statistics modal |
| `UserListModal` | `UserListModal.tsx` | User list modal |
| `UserActivityPanel` | `UserActivityPanel.tsx` | User activity display |
| `EditUserModal` | `EditUserModal.tsx` | Edit user dialog |
| `TierBadge` | `TierBadge.tsx` | User tier/rank badge |

### Boss Editor

| Component | File | Purpose |
|-----------|------|---------|
| `BossMasterDetail` | `BossMasterDetail.tsx` | Boss list and detail master-detail view |
| `BossEditorForm` | `BossEditorForm.tsx` | Boss CRUD form |
| `BossInfoCard` | `BossInfoCard.tsx` | Boss information card |
| `DifficultyList` | `DifficultyList.tsx` | Difficulty list display |
| `DifficultyEditor` | `DifficultyEditor.tsx` | Difficulty management editor |
| `DifficultyDetailPanel` | `DifficultyDetailPanel.tsx` | Difficulty detail panel |
| `DifficultySelector` | `DifficultySelector.tsx` | Difficulty selection dropdown |
| `DropsEditor` | `DropsEditor.tsx` | Boss drops editor |
| `MechanicsEditor` | `MechanicsEditor.tsx` | Boss mechanics editor |
| `MechanicsJsonEditor` | `MechanicsJsonEditor.tsx` | Raw JSON mechanics editor |
| `PhasesSection` | `PhasesSection.tsx` | Boss phases section |
| `PhaseEditor` | `PhaseEditor.tsx` | Individual phase editor |
| `CustomPropertiesSection` | `CustomPropertiesSection.tsx` | Custom properties editor |

### Item Editor

| Component | File | Purpose |
|-----------|------|---------|
| `ItemMasterDetail` | `ItemMasterDetail.tsx` | Item list and detail view |
| `ItemList` | `ItemList.tsx` | Item list display |
| `ItemDetailPanel` | `ItemDetailPanel.tsx` | Item detail panel |
| `ItemAddPanel` | `ItemAddPanel.tsx` | Add new item panel |
| `AdminItemSelector` | `AdminItemSelector.tsx` | Admin item selector dropdown |

### Task Management

| Component | File | Purpose |
|-----------|------|---------|
| `NewTaskModal` | `NewTaskModal.tsx` | Create new task modal |
| `EditTaskModal` | `EditTaskModal.tsx` | Edit task modal |
| `BulkAddTasksModal` | `BulkAddTasksModal.tsx` | Bulk task creation modal |
| `ImportTasksModal` | `ImportTasksModal.tsx` | Import tasks from file |

### Admin UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `AdminRoute` | `AdminRoute.tsx` | Admin route guard/wrapper |
| `AdminActivityPanel` | `AdminActivityPanel.tsx` | Admin activity display |
| `AdminActivityChart` | `AdminActivityChart.tsx` | Activity chart visualization |
| `AdminStatsCards` | `AdminStatsCards.tsx` | Dashboard stats cards |
| `StatCard` | `StatCard.tsx` | Individual stat card |
| `BotStatsPanel` | `BotStatsPanel.tsx` | Discord bot stats panel |
| `ConfirmDialog` | `ConfirmDialog.tsx` | Confirmation dialog |
| `ImageUploader` | `ImageUploader.tsx` | Image upload component |
| `ImageComparisonTool` | `ImageComparisonTool.tsx` | Image comparison tool |
| `NestedObjectEditor` | `NestedObjectEditor.tsx` | Nested object JSON editor |
| `RawJsonEditor` | `RawJsonEditor.tsx` | Raw JSON editor |
| `MetadataPreview` | `MetadataPreview.tsx` | Metadata preview display |
| `ModeToggle` | `ModeToggle.tsx` | View mode toggle |
| `EnvironmentToggle` | `EnvironmentToggle.tsx` | Environment switch toggle |
| `SortIcon` | `SortIcon.tsx` | Table sort indicator icon |

---

## Tracker Components (`components/tracker/`)

**Count: 15 components + 8 sub-components**

### Main Tracker Components

| Component | File | Purpose |
|-----------|------|---------|
| `TrackerContent` | `TrackerContent.tsx` | Main tracker page content |
| `BossesContent` | `BossesContent.tsx` | Boss tracking content |
| `TasksContent` | `TasksContent.tsx` | Task tracking content |
| `DropsContent` | `DropsContent.tsx` | Drop tracking content |
| `CharacterTaskCard` | `CharacterTaskCard.tsx` | Character task card wrapper |
| `CharacterTaskCardContent` | `CharacterTaskCardContent.tsx` | Character task card content |
| `FrequencyCard` | `FrequencyCard.tsx` | Task frequency card |
| `BossCard` | `BossCard.tsx` | Boss display card |
| `BossRow` | `BossRow.tsx` | Boss row in list view |
| `TaskRow` | `TaskRow.tsx` | Task row display |
| `FilterDrawer` | `FilterDrawer.tsx` | Tracker filter drawer |
| `MesoWeeklyModal` | `MesoWeeklyModal.tsx` | Weekly meso summary modal |

### Assign Items (`components/tracker/assign-items/`)

| Component | File | Purpose |
|-----------|------|---------|
| `AssignItemsModal` | `AssignItemsModal.tsx` | Task/boss assignment modal |
| `BossSelectionGrid` | `BossSelectionGrid.tsx` | Boss selection grid |
| `TaskSelectionGrid` | `TaskSelectionGrid.tsx` | Task selection grid |
| `CharacterSelectionGrid` | `CharacterSelectionGrid.tsx` | Character selection grid |
| `CustomTaskModal` | `CustomTaskModal.tsx` | Create custom task modal |
| `PresetsTab` | `PresetsTab.tsx` | Presets management tab |
| `SavePresetModal` | `SavePresetModal.tsx` | Save preset modal |
| `EditPresetModal` | `EditPresetModal.tsx` | Edit preset modal |

---

## Boss Detail Components (`components/boss-detail/`)

**Count: 8 components**

| Component | File | Purpose |
|-----------|------|---------|
| `BossDetail` | `BossDetail.tsx` | Full boss detail page |
| `BossHeader` | `BossHeader.tsx` | Boss header with image |
| `BossDifficultySelector` | `BossDifficultySelector.tsx` | Difficulty tab selector |
| `BossMetrics` | `BossMetrics.tsx` | Boss metrics display |
| `BossPhases` | `BossPhases.tsx` | Boss phase breakdown |
| `BossRewards` | `BossRewards.tsx` | Boss reward/drop display |

### Metrics Sub-components (`components/boss-detail/metrics/`)

| Component | File | Purpose |
|-----------|------|---------|
| `DeterminationMetric` | `DeterminationMetric.tsx` | Determination stacks metric |
| `TraceMetric` | `TraceMetric.tsx` | Trace cost metric |

---

## Boss Components (`components/boss/`)

**Count: 1 component**

| Component | File | Purpose |
|-----------|------|---------|
| `PhaseHPBars` | `PhaseHPBars.tsx` | Phase HP bar visualization |

---

## Calculator Components (`components/calculators/`)

**Count: 14 components**

### Starforce Calculator (`components/calculators/starforce/`)

| Component | File | Purpose |
|-----------|------|---------|
| `StarforceCalculator` | `StarforceCalculator.tsx` | Main starforce calculator |
| `StarforceInputs` | `StarforceInputs.tsx` | Starforce input controls |
| `StarforceResults` | `StarforceResults.tsx` | Starforce calculation results |
| `BoomDistributionChart` | `BoomDistributionChart.tsx` | Boom probability chart |

### Cubing Calculator (`components/calculators/cubing/`)

| Component | File | Purpose |
|-----------|------|---------|
| `CubingCalculator` | `CubingCalculator.tsx` | Main cubing calculator |
| `CubingInputs` | `CubingInputs.tsx` | Cubing input controls |
| `CubingResults` | `CubingResults.tsx` | Cubing calculation results |
| `DesiredStatsSelector` | `DesiredStatsSelector.tsx` | Desired stats selection |
| `ProbabilityChart` | `ProbabilityChart.tsx` | Probability visualization |

### Flame Calculator (`components/calculators/flame/`)

| Component | File | Purpose |
|-----------|------|---------|
| `FlameCalculator` | `FlameCalculator.tsx` | Main flame calculator |
| `FlameInputs` | `FlameInputs.tsx` | Flame input controls |
| `FlameResults` | `FlameResults.tsx` | Flame calculation results |
| `StatWeightsConfig` | `StatWeightsConfig.tsx` | Stat weights configuration |

### IED Calculator (`components/calculators/ied/`)

| Component | File | Purpose |
|-----------|------|---------|
| `IEDCalculator` | `IEDCalculator.tsx` | IED (Ignore Enemy Defense) calculator |

### Traces Calculator

| Component | File | Purpose |
|-----------|------|---------|
| `TracesRestorationCalculator` | `TracesRestorationCalculator.tsx` | Traces restoration cost calculator |

---

## Tools Components (`components/tools/`)

**Count: 25 components**

### Tool Listing

| Component | File | Purpose |
|-----------|------|---------|
| `ToolCard` | `ToolCard.tsx` | Tool preview card |
| `ToolSearch` | `ToolSearch.tsx` | Tool search input |
| `ToolFilters` | `ToolFilters.tsx` | Tool category filters |
| `ToolFiltersSheet` | `ToolFiltersSheet.tsx` | Tool filters in sheet |
| `ToolFilterDrawer` | `ToolFilterDrawer.tsx` | Tool filter drawer |
| `ActiveFilters` | `ActiveFilters.tsx` | Active filter badges |

### Hexa Tool (`components/tools/hexa/`)

| Component | File | Purpose |
|-----------|------|---------|
| `HexaClassSelector` | `HexaClassSelector.tsx` | Class selection for Hexa |
| `HexaLeftSidebar` | `HexaLeftSidebar.tsx` | Hexa tool left sidebar |
| `HexaCurrentLevelsSection` | `HexaCurrentLevelsSection.tsx` | Current hexa levels display |
| `HexaProgressionSection` | `HexaProgressionSection.tsx` | Hexa progression display |
| `HexaProgressionHeader` | `HexaProgressionHeader.tsx` | Progression section header |
| `HexaCostETASection` | `HexaCostETASection.tsx` | Cost and ETA section |
| `HexaTotalCostCard` | `HexaTotalCostCard.tsx` | Total cost summary card |
| `HexaETADisplay` | `HexaETADisplay.tsx` | ETA display component |
| `HexaIncomeSourcesConfig` | `HexaIncomeSourcesConfig.tsx` | Income sources configuration |
| `HexaNextSkillCard` | `HexaNextSkillCard.tsx` | Next skill to upgrade card |
| `HexaSkillDropdown` | `HexaSkillDropdown.tsx` | Skill selection dropdown |
| `HexaSkillDetailDialog` | `HexaSkillDetailDialog.tsx` | Skill detail dialog |
| `HexaSkillGuide` | `HexaSkillGuide.tsx` | Hexa skill guide display |
| `HexaVisualTab` | `HexaVisualTab.tsx` | Visual progression tab |
| `HexaRawOrderTab` | `HexaRawOrderTab.tsx` | Raw order data tab |
| `HexaJsonTab` | `HexaJsonTab.tsx` | JSON export tab |
| `HexaExportPreviewDialog` | `HexaExportPreviewDialog.tsx` | Export preview dialog |
| `HexaScrollToTop` | `HexaScrollToTop.tsx` | Scroll to top button |

---

## Simulator Components (`components/simulators/`)

**Count: 23 components**

### Golden Octopus Simulator

| Component | File | Purpose |
|-----------|------|---------|
| `GoldenOctopusSimulator` | `simulators/golden-octopus/GoldenOctopusSimulator.tsx` | Main octopus simulator |

### Maintenance Simulator (`components/simulators/maintenance/`)

| Component | File | Purpose |
|-----------|------|---------|
| `MaintenanceSimulator` | `MaintenanceSimulator.tsx` | Main maintenance game |
| `MaintenanceHeader` | `MaintenanceHeader.tsx` | Game header |
| `MaintenanceHero` | `MaintenanceHero.tsx` | Hero section |
| `MaintenanceFooter` | `MaintenanceFooter.tsx` | Game footer |
| `MaintenanceCards` | `MaintenanceCards.tsx` | Feature cards |
| `MaintenanceSettings` | `MaintenanceSettings.tsx` | Game settings |
| `MaintenanceNewsBar` | `MaintenanceNewsBar.tsx` | Scrolling news bar |
| `MaintenanceAchievements` | `MaintenanceAchievements.tsx` | Achievements display |
| `MaintenanceAchievementToast` | `MaintenanceAchievementToast.tsx` | Achievement toast notification |
| `AchievementGrid` | `AchievementGrid.tsx` | Achievement grid display |
| `AchievementContent` | `AchievementContent.tsx` | Achievement content |
| `AchievementProgress` | `AchievementProgress.tsx` | Achievement progress bar |
| `RecentAchievementsDropdown` | `RecentAchievementsDropdown.tsx` | Recent achievements dropdown |
| `MesoShop` | `MesoShop.tsx` | In-game meso shop |
| `CoinAnimations` | `CoinAnimations.tsx` | Coin animation effects |
| `EasterEggDisplay` | `EasterEggDisplay.tsx` | Easter egg display |
| `ActivateGameInput` | `ActivateGameInput.tsx` | Game activation input |
| `JokePopup` | `JokePopup.tsx` | Joke popup display |
| `MemePopup` | `MemePopup.tsx` | Meme popup display |
| `NewsPopup` | `NewsPopup.tsx` | News popup display |
| `SupportModal` | `SupportModal.tsx` | Support/donate modal |

---

## Golden Octopus Components (`components/golden-octopus/`)

**Count: 11 components**

| Component | File | Purpose |
|-----------|------|---------|
| `ActivityLog` | `ActivityLog.tsx` | Activity log display |
| `AutoFeedDialog` | `AutoFeedDialog.tsx` | Auto-feed configuration dialog |
| `CurrentLevelInfo` | `CurrentLevelInfo.tsx` | Current level information |
| `FeedingProgress` | `FeedingProgress.tsx` | Feeding progress display |
| `OctopusDisplay` | `OctopusDisplay.tsx` | Octopus visual display |
| `OptimalStrategyDialog` | `OptimalStrategyDialog.tsx` | Optimal strategy dialog |
| `ParticipationInfo` | `ParticipationInfo.tsx` | Participation information |
| `RewardTables` | `RewardTables.tsx` | Reward tables display |
| `SessionStatsPanel` | `SessionStatsPanel.tsx` | Session statistics panel |
| `StrategyGuide` | `StrategyGuide.tsx` | Strategy guide display |

---

## Challenger World Components (`components/challenger-world/`)

**Count: 13 components**

| Component | File | Purpose |
|-----------|------|---------|
| `ChallengerCalculator` | `ChallengerCalculator.tsx` | Main Challenger World calculator |
| `ChallengerWorldCalculatorWrapper` | `ChallengerWorldCalculatorWrapper.tsx` | Calculator wrapper with provider |
| `ChallengerHeader` | `ChallengerHeader.tsx` | Challenger section header |
| `BasicSettings` | `BasicSettings.tsx` | Basic settings configuration |
| `BossSelection` | `BossSelection.tsx` | Boss selection grid |
| `PointsBreakdown` | `PointsBreakdown.tsx` | Points breakdown display |
| `TierProgress` | `TierProgress.tsx` | Tier progress visualization |
| `TargetStatus` | `TargetStatus.tsx` | Target status display |
| `SeasonSelector` | `SeasonSelector.tsx` | Season selection dropdown |
| `EventCountdown` | `EventCountdown.tsx` | Event countdown timer |
| `WeeklyBreakdownModal` | `WeeklyBreakdownModal.tsx` | Weekly breakdown modal |
| `WeeklyBreakdownCalendarView` | `WeeklyBreakdownCalendarView.tsx` | Calendar view of weekly breakdown |
| `WeeklyBreakdownListView` | `WeeklyBreakdownListView.tsx` | List view of weekly breakdown |

---

## Liberation Components (`components/liberation/`)

**Count: 9 components**

| Component | File | Purpose |
|-----------|------|---------|
| `LiberationCalendar` | `LiberationCalendar.tsx` | Liberation tracking calendar |
| `CalendarHeader` | `CalendarHeader.tsx` | Calendar header controls |
| `CalendarDayCell` | `CalendarDayCell.tsx` | Individual day cell |
| `WeekEventOverlay` | `WeekEventOverlay.tsx` | Week event overlay |
| `BossSelector` | `BossSelector.tsx` | Boss selection for liberation |
| `CommanderSelector` | `CommanderSelector.tsx` | Commander selection |
| `LiberationTypeSelector` | `LiberationTypeSelector.tsx` | Liberation type selector |
| `ProgressSummary` | `ProgressSummary.tsx` | Liberation progress summary |
| `ListView` | `ListView.tsx` | Liberation list view |

---

## Dashboard Components (`components/dashboard/`)

**Count: 2 components**

| Component | File | Purpose |
|-----------|------|---------|
| `RecentActivityCard` | `RecentActivityCard.tsx` | Recent activity card display |
| `RecentActivityList` | `RecentActivityList.tsx` | Recent activity list |

---

## Character Components (`components/characters/`)

**Count: 1 component**

| Component | File | Purpose |
|-----------|------|---------|
| `CharacterPageLayout` | `CharacterPageLayout.tsx` | Character page layout wrapper |

---

## Command Palette Components (`components/command-palette/`)

**Count: 4 components**

| Component | File | Purpose |
|-----------|------|---------|
| `CommandPalette` | `CommandPalette.tsx` | Global command palette (Cmd+K) |
| `CommandPaletteFooter` | `CommandPaletteFooter.tsx` | Command palette footer |
| `useCommandPaletteCommands` | `useCommandPaletteCommands.tsx` | Command definitions hook |
| `useFilteredCommands` | `useFilteredCommands.tsx` | Command filtering hook |

---

## Icon Components (`components/icons/`)

**Count: 2 components**

| Component | File | Purpose |
|-----------|------|---------|
| `DiscordIcon` | `DiscordIcon.tsx` | Discord brand icon |
| `KofiIcon` | `KofiIcon.tsx` | Ko-fi brand icon |

---

## Miscellaneous Components

| Component | File | Purpose |
|-----------|------|---------|
| `BuildDetector` | `BuildDetector.tsx` | Detects new builds for update prompts |
| `HandsTest` | `hands-test/HandsTest.tsx` | Testing component |

---

## Component Patterns

### Standard Component Structure
```typescript
// components/[feature]/[ComponentName].tsx
'use client'; // if client-side interactivity needed

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFeature } from '@/hooks/useFeature';

interface ComponentNameProps {
  prop1: string;
  onAction?: () => void;
}

export function ComponentName({ prop1, onAction }: ComponentNameProps) {
  const { data, isLoading } = useFeature();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### Export Pattern
```typescript
// components/[feature]/index.ts
export { ComponentName } from './ComponentName';
export { AnotherComponent } from './AnotherComponent';
```

---

## Directory Summary

| Directory | Component Count |
|-----------|-----------------|
| `ui/` | 19 |
| `layout/` | 9 |
| `common/` | 7 |
| `filters/` | 3 |
| `admin/` | 46 |
| `tracker/` | 15 |
| `tracker/assign-items/` | 8 |
| `boss-detail/` | 6 |
| `boss-detail/metrics/` | 2 |
| `boss/` | 1 |
| `calculators/starforce/` | 4 |
| `calculators/cubing/` | 5 |
| `calculators/flame/` | 4 |
| `calculators/ied/` | 1 |
| `calculators/` (root) | 1 |
| `tools/` | 6 |
| `tools/hexa/` | 18 |
| `simulators/golden-octopus/` | 1 |
| `simulators/maintenance/` | 21 |
| `golden-octopus/` | 11 |
| `challenger-world/` | 13 |
| `liberation/` | 9 |
| `dashboard/` | 2 |
| `characters/` | 1 |
| `command-palette/` | 4 |
| `icons/` | 2 |
| Root | 2 |
| **Total** | **217** |
