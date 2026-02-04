---
phase: 20-exercise-delete
plan: 03
subsystem: ui
tags: [preact, supabase, templates, exercise-delete, dashboard]

# Dependency graph
requires:
  - phase: 20-exercise-delete
    provides: "Exercise delete with confirmation modal and chart refresh"
provides:
  - "Templates refresh immediately after exercise deletion"
  - "Deleted exercises filtered out of template data"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Filter null FK joins in transform functions before mapping"

key-files:
  created: []
  modified:
    - "apps/web/src/surfaces/dashboard/DashboardSurface.tsx"
    - "packages/shared/src/services/templates.ts"

key-decisions:
  - "Filter before sort in transformTemplate for efficiency"
  - "Keep 'Unknown Exercise' fallback as safety net even though filter prevents it from being reached"

patterns-established:
  - "Null FK join filtering: filter out null joined records before transform/sort"

# Metrics
duration: 1min
completed: 2026-02-04
---

# Phase 20 Plan 03: Stale Template Gap Closure Summary

**handleExerciseDeleted refreshes both charts and templates via Promise.all; transformTemplate filters out null exercises before sort**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-04T17:33:23Z
- **Completed:** 2026-02-04T17:34:20Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- handleExerciseDeleted now calls both loadUserCharts() and loadTemplates() in parallel so templates refresh immediately after exercise deletion
- transformTemplate filters out template_exercises where te.exercises is null, preventing deleted exercises from appearing as "Unknown Exercise"
- Build passes with no errors introduced

## Task Commits

Each task was committed atomically:

1. **Task 1: Refresh templates on exercise delete and filter deleted exercises** - `4be5d71` (fix)

## Files Created/Modified
- `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` - handleExerciseDeleted updated to refresh both charts and templates
- `packages/shared/src/services/templates.ts` - transformTemplate filters out deleted exercises before sorting

## Decisions Made
- Filter before sort in transformTemplate for efficiency (fewer items to sort)
- Kept "Unknown Exercise" fallback string as safety net despite filter making it unreachable

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 20 (Exercise Delete) is now fully complete with all gap closures addressed
- Ready for Phase 21 (Exercise Create)

---
*Phase: 20-exercise-delete*
*Completed: 2026-02-04*
