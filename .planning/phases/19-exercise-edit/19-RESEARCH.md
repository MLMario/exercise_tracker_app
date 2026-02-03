# Phase 19: Exercise Edit - Research

**Researched:** 2026-02-03
**Domain:** Inline accordion edit form for exercise name/category in Preact + CSS
**Confidence:** HIGH

## Summary

This phase adds inline accordion editing to the `MyExercisesList` component (Phase 18 output). Users tap a pencil icon on an exercise row to expand an inline edit form with name input, category dropdown, and Save/Cancel buttons. The entire backend (`updateExercise`) already exists with full validation (empty name, invalid characters, duplicate detection). The UI work is purely frontend: expanding the row, rendering a form, calling the service, and handling results.

The codebase already has a proven accordion pattern (workout exercise cards using `max-height` CSS transitions), existing form input/select styles, button classes (`btn-primary`, `btn-secondary`), and error display patterns. The edit form should reuse these patterns directly rather than inventing new ones. The `exercises.getCategories()` function returns the canonical category list.

**Primary recommendation:** Build the edit accordion directly into `MyExercisesList.tsx` using CSS `max-height` transitions (matching the existing workout card accordion pattern), the existing `updateExercise` service function, and native `<select>` for category dropdown. No new dependencies needed.

## Standard Stack

### Core (Already in codebase -- nothing new to install)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Preact | existing | UI rendering, hooks (useState, useEffect, useCallback) | Already the app framework |
| @ironlift/shared | existing | `exercises.updateExercise()`, `exercises.getCategories()`, types | Already provides the backend service |

### Supporting (Already in codebase)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS transitions | native | `max-height` accordion animation | Expand/collapse animation |
| Native `<select>` | native | Category dropdown | Styled globally in styles.css |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS max-height | JavaScript height calculation | More precise but unnecessary complexity; max-height works for known small form heights |
| Native `<select>` | Custom dropdown (like ExercisePickerModal) | Custom dropdown is overkill for 7 fixed options; native select already styled in the app |

**Installation:** None required. All dependencies already present.

## Architecture Patterns

### Current MyExercisesList Structure (Phase 18)
```
MyExercisesList (functional component)
  state: userExercises[], isLoading, error
  renders: loading | error | empty state | list of rows
  each row: <div class="my-exercises-row"> with exercise-item-info (name + category)
```

### Recommended Component Structure (Phase 19)
```
MyExercisesList (enhanced)
  state: userExercises[], isLoading, error
  NEW state: expandedId (string | null), editName, editCategory, isSaving, validationErrors
  renders:
    each row: <div class="my-exercises-row">
      exercise-item-info (name + category)
      NEW: pencil icon button (triggers expand)
      NEW: <div class="my-exercises-edit-form"> (conditionally rendered/expanded)
        name input (text, pre-filled, placeholder "Exercise name")
        category select (pre-filled, native <select>)
        inline error messages below fields
        Cancel + Save buttons
```

### Pattern 1: Single-Expansion Accordion
**What:** Only one row expanded at a time. Clicking another row's pencil auto-collapses current.
**When to use:** When editing context is per-row and multiple simultaneous edits are undesirable.
**Implementation:**
```typescript
// Single state controls which row is expanded
const [expandedId, setExpandedId] = useState<string | null>(null);

// Clicking pencil icon on a row
const handleEditClick = (exercise: Exercise) => {
  // If clicking same row, collapse it
  if (expandedId === exercise.id) {
    setExpandedId(null);
    return;
  }
  // Expand new row, discard any unsaved changes silently
  setExpandedId(exercise.id);
  setEditName(exercise.name);
  setEditCategory(exercise.category);
  setNameError('');
};
```

### Pattern 2: CSS max-height Accordion (Existing Pattern)
**What:** Expand/collapse via CSS `max-height` transition from 0 to a generous value.
**When to use:** For smooth slide-down/up animation without JavaScript height calculation.
**Existing usage in codebase:**
```css
/* From workout card accordion (lines 1457-1465) */
.exercise-workout-card .card-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.exercise-workout-card.expanded .card-body {
  max-height: 600px;
}
```
**Adaptation for edit form:**
```css
.my-exercises-edit-form {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.my-exercises-row.editing .my-exercises-edit-form {
  max-height: 300px; /* Form is small: ~200px actual height */
}
```

### Pattern 3: Dirty Check for Save Button
**What:** Save button disabled until user changes something from original values.
**When to use:** Per CONTEXT.md -- "Save button disabled until user actually changes something."
```typescript
const hasChanges = editName !== originalName || editCategory !== originalCategory;
// Save button: disabled={!hasChanges || isSaving}
```

### Pattern 4: Validation Error Display
**What:** Inline error messages below the offending field.
**When to use:** Per CONTEXT.md -- "Errors displayed inline below the offending field."
**Existing pattern:** The app uses `.error-message` class (red background, red text, bordered box). For inline field errors, a simpler approach is better:
```css
.field-error {
  color: var(--color-danger);
  font-size: 0.8125rem;
  margin-top: var(--spacing-xs);
}
```

### Pattern 5: Success Flash Before Collapse
**What:** Brief green highlight on the row after successful save, then auto-collapse.
**When to use:** Per CONTEXT.md -- "Brief success flash (green highlight or checkmark)."
```typescript
// After successful save:
setSuccessId(exercise.id);
// Update the exercise in local state
setUserExercises(prev => prev.map(ex => ex.id === updated.id ? updated : ex));
// Brief delay, then collapse
setTimeout(() => {
  setSuccessId(null);
  setExpandedId(null);
}, 800);
```
```css
.my-exercises-row.save-success {
  background-color: rgba(74, 222, 128, 0.1);
  transition: background-color 0.3s ease;
}
```

### Anti-Patterns to Avoid
- **Separate edit component with its own state fetch:** Don't re-fetch exercise data. The parent already has `userExercises[]`. Pass the exercise object and update local state on save.
- **Auto-save or debounced save:** CONTEXT.md explicitly requires explicit Save button. No auto-save.
- **Warning dialog on unsaved changes:** CONTEXT.md says "discard changes silently" when switching rows.
- **Custom dropdown for categories:** Native `<select>` is already styled in the app. Only 7 options. Don't build a custom dropdown.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Exercise update API | Custom fetch/Supabase call | `exercises.updateExercise(params)` | Already handles auth, validation, uniqueness check |
| Category list | Hardcoded array in component | `exercises.getCategories()` | Single source of truth, already exists |
| Name validation | Client-side regex/uniqueness check | `updateExercise` returns typed `validationError` | Server does case-insensitive uniqueness check excluding self |
| Accordion animation | JavaScript height calculation | CSS `max-height` transition | Proven pattern already in codebase |
| Form input/select styling | Custom styled inputs | Global `.input` class already applied to native elements | Already styled in styles.css lines 287-354 |
| Button styling | Custom button styles | `btn btn-primary`, `btn btn-secondary` | Already defined in styles.css lines 404-447 |

**Key insight:** The entire backend is already built. The `updateExercise` function handles auth, validation (empty name, invalid chars, duplicate check scoped to user), and returns typed errors (`EMPTY_NAME`, `INVALID_NAME`, `DUPLICATE_NAME`). The frontend just needs to call it and map the `validationError` to inline messages.

## Common Pitfalls

### Pitfall 1: Not Resetting Form State When Switching Rows
**What goes wrong:** User edits row A, changes name, then clicks row B's pencil. Row B's form shows row A's edited name instead of row B's original name.
**Why it happens:** Edit state (editName, editCategory) not reset when expandedId changes.
**How to avoid:** Always reset editName/editCategory when setting a new expandedId.
**Warning signs:** Form shows wrong data after clicking a different row's pencil icon.

### Pitfall 2: Stale Local State After Save
**What goes wrong:** After saving, the list still shows old name/category until page refresh.
**Why it happens:** `userExercises` state not updated with the response from `updateExercise`.
**How to avoid:** On successful save, update the specific exercise in `userExercises` state with the returned `data` from `updateExercise`. The response includes the full updated `Exercise` object.
**Warning signs:** Name changes only visible after page refresh.

### Pitfall 3: max-height Animation Looks Choppy
**What goes wrong:** The slide-down/up animation has a visible delay or acceleration issue because `max-height` is set much larger than actual content.
**Why it happens:** CSS `max-height` transition calculates speed based on the full max-height value, not actual content height. If max-height is 600px but content is 200px, it appears to pause before starting.
**How to avoid:** Set `max-height` to a value close to actual form height (~250-300px). The edit form has 2 fields + buttons, which is approximately 200-240px tall.
**Warning signs:** Noticeable delay before animation appears to start.

### Pitfall 4: Save Button Enabled on Initial Expand
**What goes wrong:** Save button is enabled immediately when form expands even though nothing changed.
**Why it happens:** Dirty check compares against wrong baseline, or comparison is not strict.
**How to avoid:** Store original values when expanding and compare against those. Use strict string equality.
**Warning signs:** Save button is clickable before any edits are made.

### Pitfall 5: Category Dropdown Inside Overflow Hidden
**What goes wrong:** Native `<select>` dropdown gets clipped by the `overflow: hidden` on the accordion container.
**Why it happens:** The accordion uses `overflow: hidden` for the max-height animation.
**How to avoid:** This is NOT actually a problem with native `<select>` elements -- their dropdown menus are rendered by the browser at the OS level, outside the DOM flow. They are not clipped by CSS overflow. Only custom dropdown menus would be affected.
**Warning signs:** None -- this is a non-issue with native `<select>`.

### Pitfall 6: Not Mapping Validation Errors to Fields
**What goes wrong:** Generic error shown at top of form instead of below the name field.
**Why it happens:** Developer treats all errors the same way.
**How to avoid:** Check `result.validationError` specifically and map to the name field:
- `EMPTY_NAME` -> "Exercise name is required" below name input
- `INVALID_NAME` -> "Only letters, numbers, and spaces allowed" below name input
- `DUPLICATE_NAME` -> "An exercise with this name already exists" below name input
- `result.error` (generic) -> General error above the form

## Code Examples

### Calling updateExercise
```typescript
// Source: packages/shared/src/services/exercises.ts (lines 306-386)
// Source: packages/shared/src/types/services.ts (lines 164-188)

import { exercises } from '@ironlift/shared';
import type { UpdateExerciseParams, UpdateExerciseResult, UpdateExerciseError } from '@ironlift/shared';

// Call signature
const result: UpdateExerciseResult = await exercises.updateExercise({
  id: exercise.id,
  name: editName,       // optional -- only include if changed
  category: editCategory // optional -- only include if changed
});

// Result handling
if (result.validationError) {
  // Typed validation error: 'EMPTY_NAME' | 'INVALID_NAME' | 'DUPLICATE_NAME'
  switch (result.validationError) {
    case 'EMPTY_NAME':
      setNameError('Exercise name is required');
      break;
    case 'INVALID_NAME':
      setNameError('Only letters, numbers, and spaces allowed');
      break;
    case 'DUPLICATE_NAME':
      setNameError('An exercise with this name already exists');
      break;
  }
} else if (result.error) {
  // Generic error (auth failure, DB error)
  setGeneralError('Failed to save changes');
} else if (result.data) {
  // Success! result.data is the updated Exercise object
  // Update local state, show success flash, collapse
}
```

### Getting Category List
```typescript
// Source: packages/shared/src/services/exercises.ts (line 218-220)
import { exercises } from '@ironlift/shared';

const categories = exercises.getCategories();
// Returns: ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Other']
```

### Exercise Type
```typescript
// Source: packages/shared/src/types/database.ts (lines 44-55)
interface Exercise {
  id: string;
  user_id: string | null;
  name: string;
  category: ExerciseCategory; // 'Chest' | 'Back' | 'Shoulders' | 'Legs' | 'Arms' | 'Core' | 'Other'
  equipment: string | null;
  instructions: string[] | null;
  level: 'beginner' | 'intermediate' | 'expert' | null;
  force: 'push' | 'pull' | 'static' | null;
  mechanic: 'compound' | 'isolation' | null;
  is_system: boolean;
}
```

### Current Row Rendering (to be enhanced)
```typescript
// Source: apps/web/src/surfaces/dashboard/MyExercisesList.tsx (lines 59-66)
{userExercises.map((exercise) => (
  <div key={exercise.id} class="my-exercises-row">
    <div class="exercise-item-info">
      <span class="exercise-item-name">{exercise.name}</span>
      <span class="exercise-item-category">{exercise.category}</span>
    </div>
  </div>
))}
```

### Existing Button Classes
```css
/* Source: apps/web/css/styles.css (lines 404-447) */
.btn { /* base: inline-flex, centered, padding, min-height 44px tap target */ }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--color-accent); color: white; }
.btn-secondary { background: transparent; border: 1px solid var(--color-border); }
```

### Existing Input Styles
```css
/* Source: apps/web/css/styles.css (lines 287-305) */
/* All text inputs and selects are automatically styled: */
/* width: 100%, dark background, border, rounded, 44px min-height */
/* Focus: blue border + blue glow */
/* Disabled: 0.5 opacity */
```

### CSS Color Variables for Edit Form Area
```css
/* Source: apps/web/css/styles.css (lines 10-22) */
--color-bg-primary: #0f0f0f;   /* page background */
--color-bg-surface: #1a1a1a;   /* card/panel background */
--color-bg-elevated: #27272a;  /* USE THIS for edit form area (subtle shade difference) */
--color-border: #2a2a2a;
--color-success: #4ade80;       /* for success flash */
--color-danger: #f87171;        /* for errors */
--color-accent: #4f9eff;        /* for focused inputs, primary buttons */
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JavaScript `.scrollHeight` accordion | CSS `max-height` transition | Already in codebase | Simpler, no JS needed |
| Custom dropdown components | Native `<select>` with CSS styling | Already in codebase | Works well, OS-level dropdown |
| Full-page edit forms | Inline accordion edit | This phase | Better UX, less navigation |

**Note:** The project uses Preact (not React). Hooks are imported from `preact/hooks`, JSX types from `preact`, and event types are `JSX.TargetedEvent<HTMLInputElement>` etc.

## Open Questions

1. **Re-sorting after name change**
   - What we know: The list is sorted alphabetically. After editing a name, the exercise may need to move positions.
   - What's unclear: Should the re-sort happen immediately after save, or only on next load?
   - Recommendation: Re-sort immediately by replacing the exercise in the array and re-sorting. The list uses `userExercises` state which is pre-sorted from the server. After updating an exercise in local state, apply the same alphabetical sort. This gives immediate visual feedback.

2. **Whether the `useAsyncOperation` hook should be used for the save operation**
   - What we know: The hook exists at `apps/web/src/hooks/useAsyncOperation.ts` and provides `isLoading`, `error`, `execute()`.
   - What's unclear: The hook's error handling is generic (string messages). The edit form needs field-specific errors from `validationError`.
   - Recommendation: Don't use `useAsyncOperation` for the save. Manage `isSaving` state manually to handle the typed `validationError` responses from `updateExercise`. The hook is designed for simpler async flows where a generic error message suffices.

## Sources

### Primary (HIGH confidence)
- `packages/shared/src/services/exercises.ts` - Full `updateExercise` implementation, `getCategories`, `getUserExercises`
- `packages/shared/src/types/services.ts` - `UpdateExerciseParams`, `UpdateExerciseResult`, `UpdateExerciseError` types
- `packages/shared/src/types/database.ts` - `Exercise` interface, `ExerciseCategory` type
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` - Current component to enhance
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` - How MyExercisesList is mounted
- `apps/web/src/components/ExercisePickerModal.tsx` - Form patterns (input, select, error handling)
- `apps/web/css/styles.css` - All CSS: variables, button classes, input styles, accordion pattern, my-exercises styles
- `apps/web/src/hooks/useAsyncOperation.ts` - Existing async hook (decided not to use)

### Secondary (MEDIUM confidence)
- None needed -- all information came from direct codebase inspection

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in codebase, directly inspected
- Architecture: HIGH - Based on existing patterns (accordion, forms) in same codebase
- Pitfalls: HIGH - Derived from direct code analysis of updateExercise return types and CSS patterns

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (stable -- no external dependencies or fast-moving libraries)
