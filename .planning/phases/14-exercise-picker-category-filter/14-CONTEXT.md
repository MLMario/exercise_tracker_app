# Phase 14: Exercise Picker Category Filter - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a category dropdown filter to the Exercise Picker Modal that works alongside the existing search input. Users can filter exercises by category, and filters combine with search for refined results. The dropdown appears above the search input.

</domain>

<decisions>
## Implementation Decisions

### Dropdown styling
- Custom styled dropdown (not native select)
- Overlay menu when opened — floats over content, doesn't push
- Visual style matches the search input (same border radius, height, colors)
- Simple text list for menu items — plain text with hover/selection highlight, no color indicators

### Layout positioning
- Dropdown above search input (stacked vertically, separate rows)
- Partial width, left-aligned — dropdown is narrower than full modal width
- Standard spacing between dropdown and search input
- No label above dropdown — "All Categories" placeholder is self-explanatory

### Filter behavior
- Instant filter — list updates immediately when category is selected
- Always resets to "All Categories" when modal reopens (no persistence)
- Clearing search keeps category filter active (independent filters)
- No additional visual indicator for active filters — dropdown text is sufficient

### Empty state
- Simple text message: "No exercises found"
- No action button — user adjusts filters directly via dropdown/search
- No exercise count displayed as filters change

### Claude's Discretion
- Exact dropdown animation/transition
- Specific dropdown width (relative to modal)
- Exact spacing values to match app patterns
- Keyboard navigation within dropdown

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-exercise-picker-category-filter*
*Context gathered: 2026-02-02*
