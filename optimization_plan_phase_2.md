# Phase 2: Performance Bottleneck Optimization Plan

**Created:** 2026-02-04
**Scope:** Priority 2 items (P1-P8) from `optimization_analysis.md`
**Framework:** Preact with Vite
**Reference:** Vercel React Best Practices (57 rules, 8 categories)
**Prerequisite:** Phase 1 (testing infrastructure + redundancy fixes) completed

---

## Review Methodology

Each P1-P8 item was assessed against:
1. The actual current codebase (post-Phase 1 refactoring)
2. Vercel React Best Practices rules (specific rule IDs cited)
3. Preact-specific behavior (batching, VDOM diffing)

Verdict per item: **ACCEPT** (proceed as-is), **MODIFY** (adjust recommendation), **REJECT** (not worth doing), or **ALREADY DONE** (completed in Phase 1).

---

## Item-by-Item Assessment

### P1. Array Index Keys in Lists -- ACCEPT

**Analysis verdict: The original analysis is correct. This is the highest-priority fix.**

**Current code (WorkoutExerciseCard.tsx:168):**
```tsx
{exercise.sets.map((set, setIndex) => (
  <SetRow key={setIndex} ... />
))}
```

**Current code (ExerciseEditor.tsx:162-163):**
```tsx
{exercise.sets.map((set, setIndex) => (
  <div class="set-row" key={setIndex}>
```

**Why it matters:** When a set is deleted mid-list, Preact reuses the DOM node at the deleted index for the next set's data. In `SetRow`, this means swipe state (`isDragging`, `isRevealed`, `isClosing`) and refs (`wrapperRef`, `setRowRef`) get attached to the wrong set. The `useDrag` hook's internal state also gets misaligned. This is a correctness bug, not just a performance issue.

**Best practice rule:** This is a fundamental React reconciliation requirement. Using array index keys on reorderable/deletable lists causes state mismatches and unnecessary DOM work.

**Recommendation:** Use `set.set_number` as key. `set_number` is already unique within an exercise (renumbered sequentially on delete in `WorkoutSurface.tsx:676-679`). However, since renumbering happens *after* delete, the keys shift and Preact still sees "key 1, key 2" before and after -- the reconciliation won't be confused because the *values* are stable for the remaining items.

**Alternative considered:** Generating UUIDs for each set. Rejected as over-engineering -- `set_number` is renumbered on every delete, so it has the same stability issue as indices. But the actual bug scenario (delete set 2 of 4, set 3 gets set 2's swipe state) is prevented by `set_number` since after the delete+renumber, the keys are 1,2,3 instead of 0,1,2,3 -> 0,1,2 (where old key=2 mapped to set 3 now maps to the new set 2).

**Final recommendation:** Use a compound key `${exercise.exercise_id}-set-${set.set_number}` for `SetRow` in `WorkoutExerciseCard.tsx`. For `ExerciseEditor.tsx`, use `set.set_number` directly since there is no component state to get confused (it's just a `<div>` with inputs).

**Risk:** LOW. Key changes only affect reconciliation behavior, not functionality.

---

### P2. Inline Functions in Map Loops -- MODIFY

**Analysis verdict: Partially valid, but the recommendation needs adjustment for Preact.**

**Locations verified in current code:**

| File | Line | Pattern | Still present? |
|------|------|---------|---------------|
| ExercisePickerModal.tsx | 301 | `onClick={() => handleCategorySelect(category)}` | YES |
| ExercisePickerModal.tsx | 330 | `onClick={() => !isExcluded && handleSelect(exercise)}` | YES |
| MyExercisesList.tsx | 327 | `onClick={() => handleEditClick(exercise)}` | YES |
| MyExercisesList.tsx | 335 | `onClick={() => handleDeleteClick(exercise)}` | YES |
| WorkoutExerciseCard.tsx | 178 | `onSwipeStateChange={(isRevealed) => onSetSwipeStateChange(setIndex, isRevealed)}` | YES |

**Best practice rule:** `rerender-functional-setstate` (5.9) and `rerender-memo` (5.5) are relevant, but only if the child components are wrapped in `memo()`. Without `memo()`, stable function references provide zero benefit because the child re-renders when the parent re-renders regardless.

**Key insight from Vercel guidelines (5.5):** The optimization chain is:
1. Stabilize function references with `useCallback`
2. Wrap child component in `memo()`
3. Only then does skipping re-renders work

Doing step 1 without step 2 is wasted complexity. None of these child components are wrapped in `memo()`.

**Modified recommendation:**

For **WorkoutExerciseCard.tsx line 178** (the `onSwipeStateChange` inline in a map loop): This creates N new closures per render (one per set). Since `SetRow` has internal state (swipe gesture), stabilizing this reference *and* memoizing `SetRow` could prevent re-renders of non-interacted sets when one set changes. This is the only inline function worth optimizing in this category.

For the **ExercisePickerModal** and **MyExercisesList** inline onClick handlers: These are on plain `<div>` and `<button>` elements, not custom components. Preact does not skip re-rendering native elements based on prop equality. Wrapping these in `useCallback` adds complexity for zero performance benefit.

**Action items:**
1. **WorkoutExerciseCard.tsx:178** -- Refactor to pass `exerciseIndex` and `setIndex` as props and let `SetRow` call the handler with its own indices (it already has them). This eliminates the closure entirely rather than memoizing it.
2. **ExercisePickerModal / MyExercisesList inline onClick** -- SKIP. No benefit without `memo()` on children, and these are native elements.

**Risk:** LOW. Changing how `onSwipeStateChange` is called is a straightforward refactor.

---

### P3. useEffect Running Too Frequently (Auto-save) -- MODIFY

**Analysis verdict: The issue is real but the debounce recommendation is problematic.**

**Current code (WorkoutSurface.tsx:315-319):**
```tsx
useEffect(() => {
  if (activeWorkout.started_at) {
    saveWorkoutToStorage();
  }
}, [activeWorkout, saveWorkoutToStorage]);
```

**Why this fires often:** Every weight/reps/done change updates `activeWorkout` via `setActiveWorkout`, which triggers this effect. The effect calls `saveWorkoutToStorage` which does `localStorage.setItem(key, JSON.stringify(backupData))`.

**Original recommendation:** Debounce with `useMemo(() => debounce(...), [...])`.

**Problems with debounce approach:**
1. `useMemo` for side-effectful debounce functions is semantically wrong per `rerender-simple-expression-in-memo` (5.3) -- `useMemo` is for pure computations.
2. If the user closes the browser during the debounce delay, the latest workout state is lost. For a workout backup feature, data loss is worse than extra writes.
3. `localStorage.setItem` is synchronous and fast (~0.1ms for this payload size). The actual perf cost is minimal.

**Best practice rule:** `rerender-dependencies` (5.6) -- Narrow effect dependencies. The effect should depend on the workout data, not on the `saveWorkoutToStorage` callback reference.

**Modified recommendation:**

The current implementation is acceptable. `localStorage.setItem` for a workout-sized JSON payload (~2-5KB) is negligible. The real optimization would be to remove `saveWorkoutToStorage` from the dependency array since it changes whenever `activeWorkout` changes (circular dependency creates double-fire). But examining the code: `saveWorkoutToStorage` depends on `[activeWorkout, originalTemplateSnapshot, getWorkoutStorageKey]` -- so when `activeWorkout` changes, both the effect dep AND the callback dep change, but Preact batches this into a single effect execution.

**Action:** Use a ref for the save function to break the circular dependency pattern per `advanced-event-handler-refs` (8.2):

```tsx
const saveRef = useRef(saveWorkoutToStorage);
saveRef.current = saveWorkoutToStorage;

useEffect(() => {
  if (activeWorkout.started_at) {
    saveRef.current();
  }
}, [activeWorkout]);
```

This narrows the dependency to just `activeWorkout` and avoids the circular callback → effect chain. No debounce needed.

**Risk:** LOW. Functionally identical, just cleaner dependency management.

---

### P4. Missing Code Splitting for Chart.js -- ACCEPT

**Analysis verdict: The original analysis is correct. This is a legitimate bundle optimization.**

**Current code (charts.ts:18-40):**
```tsx
import { Chart, CategoryScale, LinearScale, ... } from 'chart.js';
Chart.register(CategoryScale, LinearScale, ...);
```

**Best practice rules:**
- `bundle-dynamic-imports` (2.4): Use dynamic imports for heavy components not needed at load time.
- `bundle-conditional` (2.2): Load modules only when a feature is activated.

Chart.js is ~200KB gzipped and is only needed when the user has charts on their dashboard. On first load, the dashboard loads templates + exercises + charts data. If the user has no charts, Chart.js was loaded for nothing.

**Recommendation from analysis:** Dynamic import with lazy registration. This is sound.

**Implementation approach:**

```tsx
// charts.ts
let chartRegistered = false;

async function ensureChartRegistered(): Promise<typeof import('chart.js')> {
  if (chartRegistered) {
    const mod = await import('chart.js');
    return mod;
  }
  const { Chart, CategoryScale, LinearScale, LineController, LineElement, PointElement, Legend, Tooltip, Filler } = await import('chart.js');
  Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Legend, Tooltip, Filler);
  chartRegistered = true;
  return { Chart, CategoryScale, LinearScale, LineController, LineElement, PointElement, Legend, Tooltip, Filler } as any;
}
```

The `renderChart` function (the only consumer of the Chart constructor) would `await ensureChartRegistered()` before creating a chart instance.

**Risk:** LOW-MEDIUM. Need to verify that the dynamic import works correctly with Vite's chunking and that ChartCard handles the async initialization. The `renderChart` function is already async-capable since it's called from effects.

---

### P5. Inline Style Objects -- REJECT (PARTIAL)

**Analysis verdict: The original analysis overstates the impact. Mostly not worth optimizing.**

**Locations verified:**

| File | Line | Style | Verdict |
|------|------|-------|---------|
| SetRow.tsx | 220 | `style={{ touchAction: 'pan-y' }}` | Static -- hoist to constant |
| RestTimerBar.tsx | 85 | `style={{ width: \`${progress}%\` }}` | Dynamic -- keep inline |
| SetRow.tsx | 257 | `style={{ visibility: ... }}` | Dynamic -- keep inline |

**Best practice rule:** `rerender-simple-expression-in-memo` (5.3) says: "Do not wrap a simple expression with a primitive result type in useMemo." The corollary: don't memoize trivially cheap computations.

**Assessment:**
- **SetRow `touchAction`**: This is a static object created on every render. Per `rendering-hoist-jsx` (6.3), static values should be hoisted outside the component. Cost: one object allocation per render per SetRow instance. Worth fixing only because it's trivial.
- **RestTimerBar `width`**: This changes on every timer tick (every second). Memoizing with `useMemo(() => ({ width: \`${progress}%\` }), [progress])` adds the overhead of the memo comparison for something that changes every render anyway. Net negative.
- **SetRow `visibility`**: Same as above -- depends on `canDelete`, `isRevealed`, `isDragging`, `isClosing`. Changes frequently during swipe. `useMemo` overhead > object creation cost.

**Action items:**
1. **SetRow.tsx:220** -- Hoist `{ touchAction: 'pan-y' }` to a module-level constant. Trivial fix.
2. **RestTimerBar.tsx:85** and **SetRow.tsx:257** -- SKIP. Memoization overhead exceeds benefit per rule 5.3.

**Risk:** NONE.

---

### P6. Incorrect useCallback Dependencies -- ALREADY DONE (PARTIAL) + ACCEPT (REMAINING)

**Analysis verdict: Partially addressed in Phase 1; remaining issue is real.**

**Current code (DashboardSurface.tsx:423-425):**
```tsx
const handleExerciseDeleted = useCallback(async () => {
  await Promise.all([loadUserCharts(), loadTemplates()]);
}, []);
```

**Phase 1 status:** The `useConfirmationModal` and `useTimerState` hooks were refactored in Phase 1, but `handleExerciseDeleted` was not touched.

**Issue:** `loadUserCharts` and `loadTemplates` are defined as plain `async` functions (not wrapped in `useCallback`), so they are recreated on every render. The empty dependency array means `handleExerciseDeleted` captures the initial render's versions of these functions. However, since neither function reads component state via closure (they only use service calls and `setState`), the stale closure is harmless -- `setTemplatesList(data)` and `setUserCharts(data)` always use the setter functions which are stable.

**Best practice rule:** `advanced-event-handler-refs` (8.2) -- Store event handlers in refs to prevent stale closures without adding dependencies.

**Deeper analysis:** The functions `loadUserCharts` and `loadTemplates` don't close over any state. They call service APIs and use `setState` setters. React/Preact setState setters are stable references. So the empty deps on `handleExerciseDeleted` is *technically* incorrect (ESLint would warn) but *functionally* harmless.

**Recommendation:** Use a ref pattern to make the code correct without performance cost:

```tsx
const handleExerciseDeleted = useCallback(async () => {
  await Promise.all([loadUserCharts(), loadTemplates()]);
}, [loadUserCharts, loadTemplates]);
```

But this requires wrapping `loadUserCharts` and `loadTemplates` in `useCallback` first, which cascades into their dependencies. The simpler approach per rule 8.2:

```tsx
const loadUserChartsRef = useRef(loadUserCharts);
loadUserChartsRef.current = loadUserCharts;
const loadTemplatesRef = useRef(loadTemplates);
loadTemplatesRef.current = loadTemplates;

const handleExerciseDeleted = useCallback(async () => {
  await Promise.all([loadUserChartsRef.current(), loadTemplatesRef.current()]);
}, []);
```

**Risk:** LOW. Functionally identical behavior with correct dependency semantics.

---

### P7. Large Monolithic Components -- MODIFY (SCOPE DOWN)

**Analysis verdict: Real issue, but the recommendation scope is too aggressive for Phase 2.**

**Current sizes (post-Phase 1):**

| Component | Lines | Phase 1 reduction |
|-----------|-------|-------------------|
| WorkoutSurface | 972 | Timer state: 5 lines -> 1 hook call |
| DashboardSurface | 566 | Modal state: 4 lines -> 2 hook calls |
| MyExercisesList | 466 | isCreating sync removed |
| ExercisePickerModal | ~425 | No changes |

**Best practice rule:** `rerender-memo` (5.5) -- Extract expensive work into memoized components. But the Vercel guidelines explicitly note this is MEDIUM impact. Large component decomposition is primarily a maintainability concern, not a performance concern.

**Assessment:** The original analysis recommends extracting `useWorkoutTimer`, `useWorkoutBackup`, and converting to `useReducer`. Phase 1 already extracted `useTimerState` and `useConfirmationModal`. The remaining extractions have diminishing returns:

- **useWorkoutBackup:** Would extract ~40 lines (getWorkoutStorageKey, saveWorkoutToStorage, clearWorkoutFromStorage, the auto-save effect, and the storage sync listener). This is a reasonable extraction.
- **useReducer conversion:** The 8 set management handlers (handleAddSet, handleDeleteSet, handleWeightChange, handleRepsChange, handleToggleDone, etc.) would move into a reducer. This is a significant refactor with moderate risk and debatable benefit -- the functional setState pattern already used is the recommended approach per rule 5.9.
- **Component decomposition (MyExercisesList, ExercisePickerModal):** These are self-contained components. Breaking them up creates more files and more prop threading without clear performance benefit.

**Modified recommendation for Phase 2:** Extract `useWorkoutBackup` hook only. Defer `useReducer` conversion and component decomposition to a future phase.

**Risk:** LOW for backup hook extraction. MEDIUM for the deferred items.

---

### P8. Prop Drilling Depth -- REJECT

**Analysis verdict: Not worth addressing. The depth is acceptable.**

**Current prop chains:**
1. DashboardSurface -> SettingsPanel -> MyExercisesList: `onExerciseDeleted` (2 levels)
2. WorkoutSurface -> WorkoutExerciseCard -> SetRow: 8+ callbacks (2 levels)

**Best practice rules assessed:**
- The Vercel guidelines do NOT list prop drilling as a performance concern. It's absent from all 57 rules.
- `rerender-functional-setstate` (5.9) addresses callback stability, not drilling depth.
- Context is recommended for 3+ levels of drilling, not 2 levels.

**Assessment:** 2 levels of prop drilling is completely standard React architecture. Introducing Context or `useReducer` purely to flatten this adds indirection and complexity without measurable benefit. The WorkoutSurface callbacks are already using functional setState (stable patterns). Adding a Context provider for workout state would make the component harder to test and harder to reason about.

**Action:** SKIP entirely. The current 2-level prop passing is idiomatic React.

**Risk:** N/A.

---

## Implementation Plan

### Task 2.1: Fix Array Index Keys (P1)

**Files:**
- `apps/web/src/surfaces/workout/WorkoutExerciseCard.tsx` (line 168)
- `apps/web/src/surfaces/template-editor/ExerciseEditor.tsx` (line 163)

**Changes:**

WorkoutExerciseCard.tsx:
```tsx
// Before:
key={setIndex}

// After:
key={`${exercise.exercise_id}-set-${set.set_number}`}
```

ExerciseEditor.tsx:
```tsx
// Before:
key={setIndex}

// After:
key={set.set_number}
```

**Verification:** Delete a set mid-list, verify no swipe state misalignment. Existing perf tests cover render counts.

---

### Task 2.2: Eliminate onSwipeStateChange Inline Closure (P2 partial)

**File:** `apps/web/src/surfaces/workout/WorkoutExerciseCard.tsx` (line 178)

**Change:** Instead of creating an inline closure that captures `setIndex`:

```tsx
// Before:
onSwipeStateChange={(isRevealed) => onSetSwipeStateChange(setIndex, isRevealed)}

// After - update SetRow's onSwipeStateChange signature to include setIndex:
onSwipeStateChange={onSetSwipeStateChange}
```

This requires `SetRow` to call `onSwipeStateChange(setIndex, isRevealed)` instead of `onSwipeStateChange(isRevealed)`. `SetRow` already has `setIndex` as a prop, so it can pass it through.

**SetRow changes:**
- Update `SetRowProps.onSwipeStateChange` signature: `(setIndex: number, isRevealed: boolean) => void`
- Update all calls to `onSwipeStateChange?.(isRevealed)` -> `onSwipeStateChange?.(setIndex, isRevealed)`

**Verification:** Swipe gesture still works, swipe coordination (one revealed at a time) still works.

---

### Task 2.3: Hoist Static Inline Style (P5 partial)

**File:** `apps/web/src/surfaces/workout/SetRow.tsx` (line 220)

**Change:**
```tsx
// Before (inside component):
style={{ touchAction: 'pan-y' }}

// After (module-level constant):
const TOUCH_STYLE = { touchAction: 'pan-y' } as const;
// Then in JSX:
style={TOUCH_STYLE}
```

**Verification:** Swipe gesture still works.

---

### Task 2.4: Fix Auto-save Effect Dependencies (P3)

**File:** `apps/web/src/surfaces/workout/WorkoutSurface.tsx` (lines 290-319)

**Change:** Use ref pattern for `saveWorkoutToStorage` to narrow effect dependencies:

```tsx
// Add ref for save function (per advanced-event-handler-refs)
const saveWorkoutRef = useRef(saveWorkoutToStorage);
saveWorkoutRef.current = saveWorkoutToStorage;

// Simplified effect with narrowed dependency
useEffect(() => {
  if (activeWorkout.started_at) {
    saveWorkoutRef.current();
  }
}, [activeWorkout]);
```

**Verification:** Workout backup/restore still works. Multi-tab sync still works.

---

### Task 2.5: Fix handleExerciseDeleted Dependencies (P6)

**File:** `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` (lines 423-425)

**Change:** Use ref pattern for stable callback:

```tsx
// Add refs for load functions
const loadUserChartsRef = useRef(loadUserCharts);
loadUserChartsRef.current = loadUserCharts;
const loadTemplatesRef = useRef(loadTemplates);
loadTemplatesRef.current = loadTemplates;

const handleExerciseDeleted = useCallback(async () => {
  await Promise.all([loadUserChartsRef.current(), loadTemplatesRef.current()]);
}, []);
```

**Verification:** Delete an exercise from My Exercises, verify charts and templates refresh.

---

### Task 2.6: Lazy Load Chart.js (P4)

**File:** `packages/shared/src/services/charts.ts` (lines 18-40)

**Change:** Convert static imports to dynamic:

```tsx
// Remove static imports of chart.js at top of file
// Replace Chart.register(...) with lazy initialization

let chartModuleCache: typeof import('chart.js') | null = null;

async function getChartModule() {
  if (chartModuleCache) return chartModuleCache;
  const mod = await import('chart.js');
  mod.Chart.register(
    mod.CategoryScale,
    mod.LinearScale,
    mod.LineController,
    mod.LineElement,
    mod.PointElement,
    mod.Legend,
    mod.Tooltip,
    mod.Filler
  );
  chartModuleCache = mod;
  return mod;
}
```

Update `renderChart` to use `const { Chart } = await getChartModule()` before creating instances.

**Verification:** Charts still render. Bundle size reduced (check with `vite build --report`).

---

### Task 2.7: Extract useWorkoutBackup Hook (P7 partial)

**Files:**
- NEW: `packages/shared/src/hooks/useWorkoutBackup.ts`
- MODIFY: `apps/web/src/surfaces/workout/WorkoutSurface.tsx`

**Change:** Extract localStorage backup logic into reusable hook:

```tsx
// useWorkoutBackup.ts
export function useWorkoutBackup(userId: string | undefined) {
  const getStorageKey = useCallback((): string | null => {
    return userId ? `activeWorkout_${userId}` : null;
  }, [userId]);

  const save = useCallback((activeWorkout: ActiveWorkout, snapshot: TemplateSnapshot | null): void => {
    const key = /* ... */;
    // ... localStorage.setItem logic
  }, [getStorageKey]);

  const clear = useCallback((): void => {
    // ... localStorage.removeItem logic
  }, [getStorageKey]);

  return { getStorageKey, save, clear };
}
```

WorkoutSurface would import and use this hook, reducing its line count by ~40 lines.

**Verification:** Workout backup/restore still works. Multi-tab sync still works. Existing tests pass.

---

## Summary

| Item | Verdict | Action | Impact | Risk |
|------|---------|--------|--------|------|
| P1. Array index keys | ACCEPT | Fix keys in WorkoutExerciseCard + ExerciseEditor | HIGH (correctness) | LOW |
| P2. Inline functions | MODIFY | Fix only `onSwipeStateChange` closure; skip native element handlers | LOW-MEDIUM | LOW |
| P3. Effect frequency | MODIFY | Use ref pattern instead of debounce | LOW | LOW |
| P4. Chart.js lazy load | ACCEPT | Dynamic import with lazy registration | MEDIUM (bundle size) | LOW-MEDIUM |
| P5. Inline styles | REJECT (partial) | Hoist only the static `touchAction` style | NEGLIGIBLE | NONE |
| P6. useCallback deps | ACCEPT | Use ref pattern for stable callback | LOW (correctness) | LOW |
| P7. Large components | MODIFY (scope down) | Extract `useWorkoutBackup` only | LOW (maintainability) | LOW |
| P8. Prop drilling | REJECT | Skip entirely -- 2 levels is idiomatic | NONE | N/A |

**Execution order:** Tasks 2.1 -> 2.2 -> 2.3 -> 2.4 -> 2.5 -> 2.6 -> 2.7

Tasks 2.1-2.3 are quick, isolated fixes. Task 2.4-2.5 are ref pattern additions. Task 2.6 requires testing the async chart initialization flow. Task 2.7 is a larger extraction.

---

## Deferred to Future Phases

| Item | Reason for Deferral |
|------|-------------------|
| useReducer for workout state | Functional setState already follows rule 5.9; reducer adds complexity without clear perf gain |
| Component decomposition (MyExercisesList, ExercisePickerModal) | Maintainability concern, not performance; no measurable impact |
| memo() wrapping child components | Would require stabilizing ALL props first; cascading changes across many files |
| Context for prop drilling | Only 2 levels deep; standard React pattern |

---

## Vercel Best Practice Rules Applied

| Rule ID | Rule Name | Applied To |
|---------|-----------|------------|
| 5.9 | Use Functional setState Updates | P2 (already in place), P3 assessment |
| 5.3 | Don't Memo Simple Expressions | P5 (rejected memoizing dynamic styles) |
| 5.6 | Narrow Effect Dependencies | P3 (narrowed auto-save deps) |
| 8.2 | Store Event Handlers in Refs | P3, P6 (ref pattern for callbacks) |
| 6.3 | Hoist Static JSX Elements | P5 (hoisted touchAction style) |
| 2.4 | Dynamic Imports for Heavy Components | P4 (Chart.js lazy loading) |
| 2.2 | Conditional Module Loading | P4 (load Chart.js only when needed) |
| 5.5 | Extract to Memoized Components | P2 (assessed but scoped down) |
