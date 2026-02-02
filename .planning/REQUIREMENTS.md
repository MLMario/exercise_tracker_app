# Requirements: Exercise Tracker App

**Defined:** 2026-02-01
**Core Value:** Simple, effective workout tracking with clean visual feedback on progress

## v1 Requirements

Requirements for v2.7 Pre-Created Exercise Library milestone. Each maps to roadmap phases.

### Database Schema

- [x] **SCHEMA-01**: exercises.user_id column allows NULL values
- [x] **SCHEMA-02**: is_system boolean column added with default false
- [x] **SCHEMA-03**: instructions text[] column added
- [x] **SCHEMA-04**: level column added with CHECK constraint (beginner/intermediate/expert)
- [x] **SCHEMA-05**: force column added with CHECK constraint (push/pull/static)
- [x] **SCHEMA-06**: mechanic column added with CHECK constraint (compound/isolation)
- [x] **SCHEMA-07**: category CHECK constraint updated to include 'Other'
- [x] **SCHEMA-08**: Partial index on is_system for efficient lookup
- [x] **SCHEMA-09**: Index on user_id including NULL values

### RLS Policies

- [x] **RLS-01**: SELECT policy allows user's own exercises + all system exercises
- [x] **RLS-02**: INSERT policy restricts to user's own non-system exercises
- [x] **RLS-03**: UPDATE policy restricts to user's own non-system exercises
- [x] **RLS-04**: DELETE policy restricts to user's own non-system exercises
- [x] **RLS-05**: Uses (SELECT auth.uid()) optimization for performance

### Data Import

- [x] **DATA-01**: Fetch exercises.json from free-exercise-db GitHub repo
- [x] **DATA-02**: Map primaryMuscles to app categories (Chest/Back/Shoulders/Legs/Arms/Core/Other)
- [x] **DATA-03**: Generate CSV file with all columns for Supabase import
- [x] **DATA-04**: All imported exercises have is_system=true and user_id=NULL

### Backend

- [x] **BACK-01**: Exercise type updated with nullable user_id and new fields
- [x] **BACK-02**: getExercises returns both user and system exercises (RLS handles filtering)
- [x] **BACK-03**: createExercise sets is_system=false and current user_id

### Frontend

- [x] **UI-01**: "Custom" badge displayed on user-created exercises in picker
- [x] **UI-02**: Exercise list sorted: user exercises first, then system, both alphabetical
- [x] **UI-03**: "Other" category available when creating custom exercises

### Layout

- [x] **LAYOUT-01**: Category text appears below exercise name in picker (not inline)

### Color

- [x] **COLOR-01**: System exercises display same color as user exercises in picker

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
| SCHEMA-01 | Phase 8 | Complete |
| SCHEMA-02 | Phase 8 | Complete |
| SCHEMA-03 | Phase 8 | Complete |
| SCHEMA-04 | Phase 8 | Complete |
| SCHEMA-05 | Phase 8 | Complete |
| SCHEMA-06 | Phase 8 | Complete |
| SCHEMA-07 | Phase 8 | Complete |
| SCHEMA-08 | Phase 8 | Complete |
| SCHEMA-09 | Phase 8 | Complete |
| RLS-01 | Phase 8 | Complete |
| RLS-02 | Phase 8 | Complete |
| RLS-03 | Phase 8 | Complete |
| RLS-04 | Phase 8 | Complete |
| RLS-05 | Phase 8 | Complete |
| DATA-01 | Phase 9 | Complete |
| DATA-02 | Phase 9 | Complete |
| DATA-03 | Phase 9 | Complete |
| DATA-04 | Phase 9 | Complete |
| BACK-01 | Phase 10 | Complete |
| BACK-02 | Phase 10 | Complete |
| BACK-03 | Phase 10 | Complete |
| UI-01 | Phase 11 | Complete |
| UI-02 | Phase 11 | Complete |
| UI-03 | Phase 11 | Complete |
| LAYOUT-01 | Phase 12 | Complete |
| COLOR-01 | Phase 13 | Complete |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-02 after Phase 13 completion*
