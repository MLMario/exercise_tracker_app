# Roadmap: Exercise Tracker App

## Overview

Ongoing maintenance and polish work for the Exercise Tracker application. Each milestone addresses specific cleanup or feature needs.

## Domain Expertise

None

## Milestones

- ✅ [v2.3 Template Editor UI Cleanup](milestones/v2.3-ROADMAP.md) (Phases 1-2) — SHIPPED 2026-01-17
- ✅ [v2.4 Debug Cleanup](milestones/v2.4-ROADMAP.md) (Phase 3) — SHIPPED 2026-01-17
- ✅ [v2.5 Exercise Card Design Modifications](milestones/v2.5-ROADMAP.md) (Phase 4) — SHIPPED 2026-01-18
- 🚧 **v2.6 Swipe Gesture Refactor** - Phases 5-7 (in progress)

## Completed Milestones

<details>
<summary>✅ v2.3 Template Editor UI Cleanup (Phases 1-2) — SHIPPED 2026-01-17</summary>

- [x] Phase 1: Header Layout (1/1 plans) — completed 2026-01-18
- [x] Phase 2: Exercise Name Truncation (1/1 plans) — completed 2026-01-17

</details>

<details>
<summary>✅ v2.4 Debug Cleanup (Phase 3) — SHIPPED 2026-01-17</summary>

- [x] Phase 3: Remove Debug Logging (1/1 plans) — completed 2026-01-17

</details>

<details>
<summary>✅ v2.5 Exercise Card Design Modifications (Phase 4) — SHIPPED 2026-01-18</summary>

- [x] Phase 4: Workout Card Action Footer (1/1 plans) — completed 2026-01-18

</details>

## Current Milestone

### 🚧 v2.6 Swipe Gesture Refactor (In Progress)

**Milestone Goal:** Refactor swipe-to-delete gesture in SetRow using @use-gesture library for cleaner, more maintainable code.

#### Phase 5: use-gesture-setup ✓

**Goal**: Install @use-gesture/react and configure for Preact compatibility
**Depends on**: Previous milestone complete
**Status**: Complete

Plans:
- [x] 05-01: Install and verify Preact compatibility — completed 2026-01-18

#### Phase 6: setrow-swipe-refactor ✓

**Goal**: Replace manual pointer handlers in SetRow with useDrag hook
**Depends on**: Phase 5
**Status**: Complete

Plans:
- [x] 06-01: Replace manual swipe handlers with useDrag hook — completed 2026-01-18

#### Phase 7: swipe-polish

**Goal**: Add spring animations and gesture refinements
**Depends on**: Phase 6
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Header Layout | v2.3 | 1/1 | Complete | 2026-01-18 |
| 2. Exercise Name Truncation | v2.3 | 1/1 | Complete | 2026-01-17 |
| 3. Remove Debug Logging | v2.4 | 1/1 | Complete | 2026-01-17 |
| 4. Workout Card Action Footer | v2.5 | 1/1 | Complete | 2026-01-18 |
| 5. use-gesture-setup | v2.6 | 1/1 | Complete | 2026-01-18 |
| 6. setrow-swipe-refactor | v2.6 | 1/1 | Complete | 2026-01-18 |
| 7. swipe-polish | v2.6 | 0/? | Not started | - |
