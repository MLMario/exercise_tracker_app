# Phase 24: Workout Detail Surface - Research

**Researched:** 2026-02-05
**Domain:** Preact component, panel navigation, data display
**Confidence:** HIGH

## Summary

This phase creates a WorkoutDetail component to display full workout breakdown when user taps a history card. The research confirms all required infrastructure exists:

1. **Data layer is complete**: The `logging.getWorkoutLog(id)` service already fetches complete workout data including exercises, sets, and completion status. Returns `WorkoutLogWithExercises` which has everything needed.

2. **Navigation infrastructure exists**: SettingsPanel uses `PanelView` type for navigation. Adding a new view (`'workout-detail'`) follows the established pattern.

3. **No category colors exist**: Despite CONTEXT.md mentioning "exercise color from library", the codebase has no category-to-color mapping. This needs to be created.

**Primary recommendation:** Create WorkoutDetail component with simple state management (selectedWorkoutId), add 'workout-detail' to PanelView, create category color utility.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Preact | 10.x | UI framework | Already used throughout app |
| @ironlift/shared | local | Services and types | All data fetching goes through this |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS Custom Properties | native | Theming | All colors use CSS vars from styles.css |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New component | Inline in SettingsPanel | Separation of concerns - component is cleaner |

**Installation:**
No new packages needed - all infrastructure exists.

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/surfaces/dashboard/
├── SettingsPanel.tsx       # Add 'workout-detail' to PanelView, pass selectedWorkoutId
├── WorkoutHistoryList.tsx  # Already has onSelectWorkout callback (ready)
└── WorkoutDetail.tsx       # NEW - displays full workout breakdown

apps/web/css/styles.css     # Add .workout-detail-* CSS classes
```

### Pattern 1: Panel Navigation State

**What:** SettingsPanel manages view state with selectedWorkoutId
**When to use:** When navigating to detail views that need an ID
**Example:**
```typescript
// Source: apps/web/src/surfaces/dashboard/SettingsPanel.tsx (existing pattern)
type PanelView = 'menu' | 'exercises' | 'history' | 'workout-detail';

const [panelView, setPanelView] = useState<PanelView>('menu');
const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

// When selecting from history list:
const handleSelectWorkout = (id: string) => {
  setSelectedWorkoutId(id);
  setPanelView('workout-detail');
};

// When going back:
const handleBack = () => {
  if (panelView === 'workout-detail') {
    setPanelView('history');
    setSelectedWorkoutId(null);
  }
  // ... existing back logic
};
```

### Pattern 2: Data Fetching in Detail Component

**What:** Component fetches data on mount using service
**When to use:** Detail views that load by ID
**Example:**
```typescript
// Source: Similar to WorkoutHistoryList pattern
interface WorkoutDetailProps {
  workoutId: string;
  onBack: () => void;
}

export function WorkoutDetail({ workoutId, onBack }: WorkoutDetailProps) {
  const [workout, setWorkout] = useState<WorkoutLogWithExercises | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { data, error: fetchError } = await logging.getWorkoutLog(workoutId);
      if (fetchError) {
        setError('Failed to load workout');
      } else {
        setWorkout(data);
      }
      setIsLoading(false);
    };
    load();
  }, [workoutId]);
  // ...
}
```

### Pattern 3: Category Color Utility

**What:** Helper function to get color by exercise category
**When to use:** Visual styling based on exercise category
**Example:**
```typescript
// New utility - no existing pattern in codebase
const CATEGORY_COLORS: Record<string, string> = {
  'Chest': '#ef4444',     // red
  'Back': '#3b82f6',      // blue
  'Shoulders': '#f97316', // orange
  'Legs': '#22c55e',      // green
  'Arms': '#a855f7',      // purple
  'Core': '#eab308',      // yellow
  'Other': '#6b7280',     // gray
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
}
```

### Anti-Patterns to Avoid
- **Fetching in SettingsPanel:** Don't lift data fetching up - WorkoutDetail should own its data
- **Complex state management:** Don't use context/redux - simple useState in SettingsPanel is sufficient
- **Inline styles for colors:** Use CSS classes with CSS variables when possible, except for dynamic category colors

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Workout data fetching | Custom Supabase query | `logging.getWorkoutLog(id)` | Already exists, returns complete data |
| Date formatting | Custom date logic | Existing patterns in codebase | Match history list format |
| Loading/error states | Custom handling | Match WorkoutHistoryList pattern | Consistency |
| Back navigation | Custom logic | Extend existing handleBack | Follow established pattern |

**Key insight:** The logging service already has `getWorkoutLog(id)` which returns `WorkoutLogWithExercises` - a complete nested structure with exercises, sets, and all data needed.

## Common Pitfalls

### Pitfall 1: Scroll Position Not Preserved
**What goes wrong:** User scrolls history list, taps card, goes back, scroll is at top
**Why it happens:** Component re-renders on view change, losing scroll position
**How to avoid:** The `.settings-panel-content` container has `overflow-y: auto`. When switching views, the WorkoutHistoryList is unmounted and remounted. Two approaches:
1. **Simple:** Accept scroll reset (common mobile pattern)
2. **Better:** Store scroll position in parent state on navigate-away, restore on navigate-back
**Warning signs:** If you see the content jumping on back navigation

### Pitfall 2: Header in Wrong Place
**What goes wrong:** Creating a header inside WorkoutDetail that duplicates panel header
**Why it happens:** Not understanding the panel structure
**How to avoid:** SettingsPanel already has a header section (`.settings-panel-header`). Update the header logic there, don't create new header in WorkoutDetail.
**Warning signs:** Double headers visible

### Pitfall 3: Template Name is Null
**What goes wrong:** Displaying "null" or empty for template name
**Why it happens:** `WorkoutLogWithExercises` doesn't include template name - it only has `template_id`
**How to avoid:** The `getWorkoutLog` query needs to check if it joins template name. Looking at the service (lines 232-289), it does NOT join templates. You'll need to either:
1. Update the service to include template name
2. Use "Untitled Workout" as fallback (matches CONTEXT.md decision)
**Warning signs:** Missing template name in header

### Pitfall 4: Missing Exercise Details
**What goes wrong:** Exercise name/category not available
**Why it happens:** Assuming exercise details aren't included
**How to avoid:** The `getWorkoutLog` service DOES join exercise details (see lines 248-252). The `WorkoutLogExerciseWithSets` type includes `exercises: WorkoutLogExerciseDetails` which has id, name, category.
**Warning signs:** None - this is already handled correctly

## Code Examples

Verified patterns from existing codebase:

### Existing getWorkoutLog Service (lines 232-289)
```typescript
// Source: packages/shared/src/services/logging.ts
async function getWorkoutLog(id: string): Promise<ServiceResult<WorkoutLogWithExercises>> {
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
        exercises (
          id,
          name,
          category
        ),
        workout_log_sets (
          id,
          set_number,
          weight,
          reps,
          is_done
        )
      )
    `)
    .eq('id', id)
    .single();
  // ...sorts by order and set_number
}
```

### WorkoutLogWithExercises Type Structure
```typescript
// Source: packages/shared/src/types/database.ts
interface WorkoutLogWithExercises {
  id: string;
  template_id: string | null;  // Note: name NOT included
  started_at: string;
  created_at: string;
  workout_log_exercises: WorkoutLogExerciseWithSets[];
}

interface WorkoutLogExerciseWithSets {
  id: string;
  exercise_id: string;
  rest_seconds: number;
  order: number;
  exercises: WorkoutLogExerciseDetails;  // Has name, category
  workout_log_sets: WorkoutLogSetData[];
}

interface WorkoutLogSetData {
  id: string;
  set_number: number;
  weight: number;
  reps: number;
  is_done: boolean;  // This is the completion status
}
```

### Existing Panel Navigation Pattern
```typescript
// Source: apps/web/src/surfaces/dashboard/SettingsPanel.tsx
type PanelView = 'menu' | 'exercises' | 'history';

const handleBack = () => {
  if (isCreating) return;
  if (panelView === 'exercises' || panelView === 'history') {
    setPanelView('menu');
  } else {
    onClose();
  }
};

// Header title logic
const headerTitle =
  panelView === 'menu' ? 'Settings' :
  panelView === 'exercises' ? 'My Exercises' :
  'Workout History';
```

### Existing History Card with onSelectWorkout
```typescript
// Source: apps/web/src/surfaces/dashboard/WorkoutHistoryList.tsx
interface WorkoutHistoryListProps {
  /** Callback when a workout is selected (optional, for Phase 24 navigation) */
  onSelectWorkout?: (workoutId: string) => void;
}

// Already wired in component:
const handleCardClick = (workoutId: string) => {
  if (onSelectWorkout) {
    onSelectWorkout(workoutId);
  }
};
```

### Date Formatting Pattern for Detail View
```typescript
// Source: WorkoutHistoryList uses short date, detail needs medium date per CONTEXT.md
function formatDetailDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'  // "Feb 5, 2026"
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Template name in WorkoutLog | Only template_id stored | Current design | Need fallback for display |

**Important finding:**
- `getWorkoutLog` does NOT return template name, only `template_id`
- `getWorkoutLogsPaginated` DOES return template_name (joins templates table)
- For workout detail, need to decide: add template name to query, or use fallback

**Recommendation:** Use "Untitled Workout" fallback per CONTEXT.md. This avoids service changes and matches user expectation for ad-hoc workouts. If we need template name, the `getWorkoutLogsPaginated` already proved the join works - could replicate in `getWorkoutLog`.

## Open Questions

Things that couldn't be fully resolved:

1. **Scroll Position Preservation**
   - What we know: `.settings-panel-content` is the scrollable container
   - What's unclear: Best UX - preserve scroll or accept reset?
   - Recommendation: Start simple (accept reset), add preservation if users request

2. **Template Name Display**
   - What we know: `getWorkoutLog` doesn't join template name
   - What's unclear: Is "Untitled Workout" acceptable or should we fetch?
   - Recommendation: Use "Untitled Workout" per CONTEXT.md, simpler

3. **Category Colors**
   - What we know: No existing category color mapping in codebase
   - What's unclear: Exact colors that match app design
   - Recommendation: Define colors in CSS vars or utility function, Claude's discretion

## Sources

### Primary (HIGH confidence)
- `packages/shared/src/services/logging.ts` - getWorkoutLog implementation verified
- `packages/shared/src/types/database.ts` - WorkoutLogWithExercises structure verified
- `packages/shared/src/types/services.ts` - LoggingService interface verified
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` - PanelView pattern verified
- `apps/web/src/surfaces/dashboard/WorkoutHistoryList.tsx` - onSelectWorkout callback verified
- `apps/web/css/styles.css` - Styling patterns verified

### Secondary (MEDIUM confidence)
- Scroll position preservation patterns - standard React/Preact approach

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified existing code
- Architecture: HIGH - patterns extracted from codebase
- Pitfalls: HIGH - identified through code analysis
- Data layer: HIGH - service and types verified

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (stable codebase, no external dependencies)
