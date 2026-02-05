# Phase 22: History Navigation + Service - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Add "Workout History" menu item to Settings panel with backend service support for fetching paginated workout history. Navigation state extended to support history views. Actual list UI and detail view are separate phases (23, 24).

</domain>

<decisions>
## Implementation Decisions

### Menu placement
- Position: After "Manage Exercises" in Settings menu (related features grouped)
- Icon: Calendar icon
- Label: "Workout History"
- No subtitle text — clean, minimal

### Service layer design
- Three separate service functions:
  1. `getWorkoutLogsPaginated(offset, limit)` — Returns summary info per workout for list view
  2. `getWorkoutLogDetail(workoutId)` — Returns full set-by-set details (called only when user taps a card)
  3. `getWorkoutSummaryStats()` — Returns all-time totals (workout count, total sets, total volume)
- Page size: 7 workouts per page
- Sort order: Newest first (most recent at top)
- Summary info per workout: template name, workout date (date only, no time), exercise count, completed sets count, total volume (lbs)
- No ad-hoc workout handling needed — all workouts come from templates

### Navigation behavior
- Panel transition: Match existing Settings sub-view pattern
- Header title: "Workout History"
- Back button: Icon only (arrow/chevron)
- Settings scroll position: Reset to top when returning from history
- Phase 22 shows placeholder view ("History view coming soon")
- PanelView states: Separate states for list and detail views
  - List view: Claude's discretion on naming based on existing patterns
  - Detail view: Separate PanelView state (e.g., 'history-detail')

### Claude's Discretion
- Exact PanelView type name (e.g., 'history' vs 'workout-history')
- Placeholder view styling
- Calendar icon variant (outline vs filled)
- Service function return type structures

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches that match existing app patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-history-navigation-service*
*Context gathered: 2026-02-05*
