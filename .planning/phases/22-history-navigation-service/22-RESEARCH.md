# Phase 22: History Navigation + Service - Research

**Researched:** 2026-02-05
**Domain:** Preact navigation state + Supabase pagination
**Confidence:** HIGH

## Summary

This phase adds "Workout History" menu item to the Settings panel and creates paginated service functions for fetching workout history. Research covered the existing SettingsPanel component (panelView state pattern), SettingsMenu component structure, the logging service layer, and database schema for workout logs.

The core finding is that the navigation infrastructure already exists: SettingsPanel manages `panelView` state with a union type currently `'menu' | 'exercises'`, which needs to be extended to include `'history'` (and potentially `'history-detail'` for Phase 24). The existing service layer has `getWorkoutLogs(limit)` but lacks offset-based pagination. Three new service functions are needed per CONTEXT.md: `getWorkoutLogsPaginated(offset, limit)`, `getWorkoutLogDetail(workoutId)`, and `getWorkoutSummaryStats()`.

**Primary recommendation:** Extend `PanelView` type to include `'history'`, add a "Workout History" menu item to SettingsMenu with Calendar icon, create a placeholder HistoryPlaceholder component for Phase 22, and implement the three service functions in the logging service with proper TypeScript interfaces.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| preact | existing | UI framework (hooks: useState, useEffect) | Already used throughout |
| @ironlift/shared | existing | logging service, Supabase client, types | Service layer already complete |
| @supabase/supabase-js | existing | Database queries with range() for pagination | Already configured in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | -- | No new libraries needed | -- |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase range() pagination | Cursor-based pagination | Range is simpler for "Load More" pattern; cursor would be better for infinite scroll |
| Separate HistoryPlaceholder file | Inline JSX in SettingsPanel | Separate file is cleaner for future expansion in Phase 23 |

## Architecture Patterns

### Component Hierarchy (Current)
```
DashboardSurface
  -> SettingsPanel (isOpen, onClose, onLogout, onExerciseDeleted)
       -> SettingsPanel header (back button + title + optional "+ Create")
       -> panelView === 'menu':
            -> SettingsMenu (onMyExercises, onLogout)
                 -> "My Exercises" menu item
                 -> "Log Out" button
       -> panelView === 'exercises':
            -> MyExercisesList
```

### Component Hierarchy (After Phase 22)
```
DashboardSurface
  -> SettingsPanel (isOpen, onClose, onLogout, onExerciseDeleted)
       -> SettingsPanel header (back button + title + optional buttons)
       -> panelView === 'menu':
            -> SettingsMenu (onMyExercises, onWorkoutHistory, onLogout)  <-- MODIFIED
                 -> "My Exercises" menu item
                 -> "Workout History" menu item (NEW)
                 -> "Log Out" button
       -> panelView === 'exercises':
            -> MyExercisesList
       -> panelView === 'history':                                       <-- NEW
            -> HistoryPlaceholder (placeholder for Phase 23)
```

### Pattern 1: PanelView Type Extension
**What:** The SettingsPanel uses a discriminated union type for navigation state.
**When to use:** To add new sub-views within the Settings panel.
**Current code (SettingsPanel.tsx line 24):**
```tsx
type PanelView = 'menu' | 'exercises';
```
**Extended (Phase 22):**
```tsx
type PanelView = 'menu' | 'exercises' | 'history';
```
**Extended (Phase 24 -- for future reference):**
```tsx
type PanelView = 'menu' | 'exercises' | 'history' | 'history-detail';
```

### Pattern 2: Menu Item Structure (SettingsMenu.tsx)
**What:** Menu items are card-style clickable rows with icon, label, and chevron.
**When to use:** Adding "Workout History" menu item.
**Existing structure (SettingsMenu.tsx lines 19-36):**
```tsx
<div class="settings-menu-item" onClick={onMyExercises}>
  <div class="settings-menu-item-icon">
    <svg ...>{/* List icon */}</svg>
  </div>
  <div class="settings-menu-item-content">
    <span class="settings-menu-item-label">My Exercises</span>
  </div>
  <div class="settings-menu-item-chevron">
    <svg ...>{/* Chevron icon */}</svg>
  </div>
</div>
```
**New item (same pattern, Calendar icon):**
```tsx
<div class="settings-menu-item" onClick={onWorkoutHistory}>
  <div class="settings-menu-item-icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  </div>
  <div class="settings-menu-item-content">
    <span class="settings-menu-item-label">Workout History</span>
  </div>
  <div class="settings-menu-item-chevron">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6"></path>
    </svg>
  </div>
</div>
```

### Pattern 3: Navigation Handler (SettingsPanel.tsx)
**What:** Panel navigation handlers set `panelView` state and update header title/back behavior.
**When to use:** When user taps "Workout History" menu item.
**Existing pattern (line 60-61):**
```tsx
const headerTitle = panelView === 'menu' ? 'Settings' : 'My Exercises';
const backLabel = panelView === 'menu' ? 'Back' : 'Settings';
```
**Extended for history:**
```tsx
const headerTitle =
  panelView === 'menu' ? 'Settings' :
  panelView === 'exercises' ? 'My Exercises' :
  'Workout History';

const backLabel = panelView === 'menu' ? 'Back' : 'Settings';
```

### Pattern 4: Back Button Behavior
**What:** Back button returns to 'menu' from any sub-view, or closes panel from menu.
**Current implementation (SettingsPanel.tsx lines 46-53):**
```tsx
const handleBack = () => {
  if (isCreating) return;
  if (panelView === 'exercises') {
    setPanelView('menu');
  } else {
    onClose();
  }
};
```
**Extended for history:**
```tsx
const handleBack = () => {
  if (isCreating) return;
  if (panelView === 'exercises' || panelView === 'history') {
    setPanelView('menu');
  } else {
    onClose();
  }
};
```

### Pattern 5: Reset View on Close (SettingsPanel.tsx lines 34-43)
**What:** When panel closes, reset to menu view after animation completes.
**No changes needed:** Existing code already resets to 'menu' -- no history-specific logic required.

### Pattern 6: Supabase Pagination with range()
**What:** Supabase supports offset/limit pagination via `.range(from, to)` method.
**When to use:** For `getWorkoutLogsPaginated()`.
**Existing limit-only pattern (logging.ts line 197):**
```typescript
.order('started_at', { ascending: false })
.limit(limit);
```
**New offset/limit pattern:**
```typescript
.order('started_at', { ascending: false })
.range(offset, offset + limit - 1);  // range is inclusive
```

### Anti-Patterns to Avoid
- **Do NOT use cursor-based pagination:** CONTEXT.md specifies offset/limit pattern with page size of 7. Cursor-based would complicate "Load More" implementation.
- **Do NOT hardcode placeholder content:** Create a separate HistoryPlaceholder component that Phase 23 will replace with the actual list.
- **Do NOT add detail view navigation yet:** Phase 22 shows placeholder only. Detail navigation (`'history-detail'` view) is Phase 24.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pagination logic | Manual array slicing | Supabase `.range(offset, offset + limit - 1)` | Database does the pagination efficiently |
| Total count query | Fetch all then count | Supabase `.select('*', { count: 'exact' })` or separate count query | Database counts are efficient |
| Menu item styling | Custom CSS for history item | Existing `.settings-menu-item` classes | Consistent look, already styled |
| View state management | Multiple boolean flags | Single `panelView` discriminated union | Cleaner state, impossible invalid states |

## Common Pitfalls

### Pitfall 1: Supabase range() is Inclusive
**What goes wrong:** Using `.range(0, 7)` returns 8 items, not 7.
**Why it happens:** Supabase range uses PostgreSQL's inclusive range syntax.
**How to avoid:** Use `.range(offset, offset + limit - 1)` to get exactly `limit` items.
**Warning signs:** Off-by-one errors in pagination, getting 8 workouts when expecting 7.

### Pitfall 2: Menu Item Order Matters
**What goes wrong:** "Workout History" appears before "My Exercises" or after "Log Out".
**Why it happens:** Adding new item in wrong location in JSX.
**How to avoid:** CONTEXT.md says "After 'Manage Exercises' in Settings menu". The "Manage Exercises" is labeled "My Exercises" in code. Order: My Exercises -> Workout History -> Log Out.
**Warning signs:** Visual inspection shows wrong order.

### Pitfall 3: Header Title/Back Logic Gaps
**What goes wrong:** Header shows wrong title or back label for history view.
**Why it happens:** Forgetting to update the conditional logic for new view state.
**How to avoid:** Update both `headerTitle` and `backLabel` derivations. Back from history should show "Settings" (same as exercises).
**Warning signs:** Header shows "My Exercises" when in history view.

### Pitfall 4: Service Function Return Type Mismatch
**What goes wrong:** `getWorkoutLogsPaginated` returns different shape than expected by UI.
**Why it happens:** Not defining explicit TypeScript interfaces before implementation.
**How to avoid:** Define the interfaces in `types/services.ts` first, then implement to match.
**Warning signs:** TypeScript errors when consuming service in UI.

### Pitfall 5: Volume Calculation Inconsistency
**What goes wrong:** Total volume calculated differently in summary stats vs individual workouts.
**Why it happens:** Multiple places computing volume without shared formula.
**How to avoid:** CONTEXT.md says "total volume (lbs)" -- use formula: `SUM(weight * reps)` for completed sets only.
**Warning signs:** Summary stats don't match sum of individual workout volumes.

### Pitfall 6: Creating Too Many Service Functions
**What goes wrong:** Over-engineering by creating separate functions for each stat.
**Why it happens:** Not reading CONTEXT.md carefully.
**How to avoid:** Exactly 3 functions per CONTEXT.md:
1. `getWorkoutLogsPaginated(offset, limit)` -- list items with summary info
2. `getWorkoutLogDetail(workoutId)` -- single workout with full details
3. `getWorkoutSummaryStats()` -- all-time totals (workout count, total sets, total volume)
**Warning signs:** Creating 4+ functions or splitting stats into multiple calls.

## Code Examples

### Existing getWorkoutLogs Implementation (logging.ts lines 168-221)
```typescript
async function getWorkoutLogs(limit: number = 52): Promise<ServiceResult<WorkoutLogSummary[]>> {
  // ... auth check ...

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

  // ... format response with exercise_count ...
}
```

### New getWorkoutLogsPaginated Pattern
```typescript
// New interface for paginated history item (extends WorkoutLogSummary with more fields)
interface WorkoutHistoryItem {
  id: string;
  template_id: string | null;
  template_name: string | null;  // Joined from templates table
  started_at: string;
  exercise_count: number;
  completed_sets: number;
  total_volume: number;  // SUM(weight * reps) for completed sets
}

interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
}

async function getWorkoutLogsPaginated(
  offset: number,
  limit: number
): Promise<ServiceResult<PaginatedResult<WorkoutHistoryItem>>> {
  // ... auth check ...

  const { data, error, count } = await supabase
    .from('workout_logs')
    .select(`
      id,
      template_id,
      started_at,
      templates (name),
      workout_log_exercises (
        workout_log_sets (
          weight,
          reps,
          is_done
        )
      )
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Transform: calculate completed_sets and total_volume from nested data
  // hasMore = count > offset + data.length
}
```

### New getWorkoutSummaryStats Pattern
```typescript
interface WorkoutSummaryStats {
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number;  // in lbs
}

async function getWorkoutSummaryStats(): Promise<ServiceResult<WorkoutSummaryStats>> {
  // ... auth check ...

  // Option 1: Aggregate query (if Supabase supports)
  // Option 2: Fetch all workout_log_sets and compute

  const { data, error } = await supabase
    .from('workout_log_exercises')
    .select(`
      workout_log_sets (
        weight,
        reps,
        is_done
      ),
      workout_logs!inner (
        user_id
      )
    `)
    .eq('workout_logs.user_id', user.id);

  // Calculate totals from all completed sets
}
```

### Calendar Icon SVG (Outline Style)
```tsx
// Per CONTEXT.md "Calendar icon" -- using standard outline calendar
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
  <line x1="16" y1="2" x2="16" y2="6"></line>
  <line x1="8" y1="2" x2="8" y2="6"></line>
  <line x1="3" y1="10" x2="21" y2="10"></line>
</svg>
```

### Placeholder Component (Phase 22)
```tsx
// HistoryPlaceholder.tsx (or inline in SettingsPanel)
export function HistoryPlaceholder() {
  return (
    <div class="history-placeholder">
      <p class="text-muted">History view coming soon</p>
    </div>
  );
}
```

### CSS Classes Already Available
```css
/* Menu item styling (lines 3060-3103) */
.settings-menu-item { /* card style */ }
.settings-menu-item-icon { /* 36x36 icon container */ }
.settings-menu-item-content { /* flex: 1 */ }
.settings-menu-item-label { /* font-size: 0.9375rem */ }
.settings-menu-item-chevron { /* right arrow */ }

/* Text utilities */
.text-muted { color: var(--color-text-muted); }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single "My Exercises" sub-view | Multiple sub-views via PanelView union | Phase 22 | SettingsPanel becomes extensible for more features |
| getWorkoutLogs with limit only | getWorkoutLogsPaginated with offset + limit | Phase 22 | Enables "Load More" pagination |

**Key insight:** The SettingsPanel was designed with extensibility in mind (PanelView union type). Adding new views is straightforward pattern extension.

## Open Questions

1. **getWorkoutLogDetail already exists as getWorkoutLog**
   - What we know: `logging.getWorkoutLog(id)` already exists and returns `WorkoutLogWithExercises`
   - What's unclear: Whether to create new `getWorkoutLogDetail` or reuse existing
   - Recommendation: Reuse `getWorkoutLog` -- it already has the data needed for Phase 24 detail view. Only create alias if CONTEXT.md naming is strict.

2. **Summary stats performance**
   - What we know: `getWorkoutSummaryStats()` needs total counts across ALL user workouts
   - What's unclear: For users with hundreds of workouts, will fetching all sets be slow?
   - Recommendation: Implement simple version first (fetch and compute). Optimize later if needed (database view, materialized stats, or partial sums).

3. **Template name for ad-hoc workouts**
   - What we know: CONTEXT.md says "No ad-hoc workout handling needed -- all workouts come from templates"
   - What's unclear: What if template_id is null anyway (legacy data)?
   - Recommendation: Display "Untitled Workout" for null template_id as fallback.

## Sources

### Primary (HIGH confidence)
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` -- Current panel structure, PanelView type (109 lines)
- `apps/web/src/surfaces/dashboard/SettingsMenu.tsx` -- Menu item pattern (47 lines)
- `packages/shared/src/services/logging.ts` -- Existing getWorkoutLogs, getWorkoutLog implementations (637 lines)
- `packages/shared/src/types/services.ts` -- LoggingService interface, result types (768 lines)
- `packages/shared/src/types/database.ts` -- WorkoutLog, WorkoutLogWithExercises types (333 lines)
- `apps/web/css/styles.css` -- Settings menu item CSS (lines 3060-3125)
- `.planning/phases/22-history-navigation-service/22-CONTEXT.md` -- User decisions and constraints

### Secondary (MEDIUM confidence)
- Supabase documentation on range() pagination -- matches training data patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all code inspected directly in the repo
- Architecture: HIGH -- existing patterns clearly documented in source
- Service layer: HIGH -- existing service functions provide template
- Pitfalls: HIGH -- identified from reading actual code and Supabase docs

**Research date:** 2026-02-05
**Valid until:** 2026-03-07 (stable codebase, patterns well-established)
