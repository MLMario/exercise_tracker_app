# Phase 24: Workout Detail Surface - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Display full workout breakdown when user taps a workout card from the history list. Shows exercise blocks with set completion status. Entry point is from Phase 23 history list.

</domain>

<decisions>
## Implementation Decisions

### Exercise block layout
- Card-based layout: each exercise in its own bordered card with background
- Exercise name only in card header (no set count or completion ratio)
- Use exercise color from library as accent on the card
- Color accent placement: Claude's discretion based on existing app patterns

### Set grid display
- Horizontal rows format: each set as a row within the exercise card
- Format: "1. 135 lbs × 10" — set number prefix, weight first, multiplication sign, reps
- Completion status icon at end of row

### Completion indicators
- Completed sets: green checkmark icon
- Skipped sets: red X icon
- No additional row treatment for skipped sets (icon only, row otherwise normal)
- Icon prominence: clear and medium-sized, easily visible but not oversized

### Header & navigation
- Date format: medium date ("Feb 5, 2026")
- Header content: template name and date only (minimal, no summary stats)
- Header scrolls with content (inline, not sticky)
- Back button: icon only (← arrow), no text label

### Claude's Discretion
- Exercise card color accent placement (left border vs header background)
- Exact spacing and padding within exercise cards
- Typography sizing for set rows
- Empty state if workout has no exercises (edge case)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches matching existing app patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 24-workout-detail-surface*
*Context gathered: 2026-02-05*
