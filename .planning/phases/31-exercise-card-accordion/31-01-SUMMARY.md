---
phase: 31-exercise-card-accordion
plan: 01
subsystem: ui
tags: [preact, accordion, progress-ring, css-transitions, workout]

# Dependency graph
requires:
  - phase: 09-workout-surface
    provides: WorkoutExerciseCard component, SetRow, RestTimerBar
provides:
  - Accordion-style WorkoutExerciseCard with progress ring
  - Collapsible card body with smooth max-height transition
  - ~70% vertical space savings in collapsed state
affects: [workout-surface, mobile-ux]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Accordion pattern with useState for expand/collapse"
    - "SVG progress ring with stroke-dashoffset animation"
    - "CSS max-height transition for collapsible content"

key-files:
  created: []
  modified:
    - apps/web/src/surfaces/workout/WorkoutExerciseCard.tsx
    - apps/web/css/styles.css

key-decisions:
  - "Cards start collapsed by default for space efficiency"
  - "Multiple cards can be expanded simultaneously (independent state)"
  - "Category badge removed from header per design requirements"
  - "Progress ring uses 40x40 SVG with radius 16, stroke-width 3"

patterns-established:
  - "Accordion pattern: useState(false) + toggleExpanded handler"
  - "Action button stopPropagation to prevent parent toggle"

issues-created: []

# Metrics
duration: 7min
completed: 2026-01-17
---

# Phase 31 Plan 01: Exercise Card Accordion Summary

**Accordion-style WorkoutExerciseCard with progress ring showing set completion, collapsible body for ~70% space savings**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-17T06:52:00Z
- **Completed:** 2026-01-17T06:59:19Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 2

## Accomplishments

- Refactored WorkoutExerciseCard to accordion pattern with collapsed/expanded states
- Added progress ring SVG showing completed/total sets with animated fill
- Progress ring turns green and shows "Complete" label when all sets done
- Header actions (Add Set, Remove) work without triggering expand/collapse
- Smooth max-height transition (0 → 600px) for collapsible body
- Timer only visible when card is expanded
- Added CSS color variables (--color-bg-elevated, --color-border-dim)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add accordion state and progress ring** - `1b9a7bd` (feat)
2. **Task 2: Add accordion CSS styles** - `b42e33a` (feat)
3. **Task 3: Human verification** - checkpoint approved

**Plan metadata:** (this commit)

## Files Created/Modified

- `apps/web/src/surfaces/workout/WorkoutExerciseCard.tsx` - Accordion layout with progress ring, useState for expand/collapse
- `apps/web/css/styles.css` - New accordion styles, progress ring, collapsible body, updated set table grid

## Decisions Made

- Cards start collapsed by default for maximum space efficiency
- Multiple cards can be expanded simultaneously (independent state per card)
- Category badge removed from header per mockup design requirements
- Progress ring dimensions: 40x40 SVG, radius 16, circumference ~100.53
- Set table grid adjusted to 32px/1fr/1fr/36px for tighter layout

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Phase 31 complete (single phase milestone)
- Accordion UI matches mockup design
- ~70% vertical space savings achieved in collapsed state
- Ready for milestone completion

---
*Phase: 31-exercise-card-accordion*
*Completed: 2026-01-17*
