---
phase: 33-exercise-card-layout
plan: 01
subsystem: ui
tags: [template-editor, exercise-card, preact, css]

# Dependency graph
requires:
  - phase: 32-rest-timer-bar-redesign
    provides: horizontal inline timer layout
provides:
  - Exercise editor card with header layout
  - Add Set button in header
  - Hover-reveal remove button
  - Footer Add Exercise button
affects: [34-set-table-grid, 35-rest-time-input]

# Tech tracking
tech-stack:
  added: []
  patterns: [card-header flex layout, hover-reveal buttons]

key-files:
  created: []
  modified:
    - apps/web/src/surfaces/template-editor/ExerciseEditor.tsx
    - apps/web/src/surfaces/template-editor/ExerciseList.tsx
    - apps/web/src/surfaces/template-editor/TemplateEditorSurface.tsx
    - apps/web/css/styles.css

key-decisions:
  - "Remove move up/down buttons - reordering not needed in template editor"
  - "Add Set button in card header with plus icon"
  - "Hover-reveal remove button matching workout-surface pattern"

patterns-established:
  - "Exercise editor card uses card-header/card-body structure"

issues-created: []

# Metrics
duration: 4min
completed: 2026-01-17
---

# Phase 33 Plan 01: Exercise Card Header Restructure Summary

**Restructured ExerciseEditor with Add Set in header, hover-reveal remove, and footer Add Exercise button matching mockup design**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-17T12:00:00Z
- **Completed:** 2026-01-17T12:04:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Card header restructured with Add Set button and hover-reveal remove
- Removed category badge from header
- Removed move up/down buttons (reordering removed from template editor)
- Section header removed, Add Exercise button moved to footer
- CSS updated for new card layout matching workout-surface patterns

## Task Commits

Each task was committed atomically:

1. **Tasks 1-2: Header restructure + ExerciseList update** - `d342d87` (feat)
2. **Task 3: CSS for exercise editor card layout** - `5c2b56e` (feat)

## Files Created/Modified
- `apps/web/src/surfaces/template-editor/ExerciseEditor.tsx` - Card header with Add Set, hover-reveal remove
- `apps/web/src/surfaces/template-editor/ExerciseList.tsx` - Removed section header, added footer
- `apps/web/src/surfaces/template-editor/TemplateEditorSurface.tsx` - Removed move props
- `apps/web/css/styles.css` - New card layout styles

## Decisions Made
- Removed move up/down buttons since exercise reordering is not needed in template editor
- Used card-header/card-body structure matching workout-surface exercise cards
- Add Set button styled with green ghost button matching workout-surface

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Card layout complete, ready for Phase 34: Set Table Grid Redesign
- Set table and rest timer still use existing styles, to be updated in subsequent phases

---
*Phase: 33-exercise-card-layout*
*Completed: 2026-01-17*
