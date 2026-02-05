# Architecture Research: Exercise History

**Project:** IronFactor Exercise Tracker
**Researched:** 2026-02-05
**Scope:** How Exercise History views integrate with the existing Settings panel overlay architecture
**Confidence:** HIGH (based entirely on codebase analysis and existing patterns)

---

## Executive Summary

Exercise History integrates with the existing Settings panel overlay pattern established in v3.0. The architecture extends the `SettingsPanel` component's sub-view routing to include a `'history'` view alongside the existing `'menu'` and `'exercises'` views. History List displays within the panel; Workout Detail navigation introduces a new pattern with deeper sub-view nesting.

**Key architectural decisions:**

1. **Settings panel extension** -- Add "Exercise History" menu item to existing `SettingsMenu`, reusing the panel overlay pattern
2. **Sub-view routing** -- Extend `PanelView` type to include `'history'` view
3. **Detail navigation** -- History cards navigate to Workout Detail as a nested sub-view within the panel
4. **Service layer** -- Leverage existing `logging.getWorkoutLogs()` and `logging.getWorkoutLog()` services
5. **No new surfaces** -- History fits within the Settings panel overlay, not as a new top-level surface

---

## Existing Architecture Summary

The Settings panel is an overlay that slides in from the right side of the Dashboard. It manages internal sub-view routing.

```
DashboardSurface
  |
  |-- SettingsPanel (overlay)
  |     |-- [panelView: 'menu']
  |     |     SettingsMenu
  |     |       |-- "My Exercises" --> panelView: 'exercises'
  |     |       |-- "Log Out"
  |     |
  |     |-- [panelView: 'exercises']
  |           MyExercisesList
```

**Key patterns observed:**

1. **Panel is always mounted, visibility via CSS.** `SettingsPanel` renders with `class="settings-panel ${isOpen ? 'open' : ''}"`. No conditional mounting.
2. **Sub-view routing via useState.** `PanelView = 'menu' | 'exercises'` controls which content displays.
3. **Back navigation via state.** Header back button returns to previous sub-view or closes panel.
4. **Data loading in sub-views.** Each sub-view loads its own data on mount (e.g., `MyExercisesList` calls `exercises.getUserExercises()`).
5. **Reset on panel close.** Sub-view resets to `'menu'` after close animation completes.

---

## Component Hierarchy

### Extended Structure

```
DashboardSurface
  |
  |-- SettingsPanel (overlay)
  |     |-- [panelView: 'menu']
  |     |     SettingsMenu
  |     |       |-- "My Exercises" --> panelView: 'exercises'
  |     |       |-- "Exercise History" --> panelView: 'history'  [NEW]
  |     |       |-- "Log Out"
  |     |
  |     |-- [panelView: 'exercises']
  |     |     MyExercisesList
  |     |
  |     |-- [panelView: 'history']  [NEW]
  |     |     HistoryListView
  |     |       |-- Summary bar (workouts, sets, total weight)
  |     |       |-- Timeline list
  |     |       |     WorkoutCard (per workout)
  |     |       |-- Pagination (infinite scroll or Load More)
  |     |
  |     |-- [panelView: 'detail']  [NEW]
  |           WorkoutDetailView
  |             |-- Header (back to history list)
  |             |-- Workout summary
  |             |-- Exercise blocks with sets grid
```

### New Components

```
surfaces/dashboard/
  HistoryListView.tsx       -- Timeline list with summary bar
  WorkoutCard.tsx           -- Single workout card (collapsed + expandable)
  WorkoutDetailView.tsx     -- Full workout breakdown
  HistorySummary.tsx        -- Summary statistics bar
```

### Component Responsibilities

| Component | Responsibilities |
|-----------|------------------|
| `SettingsPanel` | Owns `panelView` state, routes to sub-views, handles back navigation |
| `SettingsMenu` | Renders menu items, triggers sub-view navigation |
| `HistoryListView` | Loads workout summaries, manages timeline display, triggers detail navigation |
| `WorkoutCard` | Displays single workout, handles expand/collapse, click-to-detail |
| `WorkoutDetailView` | Loads full workout data, displays exercise breakdown |
| `HistorySummary` | Computes and displays aggregate statistics |

---

## Data Flow

### Navigation Flow

```
DashboardSurface                SettingsPanel                   Internal State
     |                              |                               |
     |-- [gear icon click] -------->|                               |
     |   setSettingsOpen(true)      |                               |
     |                              |-- isOpen: true                |
     |                              |-- panelView: 'menu'           |
     |                              |                               |
     |                              |  [My Exercises click] ------->|
     |                              |<-- setPanelView('exercises')  |
     |                              |-- renders MyExercisesList     |
     |                              |                               |
     |                              |  [Exercise History click] --->|
     |                              |<-- setPanelView('history')    |
     |                              |-- renders HistoryListView     |
     |                              |                               |
     |                              |  [Workout card click] ------->|
     |                              |<-- setPanelView('detail')     |
     |                              |<-- setSelectedWorkoutId(id)   |
     |                              |-- renders WorkoutDetailView   |
     |                              |                               |
     |                              |  [Back in detail] ----------->|
     |                              |<-- setPanelView('history')    |
     |                              |-- renders HistoryListView     |
```

### Data Loading Flow

```
HistoryListView                 @ironlift/shared              Supabase
     |                               |                          |
     |-- logging.getWorkoutLogs() -->|                          |
     |                               |-- supabase.from()  ---->|
     |                               |<-- { data, error }  ----|
     |<-- { data: WorkoutLogSummary[] }                        |
     |                               |                          |

WorkoutDetailView               @ironlift/shared              Supabase
     |                               |                          |
     |-- logging.getWorkoutLog(id) ->|                          |
     |                               |-- supabase.from()  ---->|
     |                               |<-- { data, error }  ----|
     |<-- { data: WorkoutLogWithExercises }                    |
```

### State Management

```
SettingsPanel (extends existing state):
  - isOpen: boolean                   -- Panel visibility
  - panelView: PanelView              -- EXTENDED: 'menu' | 'exercises' | 'history' | 'detail'
  - selectedWorkoutId: string | null  -- NEW: ID for detail view

HistoryListView (owns):
  - workoutLogs: WorkoutLogSummary[]  -- Loaded from logging.getWorkoutLogs()
  - isLoading: boolean                -- Loading state
  - error: string                     -- Error message
  - page: number                      -- For pagination (optional)

WorkoutDetailView (owns):
  - workout: WorkoutLogWithExercises | null  -- Full workout data
  - isLoading: boolean
  - error: string
```

---

## Type Extensions

### PanelView Type (in SettingsPanel.tsx)

```typescript
// Current
type PanelView = 'menu' | 'exercises';

// Extended
type PanelView = 'menu' | 'exercises' | 'history' | 'detail';
```

### SettingsPanel State (extended)

```typescript
// Add to SettingsPanel component
const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
```

### Props Threading

```typescript
// HistoryListView props
interface HistoryListViewProps {
  onSelectWorkout: (workoutId: string) => void;  // Navigate to detail
}

// WorkoutDetailView props
interface WorkoutDetailViewProps {
  workoutId: string;
  onBack: () => void;  // Return to history list
}
```

---

## Integration Points with SettingsPanel

### Required Changes

**1. Extend PanelView type:**
```typescript
type PanelView = 'menu' | 'exercises' | 'history' | 'detail';
```

**2. Add selectedWorkoutId state:**
```typescript
const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
```

**3. Handle history navigation in handleBack:**
```typescript
const handleBack = () => {
  if (isCreating) return;
  if (panelView === 'detail') {
    setPanelView('history');
    setSelectedWorkoutId(null);
  } else if (panelView === 'exercises' || panelView === 'history') {
    setPanelView('menu');
  } else {
    onClose();
  }
};
```

**4. Update header title logic:**
```typescript
const headerTitle = {
  'menu': 'Settings',
  'exercises': 'My Exercises',
  'history': 'Exercise History',
  'detail': 'Workout Details'
}[panelView];

const backLabel = {
  'menu': 'Back',
  'exercises': 'Settings',
  'history': 'Settings',
  'detail': 'History'
}[panelView];
```

**5. Add render branches for history views:**
```typescript
{panelView === 'history' && (
  <HistoryListView
    onSelectWorkout={(id) => {
      setSelectedWorkoutId(id);
      setPanelView('detail');
    }}
  />
)}
{panelView === 'detail' && selectedWorkoutId && (
  <WorkoutDetailView
    workoutId={selectedWorkoutId}
    onBack={() => {
      setPanelView('history');
      setSelectedWorkoutId(null);
    }}
  />
)}
```

**6. Add menu item to SettingsMenu:**
```typescript
// In SettingsMenu.tsx
<div class="settings-menu-item" onClick={onExerciseHistory}>
  {/* History icon */}
  <span class="settings-menu-item-label">Exercise History</span>
  <ChevronIcon />
</div>
```

---

## Component Boundaries

### What Talks to What

```
SettingsPanel
  |-- [owns] panelView state, selectedWorkoutId state
  |-- [renders] SettingsMenu
  |     |-- [calls] onExerciseHistory (new prop)
  |-- [renders] HistoryListView (when panelView === 'history')
  |     |-- [calls] logging.getWorkoutLogs() from @ironlift/shared
  |     |-- [calls] onSelectWorkout prop (passed from SettingsPanel)
  |     |-- [renders] WorkoutCard (per workout)
  |     |-- [renders] HistorySummary
  |-- [renders] WorkoutDetailView (when panelView === 'detail')
        |-- [calls] logging.getWorkoutLog(workoutId) from @ironlift/shared
        |-- [renders] exercise blocks with sets grid
```

### Boundary Rules

1. **HistoryListView does NOT manage selectedWorkoutId.** It reports selection via `onSelectWorkout` callback; SettingsPanel owns the navigation state.
2. **WorkoutDetailView receives workoutId as prop.** It does NOT access SettingsPanel state directly.
3. **HistorySummary is a pure presentational component.** It receives computed data as props, does not call services.
4. **WorkoutCard handles its own expand/collapse state** but delegates detail navigation to parent.
5. **No new modals needed.** All views render inline within the panel content area.

---

## Build Order

Implementation follows dependency layers. Each phase produces something testable.

### Phase 1: Menu Extension (minimal change)

**Add "Exercise History" menu item with placeholder view.**

Dependencies: None (isolated change).

- Add `onExerciseHistory` prop to `SettingsMenu`
- Add menu item with history icon
- Extend `PanelView` type to include `'history'`
- Add handler in `SettingsPanel` to switch to history view
- Add placeholder `HistoryListView` component (loading state only)
- Verify navigation: Menu -> History -> Back to Menu

**Why first:** Establishes navigation skeleton. Validates the panel routing extension works before building complex views.

### Phase 2: History List (read-only timeline)

**Build HistoryListView with data loading and timeline display.**

Dependencies: Phase 1 (menu navigation exists).

- Implement data loading via `logging.getWorkoutLogs()`
- Create `HistorySummary` component with aggregate stats
- Create `WorkoutCard` component (collapsed view only)
- Display timeline with workout cards
- Handle loading and error states
- Style per mockup (timeline dots, date markers, badges)

**Why second:** The list is foundational. Detail view depends on having a list to navigate from.

### Phase 3: Workout Detail View

**Build WorkoutDetailView with full workout breakdown.**

Dependencies: Phase 2 (history list exists to navigate from).

- Add `selectedWorkoutId` state to SettingsPanel
- Add `'detail'` to PanelView type
- Create `WorkoutDetailView` component
- Implement data loading via `logging.getWorkoutLog(id)`
- Display exercise blocks with sets grid
- Wire card click -> detail navigation
- Wire back button -> history list

**Why third:** Completes the history reading flow. After this phase, users can browse history and view workout details.

### Phase 4: Expandable Cards (optional enhancement)

**Add expand/collapse behavior to WorkoutCard in timeline view.**

Dependencies: Phase 2 (cards exist).

- Add expand state to `WorkoutCard`
- Show exercise preview on expand (without full navigation to detail)
- One-card-at-a-time accordion behavior
- Chevron rotation animation

**Why fourth:** Enhancement to the timeline UX. The mockup shows expandable cards with inline previews. This phase can be deferred if timeline-only reading meets MVP requirements.

### Phase 5: Pagination (if needed)

**Add Load More or infinite scroll for large history.**

Dependencies: Phase 2 (list exists).

- Track page/offset in HistoryListView state
- Add Load More button or scroll-based loading
- Append new workouts to existing list
- Update summary stats on new loads

**Why fifth:** Optimization phase. Initial load of 52 workouts (1 year weekly) may be sufficient for MVP.

### Dependency Graph

```
Phase 1: Menu Extension + Navigation Skeleton
    |
    v
Phase 2: History List (read-only timeline)
    |         \
    v          v
Phase 3: Detail View    Phase 4: Expandable Cards
                              (optional)
    |
    v
Phase 5: Pagination (if needed)
```

---

## Patterns from Existing Code

### Reusable Patterns

| Pattern | Source | Application |
|---------|--------|-------------|
| Panel sub-view routing | `SettingsPanel.tsx` | Extend PanelView type |
| Back navigation logic | `SettingsPanel.handleBack()` | Add history/detail cases |
| Header title switching | `SettingsPanel.headerTitle` | Add history/detail titles |
| Service data loading | `MyExercisesList.useEffect` | Same pattern in HistoryListView |
| Loading/error states | `useAsyncOperation` hook | Use in HistoryListView, WorkoutDetailView |
| List item styling | `MyExercisesList` CSS | Similar row/card styling |
| Accordion expand | `my-exercises-edit-form` CSS | Similar max-height transition |

### CSS Patterns from Mockup

The mockup (`mockup5-timeline-with-summary.html`) uses existing design tokens:

- Colors: `--color-bg-surface`, `--color-border`, `--color-accent`, `--color-success`
- Spacing: `--spacing-md`, `--spacing-lg`
- Typography: `.template-name` (15px bold), `.badge` (11px mono), `.exercise-preview` (12px muted)
- Border radius: `--radius-lg` (12px for cards)
- Timeline: Custom CSS (2px line, 14px dots with accent border)

---

## Anti-Patterns to Avoid

### 1. Do NOT Create a New Top-Level Surface

**Temptation:** Add `HistorySurface` to `AppSurface` union in main.tsx.

**Why bad:** History is accessed from Settings, not from Dashboard directly. Creating a new surface breaks the information hierarchy and adds unnecessary complexity to main.tsx navigation.

**Instead:** History views live inside SettingsPanel as sub-views, following the MyExercises precedent.

### 2. Do NOT Fetch Full Workout Data for List

**Temptation:** Call `logging.getWorkoutLog()` for every workout in the list to get exercise details.

**Why bad:** N+1 query problem. Loading 52 workouts would trigger 52 additional queries.

**Instead:** Use `logging.getWorkoutLogs()` which returns `WorkoutLogSummary` with `exercise_count`. Only fetch full workout data when navigating to detail view.

### 3. Do NOT Store History Data at SettingsPanel Level

**Temptation:** Lift `workoutLogs` state to SettingsPanel to preserve list when returning from detail.

**Why bad:** Increases coupling and memory usage. The pattern in this codebase is for sub-views to own their data.

**Instead:** Let HistoryListView reload on mount. The list is fast to load and ensures freshness.

### 4. Do NOT Use Modal for Workout Detail

**Temptation:** Show WorkoutDetailView in a modal overlay.

**Why bad:** The panel is already an overlay. Modal-in-overlay creates awkward UX and z-index complexity.

**Instead:** WorkoutDetailView replaces HistoryListView within the panel content area.

### 5. Do NOT Hardcode Workout Data for Mockup

**Temptation:** Start with static data matching the mockup before wiring to services.

**Why bad:** Services already exist (`logging.getWorkoutLogs()`, `logging.getWorkoutLog()`). Hardcoding data means doing the integration work twice.

**Instead:** Wire to real services from the start. The mockup shows the UI design; implementation uses real data.

---

## Scalability Considerations

| Concern | Current (v4.0) | Future Growth |
|---------|----------------|---------------|
| Number of workouts | 52 (1 year weekly) | Pagination if >100 |
| Panel sub-views | 4 (menu, exercises, history, detail) | Union type scales trivially |
| History aggregates | Computed client-side | Database aggregate if expensive |
| Timeline rendering | All visible | Virtual scrolling if >100 items |

The sub-view pattern within SettingsPanel scales well. Adding future views (e.g., exercise-specific history, date range filter) means adding to `PanelView` union and creating new view components.

---

## Service Layer Verification

### Existing Services (no changes needed)

**`logging.getWorkoutLogs(limit?: number)`**
- Returns: `Promise<ServiceResult<WorkoutLogSummary[]>>`
- Default limit: 52
- Data: id, template_id, started_at, created_at, exercise_count

**`logging.getWorkoutLog(id: string)`**
- Returns: `Promise<ServiceResult<WorkoutLogWithExercises>>`
- Data: Full workout with exercises and sets (sorted by order/set_number)

### Data Types Already Exist

```typescript
// packages/shared/src/types/services.ts
interface WorkoutLogSummary {
  id: string;
  template_id: string | null;
  started_at: string;
  created_at: string;
  exercise_count: number;
}

// packages/shared/src/types/database.ts
interface WorkoutLogWithExercises extends Omit<WorkoutLog, 'user_id'> {
  workout_log_exercises: WorkoutLogExerciseWithSets[];
}
```

**No service layer changes required.** All needed data access is implemented.

---

## Sources

All findings derived from direct codebase analysis:

- `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` -- Panel integration point
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` -- Sub-view routing pattern
- `apps/web/src/surfaces/dashboard/SettingsMenu.tsx` -- Menu item pattern
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` -- Data loading, list rendering
- `packages/shared/src/services/logging.ts` -- Workout history services
- `packages/shared/src/types/services.ts` -- WorkoutLogSummary, LoggingService
- `packages/shared/src/types/database.ts` -- WorkoutLogWithExercises
- `.planning/codebase/ARCHITECTURE.md` -- System architecture reference
- `.planning/design-rules.md` -- Design tokens and patterns
- `.planning/mockups/mockup5-timeline-with-summary.html` -- Approved design direction
