---
status: complete
phase: 20-exercise-delete
source: [20-01-SUMMARY.md, 20-02-SUMMARY.md]
started: 2026-02-04T05:00:00Z
updated: 2026-02-04T05:06:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Trash Icon on Exercise Row
expected: Navigate to Settings > My Exercises. Each exercise row shows a red trash icon button alongside the edit pencil icon.
result: pass

### 2. Delete Confirmation Modal
expected: Tapping the trash icon opens a confirmation modal with the title "Delete Exercise?" and a warning that all history will be deleted.
result: pass

### 3. Dependency Warning for Used Exercises
expected: If the exercise is used in any templates, the confirmation modal shows an amber/yellow warning box indicating template usage.
result: pass

### 4. Modal Button Labels and Sizing
expected: The confirmation modal has two buttons labeled "Delete Exercise" and "Keep Exercise". Both buttons fit properly within the modal without overflowing or being cut off.
result: pass

### 5. Exercise Deleted on Confirm
expected: Clicking "Delete Exercise" removes the exercise from the My Exercises list. The modal closes and the exercise is gone.
result: pass

### 6. Charts Refresh After Delete
expected: If a dashboard chart was tied to the deleted exercise, it disappears from the dashboard immediately without needing a page refresh.
result: pass

### 7. Cancel Keeps Exercise
expected: Clicking "Keep Exercise" closes the modal without deleting. The exercise remains in the list unchanged.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
