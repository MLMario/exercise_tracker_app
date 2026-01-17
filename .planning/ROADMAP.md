# Roadmap: Ironlift Strength

## Overview

Technical debt refactor migrating a fitness tracking app from zero-build vanilla JavaScript to TypeScript + Vite with surface-based architecture. App rebranded to "IronFactor" in v1.4 (previously "Ironlift Strength" in v1.1, originally "Exercise Tracker").

## Milestones

- 🚧 **v2.3 Template Editor Redesign** - Phases 33-37 (in progress)
- ✅ [v2.2 Exercise Card Redesign](milestones/v2.2-ROADMAP.md) (Phases 31-32) — SHIPPED 2026-01-17
- ✅ [v2.1 Monorepo Architecture + Root Cleanup](milestones/v2.1-ROADMAP.md) (Phases 24-30) — SHIPPED 2026-01-16
- ✅ [v1.5 UX Improvements](milestones/v1.5-ROADMAP.md) (Phases 21-23) — SHIPPED 2026-01-15
- ✅ [v1.4 IronFactor Rebrand](milestones/v1.4-ROADMAP.md) (Phases 19-20) — SHIPPED 2026-01-14
- ✅ [v1.3 UI Refinements](milestones/v1.3-ROADMAP.md) (Phase 18) — SHIPPED 2026-01-14
- ✅ [v1.2 Legacy Code Cleanup](milestones/v1.2-ROADMAP.md) (Phases 14-17) — SHIPPED 2026-01-14
- ✅ [v1.1 Fixes & Polish](milestones/v1.1-ROADMAP.md) (Phases 12-13) — SHIPPED 2026-01-13
- ✅ [v1.0 Exercise Tracker Refactor](milestones/v1.0-ROADMAP.md) (Phases 1-11) — SHIPPED 2026-01-13

## Phases

### 🚧 v2.3 Template Editor Redesign (In Progress)

**Milestone Goal:** Redesign TemplateEditorSurface to match mock-2-dense-grid.html design with improved exercise card layout, MM:SS time input, and consistent styling.

#### Phase 33: Exercise Card Layout ✓

**Goal**: Restructure ExerciseEditor card: Add Set in header, remove category badge, remove move buttons, remove section header
**Depends on**: Phase 32
**Research**: Unlikely (internal patterns)
**Plans**: 1/1 complete

Plans:
- [x] 33-01: Exercise card header restructure (Add Set in header, remove badge/move buttons, hover-reveal remove)

#### Phase 34: Set Table Grid Redesign ✓

**Goal**: Update set table to mockup grid (32px|1fr|1fr|36px), style inputs and set number badge
**Depends on**: Phase 33
**Research**: Unlikely (CSS patterns)
**Plans**: 1/1 complete

Plans:
- [x] 34-01: Set table grid redesign (dense grid layout, styled badges, checkbox-style delete)

#### Phase 35: Rest Time MM:SS Input

**Goal**: Create MM:SS time input with auto-formatting (e.g., "90" → "1:30") and ±10s adjustment buttons
**Depends on**: Phase 34
**Research**: Unlikely (input handling)
**Plans**: TBD

Plans:
- [ ] 35-01: TBD

#### Phase 36: Remove Button & Footer

**Goal**: Hover-reveal remove button, full-width "Add Exercise" footer button
**Depends on**: Phase 35
**Research**: Unlikely (CSS hover states)
**Plans**: TBD

Plans:
- [ ] 36-01: TBD

#### Phase 37: CSS & Polish

**Goal**: Final CSS consolidation, responsive behavior verification, visual polish
**Depends on**: Phase 36
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 37-01: TBD

<details>
<summary>✅ v2.2 Exercise Card Redesign (Phases 31-32) — SHIPPED 2026-01-17</summary>

- [x] **Phase 31: Exercise Card Accordion** (1/1 plans) - Accordion layout with progress ring, ~70% space savings
- [x] **Phase 32: Rest Timer Bar Redesign** (1/1 plans) - Horizontal inline layout with gradient bar

</details>

<details>
<summary>✅ v2.1 Monorepo Architecture + Root Cleanup (Phases 24-30) — SHIPPED 2026-01-16</summary>

- [x] **Phase 24: Workspace Setup** (1/1 plans) - pnpm workspace with packages/apps structure
- [x] **Phase 25: Extract Shared Package** (1/1 plans) - @ironlift/shared with types, services, lib
- [x] **Phase 26: Web App Migration** (1/1 plans) - Moved web app to apps/web/
- [x] **Phase 27: Update Imports** (1/1 plans) - Changed @/ to @ironlift/shared
- [x] **Phase 28: Config Updates** (1/1 plans) - TypeScript composite, Vercel monorepo config
- [x] **Phase 29: iOS Scaffold** (1/1 plans) - Placeholder for React Native app
- [x] **Phase 30: Root Folder Cleanup** (1/1 plans) - Removed legacy js/, dist/

</details>

<details>
<summary>✅ v1.5 UX Improvements (Phases 21-23) — SHIPPED 2026-01-15</summary>

- [x] **Phase 21: Chart Tooltip Simplification** (1/1 plans) - Simplified tooltips showing value + unit
- [x] **Phase 22: Account Confirmation Modal** (1/1 plans) - InfoModal for registration email confirmation
- [x] **Phase 23: Chart Delete Modal** (1/1 plans) - ConfirmationModal for template delete

</details>

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

| Milestone | Phases | Plans | Status | Shipped |
|-----------|--------|-------|--------|---------|
| v2.3 Template Editor Redesign | 33-37 | 2/? | In progress | - |
| v2.2 Exercise Card Redesign | 31-32 | 2/2 | Complete | 2026-01-17 |
| v2.1 Monorepo + Cleanup | 24-30 | 7/7 | Complete | 2026-01-16 |
| v1.5 UX Improvements | 21-23 | 3/3 | Complete | 2026-01-15 |
| v1.4 IronFactor Rebrand | 19-20 | 2/2 | Complete | 2026-01-14 |
| v1.3 UI Refinements | 18 | 1/1 | Complete | 2026-01-14 |
| v1.2 Legacy Code Cleanup | 14-17 | 5/5 | Complete | 2026-01-14 |
| v1.1 Fixes & Polish | 12-13 | 3/3 | Complete | 2026-01-13 |
| v1.0 Exercise Tracker Refactor | 1-11 | 27/27 | Complete | 2026-01-13 |

**Total:** 9 milestones shipped, 34 phases complete, 52 plans complete

---

*See `.planning/MILESTONES.md` for milestone history.*
*See `.planning/milestones/` for archived phase details.*