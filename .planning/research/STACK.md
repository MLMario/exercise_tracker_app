# Stack Research: Exercise History Feature

**Project:** IronFactor (exercise tracker)
**Researched:** 2026-02-05
**Scope:** What's needed to add Exercise History (timeline view with pagination and detail surfaces)
**Overall confidence:** HIGH -- this feature builds entirely on existing patterns

## Executive Summary

The Exercise History feature requires **zero new dependencies**. The existing stack (Preact 10.28, TypeScript 5.9, Supabase JS 2.90, @use-gesture/react 10.3) already provides everything needed:

- **Data fetching:** `logging.getWorkoutLogs()` exists with limit parameter; `logging.getWorkoutLog(id)` exists for detail view
- **Pagination:** Supabase `.limit()` and `.range()` are already used in the codebase
- **UI navigation:** SettingsPanel already implements sub-view navigation pattern (`panelView` state)
- **Styling:** CSS custom properties and existing card/list patterns cover all UI needs
- **Gestures:** @use-gesture/react already installed for swipe-to-navigate patterns

The only new code needed: extended service functions for paginated history queries, new UI components in SettingsPanel, and CSS for timeline layout.

---

## Recommended Stack

### No New Dependencies Required

| Technology | Current Version | Role for This Feature | Confidence |
|---|---|---|---|
| Preact | ^10.28.2 | Component rendering, hooks (useState, useEffect, useCallback) | HIGH |
| TypeScript | ^5.9.3 | Type safety for history types, pagination state | HIGH |
| @supabase/supabase-js | ^2.90.1 | Paginated queries with `.range()`, existing workout log queries | HIGH |
| @use-gesture/react | ^10.3.1 | Optional: swipe gesture for workout detail navigation | HIGH |
| CSS (vanilla) | N/A | Timeline layout, workout cards, summary bar | HIGH |

### What the Feature Reuses Directly

| Existing Element | Location | How It's Reused |
|---|---|---|
| `logging.getWorkoutLogs(limit)` | `packages/shared/src/services/logging.ts` | Already supports limit parameter; extend with offset |
| `logging.getWorkoutLog(id)` | `packages/shared/src/services/logging.ts` | Fetch full workout detail with exercises/sets |
| `WorkoutLogSummary` type | `packages/shared/src/types/services.ts` | Already defined for list view (id, started_at, exercise_count) |
| `WorkoutLogWithExercises` type | `packages/shared/src/types/database.ts` | Already defined for detail view |
| SettingsPanel sub-navigation | `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` | `panelView` state pattern for history/detail views |
| `useAsyncOperation` hook | `apps/web/src/hooks/useAsyncOperation.ts` | Loading/error state for data fetching |
| Workout card CSS | `apps/web/css/styles.css` | `.workout-template-card` patterns for history cards |
| Design tokens | `apps/web/css/styles.css` | Colors, spacing, typography, shadows |
| `.settings-panel` CSS | `apps/web/css/styles.css` | Slide-in panel already styled |

---

## Service Layer: What Exists vs What's Needed

### Already Implemented

```typescript
// packages/shared/src/services/logging.ts

// Gets workout logs with limit (default 52)
getWorkoutLogs(limit?: number): Promise<ServiceResult<WorkoutLogSummary[]>>

// Gets single workout with full exercise/set data
getWorkoutLog(id: string): Promise<ServiceResult<WorkoutLogWithExercises>>
```

### Needs Extension for Pagination

The current `getWorkoutLogs()` uses `.limit()` but not `.range()`. For "Load More" pagination, add offset support:

**Option A (recommended): New function**
```typescript
// New function with cursor/offset pagination
getWorkoutLogsPaginated(options: {
  limit?: number;      // default 7
  offset?: number;     // default 0
}): Promise<ServiceResult<WorkoutLogSummary[]>>
```

**Option B: Extend existing function**
```typescript
// Modify existing getWorkoutLogs signature
getWorkoutLogs(options?: {
  limit?: number;
  offset?: number;
}): Promise<ServiceResult<WorkoutLogSummary[]>>
```

**Recommendation:** Option A is cleaner -- doesn't change existing API used by charts. The new function can use Supabase's `.range(from, to)` method:

```typescript
.from('workout_logs')
.select('...')
.eq('user_id', user.id)
.order('started_at', { ascending: false })
.range(offset, offset + limit - 1)
```

**Confidence:** HIGH -- `.range()` is standard Supabase PostgREST API.

### Needs Addition: Aggregate Summary Stats

For the summary bar showing total workouts/sets/lbs, add:

```typescript
// New function for history summary
getWorkoutHistorySummary(): Promise<ServiceResult<{
  totalWorkouts: number;
  totalSets: number;
  totalWeight: number;
}>>
```

This requires either:
1. **Client-side calculation** (fetch all logs, sum in JS) -- simple but slow for users with many workouts
2. **Server-side aggregation** via Supabase RPC function -- more efficient

**Recommendation:** Start with client-side calculation for MVP. If performance becomes an issue, add RPC function later. The existing `getWorkoutLogs(52)` pattern suggests the team is comfortable with reasonable limits.

**Confidence:** MEDIUM -- aggregate calculation is straightforward, but optimal approach depends on data volume.

---

## Pagination Strategy

### "Load More" Button Pattern (Recommended)

Target: Initial 7 workouts, then 7 more on each "Load More" click.

**State management:**
```typescript
const [workouts, setWorkouts] = useState<WorkoutLogSummary[]>([]);
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);

const loadMore = async () => {
  const newOffset = offset + 7;
  const { data } = await logging.getWorkoutLogsPaginated({ limit: 7, offset: newOffset });
  if (data && data.length > 0) {
    setWorkouts(prev => [...prev, ...data]);
    setOffset(newOffset);
    setHasMore(data.length === 7); // fewer than 7 = no more
  } else {
    setHasMore(false);
  }
};
```

**Why not infinite scroll:** The Settings panel is a contained overlay. Infinite scroll adds complexity (scroll container detection, intersection observer) with minimal UX benefit for a history list. "Load More" is simpler and explicit.

**Confidence:** HIGH -- standard pagination pattern.

### Alternative: Cursor-based Pagination

Using `started_at` as cursor instead of offset:

```typescript
getWorkoutLogsPaginated(options: {
  limit?: number;
  cursor?: string; // ISO date string of last item's started_at
})
```

Query:
```typescript
.lt('started_at', cursor)
.order('started_at', { ascending: false })
.limit(7)
```

**Tradeoff:** Cursor is more efficient for large datasets (no offset scanning), but offset is simpler and the expected data volume (hundreds, not millions of workouts) doesn't warrant the complexity.

**Recommendation:** Use offset-based pagination for simplicity.

---

## UI Architecture

### Component Hierarchy

```
SettingsPanel (existing)
  |-- SettingsMenu (existing, add "Exercise History" item)
  |-- MyExercisesList (existing)
  |-- HistoryListView (NEW)
  |     |-- SummaryBar
  |     |-- WorkoutTimeline
  |     |     |-- WorkoutCard (repeating)
  |     |-- LoadMoreButton
  |-- WorkoutDetailView (NEW)
        |-- DetailHeader
        |-- ExerciseBreakdown (repeating)
              |-- SetRow (repeating)
```

### Navigation Pattern

Extend `SettingsPanel.tsx`'s existing `PanelView` union:

```typescript
// Current
type PanelView = 'menu' | 'exercises';

// Extended
type PanelView = 'menu' | 'exercises' | 'history' | 'workoutDetail';
```

Store selected workout ID in state for detail view:

```typescript
const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
```

Navigation flow:
1. Menu -> "Exercise History" click -> `panelView = 'history'`
2. History list -> Workout card click -> `selectedWorkoutId = id`, `panelView = 'workoutDetail'`
3. Detail view -> Back button -> `panelView = 'history'`, `selectedWorkoutId = null`

**Confidence:** HIGH -- exact pattern already used for `'exercises'` view.

---

## Supabase Query Patterns

### Existing Query (logging.ts lines 184-197)

```typescript
const { data, error } = await supabase
  .from('workout_logs')
  .select(`
    id,
    template_id,
    started_at,
    created_at,
    workout_log_exercises (count)
  `)
  .eq('user_id', user.id)
  .order('started_at', { ascending: false })
  .limit(limit);
```

### Extended Query for History List

Add more data for richer workout cards:

```typescript
const { data, error } = await supabase
  .from('workout_logs')
  .select(`
    id,
    template_id,
    started_at,
    created_at,
    templates (name),
    workout_log_exercises (
      count,
      workout_log_sets (
        weight,
        reps,
        is_done
      )
    )
  `)
  .eq('user_id', user.id)
  .order('started_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

This joins template name and nested sets for calculating per-workout totals (sets, weight).

**Note:** Supabase nested count aggregations can be tricky. May need to compute totals client-side from the returned set data.

**Confidence:** HIGH -- standard Supabase relational query.

### Detail Query (Already Exists)

```typescript
// logging.ts getWorkoutLog(id) - lines 229-286
const { data, error } = await supabase
  .from('workout_logs')
  .select(`
    id,
    template_id,
    started_at,
    created_at,
    workout_log_exercises (
      id,
      exercise_id,
      rest_seconds,
      order,
      exercises (id, name, category),
      workout_log_sets (id, set_number, weight, reps, is_done)
    )
  `)
  .eq('id', id)
  .single();
```

This already returns everything needed for the detail view. No changes required.

---

## CSS Approach

### New CSS Classes Needed

| Class | Purpose |
|---|---|
| `.history-summary-bar` | Fixed header with total stats |
| `.workout-timeline` | Vertical timeline container |
| `.timeline-marker` | Date/time indicator on timeline |
| `.history-workout-card` | Compact workout card (variation of existing) |
| `.workout-detail-header` | Detail view header with date/duration |
| `.exercise-breakdown` | Exercise section in detail view |
| `.detail-set-row` | Set row in detail view |
| `.load-more-btn` | Load more button styling |

### Leverage Existing Patterns

The existing CSS has:
- `.workout-template-card` (lines 1590-1650) -- base card styling
- `.exercise-list-container` -- scrollable list pattern
- `.settings-panel-header` -- header with back button
- `.btn-secondary` -- for Load More button

New styles will extend these patterns using existing CSS custom properties.

**Confidence:** HIGH -- direct extension of existing CSS system.

---

## What NOT to Use

### Do NOT Add a Data Fetching Library

**Examples to avoid:** react-query, swr, tanstack-query

**Why not:** The app uses direct Supabase calls with `useAsyncOperation` for state management. This pattern works well for the app's complexity. Adding a caching/fetching library for one feature creates inconsistency.

**What to do instead:** Use existing `useAsyncOperation` hook pattern with manual state for pagination (workouts array, offset, hasMore).

### Do NOT Add a Virtual List Library

**Examples to avoid:** react-window, react-virtualized, tanstack-virtual

**Why not:** Expected history size is hundreds of workouts, not thousands. With "Load More" showing 7 at a time, the visible DOM is always small. The existing exercise picker renders 873 exercises without virtualization.

**What to do instead:** Native scrolling with `overflow-y: auto`.

### Do NOT Add a Date Formatting Library

**Examples to avoid:** date-fns, dayjs, moment

**Why not:** The app has no date library currently. The history feature needs basic formatting (e.g., "Jan 15, 2026" or "2 days ago"). This can be done with native `Intl.DateTimeFormat` or simple helper functions.

**What to do instead:**
```typescript
// Simple helper for history
function formatWorkoutDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
```

### Do NOT Add an Animation Library

**Examples to avoid:** framer-motion, react-spring

**Why not:** The slide-in panel already uses CSS transitions. Workout card animations (if any) can use CSS keyframes. The detail view transition uses existing panel patterns.

**What to do instead:** CSS transitions for view changes, CSS keyframes for any card animations.

### Do NOT Change the Navigation Pattern to URL Routing

**Examples to avoid:** preact-router, wouter

**Why not:** The settings panel is an overlay on the dashboard, not a standalone route. History lives inside the settings panel. Adding URL routing would complicate the overlay pattern and require refactoring all existing navigation.

**What to do instead:** Extend existing `panelView` state-based navigation.

---

## Type Definitions

### New Types Needed

```typescript
// packages/shared/src/types/services.ts

/**
 * Options for paginated workout log queries.
 */
export interface WorkoutLogPaginationOptions {
  /** Number of logs to fetch (default 7) */
  limit?: number;
  /** Offset for pagination (default 0) */
  offset?: number;
}

/**
 * Summary statistics for workout history.
 */
export interface WorkoutHistorySummary {
  /** Total number of workouts */
  totalWorkouts: number;
  /** Total sets completed across all workouts */
  totalSets: number;
  /** Total weight lifted (sum of weight * reps for all sets) */
  totalWeight: number;
}

/**
 * Extended workout log summary with computed totals.
 * Used for history list cards.
 */
export interface WorkoutLogHistoryItem extends WorkoutLogSummary {
  /** Template name if workout was from template */
  templateName: string | null;
  /** Total sets in this workout */
  totalSets: number;
  /** Total weight lifted in this workout */
  totalWeight: number;
}
```

### Existing Types (No Changes Needed)

- `WorkoutLogSummary` -- already has id, template_id, started_at, exercise_count
- `WorkoutLogWithExercises` -- already has full detail structure
- `WorkoutLogExerciseWithSets` -- already has exercises with sets

**Confidence:** HIGH -- extends existing type patterns.

---

## Implementation Checklist

### Service Layer

| Task | File | Effort |
|---|---|---|
| Add `getWorkoutLogsPaginated()` | `packages/shared/src/services/logging.ts` | Low |
| Add `WorkoutLogPaginationOptions` type | `packages/shared/src/types/services.ts` | Low |
| Add `WorkoutLogHistoryItem` type | `packages/shared/src/types/services.ts` | Low |
| Update `LoggingService` interface | `packages/shared/src/types/services.ts` | Low |
| Add client-side summary calculation helper | `packages/shared/src/services/logging.ts` | Low |

### UI Components

| Task | File | Effort |
|---|---|---|
| Add "Exercise History" menu item | `apps/web/src/surfaces/dashboard/SettingsMenu.tsx` | Low |
| Extend `PanelView` type | `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` | Low |
| Create `HistoryListView` component | `apps/web/src/surfaces/dashboard/HistoryListView.tsx` | Medium |
| Create `WorkoutDetailView` component | `apps/web/src/surfaces/dashboard/WorkoutDetailView.tsx` | Medium |
| Add view switching logic | `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` | Low |

### CSS

| Task | File | Effort |
|---|---|---|
| Summary bar styles | `apps/web/css/styles.css` | Low |
| Timeline/workout card styles | `apps/web/css/styles.css` | Medium |
| Detail view styles | `apps/web/css/styles.css` | Medium |
| Load more button styles | `apps/web/css/styles.css` | Low |

---

## Risks and Mitigations

### Risk: Query Performance with Large History

**Scenario:** User has 500+ workouts, nested joins slow down.

**Mitigation:**
- Use pagination (7 at a time) to limit query size
- Add database index on `workout_logs.user_id, workout_logs.started_at DESC` if not exists
- Consider caching first page in component state

**Confidence:** MEDIUM -- depends on actual data volume.

### Risk: Summary Calculation Performance

**Scenario:** Calculating totals across all workouts is slow.

**Mitigation:**
- For MVP, fetch with reasonable limit (e.g., 100 workouts) and show "Last 100 workouts" disclaimer
- Future: Add Supabase RPC function for server-side aggregation

**Confidence:** MEDIUM -- acceptable for MVP.

### Risk: Template Deletion Impact

**Scenario:** Template was deleted but workout_log still references it.

**Mitigation:**
- Template name query uses LEFT JOIN behavior (Supabase default)
- If template is null, show "Custom Workout" or exercise list as title
- Already handled: `workout_logs.template_id` is nullable

**Confidence:** HIGH -- schema already supports this.

---

## Sources

- **PRIMARY (codebase analysis):** Direct file reads of all relevant source files
- `packages/shared/src/services/logging.ts` -- existing workout log functions
- `packages/shared/src/types/services.ts` -- existing type definitions
- `packages/shared/src/types/database.ts` -- workout log types
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` -- sub-navigation pattern
- `apps/web/css/styles.css` -- existing CSS patterns
- `sql/current_schema.sql` -- database schema
- Supabase PostgREST documentation (`.range()` method) -- verified via training data
