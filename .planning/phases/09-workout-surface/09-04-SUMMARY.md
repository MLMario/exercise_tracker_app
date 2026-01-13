---
phase: 09-workout-surface
plan: 04
subsystem: surfaces
tags: [preact, workout, swipe-gesture, touch-events, pointer-events]

# Dependency graph
requires:
  - phase: 09-03
    provides: SetRow component, WorkoutExerciseCard component
provides:
  - Swipe-to-delete gesture handling for set rows
  - SwipeData interface for tracking swipe state
  - Pointer and touch event handlers
  - Swipe state coordination across all set rows
affects: [09-05]

# Tech tracking
tech-stack:
  added: []
  patterns: [pointer-events, touch-events, useCallback-memoization, swipe-gesture-detection]

key-files:
  created: []
  modified:
    - src/surfaces/workout/SetRow.tsx
    - src/surfaces/workout/WorkoutSurface.tsx
    - src/surfaces/workout/WorkoutExerciseCard.tsx

key-decisions:
  - "Swipe state tracked per-row with reveal/reset coordination at WorkoutSurface level"
  - "Only one set row can be revealed at a time (revealedSetKey pattern)"
  - "Delete button visibility controlled by isRevealed || isDragging states"
  - "Pointer events preferred over touch events for smoother drag tracking"
  - "useCallback used for resetSwipe to ensure stable reference in useEffect"

patterns-established:
  - "Swipe detection: horizontal delta > vertical delta && delta > 5px threshold"
  - "Swipe reveal threshold: -40px to reveal, snap to -70px"
  - "Swipe coordination: parent tracks revealedSetKey, children receive shouldResetSwipe"
  - "Touch prevention: touchAction: 'none' and userSelect: 'none' during drag"

issues-created: []

# Metrics
duration: ~12min
completed: 2026-01-13
---

# Phase 9: Workout Surface - Plan 04 Summary

**Swipe-to-delete gesture handling implemented for set rows with coordination across all rows.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-01-13
- **Completed:** 2026-01-13
- **Tasks:** 3/3
- **Files modified:** 3

## Accomplishments

- Added SwipeData interface for tracking swipe gesture state
- Implemented handleSwipeStart with pointer/touch event support
- Implemented handleSwipeMove with horizontal swipe detection
- Implemented handleSwipeEnd with threshold-based reveal/reset
- Added shouldResetSwipe and onSwipeStateChange props to SetRow
- Used useCallback for resetSwipe to ensure stable reference
- Added revealedSetKey state to WorkoutSurface for coordination
- Added handleSwipeCancel and handleSetSwipeStateChange handlers
- Updated handleDeleteSet to reset swipe state before deleting
- Updated WorkoutExerciseCard to pass swipe props to SetRow
- Added touch-action and user-select styles during drag
- Delete button visibility controlled by reveal state and drag state

## Task Commits

1. **Task 1: Add swipe state and handlers to SetRow** - `fc55a66`
2. **Task 2: Add swipe reset coordination to WorkoutSurface** - `5318553`
3. **Task 3: Polish swipe interactions** - `ac3e85f`

## Files Modified

- `src/surfaces/workout/SetRow.tsx` - Added swipe gesture handlers, SwipeData interface, refs
- `src/surfaces/workout/WorkoutSurface.tsx` - Added revealedSetKey state, swipe coordination handlers
- `src/surfaces/workout/WorkoutExerciseCard.tsx` - Added swipe props, pass to SetRow

## Component Structure

**SetRow Swipe Props (new):**
- shouldResetSwipe?: boolean - Whether this row should reset its swipe state
- onSwipeStateChange?: (isRevealed: boolean) => void - Callback when swipe state changes

**SwipeData Interface:**
- startX: number - Initial touch/pointer X position
- startY: number - Initial touch/pointer Y position
- currentX: number - Current touch/pointer X position
- isDragging: boolean - Whether actively dragging
- pointerId: number | null - Pointer ID for capture

**WorkoutSurface Swipe State:**
- revealedSetKey: string | null - Key of currently revealed set row (format: "exerciseIndex-setIndex")

**WorkoutExerciseCard Swipe Props (new):**
- revealedSetKey: string | null - Key of the currently revealed set row
- onSetSwipeStateChange: (setIndex: number, isRevealed: boolean) => void - Callback for swipe state changes

## Swipe Gesture Behavior

1. **Start**: On pointerdown/touchstart, capture initial position
2. **Move**: Detect horizontal vs vertical movement, apply transform when dragging left
3. **End**: If dragged past -40px threshold, snap to -70px (revealed); otherwise reset
4. **Coordination**: Only one row revealed at a time; clicking elsewhere closes revealed row
5. **Delete**: Clicking delete button while revealed deletes the set and resets swipe

## Verification Checklist

- [x] `npm run build` succeeds without errors
- [x] `npx tsc --noEmit` passes
- [x] Swiping set row left reveals delete button
- [x] Delete button click removes the set (handled by onDelete prop)
- [x] Tapping elsewhere closes revealed row (via handleSwipeCancel)
- [x] Only one row can be revealed at a time (revealedSetKey pattern)
- [x] Vertical scrolling doesn't trigger swipe (horizontal delta check)
- [x] Quick taps don't accidentally trigger swipe (5px minimum threshold)

## Deviations from Plan

None. All tasks completed as specified.

## Issues Encountered

None.

## Next Step

Plan 09-05: Additional workout surface functionality (to be defined).

---
*Phase: 09-workout-surface*
*Plan: 04*
*Completed: 2026-01-13*
