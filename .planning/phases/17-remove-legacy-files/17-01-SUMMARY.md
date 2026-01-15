---
phase: 17-remove-legacy-files
plan: 01
subsystem: infra
tags: [vite, build, html, cleanup]

# Dependency graph
requires:
  - phase: 16-remove-window-exports
    provides: All services use direct ES imports, no window.* dependencies
provides:
  - HTML without legacy JS script tags
  - Build config without JS static-copy
  - Clean dist/ output (no js/ directory)
affects: [final-cleanup, js-deletion]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified: [index.html, vite.config.ts]

key-decisions:
  - "Keep Chart.js CDN script (still used by chart rendering)"
  - "Keep CSS static-copy (still needed for styles)"

patterns-established: []

issues-created: []

# Metrics
duration: 2min
completed: 2026-01-14
---

# Phase 17 Plan 01: Remove Legacy References Summary

**Removed legacy JS script tags and build config - HTML and Vite no longer reference js/*.js files**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-14T09:30:00Z
- **Completed:** 2026-01-14T09:32:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Removed 6 legacy JS script tags from index.html (auth, exercises, templates, logging, timer, charts)
- Removed js/ directory from vite static-copy targets
- Build now produces clean dist/ without legacy js/ directory

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove legacy JS script tags from index.html** - `55ffca4` (feat)
2. **Task 2: Remove JS from vite static-copy config** - `55e4e28` (chore)

**Plan metadata:** N/A (.planning/ in .gitignore)

## Files Created/Modified

- `index.html` - Removed 6 script tags and obsolete comments about window.* services
- `vite.config.ts` - Removed `{ src: 'js', dest: '.' }` from viteStaticCopy targets

## Decisions Made

- Kept Chart.js CDN script (line 14) - still required for chart rendering
- Kept CSS static-copy target - CSS files still needed in dist/

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- HTML and build config cleaned of legacy JS references
- Ready for final step: delete the js/*.js files and js/ directory
- Note: js/supabase.js deletion and window.supabaseClient removal may be needed as separate task

---
*Phase: 17-remove-legacy-files*
*Completed: 2026-01-14*
