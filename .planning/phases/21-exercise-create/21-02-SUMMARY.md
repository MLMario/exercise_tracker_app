---
phase: 21-exercise-create
plan: 02
subsystem: ui
tags: [preact, supabase, exercises, validation, modal]

# Dependency graph
requires:
  - phase: 21-exercise-create
    provides: exercise create modal UI and basic flow
provides:
  - case-insensitive duplicate name detection in createExercise
  - modal dismiss guards during active save operations
  - onCreatingChange callback pattern for parent notification
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Case-insensitive .ilike() pre-check before INSERT"
    - "onCreatingChange callback for save-in-progress state propagation"

key-files:
  created: []
  modified:
    - packages/shared/src/services/exercises.ts
    - apps/web/src/surfaces/dashboard/SettingsPanel.tsx
    - apps/web/src/surfaces/dashboard/MyExercisesList.tsx

key-decisions:
  - "Pre-check with .ilike() before INSERT rather than relying on DB constraint (DB has no unique constraint on name)"
  - "Use callback prop pattern to notify parent of isCreating state"
  - "Guard all three dismiss paths: backdrop click, back button, and cleanup useEffect"

patterns-established:
  - "onCreatingChange callback: child notifies parent of async operation state"

# Metrics
duration: 2min
completed: 2026-02-04
---

# Phase 21 Plan 02: Gap Closure Summary

**Case-insensitive duplicate check in createExercise and modal dismiss guards during active save operations**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-04T21:20:38Z
- **Completed:** 2026-02-04T21:22:26Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- createExercise now rejects case-variant duplicates (e.g., "bench press" when "Bench Press" exists)
- exerciseExists helper also updated to use .ilike() for consistency
- Modal cannot be dismissed via backdrop click, back button, or panel close during active save
- Implemented onCreatingChange callback pattern for state propagation to parent

## Task Commits

Each task was committed atomically:

1. **Task 1: Add case-insensitive duplicate check to createExercise** - `306cab1` (fix)
2. **Task 2: Guard SettingsPanel dismiss paths during active creation** - `a3bce61` (fix)

## Files Created/Modified
- `packages/shared/src/services/exercises.ts` - Added .ilike() pre-check in createExercise, updated exerciseExists to use .ilike()
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` - Added isCreating state, guarded handleBackdropClick, handleBack, and cleanup useEffect
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` - Added onCreatingChange prop and useEffect to notify parent

## Decisions Made
- Pre-check with .ilike() before INSERT rather than relying on DB unique constraint (DB lacks case-insensitive unique constraint on name)
- Use callback prop pattern (onCreatingChange) to propagate isCreating state from child to parent
- Guard all three dismiss paths in SettingsPanel to prevent accidental modal destruction during save

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript error in unrelated file (useClickOutside.ts) did not affect target files

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 7 UAT tests should now pass
- Phase 21 exercise-create fully complete with gap closure
- v3.0 milestone ready for final sign-off

---
*Phase: 21-exercise-create*
*Completed: 2026-02-04*
