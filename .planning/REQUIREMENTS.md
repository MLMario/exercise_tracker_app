# Requirements: Exercise Tracker App v3.0

**Defined:** 2026-02-03
**Core Value:** Simple, effective workout tracking with clean visual feedback on progress

## v1 Requirements

Requirements for v3.0 Settings & Exercise Management milestone.

### Settings Surface

- [x] **SETT-01**: User can tap gear icon (far right of dashboard header) to navigate to Settings
- [x] **SETT-02**: Settings menu displays "My Exercises" as a tappable menu item
- [x] **SETT-03**: Settings menu displays a Log Out button
- [x] **SETT-04**: User can navigate back from Settings to Dashboard
- [x] **SETT-05**: Logout button removed from dashboard header (relocated to Settings menu)

### Exercise List

- [ ] **LIST-01**: My Exercises view shows only user-created exercises (system exercises excluded)
- [ ] **LIST-02**: User can search exercises by name in My Exercises view
- [ ] **LIST-03**: User can filter exercises by category via dropdown in My Exercises view
- [ ] **LIST-04**: Empty state displays message with prompt to create when no custom exercises exist
- [ ] **LIST-05**: User can navigate back from My Exercises to Settings menu

### Exercise Create

- [ ] **CRUD-01**: User can create a new exercise from My Exercises view using existing create modal

### Exercise Edit

- [ ] **CRUD-02**: User can expand an exercise row to reveal an inline edit form (accordion-style)
- [ ] **CRUD-03**: User can edit exercise name via text input in the expanded row
- [ ] **CRUD-04**: User can edit exercise category via dropdown in the expanded row
- [ ] **CRUD-05**: User can save edits (explicit Save button, no auto-save)
- [ ] **CRUD-06**: User can cancel edits (explicit Cancel button, discards changes)

### Exercise Delete

- [ ] **CRUD-07**: User can delete an exercise from the expanded row
- [ ] **CRUD-08**: Delete shows a confirmation modal before removing the exercise
- [ ] **CRUD-09**: Confirmation modal displays dependency warning if exercise is used in templates, workout logs, or charts
- [ ] **CRUD-10**: Confirmation modal uses specific button labels ("Delete Exercise" / "Keep Exercise")

### Backend

- [x] **BACK-01**: updateExercise service function exists to update exercise name and category
- [x] **BACK-02**: RLS UPDATE policy on exercises table allows users to update only their own non-system exercises

## v2 Requirements

Deferred to future release.

### Settings Enhancements

- **SETT-V2-01**: Profile settings menu item (functional)
- **SETT-V2-02**: Preferences settings menu item (functional)
- **SETT-V2-03**: Exercise count badge on My Exercises menu item

### Exercise Management Enhancements

- **LIST-V2-01**: Sort options for exercise list (A-Z, Z-A, by category, by date)
- **LIST-V2-02**: Bulk select and delete multiple exercises
- **LIST-V2-03**: Exercise usage indicator (shows where each exercise is used)
- **CRUD-V2-01**: Undo-after-delete toast notification

## Out of Scope

| Feature | Reason |
|---------|--------|
| Profile and Preferences "Coming Soon" placeholders | User chose to exclude — keep menu clean |
| System exercises in My Exercises view | 873 system exercises would overwhelm; users can't edit them anyway |
| Complex exercise metadata editing (instructions, level, force, mechanic) | Simplicity — name + category are the two user-visible fields |
| Exercise images/GIFs in management view | Storage/bandwidth costs, defer |
| Inline editing in list row (contentEditable) | Error-prone on mobile, inconsistent with explicit save pattern |
| Auto-save on edit | Inconsistent with app's explicit Save/Cancel pattern |
| Drag-to-reorder exercises | Sort order state complexity; alphabetical default is sufficient |
| Animated transitions on expand/slide | User chose table stakes only; can add polish later |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BACK-01 | Phase 16 | Complete |
| BACK-02 | Phase 16 | Complete |
| SETT-01 | Phase 17 | Complete |
| SETT-02 | Phase 17 | Complete |
| SETT-03 | Phase 17 | Complete |
| SETT-04 | Phase 17 | Complete |
| SETT-05 | Phase 17 | Complete |
| LIST-01 | Phase 18 | Pending |
| LIST-02 | Phase 18 | Pending |
| LIST-03 | Phase 18 | Pending |
| LIST-04 | Phase 18 | Pending |
| LIST-05 | Phase 18 | Pending |
| CRUD-02 | Phase 19 | Pending |
| CRUD-03 | Phase 19 | Pending |
| CRUD-04 | Phase 19 | Pending |
| CRUD-05 | Phase 19 | Pending |
| CRUD-06 | Phase 19 | Pending |
| CRUD-07 | Phase 20 | Pending |
| CRUD-08 | Phase 20 | Pending |
| CRUD-09 | Phase 20 | Pending |
| CRUD-10 | Phase 20 | Pending |
| CRUD-01 | Phase 21 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after Phase 17 completion*
