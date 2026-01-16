---
phase: 26-web-app-migration
plan: 01
subsystem: infra
tags: [monorepo, pnpm, workspace, vite, typescript]

# Dependency graph
requires:
  - phase: 25-extract-shared-package
    provides: packages/shared with types, services, lib
provides:
  - apps/web/ directory with all web-specific code
  - workspace scripts for filtered execution
  - project references in root tsconfig
affects: [27-update-imports, 28-config-updates]

# Tech tracking
tech-stack:
  added: []
  patterns: [pnpm workspace filtering, TypeScript project references]

key-files:
  created: [apps/web/package.json, apps/web/tsconfig.json]
  modified: [package.json, tsconfig.json]

key-decisions:
  - "Workspace scripts use pnpm --filter @ironlift/web pattern"
  - "TypeScript project references for monorepo build orchestration"

patterns-established:
  - "App packages live in apps/ directory"
  - "git mv for history-preserving file moves"

issues-created: []

# Metrics
duration: 3min
completed: 2026-01-16
---

# Phase 26 Plan 01: Web App Migration Summary

**Moved all web-specific code from root to apps/web/ with git history preserved via git mv**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-16T06:05:14Z
- **Completed:** 2026-01-16T06:08:22Z
- **Tasks:** 3
- **Files modified:** 37 (2 created, 33 moved, 2 modified)

## Accomplishments

- Created apps/web/ package with @ironlift/shared workspace dependency
- Moved all web-specific files (components, surfaces, main.tsx, css, assets, configs) preserving git history
- Updated root package.json with workspace scripts (pnpm --filter pattern)
- Added TypeScript project references for monorepo build orchestration

## Task Commits

Each task committed atomically:

1. **Task 1: Create web app package structure** - `424ae92` (feat)
2. **Task 2: Move web app source files to apps/web** - `a83140c` (refactor)
3. **Task 3: Update root configs for monorepo** - `af32a61` (chore)

**Plan metadata:** (pending)

## Files Created/Modified

**Created:**
- apps/web/package.json - @ironlift/web package with workspace dependency
- apps/web/tsconfig.json - Extends root config with local path aliases

**Moved (git mv, 100% similarity - history preserved):**
- src/components/ → apps/web/src/components/
- src/surfaces/ → apps/web/src/surfaces/
- src/main.tsx → apps/web/src/main.tsx
- src/env.d.ts → apps/web/src/env.d.ts
- css/ → apps/web/css/
- assets/ → apps/web/assets/
- index.html → apps/web/index.html
- vite.config.ts → apps/web/vite.config.ts

**Deleted:**
- apps/.gitkeep (no longer needed)
- src/ directory (empty after moves)

**Modified:**
- package.json - Workspace scripts, moved app deps to apps/web
- tsconfig.json - Removed paths, added project references

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

- Used `pnpm --filter @ironlift/web` pattern for workspace scripts
- Added TypeScript project references for build orchestration

## Issues Encountered

None

## Next Phase Readiness

Ready for Phase 27: Update Imports
- apps/web/ contains all web-specific code
- Import paths still use @/ aliases (will break until Phase 27)
- Need to update imports to use @ironlift/shared

---
*Phase: 26-web-app-migration*
*Completed: 2026-01-16*
