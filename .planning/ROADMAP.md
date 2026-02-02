# Roadmap: Exercise Tracker App

## Overview

Ongoing maintenance and polish work for the Exercise Tracker application. Each milestone addresses specific cleanup or feature needs.

## Domain Expertise

None

## Milestones

- [v2.3 Template Editor UI Cleanup](milestones/v2.3-ROADMAP.md) (Phases 1-2) -- SHIPPED 2026-01-17
- [v2.4 Debug Cleanup](milestones/v2.4-ROADMAP.md) (Phase 3) -- SHIPPED 2026-01-17
- [v2.5 Exercise Card Design Modifications](milestones/v2.5-ROADMAP.md) (Phase 4) -- SHIPPED 2026-01-18
- [v2.6 Swipe Gesture Refactor](milestones/v2.6-ROADMAP.md) (Phases 5-7) -- SHIPPED 2026-01-19
- **v2.7 Pre-Created Exercise Library** (Phases 8-13) -- SHIPPED 2026-02-02

## Completed Milestones

<details>
<summary>v2.3 Template Editor UI Cleanup (Phases 1-2) -- SHIPPED 2026-01-17</summary>

- [x] Phase 1: Header Layout (1/1 plans) -- completed 2026-01-18
- [x] Phase 2: Exercise Name Truncation (1/1 plans) -- completed 2026-01-17

</details>

<details>
<summary>v2.4 Debug Cleanup (Phase 3) -- SHIPPED 2026-01-17</summary>

- [x] Phase 3: Remove Debug Logging (1/1 plans) -- completed 2026-01-17

</details>

<details>
<summary>v2.5 Exercise Card Design Modifications (Phase 4) -- SHIPPED 2026-01-18</summary>

- [x] Phase 4: Workout Card Action Footer (1/1 plans) -- completed 2026-01-18

</details>

<details>
<summary>v2.6 Swipe Gesture Refactor (Phases 5-7) -- SHIPPED 2026-01-19</summary>

- [x] Phase 5: use-gesture-setup (1/1 plans) -- completed 2026-01-18
- [x] Phase 6: setrow-swipe-refactor (1/1 plans) -- completed 2026-01-18
- [x] Phase 7: swipe-polish (1/1 plans) -- completed 2026-01-19

</details>

## Current Milestone

### v2.7 Pre-Created Exercise Library (Phases 8-13)

**Goal:** Add ~800 pre-created exercises from free-exercise-db that users can pick from when adding exercises.

| Phase | Name | Goal | Requirements | Status |
|-------|------|------|--------------|--------|
| 8 | Database Schema Migration | Modify exercises table and RLS policies | SCHEMA-01 to SCHEMA-09, RLS-01 to RLS-05 | Complete |
| 9 | Data Import | Fetch and transform exercise data, generate CSV | DATA-01 to DATA-04 | Complete |
| 10 | Backend Updates | Update types and service functions | BACK-01 to BACK-03 | Complete |
| 11 | Frontend Updates | Add badge and sorting to exercise picker | UI-01 to UI-03 | Complete |
| 12 | Exercise Picker Layout | Move category to line below exercise name | LAYOUT-01 | Complete |
| 13 | System Exercise Color Fix | Remove graying from system exercises in picker | COLOR-01 | Complete |

**Plans:** 6 plans
- [x] 08-01-PLAN.md -- Create migration SQL for schema changes, RLS policies, and indexes
- [x] 09-01-PLAN.md -- Create TypeScript script to fetch, transform, and generate CSV for Supabase import
- [x] 10-01-PLAN.md -- Update Exercise type and service functions for system exercises
- [x] 11-01-PLAN.md -- Add CSS styles and update ExercisePickerModal with sorting and badge
- [x] 12-01-PLAN.md -- Update exercise item layout to show category below name
- [x] 13-01-PLAN.md -- Remove graying from system exercises in exercise picker

**Success Criteria:**
- [x] User sees ~800 system exercises in exercise picker
- [x] User can still create custom exercises (marked with "Custom" badge)
- [x] User's custom exercises appear before system exercises
- [x] "Other" category available for exercises that don't fit existing categories
- [x] Existing user exercises still work after migration
- [x] System exercises display same color as user exercises in picker

## Progress

**Execution Order:**
Phases execute in numeric order: 8 -> 9 -> 10 -> 11 -> 12 -> 13

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Header Layout | v2.3 | 1/1 | Complete | 2026-01-18 |
| 2. Exercise Name Truncation | v2.3 | 1/1 | Complete | 2026-01-17 |
| 3. Remove Debug Logging | v2.4 | 1/1 | Complete | 2026-01-17 |
| 4. Workout Card Action Footer | v2.5 | 1/1 | Complete | 2026-01-18 |
| 5. use-gesture-setup | v2.6 | 1/1 | Complete | 2026-01-18 |
| 6. setrow-swipe-refactor | v2.6 | 1/1 | Complete | 2026-01-18 |
| 7. swipe-polish | v2.6 | 1/1 | Complete | 2026-01-19 |
| 8. Database Schema Migration | v2.7 | 1/1 | Complete | 2026-02-01 |
| 9. Data Import | v2.7 | 1/1 | Complete | 2026-02-01 |
| 10. Backend Updates | v2.7 | 1/1 | Complete | 2026-02-01 |
| 11. Frontend Updates | v2.7 | 1/1 | Complete | 2026-02-02 |
| 12. Exercise Picker Layout | v2.7 | 1/1 | Complete | 2026-02-02 |
| 13. System Exercise Color Fix | v2.7 | 1/1 | Complete | 2026-02-02 |
