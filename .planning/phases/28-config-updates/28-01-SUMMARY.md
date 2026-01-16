---
phase: 28-config-updates
plan: 01
subsystem: infra
tags: [typescript, tsconfig, monorepo, vercel, vite]

# Dependency graph
requires:
  - phase: 27-update-imports
    provides: All imports updated to @ironlift/shared
provides:
  - TypeScript composite project setup for monorepo
  - Package-level type checking (shared + web)
  - Vercel deployment configuration for apps/web
affects: [29-ios-scaffold, future-deployments]

# Tech tracking
tech-stack:
  added: []
  patterns: [package-level-typecheck, monorepo-vercel-deploy]

key-files:
  created: [packages/shared/src/env.d.ts]
  modified: [tsconfig.json, packages/shared/tsconfig.json, apps/web/tsconfig.json, packages/shared/src/lib/supabase.ts, vercel.json]

key-decisions:
  - "Package-level type checking instead of root-level (each package validates independently)"
  - "Ambient ImportMetaEnv types in shared package instead of vite devDependency"

patterns-established:
  - "TypeScript composite: true for workspace packages"
  - "Package-level tsc --noEmit verification"

issues-created: []

# Metrics
duration: 4min
completed: 2026-01-16
---

# Phase 28 Plan 01: Config Updates Summary

**TypeScript composite project setup with package-level type checking and Vercel monorepo deployment config**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-16T12:00:00Z
- **Completed:** 2026-01-16T12:04:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Configured TypeScript composite projects for workspace packages
- Created ambient ImportMetaEnv types for shared package (framework-agnostic)
- Updated Vercel config for monorepo deployment to apps/web/dist

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix TypeScript project references** - `30d9803` (refactor)
2. **Task 2: Fix vite/client types in shared** - `88d223b` (refactor)
3. **Task 3: Update vercel.json** - `a8c7e1f` (chore)

## Files Created/Modified

- `packages/shared/src/env.d.ts` - ImportMetaEnv ambient declaration for import.meta.env
- `tsconfig.json` - Removed references array (packages manage own type checking)
- `packages/shared/tsconfig.json` - Added composite: true
- `apps/web/tsconfig.json` - Added composite: true
- `packages/shared/src/lib/supabase.ts` - Removed vite/client reference
- `vercel.json` - Updated buildCommand, outputDirectory, installCommand for monorepo

## Decisions Made

- **Package-level type checking:** Root tsconfig no longer includes/excludes files. Each package (shared, web) runs `tsc --noEmit` independently. This is cleaner for monorepos where packages have different path aliases.
- **Ambient env types:** Created `env.d.ts` in shared package instead of adding vite as devDependency. Keeps shared package framework-agnostic.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- TypeScript type checking passes at package level
- Build succeeds with `pnpm run build`
- Vercel deployment configured for apps/web
- Ready for Phase 29: iOS Scaffold

---
*Phase: 28-config-updates*
*Completed: 2026-01-16*
