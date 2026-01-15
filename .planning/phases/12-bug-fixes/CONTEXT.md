# Phase 12: Bug Fixes

## Goal

Fix bugs discovered during v1.0 UAT testing.

## Scope

### Bug 1: Workout Visibility on Alt-Tab
**Issue**: When user alt-tabs away from browser during active workout and returns, the workout surface hides or becomes invisible.
**Expected**: Workout should remain visible when returning to the browser.

### Bug 2: Password Recovery Routing
**Issue**: After successful password recovery, user is redirected to wrong surface.
**Expected**: Should redirect to login or dashboard appropriately.

### Bug 3: Chart Max Weight Metric
**Issue**: The "Max Weight" metric option in charts fails to display data.
**Expected**: Should show the maximum weight lifted for each exercise over time.

### Bug 4: Console Logging Cleanup
**Issue**: Auth debug console.log statements still present in production code.
**Expected**: Remove all debug logging from auth-related code.

## Dependencies

- v1.0 complete (all surfaces migrated)

## Acceptance Criteria

- [ ] Workout remains visible after alt-tab and return
- [ ] Password recovery redirects to correct surface
- [ ] Max Weight chart metric displays data correctly
- [ ] No auth-related console.log statements in codebase
