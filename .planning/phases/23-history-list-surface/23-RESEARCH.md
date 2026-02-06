# Phase 23: History List Surface - Research

**Researched:** 2026-02-05
**Domain:** Preact UI components, CSS styling, timeline/list patterns
**Confidence:** HIGH

## Summary

This phase builds UI components to display workout history within the existing SettingsPanel. The data layer already exists from Phase 22 (`logging.getWorkoutLogsPaginated`, `logging.getWorkoutSummaryStats`). The task is purely presentational: rendering summary stats, timeline with cards, and pagination controls.

The codebase has well-established patterns for lists (MyExercisesList), cards (TemplateCard), and panel sub-views (SettingsPanel). A detailed HTML mockup exists at `.planning/mockups/mockup5-timeline-with-summary.html` showing exact styling decisions. CSS variables and design tokens are already defined in `apps/web/css/styles.css`.

**Primary recommendation:** Build a single `WorkoutHistoryList` component that renders inside the existing SettingsPanel history view slot. Follow the MyExercisesList pattern for structure. Extract styles from mockup5 into styles.css.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Preact | ^10.x | Component framework | Already used throughout app |
| @ironlift/shared | local | Types and services | Provides `logging` service, `WorkoutHistoryItem`, `WorkoutSummaryStats` types |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | All dependencies already in place |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom pagination state | react-query/SWR | Overkill for simple append-only list; existing pattern works |
| Virtualized list | tanstack/virtual | Overkill for 7-item pages with Load More; not needed unless performance issues |

**Installation:**
```bash
# No new dependencies required
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/surfaces/dashboard/
  WorkoutHistoryList.tsx     # Main list component (new)
  SettingsPanel.tsx          # Already exists, renders WorkoutHistoryList
apps/web/css/
  styles.css                 # Add history timeline styles (at end of file)
```

### Pattern 1: Panel Sub-View Component
**What:** Component that renders inside SettingsPanel based on panelView state
**When to use:** For all Settings sub-views (exercises, history)
**Example:**
```typescript
// apps/web/src/surfaces/dashboard/SettingsPanel.tsx (existing pattern)
{panelView === 'history' && (
  <WorkoutHistoryList />
)}
```

### Pattern 2: Self-Contained List with Internal Loading State
**What:** Component manages its own data fetching, loading states, and pagination
**When to use:** For list views with pagination that don't need shared state
**Example:**
```typescript
// Follows MyExercisesList pattern
export function WorkoutHistoryList() {
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [summary, setSummary] = useState<WorkoutSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');

  // Initial load on mount
  useEffect(() => { loadInitial(); }, []);

  const loadInitial = async () => {
    setIsLoading(true);
    // Fetch summary and first page in parallel
    const [summaryResult, pageResult] = await Promise.all([
      logging.getWorkoutSummaryStats(),
      logging.getWorkoutLogsPaginated(0, 7)
    ]);
    // Handle results...
  };

  const loadMore = async () => {
    setIsLoadingMore(true);
    const result = await logging.getWorkoutLogsPaginated(workouts.length, 7);
    // Append to existing...
  };

  return (/* JSX */);
}
```

### Pattern 3: Conditional Empty State
**What:** Show empty message when list is empty, hide summary bar
**When to use:** HIST-07 requirement
**Example:**
```typescript
// Only show summary when there's data
{!isLoading && summary && workouts.length > 0 && (
  <div class="history-summary">...</div>
)}

// Empty state
{!isLoading && workouts.length === 0 && (
  <div class="history-empty">
    <p class="history-empty-text">No workout history yet</p>
  </div>
)}
```

### Anti-Patterns to Avoid
- **Lifting state to SettingsPanel:** Keep list state internal; SettingsPanel doesn't need workout data
- **Fetching summary separately from pagination:** Both can fail independently; but fetch in parallel on mount
- **Inline styles from mockup:** Extract all styles to styles.css to match codebase convention

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date formatting | Custom formatDate() | Existing pattern in mockup + Intl.DateTimeFormat | Locale handling, edge cases |
| Volume abbreviation | Custom formatWeight() | Pattern from mockup5 (45.2k lbs) | Consistent with summary bar |
| Loading states | Custom spinner component | Existing CSS class `.my-exercises-loading` pattern | Consistency with exercises list |
| Pagination state | Complex offset/limit tracking | Simple `workouts.length` as offset | Service already handles pagination |

**Key insight:** The mockup5 HTML file contains working JavaScript for date formatting, weight abbreviation, and stat calculation. Extract these utilities rather than reinventing.

## Common Pitfalls

### Pitfall 1: Mounting Data Fetch Twice
**What goes wrong:** useEffect with empty deps runs twice in StrictMode
**Why it happens:** React/Preact StrictMode double-invokes effects
**How to avoid:** Use abort controller pattern or check if component unmounted
**Warning signs:** Network tab shows duplicate requests on mount

### Pitfall 2: Stale Closure in Load More
**What goes wrong:** loadMore callback captures old workouts array
**Why it happens:** useCallback with stale dependency
**How to avoid:** Use functional setState: `setWorkouts(prev => [...prev, ...newItems])`
**Warning signs:** Load More replaces instead of appends

### Pitfall 3: Timeline Line Height Calculation
**What goes wrong:** Timeline vertical line doesn't extend full height
**Why it happens:** CSS `bottom: 8px` assumes content height
**How to avoid:** Use `::before` pseudo-element with `top: 8px; bottom: 8px;` as in mockup
**Warning signs:** Line ends too early or extends past last card

### Pitfall 4: Volume Number Overflow
**What goes wrong:** Large volume numbers break layout
**Why it happens:** No abbreviation for numbers > 999
**How to avoid:** Use formatWeight utility from mockup: `n >= 1000 ? (n/1000).toFixed(1) + 'k' : n`
**Warning signs:** Summary stats box stretches or wraps unexpectedly

### Pitfall 5: Summary Stats Zero Values
**What goes wrong:** Displaying "0 Workouts" instead of empty state
**Why it happens:** Summary loads but returns zeros for new users
**How to avoid:** Check `summary.totalWorkouts === 0` as empty condition
**Warning signs:** Summary bar shows but with all zeros

## Code Examples

### Data Types (from @ironlift/shared)
```typescript
// packages/shared/src/types/services.ts
interface WorkoutHistoryItem {
  id: string;
  template_id: string | null;
  template_name: string | null;
  started_at: string;
  exercise_count: number;
  completed_sets: number;
  total_volume: number;
}

interface WorkoutSummaryStats {
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number;
}

interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
}
```

### Service Usage
```typescript
// Fetching paginated workouts
import { logging } from '@ironlift/shared';

// Get first page (7 items)
const { data, error } = await logging.getWorkoutLogsPaginated(0, 7);
if (data) {
  // data.data: WorkoutHistoryItem[]
  // data.hasMore: boolean
}

// Get summary stats
const { data: summary } = await logging.getWorkoutSummaryStats();
if (summary) {
  // summary.totalWorkouts, summary.totalSets, summary.totalVolume
}
```

### Volume Formatting Utility
```typescript
// From mockup5-timeline-with-summary.html
function formatVolume(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k % 1 === 0 ? k + 'k' : k.toFixed(1) + 'k';
  }
  return n.toLocaleString();
}
// 45200 -> "45.2k"
// 1000 -> "1k"
// 750 -> "750"
```

### Date Formatting
```typescript
// Absolute date without year (per CONTEXT.md decision)
function formatWorkoutDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}
// "2026-02-05T10:30:00Z" -> "Feb 5"
```

### Exercise Preview String
```typescript
// CONTEXT.md: "Show first 2-3 exercise names as preview"
function formatExercisePreview(exercises: string[], count: number): string {
  if (exercises.length === 0) return '';
  const shown = exercises.slice(0, 3);
  const remaining = count - shown.length;
  if (remaining > 0) {
    return shown.join(', ') + `, +${remaining} more`;
  }
  return shown.join(', ');
}
// ["Bench Press", "Squat", "Deadlift", "Rows"] -> "Bench Press, Squat, Deadlift, +1 more"
```

### Timeline CSS Structure (from mockup5)
```css
/* Timeline container */
.history-timeline {
  position: relative;
  padding-left: 28px;
}

/* Vertical line */
.history-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--color-border);
  border-radius: 1px;
}

/* Timeline dot */
.history-timeline-dot {
  position: absolute;
  left: -28px;
  top: 14px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-bg-primary);
  border: 2px solid var(--color-accent);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Virtual scrolling for lists | Simple Load More pagination | N/A | Simpler for small page sizes (7 items) |
| Complex state management | Local component state | N/A | Matches existing patterns (MyExercisesList) |

**Deprecated/outdated:**
- None relevant to this phase

## Open Questions

1. **Exercise names for preview**
   - What we know: `WorkoutHistoryItem` has `exercise_count` but NOT exercise names
   - What's unclear: How to display "Bench Press, Squat, +2 more" preview
   - Recommendation: Either extend the service to include exercise name preview, or omit the preview text (show only badges). The mockup shows preview but data model doesn't support it. **Suggest Phase 24 or enhancement to include exercise_names preview field.**

2. **Tapping workout card**
   - What we know: Cards need to be tappable to navigate to detail view
   - What's unclear: Phase 24 will build detail view, but how does navigation work?
   - Recommendation: Add `onSelectWorkout` callback prop to `WorkoutHistoryList`. Wire it up in SettingsPanel but log placeholder until Phase 24 implements detail view.

## Sources

### Primary (HIGH confidence)
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` - List component pattern
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` - Panel sub-view pattern
- `apps/web/css/styles.css` - Design tokens and existing component styles
- `packages/shared/src/services/logging.ts` - Service API
- `packages/shared/src/types/services.ts` - Type definitions
- `.planning/mockups/mockup5-timeline-with-summary.html` - Visual design reference

### Secondary (MEDIUM confidence)
- `.planning/phases/23-history-list-surface/23-CONTEXT.md` - User decisions

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing codebase patterns well documented
- Architecture: HIGH - Follows established component patterns
- Pitfalls: HIGH - Based on common React/Preact patterns
- CSS implementation: HIGH - Direct extraction from approved mockup

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - stable codebase patterns)
