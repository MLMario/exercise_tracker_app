---
phase: 14-workout-service-imports
plan: 01
subsystem: refactor
tags: [typescript, imports, services, preact]

# Dependency graph
requires:
  - phase: 05-data-services
    provides: TypeScript service modules with @/services barrel export
provides:
  - WorkoutSurface uses direct TypeScript service imports
  - TemplateEditorSurface uses direct TypeScript service imports
affects: [16-remove-window-exports]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Direct service imports via @/services barrel

key-files:
  created: []
  modified:
    - src/surfaces/workout/WorkoutSurface.tsx
    - src/surfaces/template-editor/TemplateEditorSurface.tsx

key-decisions:
  - "Renamed destructured variable to allExercises to avoid shadowing imported exercises service"

patterns-established:
  - "Surface components import services directly: import { exercises, templates } from '@/services'"

issues-created: []

# Metrics
duration: 3min
completed: 2026-01-14
---

# Phase 14 Plan 01: Workout Service Imports Summary

**Updated WorkoutSurface.tsx and TemplateEditorSurface.tsx to use direct TypeScript service imports instead of window globals**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-14
- **Completed:** 2026-01-14
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced 5 window.* service calls in WorkoutSurface.tsx with direct imports
- Replaced 4 window.* service calls in TemplateEditorSurface.tsx with direct imports
- Both files now import from @/services barrel export
- Build passes without TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Update WorkoutSurface.tsx** - `7d001ea` (feat)
2. **Task 2: Update TemplateEditorSurface.tsx** - `524fb34` (feat)

## Files Created/Modified

- `src/surfaces/workout/WorkoutSurface.tsx` - Added import from @/services, replaced window.exercises/logging/templates calls
- `src/surfaces/template-editor/TemplateEditorSurface.tsx` - Added import from @/services, replaced window.exercises/templates calls

## Decisions Made

- Renamed destructured variable from `exercises` to `allExercises` in handleCreateExercise to avoid shadowing the imported `exercises` service

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Phase 14 complete (1/1 plans)
- Ready for Phase 15: Dashboard Service Imports

---
*Phase: 14-workout-service-imports*
*Completed: 2026-01-14*
