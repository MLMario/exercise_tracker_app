# Phase 2: Performance Bottleneck Optimization — Progress Tracker

**Created:** 2026-02-05
**Source:** `optimization_plan_phase_2.md`
**Branch:** `011-optimization-react-components`

---

## Task 2.1: Fix Array Index Keys (P1) — ACCEPT

**Status:** [x] Complete

**Description:** Replace array index keys with stable identifiers in list renderings to prevent state misalignment on delete operations (correctness bug).

**Files:**
- `apps/web/src/surfaces/workout/WorkoutExerciseCard.tsx` (~line 168) — Change `key={setIndex}` to `key={`${exercise.exercise_id}-set-${set.set_number}`}`
- `apps/web/src/surfaces/template-editor/ExerciseEditor.tsx` (~line 163) — Change `key={setIndex}` to `key={set.set_number}`

**Impact:** HIGH (correctness) | **Risk:** LOW

**Actions Taken:**
- Changed `key={setIndex}` to `key={`${exercise.exercise_id}-set-${set.set_number}`}` in WorkoutExerciseCard.tsx (line 168)
- Changed `key={setIndex}` to `key={set.set_number}` in ExerciseEditor.tsx (line 163)
- TypeScript compiles cleanly; all 53 tests pass

---

## Task 2.2: Eliminate onSwipeStateChange Inline Closure (P2 partial) — MODIFY

**Status:** [x] Complete

**Description:** Remove the inline closure that creates N new closures per render in the sets map loop. Refactor so `SetRow` calls `onSwipeStateChange(setIndex, isRevealed)` directly using its existing `setIndex` prop, eliminating the closure in `WorkoutExerciseCard`.

**Files:**
- `apps/web/src/surfaces/workout/WorkoutExerciseCard.tsx` (~line 178) — Pass `onSetSwipeStateChange` directly instead of wrapping in inline closure
- `apps/web/src/surfaces/workout/SetRow.tsx` — Update `SetRowProps.onSwipeStateChange` signature to `(setIndex: number, isRevealed: boolean) => void`; update all internal call sites

**Impact:** LOW-MEDIUM | **Risk:** LOW

**Actions Taken:**
- Updated `SetRowProps.onSwipeStateChange` type from `(isRevealed: boolean) => void` to `(setIndex: number, isRevealed: boolean) => void`
- Updated `resetSwipe` callback: `onSwipeStateChange?.(setIndex, false)` with `setIndex` added to deps
- Updated `useDrag` handler: `onSwipeStateChange?.(setIndex, true)`
- Replaced inline closure in WorkoutExerciseCard: `onSwipeStateChange={onSetSwipeStateChange}` (direct pass)
- TypeScript compiles cleanly; all 53 tests pass

---

## Task 2.3: Hoist Static Inline Style (P5 partial) — REJECT (partial)

**Status:** [x] Complete

**Description:** Hoist the static `{ touchAction: 'pan-y' }` style object to a module-level constant to avoid re-creating it on every render. Dynamic styles (`RestTimerBar` width, `SetRow` visibility) are intentionally skipped per rule 5.3.

**Files:**
- `apps/web/src/surfaces/workout/SetRow.tsx` (~line 220) — Extract `{ touchAction: 'pan-y' }` to `const TOUCH_STYLE = { touchAction: 'pan-y' } as const;` at module level

**Impact:** NEGLIGIBLE | **Risk:** NONE

**Actions Taken:**
- Added `const TOUCH_STYLE = { touchAction: 'pan-y' } as const;` at module level (after imports, before interfaces)
- Replaced `style={{ touchAction: 'pan-y' }}` with `style={TOUCH_STYLE}` in JSX
- TypeScript compiles cleanly; all 53 tests pass

---

## Task 2.4: Fix Auto-save Effect Dependencies (P3) — MODIFY

**Status:** [x] Complete

**Description:** Use a ref pattern for `saveWorkoutToStorage` to narrow the auto-save effect's dependency array to just `[activeWorkout]`, breaking the circular dependency where both the effect dep and callback dep change on every workout update. No debounce — `localStorage.setItem` is fast enough for this payload size.

**Files:**
- `apps/web/src/surfaces/workout/WorkoutSurface.tsx` (~lines 290-319) — Add `saveWorkoutRef` via `useRef`, update auto-save effect to use `saveWorkoutRef.current()`

**Impact:** LOW | **Risk:** LOW

**Actions Taken:**
- Added `saveWorkoutRef = useRef(saveWorkoutToStorage)` with current-assignment pattern (per advanced-event-handler-refs 8.2)
- Narrowed auto-save effect dependency from `[activeWorkout, saveWorkoutToStorage]` to `[activeWorkout]`
- Effect now calls `saveWorkoutRef.current()` instead of `saveWorkoutToStorage()` directly
- TypeScript compiles cleanly; all 53 tests pass

---

## Task 2.5: Fix handleExerciseDeleted Dependencies (P6) — ACCEPT

**Status:** [x] Complete

**Description:** Use ref pattern for `loadUserCharts` and `loadTemplates` inside `handleExerciseDeleted` to make the empty dependency array correct (not just accidentally harmless). Follows `advanced-event-handler-refs` (8.2).

**Files:**
- `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` (~lines 423-425) — Add `loadUserChartsRef` and `loadTemplatesRef` via `useRef`, update `handleExerciseDeleted` to call through refs

**Impact:** LOW (correctness) | **Risk:** LOW

**Actions Taken:**
- Added `loadUserChartsRef = useRef(loadUserCharts)` with current-assignment pattern
- Added `loadTemplatesRef = useRef(loadTemplates)` with current-assignment pattern
- Updated `handleExerciseDeleted` to call `loadUserChartsRef.current()` and `loadTemplatesRef.current()` instead of direct function references
- Empty dependency array `[]` is now semantically correct per `advanced-event-handler-refs` (8.2)
- TypeScript compiles cleanly; all 53 tests pass

---

## Task 2.6: Lazy Load Chart.js (P4) — ACCEPT

**Status:** [x] Complete

**Description:** Convert Chart.js from a static import (~200KB gzipped) to a dynamic import with lazy registration. Chart.js is only needed when the user views charts on their dashboard. The `renderChart` function is already async-capable.

**Files:**
- `packages/shared/src/services/charts.ts` (~lines 18-40) — Remove static `import { Chart, ... } from 'chart.js'` and `Chart.register(...)`. Add `getChartModule()` async function with caching. Update `renderChart` to use `await getChartModule()`.
- `packages/shared/src/types/services.ts` (~line 742) — Update `ChartsService.renderChart` return type to `Promise<any>`
- `apps/web/src/surfaces/dashboard/ChartCard.tsx` (~lines 102-152) — Handle async `renderChart` with cancelled flag pattern

**Impact:** MEDIUM (bundle size) | **Risk:** LOW-MEDIUM

**Actions Taken:**
- Replaced static `import { Chart, CategoryScale, ... } from 'chart.js'` with `import type { Chart } from 'chart.js'` (type-only, no runtime cost)
- Added `chartModuleCache` variable and `getChartModule()` async function with lazy Chart.js registration
- Made `renderChart` async, using `const { Chart: ChartJS } = await getChartModule()` for runtime Chart.js access
- Updated `ChartsService` interface: `renderChart` now returns `Promise<any>`
- Updated `ChartCard.tsx`: wrapped `renderChart` call in async IIFE with `cancelled` flag to prevent stale updates on unmount
- Chart.js (~200KB gzipped) is now split into a separate chunk, only loaded when charts are rendered
- TypeScript compiles cleanly; all 53 tests pass

---

## Task 2.7: Extract useWorkoutBackup Hook (P7 partial) — MODIFY (scope down)

**Status:** [x] Complete

**Description:** Extract localStorage backup logic (~40 lines) from `WorkoutSurface` into a reusable `useWorkoutBackup` hook. Includes `getStorageKey`, `save`, and `clear` functions. The `useReducer` conversion and component decomposition are deferred to a future phase.

**Files:**
- **NEW:** `packages/shared/src/hooks/useWorkoutBackup.ts` — New hook with `getStorageKey`, `save`, `clear`
- **MODIFY:** `packages/shared/src/hooks/index.ts` — Export `useWorkoutBackup` and `WorkoutBackupData`
- **MODIFY:** `apps/web/src/surfaces/workout/WorkoutSurface.tsx` — Import and use `useWorkoutBackup` hook, remove inlined backup logic

**Impact:** LOW (maintainability) | **Risk:** LOW

**Actions Taken:**
- Created `packages/shared/src/hooks/useWorkoutBackup.ts` with `WorkoutBackupData` interface and `useWorkoutBackup` hook
- Hook provides `getStorageKey()`, `save(activeWorkout, snapshot)`, and `clear()` functions
- `save()` accepts workout and snapshot as parameters (pure utility, no closed-over state)
- Exported hook and types from `packages/shared/src/hooks/index.ts`
- Updated `WorkoutSurface.tsx`: removed inline `getWorkoutStorageKey`, `saveWorkoutToStorage`, `clearWorkoutFromStorage` and `WorkoutBackupData` interface
- Replaced with destructured hook: `const { getStorageKey: getWorkoutStorageKey, save: saveWorkoutToStorage, clear: clearWorkoutFromStorage } = useWorkoutBackup(userId)`
- Auto-save effect now passes `(activeWorkout, originalTemplateSnapshot)` to `saveWorkoutRef.current()`
- Removed unused `useCallback` import from WorkoutSurface
- WorkoutSurface reduced by ~35 lines
- TypeScript compiles cleanly; all 53 tests pass

---

## Summary Table

| Task | Item | Verdict | Status |
|------|------|---------|--------|
| 2.1 | Array index keys | ACCEPT | [x] Complete |
| 2.2 | Inline closure elimination | MODIFY | [x] Complete |
| 2.3 | Hoist static style | REJECT (partial) | [x] Complete |
| 2.4 | Auto-save effect deps | MODIFY | [x] Complete |
| 2.5 | handleExerciseDeleted deps | ACCEPT | [x] Complete |
| 2.6 | Chart.js lazy load | ACCEPT | [x] Complete |
| 2.7 | Extract useWorkoutBackup | MODIFY (scope down) | [x] Complete |

**Execution order:** 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7

---

## Deferred Items (Not in Phase 2)

| Item | Reason |
|------|--------|
| useReducer for workout state | Functional setState already follows rule 5.9 |
| Component decomposition (MyExercisesList, ExercisePickerModal) | Maintainability only, no perf impact |
| memo() wrapping child components | Cascading prop stabilization required |
| Context for prop drilling | Only 2 levels deep, idiomatic React |
