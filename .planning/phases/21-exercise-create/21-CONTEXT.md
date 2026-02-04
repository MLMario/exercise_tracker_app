# Phase 21: Exercise Create - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Create new custom exercises from the My Exercises management view. Users can trigger creation via a header button or the empty state CTA, fill out a simplified modal, and see the new exercise appear in the list. Reusing the existing exercise picker modal is explicitly out of scope — a new simplified modal is needed.

</domain>

<decisions>
## Implementation Decisions

### Create trigger placement
- Header `+ Create` button matching the existing templates section style (`btn btn-primary btn-sm`)
- Button text: "+ Create" (exact match with templates)
- Position: far right of the My Exercises header (back arrow left, title center/left, button right)
- Always visible regardless of whether exercises exist
- No special disabled state when modal is open — clicking again while modal is shown does nothing

### Simplified create modal
- New simplified modal, NOT the existing exercise picker modal
- Fields: exercise name input + category dropdown only
- Category dropdown: no default, placeholder "Select category" — user must choose
- Button labels: "Create Exercise" / "Cancel"
- Validation: Create button disabled until both name is filled and category is selected — no inline error messages

### Post-create behavior
- List stays at current scroll position (no auto-scroll to new exercise)
- No success flash or toast — modal closes, list updates, new row appearing is the confirmation
- New exercise appears collapsed (not auto-expanded into edit mode)
- Exact same modal used by both header button and empty state CTA

### Empty state integration
- Empty state's existing create button wired to open the same simplified create modal
- Empty state text and styling unchanged — just wire the button
- Simple swap transition: empty state disappears, list appears — no animation

### Claude's Discretion
- Modal sizing and spacing
- Input field styling details
- Category dropdown implementation approach
- Error handling for failed creates

</decisions>

<specifics>
## Specific Ideas

- "+ Create" button should be visually identical to the templates section create button — same Bootstrap classes (`btn btn-primary btn-sm`)
- Modal should feel lighter than the exercise picker modal — just the essentials

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-exercise-create*
*Context gathered: 2026-02-04*
