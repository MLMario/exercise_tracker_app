# Phase 21: Exercise Create - Research

**Researched:** 2026-02-04
**Domain:** Preact modal UI + Supabase exercise CRUD
**Confidence:** HIGH

## Summary

This phase adds exercise creation capability to the My Exercises management view inside the SettingsPanel. Research covered the existing MyExercisesList component, the exercise service layer, modal patterns used throughout the app, the TemplateList "+ Create" button for visual matching, and the category system.

The core finding is that all infrastructure already exists: `exercises.createExercise(name, category)` in the shared service handles DB insertion with duplicate detection (Postgres 23505 constraint), `exercises.getCategories()` returns the 7 category options, and the codebase has established modal patterns (both inline in MyExercisesList for delete, and reusable ConfirmationModal). The new simplified create modal is straightforward -- a small modal with name input and category dropdown, following the existing `modal-overlay > modal modal-sm` CSS pattern.

**Primary recommendation:** Add a `showCreateModal` state to MyExercisesList, a "+ Create" button to the SettingsPanel header, and a lightweight inline modal component within MyExercisesList. Use `exercises.createExercise()` directly. Wire the empty state button to the same modal opener.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| preact | existing | UI framework (hooks: useState, useCallback) | Already used throughout |
| @ironlift/shared | existing | `exercises.createExercise()`, `exercises.getCategories()`, types | Service layer already complete |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | -- | No new libraries needed | -- |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline modal in MyExercisesList | Separate CreateExerciseModal component file | Separate file adds indirection for a small modal; inline keeps related state together. Either works -- Claude's discretion per CONTEXT.md |

## Architecture Patterns

### Component Hierarchy (Current)
```
DashboardSurface
  -> SettingsPanel (isOpen, onClose, onLogout, onExerciseDeleted)
       -> SettingsPanel header (back button + title)
       -> MyExercisesList (onExerciseDeleted)
            -> Exercise rows with edit/delete
            -> Delete confirmation modal (inline)
            -> Empty state with "Create Exercise" button
```

### Component Hierarchy (After Phase 21)
```
DashboardSurface
  -> SettingsPanel (isOpen, onClose, onLogout, onExerciseDeleted)
       -> SettingsPanel header (back button + title + "+ Create" button)  <-- MODIFIED
       -> MyExercisesList (onExerciseDeleted, onCreateExercise?)          <-- MODIFIED
            -> Exercise rows with edit/delete
            -> Delete confirmation modal (inline)
            -> Create exercise modal (NEW -- inline or separate)
            -> Empty state with "Create Exercise" button (WIRED)
```

### Pattern 1: SettingsPanel Header with Create Button
**What:** The SettingsPanel header currently has a back button on the left and title. The "+ Create" button needs to go on the far right, but ONLY when the exercises view is active (`panelView === 'exercises'`).
**When to use:** When the My Exercises view is shown.
**Key reference -- TemplateList header pattern:**
```tsx
// From TemplateList.tsx lines 43-53 (the pattern to match):
<div class="section-header">
  <h2 class="section-title">My Templates</h2>
  <button
    type="button"
    class="btn btn-primary btn-sm"
    onClick={onCreateNew}
  >
    + Create
  </button>
</div>
```
**SettingsPanel header current structure (lines 60-70):**
```tsx
<div class="settings-panel-header">
  <div class="settings-header-left">
    <button class="settings-back-btn" onClick={handleBack} type="button">
      <svg ...>...</svg>
      {backLabel}
    </button>
    <span class="settings-header-title">{headerTitle}</span>
  </div>
  {/* "+ Create" button goes here, right-aligned */}
</div>
```
**CSS note:** `.settings-panel-header` uses `display: flex; align-items: center`. Adding a button after `.settings-header-left` with `margin-left: auto` will push it to the far right. Alternatively, add `justify-content: space-between` if not already present (it is NOT currently set -- just `display: flex; align-items: center`).

### Pattern 2: Modal Structure (Existing Delete Modal Pattern)
**What:** The delete modal in MyExercisesList uses inline modal markup with `modal-overlay > modal modal-sm` pattern.
**When to use:** For the create modal.
**Key reference:**
```tsx
// From MyExercisesList.tsx lines 307-331 (delete modal pattern):
{showDeleteModal && (
  <div class="modal-overlay" onClick={dismissDelete}>
    <div class="modal modal-sm" onClick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h2>Delete Exercise?</h2>
      </div>
      <div class="modal-body">
        {/* content */}
      </div>
      <div class="modal-footer">
        <button class="btn btn-sm btn-secondary">Cancel</button>
        <button class="btn btn-sm btn-danger">Delete Exercise</button>
      </div>
    </div>
  </div>
)}
```

### Pattern 3: Create Exercise Modal (New -- to build)
**What:** Simplified modal with name input + category dropdown.
**Structure:**
```tsx
{showCreateModal && (
  <div class="modal-overlay" onClick={dismissCreate}>
    <div class="modal modal-sm" onClick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h2>Create Exercise</h2>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <input type="text" placeholder="Exercise name" value={createName}
            onInput={(e) => setCreateName(e.currentTarget.value)} />
        </div>
        <div class="form-group">
          <select value={createCategory}
            onChange={(e) => setCreateCategory(e.currentTarget.value)}>
            <option value="">Select category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        {createError && <div class="error-message">{createError}</div>}
      </div>
      <div class="modal-footer">
        <button class="btn btn-sm btn-secondary" onClick={dismissCreate}>Cancel</button>
        <button class="btn btn-sm btn-primary" onClick={handleCreate}
          disabled={!createName.trim() || !createCategory || isCreating}>
          {isCreating ? 'Creating...' : 'Create Exercise'}
        </button>
      </div>
    </div>
  </div>
)}
```

### Pattern 4: List Refresh After Create
**What:** After successful create, insert the new exercise into the local state array sorted alphabetically.
**When to use:** After `exercises.createExercise()` succeeds.
**Key reference -- same pattern as update (MyExercisesList.tsx lines 128-134):**
```tsx
// Update case: replace + re-sort
setUserExercises(prev =>
  prev
    .map(ex => (ex.id === updated.id ? updated : ex))
    .sort((a, b) => a.name.localeCompare(b.name))
);

// Create case: append + re-sort
setUserExercises(prev =>
  [...prev, newExercise].sort((a, b) => a.name.localeCompare(b.name))
);
```

### Anti-Patterns to Avoid
- **Do NOT reuse ExercisePickerModal:** The CONTEXT.md explicitly says "New simplified modal, NOT the existing exercise picker modal." The picker modal has search, category filter, exercise selection list, and create-as-subform -- all unnecessary for standalone create.
- **Do NOT add default category:** CONTEXT.md says "no default, placeholder 'Select category' -- user must choose." Use `<option value="">Select category</option>` with no preselection.
- **Do NOT add inline validation messages:** CONTEXT.md says "no inline error messages." The Create button is simply disabled until both fields are filled.
- **Do NOT auto-scroll or show success flash:** CONTEXT.md says "List stays at current scroll position" and "No success flash or toast."

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Exercise creation | Custom Supabase query | `exercises.createExercise(name, category)` | Handles auth, validation, duplicate detection (23505), trimming |
| Category list | Hardcoded array | `exercises.getCategories()` | Returns `['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Other']` -- single source of truth |
| Modal overlay + dismiss | Custom overlay logic | Existing `.modal-overlay` CSS + `onClick` pattern | Already handles centering, backdrop, animation |
| Name uniqueness check | Pre-check with `exerciseExists()` | Let `createExercise()` handle it | Service catches Postgres 23505 and returns descriptive error |

## Common Pitfalls

### Pitfall 1: Category Dropdown Mismatch
**What goes wrong:** ExercisePickerModal has `CATEGORY_OPTIONS` that includes 'Cardio', but `ExerciseCategory` type does NOT include 'Cardio'. The `exercises.getCategories()` returns the correct 7 categories matching the type.
**Why it happens:** Historical inconsistency between the picker modal and the type system.
**How to avoid:** Use `exercises.getCategories()` exclusively (already used in MyExercisesList line 60). Never hardcode category arrays.
**Warning signs:** TypeScript error on `ExerciseCategory` assignment.

### Pitfall 2: Button Placement -- Header Lives in SettingsPanel, Not MyExercisesList
**What goes wrong:** Attempting to add the "+ Create" button inside MyExercisesList when it should be in the SettingsPanel header.
**Why it happens:** The My Exercises view has no header of its own -- the SettingsPanel provides the header with back button and title.
**How to avoid:** The "+ Create" button must be added in `SettingsPanel.tsx` within the `.settings-panel-header` div, conditionally rendered when `panelView === 'exercises'`. The button's click handler must communicate down to MyExercisesList (via prop callback or lifted state).
**Warning signs:** Button appears in wrong location or scrolls with the list.

### Pitfall 3: Modal State Coordination Between SettingsPanel and MyExercisesList
**What goes wrong:** If modal open state lives in SettingsPanel but the modal UI lives in MyExercisesList, prop threading gets awkward.
**Why it happens:** The "+ Create" header button is in SettingsPanel but the modal logically belongs with MyExercisesList.
**How to avoid:** Two clean approaches:
1. **Lift showCreateModal to SettingsPanel**: Pass `showCreateModal` + `setShowCreateModal` as props to MyExercisesList. SettingsPanel header button and empty state button both set the same state.
2. **Use callback pattern**: MyExercisesList exposes an `openCreateModal` via a ref or callback prop that SettingsPanel can trigger. More complex, less recommended.

**Recommended:** Option 1 (lift state). SettingsPanel passes `showCreateModal` and `onOpenCreate` to MyExercisesList. Both the header button and the empty state button call `onOpenCreate`.

### Pitfall 4: Duplicate Name Error Not Surfacing
**What goes wrong:** `createExercise()` returns a generic `Error` object for duplicate names (not typed validation errors like `updateExercise` does). The error message is "An exercise with this name already exists".
**Why it happens:** The create function was written earlier with less typed error handling than the update function.
**How to avoid:** Check `result.error?.message` for the duplicate case. Display it in the modal as a general error message.
**Warning signs:** Error silently swallowed, user sees no feedback on duplicate.

### Pitfall 5: Empty State Transition
**What goes wrong:** After creating the first exercise from the empty state, the component needs to transition from empty state view to list view.
**Why it happens:** The component renders empty state when `userExercises.length === 0`. After successful create, updating `userExercises` state will naturally cause re-render from empty to list.
**How to avoid:** Just ensure `setUserExercises(prev => [...prev, newExercise].sort(...))` is called on success. The conditional rendering handles the transition automatically.

### Pitfall 6: onExerciseDeleted Callback Pattern for Create
**What goes wrong:** The delete flow calls `onExerciseDeleted` to refresh charts and templates in DashboardSurface. Create does not need this callback (no charts or templates are affected by a new exercise).
**Why it happens:** Tempting to add a symmetric `onExerciseCreated` callback.
**How to avoid:** No callback needed for create. The new exercise is purely local to the My Exercises list. Only add a callback if future requirements demand it (e.g., refreshing the exercise picker elsewhere).

## Code Examples

### Existing createExercise Service (exercises.ts lines 88-151)
```typescript
// Signature:
async function createExercise(
  name: string,
  category: ExerciseCategory,
  equipment?: string | null
): Promise<ServiceResult<Exercise>>

// Return type: { data: Exercise | null, error: Error | null }

// Key behaviors:
// - Gets current user via supabase.auth.getUser()
// - Validates name and category are non-empty
// - Inserts with is_system: false, user_id: user.id
// - Trims name before insert
// - Catches Postgres 23505 (unique constraint) and returns descriptive error
// - Returns the created Exercise object via .select().single()
```

### Existing getCategories (exercises.ts line 218-220)
```typescript
function getCategories(): ExerciseCategory[] {
  return ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Other'];
}
```

### Existing Categories Already Used in MyExercisesList (line 60)
```typescript
const categories = exercises.getCategories();
```

### Modal CSS Classes Available
```css
.modal-overlay { /* fixed fullscreen backdrop, z-index: 1000 */ }
.modal { /* centered card, max-width: container, slideUp animation */ }
.modal-sm { /* max-width: 400px */ }
.modal-header { /* flex, space-between, margin-bottom: spacing-lg */ }
.modal-body { /* margin-bottom: spacing-lg */ }
.modal-footer { /* flex, gap: spacing-sm, justify-content: flex-end */ }
```

### Button CSS Classes
```css
.btn { /* base button styles */ }
.btn-primary { /* blue accent background */ }
.btn-secondary { /* transparent with border */ }
.btn-sm { /* padding: 0.5rem spacing-md, font-size: 0.875rem, min-height: 36px */ }
```

### Settings Panel Header CSS
```css
.settings-panel-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  /* NOTE: no justify-content set -- defaults to flex-start */
}
```

### Empty State Button (MyExercisesList.tsx lines 189-191)
```tsx
// Currently a dead button -- needs onClick wiring:
<button type="button" class="btn btn-primary">
  Create Exercise
</button>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Create only via ExercisePickerModal | Phase 21 adds standalone create from My Exercises | Phase 21 | Users can create without entering template editor |

**Key constraint:** The ExercisePickerModal in the template editor also creates exercises, but via a subform within a larger modal. Phase 21 creates a dedicated, simplified flow.

## Open Questions

1. **Modal dismissal on overlay click while creating**
   - What we know: Other modals close on overlay click. The create modal should likely NOT close during an active `isCreating` state.
   - What's unclear: Whether the CONTEXT.md "+ Create" button "clicking again while modal is shown does nothing" means the overlay click should also do nothing while creating.
   - Recommendation: Close on overlay click when idle, prevent close during active creation (matching delete modal pattern which disables buttons during deletion).

2. **Error display in create modal**
   - What we know: CONTEXT.md says "no inline error messages" for validation. But `createExercise()` can return server errors (duplicate name, network failure).
   - What's unclear: Whether server-side errors should be shown in the modal or silently handled.
   - Recommendation: Show server errors (duplicate name, generic failure) as a general error message in the modal body. The "no inline error messages" applies to client-side validation only (which is handled by button disabled state).

3. **Should header "+ Create" button be visible when create modal is open?**
   - What we know: CONTEXT.md says "No special disabled state when modal is open -- clicking again while modal is shown does nothing."
   - Recommendation: Keep button always visible and enabled. If modal is already showing, the click handler is a no-op (or `setShowCreateModal(true)` which is already true).

## Sources

### Primary (HIGH confidence)
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` -- Full component code, 334 lines
- `apps/web/src/surfaces/dashboard/SettingsPanel.tsx` -- Parent component, header structure
- `packages/shared/src/services/exercises.ts` -- createExercise implementation (lines 88-151)
- `packages/shared/src/types/database.ts` -- Exercise interface, ExerciseCategory type
- `packages/shared/src/types/services.ts` -- ExercisesService interface, ServiceResult type
- `apps/web/src/surfaces/dashboard/TemplateList.tsx` -- "+ Create" button reference (lines 46-52)
- `apps/web/src/components/ConfirmationModal.tsx` -- Reusable modal pattern reference
- `apps/web/src/components/ExercisePickerModal.tsx` -- What NOT to duplicate (reference only)
- `apps/web/css/styles.css` -- Modal CSS (lines 795-883), button CSS (lines 428-503), form CSS (lines 275-333), settings header CSS (lines 3012-3057), my-exercises CSS (lines 3128-3234)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all code inspected directly in the repo
- Architecture: HIGH -- component hierarchy and patterns verified from source
- Pitfalls: HIGH -- all identified from reading actual code and CSS
- Modal pattern: HIGH -- multiple existing modals examined for consistency

**Research date:** 2026-02-04
**Valid until:** 2026-03-06 (stable codebase, patterns well-established)
