# Optimization Plan: Redundancy Issues (R1-R4)

**Created:** 2026-02-04
**Scope:** Redundancy elimination from optimization_analysis.md
**Testing:** Automated performance tests with React Testing Library
**Hook Location:** `packages/shared/src/hooks/` (cross-platform reusable)

---

## Analysis Summary

After reviewing the source code against Vercel's React Best Practices, here are the validated findings:

| Issue | Original Claim | Verified Status | Action |
|-------|---------------|-----------------|--------|
| R1 | Duplicate exercise state | **INVALID** - `exercisesWithData` requires separate API call | No action |
| R2 | Timer state explosion | **VALID** - 5 separate states risk sync bugs | Consolidate |
| R3 | Modal state duplication | **VALID** - Pattern repeated 3+ times | Extract hook |
| R4 | Duplicate isCreating | **VALID** - Synced via effect callback | Single source |

**Key Best Practice Applied:** `rerender-derived-state-no-effect` - "Do not set state in effects solely in response to prop changes; prefer derived values or keyed resets instead."

---

## Tasks

### Phase 1: Create Testing Infrastructure

#### Task 1.1: Set up performance test utilities
**File:** `packages/shared/src/test-utils/performance.ts`

Create reusable utilities for measuring render performance:
- `measureRenderCount(component)` - Count renders during interaction
- `measureRenderTime(component, interaction)` - Time render cycles
- `createRenderSpy()` - Track render calls with timestamps

**Acceptance Criteria:**
- Utilities work with Preact Testing Library
- Results include render count, total time, average time per render
- Can measure specific component subtrees

---

#### Task 1.2: Create baseline performance tests for timer state
**File:** `apps/web/src/surfaces/workout/__tests__/WorkoutSurface.perf.test.tsx`

Capture current behavior before refactoring:
- Test: "timer state updates should not cause cascading re-renders"
- Measure render count when: starting timer, pausing, resuming, stopping
- Measure render count of child components (WorkoutExerciseCard) during timer tick
- Document baseline numbers in test file comments

**Acceptance Criteria:**
- Tests pass (capturing current behavior)
- Baseline render counts documented
- Tests use `performance.now()` for timing

---

#### Task 1.3: Create baseline tests for modal state patterns
**File:** `apps/web/src/surfaces/dashboard/__tests__/DashboardSurface.perf.test.tsx`

Capture current modal open/close behavior:
- Test: "opening delete chart modal should have minimal render impact"
- Test: "opening delete template modal should have minimal render impact"
- Measure parent component re-renders when modal state changes

**Acceptance Criteria:**
- Tests pass (capturing current behavior)
- Baseline numbers documented

---

#### Task 1.4: Create baseline tests for isCreating sync
**File:** `apps/web/src/surfaces/dashboard/__tests__/SettingsPanel.perf.test.tsx`

Capture current effect-based sync behavior:
- Test: "isCreating state sync between SettingsPanel and MyExercisesList"
- Measure render count during create exercise flow
- Track effect execution count

**Acceptance Criteria:**
- Tests capture current effect-driven sync pattern
- Document effect firing frequency

---

### Phase 2: Implement Redundancy Fixes

#### Task 2.1: Create useConfirmationModal hook
**File:** `packages/shared/src/hooks/useConfirmationModal.ts`

Extract reusable confirmation modal pattern using discriminated union state (per `rerender-derived-state`):

```typescript
type ModalState<T> =
  | { isOpen: false }
  | { isOpen: true; data: T };

interface UseConfirmationModal<T> {
  isOpen: boolean;
  data: T | null;
  open: (data: T) => void;
  close: () => void;
}

export function useConfirmationModal<T>(): UseConfirmationModal<T>
```

**Why discriminated union:** Impossible to have `isOpen: true` with `data: null` - eliminates entire class of bugs.

**Acceptance Criteria:**
- Hook is type-safe with generic data parameter
- Single state object (not paired boolean + data)
- Exported from `packages/shared/src/hooks/index.ts`
- Unit tests for open/close/data access

---

#### Task 2.2: Refactor DashboardSurface modal states
**File:** `apps/web/src/surfaces/dashboard/DashboardSurface.tsx`

Replace paired state patterns with `useConfirmationModal`:

**Before (lines 90-95):**
```typescript
const [showDeleteChartModal, setShowDeleteChartModal] = useState(false);
const [pendingDeleteChartId, setPendingDeleteChartId] = useState<string | null>(null);
const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
const [pendingDeleteTemplateId, setPendingDeleteTemplateId] = useState<string | null>(null);
```

**After:**
```typescript
const deleteChartModal = useConfirmationModal<string>();
const deleteTemplateModal = useConfirmationModal<string>();
```

**Acceptance Criteria:**
- Both delete modals use the new hook
- All modal open/close/confirm handlers updated
- Existing functionality preserved
- Performance tests show equal or fewer renders

---

#### Task 2.3: Create useTimerState hook with discriminated union
**File:** `packages/shared/src/hooks/useTimerState.ts`

Consolidate 5 timer states into single discriminated union (per `rerender-derived-state`):

```typescript
type TimerState =
  | { status: 'idle' }
  | { status: 'active'; exerciseIndex: number; elapsed: number; total: number }
  | { status: 'paused'; exerciseIndex: number; elapsed: number; total: number };

interface UseTimerState {
  timer: TimerState;
  start: (exerciseIndex: number, totalSeconds: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: () => void; // Increment elapsed by 1
}

export function useTimerState(): UseTimerState
```

**Why single state:** Eliminates impossible states like `timerActive: true, timerPaused: true` or `timerActive: false` with non-null `activeTimerExerciseIndex`.

**Acceptance Criteria:**
- All timer transitions handled correctly
- Impossible states are impossible (TypeScript enforced)
- `tick` uses functional setState per `rerender-functional-setstate`
- Unit tests cover all state transitions

---

#### Task 2.4: Refactor WorkoutSurface to use useTimerState
**File:** `apps/web/src/surfaces/workout/WorkoutSurface.tsx`

Replace 5 separate timer states (lines 172-176) with `useTimerState` hook.

**Before:**
```typescript
const [timerSeconds, setTimerSeconds] = useState(0);
const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);
const [timerActive, setTimerActive] = useState(false);
const [timerPaused, setTimerPaused] = useState(false);
const [activeTimerExerciseIndex, setActiveTimerExerciseIndex] = useState<number | null>(null);
```

**After:**
```typescript
const { timer, start, pause, resume, stop, tick } = useTimerState();
```

**Acceptance Criteria:**
- All timer functionality works identically
- Timer interval logic uses `tick()`
- RestTimerBar receives derived props from `timer` state
- Performance tests show reduced render count during timer operations

---

#### Task 2.5: Eliminate isCreating effect sync (R4)
**Files:**
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx`
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx`

Current pattern violates `rerender-derived-state-no-effect`:
```typescript
// MyExercisesList.tsx line 76-78
useEffect(() => {
  onCreatingChange?.(isCreating);
}, [isCreating, onCreatingChange]);
```

**Solution:** Lift `isCreating` state to SettingsPanel (single source of truth).

**SettingsPanel changes:**
- Own `isCreating` state (already has it at line 29)
- Pass `isCreating` and `setIsCreating` to MyExercisesList

**MyExercisesList changes:**
- Remove local `isCreating` state (line 71)
- Remove `onCreatingChange` effect (lines 76-78)
- Accept `isCreating` and `onIsCreatingChange` as props
- Call `onIsCreatingChange(true/false)` directly in handlers

**Acceptance Criteria:**
- Single source of truth for `isCreating` in SettingsPanel
- No effect-based state sync
- Create exercise flow works identically
- Performance tests show fewer effect executions

---

### Phase 3: Verify Improvements

#### Task 3.1: Run performance tests and document improvements
**Action:** Run all baseline tests from Phase 1 after Phase 2 changes

**Metrics to capture:**
- Timer operations: render count before vs after
- Modal operations: render count before vs after
- isCreating flow: effect count before vs after

**Acceptance Criteria:**
- Performance tests pass
- Render counts equal or lower than baseline
- No effect-sync for isCreating (count = 0)
- Document results in test file comments

---

#### Task 3.2: Manual verification of timer edge cases
**Action:** Test timer functionality manually

**Test scenarios:**
1. Start timer → pause → resume → complete
2. Start timer → cancel workout → verify cleanup
3. Start timer on exercise A → switch to exercise B timer
4. Timer running → app backgrounded → foregrounded

**Acceptance Criteria:**
- All scenarios work correctly
- No console errors
- Timer displays correct values

---

#### Task 3.3: Manual verification of modal edge cases
**Action:** Test modal functionality manually

**Test scenarios:**
1. Open delete chart modal → confirm → verify deletion
2. Open delete chart modal → cancel → verify no deletion
3. Open delete template modal → confirm → verify deletion
4. Rapid open/close cycles → verify no stale state

**Acceptance Criteria:**
- All scenarios work correctly
- Modal data matches clicked item
- No stale pendingDeleteId issues

---

## File Change Summary

| File | Action | Lines Changed (est.) |
|------|--------|---------------------|
| `packages/shared/src/hooks/useConfirmationModal.ts` | Create | ~30 |
| `packages/shared/src/hooks/useTimerState.ts` | Create | ~60 |
| `packages/shared/src/hooks/index.ts` | Create/Update | ~5 |
| `packages/shared/src/test-utils/performance.ts` | Create | ~50 |
| `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` | Modify | ~20 |
| `apps/web/src/surfaces/workout/WorkoutSurface.tsx` | Modify | ~40 |
| `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` | Modify | ~10 |
| `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` | Modify | ~15 |
| Test files (4) | Create | ~200 |

**Total estimated:** ~430 lines across 11 files

---

## Dependencies

```
Task 1.1 (test utils)
    ↓
Task 1.2, 1.3, 1.4 (baselines) [parallel]
    ↓
Task 2.1, 2.3 (hooks) [parallel]
    ↓
Task 2.2, 2.4, 2.5 (refactors) [can be parallel after hooks]
    ↓
Task 3.1 (automated verification)
    ↓
Task 3.2, 3.3 (manual verification) [parallel]
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Timer renders per tick | ≤1 (currently unknown, will baseline) |
| Modal open render cascade | ≤2 component renders |
| Effect-based syncs eliminated | 100% (isCreating effect removed) |
| Impossible state combinations | 0 (TypeScript enforced) |
| Test coverage for new hooks | 100% of public API |

---

## Notes

### R1 Correction
The original analysis claimed `exercisesWithData` was derivable from `availableExercises`. This is **incorrect**. `exercisesWithData` requires a database query (`getExercisesWithLoggedData`) that checks the `workout_sets` table for logged data. These are independent data sources, not derived state.

### Cross-Platform Consideration
Hooks are placed in `packages/shared/src/hooks/` to support future iOS development. The discriminated union patterns and functional setState work identically in React Native.
