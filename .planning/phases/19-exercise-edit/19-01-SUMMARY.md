---
phase: 19-exercise-edit
plan: 01
subsystem: ui
tags: [preact, accordion, inline-edit, css-transitions, form-validation]

# Dependency graph
requires:
  - phase: 18-exercise-list
    provides: MyExercisesList component with exercise rows
  - phase: 16-service-layer
    provides: exercises.updateExercise, exercises.getCategories services
provides:
  - Inline accordion edit form for exercise name and category
  - Pencil icon edit trigger on each exercise row
  - Typed validation error mapping (EMPTY_NAME, INVALID_NAME, DUPLICATE_NAME)
  - Success flash with auto-collapse after save
affects: [20-exercise-delete, 21-exercise-create]

# Tech tracking
tech-stack:
  added: []
  patterns: [single-expansion accordion with CSS max-height, inline field-level validation errors]

key-files:
  created: []
  modified:
    - apps/web/css/styles.css
    - apps/web/src/surfaces/dashboard/MyExercisesList.tsx

key-decisions:
  - "Manual isSaving state instead of useAsyncOperation hook for typed validation error handling"
  - "Native select for category dropdown (7 fixed options, already styled)"
  - "Immediate re-sort after name edit for consistent alphabetical ordering"

patterns-established:
  - "Inline accordion edit: expandedId state + CSS max-height transition for single-expansion forms"
  - "Typed validation error mapping: switch on result.validationError to set field-specific error messages"

# Metrics
duration: 2min
completed: 2026-02-03
---

# Phase 19 Plan 01: Exercise Edit Summary

**Inline accordion editing with name input, category select, dirty-check Save, and typed validation error mapping via CSS max-height transitions**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-03T23:48:22Z
- **Completed:** 2026-02-03T23:50:18Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Pencil icon on each exercise row expands inline edit form with smooth accordion animation
- Name text input and category native select pre-filled with current values
- Save button disabled until name or category differs from original (dirty check)
- Typed validation errors (EMPTY_NAME, INVALID_NAME, DUPLICATE_NAME) mapped to inline field errors
- Success flash (green highlight) with 800ms auto-collapse after save
- List re-sorted alphabetically after name/category edits

## Task Commits

Each task was committed atomically:

1. **Task 1: Add edit form CSS styles** - `297a333` (style)
2. **Task 2: Enhance MyExercisesList with accordion edit form** - `fe9da04` (feat)

**Plan metadata:** (next commit) (docs: complete plan)

## Files Created/Modified
- `apps/web/css/styles.css` - Added 8 CSS rule groups: edit-trigger, edit-form accordion, edit-form-inner, edit-actions, field-error, save-success, and row enhancements (flex-wrap, position relative)
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` - Added expandedId accordion state, editName/editCategory form state, handleEditClick/handleCancel/handleSave handlers, dirty check, validation error mapping, success flash with auto-collapse

## Decisions Made
- Used manual isSaving state instead of useAsyncOperation hook to handle typed validation errors (EMPTY_NAME, INVALID_NAME, DUPLICATE_NAME) from updateExercise
- Used native `<select>` for category dropdown (7 fixed options, already styled globally)
- Re-sort list immediately after save for consistent alphabetical ordering

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- TypeScript `npx tsc --noEmit` shows pre-existing path alias errors in other files (ExercisePickerModal, AuthSurface, etc.) -- none in MyExercisesList.tsx. These are known pre-existing issues unrelated to this phase.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Edit form complete, ready for Phase 20 (exercise delete) which adds delete capability to exercise rows
- All CRUD-02 through CRUD-06 requirements implemented
- Phase 21 (exercise create) can wire up the existing Create Exercise button

---
*Phase: 19-exercise-edit*
*Completed: 2026-02-03*
