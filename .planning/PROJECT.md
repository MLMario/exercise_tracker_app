# Exercise Tracker App

## What This Is

An exercise tracking application with template-based workout management, real-time progress charts, and user authentication. Built with Preact and TypeScript.

## Core Value

Simple, effective workout tracking with clean visual feedback on progress.

## Current Milestone: v2.7 Pre-Created Exercise Library

**Goal:** Add a library of ~800 pre-created exercises from free-exercise-db that users can pick from when adding exercises during template creation or workout logging.

**Target features:**
- Schema changes to support system exercises (nullable user_id, is_system flag, new columns)
- Add "Other" as 7th exercise category for unmapped muscles
- Import ~800 exercises from free-exercise-db with muscle→category mapping
- Updated RLS policies for system + user exercises
- Exercise picker shows both user and system exercises (user first, then system)
- "Custom" badge on user-created exercises to distinguish from library

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

### Active

- [ ] exercises.user_id nullable to support system exercises
- [ ] is_system boolean column to distinguish library vs custom exercises
- [ ] New columns: instructions, level, force, mechanic (stored but not displayed in v1)
- [ ] "Other" added as 7th exercise category
- [ ] RLS policies updated: users see own + system exercises, can only modify own
- [ ] ~800 exercises imported from free-exercise-db with primaryMuscles→category mapping
- [ ] Exercise picker shows user exercises first, then system exercises (both alphabetical)
- [ ] "Custom" badge displayed on user-created exercises
- [ ] Duplicate names allowed (user's "Bench Press" + system "Bench Press" both visible)

### Out of Scope

- Equipment filtering in exercise picker — future enhancement
- Exercise images/GIFs — storage/bandwidth costs, defer
- Secondary muscle group display — complexity, defer
- Exercise difficulty filtering — defer
- User favoriting/hiding system exercises — defer
- Changing picker UX — keep current behavior, just add more exercises
- Displaying instructions/level/force/mechanic — stored for future use only

## Context

**Technical Environment:**
- Preact-based web application with TypeScript
- Surface-based UI architecture (AuthSurface, DashboardSurface, TemplateEditorSurface, WorkoutSurface)
- CSS styling in `apps/web/css/styles.css`
- Template editor surface at `apps/web/src/surfaces/template-editor/`
- Supabase backend with RLS policies
- exercises table with user_id FK to auth.users

**Current State:**
- v2.6 shipped with swipe gesture refactor using @use-gesture/react
- exercises table requires user_id (NOT NULL) — will change
- 6 exercise categories: Chest, Back, Shoulders, Legs, Arms, Core — adding "Other"
- ExercisePickerModal used in TemplateEditorSurface and WorkoutSurface

**Data Source:**
- free-exercise-db: https://github.com/yuhonas/free-exercise-db
- ~800 exercises with primaryMuscles, equipment, instructions, level, force, mechanic
- Will fetch JSON from GitHub, transform, and generate CSV for Supabase import

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

---
*Last updated: 2026-02-01 after starting v2.7 milestone*
