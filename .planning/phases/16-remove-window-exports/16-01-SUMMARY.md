---
phase: 16-remove-window-exports
plan: 01
subsystem: services
tags: [typescript, refactor, cleanup, window-globals]

# Dependency graph
requires:
  - phase: 15-dashboard-service-imports
    provides: all Preact components using direct service imports
provides:
  - Clean TypeScript services without window namespace pollution
  - env.d.ts containing only Vite environment types
affects: [17-remove-legacy-files]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Services export only via ES modules, no window globals"

key-files:
  created: []
  modified:
    - src/services/auth.ts
    - src/services/charts.ts
    - src/services/templates.ts
    - src/services/exercises.ts
    - src/services/logging.ts
    - src/env.d.ts

key-decisions:
  - "Removed both window.* assignments AND declare global blocks from services"

patterns-established:
  - "TypeScript services use ES module exports only"

issues-created: []

# Metrics
duration: 3min
completed: 2026-01-14
---

# Phase 16 Plan 01: Remove Window Exports Summary

**Removed all window.* exports from 5 TypeScript services and cleaned Window augmentation from env.d.ts**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-14T00:00:00Z
- **Completed:** 2026-01-14T00:03:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Removed window.auth, window.charts, window.templates, window.exercises, window.logging exports
- Removed all `declare global { interface Window {...} }` blocks from service files
- Cleaned env.d.ts to contain only Vite environment types
- Build passes with no TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove window exports from service files** - `d67d713` (feat)
2. **Task 2: Remove Window interface augmentation** - `c2c9f12` (feat)

**Plan metadata:** (pending)

## Files Created/Modified

- `src/services/auth.ts` - Removed window.auth export and declare global block
- `src/services/charts.ts` - Removed window.charts export and declare global block
- `src/services/templates.ts` - Removed window.templates export and declare global block
- `src/services/exercises.ts` - Removed window.exercises export and declare global block
- `src/services/logging.ts` - Removed window.logging export and declare global block
- `src/env.d.ts` - Removed type imports and Window interface augmentation

## Decisions Made

- Removed both the `window.* = *;` assignments AND the associated `declare global` blocks (not just the assignments)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Phase 16 complete
- Ready for Phase 17: Remove Legacy Files (delete js/*.js, update index.html, remove window.supabaseClient)

---
*Phase: 16-remove-window-exports*
*Completed: 2026-01-14*
