---
phase: 08-template-editor-surface
plan: 02
subsystem: surfaces
tags: [preact, template-editor, exercise-editing, set-management, presentational-components]

# Dependency graph
requires:
  - phase: 08-01
    provides: TemplateEditorSurface, EditingExercise, EditingSet, EditingTemplate interfaces
provides:
  - ExerciseEditor component for single exercise editing
  - ExerciseList component for exercise list management
  - Exercise manipulation methods (move, remove, add/remove sets)
  - Set weight/reps update handlers
  - Rest time update handler
affects: [08-03, 10-workout-surface]

# Tech tracking
tech-stack:
  added: []
  patterns: [presentational-component-callbacks, immutable-state-updates]

key-files:
  created:
    - src/surfaces/template-editor/ExerciseEditor.tsx
    - src/surfaces/template-editor/ExerciseList.tsx
  modified:
    - src/surfaces/template-editor/TemplateEditorSurface.tsx

key-decisions:
  - "ExerciseEditor is fully presentational with callback props for all actions"
  - "ExerciseList maps exercises and provides index-based callbacks to parent"
  - "All state updates use immutable patterns with spread operators"
  - "handleOpenExercisePicker is placeholder for Plan 03"

patterns-established:
  - "ExerciseEditorProps mirrors index.html lines 449-510 structure"
  - "Exercise manipulation matches js/app.js lines 613-655"
  - "Set removal renumbers remaining sets (set_number = index + 1)"
  - "Add set copies weight/reps from last set as defaults"

issues-created: []

# Metrics
duration: ~10min
completed: 2026-01-12
---

# Phase 8: Template Editor Surface - Plan 02 Summary

**Exercise editing components created with full set management and reordering functionality.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-01-12
- **Completed:** 2026-01-12
- **Tasks:** 2/2
- **Files modified:** 3

## Accomplishments

- Created ExerciseEditor.tsx presentational component with:
  - Exercise header (name, category badge, move up/down buttons, remove button)
  - Set table with weight/reps inputs per set
  - Add Set button
  - Rest time input with seconds suffix
- Created ExerciseList.tsx component with:
  - Section header with "Exercises" title and "Add Exercise" button
  - Maps exercises to ExerciseEditor components
  - Empty state when no exercises
- Added exercise manipulation methods to TemplateEditorSurface.tsx:
  - handleMoveExerciseUp/Down for reordering
  - handleRemoveExercise for deletion
  - handleAddSet/handleRemoveSet for set management
  - handleUpdateSet for weight/reps changes
  - handleUpdateRestTime for rest time changes
  - handleOpenExercisePicker placeholder for Plan 03

## Task Commits

1. **Task 1: Create ExerciseEditor component for single exercise** - `de27946`
2. **Task 2: Create ExerciseList and integrate into TemplateEditorSurface** - `56dccc7`

## Files Created/Modified

**Created:**
- `src/surfaces/template-editor/ExerciseEditor.tsx` - Presentational component for single exercise editing
- `src/surfaces/template-editor/ExerciseList.tsx` - List component with section header and empty state

**Modified:**
- `src/surfaces/template-editor/TemplateEditorSurface.tsx` - Added manipulation methods and ExerciseList integration

## Key Interfaces/Props

**ExerciseEditorProps:**
- exercise: EditingExercise
- index, isFirst, isLast: positioning info
- onMoveUp, onMoveDown, onRemove: exercise-level actions
- onAddSet, onRemoveSet: set-level actions
- onUpdateSet: (setIndex, field, value) for weight/reps
- onUpdateRestTime: rest time updates

**ExerciseListProps:**
- exercises: EditingExercise[]
- onAddExercise, onMoveUp, onMoveDown, onRemove
- onAddSet, onRemoveSet, onUpdateSet, onUpdateRestTime
- isSubmitting: disables Add Exercise button

## Methods Ported from js/app.js

| Method | Source | Description |
|--------|--------|-------------|
| handleMoveExerciseUp | lines 617-623 | Swap exercise with previous |
| handleMoveExerciseDown | lines 625-631 | Swap exercise with next |
| handleRemoveExercise | lines 613-615 | Remove exercise from array |
| handleAddSet | lines 633-641 | Add set with last set defaults |
| handleRemoveSet | lines 643-654 | Remove set and renumber |

## Verification Checklist

- [x] `npm run build` succeeds without errors
- [x] `npx tsc --noEmit` passes
- [x] ExerciseEditor.tsx renders single exercise with all controls
- [x] ExerciseList.tsx renders list with header and empty state
- [x] Move up/down reorders exercises correctly
- [x] Add/remove set updates set array
- [x] Set weight/reps inputs update state
- [x] Rest time input updates default_rest_seconds

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

None.

## Next Step

Plan 08-03: Exercise picker modal for adding exercises to template.

---
*Phase: 08-template-editor-surface*
*Plan: 02*
*Completed: 2026-01-12*
