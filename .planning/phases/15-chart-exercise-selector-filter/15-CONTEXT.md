# Phase 15: Chart Exercise Selector Filter - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Filter the exercise selection list in the "Add Chart" modal to only show exercises with logged session data. Users should only be able to create charts for exercises they have actually tracked.

</domain>

<decisions>
## Implementation Decisions

### Empty state design
- Minimal tone: "No exercise data yet" — just state the fact, no call-to-action
- Text only, no icon or illustration
- Message replaces the exercise list area when no exercises have data
- Keep existing "No chart configured" behavior on dashboard unchanged

### Exercise list format
- Alphabetical sort (A-Z by exercise name)
- Grouped by category (Chest, Back, Shoulders, etc. as section headers)
- No selection persistence — always resets on modal open

### Data refresh timing
- Filter recalculates on modal open (fresh query when Add Chart modal mounts)
- No real-time updates needed — captures any workouts logged since last visit

### Claude's Discretion
- Exact styling of empty state message to match existing modal patterns
- Category header styling within the list
- Query optimization approach

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches matching existing modal patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-chart-exercise-selector-filter*
*Context gathered: 2026-02-02*
