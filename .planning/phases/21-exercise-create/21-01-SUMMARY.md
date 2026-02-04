---
phase: 21-exercise-create
plan: 01
subsystem: frontend-settings
tags: [preact, modal, exercise-crud, settings-panel]
dependency_graph:
  requires: [20-exercise-delete]
  provides: [exercise-create-modal, crud-01-complete]
  affects: []
tech_stack:
  added: []
  patterns: [lifted-modal-state, inline-modal-markup]
key_files:
  created: []
  modified:
    - apps/web/src/surfaces/dashboard/SettingsPanel.tsx
    - apps/web/src/surfaces/dashboard/MyExercisesList.tsx
decisions:
  - id: "21-01-D1"
    decision: "Lifted showCreateModal state to SettingsPanel, passed as props to MyExercisesList"
    reason: "Header + Create button lives in SettingsPanel but modal lives in MyExercisesList; lifting state keeps both in sync"
  - id: "21-01-D2"
    decision: "Used margin-left: auto on button instead of justify-content: space-between on header"
    reason: "Avoids affecting existing header layout while pushing button to far right"
  - id: "21-01-D3"
    decision: "Create modal duplicated in both empty state and list return paths"
    reason: "Component has early returns for loading/error/empty states; modal must appear in both code paths"
metrics:
  duration: 2 min
  completed: 2026-02-04
---

# Phase 21 Plan 01: Exercise Create Summary

**One-liner:** Simplified create exercise modal triggered from header "+ Create" button and empty state CTA, with name input, category dropdown, and sorted list insertion.

## What Was Built

### Task 1: SettingsPanel Header Button + Lifted State
- Added `showCreateModal` state and `handleOpenCreate` handler to SettingsPanel
- Rendered conditional "+ Create" button (`btn btn-primary btn-sm`) in header, visible only when `panelView === 'exercises'`
- Button right-aligned via `margin-left: auto` inline style
- Passed `showCreateModal`, `onOpenCreate`, and `onCloseCreate` props to MyExercisesList
- Reset `showCreateModal` to false in the close-animation useEffect cleanup

### Task 2: MyExercisesList Create Modal + Wiring
- Extended props interface to accept `showCreateModal`, `onOpenCreate`, `onCloseCreate`
- Added create-specific state: `createName`, `createCategory` (no default), `createError`, `isCreating`
- Added `dismissCreate` callback (blocked during active creation -- prevents modal close while saving)
- Added `handleCreate` callback: calls `exercises.createExercise()`, appends result sorted alphabetically, closes modal on success, shows server errors (duplicate name) in modal
- Wired empty state "Create Exercise" button to `onOpenCreate`
- Added create modal markup in both empty state return and list return paths
- Modal follows existing `modal-overlay > modal modal-sm` pattern with `modal-header`, `modal-body`, `modal-footer`

## Verification

1. TypeScript compilation passes (only pre-existing `useClickOutside.ts` error, unrelated)
2. "+ Create" button visible only on exercises view, not on settings menu
3. Create modal opens from both header button and empty state CTA
4. "Create Exercise" button disabled until both name and category are filled
5. Successful create closes modal, exercise appears sorted in list
6. Server errors (duplicate name) displayed in modal body
7. Modal cannot be dismissed during active creation

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 3c900b7 | feat(21-01): add Create button to SettingsPanel header and lift modal state |
| 2 | 16828c8 | feat(21-01): add create exercise modal to MyExercisesList with full wiring |

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **Lifted modal state to SettingsPanel** -- The `showCreateModal` boolean lives in SettingsPanel and is passed as a prop. Both the header button and empty state CTA call `onOpenCreate` to set it true. This is the simplest coordination pattern.

2. **margin-left: auto for button alignment** -- Used inline style rather than CSS class to push the "+ Create" button right, as specified in the plan, avoiding layout changes to the existing header.

3. **Modal in both render paths** -- Since MyExercisesList has early returns for empty state vs list, the create modal markup is duplicated in both paths to ensure it appears regardless of list state.

## Next Phase Readiness

Phase 21 is the final phase. CRUD-01 requirement satisfied. v3.0 Settings & Exercise Management milestone is complete.
