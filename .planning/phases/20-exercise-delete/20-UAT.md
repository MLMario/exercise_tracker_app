---
status: complete
phase: 20-exercise-delete
source: 20-01-SUMMARY.md
started: 2026-02-03T20:30:00Z
updated: 2026-02-03T20:38:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Trash Icon on Exercise Row
expected: Each exercise row in My Exercises shows a red trash icon button alongside the edit pencil icon. The trash icon is on the right side of the row.
result: pass

### 2. Delete Confirmation Modal
expected: Tapping the trash icon opens a confirmation modal with the title "Delete Exercise?", a warning that all history will be deleted, and two buttons labeled "Delete Exercise" and "Keep Exercise".
result: pass

### 3. Dependency Warning for Used Exercises
expected: If the exercise is used in any templates, the confirmation modal shows an amber/yellow warning box indicating which templates use this exercise.
result: pass

### 4. Exercise Deleted on Confirm
expected: Clicking "Delete Exercise" in the confirmation modal removes the exercise from the My Exercises list. The modal closes and the exercise is gone.
result: issue
reported: "when exercise is deleted, we delete associated charts from the template, but it's not until user refresh until it goes away, we need to make the charts disappear at the same time the exercise is deleted"
severity: minor

### 5. Cancel Keeps Exercise
expected: Clicking "Keep Exercise" in the confirmation modal closes the modal without deleting. The exercise remains in the list unchanged.
result: pass
observation: "Keep Exercise and Delete Exercise buttons are too big and not fully visible within the modal"

## Summary

total: 5
passed: 4
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Clicking Delete Exercise removes the exercise and all associated data is reflected immediately in the UI"
  status: failed
  reason: "User reported: when exercise is deleted, we delete associated charts from the template, but it's not until user refresh until it goes away, we need to make the charts disappear at the same time the exercise is deleted"
  severity: minor
  test: 4
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Confirmation modal buttons are properly sized and fully visible within the modal"
  status: failed
  reason: "User reported: Keep Exercise and Delete Exercise buttons are too big to the point that they are not fully visible in the modal square"
  severity: cosmetic
  test: 5
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
