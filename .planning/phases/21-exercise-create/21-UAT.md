---
status: complete
phase: 21-exercise-create
source: 21-01-SUMMARY.md
started: 2026-02-04T12:00:00Z
updated: 2026-02-04T12:08:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Create Button Visibility
expected: In the Settings panel, when viewing "My Exercises", a "+ Create" button appears in the header (right-aligned). When on the Settings menu (not in My Exercises), the button is NOT visible.
result: pass

### 2. Create Modal Opens from Header Button
expected: Tapping the "+ Create" button in the header opens a modal with a name input field, a category dropdown, and Create Exercise / Cancel buttons.
result: pass

### 3. Create Modal Opens from Empty State
expected: When no custom exercises exist, the empty state shows a "Create Exercise" button. Tapping it opens the same create modal (name input, category dropdown, action buttons).
result: pass

### 4. Create Button Disabled Until Form Complete
expected: In the create modal, the "Create Exercise" button is disabled (not tappable) until both a name is entered AND a category is selected.
result: pass

### 5. Successful Exercise Creation
expected: After filling in name and category and tapping "Create Exercise", the modal closes and the new exercise appears in the My Exercises list, sorted alphabetically among existing exercises.
result: pass

### 6. Duplicate Name Error
expected: If you try to create an exercise with a name that already exists, the modal stays open and displays an error message (does not crash or silently fail).
result: issue
reported: "ErrorMessage appears, but not when there are difference lower and upper cases, so if I have already created Bench Press and I write bench press it allows the creation, it should not"
severity: major

### 7. Modal Cannot Be Dismissed During Save
expected: While the exercise is being created (after tapping Create Exercise), the modal cannot be closed by tapping outside or pressing Cancel until the operation completes.
result: issue
reported: "doesnt pass, if I tap outside the modal the modal closes"
severity: major

## Summary

total: 7
passed: 5
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "Duplicate name detection should be case-insensitive"
  status: failed
  reason: "User reported: ErrorMessage appears, but not when there are difference lower and upper cases, so if I have already created Bench Press and I write bench press it allows the creation, it should not"
  severity: major
  test: 6
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Modal cannot be dismissed by tapping outside during active save"
  status: failed
  reason: "User reported: doesnt pass, if I tap outside the modal the modal closes"
  severity: major
  test: 7
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
