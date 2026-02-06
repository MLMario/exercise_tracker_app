# Phase 23: History List Surface - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Display workout history as a browsable timeline with summary stats, workout cards, and pagination. Users can view past workouts and navigate to detail view. Workout detail view is built in Phase 24.

</domain>

<decisions>
## Implementation Decisions

### Timeline layout
- Continuous vertical line running down the left side
- Simple filled circles as timeline dots at each workout
- Date group headers separate workouts by day (e.g., "Feb 5", "Feb 4")
- Timeline positioned along left margin, cards to the right

### Card content & density
- Show first 2-3 exercise names as preview (e.g., "Bench Press, Squat, +2 more")
- Badges (exercise count, sets, volume) in horizontal row at card bottom
- Subtle container style — light background/border, minimal visual weight
- Absolute date format without year (e.g., "Feb 5")

### Summary bar design
- Compact inline stats row, minimal space usage
- Fixed at top — stays visible while scrolling through workouts
- Abbreviated volume format for large numbers (e.g., "45.2k lbs")
- Three stats (workouts, sets, volume) evenly spaced

### Loading & empty states
- Load More as centered link below last card, transparent pill design
- Empty state: neutral/informative text only ("No workout history yet")

### Claude's Discretion
- Loading indicator style when fetching more workouts
- Exact spacing and typography
- Timeline dot size and line thickness
- Card tap animation/feedback

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

*Phase: 23-history-list-surface*
*Context gathered: 2026-02-05*
