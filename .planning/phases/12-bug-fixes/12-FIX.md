---
phase: 12-bug-fixes
plan: 12-FIX
type: fix
---

<objective>
Fix 1 UAT issue from phase 12.

Source: 12-ISSUES.md
Priority: 0 critical, 1 major, 0 minor
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md

**Issues being fixed:**
@.planning/phases/12-bug-fixes/12-ISSUES.md

**Original plan for reference:**
@.planning/phases/12-bug-fixes/12-02-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rollback max_weight metric feature (UAT-002)</name>
  <files>src/types/services.ts, src/services/logging.ts</files>
  <action>
**Issue:** The max_weight metric was added in 12-02 Task 1 but the database has a check constraint (user_charts_metric_type_check) that only allows 'total_sets' and 'max_volume_set'. User decision: remove the feature entirely rather than update the database.

**Step 1 - Remove max_weight from ExerciseMetricType (src/types/services.ts):**
Change the type from:
```typescript
export type ExerciseMetricType = 'total_sets' | 'max_volume_set' | 'max_weight';
```
Back to:
```typescript
export type ExerciseMetricType = 'total_sets' | 'max_volume_set';
```

**Step 2 - Remove max_weight handling in getExerciseMetrics (src/services/logging.ts):**
Remove the two `else if (metric === 'max_weight')` blocks that were added:
- In date mode section (around line 508-510)
- In session mode section (around line 523-525)

These blocks push `item.max_weight` to the values array - remove them entirely.
  </action>
  <verify>`npm run build` succeeds, TypeScript compiles without errors</verify>
  <done>ExerciseMetricType only includes 'total_sets' and 'max_volume_set', no max_weight handling in getExerciseMetrics</done>
</task>

</tasks>

<verification>
Before declaring plan complete:
- [ ] `npm run build` succeeds without errors
- [ ] `npx tsc --noEmit` passes
- [ ] ExerciseMetricType does not include 'max_weight'
- [ ] getExerciseMetrics has no max_weight handling
</verification>

<success_criteria>
- UAT-002 addressed: max_weight feature removed
- Build passes
- Ready for re-verification
</success_criteria>

<output>
After completion, create `.planning/phases/12-bug-fixes/12-FIX-SUMMARY.md`
</output>
