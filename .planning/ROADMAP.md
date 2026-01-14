# Roadmap: Ironlift Strength

## Overview

Technical debt refactor migrating a fitness tracking app from zero-build vanilla JavaScript to TypeScript + Vite with surface-based architecture. App rebranded from "Exercise Tracker" to "Ironlift Strength" in v1.1.

## Milestones

- 🚧 **v1.2 Legacy Code Cleanup** - Phases 14-17 (in progress)
- ✅ [v1.1 Fixes & Polish](milestones/v1.1-ROADMAP.md) (Phases 12-13) — SHIPPED 2026-01-13
- ✅ [v1.0 Exercise Tracker Refactor](milestones/v1.0-ROADMAP.md) (Phases 1-11) — SHIPPED 2026-01-13

## Phases

### 🚧 v1.2 Legacy Code Cleanup (In Progress)

**Milestone Goal:** Remove all dependencies on legacy Alpine.js/window globals, enabling Preact components to use direct TypeScript imports.

**Branch:** `002-js-complete-service-migration` (verify before each phase)

#### Phase 14: Workout Service Imports (Complete)

**Goal**: Update WorkoutSurface.tsx and TemplateEditorSurface.tsx to use direct service imports
**Depends on**: v1.1 complete
**Research**: Unlikely (internal patterns)
**Branch check**: `git branch --show-current` must be `002-js-complete-service-migration`
**Plans**: 1

Plans:
- [x] 14-01: Update WorkoutSurface + TemplateEditorSurface to use direct service imports

#### Phase 15: Dashboard Service Imports (Complete)

**Goal**: Update DashboardSurface.tsx and ChartCard.tsx to use direct service imports
**Depends on**: Phase 14
**Research**: Unlikely (internal patterns)
**Branch check**: Verify on `002-js-complete-service-migration`
**Plans**: 1

Plans:
- [x] 15-01: Update DashboardSurface + ChartCard to use direct service imports

#### Phase 16: Remove Window Exports (Complete)

**Goal**: Remove window.* exports from all TypeScript services
**Depends on**: Phase 15
**Research**: Unlikely (cleanup task)
**Branch check**: Verify on `002-js-complete-service-migration`
**Plans**: 1

Plans:
- [x] 16-01: Remove window exports from services and Window augmentation from env.d.ts

#### Phase 17: Remove Legacy Files

**Goal**: Delete js/*.js files, update index.html, remove window.supabaseClient export, remove JS from vite static-copy
**Depends on**: Phase 16
**Research**: Unlikely (cleanup task)
**Branch check**: Verify on `002-js-complete-service-migration`
**Plans**: TBD

Files to update:
- Delete: js/auth.js, js/exercises.js, js/templates.js, js/logging.js, js/charts.js, js/timer.js, js/supabase.js
- Update: index.html (remove script tags)
- Update: src/lib/supabase.ts (remove window.supabaseClient)
- Update: vite.config.ts (remove `{ src: 'js', dest: '.' }` from static-copy)

Plans:
- [ ] 17-01: TBD

<details>
<summary>✅ v1.1 Fixes & Polish (Phases 12-13) — SHIPPED 2026-01-13</summary>

- [x] **Phase 12: Bug Fixes** (2/2 plans) - Workout visibility, password recovery routing, chart metric, console cleanup
- [x] **Phase 13: UI Polish** (1/1 plans) - Button styling, form backgrounds, app title rename to Ironlift Strength

</details>

<details>
<summary>✅ v1.0 Refactor (Phases 1-11) — SHIPPED 2026-01-13</summary>

- [x] **Phase 1: Foundation** - Vite + TypeScript setup, project structure, build pipeline
- [x] **Phase 2: Type System** - Supabase schema types, shared interfaces, service module types
- [x] **Phase 3: Framework Evaluation** - Evaluate Alpine.js alternatives, make framework selection → **Preact**
- [x] **Phase 4: Auth Service** - Migrate auth service with full TypeScript types
- [x] **Phase 5: Data Services** - Migrate exercises, templates, logging services with types
- [x] **Phase 6: Auth Surface** - Refactor auth UI (login, register, password reset, session)
- [x] **Phase 7: Dashboard Surface** - Refactor main dashboard view and navigation
- [x] **Phase 8: Template Editor Surface** - Refactor template CRUD operations
- [x] **Phase 9: Workout Surface** - Refactor active workout (timer, sets, swipe gestures)
- [x] **Phase 10: Charts Surface** - Refactor progress charts rendering
- [x] **Phase 11: Integration** - Multi-tab sync, localStorage backup, routing, final cleanup

</details>

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 14. Workout Service Imports | v1.2 | 1/1 | Complete | 2026-01-14 |
| 15. Dashboard Service Imports | v1.2 | 1/1 | Complete | 2026-01-14 |
| 16. Remove Window Exports | v1.2 | 1/1 | Complete | 2026-01-14 |
| 17. Remove Legacy Files | v1.2 | 0/? | Not started | - |
| 1-11 | v1.0 | 27/27 | Complete | 2026-01-13 |
| 12-13 | v1.1 | 3/3 | Complete | 2026-01-13 |

**Total:** 16 phases complete, 33 plans complete | 1 phase remaining

---

*See `.planning/MILESTONES.md` for milestone history.*
*See `.planning/milestones/` for archived phase details.*
