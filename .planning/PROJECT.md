# Exercise Tracker App

## What This Is

An exercise tracking application with template-based workout management, real-time progress charts, user authentication, and a library of 873 pre-created exercises. Built with Preact and TypeScript.

## Core Value

Simple, effective workout tracking with clean visual feedback on progress.

## Current State

**v2.7 Pre-Created Exercise Library shipped 2026-02-02**

The app now includes:
- 873 system exercises from free-exercise-db mapped to 7 categories
- Exercise picker shows user exercises first (with "Custom" badge), then system exercises
- Database schema supports nullable user_id for system exercises with RLS protection
- Clean stacked layout in picker with category below exercise name

**Next milestone goals:** TBD - run `/gsd:new-milestone` to define

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

### Active

(None - define in next milestone)

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

---
*Last updated: 2026-02-02 after v2.7 milestone*
