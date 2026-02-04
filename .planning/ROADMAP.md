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
- [v2.7 Pre-Created Exercise Library](milestones/v2.7-ROADMAP.md) (Phases 8-13) -- SHIPPED 2026-02-02
- [v2.8 Enhanced Filtering Capabilities](milestones/v2.8-ROADMAP.md) (Phases 14-15) -- SHIPPED 2026-02-02
- [v3.0 Settings & Exercise Management](milestones/v3.0-ROADMAP.md) (Phases 16-21) -- SHIPPED 2026-02-04

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

<details>
<summary>v2.7 Pre-Created Exercise Library (Phases 8-13) -- SHIPPED 2026-02-02</summary>

- [x] Phase 8: Database Schema Migration (1/1 plans) -- completed 2026-02-01
- [x] Phase 9: Data Import (1/1 plans) -- completed 2026-02-01
- [x] Phase 10: Backend Updates (1/1 plans) -- completed 2026-02-01
- [x] Phase 11: Frontend Updates (1/1 plans) -- completed 2026-02-02
- [x] Phase 12: Exercise Picker Layout (1/1 plans) -- completed 2026-02-02
- [x] Phase 13: System Exercise Color Fix (1/1 plans) -- completed 2026-02-02

</details>

<details>
<summary>v2.8 Enhanced Filtering Capabilities (Phases 14-15) -- SHIPPED 2026-02-02</summary>

- [x] Phase 14: Exercise Picker Category Filter (1/1 plans) -- completed 2026-02-02
- [x] Phase 15: Chart Exercise Selector Filter (1/1 plans) -- completed 2026-02-02

</details>

## v3.0 Settings & Exercise Management (In Progress)

**Milestone Goal:** Add a Settings surface with exercise CRUD management, enabling users to manage custom exercises outside the template editor workflow.

- [x] **Phase 16: Service Layer** - Backend update function and RLS policy for exercise editing -- completed 2026-02-03
- [x] **Phase 17: Settings Surface Shell** - Settings surface with menu, gear icon, navigation, logout relocation -- completed 2026-02-03
- [x] **Phase 18: Exercise List** - My Exercises view with exercise list and empty state -- completed 2026-02-03
- [x] **Phase 19: Exercise Edit** - Inline accordion editing for exercise name and category -- completed 2026-02-03
- [x] **Phase 20: Exercise Delete** - Delete with confirmation modal and dependency warnings -- completed 2026-02-04
- [x] **Phase 21: Exercise Create** - Create exercise from My Exercises view -- completed 2026-02-04

### Phase 16: Service Layer
**Goal**: Backend infrastructure exists for updating exercises
**Depends on**: Nothing (first phase of milestone)
**Requirements**: BACK-01, BACK-02
**Success Criteria** (what must be TRUE):
  1. Calling `updateExercise` with a valid exercise ID, name, and category persists the changes to the database
  2. A user cannot update exercises created by other users or system exercises (RLS enforced)
**Plans**: 1 plan
Plans:
- [x] 16-01-PLAN.md -- Add service types and implement updateExercise, getUserExercises, getExerciseDependencies

### Phase 17: Settings Surface Shell
**Goal**: Users can navigate to a Settings surface and back, with logout relocated from dashboard
**Depends on**: Phase 16
**Requirements**: SETT-01, SETT-02, SETT-03, SETT-04, SETT-05
**Success Criteria** (what must be TRUE):
  1. User can tap gear icon in dashboard header (far right) to open Settings
  2. Settings menu shows "My Exercises" as a tappable item and a Log Out button
  3. User can navigate back from Settings to Dashboard
  4. Logout button no longer appears in dashboard header (only in Settings menu)
**Plans**: 1 plan
Plans:
- [x] 17-01-PLAN.md -- Create settings panel shell with gear icon, slide-in panel, menu, and sub-navigation

### Phase 18: Exercise List
**Goal**: Users can view their custom exercises in a dedicated management view
**Depends on**: Phase 17
**Requirements**: LIST-01, LIST-04, LIST-05
**Success Criteria** (what must be TRUE):
  1. My Exercises view shows only user-created exercises (system exercises excluded), sorted alphabetically
  2. When no custom exercises exist, an empty state message with a prompt to create is displayed
  3. User can navigate back from My Exercises to the Settings menu
**Plans**: 1 plan
Plans:
- [x] 18-01-PLAN.md -- Create MyExercisesList component with data fetching, list rendering, empty state, and SettingsPanel integration

### Phase 19: Exercise Edit
**Goal**: Users can edit the name and category of their custom exercises inline
**Depends on**: Phase 18
**Requirements**: CRUD-02, CRUD-03, CRUD-04, CRUD-05, CRUD-06
**Success Criteria** (what must be TRUE):
  1. User can expand an exercise row to reveal an inline edit form (accordion-style)
  2. User can modify exercise name and category in the expanded form
  3. User can save edits via an explicit Save button and see changes reflected in the list
  4. User can cancel edits via an explicit Cancel button and see original values restored
**Plans**: 1 plan
Plans:
- [x] 19-01-PLAN.md -- Add accordion edit form with pencil trigger, name/category fields, save/cancel, validation errors, success flash

### Phase 20: Exercise Delete
**Goal**: Users can delete custom exercises with clear warnings about downstream effects
**Depends on**: Phase 19
**Requirements**: CRUD-07, CRUD-08, CRUD-09, CRUD-10
**Success Criteria** (what must be TRUE):
  1. User can initiate delete from the expanded exercise row
  2. A confirmation modal appears before deletion occurs
  3. If the exercise is used in templates, workout logs, or charts, the confirmation modal displays a dependency warning
  4. Confirmation modal uses specific labels ("Delete Exercise" / "Keep Exercise")
**Plans**: 3 plans
Plans:
- [x] 20-01-PLAN.md -- Add cascade delete migration, trash icon button, confirmation modal with dependency warning
- [x] 20-02-PLAN.md -- Gap closure: chart refresh on exercise delete, modal button sizing fix
- [x] 20-03-PLAN.md -- Gap closure: refresh templates on exercise delete, filter deleted exercises from template data

### Phase 21: Exercise Create
**Goal**: Users can create new custom exercises from the My Exercises management view
**Depends on**: Phase 18
**Requirements**: CRUD-01
**Success Criteria** (what must be TRUE):
  1. User can trigger the create exercise modal from the My Exercises view
  2. After creating an exercise, it appears in the My Exercises list without manual refresh
**Plans**: 1 plan
Plans:
- [x] 21-01-PLAN.md -- Add "+ Create" header button, simplified create modal with name/category fields, empty state wiring

## Progress

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
| 14. Exercise Picker Category Filter | v2.8 | 1/1 | Complete | 2026-02-02 |
| 15. Chart Exercise Selector Filter | v2.8 | 1/1 | Complete | 2026-02-02 |
| 16. Service Layer | v3.0 | 1/1 | Complete | 2026-02-03 |
| 17. Settings Surface Shell | v3.0 | 1/1 | Complete | 2026-02-03 |
| 18. Exercise List | v3.0 | 1/1 | Complete | 2026-02-03 |
| 19. Exercise Edit | v3.0 | 1/1 | Complete | 2026-02-03 |
| 20. Exercise Delete | v3.0 | 3/3 | Complete | 2026-02-04 |
| 21. Exercise Create | v3.0 | 1/1 | Complete | 2026-02-04 |
