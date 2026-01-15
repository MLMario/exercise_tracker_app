---
phase: 15-dashboard-service-imports
plan: 01
subsystem: ui
tags: [preact, typescript, services, refactor]

# Dependency graph
requires:
  - phase: 14-workout-service-imports
    provides: established pattern for service import migration
provides:
  - DashboardSurface.tsx with direct service imports
  - ChartCard.tsx with direct service imports
affects: [16-remove-window-exports]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Direct service imports replacing window globals in dashboard components"

key-files:
  created: []
  modified:
    - src/surfaces/dashboard/DashboardSurface.tsx
    - src/surfaces/dashboard/ChartCard.tsx

key-decisions:
  - "Renamed templates state to templatesList to avoid shadowing service import"
  - "Renamed local charts variable to chartsData in loadUserCharts function"

patterns-established:
  - "State/local variable renaming when names conflict with service imports"

issues-created: []

# Metrics
duration: 3min
completed: 2026-01-14
---

# Phase 15 Plan 01: Dashboard Service Imports Summary

**Updated DashboardSurface.tsx and ChartCard.tsx to use direct TypeScript service imports instead of window globals**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-14T00:00:00Z
- **Completed:** 2026-01-14T00:03:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added service imports to DashboardSurface.tsx (exercises, templates, logging, charts)
- Added service import to ChartCard.tsx (charts)
- Replaced 9 total window.* service calls with direct imports
- Resolved naming conflicts by renaming state/local variables

## Task Commits

Each task was committed atomically:

1. **Task 1: Update DashboardSurface.tsx** - `90e440c` (feat)
2. **Task 2: Update ChartCard.tsx** - `0961b9a` (feat)

**Plan metadata:** (pending)

## Files Created/Modified

- `src/surfaces/dashboard/DashboardSurface.tsx` - Added service imports, renamed templates→templatesList, charts→chartsData, replaced 7 window.* calls
- `src/surfaces/dashboard/ChartCard.tsx` - Added charts service import, replaced 2 window.* calls

## Decisions Made

- Renamed `templates` state variable to `templatesList` to avoid shadowing the imported `templates` service
- Renamed local `charts` variable to `chartsData` in loadUserCharts to avoid shadowing the imported `charts` service

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Renamed shadowing variables**
- **Found during:** Task 1 (DashboardSurface.tsx)
- **Issue:** State variable `templates` and local variable `charts` would shadow the imported services
- **Fix:** Renamed to `templatesList` and `chartsData` respectively
- **Files modified:** src/surfaces/dashboard/DashboardSurface.tsx
- **Verification:** Build passes, service calls resolve correctly
- **Committed in:** 90e440c

---

**Total deviations:** 1 auto-fixed (blocking issue), 0 deferred
**Impact on plan:** Variable renaming was necessary for correct import resolution. No scope creep.

## Issues Encountered

None

## Next Phase Readiness

- Phase 15 complete
- Ready for Phase 16: Remove Window Exports

---
*Phase: 15-dashboard-service-imports*
*Completed: 2026-01-14*
