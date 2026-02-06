# Project Milestones: Exercise Tracker App

## v4.0 Exercise History (Shipped: 2026-02-05)

**Delivered:** Added Exercise History section to Settings panel for browsing past workouts in a timeline format with summary statistics, compact workout cards, and detailed workout views.

**Phases completed:** 22-24 (4 plans total)

**Key accomplishments:**

- "Workout History" menu item accessible from Settings panel with Calendar icon
- Paginated history service functions with generic PaginatedResult<T> types
- History list surface with summary bar showing total workouts, sets, and volume
- Vertical timeline with date markers and compact workout cards with badges
- Workout detail view with exercise blocks, set grids, and completion status icons
- Template name display in workout detail header (UAT gap closure)

**Stats:**

- 8 code files modified
- ~998 lines added
- 3 phases, 4 plans
- 1 day from start to ship (2026-02-05)

**Git range:** `f191059` → `ba0ca50`

**What's next:** Exercise History complete. Ready for next milestone.

---

## v3.0 Settings & Exercise Management (Shipped: 2026-02-04)

**Delivered:** Added Settings surface with gear icon access, containing My Exercises management view for creating, editing, and deleting custom exercises outside the template editor workflow.

**Phases completed:** 16-21 (9 plans total)

**Key accomplishments:**

- Service layer with updateExercise, getUserExercises, getExerciseDependencies and typed validation errors
- Settings panel with gear icon trigger and slide-in animation from right
- My Exercises list displaying user-created exercises with empty state
- Inline accordion editing for exercise name and category with validation
- Delete with confirmation modal, dependency warnings, and ON DELETE CASCADE
- Create exercise modal from header button and empty state CTA

**Stats:**

- 56 files modified
- 7,364 lines added
- 6 phases, 9 plans
- 2 days from start to ship (2026-02-03 -> 2026-02-04)

**Git range:** `fd2819f` -> `c90e109`

**What's next:** Exercise management complete. Ready for next feature work.

---

## v2.8 Enhanced Filtering Capabilities (Shipped: 2026-02-02)

**Delivered:** Added category dropdown filter to Exercise Picker and filtered Chart Exercise Selector to only show exercises with logged workout data.

**Phases completed:** 14-15 (2 plans total)

**Key accomplishments:**

- Category dropdown filter in Exercise Picker with 7 categories above search input
- Combined filtering: category and name search work together or independently
- Reusable `useClickOutside` hook for dropdown dismissal with mobile support
- `getExercisesWithLoggedData` service function using inner join through workout_log_exercises
- Chart exercise selector shows "No exercise data yet" empty state when no logged data
- Category-grouped exercise display with native optgroup headers in chart modal

**Stats:**

- 8 files modified
- 2 phases, 2 plans, 5 tasks
- Same day completion (2026-02-02)

**Git range:** `761d606` → `d0e8189`

**What's next:** Filtering capabilities complete. Ready for next feature work.

---

## v2.7 Pre-Created Exercise Library (Shipped: 2026-02-02)

**Delivered:** Added 873 pre-created exercises from free-exercise-db that users can pick from when adding exercises, with database schema changes, RLS policies, and visual distinction in the picker.

**Phases completed:** 8-13 (6 plans total)

**Key accomplishments:**

- Extended database schema with nullable user_id, is_system flag, and metadata columns (instructions, level, force, mechanic)
- Imported 873 exercises mapped to 7 categories (Chest, Back, Shoulders, Legs, Arms, Core, Other)
- Updated RLS policies for shared read access to system exercises while protecting user data
- Exercise picker displays user exercises first with green "CUSTOM" badge, then system exercises alphabetically
- Clean stacked layout with category below exercise name for improved visual hierarchy
- Unified text color for all exercises (removed muted styling from system exercises)

**Stats:**

- 44 files modified
- 6 phases, 6 plans, ~11 tasks
- 2 days from start to ship (2026-02-01 → 2026-02-02)

**Git range:** `77c7031` → `81b814e`

**What's next:** Exercise library complete. Ready for next feature work or v2 enhancements (instructions display, difficulty filtering, favorites).

---

## v2.6 Swipe Gesture Refactor (Shipped: 2026-01-19)

**Delivered:** Replaced manual swipe handlers with @use-gesture/react library, adding spring animations, velocity-based snap, and iOS-style rubberband effects.

**Phases completed:** 5-7 (3 plans total)

**Key accomplishments:**

- Installed @use-gesture/react with verified Preact compatibility via preact/compat aliasing
- Replaced ~115 lines of manual pointer handlers with ~45 lines using useDrag hook
- Added spring-like CSS transitions with overshoot effect using cubic-bezier curve
- Implemented velocity-based snap for fast left swipes
- Added iOS-style rubberband effect with 5:1 resistance past boundary
- Fixed delete button visibility during close gesture

**Stats:**

- 3 files modified (core changes: SetRow.tsx, vite.config.ts, styles.css)
- 3 phases, 3 plans, 11 tasks
- 2 days from start to ship

**Git range:** `21930ce` → `2a2b9e0`

**What's next:** Swipe gesture system complete. Ready for next feature work.

---

## v2.5 Exercise Card Design Modifications (Shipped: 2026-01-18)

**Delivered:** Moved exercise card action buttons to footer for cleaner header design.

**Phases completed:** 4 (1 plan total)

**Key accomplishments:**

- Moved action buttons to card-action-footer component
- Remove button always visible (no hover-reveal needed)
- Cleaner exercise card header (progress ring, name, chevron only)

**Stats:**

- 2 files modified
- 1 phase, 1 plan, 3 tasks
- Same day completion

**Git range:** `9a13902` → `635bbd4`

**What's next:** Exercise card design complete. Ready for gesture improvements.

---

## v2.4 Debug Cleanup (Shipped: 2026-01-17)

**Delivered:** Removed 39 DEBUG console.log statements from 4 files for production-ready codebase.

**Phases completed:** 3 (1 plan total)

**Key accomplishments:**

- Removed 13 debug statements from main.tsx (auth flow and recovery mode)
- Removed 9 debug statements from AuthSurface.tsx (initialization and rendering)
- Removed 8 debug statements from ChartCard.tsx (chart rendering)
- Removed 9 debug statements from DashboardSurface.tsx (data loading)

**Stats:**

- 4 files modified
- 1 phase, 1 plan, 3 tasks
- Same day completion

**Git range:** `111b1f9` → `95f088a`

**What's next:** Clean codebase ready for next feature work or polish.

---

## v2.3 Template Editor UI Cleanup (Shipped: 2026-01-17)

**Delivered:** Polished template editor header layout and exercise name truncation with tooltips.

**Phases completed:** 1-2 (2 plans total)

**Key accomplishments:**

- Template editor header displays Cancel/Title/Save in proper flexbox single-row layout
- Exercise names truncate with ellipsis when too long
- Truncated exercise names show full name in native browser tooltip on hover
- Matched dashboard-surface header pattern for visual consistency

**Stats:**

- 2 files modified (core changes)
- 2 phases, 2 plans, 2 tasks
- 1 day from start to ship

**Git range:** `feat(01-01)` → `feat(02-01)`

**What's next:** Milestone complete. Ready for next UI polish or feature work.

---
