# Requirements: Exercise Tracker App

**Defined:** 2026-02-05
**Core Value:** Simple, effective workout tracking with clean visual feedback on progress

## v4.0 Requirements

Requirements for Exercise History milestone. Each maps to roadmap phases.

### Navigation

- [x] **NAV-01**: User can access "Exercise History" from Settings menu
- [ ] **NAV-02**: User can navigate back from workout detail to history list
- [ ] **NAV-03**: User can navigate back from history list to settings menu

### History List

- [ ] **HIST-01**: User sees summary bar with total workouts count, total sets, and total volume (lbs)
- [ ] **HIST-02**: User sees vertical timeline with date markers and connected dots
- [ ] **HIST-03**: User sees compact workout cards showing template name, date, and exercise preview
- [ ] **HIST-04**: User sees badges on cards showing exercise count, completed sets, and total lbs
- [ ] **HIST-05**: User sees last 7 workouts on initial load
- [ ] **HIST-06**: User can click "Load More" to fetch additional workouts
- [ ] **HIST-07**: User sees empty state message when no workout history exists

### Workout Detail

- [ ] **DETAIL-01**: User sees workout header with template name and date
- [ ] **DETAIL-02**: User sees exercise blocks with exercise name headers
- [ ] **DETAIL-03**: User sees set grid per exercise showing: Set #, Weight (lbs), Reps, Completion status
- [ ] **DETAIL-04**: User sees visual distinction between completed and skipped sets (checkmark vs X)

## v4.1+ Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhancements

- **ENH-01**: Date grouping headers ("This Week", "January 2026")
- **ENH-02**: Workout duration display (requires ended_at schema column)
- **ENH-03**: PR badges on exercises with personal records
- **ENH-04**: Filter history by date range
- **ENH-05**: Filter history by template
- **ENH-06**: Sort options beyond chronological

### Management

- **MGMT-01**: Delete workout from history with confirmation
- **MGMT-02**: Edit workout notes/comments

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Inline workout editing | History is a record; editing creates confusion about what actually happened |
| Social sharing | Scope creep; social features require significant infrastructure |
| Charts in history view | Duplicates existing Charts surface; history is for browsing logs |
| Swipe actions on cards | Single tap to view details is sufficient |
| Expandable cards (inline) | User requested separate surface for details instead |
| Workout notes/comments | Schema doesn't support; defer to future |
| Photo attachments | Storage costs, bandwidth, privacy concerns |
| Real-time sync | Out of scope; requires websockets |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 22 | Complete |
| NAV-02 | Phase 24 | Pending |
| NAV-03 | Phase 23 | Pending |
| HIST-01 | Phase 23 | Pending |
| HIST-02 | Phase 23 | Pending |
| HIST-03 | Phase 23 | Pending |
| HIST-04 | Phase 23 | Pending |
| HIST-05 | Phase 23 | Pending |
| HIST-06 | Phase 23 | Pending |
| HIST-07 | Phase 23 | Pending |
| DETAIL-01 | Phase 24 | Pending |
| DETAIL-02 | Phase 24 | Pending |
| DETAIL-03 | Phase 24 | Pending |
| DETAIL-04 | Phase 24 | Pending |

**Coverage:**
- v4.0 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-05 after roadmap creation*
