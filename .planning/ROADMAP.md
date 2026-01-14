# Roadmap: Exercise Tracker Refactor

## Overview

Technical debt refactor migrating a fitness tracking app from zero-build vanilla JavaScript to TypeScript + Vite with surface-based architecture.

## Completed Milestones

- [v1.0 Exercise Tracker Refactor](milestones/v1.0-ROADMAP.md) (Phases 1-11) — SHIPPED 2026-01-13

## Current Milestone

**v1.1 Fixes & Polish** — Bug fixes from UAT and UI polish

## Phases

### v1.1 Fixes & Polish (Phases 12-13)

- [x] **Phase 12: Bug Fixes** (2/2 plans) - Workout visibility, password recovery routing, chart metric, console cleanup
- [x] **Phase 13: UI Polish** (1/1 plans) - Button styling, form backgrounds, app title rename

<details>
<summary>v1.0 Refactor (Phases 1-11) — SHIPPED 2026-01-13</summary>

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

## Phase Details

### Phase 12: Bug Fixes
**Goal**: Fix bugs discovered during v1.0 UAT testing
**Depends on**: v1.0 complete
**Scope**:
- Workout hides when alt-tabbing and returning to browser
- Password Recovery redirects to wrong surface after success
- Charts "Max Weight" metric fails to display data
- Remove console.log statements from auth debug code

### Phase 13: UI Polish
**Goal**: Visual polish and branding updates
**Depends on**: Phase 12
**Scope**:
- Style "Add Chart" button to match app design
- Fix logout button positioning
- Style "Remove Chart" (X) button
- Add transparency to "Add Chart" form background
- Rename app title from "Exercise Tracker" to "Ironlift Strength"

<details>
<summary>v1.0 Phase Details (Archived)</summary>

See [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) for full phase details.

</details>

## Progress

| Milestone | Phases | Plans | Status | Completed |
|-----------|--------|-------|--------|-----------|
| v1.0 Refactor | 1-11 | 27 | Complete | 2026-01-13 |
| v1.1 Fixes & Polish | 12-13 | 3 | Complete | 2026-01-13 |

---

*See `.planning/MILESTONES.md` for milestone history.*
