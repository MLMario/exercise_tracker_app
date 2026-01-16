---
phase: 27-update-imports
plan: 01
subsystem: infra
tags: [imports, monorepo, typescript, vite]

# Dependency graph
requires:
  - phase: 26-web-app-migration
    provides: apps/web/ directory structure with @ironlift/shared workspace dependency
provides:
  - All web app files using @ironlift/shared for types and services
  - Working Vite build with proper dependency resolution
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [workspace package imports, vite optimizeDeps for workspace dependencies]

key-files:
  created: []
  modified:
    - apps/web/src/main.tsx
    - apps/web/src/components/ExercisePickerModal.tsx
    - apps/web/src/surfaces/auth/AuthSurface.tsx
    - apps/web/src/surfaces/dashboard/DashboardSurface.tsx
    - apps/web/src/surfaces/dashboard/TemplateList.tsx
    - apps/web/src/surfaces/dashboard/TemplateCard.tsx
    - apps/web/src/surfaces/dashboard/ChartCard.tsx
    - apps/web/src/surfaces/dashboard/AddChartModal.tsx
    - apps/web/src/surfaces/template-editor/TemplateEditorSurface.tsx
    - apps/web/src/surfaces/workout/WorkoutSurface.tsx
    - packages/shared/package.json
    - apps/web/vite.config.ts

key-decisions:
  - "Added chart.js to shared package peerDependencies to resolve build failures"
  - "Added vite optimizeDeps.include for chart.js for proper workspace resolution"

patterns-established:
  - "Workspace packages using source imports require explicit peerDependencies"
  - "Vite optimizeDeps.include needed for dependencies used by workspace packages"

issues-created: []

# Metrics
duration: 8min
completed: 2026-01-16
---

# Phase 27 Plan 01: Update Imports Summary

**Migrated 11 files from @/ path aliases to @ironlift/shared package imports, completing monorepo import structure**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-15T09:00:00Z
- **Completed:** 2026-01-15T09:08:00Z
- **Tasks:** 3
- **Files modified:** 13 (11 source files + 2 config files)

## Accomplishments

- Updated all 11 web app files to use @ironlift/shared for types and services
- No @/types or @/services imports remain in apps/web/src/
- Preserved @/components and @/surfaces imports (local to web app)
- Vite build succeeds with 86 modules transformed

## Task Commits

Each task was committed atomically:

1. **Task 1: Update main.tsx and component imports** - `704a606` (refactor)
2. **Task 2: Update surface imports to @ironlift/shared** - `078b923` (refactor)
3. **Task 3: Verify TypeScript and build** - `9947331` (chore)

## Files Created/Modified

**Source files updated (import changes):**
- `apps/web/src/main.tsx` - @/services/auth, @/types -> @ironlift/shared
- `apps/web/src/components/ExercisePickerModal.tsx` - @/types -> @ironlift/shared
- `apps/web/src/surfaces/auth/AuthSurface.tsx` - @/services/auth -> @ironlift/shared
- `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` - @/types, @/services -> @ironlift/shared
- `apps/web/src/surfaces/dashboard/TemplateList.tsx` - @/types -> @ironlift/shared
- `apps/web/src/surfaces/dashboard/TemplateCard.tsx` - @/types -> @ironlift/shared
- `apps/web/src/surfaces/dashboard/ChartCard.tsx` - @/services -> @ironlift/shared
- `apps/web/src/surfaces/dashboard/AddChartModal.tsx` - @/types -> @ironlift/shared
- `apps/web/src/surfaces/template-editor/TemplateEditorSurface.tsx` - @/types, @/services -> @ironlift/shared
- `apps/web/src/surfaces/workout/WorkoutSurface.tsx` - @/types, @/services -> @ironlift/shared

**Config files updated (build fixes):**
- `packages/shared/package.json` - Added chart.js to peerDependencies
- `apps/web/vite.config.ts` - Added optimizeDeps.include for chart.js

## Decisions Made

- Added chart.js to @ironlift/shared peerDependencies because the shared package exports the charts service which uses chart.js. This was necessary to resolve Vite/Rollup build failures.
- Added vite optimizeDeps.include for chart.js to ensure proper dependency resolution for workspace packages using source imports.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed chart.js resolution for Vite build**
- **Found during:** Task 3 (Verify TypeScript and build)
- **Issue:** Build failed with "Rollup failed to resolve import 'chart.js'" because the shared package exports charts service which uses chart.js, but chart.js wasn't properly declared as a dependency
- **Fix:** Added chart.js to shared package peerDependencies and vite optimizeDeps.include
- **Files modified:** packages/shared/package.json, apps/web/vite.config.ts
- **Verification:** pnpm --filter @ironlift/web build succeeds
- **Committed in:** 9947331 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (blocking build issue)
**Impact on plan:** Fix was necessary for build to succeed. No scope creep.

## Issues Encountered

- Pre-existing TypeScript error in shared package (vite/client types) - not related to import changes, build still succeeds

## Next Phase Readiness

- Phase 27 complete - all imports updated
- Web app builds successfully
- Ready for any future development

---
*Phase: 27-update-imports*
*Completed: 2026-01-16*
