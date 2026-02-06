# Exercise Tracker App

## What This Is

An exercise tracking application with template-based workout management, real-time progress charts, user authentication, and a library of 873 pre-created exercises. Built with Preact and TypeScript.

## Core Value

Simple, effective workout tracking with clean visual feedback on progress.

## Current State

**Last shipped:** v4.0 Exercise History (2026-02-05)

**What shipped in v4.0:**
- "Workout History" menu item accessible from Settings panel
- History list surface with summary bar (workouts, sets, volume totals)
- Vertical timeline with date markers and compact workout cards
- Workout detail view with exercise blocks and set grids
- Paginated history with "Load More" button
- Template name display in workout detail header

## Requirements

### Validated

- ✓ Template editor surface exists with working functionality — existing
- ✓ Header with Cancel and Save buttons present — existing
- ✓ Exercise info display component present — existing
- ✓ btn-primary and btn-secondary CSS classes exist — existing
- ✓ App header displays Cancel (btn-secondary), title "New Template", and Save (btn-primary) in a single row — v2.3
- ✓ Exercise name truncates with ellipsis when text is too long — v2.3
- ✓ Truncated exercise names show full name in tooltip on hover — v2.3
- ✓ Production code free of DEBUG console.log statements — v2.4
- ✓ Exercise card action buttons in footer (cleaner header) — v2.5
- ✓ Swipe-to-delete uses @use-gesture/react library (cleaner implementation) — v2.6
- ✓ Spring-like animations on swipe gestures with overshoot effect — v2.6
- ✓ Velocity-based snap decision for fast swipes — v2.6
- ✓ iOS-style rubberband effect when over-dragging — v2.6
- ✓ exercises.user_id nullable to support system exercises — v2.7
- ✓ is_system boolean column to distinguish library vs custom exercises — v2.7
- ✓ New columns: instructions, level, force, mechanic (stored but not displayed) — v2.7
- ✓ "Other" added as 7th exercise category — v2.7
- ✓ RLS policies updated: users see own + system exercises, can only modify own — v2.7
- ✓ 873 exercises imported from free-exercise-db with primaryMuscles→category mapping — v2.7
- ✓ Exercise picker shows user exercises first, then system exercises (both alphabetical) — v2.7
- ✓ "Custom" badge displayed on user-created exercises — v2.7
- ✓ Duplicate names allowed (user's "Bench Press" + system "Bench Press" both visible) — v2.7
- ✓ Category text appears below exercise name in picker — v2.7
- ✓ System exercises display same color as user exercises in picker — v2.7
- ✓ Exercise Picker search filters by exercise name only (not category text) — v2.8
- ✓ Category dropdown appears above search box in Exercise Picker Modal — v2.8
- ✓ Category dropdown defaults to "All Categories" — v2.8
- ✓ Combined filtering: category and search work together or independently — v2.8
- ✓ Chart exercise selector shows only exercises with logged session data — v2.8
- ✓ Chart exercise selector shows message when no exercises have data — v2.8
- ✓ Gear icon in dashboard header opens Settings surface — v3.0
- ✓ Settings menu with "My Exercises" menu item and Log Out button — v3.0
- ✓ Logout button relocated from dashboard header to Settings menu — v3.0
- ✓ My Exercises view shows only user-created exercises — v3.0
- ✓ Empty state message when no custom exercises exist — v3.0
- ✓ Create exercise via modal from My Exercises view — v3.0
- ✓ Edit exercise via inline accordion form (name + category) — v3.0
- ✓ Delete exercise with confirmation modal and dependency warning — v3.0
- ✓ updateExercise, getUserExercises, getExerciseDependencies service functions — v3.0
- ✓ "Exercise History" menu item in Settings panel — v4.0
- ✓ History List surface with summary bar (workouts/sets/lbs totals) — v4.0
- ✓ Vertical timeline with date markers and connected dots — v4.0
- ✓ Compact workout cards with template name, badges, exercise preview — v4.0
- ✓ Card click navigates to Workout Detail surface — v4.0
- ✓ Initial load: 7 workouts with "Load More" pagination — v4.0
- ✓ Workout Detail surface with back navigation — v4.0
- ✓ Exercise blocks with exercise name headers — v4.0
- ✓ Set grid per exercise: Set #, Weight, Reps, Completed status — v4.0
- ✓ Visual distinction for completed vs skipped sets — v4.0
- ✓ Template name display in workout detail header — v4.0

### Active

(No active requirements — ready for next milestone)

### Out of Scope

- Equipment filtering in exercise picker — future enhancement
- Exercise images/GIFs — storage/bandwidth costs, defer
- Secondary muscle group display — complexity, defer
- Exercise difficulty filtering — defer
- User favoriting/hiding system exercises — defer
- Displaying instructions/level/force/mechanic — stored for future use only

## Context

**Technical Environment:**
- Preact-based web application with TypeScript
- Surface-based UI architecture (AuthSurface, DashboardSurface, TemplateEditorSurface, WorkoutSurface)
- Settings panel as DashboardSurface child overlay (slide-in from right)
- CSS styling in `apps/web/css/styles.css`
- Supabase backend with RLS policies
- exercises table with nullable user_id FK to auth.users
- 873 system exercises with is_system=true
- ON DELETE CASCADE on exercise FK constraints

**Codebase:**
- ~17,000 lines of TypeScript/CSS
- Monorepo structure: apps/web, packages/shared
- @use-gesture/react for swipe handling

## Constraints

- **Tech stack**: CSS changes preferred, minimal JS if needed
- **Scope**: Per-milestone focus areas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Template-editor only | Keep changes scoped to avoid unintended side effects | ✓ Good |
| Tooltip on truncation | Better UX — user can see full exercise name on hover | ✓ Good |
| Match dashboard-surface pattern | Consistent header flexbox layout across surfaces | ✓ Good |
| Native browser title attribute | Simplest tooltip solution, works across all browsers | ✓ Good |
| Remove all DEBUG console.log | Production code should not have debug logging | ✓ Good |
| Keep console.error statements | Error logging remains useful for production debugging | ✓ Good |
| Move buttons to card-action-footer | Cleaner header, better UX for action visibility | ✓ Good |
| Remove button always visible | No hover-reveal needed in footer, improves discoverability | ✓ Good |
| @use-gesture/react for swipe handling | Standard library, cleaner code (~70 line reduction) | ✓ Good |
| Explicit preact/compat aliases in vite.config.ts | Ensures @use-gesture/react resolves correctly in production | ✓ Good |
| CSS cubic-bezier for spring animation | No additional dependency needed, sufficient for use case | ✓ Good |
| Velocity threshold 0.5 px/ms | Fast swipes feel responsive, minimum -10px prevents accidental triggers | ✓ Good |
| Rubberband 0.2 multiplier | iOS-style 5:1 resistance feels natural | ✓ Good |
| (SELECT auth.uid()) wrapper for RLS | Performance optimization per Supabase best practices | ✓ Good |
| 'Other' category for unmapped exercises | Handles exercises that don't fit existing 6 categories | ✓ Good |
| tsx for TypeScript scripts | Zero-config TypeScript execution for import script | ✓ Good |
| Option B (Solid Pill) badge design | Clear visual distinction for custom exercises | ✓ Good |
| Removed system color override | Simpler solution than changing color — all exercises same appearance | ✓ Good |
| 180px partial-width category dropdown | Compact layout that doesn't dominate modal width | ✓ Good |
| useClickOutside hook for dropdown | Reusable pattern for future dropdowns, handles mobile touch events | ✓ Good |
| Name-only search (not category) | Category dropdown handles category filtering; name-only search is cleaner | ✓ Good |
| Inner join via workout_log_exercises | Efficient filtering: only exercises with actual logged data appear | ✓ Good |
| Fetch filtered exercises on modal open | Not cached — captures new workouts immediately | ✓ Good |
| optgroup for category grouping in chart | Native HTML element, no custom styling needed | ✓ Good |
| Settings panel as DashboardSurface child overlay | Simpler than new AppSurface route, maintains dashboard context | ✓ Good |
| Slide-from-right panel with CSS transform | Smooth animation without JS, consistent with mobile patterns | ✓ Good |
| Typed validation errors (string literal union) | Better than generic Error objects, enables field-specific error display | ✓ Good |
| ON DELETE CASCADE on exercise FK constraints | True cascade behavior matches "All history will be deleted" UX copy | ✓ Good |
| Inline accordion edit (not slide-in panel) | Simpler pattern, keeps user in list context during edits | ✓ Good |
| Lifted modal state to SettingsPanel | Coordinates header "+ Create" button with empty state CTA | ✓ Good |
| Case-insensitive duplicate check via .ilike() | Prevents "Bench Press" and "bench press" duplicates | ✓ Good |
| PaginatedResult<T> generic wrapper | Reusable pagination pattern for future endpoints | ✓ Good |
| Reuse existing getWorkoutLog for detail view | No new service function needed, existing one has all data | ✓ Good |
| Join templates table for workout title | Display actual template name instead of "Untitled Workout" | ✓ Good |
| Category colors via CSS data attributes | 7 exercise categories with color-coded badges | ✓ Good |

---
*Last updated: 2026-02-05 after v4.0 milestone completion*
