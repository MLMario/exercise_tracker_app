# Pitfalls Research: Settings & Exercise Management

**Domain:** Settings surface + exercise CRUD for existing Preact/Supabase fitness app
**Researched:** 2026-02-03
**Overall confidence:** HIGH (based on codebase analysis + domain research)

---

## Critical Pitfalls

Mistakes that cause data loss, broken references, or require schema changes to fix.

---

### Pitfall 1: Deleting an Exercise That Is Referenced by Templates, Workout Logs, or Charts

- **Risk:** The `exercises` table is referenced by three foreign keys: `template_exercises.exercise_id`, `workout_log_exercises.exercise_id`, and `user_charts.exercise_id`. None of these are defined with `ON DELETE CASCADE` or `ON DELETE SET NULL` in `current_schema.sql`. Attempting to delete an exercise that has been used in any template, logged workout, or chart will produce a Postgres FK constraint violation error (`23503`). The current `deleteExercise` service does NOT check for these references before attempting deletion -- it just calls `supabase.from('exercises').delete().eq('id', id)` and reports the raw error.
- **Warning signs:** Delete button appears to work in the UI (spinner, etc.) but then shows a cryptic error message. Or worse, the error is swallowed and the exercise stays in the list with no feedback.
- **Prevention:**
  1. Before calling `deleteExercise`, query `template_exercises`, `workout_log_exercises`, and `user_charts` for rows referencing the exercise ID.
  2. If references exist, show a clear message: "This exercise is used in X templates, Y workout logs, and Z charts. It cannot be deleted."
  3. Consider a soft-delete pattern (`is_archived` column) as a future enhancement, but for v3.0 the simpler "block deletion with explanation" approach is sufficient and avoids schema migration.
  4. Translate the Postgres `23503` error code into a human-readable fallback message in case the pre-check is somehow bypassed.
- **Phase:** Exercise delete flow -- must be addressed in the phase that implements the delete confirmation modal.

---

### Pitfall 2: Editing an Exercise Name Creates Duplicate Name Conflicts

- **Risk:** The `createExercise` service already checks for unique constraint violation (`23505`) but there is no `updateExercise` service yet. When building it, the same uniqueness logic applies. However, there is a subtler issue: the exercises table has no explicit unique index on `(user_id, name)` or `(lower(name), user_id)`. The current `exerciseExists` check uses `supabase.from('exercises').select('id').eq('name', name.trim()).maybeSingle()` which does an exact-match query that includes BOTH system and user exercises (RLS returns all visible). This means:
  - A user could rename their exercise to match a system exercise name (e.g., "Bench Press") -- this may not violate any DB constraint but creates confusing duplicates in the exercise picker.
  - Case differences ("bench press" vs "Bench Press") would bypass the `exerciseExists` check since PostgreSQL text comparison is case-sensitive by default.
- **Warning signs:** Users see duplicate-looking entries in the exercise picker. Different-cased versions of the same name appear as separate exercises.
- **Prevention:**
  1. In the `updateExercise` service, validate name uniqueness by querying with `ilike` (case-insensitive) instead of `eq` for the name field, scoped to the user's exercises AND system exercises.
  2. In the edit UI, perform client-side validation before submission: trim whitespace, check against existing exercise names (case-insensitive).
  3. Consider adding a functional unique index `CREATE UNIQUE INDEX idx_exercises_user_name_lower ON exercises (user_id, lower(name)) WHERE user_id IS NOT NULL` to enforce this at the database level. However, this is a schema migration -- evaluate whether it is worth doing in v3.0 or deferring.
  4. For system exercises, the uniqueness is managed at import time, so the index only needs to cover user exercises.
- **Phase:** The `updateExercise` service implementation phase. Validation logic should be built into the service layer, not just the UI.

---

### Pitfall 3: System Exercises Appearing in "My Exercises" Management View

- **Risk:** The `getExercises()` service returns ALL exercises visible via RLS -- both user-created exercises and ~800 system exercises. If the "My Exercises" management view calls `getExercises()` without filtering, it will display hundreds of system exercises that the user cannot edit or delete. Worse, if edit/delete buttons are rendered for system exercises, clicking them will silently fail (RLS UPDATE/DELETE policies require `is_system = false`), producing confusing errors.
- **Warning signs:** The exercise list takes a long time to render, shows hundreds of entries, or users see edit/delete buttons on exercises they did not create.
- **Prevention:**
  1. Create a dedicated `getUserExercises()` service function (or a `getExercises({ userOnly: true })` parameter) that filters with `.eq('is_system', false)` to only return user-created exercises.
  2. Never render edit/delete controls on exercises where `is_system === true`.
  3. The existing `ExercisePickerModal` already differentiates system vs custom exercises (shows "Custom" badge, sorts user exercises first) -- reuse this visual pattern but with the opposite data source (only custom exercises).
- **Phase:** Must be addressed in the very first phase that renders the exercise list in the management view. If the wrong query is used from the start, it creates UX confusion immediately.

---

### Pitfall 4: Orphaning Chart References When Deleting a User Exercise

- **Risk:** Even if you handle the template and workout log FK checks from Pitfall 1, the `user_charts` table also has `exercise_id` FK to `exercises`. If a user has a chart tracking a custom exercise and then deletes that exercise, the chart breaks. The chart would reference a non-existent exercise, causing the dashboard chart section to error when trying to join exercise data for the chart title/label.
- **Warning signs:** After deleting an exercise, the dashboard shows an error or blank chart cards. The `ChartSection` component fails to render because `chart.exercises.name` is undefined.
- **Prevention:**
  1. Include `user_charts` in the FK reference check from Pitfall 1. The pre-delete check must query all three tables: `template_exercises`, `workout_log_exercises`, and `user_charts`.
  2. The delete confirmation message should mention charts specifically if applicable: "This exercise is tracked in 2 charts."
  3. Optionally offer to delete the associated charts as part of the exercise deletion flow (cascade in application logic, not DB-level CASCADE).
- **Phase:** Same phase as Pitfall 1 -- the delete confirmation flow.

---

## Moderate Pitfalls

Mistakes that cause poor UX, confusing state, or require significant rework.

---

### Pitfall 5: Logout Button Relocation Breaking User Mental Model

- **Risk:** The project context states that logout should relocate from the dashboard header to the settings menu. Currently, `DashboardSurface` renders a prominent "Logout" button in the top-right header. If logout moves to a Settings surface without clear affordance, users will not find it. This is a well-documented UX anti-pattern: relocating a frequently-used action without providing a migration path.
- **Warning signs:** Users cannot figure out how to log out. Support requests or confusion. Users force-close the app instead of logging out.
- **Prevention:**
  1. Make the Settings gear icon highly visible in the dashboard header (same position or adjacent to where Logout was).
  2. On the Settings surface, place Logout at the bottom of the settings list (standard mobile pattern), styled distinctly (e.g., red text or danger styling).
  3. Consider a brief transitional approach: keep a small Logout link in the header for one release cycle alongside the new Settings entry point. Or at minimum, ensure the gear icon is obviously tappable and labeled.
  4. The ConfirmationModal already exists and supports `confirmVariant: 'danger'` -- reuse it for logout confirmation if desired.
- **Phase:** Settings surface creation phase -- the very first phase should establish the settings entry point AND relocate logout simultaneously. Do not create settings without logout; do not remove logout from dashboard before settings is ready.

---

### Pitfall 6: Surface Navigation State Explosion in main.tsx

- **Risk:** The current `main.tsx` manages surface switching via a single `AppSurface` union type: `'auth' | 'dashboard' | 'templateEditor' | 'workout'`. Adding `'settings'` is straightforward, but if Settings has sub-views (exercise list, exercise edit panel, profile, etc.), the temptation is to add more surface types or nest state management. The current pattern already has 5 pieces of state (`currentSurface`, `editingTemplate`, `activeWorkoutTemplate`, `restoredWorkoutData`, `isPasswordRecoveryMode`) plus refs for closure-safe access. Adding settings sub-navigation state here would make `main.tsx` even more complex.
- **Warning signs:** `main.tsx` grows past 400 lines. New state variables are added for settings sub-views. The render function becomes a deeply nested if/else chain.
- **Prevention:**
  1. Add `'settings'` to the `AppSurface` union but keep ALL settings sub-navigation internal to the `SettingsSurface` component. The settings surface manages its own internal routing (settings menu vs. exercise list vs. exercise edit).
  2. Follow the existing pattern: `TemplateEditorSurface` manages its own internal complexity; `WorkoutSurface` manages its own internal state. The parent `main.tsx` only knows "show settings" or "don't show settings."
  3. The only new state in `main.tsx` should be the `'settings'` option in `AppSurface`. No `editingExercise`, no `settingsTab`, etc.
- **Phase:** Settings surface scaffolding phase. This architectural decision must be made before any sub-views are built.

---

### Pitfall 7: Stale Exercise Data After CRUD Operations

- **Risk:** The `DashboardSurface` loads exercises once on mount via `loadExercises()` and stores them in `availableExercises` state. If a user navigates to Settings, edits/creates/deletes exercises, then returns to the dashboard, the dashboard's exercise list is stale. The `ExercisePickerModal` would show outdated data. Similarly, the `AddChartModal` uses `exercisesWithData` which is fetched separately. Charts referencing deleted exercises would also be stale.
- **Warning signs:** User creates an exercise in Settings, navigates back to dashboard, opens template editor, and the new exercise is not in the picker. Or user deletes an exercise but it still appears in the picker.
- **Prevention:**
  1. Reload dashboard data when returning from Settings to Dashboard. The simplest approach: trigger `loadDashboard()` (or at minimum `loadExercises()`) when the dashboard surface remounts. Currently, `loadDashboard` runs in a `useEffect([], [])` on mount -- if the component unmounts when leaving dashboard and remounts when returning, this already works. Verify this behavior.
  2. If surfaces are kept mounted (tab-based navigation with display toggling), this pattern breaks. In that case, use a callback or shared state to signal "exercises changed, please refresh."
  3. The chosen navigation architecture (Option D with bottom nav) would keep surfaces mounted, making this a real issue. If Option C (settings as a new surface that replaces dashboard), the unmount/remount handles it naturally.
- **Phase:** Must be considered during the navigation architecture phase. The stale data solution depends on whether surfaces unmount or stay mounted.

---

### Pitfall 8: Edit Panel Overlay Z-Index and Scroll Lock Conflicts

- **Risk:** The project context mentions an "edit panel overlay" for exercise editing. The app already has multiple overlay patterns: `modal-overlay` class for `ExercisePickerModal`, `ConfirmationModal`, `AddChartModal`, and the delete chart confirmation modal. If the edit panel uses a different overlay approach (e.g., slide-in panel instead of centered modal), z-index stacking can conflict. Additionally, if a user opens the edit panel and then a delete confirmation modal on top of it, the z-index layering must be correct.
- **Warning signs:** Overlay appears behind another element. Clicking outside the panel closes the wrong overlay. Scroll on the background content bleeds through. Multiple overlays compete for focus.
- **Prevention:**
  1. Reuse the existing `modal-overlay` pattern for consistency. The existing modals all use the same CSS class and click-outside-to-close behavior.
  2. If the edit panel must be a slide-in panel (different from modals), define a clear z-index hierarchy: base content < slide-in panel < modal overlay < confirmation modal.
  3. Never stack more than 2 overlays. If the edit panel is open and user clicks delete, close the edit panel first, then show the delete confirmation. Or show the delete confirmation on top and handle dismiss correctly.
  4. Reuse the `ConfirmationModal` component for delete confirmation -- it already handles overlay clicks and event propagation.
- **Phase:** Exercise edit UI phase. Decide on overlay strategy before building the edit panel.

---

### Pitfall 9: ExercisesService Interface Not Updated for New Methods

- **Risk:** The `ExercisesService` interface in `types/services.ts` does not include `updateExercise` or any "get user-only exercises" method. If you add `updateExercise` to `exercises.ts` without updating the interface, TypeScript will NOT catch the mismatch because the service object is typed `as ExercisesService`. Functions added to the implementation but missing from the interface would work at runtime but violate the project's type-safety pattern. Conversely, if someone consumes the service through the typed interface (e.g., in tests or dependency injection), the new methods would be invisible.
- **Warning signs:** The `updateExercise` function works when called directly but is not available when the service is consumed through its typed interface. IDE autocompletion doesn't show the new method.
- **Prevention:**
  1. Update `ExercisesService` interface in `types/services.ts` BEFORE implementing the function. Add `updateExercise(id: string, fields: { name?: string; category?: ExerciseCategory }): Promise<ServiceResult<Exercise>>`.
  2. Add `getUserExercises(): Promise<ServiceResult<Exercise[]>>` to the interface as well if creating a dedicated user-only fetch.
  3. Follow the existing pattern: interface first, implementation second.
- **Phase:** Service layer phase -- the very first code change before any UI work.

---

## Minor Pitfalls

Mistakes that cause annoyance or minor polish issues.

---

### Pitfall 10: Category Mismatch Between Picker and Management Views

- **Risk:** The `ExercisePickerModal` defines `CATEGORY_OPTIONS` as `['Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other']` (includes "Cardio") while the `ExerciseCategory` type and `getCategories()` function list `['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Other']` (no "Cardio", different order). If the exercise management view defines its own category list, there could be a third variation. Additionally, the database `CHECK` constraint only allows `['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Other']` -- so "Cardio" in the picker form would cause an insert error at the DB level.
- **Warning signs:** User selects "Cardio" when creating an exercise, gets an opaque database error. Category filter dropdowns show different options in different parts of the app.
- **Prevention:**
  1. Use a single source of truth for categories: the `getCategories()` function from the shared service. Import and use it in all UI components.
  2. Remove "Cardio" from `ExercisePickerModal`'s `CATEGORY_OPTIONS` or add "Cardio" to the database constraint -- but be consistent. Given the DB constraint does not include "Cardio," remove it from the picker.
  3. For the management view, import categories from the same shared source. Do not hardcode category arrays in components.
- **Phase:** Can be addressed as a cleanup in the exercise management UI phase, but ideally fix the existing `ExercisePickerModal` inconsistency in the same milestone.

---

### Pitfall 11: Empty State Handling for Zero Custom Exercises

- **Risk:** A new user or a user who has only used system exercises will have zero custom exercises. The "My Exercises" management view must handle this gracefully. If it shows a blank screen or a broken layout, the user won't know what to do.
- **Warning signs:** Blank white space where exercises should be. No clear call-to-action to create an exercise.
- **Prevention:**
  1. Design an empty state component: "You haven't created any custom exercises yet. Create one to get started." with a prominent "Create Exercise" button.
  2. The existing `ExercisePickerModal` has an empty state pattern: `<div class="empty-state"><p>No exercises found</p></div>`. Reuse this pattern but with a more helpful message and CTA.
  3. Also handle the filtered-empty state: "No exercises match your search" when search/filter returns zero results but exercises exist.
- **Phase:** Exercise list UI phase.

---

### Pitfall 12: Form Validation Feedback Timing in Edit Panel

- **Risk:** The existing `ExercisePickerModal` create form uses synchronous validation (check name/category are non-empty) plus async validation (server-side unique check on submit). If the edit panel follows the same pattern but adds inline validation (e.g., "name already exists" shown as user types), the debounce timing and race conditions can produce incorrect validation feedback. For example: user types "Bench Pr" -> debounce fires -> "exercise exists" check returns false -> user finishes typing "Bench Press" -> previous check result is shown as valid -> submit fails because "Bench Press" already exists.
- **Warning signs:** Validation messages flicker or show incorrect state. User sees "name available" but submission fails.
- **Prevention:**
  1. For v3.0, keep validation simple: validate on submit only (same as existing create flow). Do not add real-time "name available" checking.
  2. If real-time validation is desired later, implement proper debouncing with request cancellation (abort controller) so stale responses are discarded.
  3. Show clear error messages from the server response rather than relying solely on client-side prediction.
- **Phase:** Exercise edit UI phase. Keep it simple in v3.0.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Service layer (`updateExercise`) | Pitfall 2 (name duplication), Pitfall 9 (interface mismatch) | Update interface first; implement case-insensitive name validation |
| Settings surface scaffold | Pitfall 5 (logout relocation), Pitfall 6 (state explosion) | Keep sub-nav internal to SettingsSurface; relocate logout atomically |
| Exercise list UI | Pitfall 3 (system exercises in list), Pitfall 11 (empty state) | Use user-only query; design empty state |
| Exercise edit UI | Pitfall 8 (overlay conflicts), Pitfall 12 (validation timing) | Reuse modal patterns; validate on submit only |
| Exercise delete flow | Pitfall 1 (FK violations), Pitfall 4 (chart orphans) | Pre-check all three FK tables; block delete with explanation |
| Navigation/data flow | Pitfall 7 (stale data after CRUD) | Ensure exercise list refreshes when returning to dashboard |
| Cross-cutting | Pitfall 10 (category mismatch) | Single source of truth for categories from shared service |

---

## Sources

- Codebase analysis: `current_schema.sql`, `exercises.ts`, `services.ts`, `main.tsx`, `ExercisePickerModal.tsx`, `DashboardSurface.tsx`, `migration_system_exercises.sql` (HIGH confidence -- direct code reading)
- [Supabase Cascade Deletes documentation](https://supabase.com/docs/guides/database/postgres/cascade-deletes) (HIGH confidence)
- [Supabase FK deletion discussion](https://github.com/orgs/supabase/discussions/6524) (MEDIUM confidence)
- [Toptal: How to Improve App Settings UX](https://www.toptal.com/designers/ux/settings-ux) (MEDIUM confidence)
- [UX Collective: Designing a Better Settings Screen](https://uxdesign.cc/designing-a-better-settings-page-for-your-app-fcc32fe8c724) (MEDIUM confidence)
- [PostgreSQL case-insensitive unique constraints](https://www.postgresql.org/message-id/c57a8ecec259afdc4f4caafc5d0e92eb@mitre.org) (HIGH confidence)
