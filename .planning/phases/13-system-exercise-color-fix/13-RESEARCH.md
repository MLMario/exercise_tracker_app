# Phase 13: System Exercise Color Fix - Research

**Researched:** 2026-02-02
**Domain:** CSS styling for exercise picker component
**Confidence:** HIGH

## Summary

The system exercise graying effect is implemented through a single CSS rule that applies a muted color to exercise names when they have the `.system` class. The fix is straightforward: remove or comment out this CSS rule.

**Current behavior:** System exercises display with muted gray text (`#a1a1aa`), while user exercises display with bright white text (`#fafafa`).

**Desired behavior:** All exercises (system and user) display with the same bright white text color.

**Primary recommendation:** Delete the CSS rule at lines 2815-2818 in `styles.css` that applies the muted color to system exercise names.

## Current Implementation

### Component Code (ExercisePickerModal.tsx)

Line 260 applies the `system` class conditionally:

```typescript
class={`exercise-list-item ${exercise.is_system ? 'system' : ''} ${isExcluded ? 'disabled' : ''}`}
```

This adds the `system` class to any exercise where `is_system` is true.

### CSS Styling (styles.css)

**Base exercise name styling (line 2805-2813):**
```css
.exercise-item-name {
  display: block;
  font-size: 0.9375rem; /* 15px */
  font-weight: 500;
  color: #fafafa; /* bright white for user exercises */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**System exercise override (lines 2815-2818):**
```css
/* System exercise name - muted */
.exercise-list-item.system .exercise-item-name {
  color: #a1a1aa;
}
```

## Standard Stack

No additional libraries needed. This is a pure CSS change.

| Type | File | Purpose |
|------|------|---------|
| CSS | `apps/web/css/styles.css` | Contains the styling rule to modify |

## Architecture Patterns

### Pattern: CSS Class-Based Conditional Styling

The current pattern uses a CSS class (`system`) applied conditionally in JSX to enable different styling for system vs user exercises. The fix maintains this architecture but removes the color difference.

### Files Involved

1. **`apps/web/css/styles.css`** - Lines 2815-2818 contain the rule to remove
2. **`apps/web/src/components/ExercisePickerModal.tsx`** - Line 260 (no changes needed here)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color inheritance | Complex override chains | Delete the rule | Simpler to remove the override than add another override |

## Common Pitfalls

### Pitfall 1: Leaving the CSS Comment

**What goes wrong:** Leaving a stale comment like "System exercise name - muted" without the associated rule
**Why it happens:** Forgetting to remove the comment when deleting the rule
**How to avoid:** Remove both the comment AND the CSS rule
**Warning signs:** Comment on line 2815 without accompanying rule

### Pitfall 2: Modifying the Component Instead of CSS

**What goes wrong:** Removing the `system` class from the component
**Why it happens:** Might seem like the most direct fix
**How to avoid:** Keep the `system` class - it may be used for other purposes or future styling
**Warning signs:** Changes to ExercisePickerModal.tsx

## Code Examples

### Before (current CSS, lines 2815-2818):
```css
/* System exercise name - muted */
.exercise-list-item.system .exercise-item-name {
  color: #a1a1aa;
}
```

### After (CSS removed):
```css
/* Lines 2815-2818 deleted */
```

The `.exercise-item-name` base rule at line 2809 will apply to all exercises:
```css
color: #fafafa; /* bright white - now applies to ALL exercises */
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| System exercises grayed | All exercises same color | Phase 13 | Visual consistency |

This is an intentional design change - the original graying was a deliberate visual hierarchy choice that is now being removed per user request.

## Open Questions

None - the implementation path is clear.

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `apps/web/css/styles.css` lines 2764-2859
- Direct code inspection of `apps/web/src/components/ExercisePickerModal.tsx` line 260

## Metadata

**Confidence breakdown:**
- Location of styling: HIGH - directly verified in codebase
- Fix approach: HIGH - straightforward CSS deletion
- No side effects: HIGH - the `system` class has no other styling rules in the codebase

**Research date:** 2026-02-02
**Valid until:** N/A - this is a one-time fix
