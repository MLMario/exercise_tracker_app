# Phase 18: Exercise List - Research

**Researched:** 2026-02-03
**Domain:** Preact component + CSS within existing Settings panel architecture
**Confidence:** HIGH

## Summary

Phase 18 adds a "My Exercises" list view inside the existing Settings panel. The codebase already has all necessary infrastructure: `SettingsPanel.tsx` with `PanelView` state management and a placeholder for the exercises view, `getUserExercises()` service function that fetches user-created exercises sorted alphabetically, and exercise row CSS styles (`.exercise-item-name`, `.exercise-item-category`) from the ExercisePickerModal.

The implementation is straightforward -- create a `MyExercisesList` component that calls `getUserExercises()` on mount, renders rows matching the exercise picker's two-line layout (name + category), handles empty state with text and a placeholder create button, and replace the placeholder div in `SettingsPanel.tsx`. No new libraries, no new service functions, no new backend changes needed.

**Primary recommendation:** Create a single new component `MyExercisesList.tsx` that reuses existing CSS classes from the exercise picker for row styling, adds minimal new CSS for the my-exercises container and empty state variant, and integrates into the existing `SettingsPanel.tsx` panelView switch.

## Standard Stack

### Core (Already in Codebase)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Preact | existing | UI framework (with hooks) | Project standard |
| @ironlift/shared | existing | `exercises.getUserExercises()` service | Already implemented, returns user exercises sorted A-Z |
| CSS (styles.css) | existing | Styling via CSS classes | Project standard -- no CSS-in-JS |

### Supporting (Already in Codebase)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| useAsyncOperation hook | existing | Loading/error state management | For the fetch call on mount |

### New Libraries Needed
None. Everything required is already in the codebase.

## Architecture Patterns

### Component Integration Point

The `SettingsPanel.tsx` already has the integration point ready:

```typescript
// Current code in SettingsPanel.tsx (lines 77-80)
{panelView === 'exercises' && (
  <div class="my-exercises-placeholder">
    My Exercises content coming soon
  </div>
)}
```

Replace this placeholder with the new `MyExercisesList` component.

### Recommended File Structure
```
apps/web/src/surfaces/dashboard/
  SettingsPanel.tsx          # MODIFY - import and render MyExercisesList
  SettingsMenu.tsx           # NO CHANGE
  MyExercisesList.tsx        # NEW - exercise list component
apps/web/css/
  styles.css                 # MODIFY - add my-exercises-* CSS classes
```

### Pattern 1: Component with Data Fetching on Mount
**What:** Component calls service function in useEffect, manages loading/error/data states
**When to use:** When a sub-view needs its own data separate from parent
**Why here:** The exercise list needs fresh data each time the user navigates to it, not stale parent-cached data

```typescript
// Pattern from existing codebase (DashboardSurface.tsx)
import { useState, useEffect } from 'preact/hooks';
import type { Exercise } from '@ironlift/shared';
import { exercises } from '@ironlift/shared';

export function MyExercisesList() {
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setIsLoading(true);
    const { data, error } = await exercises.getUserExercises();
    if (error) {
      setError('Failed to load exercises');
    } else {
      setUserExercises(data || []);
    }
    setIsLoading(false);
  };

  // ... render
}
```

### Pattern 2: Reuse Existing CSS Classes for Row Layout
**What:** Use the same `.exercise-item-info`, `.exercise-item-name`, `.exercise-item-category` classes from the exercise picker
**When to use:** When the design spec says "match existing exercise picker row style"
**Why here:** CONTEXT.md explicitly says to match picker row style (15px bold name, 12px muted gray category)

```html
<!-- Existing exercise picker row structure (ExercisePickerModal.tsx lines 328-341) -->
<div class="exercise-list-item">
  <div class="exercise-item-info">
    <span class="exercise-item-name">{exercise.name}</span>
    <span class="exercise-item-category">{exercise.category}</span>
  </div>
</div>
```

For the My Exercises view, reuse the inner structure but with a different outer wrapper (no click handler, no cursor pointer, no badge):

```html
<div class="my-exercises-row">
  <div class="exercise-item-info">
    <span class="exercise-item-name">{exercise.name}</span>
    <span class="exercise-item-category">{exercise.category}</span>
  </div>
</div>
```

### Pattern 3: Empty State with Placeholder Button
**What:** Text message + styled button that does nothing yet
**When to use:** When a future phase will wire up the action
**Why here:** Create button exists but Phase 21 wires it up

### Anti-Patterns to Avoid
- **Reusing `.exercise-list-item` class directly:** It has `cursor: pointer` and hover effects meant for clickable items. My Exercises rows are NOT tappable (Phase 19 adds that). Use a new wrapper class.
- **Fetching exercises in the parent (SettingsPanel):** Keep data fetching in the component that uses it. SettingsPanel should remain a thin shell.
- **Using `useAsyncOperation` for simple fetch:** The hook is designed for user-triggered operations with success messages. A simple mount-fetch only needs loading/error states -- useState is sufficient and simpler.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fetching user exercises | Custom Supabase query | `exercises.getUserExercises()` | Already implemented, filters by user_id + is_system=false, sorts A-Z |
| Exercise row layout | New CSS layout | `.exercise-item-info`, `.exercise-item-name`, `.exercise-item-category` | Exact styles already exist in styles.css |
| Loading state | Custom loading component | Simple conditional render `{isLoading && <div>Loading...</div>}` | Pattern used throughout codebase |
| Panel view switching | Router or new state management | `panelView` state in SettingsPanel.tsx | Already implemented with 'menu' | 'exercises' union type |
| Panel header/back button | New header component | Already in SettingsPanel.tsx | Header title and back button already switch based on panelView |

**Key insight:** The SettingsPanel already handles the navigation flow (view switching, header title, back button). The new component only needs to render list content and empty state.

## Common Pitfalls

### Pitfall 1: Making Rows Tappable
**What goes wrong:** Adding click handlers or cursor:pointer to exercise rows
**Why it happens:** Natural instinct to make list items interactive
**How to avoid:** CONTEXT.md explicitly says "Rows are not tappable (Phase 19 will add expand-to-edit)." Use a non-interactive wrapper class.
**Warning signs:** `onClick` on exercise rows, `cursor: pointer` in new CSS

### Pitfall 2: Wiring Up the Create Button
**What goes wrong:** Making the create button actually open the create exercise modal
**Why it happens:** It seems obvious to wire it up
**How to avoid:** CONTEXT.md says "Create button exists but is non-functional until Phase 21." Render a button that looks like a button but has no onClick handler (or a no-op handler). Style it as enabled but don't connect it.
**Warning signs:** Import of ExercisePickerModal or createExercise service

### Pitfall 3: Adding Search/Filter Controls
**What goes wrong:** Including search input or category dropdown
**Why it happens:** The original requirements mentioned search/filter, and the exercise picker has them
**How to avoid:** CONTEXT.md explicitly defers search (LIST-V2-02) and category filter (LIST-V2-03). "No search or filter controls -- keep view simple."
**Warning signs:** Search input elements, category dropdown, filter state

### Pitfall 4: Not Refreshing Data on Re-navigation
**What goes wrong:** Showing stale data when user navigates back and forth between settings menu and exercises
**Why it happens:** Component may not re-fetch when panelView changes back to 'exercises'
**How to avoid:** Either re-fetch when the component mounts (if it unmounts when switching views, which it does since SettingsPanel uses conditional rendering `{panelView === 'exercises' && ...}`), or pass a key prop to force remount.
**Warning signs:** Stale exercise list after creating exercises elsewhere

### Pitfall 5: Showing System Exercises
**What goes wrong:** Displaying system exercises (the 873 pre-loaded ones) in the list
**Why it happens:** Using `getExercises()` instead of `getUserExercises()`
**How to avoid:** Use `exercises.getUserExercises()` which filters `is_system=false` and `user_id=currentUser.id`
**Warning signs:** Hundreds of exercises appearing in the list

## Code Examples

### Complete MyExercisesList Component Structure

```typescript
// Source: Based on existing codebase patterns
import { useState, useEffect } from 'preact/hooks';
import type { Exercise } from '@ironlift/shared';
import { exercises } from '@ironlift/shared';

export function MyExercisesList() {
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      const { data, error: fetchError } = await exercises.getUserExercises();
      if (fetchError) {
        setError('Failed to load exercises');
      } else {
        setUserExercises(data || []);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) {
    return <div class="my-exercises-loading">Loading exercises...</div>;
  }

  if (error) {
    return <div class="error-message">{error}</div>;
  }

  if (userExercises.length === 0) {
    return (
      <div class="my-exercises-empty">
        <p class="my-exercises-empty-text">
          You haven't created any custom exercises yet.
        </p>
        <button type="button" class="btn btn-primary">
          Create Exercise
        </button>
      </div>
    );
  }

  return (
    <div class="my-exercises-list">
      {userExercises.map((exercise) => (
        <div key={exercise.id} class="my-exercises-row">
          <div class="exercise-item-info">
            <span class="exercise-item-name">{exercise.name}</span>
            <span class="exercise-item-category">{exercise.category}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### SettingsPanel Integration

```typescript
// Source: Existing SettingsPanel.tsx (modify)
import { MyExercisesList } from './MyExercisesList';

// Replace placeholder:
{panelView === 'exercises' && (
  <MyExercisesList />
)}
```

### CSS for My Exercises View

```css
/* New CSS classes needed */
.my-exercises-list {
  display: flex;
  flex-direction: column;
}

.my-exercises-row {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  /* No cursor: pointer -- rows are not tappable in this phase */
}

.my-exercises-empty {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-md);
}

.my-exercises-empty-text {
  color: var(--color-text-muted);
  font-size: 1rem;
  margin-bottom: var(--spacing-lg);
}

.my-exercises-loading {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A | getUserExercises() service function | Phase 16 | Ready-to-use, no changes needed |
| Placeholder div in SettingsPanel | Real component | Phase 18 (this phase) | Replace placeholder with MyExercisesList |

**Already implemented and ready to use:**
- `exercises.getUserExercises()` -- filters user_id + is_system=false, sorts A-Z
- `SettingsPanel.tsx` -- panelView state, header title switching, back button navigation
- Exercise row CSS classes -- `.exercise-item-info`, `.exercise-item-name`, `.exercise-item-category`
- Empty state CSS -- `.empty-state`, `.empty-state-message` (can reuse or create specific variant)

## Open Questions

1. **Create button styling (Claude's Discretion)**
   - What we know: Button exists but is non-functional until Phase 21
   - What's unclear: Should it be styled as `btn-primary` (looks active but does nothing) or visually indicate it's a placeholder?
   - Recommendation: Use `btn-primary` to look ready. No disabled state -- it just won't have an onClick. This avoids confusing future wiring.

2. **Loading state presentation (Claude's Discretion)**
   - What we know: Need some loading indicator while getUserExercises() runs
   - What's unclear: Full-area loading text vs spinner vs shimmer
   - Recommendation: Simple centered text "Loading exercises..." matching existing patterns in the codebase (DashboardSurface uses `<div class="loading-indicator">Loading dashboard...</div>`)

3. **Empty state message wording (Claude's Discretion)**
   - What we know: Text message + create button, no icon/illustration
   - Recommendation: "You haven't created any custom exercises yet." -- friendly, informative, not overly wordy

## Sources

### Primary (HIGH confidence)
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` -- existing panel with PanelView state and placeholder
- `apps/web/src/surfaces/dashboard/SettingsMenu.tsx` -- menu navigation to exercises view
- `apps/web/src/components/ExercisePickerModal.tsx` -- exercise row layout to match
- `packages/shared/src/services/exercises.ts` -- getUserExercises() implementation
- `packages/shared/src/types/database.ts` -- Exercise type definition
- `apps/web/css/styles.css` -- existing CSS classes for exercise items, settings panel, empty state

### Secondary (MEDIUM confidence)
- `.planning/phases/18-exercise-list/18-CONTEXT.md` -- user decisions constraining implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all code examined directly in codebase
- Architecture: HIGH - integration point is explicit (placeholder exists in SettingsPanel.tsx)
- Pitfalls: HIGH - derived from CONTEXT.md constraints and codebase patterns
- Code examples: HIGH - based on verified existing patterns in the codebase

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (stable -- no external dependencies or fast-moving APIs)
