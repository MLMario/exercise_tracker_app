---
phase: 12-bug-fixes
plan: 12-FIX
type: fix-summary
completed: 2026-01-13
---

# Fix Summary: 12-FIX

## Overview

Addressed 1 UAT issue from phase 12-bug-fixes by removing the max_weight metric feature that conflicted with database constraints.

## Tasks Completed

### Task 1: Rollback max_weight metric feature (UAT-002)

**Issue:** The max_weight metric was added in 12-02 Task 1 but the database has a check constraint (user_charts_metric_type_check) that only allows 'total_sets' and 'max_volume_set'. User decision: remove the feature entirely rather than update the database.

**Changes Made:**

1. **src/types/services.ts**
   - Removed 'max_weight' from ExerciseMetricType union type
   - Changed from: `'total_sets' | 'max_volume_set' | 'max_weight'`
   - Changed to: `'total_sets' | 'max_volume_set'`

2. **src/services/logging.ts**
   - Removed max_weight handling in getExerciseMetrics function
   - Removed `else if (metric === 'max_weight')` block in date mode (was around line 508-510)
   - Removed `else if (metric === 'max_weight')` block in session mode (was around line 523-525)

3. **src/surfaces/dashboard/AddChartModal.tsx**
   - Removed max_weight option from METRIC_TYPE_OPTIONS dropdown

4. **src/surfaces/dashboard/ChartCard.tsx**
   - Removed max_weight case from formatMetricType switch statement

5. **src/types/services.ts (JSDoc)**
   - Updated ExerciseMetricsOptions comment to not mention max_weight

## Verification Results

- `npm run build` - SUCCESS
- `npx tsc --noEmit` - SUCCESS (no type errors)
- ExerciseMetricType only includes 'total_sets' and 'max_volume_set'
- getExerciseMetrics has no max_weight handling

## Files Changed

| File | Changes |
|------|---------|
| src/types/services.ts | Removed 'max_weight' from ExerciseMetricType, updated JSDoc |
| src/services/logging.ts | Removed 2 max_weight metric handling blocks |
| src/surfaces/dashboard/AddChartModal.tsx | Removed max_weight from dropdown options |
| src/surfaces/dashboard/ChartCard.tsx | Removed max_weight case from formatMetricType |

## Commits

| Hash | Description |
|------|-------------|
| ad288c1 | fix(12-FIX): rollback max_weight metric feature |
| 1d6c2a0 | fix(12-FIX): remove max_weight from UI components |

## Issue Resolution

| ID | Status | Resolution |
|----|--------|------------|
| UAT-002 | RESOLVED | Feature removed - database constraint preserved |

## Next Steps

Phase 12 fix complete. All UAT issues resolved:
- UAT-001: Fixed by user (password recovery prop)
- UAT-002: Fixed by 12-FIX (max_weight removal)

Ready for Phase 13: UI Polish
