---
phase: quick-001
plan: 01
type: quick-task
subsystem: workout-tracking
tags: [bug-fix, modal, template-update, user-experience]

requires: []
provides:
  - "Template update modal only triggers for structural changes"
  - "Improved UX: weight/rep changes no longer prompt unnecessary confirmation"
affects: []

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - apps/web/src/surfaces/workout/WorkoutSurface.tsx

decisions: []

metrics:
  duration: 1m 5s
  completed: 2026-02-06
---

# Quick Task 001: Fix Template Update Modal Trigger Conditions

**One-liner:** Modified hasTemplateChanges() to only detect structural changes (exercises/sets added or removed), preventing the template update modal from triggering when users change weight or reps during workouts.

## Objective

Fix the `hasTemplateChanges()` function in WorkoutSurface to only detect structural template changes (exercises added/removed, sets added/removed), not value changes (weight, reps). The template update confirmation modal was incorrectly triggering when users changed exercise weight or reps during workouts, which is normal behavior and should not prompt a template update.

## Changes Made

### Task 1: Fix hasTemplateChanges to Only Detect Structural Changes

**File:** `apps/web/src/surfaces/workout/WorkoutSurface.tsx`

**Changes:**

1. **Removed weight/reps comparison from `hasTemplateChanges()` function (lines 446-454)**
   - Deleted the inner loop that compared `weight` and `reps` values between original and current sets
   - This was the root cause of the bug

2. **Updated comment for clarity (line 440)**
   - Changed from "Check each exercise" to "Check each exercise for structural changes only"
   - Makes the intent explicit for future maintainers

3. **Updated modal secondary message (line 899)**
   - Changed from: "This will update exercises, sets, weights, and reps."
   - Changed to: "This will update the exercise list and number of sets in your template."
   - Accurately reflects what the function actually detects

**Function behavior after fix:**

The `hasTemplateChanges()` function now returns `true` only when:
- Exercise count differs between original and current
- An exercise was added that wasn't in the original
- An exercise was removed that was in the original
- Set count differs for any exercise

The function returns `false` when only these change:
- Weight values
- Rep values
- Set completion status (is_done flag)

**Important:** The `confirmTemplateUpdate()` function remains unchanged. When the user does confirm a structural change, the full current workout state (including any weight/rep changes) still gets saved to the template. The fix only affects WHEN the prompt appears, not what happens when confirmed.

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | ae55751 | Fixed hasTemplateChanges to only detect structural changes |

## Verification

✅ TypeScript types remain valid (pre-existing type error in useClickOutside.ts is unrelated)
✅ No weight or reps comparisons in hasTemplateChanges() function
✅ Function still checks exercise count, exercise identity, and set count
✅ Modal message accurately describes what will be updated

## Deviations from Plan

None - plan executed exactly as written.

## Behavior Change

**Before:**
- User changes weight during workout → finishes workout → template update modal appears ❌
- User changes reps during workout → finishes workout → template update modal appears ❌

**After:**
- User changes weight during workout → finishes workout → no modal (correct) ✅
- User changes reps during workout → finishes workout → no modal (correct) ✅
- User adds/removes exercise → finishes workout → modal appears (correct) ✅
- User adds/removes set → finishes workout → modal appears (correct) ✅

## Impact

**User Experience:**
- Eliminates unnecessary confirmation prompts during normal workout flow
- Users can change weights and reps freely without being asked to update the template
- Modal only appears for actual structural changes that warrant template updates

**Code Quality:**
- Function is simpler (10 lines removed)
- Intent is clearer with updated comment
- Modal message accurately describes behavior

## Self-Check: PASSED
