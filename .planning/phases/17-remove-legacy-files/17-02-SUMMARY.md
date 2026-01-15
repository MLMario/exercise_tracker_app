---
phase: 17-remove-legacy-files
plan: 02
subsystem: infra
tags: [cleanup, legacy, deletion]

# Dependency graph
requires:
  - phase: 17-01
    provides: HTML and build config cleaned of JS references
provides:
  - Clean supabase.ts without window globals
  - Codebase free of legacy JS files
  - 3,560 lines of dead code removed
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified: [src/lib/supabase.ts]
  deleted: [js/auth.js, js/exercises.js, js/templates.js, js/logging.js, js/charts.js, js/timer.js, js/supabase.js, js/legacy/app.alpine.js]

key-decisions:
  - "Keep js/config.local.js (user-specific local config)"
  - "Delete js/legacy/app.alpine.js (full Alpine.js app)"

patterns-established: []

issues-created: []

# Metrics
duration: 2min
completed: 2026-01-14
---

# Phase 17 Plan 02: Delete Legacy Files Summary

**Removed window.supabaseClient export and deleted 8 legacy JS files (3,560 lines of dead code)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-14T09:33:00Z
- **Completed:** 2026-01-14T09:35:00Z
- **Tasks:** 2
- **Files modified:** 1
- **Files deleted:** 8

## Accomplishments

- Removed window.supabaseClient export from src/lib/supabase.ts
- Deleted 7 legacy JS service files (auth, exercises, templates, logging, charts, timer, supabase)
- Deleted js/legacy/app.alpine.js (the entire Alpine.js app)
- Removed 3,560 lines of dead code from codebase
- Completed v1.2 Legacy Code Cleanup milestone

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove window.supabaseClient export** - `7cf17b0` (refactor)
2. **Task 2: Delete legacy JS service files** - `a82e88e` (chore)

**Plan metadata:** N/A (.planning/ in .gitignore)

## Files Created/Modified

- `src/lib/supabase.ts` - Removed window global export and Window interface augmentation

## Files Deleted

- `js/auth.js` - Replaced by src/services/auth.ts
- `js/exercises.js` - Replaced by src/services/exercises.ts
- `js/templates.js` - Replaced by src/services/templates.ts
- `js/logging.js` - Replaced by src/services/logging.ts
- `js/charts.js` - Replaced by src/services/charts.ts
- `js/timer.js` - Timer functionality now in Preact components
- `js/supabase.js` - Replaced by src/lib/supabase.ts
- `js/legacy/app.alpine.js` - Full Alpine.js app replaced by Preact

## Decisions Made

- Kept js/config.local.js - user-specific local configuration file
- Deleted js/legacy/app.alpine.js - the original Alpine.js monolithic app, now fully replaced

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Milestone Complete

**v1.2 Legacy Code Cleanup - COMPLETE**

All phases delivered:
- Phase 14: Workout Service Imports - Direct imports in WorkoutSurface/TemplateEditorSurface
- Phase 15: Dashboard Service Imports - Direct imports in DashboardSurface/ChartCard
- Phase 16: Remove Window Exports - Removed all window.* exports from TypeScript services
- Phase 17: Remove Legacy Files - Deleted JS files, cleaned HTML and build config

**Migration complete:** The codebase is now 100% TypeScript with Preact, no legacy Alpine.js or vanilla JS dependencies.

---
*Phase: 17-remove-legacy-files*
*Completed: 2026-01-14*
