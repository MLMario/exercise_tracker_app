# Requirements: Exercise Tracker App

**Defined:** 2026-02-01
**Core Value:** Simple, effective workout tracking with clean visual feedback on progress

## v1 Requirements

Requirements for v2.7 Pre-Created Exercise Library milestone. Each maps to roadmap phases.

### Database Schema

- [ ] **SCHEMA-01**: exercises.user_id column allows NULL values
- [ ] **SCHEMA-02**: is_system boolean column added with default false
- [ ] **SCHEMA-03**: instructions text[] column added
- [ ] **SCHEMA-04**: level column added with CHECK constraint (beginner/intermediate/expert)
- [ ] **SCHEMA-05**: force column added with CHECK constraint (push/pull/static)
- [ ] **SCHEMA-06**: mechanic column added with CHECK constraint (compound/isolation)
- [ ] **SCHEMA-07**: category CHECK constraint updated to include 'Other'
- [ ] **SCHEMA-08**: Partial index on is_system for efficient lookup
- [ ] **SCHEMA-09**: Index on user_id including NULL values

### RLS Policies

- [ ] **RLS-01**: SELECT policy allows user's own exercises + all system exercises
- [ ] **RLS-02**: INSERT policy restricts to user's own non-system exercises
- [ ] **RLS-03**: UPDATE policy restricts to user's own non-system exercises
- [ ] **RLS-04**: DELETE policy restricts to user's own non-system exercises
- [ ] **RLS-05**: Uses (SELECT auth.uid()) optimization for performance

### Data Import

- [ ] **DATA-01**: Fetch exercises.json from free-exercise-db GitHub repo
- [ ] **DATA-02**: Map primaryMuscles to app categories (Chest/Back/Shoulders/Legs/Arms/Core/Other)
- [ ] **DATA-03**: Generate CSV file with all columns for Supabase import
- [ ] **DATA-04**: All imported exercises have is_system=true and user_id=NULL

### Backend

- [ ] **BACK-01**: Exercise type updated with nullable user_id and new fields
- [ ] **BACK-02**: getExercises returns both user and system exercises (RLS handles filtering)
- [ ] **BACK-03**: createExercise sets is_system=false and current user_id

### Frontend

- [ ] **UI-01**: "Custom" badge displayed on user-created exercises in picker
- [ ] **UI-02**: Exercise list sorted: user exercises first, then system, both alphabetical
- [ ] **UI-03**: "Other" category available when creating custom exercises

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Exercise Data

- **EDATA-01**: Display exercise instructions in picker or detail view
- **EDATA-02**: Filter exercises by difficulty level
- **EDATA-03**: Display force type (push/pull/static) in UI
- **EDATA-04**: Display mechanic type (compound/isolation) in UI

### Exercise Library UX

- **LIB-01**: User can favorite system exercises
- **LIB-02**: User can hide system exercises they don't want to see
- **LIB-03**: Filter exercises by equipment type
- **LIB-04**: Exercise images/GIFs from free-exercise-db

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Equipment filtering in picker | Future enhancement, not core to v1 |
| Exercise images/GIFs | Storage/bandwidth costs, defer |
| Secondary muscle group display | Complexity, defer |
| Changing picker UX beyond sorting | Keep current behavior, just add more exercises |
| Displaying instructions/level/force/mechanic | Stored for future use only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHEMA-01 | Phase 8 | Pending |
| SCHEMA-02 | Phase 8 | Pending |
| SCHEMA-03 | Phase 8 | Pending |
| SCHEMA-04 | Phase 8 | Pending |
| SCHEMA-05 | Phase 8 | Pending |
| SCHEMA-06 | Phase 8 | Pending |
| SCHEMA-07 | Phase 8 | Pending |
| SCHEMA-08 | Phase 8 | Pending |
| SCHEMA-09 | Phase 8 | Pending |
| RLS-01 | Phase 8 | Pending |
| RLS-02 | Phase 8 | Pending |
| RLS-03 | Phase 8 | Pending |
| RLS-04 | Phase 8 | Pending |
| RLS-05 | Phase 8 | Pending |
| DATA-01 | Phase 9 | Pending |
| DATA-02 | Phase 9 | Pending |
| DATA-03 | Phase 9 | Pending |
| DATA-04 | Phase 9 | Pending |
| BACK-01 | Phase 10 | Pending |
| BACK-02 | Phase 10 | Pending |
| BACK-03 | Phase 10 | Pending |
| UI-01 | Phase 11 | Pending |
| UI-02 | Phase 11 | Pending |
| UI-03 | Phase 11 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-01 after initial definition*
