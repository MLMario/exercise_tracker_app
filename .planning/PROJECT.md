# Exercise Tracker App

## What This Is

An exercise tracking application with template-based workout management, real-time progress charts, user authentication, and a library of 873 pre-created exercises. Built with Preact and TypeScript.

## Core Value

Simple, effective workout tracking with clean visual feedback on progress.

## Current Milestone: v3.0 Settings & Exercise Management

**Goal:** Add a Settings surface with gear icon access from the dashboard, containing exercise management (My Exercises), placeholder menu items, and relocated logout — enabling users to manage their custom exercises outside the template editor workflow.

**Target features:**
- Settings surface accessible via gear icon in dashboard header (far right)
- Settings menu: "My Exercises" (active), "Profile" (disabled), "Preferences" (disabled), Log Out button
- My Exercises view: search, category filter, create, edit, delete for user-created exercises only
- Edit panel: slide-in overlay from right (name + category fields)
- Delete confirmation modal
- Empty state when no custom exercises exist
- Backend updateExercise service function
- Logout button relocated from dashboard header into settings menu

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

### Active

- [ ] Gear icon in dashboard header (far right) opens Settings surface
- [ ] Settings menu with "My Exercises" active, "Profile" and "Preferences" disabled with "Coming Soon"
- [ ] Log Out button in settings menu
- [ ] Current logout button removed from dashboard header
- [ ] My Exercises view shows only user-created exercises
- [ ] Search and category filter in My Exercises
- [ ] Empty state message when no custom exercises exist
- [ ] Create exercise via existing modal from My Exercises
- [ ] Edit exercise via slide-in overlay panel (name + category)
- [ ] Delete exercise with confirmation modal
- [ ] updateExercise backend service function

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
- Surface-based UI architecture (AuthSurface, DashboardSurface, TemplateEditorSurface, WorkoutSurface, SettingsSurface)
- CSS styling in `apps/web/css/styles.css`
- Template editor surface at `apps/web/src/surfaces/template-editor/`
- Supabase backend with RLS policies
- exercises table with nullable user_id FK to auth.users
- 873 system exercises with is_system=true

**Codebase:**
- 9,376 lines of TypeScript
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

---
*Last updated: 2026-02-03 after v3.0 milestone start*
