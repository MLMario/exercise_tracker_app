# Phase 15: Chart Exercise Selector Filter - Research

**Researched:** 2026-02-02
**Domain:** Supabase query patterns, Preact component patterns, TypeScript
**Confidence:** HIGH

## Summary

This phase requires filtering the exercise dropdown in AddChartModal to only show exercises that have logged workout data. The current implementation receives `availableExercises` (all exercises) from DashboardSurface and passes them directly to AddChartModal. The solution requires:

1. A new service function to fetch exercises with logged data (using Supabase's inner join pattern)
2. Modification of AddChartModal to handle the filtered list and empty state
3. Data refresh on modal open to capture any new workout data

The implementation is straightforward because the existing architecture already supports modal-open data refresh patterns (see `loadUserCharts` in DashboardSurface). The Supabase query can leverage existing table relationships (workout_log_exercises -> exercises) with an inner join.

**Primary recommendation:** Add a new service function `getExercisesWithLoggedData()` that queries exercises via workout_log_exercises inner join, then modify AddChartModal to display empty state when no exercises have data.

## Standard Stack

The phase uses existing project patterns - no new libraries needed.

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | existing | Database queries with inner join | Already used throughout project |
| preact | existing | Component rendering | Project's React alternative |
| @ironlift/shared | existing | Service layer | Monorepo shared package |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TypeScript | existing | Type safety | All new code |

### Alternatives Considered
None - this phase uses only existing project dependencies.

**Installation:**
```bash
# No new dependencies needed
```

## Architecture Patterns

### Recommended Project Structure
No new files needed except the service function. Modifications to existing files:

```
packages/shared/src/
├── services/
│   └── exercises.ts         # Add getExercisesWithLoggedData()
apps/web/src/
├── surfaces/dashboard/
│   ├── DashboardSurface.tsx # Call new service on modal open
│   └── AddChartModal.tsx    # Handle empty state, grouped list
```

### Pattern 1: Inner Join Query for Filtered Exercises

**What:** Query exercises that have at least one workout_log_exercises record for the current user
**When to use:** Fetching exercises with logged data for chart creation
**Example:**
```typescript
// Source: Supabase docs + existing project patterns (logging.ts)
async function getExercisesWithLoggedData(): Promise<ServiceResult<Exercise[]>> {
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: authError || new Error('User not authenticated') };
  }

  // Query exercises via inner join with workout_log_exercises
  // The !inner modifier ensures only exercises with log entries are returned
  const { data, error } = await supabase
    .from('workout_log_exercises')
    .select(`
      exercise_id,
      exercises!inner (
        id,
        name,
        category,
        is_system
      ),
      workout_logs!inner (
        user_id
      )
    `)
    .eq('workout_logs.user_id', user.id);

  if (error) {
    return { data: null, error };
  }

  // Extract unique exercises from results
  const exerciseMap = new Map<string, Exercise>();
  data?.forEach(item => {
    const ex = item.exercises;
    if (ex && !exerciseMap.has(ex.id)) {
      exerciseMap.set(ex.id, {
        id: ex.id,
        name: ex.name,
        category: ex.category,
        is_system: ex.is_system,
        user_id: null,         // Not needed for display
        equipment: null,       // Not needed for display
        instructions: null,    // Not needed for display
        level: null,           // Not needed for display
        force: null,           // Not needed for display
        mechanic: null         // Not needed for display
      });
    }
  });

  // Convert to array and sort by category then name (per CONTEXT.md)
  const exercises = Array.from(exerciseMap.values()).sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  return { data: exercises, error: null };
}
```

### Pattern 2: Grouped Category Display

**What:** Render exercise list with category headers
**When to use:** AddChartModal exercise selection (per CONTEXT.md decision)
**Example:**
```typescript
// Source: Existing ExercisePickerModal category grouping pattern
// Group exercises by category for display
const groupedExercises = useMemo(() => {
  const groups: Record<string, Exercise[]> = {};

  filteredExercises.forEach(ex => {
    if (!groups[ex.category]) {
      groups[ex.category] = [];
    }
    groups[ex.category].push(ex);
  });

  // Return sorted category keys
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}, [filteredExercises]);
```

### Pattern 3: Empty State Display

**What:** Show message when no exercises have logged data
**When to use:** When exercises array is empty after filtering
**Example:**
```typescript
// Source: Existing empty-state pattern in ChartSection.tsx
{exercises.length === 0 && (
  <div class="empty-state">
    <p>No exercise data yet</p>
  </div>
)}
```

### Anti-Patterns to Avoid
- **Client-side filtering of all exercises:** Don't fetch all exercises then filter - let the database do the work
- **Multiple round-trip queries:** Don't query workout_log_exercises first, then fetch exercises separately
- **Caching filtered list across modal opens:** Always refresh on modal open to capture new workouts

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unique exercise extraction | Manual loop with array.includes() | Map for O(1) lookups | Performance and clarity |
| User authentication check | Custom auth verification | supabase.auth.getUser() | Consistent with existing services |
| Category grouping | Complex reduce logic | Simple object accumulation | Readability, matches existing patterns |

**Key insight:** The project already has established patterns for all these operations in logging.ts and ExercisePickerModal.tsx. Follow existing conventions.

## Common Pitfalls

### Pitfall 1: Forgetting User Scope
**What goes wrong:** Query returns exercises from all users' logged workouts
**Why it happens:** Inner join without user filter
**How to avoid:** Always include `.eq('workout_logs.user_id', user.id)` in query
**Warning signs:** Test user sees exercises they never logged

### Pitfall 2: Empty Modal State Confusion
**What goes wrong:** User sees empty dropdown with no explanation
**Why it happens:** Not handling zero-exercise case
**How to avoid:** Check exercises.length === 0 and show "No exercise data yet" message
**Warning signs:** Dropdown shows "Select an exercise..." with no options

### Pitfall 3: Stale Data After Workout
**What goes wrong:** User completes workout with new exercise, opens modal, doesn't see it
**Why it happens:** Not refreshing data on modal open
**How to avoid:** Load exercises with logged data in openAddChartModal handler
**Warning signs:** User has to reload page to see newly logged exercises

### Pitfall 4: Missing Category Header Styling
**What goes wrong:** Category headers look like selectable items
**Why it happens:** Using same styles as exercise items
**How to avoid:** Use distinct styling (e.g., smaller text, muted color, no hover)
**Warning signs:** Users try to click category headers

## Code Examples

### Service Function (exercises.ts addition)
```typescript
// Source: Pattern from logging.ts getExerciseHistory
/**
 * Get exercises that have logged workout data for the current user.
 * Used for chart exercise selection - only exercises with data can be charted.
 *
 * @returns Promise resolving to exercises with logged data or error
 */
async function getExercisesWithLoggedData(): Promise<ServiceResult<Exercise[]>> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        data: null,
        error: authError || new Error('User not authenticated'),
      };
    }

    // Query via workout_log_exercises to get only logged exercises
    const { data, error } = await supabase
      .from('workout_log_exercises')
      .select(`
        exercise_id,
        exercises!inner (
          id,
          name,
          category,
          is_system,
          user_id,
          equipment,
          instructions,
          level,
          force,
          mechanic
        ),
        workout_logs!inner (
          user_id
        )
      `)
      .eq('workout_logs.user_id', user.id);

    if (error) {
      return { data: null, error };
    }

    // Deduplicate and build exercise array
    const exerciseMap = new Map<string, Exercise>();
    data?.forEach(item => {
      const ex = item.exercises as unknown as Exercise;
      if (ex && !exerciseMap.has(ex.id)) {
        exerciseMap.set(ex.id, ex);
      }
    });

    // Sort by category then name (A-Z per CONTEXT.md)
    const exercises = Array.from(exerciseMap.values()).sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });

    return { data: exercises, error: null };
  } catch (err) {
    console.error('Get exercises with logged data error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
```

### Modal Empty State (AddChartModal.tsx modification)
```typescript
// Source: Pattern from ChartSection.tsx empty state
// Inside render, replace exercise dropdown section:
{exercises.length === 0 ? (
  <div class="empty-state">
    <p>No exercise data yet</p>
  </div>
) : (
  <div class="form-group">
    <label for="chart-exercise">Exercise</label>
    <select
      id="chart-exercise"
      class="input"
      value={selectedExerciseId}
      onChange={handleExerciseChange}
      required
    >
      <option value="">Select an exercise...</option>
      {/* Grouped options with optgroup */}
      {groupedExercises.map(([category, categoryExercises]) => (
        <optgroup key={category} label={category}>
          {categoryExercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  </div>
)}
```

### Dashboard Integration (DashboardSurface.tsx modification)
```typescript
// Source: Pattern from existing loadUserCharts
// Add state for exercises with data
const [exercisesWithData, setExercisesWithData] = useState<Exercise[]>([]);

// Load on modal open
const openAddChartModal = async (): Promise<void> => {
  setShowAddChartModal(true);
  setChartError('');
  clearMessages();

  // Refresh exercises with logged data
  const { data, error } = await exercises.getExercisesWithLoggedData();
  if (!error && data) {
    setExercisesWithData(data);
  }
};

// Pass to modal
<AddChartModal
  isOpen={showAddChartModal}
  exercises={exercisesWithData}  // Changed from availableExercises
  onClose={closeAddChartModal}
  onSubmit={handleCreateChart}
  error={chartError}
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Show all exercises in chart dropdown | Filter to logged exercises only | This phase | Better UX - no empty charts |
| Flat exercise list | Grouped by category with optgroup | This phase | Easier to find exercises |

**Deprecated/outdated:**
- Passing `availableExercises` directly to AddChartModal (will be replaced with `exercisesWithData`)

## Open Questions

None - the implementation path is clear based on existing patterns and user decisions in CONTEXT.md.

## Sources

### Primary (HIGH confidence)
- Project codebase: DashboardSurface.tsx, AddChartModal.tsx, ExercisePickerModal.tsx
- Project codebase: logging.ts (inner join query pattern)
- Project codebase: exercises.ts (service pattern)
- Supabase docs: https://supabase.com/docs/reference/javascript/select (inner join, filtering)

### Secondary (MEDIUM confidence)
- Supabase docs: https://supabase.com/docs/guides/database/joins-and-nesting (relationship queries)

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - using only existing project dependencies
- Architecture: HIGH - following established patterns in codebase
- Query approach: HIGH - inner join pattern verified in Supabase docs and used in logging.ts
- Pitfalls: HIGH - based on analysis of existing code patterns

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (stable patterns, no external dependencies changing)
