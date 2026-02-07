---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/surfaces/workout/WorkoutSurface.tsx
autonomous: true

must_haves:
  truths:
    - "Template update modal appears when user adds a set to an exercise"
    - "Template update modal appears when user removes a set from an exercise"
    - "Template update modal appears when user adds an exercise to the workout"
    - "Template update modal appears when user removes an exercise from the workout"
    - "Template update modal does NOT appear when user only changes weight values"
    - "Template update modal does NOT appear when user only changes rep values"
    - "Template update modal does NOT appear when user only toggles set completion"
  artifacts:
    - path: "apps/web/src/surfaces/workout/WorkoutSurface.tsx"
      provides: "Fixed hasTemplateChanges function"
      contains: "hasTemplateChanges"
  key_links:
    - from: "hasTemplateChanges()"
      to: "confirmFinishWorkout()"
      via: "conditional check before showing template update modal"
      pattern: "hasTemplateChanges\\(\\)"
---

<objective>
Fix the `hasTemplateChanges()` function in WorkoutSurface to only detect structural template changes (exercises added/removed, sets added/removed), not value changes (weight, reps).

Purpose: The "Update Template?" confirmation modal currently triggers when users change exercise weight or reps during a workout. This is incorrect -- weight/rep changes during a workout are normal and should not prompt a template update. Only structural changes (adding/removing exercises or sets) should trigger the modal.

Output: Modified `hasTemplateChanges()` function that ignores weight and rep differences.
</objective>

<execution_context>
@C:\Users\MarioPC\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\MarioPC\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/surfaces/workout/WorkoutSurface.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix hasTemplateChanges to only detect structural changes</name>
  <files>apps/web/src/surfaces/workout/WorkoutSurface.tsx</files>
  <action>
Modify the `hasTemplateChanges()` function (lines 429-465) to only detect structural changes, NOT value changes.

Current behavior (WRONG): The function compares weight and reps values between original snapshot and current workout state (lines 451-452). This causes the template update modal to trigger when users change weight or reps during a workout.

New behavior (CORRECT): The function should ONLY check:
1. Exercise count differs (original vs current) -- already correct on line 438
2. An exercise was added that was not in original -- already correct on line 443
3. An exercise was removed that was in original -- already correct on lines 458-462
4. Set count differs for any exercise -- already correct on line 444

REMOVE the weight/reps comparison block (lines 447-453):
```
// Check set values  <-- DELETE THIS BLOCK
for (let j = 0; j < currEx.sets.length; j++) {
  const origSet = origEx.sets[j];
  const currSet = currEx.sets[j];
  if (!origSet) return true;
  if (origSet.weight !== currSet.weight || origSet.reps !== currSet.reps) {
    return true;
  }
}
```

The resulting function should be:
```typescript
const hasTemplateChanges = (): boolean => {
  if (!originalTemplateSnapshot || !activeWorkout.template_id) {
    return false;
  }

  const original = originalTemplateSnapshot.exercises;
  const current = activeWorkout.exercises;

  // Check exercise count
  if (original.length !== current.length) return true;

  // Check each exercise for structural changes only
  for (const currEx of current) {
    const origEx = original.find(e => e.exercise_id === currEx.exercise_id);
    if (!origEx) return true; // New exercise added
    if (origEx.sets.length !== currEx.sets.length) return true; // Set count changed
  }

  // Check if any original exercises removed
  for (const origEx of original) {
    if (!current.find(e => e.exercise_id === origEx.exercise_id)) {
      return true;
    }
  }

  return false;
};
```

Also update the ConfirmationModal secondaryMessage for the template update modal (around line 909) from:
"This will update exercises, sets, weights, and reps."
to:
"This will update the exercise list and number of sets in your template."

This makes the modal message accurately describe what actually gets updated when structural changes are detected.

NOTE: The `confirmTemplateUpdate` function (lines 557-586) that actually performs the update should remain unchanged -- when the user confirms, the full current workout state (including weight/rep changes) still gets saved to the template. The fix is only about WHEN to show the prompt, not what happens when they confirm.
  </action>
  <verify>
Run TypeScript compilation to verify no type errors:
```
cd apps/web && npx tsc --noEmit
```

Manually verify the function logic:
- The `hasTemplateChanges` function no longer references `weight` or `reps` in its comparisons
- The function still checks: exercise count, exercise identity (added/removed), set count per exercise
  </verify>
  <done>
The `hasTemplateChanges()` function only returns true for structural changes (exercises added/removed, sets added/removed). It returns false when only weight, reps, or set completion status have changed. The modal secondary message accurately describes what will be updated.
  </done>
</task>

</tasks>

<verification>
1. TypeScript compiles without errors: `cd apps/web && npx tsc --noEmit`
2. Code review: `hasTemplateChanges()` has no weight/reps comparison
3. The function checks: exercise count, exercise identity, set count -- nothing else
4. `confirmTemplateUpdate()` is unchanged (still saves full state on confirm)
</verification>

<success_criteria>
- Changing weight during workout -> finishing -> no template update modal shown
- Changing reps during workout -> finishing -> no template update modal shown
- Toggling set completion -> finishing -> no template update modal shown
- Adding a set to an exercise -> finishing -> template update modal shown
- Removing a set from an exercise -> finishing -> template update modal shown
- Adding an exercise -> finishing -> template update modal shown
- Removing an exercise -> finishing -> template update modal shown
</success_criteria>

<output>
After completion, create `.planning/quick/001-fix-template-update-modal-trigger-conditions/001-SUMMARY.md`
</output>
