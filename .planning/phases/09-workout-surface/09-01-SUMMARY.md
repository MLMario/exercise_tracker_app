---
phase: 09-workout-surface
plan: 01
subsystem: surfaces
tags: [preact, workout, ui-container, state-management, surface-routing]

# Dependency graph
requires:
  - phase: 08-template-editor-surface
    provides: TemplateEditorSurface pattern, surface routing in main.tsx
  - external: TemplateWithExercises type
provides:
  - WorkoutSurface container component
  - WorkoutSet, WorkoutExercise, ActiveWorkout interfaces
  - Surface routing for workout surface
  - Navigation callbacks between dashboard and workout
affects: [09-02, 09-03, 11-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [workout-state-management, timer-state, surface-navigation-props]

key-files:
  created:
    - src/surfaces/workout/WorkoutSurface.tsx
    - src/surfaces/workout/index.ts
  modified:
    - src/surfaces/index.ts
    - src/main.tsx
    - src/surfaces/dashboard/DashboardSurface.tsx

key-decisions:
  - "WorkoutSurface receives template prop and initializes workout state from it"
  - "Timer state managed with useState (timerSeconds, timerTotalSeconds, timerActive, timerPaused)"
  - "Original template snapshot stored for change detection"
  - "Surface navigation via props callbacks (onFinish, onCancel)"

patterns-established:
  - "WorkoutSurface follows DashboardSurface/TemplateEditorSurface container pattern"
  - "ActiveWorkout interface mirrors js/app.js lines 696-713"
  - "formatTime and formatWorkoutDate utilities mirror js/app.js lines 1175-1194"
  - "Surface navigation uses prop callbacks passed from App component"

issues-created: []

# Metrics
duration: ~8min
completed: 2026-01-13
---

# Phase 9: Workout Surface - Plan 01 Summary

**WorkoutSurface container created with state management and surface navigation integrated.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-01-13
- **Completed:** 2026-01-13
- **Tasks:** 3/3
- **Files modified:** 5

## Accomplishments

- Created WorkoutSurface.tsx with state management for active workout tracking
- Defined WorkoutSet, WorkoutExercise, and ActiveWorkout interfaces
- Implemented timer state (timerSeconds, timerTotalSeconds, timerActive, timerPaused)
- Added modal visibility state (showFinishWorkoutModal, showCancelWorkoutModal, etc.)
- Initialize activeWorkout from template prop with useEffect
- Store originalTemplateSnapshot for change detection
- Added formatTime and formatWorkoutDate utility functions
- Created barrel export index.ts for workout surface
- Updated surfaces/index.ts to export WorkoutSurface
- Added workout surface routing in main.tsx with activeWorkoutTemplate state
- Connected DashboardSurface onStartWorkout to surface navigation

## Task Commits

1. **Task 1: Create WorkoutSurface container with state** - `e7836b1`
2. **Task 2: Create barrel exports and surface routing** - `c601c6b`
3. **Task 3: Add format utilities and header styling** - (included in Task 1)

## Files Created/Modified

**Created:**
- `src/surfaces/workout/WorkoutSurface.tsx` - Container component with state and handlers
- `src/surfaces/workout/index.ts` - Barrel export for workout surface

**Modified:**
- `src/surfaces/index.ts` - Added WorkoutSurface export
- `src/main.tsx` - Added workout surface routing and activeWorkoutTemplate state
- `src/surfaces/dashboard/DashboardSurface.tsx` - Added onStartWorkout prop and handler

## State Variables Ported

From js/app.js lines 48-77:
- `activeWorkout` - Object with template_id, template_name, started_at, exercises[]
- `originalTemplateSnapshot` - Deep copy for change detection
- `timerSeconds`, `timerTotalSeconds`, `timerActive`, `timerPaused` - Timer state
- `activeTimerExerciseIndex` - Which exercise timer is running for
- `showFinishWorkoutModal`, `showCancelWorkoutModal`, `showTemplateUpdateModal` - Modal visibility
- `showExercisePicker` - Exercise picker modal
- `pendingWorkoutData` - Workout data pending template update decision
- `error`, `successMessage` - Messages

## Key Interfaces Created

**WorkoutSet:** (tracking set completion)
- set_number, weight, reps, is_done

**WorkoutExercise:** (js/app.js lines 700-712)
- exercise_id, name, category, order, rest_seconds, sets

**ActiveWorkout:** (js/app.js lines 696-713)
- template_id, template_name, started_at, exercises

## Verification Checklist

- [x] `npm run build` succeeds without errors
- [x] `npx tsc --noEmit` passes
- [x] WorkoutSurface component renders when clicking "Start Workout"
- [x] Header shows cancel button, template name, date, finish button
- [x] Navigation back to dashboard works (cancel button triggers callback)

## Deviations from Plan

- Task 3 (format utilities and header styling) was completed as part of Task 1 for efficiency
- All planned functionality was implemented

## Issues Encountered

None.

## Next Step

Plan 09-02: Implement exercise card component with set tracking and rest timer.

---
*Phase: 09-workout-surface*
*Plan: 01*
*Completed: 2026-01-13*
