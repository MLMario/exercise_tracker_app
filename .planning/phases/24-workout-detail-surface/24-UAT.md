---
status: diagnosed
phase: 24-workout-detail-surface
source: 24-01-SUMMARY.md
started: 2026-02-05T12:00:00Z
updated: 2026-02-05T12:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Workout Detail Header Shows Template Name
expected: Workout detail header displays the template name of the logged workout (e.g., "Push Day", "Full Body")
result: issue
reported: "The title says 'Untitled Workout' instead of the template name of the logged workout"
severity: major

### 2. Workout Detail Shows Formatted Date
expected: Header shows formatted date (e.g., "Feb 5, 2026")
result: pass

### 3. Exercise Blocks Display
expected: Each exercise rendered as distinct block with name and category badge
result: pass

### 4. Set Grid Display
expected: Set grid shows Set #, Weight (lbs), Reps, and Status icon columns
result: pass

### 5. Completion Status Icons
expected: Completed sets show green checkmark, skipped sets show red X
result: pass

### 6. Navigation Flow
expected: Tapping history card navigates to workout detail, back returns to history
result: pass

## Summary

total: 6
passed: 5
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Workout detail header displays the template name of the logged workout"
  status: failed
  reason: "User reported: The title says 'Untitled Workout' instead of the template name of the logged workout"
  severity: major
  test: 1
  root_cause: "getWorkoutLog service method does not join with templates table to fetch template name. WorkoutDetail.tsx:81 hardcodes 'Untitled Workout' instead of using workout.template_name"
  artifacts:
    - path: "apps/web/src/surfaces/dashboard/WorkoutDetail.tsx"
      issue: "Line 81 hardcodes 'Untitled Workout' instead of using template_name from workout data"
    - path: "packages/shared/src/services/logging.ts"
      issue: "getWorkoutLog query (line 237) does not join templates table to get template name"
    - path: "packages/shared/src/types/database.ts"
      issue: "WorkoutLogWithExercises type missing template_name property"
  missing:
    - "Add templates (name) join to getWorkoutLog query"
    - "Add template_name to WorkoutLogWithExercises type"
    - "Use workout.template_name || 'Untitled Workout' in WorkoutDetail component"
  debug_session: ""
