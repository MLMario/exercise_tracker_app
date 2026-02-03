# Project Research Summary

**Project:** IronFactor -- Settings & Exercise Management
**Domain:** Fitness/Workout Tracker (Preact SPA with Supabase backend)
**Researched:** 2026-02-03
**Confidence:** HIGH

## Executive Summary

This feature adds a Settings surface with exercise CRUD management to an existing, well-structured Preact/Supabase fitness tracker. The critical finding across all research is that **zero new dependencies are needed** -- the existing stack, patterns, and architecture directly support everything required. The app already has surface routing, async state hooks, confirmation modals, search/filter patterns, and CSS animations that this feature reuses. The only new backend work is a single `updateExercise` service function and an RLS UPDATE policy on the exercises table.

The recommended approach is to build incrementally across 6 phases following the app's established patterns: service layer first, then surface shell with navigation wiring, then the exercise list (read-only), then edit, delete, and create flows. Each phase produces something independently testable. The architecture research strongly recommends keeping all settings sub-navigation internal to `SettingsSurface` (following the `AuthSurface` precedent) rather than polluting `main.tsx` with settings-specific state.

The primary risks are data integrity issues around exercise deletion. Three foreign key tables (`template_exercises`, `workout_log_exercises`, `user_charts`) reference the exercises table without cascade rules. Deleting an in-use exercise without pre-checking these references will produce cryptic Postgres errors or orphan chart/template data. The mitigation is straightforward: query all three FK tables before deletion and show a clear, actionable warning. Secondary risks include category constant inconsistencies (the picker includes "Cardio" but the DB constraint does not) and stale exercise data when navigating back to the dashboard after CRUD operations.

## Key Findings

### Recommended Stack

No new packages, no version bumps, no build config changes. The entire feature is built with existing dependencies. See [STACK.md](./STACK.md) for full rationale.

**Core technologies (all existing):**
- **Preact 10.28** -- component rendering, hooks (useState, useEffect, useMemo, useCallback, useRef) -- proven across all surfaces
- **TypeScript 5.9** -- type safety for new surface, extend `AppSurface` union and `ExercisesService` interface
- **Supabase JS 2.90** -- `updateExercise` service function using `.update().eq().select().single()` chain, RLS-gated
- **Vanilla CSS** -- slide-in panel (if used) or expandable row styles, new `@keyframes` animation, existing custom properties

**Explicitly avoid:** Router libraries, state management libraries, form libraries, CSS-in-JS, virtual scrolling, toast/notification libraries, animation libraries. Each has a documented rationale in STACK.md.

### Expected Features

See [FEATURES.md](./FEATURES.md) for competitor analysis and source citations.

**Must have (table stakes):**
- Gear icon entry point in dashboard header (universal settings pattern)
- Settings menu with My Exercises (active), Profile/Preferences (disabled, "Coming Soon"), Logout
- Exercise list showing only user-created exercises (not the 873 system exercises)
- Create, Edit (name + category), and Delete exercise with confirmation
- Search by name and category filter dropdown (reuse ExercisePickerModal patterns)
- Empty state with explanatory text and CTA when no custom exercises exist
- Specific button labels on delete confirmation ("Delete Exercise" / "Keep Exercise", not "Yes" / "No")
- Dependency warning on delete if exercise is referenced by templates, workout logs, or charts

**Should have (differentiators):**
- Exercise count badge on settings menu item ("My Exercises (3)")
- Animated slide-in/expand transitions (low effort, high perceived quality)
- Keyboard shortcuts (Esc to close, Enter to save)

**Defer to post-v3.0:**
- Undo-after-delete toast (requires soft-delete complexity)
- Sort options for exercise list
- Bulk select/delete
- Exercise usage indicators (cross-table joins on every render)

### Architecture Approach

The Settings surface follows the `AuthSurface` precedent: a container component with internal sub-view routing via `useState<'menu' | 'exercises'>`. Navigation between Dashboard and Settings uses the existing callback-prop pattern (`onNavigateSettings`, `onBack`, `onLogout`). Each surface loads its own data independently -- no shared exercise state between surfaces. See [ARCHITECTURE.md](./ARCHITECTURE.md) for full component hierarchy and data flow diagrams.

**Major components:**
1. **SettingsSurface** -- container with sub-view routing (menu vs. exercises), receives `onBack` and `onLogout` props
2. **SettingsMenu** -- list of menu items, delegates logout, navigates to exercise management
3. **MyExercisesView** -- exercise list with search, filter, CRUD orchestration via `useAsyncOperation`
4. **ExerciseRow** -- presentational component per exercise, expandable for custom exercises
5. **ExerciseEditForm** -- inline name + category form within expanded row (Save/Cancel/Delete)
6. **DeleteExerciseConfirm** -- inline confirmation replacing edit form, shows dependency warnings

### Critical Pitfalls

See [PITFALLS.md](./PITFALLS.md) for all 12 pitfalls with detailed prevention strategies.

1. **FK violations on exercise delete** -- Pre-check `template_exercises`, `workout_log_exercises`, AND `user_charts` before deletion. Show clear message listing where the exercise is used. Translate Postgres error `23503` as a fallback.
2. **Duplicate exercise names on edit** -- The existing `exerciseExists` check is case-sensitive and does not scope properly. Use `ilike` for case-insensitive matching in `updateExercise`. Validate on submit, not in real-time.
3. **System exercises leaking into management view** -- Create a dedicated `getUserExercises()` service that filters with `.eq('is_system', false)`. Never render edit/delete controls on system exercises.
4. **Stale dashboard data after CRUD** -- Dashboard must reload exercises when remounting after Settings navigation. Verify that surface switching unmounts/remounts components (it does with the current if/else rendering pattern).
5. **Category constant mismatch** -- `ExercisePickerModal` includes "Cardio" but the DB constraint does not. Use `getCategories()` from the shared service as the single source of truth.

## Implications for Roadmap

Based on combined research, the feature should be built in 6 phases. This order is driven by data dependencies (service before UI), architectural dependencies (shell before views), and UX complexity (read before write).

### Phase 1: Service Layer
**Rationale:** Every UI phase depends on having `updateExercise` and `getUserExercises` service functions. Building backend first means UI phases are never blocked.
**Delivers:** `updateExercise` function, `getUserExercises` function, updated `ExercisesService` interface, RLS UPDATE policy
**Addresses:** Backend prerequisite for edit functionality
**Avoids:** Pitfall 9 (interface mismatch -- update interface BEFORE implementation), Pitfall 2 (name duplication -- build case-insensitive validation into service)

### Phase 2: Settings Surface Shell + Navigation
**Rationale:** The surface container and navigation wiring must exist before any sub-views can be built. Logout relocation must happen atomically with settings creation.
**Delivers:** SettingsSurface with menu, gear icon in dashboard header, logout relocated to settings, back navigation
**Addresses:** Settings entry point, menu with disabled items, logout relocation
**Avoids:** Pitfall 5 (logout relocation -- do it atomically), Pitfall 6 (state explosion -- keep sub-nav internal to SettingsSurface)

### Phase 3: Exercise List (Read-Only)
**Rationale:** The list is the foundation for all CRUD operations. Search and filter patterns are directly reusable from ExercisePickerModal. Empty state must be handled before any data operations.
**Delivers:** MyExercisesView with exercise list, search, category filter, empty state, back navigation to menu
**Addresses:** Exercise list display, search, filter, empty state
**Avoids:** Pitfall 3 (system exercises in list -- use `getUserExercises()`), Pitfall 11 (empty state -- design it explicitly)

### Phase 4: Exercise Edit
**Rationale:** Edit establishes the expand/collapse row interaction that delete and create build upon. Less complex than delete (no dependency warnings).
**Delivers:** Expandable exercise rows, inline edit form (name + category), save/cancel, optimistic UI update
**Addresses:** Edit exercise name and category
**Avoids:** Pitfall 2 (name duplication -- validate on submit), Pitfall 12 (validation timing -- keep it simple, submit-only), Pitfall 8 (overlay conflicts -- inline editing avoids overlay stacking)

### Phase 5: Exercise Delete
**Rationale:** Delete builds on the expand/collapse mechanics from Phase 4. Must include dependency checking across all three FK tables.
**Delivers:** Delete button in edit form, inline confirmation with dependency warnings, row removal animation
**Addresses:** Delete exercise with confirmation, dependency warnings
**Avoids:** Pitfall 1 (FK violations -- pre-check all three tables), Pitfall 4 (chart orphans -- include user_charts in check)

### Phase 6: Exercise Create
**Rationale:** Create reuses ExerciseEditForm from Phase 4 with a different submit handler. Has unique UX (temporary row for new exercise). Separating from Phase 4 keeps each phase focused.
**Delivers:** "Add Exercise" button, new row in edit state, save creates exercise, cancel removes temporary row
**Addresses:** Create exercise from management view
**Avoids:** Pitfall 10 (category mismatch -- use shared category source)

### Phase Ordering Rationale

- **Service before UI** -- Phases 4-6 (edit, delete, create) all call service functions. Building the service layer first (Phase 1) means no mocking or stubbing is needed.
- **Shell before content** -- Phase 2 (surface + navigation) must exist before Phase 3 (exercise list) can render anywhere.
- **Read before write** -- Phase 3 (list) establishes data loading patterns that Phases 4-6 extend. The list must exist before CRUD actions can target items in it.
- **Edit before delete** -- Phase 4 establishes expandable rows. Phase 5 adds delete confirmation within the same expand/collapse UX. Building delete first would require building expand/collapse anyway.
- **Create last** -- Phase 6 reuses the edit form from Phase 4, so it has the least new component work. Its unique UX (temporary unsaved row) is isolated from the more critical edit/delete flows.

### Research Flags

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1 (Service Layer):** Follows exact pattern of existing `createExercise` and `deleteExercise`. Copy-and-adapt.
- **Phase 2 (Surface Shell):** Follows exact pattern of `AuthSurface` sub-view routing and `TemplateEditorSurface` navigation. Well-documented in ARCHITECTURE.md.
- **Phase 3 (Exercise List):** Reuses search/filter patterns from `ExercisePickerModal`. Straightforward.
- **Phase 6 (Create):** Reuses edit form from Phase 4. Existing `createExercise` service already works.

Phases that may benefit from brief research during planning:
- **Phase 4 (Exercise Edit):** The inline expandable row editing pattern is new to this codebase. Worth confirming the expand/collapse animation approach and accordion behavior (one row expanded at a time) before building.
- **Phase 5 (Exercise Delete):** The FK dependency check across three tables needs the exact query approach confirmed. Worth verifying whether to query each table separately or use a single RPC call.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new dependencies. All technology decisions are "use what exists." Based entirely on codebase analysis. |
| Features | HIGH | Table stakes verified across 4+ competitor apps (Hevy, Strong, JEFIT). UX patterns sourced from NN/Group, Adobe, Smashing Magazine. |
| Architecture | HIGH | Based entirely on codebase analysis. Every pattern (surface routing, sub-views, service calls, hooks) has existing precedent in the app. |
| Pitfalls | HIGH | Critical pitfalls (FK violations, name duplication) verified against actual schema and service code. RLS and constraint behavior confirmed via Supabase docs. |

**Overall confidence:** HIGH -- This is a well-scoped feature adding to a mature codebase with strong patterns. No new territory.

### Gaps to Address

- **Category constant reconciliation:** "Cardio" exists in ExercisePickerModal but not in the DB constraint. Decide whether to add it to the DB or remove it from the picker. Should be resolved before Phase 3.
- **RLS UPDATE policy:** Needs to be created in Supabase. Confirm whether this requires a migration file or is applied via dashboard. Should be resolved in Phase 1.
- **Stale data on dashboard return:** Verify empirically that the current surface rendering pattern (if/else in main.tsx) unmounts/remounts DashboardSurface when returning from Settings. If not, a data refresh mechanism is needed. Should be validated in Phase 2.
- **Exercise name uniqueness index:** Currently enforced only at the application level (query check). Consider adding a DB-level unique index `(user_id, lower(name))` for defense in depth. Evaluate cost/benefit during Phase 1.

## Sources

### Primary (HIGH confidence)
- Codebase analysis -- all source files listed in individual research documents (main.tsx, exercises.ts, database.ts, services.ts, ExercisePickerModal.tsx, DashboardSurface.tsx, AuthSurface.tsx, styles.css, current_schema.sql)
- [Supabase Cascade Deletes docs](https://supabase.com/docs/guides/database/postgres/cascade-deletes)
- [NN/Group: Confirmation Dialogs](https://www.nngroup.com/articles/confirmation-dialog/)
- [Adobe Commerce: Slide-out Panels Pattern](https://developer.adobe.com/commerce/admin-developer/pattern-library/containers/slideouts-modals-overlays)
- [NN/Group: Empty States](https://www.nngroup.com/articles/empty-state-interface-design/)

### Secondary (MEDIUM confidence)
- Competitor analysis: Hevy, Strong, JEFIT feature pages and comparison articles
- [Smashing Magazine: Dangerous Actions in UIs](https://www.smashingmagazine.com/2024/09/how-manage-dangerous-actions-user-interfaces/)
- [Toptal: Settings UX](https://www.toptal.com/designers/ux/settings-ux)
- [UX Collective: Settings Screen Design](https://uxdesign.cc/designing-a-better-settings-page-for-your-app-fcc32fe8c724)

### Tertiary (LOW confidence)
- Generic fitness app feature listicles (used for feature completeness checks only, not architectural decisions)

---
*Research completed: 2026-02-03*
*Ready for roadmap: yes*
