# Stack Research: Settings & Exercise Management

**Project:** IronFactor (exercise tracker)
**Researched:** 2026-02-03
**Scope:** What's needed to add a Settings surface with exercise CRUD management
**Overall confidence:** HIGH -- this feature builds entirely on existing patterns

## Executive Summary

The Settings surface and exercise management feature requires **zero new dependencies**. The existing stack (Preact 10.28, TypeScript 5.9, Supabase JS 2.90, Vite 7.3) already provides everything needed. The app has well-established patterns for surfaces, modals, overlays, service functions, and CSS animations that this feature directly extends. The only "new" code is a slide-in edit panel CSS pattern (not present in the codebase today, but trivially implemented with existing CSS custom properties) and one new Supabase service function (`updateExercise`).

---

## Recommended Stack

### No New Dependencies Required

This is the key finding. Every technology needed is already installed and proven in the codebase.

| Technology | Current Version | Role for This Feature | Confidence |
|---|---|---|---|
| Preact | ^10.28.2 | Component rendering, hooks (useState, useEffect, useMemo, useCallback, useRef) | HIGH |
| TypeScript | ^5.9.3 | Type safety for new surface, service types, component props | HIGH |
| @supabase/supabase-js | ^2.90.1 | `updateExercise` service function, RLS-gated queries | HIGH |
| Vite | ^7.3.1 | Dev server, HMR during development | HIGH |
| @preact/preset-vite | ^2.10.2 | JSX transform for new .tsx components | HIGH |
| CSS (vanilla) | N/A | Slide-in panel, settings layout, exercise list styles | HIGH |

### What the Feature Reuses Directly

These existing codebase elements are used as-is or with minor extension:

| Existing Element | Location | How It's Reused |
|---|---|---|
| Surface routing pattern | `apps/web/src/main.tsx` (line 83, `AppSurface` type) | Add `'settings'` to the union, add handler functions |
| `useAsyncOperation` hook | `apps/web/src/hooks/useAsyncOperation.ts` | Loading/error/success state for exercise CRUD |
| `useClickOutside` hook | `apps/web/src/hooks/useClickOutside.ts` | Close category dropdown in exercise list |
| `ConfirmationModal` component | `apps/web/src/components/ConfirmationModal.tsx` | Delete exercise confirmation |
| `ExercisePickerModal` patterns | `apps/web/src/components/ExercisePickerModal.tsx` | Search/filter/category dropdown patterns (code reference, not direct reuse) |
| `exercises` service | `packages/shared/src/services/exercises.ts` | `getExercises`, `createExercise`, `deleteExercise`, `getCategories` |
| `ExercisesService` interface | `packages/shared/src/types/services.ts` | Extend with `updateExercise` method |
| `Exercise`, `ExerciseUpdate` types | `packages/shared/src/types/database.ts` | Already defined, used for update payloads |
| Modal/overlay CSS | `apps/web/css/styles.css` (lines 794-883) | Modal overlay base for edit panel backdrop |
| CSS custom properties | `apps/web/css/styles.css` (lines 9-61) | Colors, spacing, transitions, radius tokens |
| `fadeIn` / `slideUp` keyframes | `apps/web/css/styles.css` (lines 1148-1166) | Animation patterns to model `slideInRight` after |
| Category constants | `ExercisePickerModal.tsx` (lines 21-44) | Reuse CATEGORY_OPTIONS and FILTER_CATEGORIES patterns |

---

## New Code Required (No Libraries)

### 1. Service Layer: `updateExercise` Function

**Where:** `packages/shared/src/services/exercises.ts`
**What:** New function using existing Supabase client pattern

The `ExerciseUpdate` type (`Partial<ExerciseInsert>`) already exists in `database.ts` (line 219). The `ExercisesService` interface in `services.ts` needs a new method signature. The implementation follows the identical pattern of `createExercise` (lines 81-144 of exercises.ts):

- Get current user via `supabase.auth.getUser()`
- Validate inputs
- Call `supabase.from('exercises').update({...}).eq('id', id).select().single()`
- Handle unique constraint violation (code 23505)
- Return `ServiceResult<Exercise>`

**Critical constraint:** Must verify the exercise belongs to the current user AND `is_system === false` before allowing update. RLS policies should enforce this at the database level, but the service should also guard against it.

**Confidence:** HIGH -- follows exact same pattern as existing CRUD functions.

### 2. Service Layer: `getUserExercises` Function (Optional but Recommended)

**Where:** `packages/shared/src/services/exercises.ts`
**What:** Filtered query returning only user-created exercises (`is_system = false`, `user_id = current_user`)

Currently `getExercises()` returns ALL exercises (system + user). The Settings exercise list only shows user-created exercises. Two options:

- **Option A (recommended):** Add `getUserExercises()` that filters server-side with `.eq('is_system', false).eq('user_id', user.id)`. More efficient -- avoids transferring 873 system exercises.
- **Option B:** Filter client-side from existing `getExercises()` response. Simpler but wasteful.

**Confidence:** HIGH -- straightforward Supabase query.

### 3. Surface Component: `SettingsSurface`

**Where:** `apps/web/src/surfaces/settings/` (new directory)
**What:** New surface following the exact pattern of existing surfaces

The surface pattern is well-established:
- Directory with `index.ts` barrel export
- Main surface component (e.g., `SettingsSurface.tsx`)
- Sub-components as needed
- Surface registered in `apps/web/src/surfaces/index.ts`
- Surface type added to `AppSurface` union in `main.tsx`

**Confidence:** HIGH -- direct pattern replication.

### 4. CSS: Slide-In Edit Panel

**Where:** `apps/web/css/styles.css`
**What:** New CSS classes for right-sliding panel overlay

The mock (option-c-v4.html) defines this pattern with:
- `.edit-panel-overlay` -- fixed position backdrop with fade transition
- `.edit-panel` -- fixed right panel sliding from `right: -100%` to `right: 0`
- `.edit-panel.active` toggle class
- Uses existing CSS variables (`--color-bg-surface`, `--color-border`, `--transition-fast`)

No CSS library needed. The existing codebase uses vanilla CSS with custom properties throughout. A `@keyframes slideInRight` animation would complement the existing `slideUp` and `fadeIn` keyframes (lines 1148-1166).

**Confidence:** HIGH -- vanilla CSS, pattern defined in mocks.

### 5. SVG Icons: Gear Icon for Settings Entry Point

**Where:** Inline SVG in `DashboardSurface.tsx` header
**What:** Small gear/cog SVG icon

The codebase already uses inline SVGs (see `ExercisePickerModal.tsx` dropdown chevron, lines 283-290). No icon library needed. A single `<svg>` element with a gear path.

**Confidence:** HIGH -- follows existing inline SVG pattern.

---

## What NOT to Use

### Do NOT Add a Router Library

**Examples to avoid:** preact-router, wouter, preact-iso

**Why not:** The app uses `useState`-based surface switching in `main.tsx` (line 83: `type AppSurface = 'auth' | 'dashboard' | 'templateEditor' | 'workout'`). Adding a router for one new surface would require refactoring ALL existing surface navigation, handlers, and state management. The current pattern works well for this app's complexity level (5-6 surfaces total). A router adds URL management, history API integration, and route parameter parsing -- none of which is needed here.

**What to do instead:** Add `'settings'` to the `AppSurface` union type. Add handler functions in `App()` following the existing `handleEditTemplate`, `handleCreateNewTemplate` pattern.

### Do NOT Add a State Management Library

**Examples to avoid:** @preact/signals, zustand, jotai, redux

**Why not:** Each surface manages its own state via `useState` hooks. The Settings surface is self-contained -- it loads exercises, manages search/filter state, and handles CRUD. There's no cross-surface state sharing needed beyond what `main.tsx` already provides (user, current surface). The `useAsyncOperation` hook already handles async state patterns elegantly.

**What to do instead:** Use `useState` for local component state, `useAsyncOperation` for async CRUD operations, `useMemo` for filtered exercise lists. This matches every other surface in the app.

### Do NOT Add a Form Library

**Examples to avoid:** preact-forms, formik, react-hook-form

**Why not:** The edit panel has exactly two fields: name (text input) and category (select dropdown). The existing codebase handles forms with direct `useState` + `onInput`/`onChange` handlers (see `ExercisePickerModal.tsx` lines 363-416 for the exact same pattern: name input + category select). A form library adds bundle size for zero benefit on a 2-field form.

**What to do instead:** `useState` for `editName` and `editCategory`. Direct event handlers. Same pattern as `ExercisePickerModal`.

### Do NOT Add a CSS-in-JS or Component Library

**Examples to avoid:** styled-components, emotion, tailwind, material-ui, chakra

**Why not:** The entire app uses a single `styles.css` file with CSS custom properties. All 2943 lines of CSS follow this convention. Introducing a different styling approach for one surface would create inconsistency and increase bundle size. The existing design system (colors, spacing, typography, shadows, transitions) is comprehensive and well-organized.

**What to do instead:** Add new CSS classes to `apps/web/css/styles.css` following the existing section-based organization. Use existing CSS custom properties for all values.

### Do NOT Add a Virtual Scrolling Library

**Examples to avoid:** react-virtualized, react-window, tanstack-virtual

**Why not:** The exercise management view shows only **user-created exercises**, not all 873 system exercises. Users typically have 5-50 custom exercises. Even at 100 exercises, native scrolling with `overflow-y: auto` performs fine. The `ExercisePickerModal` already renders 873+ exercises in a scrollable list without virtualization (lines 323-351 of ExercisePickerModal.tsx).

**What to do instead:** Native scrollable container with the existing `.exercise-list-container` CSS pattern.

### Do NOT Add a Toast/Notification Library

**Examples to avoid:** react-toastify, notistack, sonner

**Why not:** The app uses inline error/success message divs within each surface (see `DashboardSurface.tsx` lines 455-466). This pattern is consistent across all surfaces. Adding a toast library would create two notification systems.

**What to do instead:** Use the `useAsyncOperation` hook's built-in `error` and `successMessage` state, rendered as inline message divs following the existing pattern.

### Do NOT Add an Animation Library

**Examples to avoid:** framer-motion, preact-transitioning, react-spring

**Why not:** The slide-in panel animation is a simple CSS transition (`right: -100%` to `right: 0` with `transition: right 200ms ease-in-out`). The mock already proves this works with pure CSS. The codebase has no animation library -- all animations use CSS `@keyframes` and `transition` properties.

**What to do instead:** CSS transitions for the panel slide, CSS `@keyframes` for the overlay fade. Toggle via `.active` class.

---

## Supabase-Specific Considerations

### RLS Policy for Exercise Updates

The `exercises` table has RLS enabled (Supabase default). The current policies allow:
- **SELECT:** System exercises (where `is_system = true`) visible to all authenticated users; user exercises visible only to owner
- **INSERT:** Users can insert with their own `user_id`
- **DELETE:** Users can delete exercises where `user_id = auth.uid()`

An **UPDATE** policy is needed:

```sql
CREATE POLICY "Users can update their own exercises"
ON public.exercises
FOR UPDATE
USING (user_id = auth.uid() AND is_system = false)
WITH CHECK (user_id = auth.uid() AND is_system = false);
```

**Critical:** The `is_system = false` check prevents users from modifying system exercises even if they somehow construct the request. The `user_id = auth.uid()` check prevents cross-user updates.

**Confidence:** HIGH -- follows exact pattern of existing RLS policies.

### Exercise Deletion: Foreign Key Constraints

The `exercises` table has foreign key references from:
- `template_exercises.exercise_id` (templates using this exercise)
- `workout_log_exercises.exercise_id` (workout history referencing this exercise)
- `user_charts.exercise_id` (charts tracking this exercise)

Deleting an exercise with existing references will fail with a FK violation. The UI must handle this:

**Option A (recommended):** Check for references before attempting delete. Show a clear error message like "This exercise is used in X templates and Y workout logs. Remove it from templates first."

**Option B:** Use `ON DELETE CASCADE` on FKs -- but this is destructive and would delete workout history. Not recommended.

**Option C:** Soft delete with an `is_archived` flag. Overly complex for the current scope.

The existing `deleteExercise` service function (exercises.ts line 152-174) does not check for references. The Supabase error response will contain the FK violation, which the UI should interpret as a user-friendly message.

**Confidence:** HIGH -- this is a known database pattern.

---

## Version Compatibility Notes

All current dependency versions are stable and compatible:

| Package | Version | Status |
|---|---|---|
| preact | ^10.28.2 | Stable, hooks API fully supported |
| @supabase/supabase-js | ^2.90.1 | Stable v2 line, `.update().eq().select().single()` fully supported |
| typescript | ^5.9.3 | Stable, all features used (type unions, generics, Omit/Partial) |
| vite | ^7.3.1 | Stable, path aliases working |
| @preact/preset-vite | ^2.10.2 | Stable, JSX transform working |

No version bumps needed. No compatibility concerns.

---

## Shared Constants to Extract

The category list is currently duplicated between `ExercisePickerModal.tsx` (lines 21-44) and `exercises.ts` service (`getCategories()` on line 211). The Settings surface will need the same list. Rather than triplicating, consider extracting to the shared package:

**Current locations:**
1. `ExercisePickerModal.tsx` -- `CATEGORY_OPTIONS` array (includes 'Cardio')
2. `ExercisePickerModal.tsx` -- `FILTER_CATEGORIES` array (includes 'All Categories' sentinel)
3. `exercises.ts` -- `getCategories()` function (excludes 'Cardio')

**Note:** There is a discrepancy -- `CATEGORY_OPTIONS` in the modal includes 'Cardio' but the `ExerciseCategory` type in `database.ts` does NOT include 'Cardio'. The `getCategories()` function also omits it. This should be reconciled during implementation, but it is a UI concern not a stack concern.

---

## Summary: Implementation Requires Only New Code

| What | Type | Where |
|---|---|---|
| `updateExercise` function | New service function | `packages/shared/src/services/exercises.ts` |
| `getUserExercises` function | New service function (recommended) | `packages/shared/src/services/exercises.ts` |
| `ExercisesService` interface update | Type modification | `packages/shared/src/types/services.ts` |
| `SettingsSurface` + sub-components | New surface | `apps/web/src/surfaces/settings/` |
| Surface registration | Barrel export update | `apps/web/src/surfaces/index.ts` |
| `AppSurface` union expansion | Type modification | `apps/web/src/main.tsx` |
| Settings navigation handlers | New functions in App() | `apps/web/src/main.tsx` |
| Gear icon in dashboard header | JSX modification | `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` |
| Logout relocation | Move from dashboard to settings | `DashboardSurface.tsx` -> `SettingsSurface.tsx` |
| Slide-in panel CSS | New CSS classes | `apps/web/css/styles.css` |
| Exercise list CSS | New CSS classes | `apps/web/css/styles.css` |
| Settings layout CSS | New CSS classes | `apps/web/css/styles.css` |
| RLS UPDATE policy | SQL migration | Supabase dashboard or migration file |

**New packages to install:** None.
**New dev dependencies:** None.
**New build configuration:** None.

---

## Sources

- **PRIMARY (codebase analysis):** Direct file reads of all relevant source files
- `apps/web/package.json` -- current dependency versions
- `packages/shared/src/services/exercises.ts` -- existing CRUD patterns
- `packages/shared/src/types/database.ts` -- Exercise type, ExerciseUpdate type
- `packages/shared/src/types/services.ts` -- ExercisesService interface
- `apps/web/src/main.tsx` -- surface routing pattern
- `apps/web/src/components/ExercisePickerModal.tsx` -- search/filter/form patterns
- `apps/web/src/components/ConfirmationModal.tsx` -- delete confirmation pattern
- `apps/web/src/hooks/useAsyncOperation.ts` -- async state management
- `apps/web/css/styles.css` -- CSS design system, modal patterns, animation keyframes
- `mocks/option-c-v4.html` -- slide-in edit panel CSS definition
- `sql/current_schema.sql` -- database schema and FK constraints
- `.planning/exercise-management-suggestions.md` -- design options analysis
