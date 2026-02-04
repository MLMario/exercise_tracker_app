---
status: resolved
trigger: "When an exercise is deleted from My Exercises, the associated charts remain visible in the UI until page refresh"
created: 2026-02-03T00:00:00Z
updated: 2026-02-03T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - Exercise delete in MyExercisesList has no mechanism to notify DashboardSurface to refresh its userCharts state
test: Traced the full component tree and data flow
expecting: N/A - root cause confirmed
next_action: Report findings

## Symptoms

expected: When an exercise is deleted via MyExercisesList, any charts (user_charts) referencing that exercise should immediately disappear from the dashboard UI
actual: Charts remain visible in the UI until a full page refresh, even though the database cascade-deletes them
errors: No error messages - silent stale UI
reproduction: 1) Create an exercise, 2) Add a chart for that exercise, 3) Go to Settings > My Exercises, 4) Delete the exercise, 5) Close settings panel - charts still show
started: Since exercise-delete feature was added (Phase 20)

## Eliminated

(No hypotheses needed to be eliminated - root cause was evident on first investigation)

## Evidence

- timestamp: 2026-02-03T00:00:00Z
  checked: MyExercisesList.tsx confirmDelete handler (lines 151-164)
  found: |
    After successful deleteExercise(), the handler only updates local component state:
    - setUserExercises(prev => prev.filter(...)) -- removes from its own list
    - setExpandedId(null) -- collapses edit row
    - Resets modal state (showDeleteModal, pendingDeleteId, etc.)
    NO signal emission, NO callback to parent, NO event dispatch.
  implication: MyExercisesList is a fully self-contained component with no way to notify siblings about data changes

- timestamp: 2026-02-03T00:00:00Z
  checked: Component hierarchy (DashboardSurface -> SettingsPanel -> MyExercisesList)
  found: |
    - DashboardSurface.tsx renders SettingsPanel (line 552-556)
    - SettingsPanel.tsx renders MyExercisesList (line 79) with ZERO props
    - MyExercisesList accepts no callbacks, no onDelete handler, no shared state
    - SettingsPanel passes only isOpen, onClose, onLogout -- nothing chart-related
  implication: There is no communication channel from MyExercisesList back to DashboardSurface

- timestamp: 2026-02-03T00:00:00Z
  checked: DashboardSurface.tsx chart state management (lines 69, 78, 144-176, 489-496)
  found: |
    - userCharts state (line 69): useState<UserChart[]>([]) -- local state, loaded once on mount
    - chartsNeedRefresh flag (line 78): exists but is only set to false (line 218), never set to true after init
    - loadUserCharts() (line 144): fetches from DB and calls setUserCharts -- but is only called:
      1. On mount via loadDashboard() (line 216)
      2. After chart create (line 366)
      3. After chart delete (line 419)
    - ChartSection receives userCharts as prop (line 490)
    - loadUserCharts is never exposed to children, never called after exercise deletion
  implication: DashboardSurface has the refresh mechanism (loadUserCharts) but nothing triggers it when an exercise is deleted

- timestamp: 2026-02-03T00:00:00Z
  checked: Whether signals or shared state exist
  found: |
    - Grep for signal/Signal/useSignal/computed in dashboard directory: zero matches
    - App uses Preact hooks (useState, useEffect) exclusively -- no @preact/signals
    - No custom event bus, no context provider for cross-component communication
  implication: There is no existing shared state mechanism that could be leveraged. A new communication channel must be created.

## Resolution

root_cause: |
  MyExercisesList (rendered inside SettingsPanel) deletes exercises via exercises.deleteExercise()
  and only updates its own local useState. It has no props, no callbacks, no shared signals, and
  no event mechanism to notify DashboardSurface that an exercise was deleted.

  DashboardSurface owns the userCharts state and has a loadUserCharts() function that would
  correctly re-fetch from the database (which would return the cascade-deleted charts as gone).
  But nothing triggers loadUserCharts() after an exercise deletion -- it is only called on mount
  and after explicit chart CRUD operations within DashboardSurface itself.

  The chartsNeedRefresh flag exists but is dead code for this purpose -- it is initialized to true,
  set to false after initial load, and never set to true again.

fix: |
  NOT APPLIED (diagnosis only). Suggested fix directions:

  Option A (Callback prop chain - simplest):
    1. Add onExerciseDeleted callback prop to MyExercisesList
    2. Pass it through SettingsPanel from DashboardSurface
    3. In DashboardSurface, the callback calls loadUserCharts()
    4. In MyExercisesList.confirmDelete, call onExerciseDeleted?.() after successful delete

  Option B (Custom event):
    1. In MyExercisesList.confirmDelete, dispatch a CustomEvent (e.g., 'exercise-deleted')
    2. In DashboardSurface, add a useEffect listener for that event that calls loadUserCharts()

  Option C (Shared signal - if migrating to @preact/signals):
    1. Create a shared signal for "data invalidation"
    2. MyExercisesList increments it on delete
    3. DashboardSurface watches it and re-fetches charts

  Option A is recommended: it follows the existing prop-drilling pattern used throughout the app
  (e.g., onLogout is passed DashboardSurface -> SettingsPanel) and requires no new architecture.

verification: N/A (diagnosis only)
files_changed: []

### Files Involved

- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` (line 151-164): confirmDelete handler lacks any external notification
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` (line 79): renders MyExercisesList with no props
- `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` (lines 69, 144-176, 552-556): owns chart state and refresh logic but has no trigger from exercise deletion
