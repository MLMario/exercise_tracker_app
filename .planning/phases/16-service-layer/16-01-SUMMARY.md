---
phase: 16-service-layer
plan: 01
subsystem: api
tags: [supabase, typescript, service-layer, exercises, validation]

# Dependency graph
requires:
  - phase: 10-backend-updates
    provides: exercises service module with createExercise/deleteExercise patterns
provides:
  - updateExercise service function with typed validation errors
  - getUserExercises service function (user-scoped, alphabetical)
  - getExerciseDependencies service function (parallel count queries)
  - UpdateExerciseParams, UpdateExerciseError, UpdateExerciseResult, ExerciseDependencies types
affects: [18-exercise-list, 19-exercise-edit, 20-exercise-delete, 21-exercise-create]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Typed validation errors (string literal union) instead of generic Error objects"
    - "Conditional update object building for partial updates"
    - "Parallel count queries with { count: 'exact', head: true }"

key-files:
  created: []
  modified:
    - packages/shared/src/types/services.ts
    - packages/shared/src/services/exercises.ts

key-decisions:
  - "Dedicated UpdateExerciseResult type instead of extending ServiceResult -- keeps generic type clean"
  - "Case-insensitive uniqueness via .ilike() without wildcards -- exact match at DB level"

patterns-established:
  - "Typed validation errors: string literal union type returned as validationError field"
  - "Self-excluding uniqueness check: .ilike() + .neq('id', id) + user-scoped"

# Metrics
duration: 2min
completed: 2026-02-03
---

# Phase 16 Plan 01: Service Layer Summary

**Three exercise management service functions (updateExercise with typed validation, getUserExercises, getExerciseDependencies) added to shared package with full type definitions**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-03T21:29:40Z
- **Completed:** 2026-02-03T21:31:13Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added UpdateExerciseParams, UpdateExerciseError, UpdateExerciseResult, and ExerciseDependencies types to services.ts
- Extended ExercisesService interface with three new method signatures
- Implemented updateExercise with partial update support, name trimming, character validation, case-insensitive user-scoped uniqueness check, and typed validation errors (DUPLICATE_NAME, INVALID_NAME, EMPTY_NAME)
- Implemented getUserExercises returning only user-created exercises sorted alphabetically
- Implemented getExerciseDependencies with parallel count queries across template_exercises, workout_log_exercises, and user_charts

## Task Commits

Each task was committed atomically:

1. **Task 1: Add service types and update ExercisesService interface** - `fd2819f` (feat)
2. **Task 2: Implement updateExercise, getUserExercises, getExerciseDependencies** - `2f28e03` (feat)

## Files Created/Modified
- `packages/shared/src/types/services.ts` - Added 4 new types and 3 interface methods
- `packages/shared/src/services/exercises.ts` - Added 3 new service functions and updated export object

## Decisions Made
- Used dedicated UpdateExerciseResult type instead of adding validationError to generic ServiceResult -- keeps the shared type clean for all other services
- Used .ilike() without wildcards for case-insensitive exact match -- PostgreSQL ILIKE without % is exact case-insensitive comparison

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three service functions ready for UI phases (18-21)
- TypeScript compiles cleanly with zero errors
- Barrel exports chain verified (types accessible via @ironlift/shared)
- Phase 17 (Settings Surface Shell) can proceed -- it depends on Phase 16 being complete

---
*Phase: 16-service-layer*
*Completed: 2026-02-03*
