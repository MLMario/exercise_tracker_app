---
phase: 12-bug-fixes
plan: 01
subsystem: auth
tags: [preact, useref, closure, navigation, supabase]

# Dependency graph
requires:
  - phase: 11-integration
    provides: working app with auth surfaces
provides:
  - closure-safe auth state access via refs
  - preserved workout/templateEditor surfaces on token refresh
  - proper password recovery flow completion
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useRef for closure-safe state in event listeners"

key-files:
  created: []
  modified:
    - src/main.tsx
    - src/surfaces/auth/AuthSurface.tsx

key-decisions:
  - "Used useRef pattern for closure-safe state access rather than adding deps to useEffect"

patterns-established:
  - "useRef pattern: state values needed in event listener callbacks should use refs to avoid stale closure"

issues-created: []

# Metrics
duration: 3 min
completed: 2026-01-13
---

# Plan 12-01: Navigation Bug Fixes Summary

**Fixed workout visibility on alt-tab and password recovery routing via useRef pattern for closure-safe auth listener state**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-13T22:06:00Z
- **Completed:** 2026-01-13T22:09:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Auth listener now uses refs to access current state values (closure-safe)
- SIGNED_IN handler only navigates to dashboard when on auth surface
- Workout and templateEditor surfaces preserved during token refresh (alt-tab)
- URL hash cleared after password update to prevent recovery mode re-detection

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix workout visibility on alt-tab** - `69170e7` (fix)
2. **Task 2: Fix password recovery routing after success** - `8b3937b` (fix)

## Files Created/Modified

- `src/main.tsx` - Added useRef for currentSurface and isPasswordRecoveryMode, updated SIGNED_IN handler to check surface before navigation
- `src/surfaces/auth/AuthSurface.tsx` - Clear URL hash after password update success

## Decisions Made

- Used useRef pattern for closure-safe state access in auth listener callback
- Avoided adding currentSurface to useEffect deps (would cause subscription churn)
- Both refs added together since they fix the same underlying closure issue

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Step

Ready for 12-02-PLAN.md (chart metric fix and console.log cleanup)

---
*Phase: 12-bug-fixes*
*Completed: 2026-01-13*
