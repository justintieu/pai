# Reports Hooks

**File:** `hooks/useReports.ts`
**Dependencies:** `@/services/reports/reportsAggregationService`, `@/services/tracker/trackerService`

## useReportCompletions
Fetch all recent completions for reports (large dataset).

```typescript
function useReportCompletions(session: Session | null): UseQueryResult<RecentCompletionResult[]>
```
**Query Key:** `queryKeys.reports.completions()`
**Stale Time:** 5 minutes
**Limit:** 2000 completions

## Derived Data Hooks

These use `useMemo` for performance - they transform fetched data.

### useFilteredCompletions
Filter completions by date range.

```typescript
function useFilteredCompletions(
  completions: RecentCompletionResult[] | undefined,
  dateRange: DateRange
): RecentCompletionResult[]
```

### useCharacterComparisonData
Get character comparison data for charts.

```typescript
function useCharacterComparisonData(
  completions: RecentCompletionResult[],
  characterWorlds: Record<string, string>
): {
  chartData: CharacterChartData[];
  rawData: CharacterEarnings[];
}
```

### useBossBreakdownData
Get boss breakdown data for charts (top 10 bosses).

```typescript
function useBossBreakdownData(
  completions: RecentCompletionResult[],
  characterWorlds: Record<string, string>
): {
  chartData: BossChartData[];
  rawData: BossEarnings[];
}
```

### useTimeSeriesData
Get time series data for charts.

```typescript
function useTimeSeriesData(
  completions: RecentCompletionResult[],
  characterWorlds: Record<string, string>,
  dateRange: DateRange
): {
  chartData: TimeSeriesChartData[];
  rawData: TimePeriodData[];
}
```

### useAccountStats
Get account stats for KPI cards.

```typescript
function useAccountStats(
  completions: RecentCompletionResult[],
  characterWorlds: Record<string, string>,
  dateRange: DateRange
): AccountStats
```
