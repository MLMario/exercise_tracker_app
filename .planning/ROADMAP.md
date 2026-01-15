# Roadmap: Ironlift Strength

## Overview

Technical debt refactor migrating a fitness tracking app from zero-build vanilla JavaScript to TypeScript + Vite with surface-based architecture. App rebranded to "IronFactor" in v1.4 (previously "Ironlift Strength" in v1.1, originally "Exercise Tracker").

## Milestones

- 🚧 **v1.5 UX Improvements** - Phases 21-23 (in progress)
- ✅ [v1.4 IronFactor Rebrand](milestones/v1.4-ROADMAP.md) (Phases 19-20) — SHIPPED 2026-01-14
- ✅ [v1.3 UI Refinements](milestones/v1.3-ROADMAP.md) (Phase 18) — SHIPPED 2026-01-14
- ✅ [v1.2 Legacy Code Cleanup](milestones/v1.2-ROADMAP.md) (Phases 14-17) — SHIPPED 2026-01-14
- ✅ [v1.1 Fixes & Polish](milestones/v1.1-ROADMAP.md) (Phases 12-13) — SHIPPED 2026-01-13
- ✅ [v1.0 Exercise Tracker Refactor](milestones/v1.0-ROADMAP.md) (Phases 1-11) — SHIPPED 2026-01-13

## Phases

### 🚧 v1.5 UX Improvements (In Progress)

**Milestone Goal:** Improve user experience with cleaner chart tooltips, proper email confirmation modal, and consistent delete confirmation modals.

#### Phase 21: Chart Tooltip Simplification - Complete

**Goal**: Simplify chart tooltips to show only value with unit (e.g., "10 lbs", "5 sets")
**Depends on**: Previous milestone complete
**Research**: Unlikely (internal Chart.js patterns already established)
**Plans**: 1/1 complete

Plans:
- [x] 21-01: Customize tooltip callbacks (2 min)

#### Phase 22: Account Confirmation Modal - Complete

**Goal**: Replace green success toast with email confirmation modal after account creation
**Depends on**: Phase 21
**Research**: Unlikely (internal modal patterns exist)
**Plans**: 1/1 complete

Plans:
- [x] 22-01: Create InfoModal + integrate into registration flow (3 min)

#### Phase 23: Chart Delete Modal - Complete

**Goal**: Replace browser confirm() with styled confirmation modal matching template delete modal
**Depends on**: Phase 22
**Research**: Unlikely (reusing existing modal component)
**Plans**: 1/1 complete

Plans:
- [x] 23-01: Replace template confirm() with ConfirmationModal (2 min)

---

<details>
<summary>✅ v1.4 IronFactor Rebrand (Phases 19-20) — SHIPPED 2026-01-14</summary>

- [x] **Phase 19: Auth Surface Rebrand** (1/1 plans) - IronFactor split-color logo, tagline, auth card styling
- [x] **Phase 20: Dashboard Rebrand** (1/1 plans) - Dashboard header with IronFactor branding

</details>

<details>
<summary>✅ v1.3 UI Refinements (Phase 18) — SHIPPED 2026-01-14</summary>

- [x] **Phase 18: Template List Redesign** (1/1 plans) - 2-column mini-grid layout, compact cards, removed exercise count

</details>

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
| 21. Chart Tooltip Simplification | v1.5 | 1/1 | Complete | 2026-01-14 |
| 22. Account Confirmation Modal | v1.5 | 1/1 | Complete | 2026-01-14 |
| 23. Chart Delete Modal | v1.5 | 1/1 | Complete | 2026-01-15 |
| 19. Auth Surface Rebrand | v1.4 | 1/1 | Complete | 2026-01-14 |
| 20. Dashboard Rebrand | v1.4 | 1/1 | Complete | 2026-01-14 |
| 18. Template List Redesign | v1.3 | 1/1 | Complete | 2026-01-14 |
| 14. Workout Service Imports | v1.2 | 1/1 | Complete | 2026-01-14 |
| 15. Dashboard Service Imports | v1.2 | 1/1 | Complete | 2026-01-14 |
| 16. Remove Window Exports | v1.2 | 1/1 | Complete | 2026-01-14 |
| 17. Remove Legacy Files | v1.2 | 2/2 | Complete | 2026-01-14 |
| 1-11 | v1.0 | 27/27 | Complete | 2026-01-13 |
| 12-13 | v1.1 | 3/3 | Complete | 2026-01-13 |

**Total:** 23 phases complete, 41 plans complete | v1.5 complete

---

*See `.planning/MILESTONES.md` for milestone history.*
*See `.planning/milestones/` for archived phase details.*
