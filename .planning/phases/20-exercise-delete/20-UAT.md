---
status: diagnosed
phase: 20-exercise-delete
source: [20-01-SUMMARY.md, 20-02-SUMMARY.md]
started: 2026-02-04T05:00:00Z
updated: 2026-02-04T05:15:00Z
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

### 8. Workout Template Reflects Deleted Exercise
expected: After deleting an exercise, starting a workout from a template that contained that exercise should NOT show the deleted exercise. The template should reflect the deletion immediately without requiring a page refresh.
result: issue
reported: "When deleting an exercise, the exercise is immediately removed from the exercises list in settings, charts on the dashboard that use the exercise also get deleted immediately. However, if I start a workout that has the exercise on it I can still see it. It disappears if I refresh the workout log page or I refresh the dashboard first before starting a workout."
severity: major

## Summary

total: 8
passed: 7
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "After deleting an exercise, starting a workout from a template that contained that exercise should not show the deleted exercise"
  status: failed
  reason: "User reported: When deleting an exercise, the exercise is immediately removed from the exercises list in settings, charts on the dashboard that use the exercise also get deleted immediately. However, if I start a workout that has the exercise on it I can still see it. It disappears if I refresh the workout log page or I refresh the dashboard first before starting a workout."
  severity: major
  test: 8
  root_cause: "handleExerciseDeleted in DashboardSurface only calls loadUserCharts() but does NOT call loadTemplates(). The templatesList state retains stale template data with deleted exercise references. When user starts a workout, the stale template (with exercises: null fallback to 'Unknown Exercise') is passed to WorkoutSurface. Additionally, transformTemplate in templates.ts does not filter out template_exercises where the exercises FK join returns null."
  artifacts:
    - path: "apps/web/src/surfaces/dashboard/DashboardSurface.tsx"
      issue: "handleExerciseDeleted (lines 430-432) only calls loadUserCharts(), does not reload templates"
    - path: "packages/shared/src/services/templates.ts"
      issue: "transformTemplate (lines 79-117) includes deleted exercises with fallback name 'Unknown Exercise' instead of filtering them out"
    - path: "apps/web/src/surfaces/dashboard/DashboardSurface.tsx"
      issue: "loadTemplates (lines 121-125) is never called after exercise deletion"
  missing:
    - "Add loadTemplates() call to handleExerciseDeleted in DashboardSurface.tsx"
    - "Filter out template_exercises where te.exercises is null in transformTemplate"
  debug_session: ""
