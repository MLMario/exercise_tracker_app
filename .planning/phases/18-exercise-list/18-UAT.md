---
status: complete
phase: 18-exercise-list
source: 18-01-SUMMARY.md
started: 2026-02-03T12:00:00Z
updated: 2026-02-03T12:05:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Navigate to My Exercises
expected: From the dashboard, tap the gear icon in the header. Settings menu opens. Tap "My Exercises". The view switches to show a "My Exercises" header with a back button.
result: pass

### 2. Exercise List Shows User Exercises Only
expected: If you have custom exercises, the My Exercises view shows them in a list sorted alphabetically. Each row displays the exercise name and category. System/built-in exercises do NOT appear in this list.
result: pass

### 3. Empty State When No Custom Exercises
expected: If you have no custom exercises, the view shows "You haven't created any custom exercises yet." with a Create Exercise button (button is present but non-functional for now).
result: pass

### 4. Back Navigation to Settings Menu
expected: From the My Exercises view, tap the back button. The view returns to the Settings menu (showing "My Exercises" menu item and Log Out button).
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
