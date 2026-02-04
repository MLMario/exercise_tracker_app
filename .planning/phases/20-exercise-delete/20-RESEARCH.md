# Phase 20: Exercise Delete - Research

**Researched:** 2026-02-03
**Domain:** Preact UI (delete flow with confirmation modal), Supabase backend
**Confidence:** HIGH

## Summary

This phase adds delete functionality to the MyExercisesList component. The codebase already has all the building blocks needed: a reusable `ConfirmationModal` component with danger variant support, a `deleteExercise` service function, a `getExerciseDependencies` service function, established trash icon SVG patterns, and existing CSS classes for danger buttons and modals.

The main integration work is: (1) adding a trash icon button to each exercise row, (2) wiring up a confirmation modal with dependency warning when the exercise is used in templates, and (3) removing the exercise from local state after successful deletion.

**Primary recommendation:** Reuse the existing `ConfirmationModal` component with `confirmVariant="danger"`, but extend the modal body to include an optional dependency warning section. The dependency check (`getExerciseDependencies`) should only inspect `templateCount` per the CONTEXT.md decision.

## Standard Stack

### Core (already in codebase)
| Library | Purpose | Location |
|---------|---------|----------|
| `ConfirmationModal` | Reusable confirm/cancel dialog | `apps/web/src/components/ConfirmationModal.tsx` |
| `exercises.deleteExercise()` | Supabase delete by ID | `packages/shared/src/services/exercises.ts` |
| `exercises.getExerciseDependencies()` | Check template/log/chart usage counts | `packages/shared/src/services/exercises.ts` |
| CSS variables | `--color-danger`, `--color-warning`, `btn-danger` | `apps/web/css/styles.css` |

### No new libraries needed

Everything required exists in the codebase. No npm installs.

## Architecture Patterns

### Current MyExercisesList Row Structure
```
.my-exercises-row (flex, wrap)
  .exercise-item-info (flex: 1)
    .exercise-item-name
    .exercise-item-category
  button.my-exercises-edit-trigger (pencil icon, margin-left: auto)
  .my-exercises-edit-form (accordion, width: 100%)
```

### Target Row Structure (add delete button)
```
.my-exercises-row (flex, wrap)
  .exercise-item-info (flex: 1)
    .exercise-item-name
    .exercise-item-category
  button.my-exercises-edit-trigger (pencil icon, margin-left: auto)
  button.my-exercises-delete-trigger (trash icon, danger red)
  .my-exercises-edit-form (accordion, width: 100%)
```

The trash button goes AFTER the pencil button, BEFORE the accordion form div. Both icon buttons sit in the row's flex flow. The `margin-left: auto` on the edit trigger pushes both buttons to the right.

### Pattern 1: ConfirmationModal with Extended Body

The existing `ConfirmationModal` accepts a `message` prop (string) and optional `secondaryMessage` prop (string, rendered as `text-muted`). The dependency warning needs to appear as an amber warning box, which the current `message`/`secondaryMessage` string props cannot style.

**Two approaches:**

**Option A (Recommended): Compose a custom modal using existing CSS classes.** Build a `DeleteExerciseModal` component that uses the same `modal-overlay`, `modal`, `modal-sm`, `modal-header`, `modal-body`, `modal-footer` CSS classes directly, but includes a custom warning box in the body. This matches how `DashboardSurface.tsx` lines 508-536 build a custom delete-chart modal inline.

**Option B: Extend ConfirmationModal with children/slot.** Add an optional `children` or `warningContent` prop to ConfirmationModal. This modifies a shared component and risks affecting existing consumers.

**Recommendation: Option A.** A small dedicated `DeleteExerciseModal` component (or inline JSX in MyExercisesList) using existing modal CSS classes. This avoids modifying the shared ConfirmationModal.

### Pattern 2: Delete Flow State Management

Follow the established pattern from DashboardSurface template delete:
```typescript
// State
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
const [pendingDeleteName, setPendingDeleteName] = useState('');
const [hasTemplateDeps, setHasTemplateDeps] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

// Trigger: open modal, check dependencies
const handleDeleteClick = async (exercise: Exercise) => {
  setPendingDeleteId(exercise.id);
  setPendingDeleteName(exercise.name);
  // Check template dependencies
  const { data } = await exercises.getExerciseDependencies(exercise.id);
  setHasTemplateDeps(data ? data.templateCount > 0 : false);
  setShowDeleteModal(true);
};

// Confirm: call delete, update local state
const confirmDelete = async () => {
  if (!pendingDeleteId) return;
  setIsDeleting(true);
  const { error } = await exercises.deleteExercise(pendingDeleteId);
  setIsDeleting(false);
  if (!error) {
    setUserExercises(prev => prev.filter(ex => ex.id !== pendingDeleteId));
    // Collapse accordion if the deleted exercise was expanded
    if (expandedId === pendingDeleteId) setExpandedId(null);
  }
  setShowDeleteModal(false);
};
```

### Pattern 3: Trash Icon (Reuse Existing SVG)

Two trash icon SVGs exist in the codebase:

1. **TemplateCard DeleteIcon** - 12x12, simpler path (polyline + path)
2. **ChartCard TrashIcon** - 16x16, single path

For exercise rows, the icon should match the pencil icon size. The pencil uses `&#9998;` (Unicode character) at `font-size: 1.125rem` (18px). To match, use an SVG trash icon at approximately 18x18 or use the same 16x16 ChartCard pattern. The TemplateCard's 12x12 is too small.

**Recommendation:** Use the ChartCard `TrashIcon` SVG pattern at 18x18 to match the pencil icon visual weight.

### Anti-Patterns to Avoid
- **Don't put the delete modal in DashboardSurface.** Keep it in MyExercisesList since the delete flow is self-contained within that component. Unlike template delete (which DashboardSurface manages because it owns template state), exercise state is local to MyExercisesList.
- **Don't call getExerciseDependencies on every row render.** Only call it when the user clicks the delete button, before showing the modal.
- **Don't check all three dependency types.** CONTEXT.md says only check template dependencies. The service returns all three counts, but only inspect `templateCount`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal overlay + backdrop | Custom div positioning | Existing `.modal-overlay` + `.modal` + `.modal-sm` CSS | Already handles centering, backdrop, z-index, animations |
| Danger button styling | Inline styles | `btn btn-danger` CSS class | Consistent hover states, color variables |
| Secondary/cancel button | Custom styling | `btn btn-secondary` CSS class | Matches existing outlined button style |
| Delete API call | Raw supabase query | `exercises.deleteExercise(id)` | Already handles validation, error wrapping |
| Dependency check | Manual count queries | `exercises.getExerciseDependencies(id)` | Parallel queries, error handling built in |

## Common Pitfalls

### Pitfall 1: Foreign Key Constraint on Delete
**What goes wrong:** The database foreign keys from `template_exercises`, `workout_log_exercises`, and `user_charts` to `exercises` do NOT have `ON DELETE CASCADE`. Attempting to delete an exercise that is referenced in any of these tables will fail with a PostgreSQL foreign key violation error.
**Why it happens:** The schema was designed without cascade deletes on exercise references.
**How to avoid:** The `deleteExercise` service call will return an error object if the delete fails due to FK constraints. The UI should handle this gracefully -- show an error message in the modal or as an alert. Per CONTEXT.md, the warning says "All history will be deleted with it" but the DB does not actually cascade. This is a **critical discrepancy** that must be addressed.
**Options:**
  1. Add `ON DELETE CASCADE` to the three FK constraints (DB migration) -- then deletion truly cascades
  2. Accept that exercises with dependencies cannot be deleted -- show an error
  3. Manually delete dependent rows before deleting the exercise (application-level cascade)
**Recommendation:** This needs a decision. The CONTEXT.md says "All history will be deleted with it" which implies cascade behavior. A DB migration adding CASCADE to the three FKs (`template_exercises.exercise_id`, `workout_log_exercises.exercise_id`, `user_charts.exercise_id`) is the cleanest approach.

### Pitfall 2: Stale List After Delete
**What goes wrong:** After deleting, the exercise remains visible until page refresh.
**How to avoid:** Remove from local `userExercises` state immediately after successful `deleteExercise()` call. Already shown in the pattern above.

### Pitfall 3: Expanded Accordion on Deleted Row
**What goes wrong:** If the user has the edit form expanded for an exercise and then clicks delete (possible since both buttons are always visible), the accordion state references a deleted item.
**How to avoid:** After successful delete, if `expandedId === deletedId`, reset `expandedId` to null.

### Pitfall 4: Double-Click / Multiple Submissions
**What goes wrong:** User clicks "Delete Exercise" button multiple times while the async operation is in progress.
**How to avoid:** Track `isDeleting` state, disable the confirm button while deleting. The modal's confirm button should show loading state or be disabled.

## Code Examples

### Trash Icon SVG (adapted from ChartCard, sized to 18x18)
```tsx
function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width="18"
      height="18"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
```

### Delete Trigger Button (in exercise row, after edit button)
```tsx
<button
  type="button"
  class="my-exercises-delete-trigger"
  onClick={() => handleDeleteClick(exercise)}
  aria-label={`Delete ${exercise.name}`}
>
  <TrashIcon />
</button>
```

### Delete Trigger CSS
```css
.my-exercises-delete-trigger {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  color: var(--color-danger);
  font-size: 1.125rem;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Custom Delete Modal Body with Warning
```tsx
<div class="modal-overlay" onClick={handleOverlayClick}>
  <div class="modal modal-sm" onClick={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <h2>Delete Exercise?</h2>
    </div>
    <div class="modal-body">
      <p>Delete {pendingDeleteName}. All history will be deleted with it.</p>
      {hasTemplateDeps && (
        <div class="delete-warning-box">
          This exercise is used in templates.
        </div>
      )}
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onClick={dismissDelete}>
        Keep Exercise
      </button>
      <button
        class="btn btn-danger"
        onClick={confirmDelete}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete Exercise'}
      </button>
    </div>
  </div>
</div>
```

### Warning Box CSS
```css
.delete-warning-box {
  background-color: rgba(251, 191, 36, 0.1);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-warning);
  font-size: 0.875rem;
  margin-top: var(--spacing-sm);
}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Inline modal JSX in parent surfaces | Reusable `ConfirmationModal` component | Consistency across delete flows |
| Unicode characters for icons (&#9998;) | SVG icon components | Better sizing control, consistency |

The codebase is in transition: MyExercisesList uses `&#9998;` for the pencil icon while TemplateCard and ChartCard use SVG components. The trash icon should use SVG to match the newer pattern.

## Open Questions

### 1. Foreign Key Cascade Behavior (CRITICAL)
- **What we know:** The schema has FK references from `template_exercises`, `workout_log_exercises`, and `user_charts` to `exercises`, but NONE have `ON DELETE CASCADE`. The CONTEXT.md message says "All history will be deleted with it."
- **What's unclear:** Should we add a DB migration for CASCADE, or handle it differently?
- **Recommendation:** Add `ON DELETE CASCADE` to all three FK constraints. Without this, deleting an exercise that has any references will fail at the database level. The CONTEXT.md wording explicitly says history will be deleted. A SQL migration is needed:
  ```sql
  ALTER TABLE template_exercises DROP CONSTRAINT template_exercises_exercise_id_fkey;
  ALTER TABLE template_exercises ADD CONSTRAINT template_exercises_exercise_id_fkey
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

  ALTER TABLE workout_log_exercises DROP CONSTRAINT workout_log_exercises_exercise_id_fkey;
  ALTER TABLE workout_log_exercises ADD CONSTRAINT workout_log_exercises_exercise_id_fkey
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;

  ALTER TABLE user_charts DROP CONSTRAINT user_charts_exercise_id_fkey;
  ALTER TABLE user_charts ADD CONSTRAINT user_charts_exercise_id_fkey
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE;
  ```

### 2. Error Handling UX for Delete Failure
- **What we know:** If delete fails (network error, FK violation without cascade), the service returns `{ error }`.
- **What's unclear:** How to display the error -- in the modal? Close modal and show inline error?
- **Recommendation:** Keep the modal open and show an error message inside the modal body. This is Claude's discretion per CONTEXT.md.

## Sources

### Primary (HIGH confidence)
- `packages/shared/src/services/exercises.ts` - `deleteExercise` and `getExerciseDependencies` implementations
- `apps/web/src/components/ConfirmationModal.tsx` - Reusable modal component with full props interface
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` - Current exercise row structure
- `apps/web/css/styles.css` - All modal, button, and exercise list CSS classes
- `sql/current_schema.sql` - FK constraint definitions (NO CASCADE on exercise references)

### Secondary (HIGH confidence - codebase patterns)
- `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` lines 89-96, 540-549 - Template delete modal pattern
- `apps/web/src/surfaces/dashboard/TemplateCard.tsx` lines 48-67 - Trash icon SVG + btn-icon-xs btn-danger pattern
- `apps/web/src/surfaces/dashboard/ChartCard.tsx` lines 40-61 - TrashIcon SVG component

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components and services already exist in codebase
- Architecture: HIGH - Direct codebase inspection of row structure, modal patterns, CSS classes
- Pitfalls: HIGH - FK constraint issue verified from actual schema SQL; state management patterns verified from existing code
- Code examples: HIGH - Adapted from verified codebase patterns

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (stable codebase, no external dependencies)
