# Architecture Research: Settings & Exercise Management

**Project:** IronFactor Exercise Tracker
**Researched:** 2026-02-03
**Scope:** How a SettingsSurface and My Exercises view integrate with the existing surface-based Preact app
**Confidence:** HIGH (based entirely on codebase analysis -- no external assumptions needed)

---

## Existing Architecture Summary

The app uses a simple, effective pattern: **state-driven surface routing in `main.tsx`** with no URL router.

```
main.tsx (App component)
  useState<AppSurface>('auth' | 'dashboard' | 'templateEditor' | 'workout')
  |
  |-- AuthSurface          (sub-surfaces: login, register, reset, updatePassword)
  |-- DashboardSurface     (sections: TemplateList, ChartSection)
  |-- TemplateEditorSurface (full-screen, back-navigates to dashboard)
  |-- WorkoutSurface        (full-screen, back-navigates to dashboard)
```

**Key patterns observed:**

1. **Surface = top-level view.** Each surface owns its own header, data loading, and state management.
2. **Navigation via callbacks.** Surfaces receive `onX` props (e.g., `onLogout`, `onSave`, `onCancel`) -- parent controls transitions.
3. **Sub-surface routing.** AuthSurface manages its own sub-views via internal `useState<AuthSubSurface>`. This is the precedent for SettingsSurface with internal menu/sub-view routing.
4. **Shared services are stateless.** `@ironlift/shared` exports service objects (`exercises`, `templates`, etc.) that return `{ data, error }` patterns. No client-side caching or state management library.
5. **Shared UI components in `@/components`.** ConfirmationModal, ExercisePickerModal, InfoModal are shared across surfaces.
6. **Hooks in `@/hooks`.** `useAsyncOperation` for loading/error/success state; `useClickOutside` for dropdown dismissal.

---

## Component Structure

### New Surface: `SettingsSurface`

SettingsSurface follows the AuthSurface precedent: a container surface with internal sub-view routing.

```
surfaces/settings/
  SettingsSurface.tsx        -- Container with menu/sub-view routing
  SettingsMenu.tsx           -- Menu list (My Exercises, Profile, Preferences, Log Out)
  MyExercisesView.tsx        -- Exercise list with search + category filter
  ExerciseRow.tsx            -- Single exercise row (expandable for custom, locked for system)
  ExerciseEditForm.tsx       -- Inline edit form (name + category fields)
  DeleteExerciseConfirm.tsx  -- Inline delete confirmation (replaces edit form)
  index.ts                   -- Barrel exports
```

### Component Hierarchy

```
SettingsSurface
  |-- Header (back arrow + "Settings" title)
  |
  |-- [sub-view: 'menu']
  |     SettingsMenu
  |       |-- Menu item: "My Exercises" --> switches sub-view to 'exercises'
  |       |-- Menu item: "Profile" (disabled, "Coming Soon")
  |       |-- Menu item: "Preferences" (disabled, "Coming Soon")
  |       |-- Menu item: "Log Out" --> calls onLogout prop
  |
  |-- [sub-view: 'exercises']
  |     MyExercisesView
  |       |-- Sub-header ("My Exercises" + back to menu)
  |       |-- Search input
  |       |-- Category filter dropdown
  |       |-- Exercise list
  |       |     ExerciseRow (per exercise)
  |       |       |-- Collapsed: name + category tag + badge (Custom/System)
  |       |       |-- Expanded (custom only):
  |       |             ExerciseEditForm (name input, category select, Save/Cancel/Delete)
  |       |             DeleteExerciseConfirm (warning + confirm/cancel buttons)
  |       |-- "+ Add Exercise" button at bottom
  |
  |-- ConfirmationModal (shared, for delete confirmation -- already exists)
```

### How New Components Fit Existing Patterns

| Pattern | Existing Example | New Component |
|---------|-----------------|---------------|
| Surface with sub-views | AuthSurface + AuthSubSurface type | SettingsSurface + SettingsSubView type |
| Props-based navigation | DashboardSurface.onLogout | SettingsSurface.onBack, .onLogout |
| Service data loading | DashboardSurface.loadExercises() | MyExercisesView.loadExercises() |
| Search + filter | ExercisePickerModal (search + category dropdown) | MyExercisesView (same pattern, reused logic) |
| Async operations | useAsyncOperation in all surfaces | useAsyncOperation in MyExercisesView |
| Confirmation flow | ConfirmationModal for template/chart delete | ConfirmationModal for exercise delete |
| Click-outside dismiss | useClickOutside in ExercisePickerModal | useClickOutside in category dropdown |

---

## Data Flow

### Navigation Flow

```
DashboardSurface                         main.tsx                    SettingsSurface
     |                                      |                            |
     |-- [gear icon click] ------>          |                            |
     |   props.onNavigateSettings()         |                            |
     |                                      |-- setCurrentSurface        |
     |                                      |   ('settings')             |
     |                                      |-- renders SettingsSurface  |
     |                                      |                            |
     |                                      |             [back arrow] --|
     |                                      |<-- props.onBack()          |
     |                                      |-- setCurrentSurface        |
     |                                      |   ('dashboard')            |
     |                                      |                            |
     |                                      |             [Log Out] ----|
     |                                      |<-- props.onLogout()        |
     |                                      |-- handleLogout()           |
```

### Exercise CRUD Data Flow

```
MyExercisesView                     @ironlift/shared              Supabase
     |                                   |                          |
     |-- exercises.getExercises() ------>|                          |
     |                                   |-- supabase.from()  ---->|
     |                                   |<-- { data, error }  ----|
     |<-- { data: Exercise[] } ---------|                          |
     |                                   |                          |
     |-- exercises.updateExercise() ---->|  (NEW: needs creation)  |
     |                                   |-- supabase.update() --->|
     |                                   |<-- { data, error }  ----|
     |<-- { data: Exercise } -----------|                          |
     |                                   |                          |
     |-- exercises.deleteExercise() ---->|  (EXISTS already)       |
     |                                   |-- supabase.delete() --->|
     |                                   |<-- { error }  ----------|
     |<-- { error } --------------------|                          |
     |                                   |                          |
     |-- exercises.createExercise() ---->|  (EXISTS already)       |
     |                                   |-- supabase.insert() --->|
     |                                   |<-- { data, error }  ----|
     |<-- { data: Exercise } -----------|                          |
```

### State Management Within SettingsSurface

```
SettingsSurface (owns):
  - currentSubView: 'menu' | 'exercises'

MyExercisesView (owns):
  - exercisesList: Exercise[]           -- loaded on mount
  - searchQuery: string                 -- search input value
  - selectedCategory: ExerciseCategory | 'All Categories'
  - expandedExerciseId: string | null   -- which exercise row is expanded
  - deleteConfirmId: string | null      -- which exercise shows delete confirmation
  - isLoading / error / successMessage  -- via useAsyncOperation
  - filteredExercises: Exercise[]       -- computed via useMemo (search + category filter)
```

No new global state needed. No state sharing between SettingsSurface and DashboardSurface. If exercises are modified in Settings, DashboardSurface will reload its own exercise data when the user navigates back (same as how TemplateEditorSurface works -- dashboard reloads on mount).

---

## Integration Points with main.tsx

### Changes to `main.tsx`

1. **Extend `AppSurface` union type:**
   ```typescript
   type AppSurface = 'auth' | 'dashboard' | 'templateEditor' | 'workout' | 'settings';
   ```

2. **Add navigation handler:**
   ```typescript
   const handleNavigateSettings = () => {
     setCurrentSurface('settings');
   };

   const handleSettingsBack = () => {
     setCurrentSurface('dashboard');
   };
   ```

3. **Add render branch (before dashboard fallback):**
   ```typescript
   if (currentSurface === 'settings') {
     return (
       <SettingsSurface
         onBack={handleSettingsBack}
         onLogout={handleLogout}
       />
     );
   }
   ```

4. **Pass settings navigation to DashboardSurface:**
   ```typescript
   <DashboardSurface
     onLogout={handleLogout}                    // REMOVE (moves to Settings)
     onNavigateSettings={handleNavigateSettings} // ADD
     onEditTemplate={handleEditTemplate}
     onCreateNewTemplate={handleCreateNewTemplate}
     onStartWorkout={handleStartWorkout}
   />
   ```

### Changes to DashboardSurface

1. **Replace `onLogout` prop with `onNavigateSettings` prop** in the interface.
2. **Replace Logout button with gear icon** in the header (far right).
3. The `onLogout` callback moves to SettingsSurface, which delegates to `main.tsx`.

---

## Shared Service Addition: `updateExercise`

### Required Addition to `packages/shared/src/services/exercises.ts`

```typescript
async function updateExercise(
  id: string,
  fields: { name?: string; category?: ExerciseCategory }
): Promise<ServiceResult<Exercise>>
```

### Required Addition to `ExercisesService` Interface

Add to `packages/shared/src/types/services.ts`:

```typescript
updateExercise(
  id: string,
  fields: { name?: string; category?: ExerciseCategory }
): Promise<ServiceResult<Exercise>>;
```

### Why Only `name` and `category`

The Exercise type has many fields (`equipment`, `instructions`, `level`, `force`, `mechanic`), but:
- `equipment`, `instructions`, `level`, `force`, `mechanic` are only set for system exercises
- User-created exercises only set `name` and `category` via createExercise
- The edit form in the mocks only shows name and category fields
- Keep the update surface minimal -- same fields as create

---

## Component Boundaries

### What Talks to What

```
main.tsx
  |-- [owns] AppSurface state, User state
  |-- [renders] SettingsSurface
  |     |-- [owns] sub-view routing ('menu' | 'exercises')
  |     |-- [renders] SettingsMenu
  |     |     |-- [calls] onLogout (delegated from main.tsx)
  |     |     |-- [calls] onNavigate('exercises') (internal)
  |     |-- [renders] MyExercisesView
  |           |-- [calls] exercises.getExercises() from @ironlift/shared
  |           |-- [calls] exercises.updateExercise() from @ironlift/shared
  |           |-- [calls] exercises.deleteExercise() from @ironlift/shared
  |           |-- [calls] exercises.createExercise() from @ironlift/shared
  |           |-- [renders] ExerciseRow (per exercise)
  |           |-- [renders] ConfirmationModal (from @/components, for delete)
  |-- [renders] DashboardSurface
        |-- [receives] onNavigateSettings prop (new)
        |-- [removes] onLogout prop (moved to Settings)
        |-- [renders] gear icon in header (new)
```

### Boundary Rules

1. **SettingsSurface does NOT access DashboardSurface state.** Each surface loads its own data independently.
2. **MyExercisesView does NOT share exercise state with DashboardSurface.** Dashboard reloads exercises when remounted.
3. **SettingsMenu does NOT handle logout itself.** It delegates via `onLogout` prop to `main.tsx`, which calls `auth.logout()`.
4. **ExerciseRow is a pure presentation component.** It receives an exercise and callbacks; it does not call services directly.
5. **The ConfirmationModal is reused from `@/components`** -- no new modal component needed for delete.

---

## Build Order

The implementation has clear dependency layers. Each phase produces something testable.

### Phase 1: Service Layer (no UI changes)

**Add `updateExercise` to the shared package.**

Dependencies: None (leaf node).

- Add `updateExercise` function to `packages/shared/src/services/exercises.ts`
- Add `updateExercise` method to `ExercisesService` interface in `packages/shared/src/types/services.ts`
- Verify RLS policies allow exercise updates (user can only update their own exercises)

**Why first:** Every UI component downstream depends on this service existing. Building UI before the service means writing untestable code.

### Phase 2: Surface Shell + Navigation Wiring

**Create SettingsSurface with menu, wire navigation from Dashboard.**

Dependencies: Phase 1 (service exists for later phases, but not strictly needed yet).

- Create `surfaces/settings/` directory structure
- Create `SettingsSurface.tsx` with sub-view routing (`'menu' | 'exercises'`)
- Create `SettingsMenu.tsx` with menu items (My Exercises active, Profile/Preferences disabled, Log Out)
- Create `index.ts` barrel export
- Update `surfaces/index.ts` to export SettingsSurface
- Extend `AppSurface` type in `main.tsx` to include `'settings'`
- Add navigation handlers in `main.tsx` (handleNavigateSettings, handleSettingsBack)
- Add render branch for settings surface in `main.tsx`
- Modify `DashboardSurface` props: replace `onLogout` with `onNavigateSettings`
- Replace Logout button with gear icon in DashboardSurface header
- Wire Log Out menu item to `onLogout` prop (delegated through to main.tsx's handleLogout)

**Why second:** Establishes the navigation skeleton. After this phase, you can navigate Dashboard -> Settings -> Menu -> Back, and Log Out works from the new location. This is testable end-to-end without exercise management.

### Phase 3: Exercise List View (Read Only)

**Build MyExercisesView with search, filter, and exercise display.**

Dependencies: Phase 2 (surface shell exists to host the view).

- Create `MyExercisesView.tsx` with exercise loading, search input, category filter dropdown
- Create `ExerciseRow.tsx` as a presentational component (collapsed state only)
- Wire "My Exercises" menu item to switch sub-view to `'exercises'`
- Add back navigation from exercise view to settings menu
- Display all exercises (system + custom) with appropriate badges
- System exercises show lock icon, are not expandable
- Custom exercises are visually distinct but not yet expandable

**Why third:** Establishes the data loading and display patterns. The list is the foundation that edit/delete/create build upon. This is independently testable.

### Phase 4: Exercise Edit (Update)

**Add expandable row with inline edit form for custom exercises.**

Dependencies: Phase 1 (updateExercise service), Phase 3 (exercise list exists).

- Create `ExerciseEditForm.tsx` with name input, category select, Save/Cancel/Delete buttons
- Add expand/collapse behavior to ExerciseRow (click to expand custom exercises)
- Add accordion behavior (only one expanded at a time)
- Wire Save button to `exercises.updateExercise()`
- Handle optimistic UI update on save (update local state, then confirm with server)
- Handle validation (name required, name uniqueness)
- Handle error display within the edit form

**Why fourth:** Edit is more complex than read but simpler than delete (no dependency warnings). Building edit first means the expand/collapse UX is proven before adding delete confirmation complexity.

### Phase 5: Exercise Delete

**Add delete confirmation flow within expanded row.**

Dependencies: Phase 4 (expandable row and edit form exist).

- Create `DeleteExerciseConfirm.tsx` inline component (replaces edit form when active)
- Wire Delete button in edit form to show confirmation state
- Wire confirmation Cancel to return to edit form
- Wire confirmation Delete to `exercises.deleteExercise()`
- Remove exercise from local list on successful delete
- Handle dependency warnings (exercise used in templates or workout logs)
- Animate row removal on delete

**Why fifth:** Delete builds on top of the expand/collapse mechanics from Phase 4. The delete confirmation replaces the edit form within the same expanded area.

### Phase 6: Exercise Create

**Add "Create Exercise" flow at bottom of exercise list.**

Dependencies: Phase 3 (exercise list exists).

- Wire "+ Add Exercise" button at bottom of exercise list
- On click: append a new blank ExerciseRow in expanded/edit state
- Reuse `ExerciseEditForm.tsx` for creation (same fields, different submit handler)
- Wire Save to `exercises.createExercise()`
- On successful create: add to local list, collapse row
- On Cancel for new unsaved exercise: remove the row entirely
- Handle validation (name required, category required, name uniqueness)

**Why sixth:** Create reuses the same ExerciseEditForm from Phase 4, so it has minimal new component work. But it has unique UX (adding a temporary row that can be cancelled without a delete confirmation). Separating it from Phase 4 keeps each phase focused.

### Dependency Graph

```
Phase 1: updateExercise service
    |
    v
Phase 2: Surface shell + navigation
    |
    v
Phase 3: Exercise list (read)
    |         \
    v          v
Phase 4: Edit   Phase 6: Create
    |
    v
Phase 5: Delete
```

Phases 4, 5, and 6 can be reordered relative to each other if needed, but the recommended order (Edit -> Delete -> Create) follows increasing UX complexity and ensures each phase builds on proven mechanics.

---

## Anti-Patterns to Avoid

### 1. Do NOT Lift Exercise State to main.tsx

**Temptation:** Share exercise data between DashboardSurface and SettingsSurface to avoid double-loading.

**Why bad:** Breaks the surface independence pattern. Every other surface loads its own data on mount. Adding shared state creates coupling, re-render cascades, and stale data bugs.

**Instead:** Each surface loads exercises independently. DashboardSurface reloads when it mounts (which happens on navigation back from settings). This is the same pattern used when returning from TemplateEditorSurface.

### 2. Do NOT Create a New Modal for Exercise Editing

**Temptation:** Build an ExerciseEditModal like the ExercisePickerModal.

**Why bad:** The mocks clearly show inline editing within expandable rows, not a separate modal. A modal would be inconsistent with the approved design and adds unnecessary overlay management.

**Instead:** Edit form is inline within the expanded ExerciseRow component. The row expands to reveal the form and collapses to dismiss it.

### 3. Do NOT Add URL Routing for This Feature

**Temptation:** Add a client-side router (e.g., preact-router) to handle Settings navigation.

**Why bad:** The entire app uses `useState` for surface switching. Introducing a router for one surface creates inconsistency and increases bundle size for no benefit.

**Instead:** Follow the existing pattern: `useState` in main.tsx for top-level surfaces, `useState` within SettingsSurface for sub-views.

### 4. Do NOT Make ExerciseRow Call Services Directly

**Temptation:** Have ExerciseRow import and call `exercises.updateExercise()` directly.

**Why bad:** Breaks the established pattern where the parent surface/view component orchestrates service calls. ExerciseRow should be a presentational component that receives data and callbacks.

**Instead:** MyExercisesView handles all service calls and passes callbacks to ExerciseRow (e.g., `onSave`, `onDelete`).

### 5. Do NOT Skip the Disabled Menu Items

**Temptation:** Only render "My Exercises" and "Log Out" since Profile and Preferences are not implemented.

**Why bad:** The menu should communicate the full vision. Disabled items with "Coming Soon" tooltips set user expectations and validate the information architecture.

**Instead:** Render all four menu items. My Exercises and Log Out are active. Profile and Preferences are disabled with visual indication.

---

## Scalability Considerations

| Concern | Current (v3.0) | Future Growth |
|---------|----------------|---------------|
| Number of exercises | ~50-200 (system + custom) | Virtual scrolling if >500 |
| Settings menu items | 4 items | Add more items trivially (same list pattern) |
| Sub-views within settings | 1 active (exercises) | Add Profile, Preferences as separate view components |
| Exercise fields | name + category | Extend ExerciseEditForm; updateExercise fields parameter already supports Partial |

The SettingsSurface sub-view pattern (like AuthSurface sub-surface pattern) scales well because each sub-view is an independent component. Adding Profile settings later means creating a `ProfileView.tsx` and adding `'profile'` to the `SettingsSubView` union type -- no architectural changes needed.

---

## Sources

All findings derived from direct codebase analysis:

- `apps/web/src/main.tsx` -- surface routing pattern, navigation handlers
- `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` -- data loading, header layout, prop patterns
- `apps/web/src/surfaces/auth/AuthSurface.tsx` -- sub-surface routing precedent
- `apps/web/src/surfaces/template-editor/TemplateEditorSurface.tsx` -- surface prop patterns
- `apps/web/src/components/ExercisePickerModal.tsx` -- search/filter/category dropdown patterns
- `apps/web/src/components/ConfirmationModal.tsx` -- reusable delete confirmation
- `apps/web/src/hooks/useAsyncOperation.ts` -- async state management pattern
- `apps/web/src/hooks/useClickOutside.ts` -- dropdown dismiss pattern
- `packages/shared/src/services/exercises.ts` -- existing CRUD operations
- `packages/shared/src/types/services.ts` -- service interface patterns
- `packages/shared/src/types/database.ts` -- Exercise type, ExerciseCategory, ExerciseUpdate type
- `.planning/exercise-management-suggestions.md` -- design options analysis
- `mocks/option-c-v5.html` -- approved design direction (expandable rows, inline editing)
