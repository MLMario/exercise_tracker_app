---
status: complete
phase: 11-frontend-updates
source: 11-01-SUMMARY.md
started: 2026-02-02T08:35:00Z
updated: 2026-02-02T08:40:00Z
---

## Current Test

[testing complete]

## Tests

### 1. User Exercises Display First
expected: Open template editor, click "Add Exercise". In the exercise picker, any user-created exercises appear at the TOP of the list, before system exercises.
result: pass

### 2. Custom Badge on User Exercises
expected: User-created exercises display a green "CUSTOM" badge/pill on the right side of the row. System exercises do NOT show this badge.
result: pass

### 3. Alphabetical Sorting Within Groups
expected: User exercises are sorted A-Z among themselves. System exercises are also sorted A-Z among themselves. The two groups remain separate (user first, system after).
result: pass

### 4. System Exercises Visually Muted
expected: System exercises appear with muted/gray text color compared to user exercises which have bright white text. This creates visual hierarchy.
result: pass

### 5. Exercise Selection Still Works
expected: Click any exercise (user or system) in the picker. It gets added to the template correctly. Both types selectable.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
