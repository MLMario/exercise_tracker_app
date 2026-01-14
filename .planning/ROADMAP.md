# Roadmap: Ironlift Strength

## Overview

Technical debt refactor migrating a fitness tracking app from zero-build vanilla JavaScript to TypeScript + Vite with surface-based architecture. App rebranded from "Exercise Tracker" to "Ironlift Strength" in v1.1.

## Milestones

- 🚧 **v1.3 UI Refinements** - Phases 18-19 (in progress)
- ✅ [v1.2 Legacy Code Cleanup](milestones/v1.2-ROADMAP.md) (Phases 14-17) — SHIPPED 2026-01-14
- ✅ [v1.1 Fixes & Polish](milestones/v1.1-ROADMAP.md) (Phases 12-13) — SHIPPED 2026-01-13
- ✅ [v1.0 Exercise Tracker Refactor](milestones/v1.0-ROADMAP.md) (Phases 1-11) — SHIPPED 2026-01-13

## Phases

### 🚧 v1.3 UI Refinements (In Progress)

**Milestone Goal:** Improve dashboard UX with compact template grid layout and visual cleanup.

#### Phase 18: Template List Redesign

**Goal**: Implement 2-column mini-grid layout for templates matching mockup design
**Depends on**: Previous milestone complete
**Research**: Unlikely (internal Preact patterns, CSS styling)
**Plans**: TBD

Plans:
- [ ] 18-01: TBD (run /gsd:plan-phase 18 to break down)

#### Phase 19: Dashboard Cleanup

**Goal**: Remove exercise count text from dashboard bottom area
**Depends on**: Phase 18
**Research**: Unlikely (simple UI removal)
**Plans**: TBD

Plans:
- [ ] 19-01: TBD (run /gsd:plan-phase 19 to break down)

---

<details>
<summary>✅ v1.2 Legacy Code Cleanup (Phases 14-17) — SHIPPED 2026-01-14</summary>

- [x] **Phase 14: Workout Service Imports** (1/1 plans) - Direct imports in WorkoutSurface + TemplateEditorSurface
- [x] **Phase 15: Dashboard Service Imports** (1/1 plans) - Direct imports in DashboardSurface + ChartCard
- [x] **Phase 16: Remove Window Exports** (1/1 plans) - Remove all window.* exports from TypeScript services
- [x] **Phase 17: Remove Legacy Files** (2/2 plans) - Delete js/*.js, clean HTML and build config

</details>

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
| 18. Template List Redesign | v1.3 | 0/? | Not started | - |
| 19. Dashboard Cleanup | v1.3 | 0/? | Not started | - |
| 14. Workout Service Imports | v1.2 | 1/1 | Complete | 2026-01-14 |
| 15. Dashboard Service Imports | v1.2 | 1/1 | Complete | 2026-01-14 |
| 16. Remove Window Exports | v1.2 | 1/1 | Complete | 2026-01-14 |
| 17. Remove Legacy Files | v1.2 | 2/2 | Complete | 2026-01-14 |
| 1-11 | v1.0 | 27/27 | Complete | 2026-01-13 |
| 12-13 | v1.1 | 3/3 | Complete | 2026-01-13 |

**Total:** 17 phases complete, 35 plans complete | v1.3 in progress

---

*See `.planning/MILESTONES.md` for milestone history.*
*See `.planning/milestones/` for archived phase details.*
