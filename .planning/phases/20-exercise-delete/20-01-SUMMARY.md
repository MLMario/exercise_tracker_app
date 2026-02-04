---
phase: 20-exercise-delete
plan: 01
subsystem: ui
tags: [preact, supabase, modal, cascade-delete, confirmation-dialog]

# Dependency graph
requires:
  - phase: 18-exercise-list
    provides: MyExercisesList component with exercise row layout
  - phase: 19-exercise-edit
    provides: Inline edit trigger pattern and accordion form structure
  - phase: 16-service-layer
    provides: exercises.deleteExercise() and exercises.getExerciseDependencies() service functions
provides:
  - Exercise delete with trash icon trigger on each row
  - Confirmation modal with dependency warning for template usage
  - ON DELETE CASCADE migration for exercise FK constraints
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Inline modal using existing CSS classes (modal-overlay, modal-sm) instead of ConfirmationModal component"
    - "Dependency pre-check before showing delete confirmation"

key-files:
  created:
    - sql/migration_cascade_delete.sql
  modified:
    - apps/web/src/surfaces/dashboard/MyExercisesList.tsx
    - apps/web/css/styles.css
    - sql/current_schema.sql

key-decisions:
  - "ON DELETE CASCADE on three FK constraints (template_exercises, workout_log_exercises, user_charts) for true cascade behavior"
  - "Only check templateCount for dependency warning (per CONTEXT.md)"
  - "Custom inline modal instead of ConfirmationModal component (matches DashboardSurface pattern)"

patterns-established:
  - "Delete trigger button pattern: .my-exercises-delete-trigger with danger color and 44px touch target"
  - "Warning box pattern: .delete-warning-box with amber background for dependency warnings"

# Metrics
duration: 2min
completed: 2026-02-03
---

# Phase 20 Plan 01: Exercise Delete Summary

**Trash icon delete trigger with confirmation modal, template dependency warning, and ON DELETE CASCADE migration for exercise FK constraints**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-03T20:05:51Z
- **Completed:** 2026-02-03T20:07:07Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Added ON DELETE CASCADE migration for three FK constraints referencing exercises table
- Added trash icon button (danger red) to each exercise row alongside the edit pencil
- Added confirmation modal with "Delete Exercise?" title, history deletion warning, and optional amber template dependency warning
- Added isDeleting state to prevent double-click during async delete operation

## Task Commits

Each task was committed atomically:

1. **Task 1: Add cascade delete migration and update schema reference** - `92317c7` (feat)
2. **Task 2: Run cascade delete migration in Supabase** - N/A (human-action checkpoint)
3. **Task 3: Add delete button, confirmation modal, and dependency warning** - `7ead72a` (feat)

## Files Created/Modified
- `sql/migration_cascade_delete.sql` - ALTER TABLE statements adding ON DELETE CASCADE to three FK constraints
- `sql/current_schema.sql` - Updated schema reference with CASCADE annotations
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` - TrashIcon component, delete state management, confirmation modal with dependency warning
- `apps/web/css/styles.css` - .my-exercises-delete-trigger and .delete-warning-box styles

## Decisions Made
- Used ON DELETE CASCADE on all three FK constraints (template_exercises, workout_log_exercises, user_charts) so deleting an exercise truly removes all related data, matching the CONTEXT.md wording "All history will be deleted with it"
- Built the modal inline using existing CSS classes (modal-overlay, modal-sm, modal-header, modal-body, modal-footer) instead of the ConfirmationModal component, following the DashboardSurface custom delete modal pattern
- Only inspect templateCount from getExerciseDependencies for the warning box (per CONTEXT.md decision)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Authentication Gates

During execution, these authentication requirements were handled:

1. Task 2: Supabase SQL Editor required manual migration execution
   - Paused for user to run cascade delete migration
   - Resumed after user confirmed success
   - Cascade constraints now active on all three FK references

## Next Phase Readiness
- Exercise CRUD is now complete (create via picker, read in list, update via inline edit, delete via confirmation modal)
- Ready for Phase 21 (final phase in the roadmap)

---
*Phase: 20-exercise-delete*
*Completed: 2026-02-03*
