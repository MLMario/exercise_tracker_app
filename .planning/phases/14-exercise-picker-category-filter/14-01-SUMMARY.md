---
phase: 14-exercise-picker-category-filter
plan: 01
subsystem: frontend
tags: [preact, exercise-picker, filtering, dropdown, hooks]

dependency-graph:
  requires: [12-exercise-picker-layout]
  provides: [category-filter-dropdown, useClickOutside-hook, combined-filtering]
  affects: [15-workout-history-filter]

tech-stack:
  added: []
  patterns: [click-outside-detection, combined-filter-logic]

key-files:
  created:
    - apps/web/src/hooks/useClickOutside.ts
  modified:
    - apps/web/src/hooks/index.ts
    - apps/web/src/components/ExercisePickerModal.tsx
    - apps/web/css/styles.css

decisions:
  - id: PICK-01
    choice: Search filters by name only, not category text
    reason: Category dropdown handles category filtering; name-only search is cleaner
  - id: PICK-02
    choice: 180px partial-width dropdown left-aligned above search
    reason: Compact layout that doesn't dominate the modal width
  - id: PICK-03
    choice: 7 categories (Chest, Back, Shoulders, Legs, Arms, Core, Other)
    reason: Matches ExerciseCategory type; Cardio excluded as defined in types

metrics:
  duration: 2 min
  completed: 2026-02-03
---

# Phase 14 Plan 01: Category Filter Dropdown Summary

Category dropdown in Exercise Picker with combined filtering using custom useClickOutside hook

## What Was Done

### Task 1: Create useClickOutside hook
- Created reusable hook for detecting clicks outside a referenced element
- Handles both mousedown and touchstart events for mobile support
- Uses useCallback to stabilize handler reference
- Exported from hooks index

### Task 2: Add category dropdown to ExercisePickerModal
- Added selectedCategory and isDropdownOpen state
- Integrated useClickOutside hook for closing dropdown
- Filter logic: category first (if not "All Categories"), then name-only search
- Reset category to "All Categories" on modal reopen
- Added accessible dropdown with FILTER_CATEGORIES (7 options)
- Simplified empty state message

### Task 3: Add dropdown CSS styling
- 180px partial-width dropdown matching input styling
- Custom dropdown trigger with hover/focus states
- Animated chevron rotation on open
- Overlay menu with z-index 100 (floats over content)
- Selection highlight with accent color
- Min tap targets (44px) for mobile accessibility

## Verification Results

All requirements verified by build success and code inspection:
- PICK-01: Search input filters by name only (category text removed from filter)
- PICK-02: Category dropdown renders above search input
- PICK-03: Default "All Categories" on modal open
- PICK-04: All 7 categories listed in dropdown
- PICK-05: Category selection filters list immediately
- PICK-06: Combined filtering works (category + name search)
- Reset on reopen: Category resets to "All Categories"
- Click outside: useClickOutside hook closes dropdown

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| d64018b | feat(14-01): create useClickOutside hook |
| 9cdfe14 | feat(14-01): add category dropdown to ExercisePickerModal |
| 306526b | style(14-01): add category dropdown CSS styling |

## Next Phase Readiness

Phase 14 complete. Phase 15 (Workout History Filter) can proceed independently.
No blockers or concerns identified.
