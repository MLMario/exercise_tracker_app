# Exercise Management — Design Suggestions

## Context

IronFactor currently has no dedicated UI for editing or deleting user-created (custom) exercises. The only way to create an exercise is through the **ExercisePickerModal**, which is accessed while building or logging a template. The backend service layer already supports `create`, `delete`, and `read` for exercises, and an `ExerciseUpdate` type exists in the shared types — but there is no `updateExercise` service function and no management UI.

### Current App Structure

```
Surfaces:  auth | dashboard | templateEditor | workout
```

- **No shared navigation** — each surface renders its own header.
- **DashboardSurface** contains two sections: "My Templates" and "Progress Charts".
- Surface switching is handled via `useState` in `main.tsx`; there is no URL-based router.

---

## Option A — New "My Exercises" Surface

Add a fifth surface (`exercises`) accessible from the dashboard via a button or link near the header area.

### Layout

```
┌──────────────────────────────────┐
│  IronFactor              Logout  │
├──────────────────────────────────┤
│  ← Back to Dashboard            │
│                                  │
│  My Exercises          + Create  │
│  ┌────────────────────────────┐  │
│  │ Category: [All ▾]         │  │
│  │ Search: [____________]    │  │
│  ├────────────────────────────┤  │
│  │ Barbell RDL        Legs   │  │
│  │                   [✎] [🗑] │  │
│  │ Bench Press       Chest   │  │
│  │                   [✎] [🗑] │  │
│  │ ...                       │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### What Changes

| Area               | Change                                                              |
| ------------------ | ------------------------------------------------------------------- |
| `main.tsx`         | Add `'exercises'` to `AppSurface` union; render new surface.        |
| New surface dir    | `surfaces/exercises/` with `ExerciseManagerSurface.tsx`.            |
| Shared services    | Add `updateExercise(id, fields)` to `exercises.ts`.                 |
| Dashboard          | Add "My Exercises" link/button in the header or below templates.    |

### Pros
- Clean separation of concerns; dedicated space for exercise CRUD.
- Room to grow (instructions, equipment tags, muscle groups).
- Doesn't clutter the dashboard.

### Cons
- Adds a new surface and navigation path.
- Users must leave the dashboard to manage exercises.

---

## Option B — Exercise Management Section on the Dashboard

Add a collapsible **"My Exercises"** section directly on the `DashboardSurface`, below "Progress Charts". Each custom exercise renders as a row with edit/delete icons — same pattern as template cards.

### Layout

```
┌──────────────────────────────────┐
│  IronFactor              Logout  │
├──────────────────────────────────┤
│  My Templates          + Create  │
│  ┌─────────┐  ┌─────────┐       │
│  │  Leg    │  │Push Day │       │
│  │ [Start] │  │ [Start] │       │
│  └─────────┘  └─────────┘       │
│                                  │
│  Progress Charts      + Add     │
│  ┌────────────────────────────┐  │
│  │  Chart ...                 │  │
│  └────────────────────────────┘  │
│                                  │
│  My Exercises ▾        + New    │
│  ┌────────────────────────────┐  │
│  │ Barbell RDL     Legs [✎][🗑]│ │
│  │ Bench Press    Chest [✎][🗑]│ │
│  │ ...                        │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### What Changes

| Area               | Change                                                              |
| ------------------ | ------------------------------------------------------------------- |
| `DashboardSurface` | Add `ExerciseManagerSection` component below charts.                 |
| New component      | `surfaces/dashboard/ExerciseSection.tsx`.                           |
| Shared services    | Add `updateExercise(id, fields)` to `exercises.ts`.                 |

### Pros
- No new surface or routing changes.
- Consistent with existing card-based patterns (template cards use same edit/delete icons).
- Everything on one page.

### Cons
- Dashboard gets longer; could feel crowded with many exercises.
- May need pagination or "show more" to stay usable.

---

## Option C — Settings/Profile Surface with Exercise Management Tab

Add a "Settings" surface accessible from the dashboard header (gear icon or link near Logout). Include an "Exercises" tab inside it. This page can also host future settings (units, theme, account).

### Layout

```
┌──────────────────────────────────┐
│  ← Settings                      │
├──────────────────────────────────┤
│  [Profile] [Exercises] [Prefs]   │
│  ────────────────────────────────│
│                                  │
│  My Exercises          + Create  │
│  ┌────────────────────────────┐  │
│  │ Barbell RDL     Legs [✎][🗑]│ │
│  │ Bench Press    Chest [✎][🗑]│ │
│  │ ...                        │  │
│  └────────────────────────────┘  │
│                                  │
│  Editing: Barbell RDL            │
│  Name:     [Barbell RDL_____]    │
│  Category: [Legs ▾]              │
│  [Cancel] [Save]                 │
└──────────────────────────────────┘
```

### What Changes

| Area               | Change                                                              |
| ------------------ | ------------------------------------------------------------------- |
| `main.tsx`         | Add `'settings'` to `AppSurface` union.                             |
| New surface dir    | `surfaces/settings/` with tabs for Profile, Exercises, Preferences. |
| Dashboard header   | Add gear icon / "Settings" link next to Logout.                     |
| Shared services    | Add `updateExercise(id, fields)` to `exercises.ts`.                 |

### Pros
- Keeps dashboard focused on workouts and progress.
- Natural home for management and configuration features.
- Extensible for future settings (units, theme, notifications).

### Cons
- Exercises are more "hidden"; users need to navigate to Settings to find them.
- Slightly more work to build (tabbed layout, settings infrastructure).

---

## Option D — Bottom Navigation Bar with Surface Reorganization

Replace the current single-surface dashboard with a **persistent bottom navigation bar** that divides the app into three top-level sections. This restructures the app's information architecture:

```
Workouts  — template creation, editing, and workout logging
Dashboard — progress charts and analytics
Settings  — profile management and exercise CRUD
```

### Layout

```
┌──────────────────────────────────┐
│  IronFactor              Logout  │
├──────────────────────────────────┤
│                                  │
│  (Active surface content here)   │
│                                  │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│  🏋 Workouts  📊 Dashboard  ⚙ Settings │
└──────────────────────────────────┘
```

#### Workouts Surface (replaces current template section of dashboard)

```
┌──────────────────────────────────┐
│  IronFactor                      │
├──────────────────────────────────┤
│  My Templates          + Create  │
│  ┌─────────┐  ┌─────────┐       │
│  │  Leg    │  │Push Day │       │
│  │ [✎][🗑] │  │ [✎][🗑] │       │
│  │ [Start] │  │ [Start] │       │
│  └─────────┘  └─────────┘       │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│  🏋 Workouts  📊 Dashboard  ⚙ Settings │
└──────────────────────────────────┘
```

#### Dashboard Surface (charts only)

```
┌──────────────────────────────────┐
│  IronFactor                      │
├──────────────────────────────────┤
│  Progress Charts      + Add     │
│  ┌────────────────────────────┐  │
│  │  Cable Elbow Tricep ...   │  │
│  │  [chart graph]             │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Bench Press - Max Weight  │  │
│  │  [chart graph]             │  │
│  └────────────────────────────┘  │
├──────────────────────────────────┤
│  🏋 Workouts  📊 Dashboard  ⚙ Settings │
└──────────────────────────────────┘
```

#### Settings Surface

```
┌──────────────────────────────────┐
│  Settings                        │
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │ 👤 Profile                 │  │
│  │    Account info, password  │  │
│  ├────────────────────────────┤  │
│  │ 🏋 My Exercises            │  │
│  │    Manage custom exercises │  │
│  ├────────────────────────────┤  │
│  │ 🚪 Log Out                 │  │
│  └────────────────────────────┘  │
│                                  │
│                                  │
├──────────────────────────────────┤
│  🏋 Workouts  📊 Dashboard  ⚙ Settings │
└──────────────────────────────────┘
```

#### Settings → My Exercises (sub-surface)

```
┌──────────────────────────────────┐
│  ← My Exercises        + Create  │
├──────────────────────────────────┤
│  Category: [All ▾]               │
│  Search: [__________________]    │
│  ┌────────────────────────────┐  │
│  │ Barbell RDL         Legs  │  │
│  │                   [✎] [🗑] │  │
│  ├────────────────────────────┤  │
│  │ Bench Press        Chest  │  │
│  │                   [✎] [🗑] │  │
│  ├────────────────────────────┤  │
│  │ Bulgarian Split    Legs   │  │
│  │                   [✎] [🗑] │  │
│  └────────────────────────────┘  │
├──────────────────────────────────┤
│  🏋 Workouts  📊 Dashboard  ⚙ Settings │
└──────────────────────────────────┘
```

### What Changes

| Area                    | Change                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `main.tsx`              | Redefine `AppSurface` to `'workouts' \| 'dashboard' \| 'settings'`.                 |
|                         | Add `BottomNav` component rendered when authenticated.                               |
|                         | `templateEditor` and `workout` become overlay/full-screen surfaces above the tabs.   |
| `BottomNav` (new)       | New shared component: three tab buttons, highlights active surface.                  |
| `surfaces/workouts/`    | New surface — extracts template list from current dashboard.                         |
| `surfaces/dashboard/`   | Refactored — keeps only chart section.                                               |
| `surfaces/settings/`    | New surface — menu with Profile, My Exercises, Log Out.                              |
| `ExerciseManager` (new) | Sub-view within Settings for listing, editing, and deleting custom exercises.         |
| Shared services         | Add `updateExercise(id, fields)` to `exercises.ts`.                                  |
| Shared styles           | Add bottom nav bar styles; adjust surface content area to account for nav bar height. |

### Navigation Model

```
Bottom Nav (persistent when authenticated)
├── Workouts
│   ├── Template list (grid of cards)
│   ├── → Template Editor (full-screen overlay, hides bottom nav)
│   └── → Workout Logger  (full-screen overlay, hides bottom nav)
├── Dashboard
│   ├── Charts list
│   └── → Add Chart Modal
└── Settings
    ├── Profile
    ├── My Exercises
    │   ├── Exercise list (search + filter)
    │   ├── → Edit exercise (inline or modal)
    │   └── → Delete exercise (confirmation modal)
    └── Log Out
```

### Pros
- Proper app-wide navigation that scales with future features.
- Each section has a clear purpose; no overcrowded single page.
- Bottom nav is the standard mobile pattern — intuitive for users.
- Template Editor and Workout Logger stay full-screen (as they are now) by hiding the nav bar during those flows.
- Settings surface is extensible for profile, preferences, units, theme, etc.

### Cons
- Largest scope of work — requires restructuring the surface model and splitting the current dashboard.
- Bottom nav takes ~50px of vertical space on every screen.
- The current dashboard's single-page simplicity is lost.

---

## Shared Requirement: `updateExercise` Service

All four options require adding an update function to the exercise service:

```typescript
// packages/shared/src/services/exercises.ts
async function updateExercise(
  id: string,
  fields: { name?: string; category?: ExerciseCategory }
): Promise<ServiceResult<Exercise>>
```

Additionally, the delete flow should check for dependencies:
- Is the exercise referenced in any `template_exercises`?
- Is the exercise referenced in any `workout_log_exercises`?

If so, the UI should warn the user or prevent deletion accordingly.

---

## Comparison Matrix

| Criteria                  | Option A          | Option B          | Option C          | Option D          |
| ------------------------- | ----------------- | ----------------- | ----------------- | ----------------- |
| Scope of changes          | Small             | Small             | Medium            | Large             |
| Navigation changes        | Minimal           | None              | Minimal           | Full restructure  |
| Discoverability           | Good              | Best              | Low               | Best              |
| Scalability               | Good              | Limited           | Good              | Best              |
| Dashboard clutter         | None              | Some              | None              | None              |
| Future extensibility      | Medium            | Low               | High              | Highest           |
| Mobile UX pattern         | Non-standard      | Non-standard      | Non-standard      | Standard (tab bar)|
