# Phase 12: Exercise Picker Layout - Research

**Researched:** 2026-02-02
**Domain:** CSS Flexbox layout, Preact component structure
**Confidence:** HIGH

## Summary

This phase is a simple CSS layout change within an existing, well-documented codebase. The task is to move the category text from inline with the exercise name to a line below it in the exercise picker modal.

The current implementation from Phase 11 has the exercise-item-info container holding both name and category as inline spans. The change requires converting this to a stacked (column) layout with flex-direction: column, ensuring the badge remains aligned to the right of the entire block.

**Primary recommendation:** Modify the `.exercise-item-info` CSS to use `flex-direction: column` and adjust the span display properties for proper stacking.

## Standard Stack

No new libraries needed. This is pure CSS modification within the existing codebase.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Preact | existing | Component rendering | Already in use |
| CSS | N/A | Layout styling | Native browser support |

### Supporting
None required.

### Alternatives Considered
None - this is a straightforward CSS layout change.

**Installation:**
```bash
# No new dependencies required
```

## Architecture Patterns

### Current File Structure
```
apps/web/
├── css/
│   └── styles.css           # Contains .exercise-item-* styles (section 18)
└── src/
    └── components/
        └── ExercisePickerModal.tsx  # Renders exercise list items
```

### Pattern 1: Flex Column for Stacked Text
**What:** Use `flex-direction: column` on the info container to stack name and category vertically.
**When to use:** When converting inline text elements to a stacked layout.
**Example:**
```css
/* Current (inline - both elements on same line): */
.exercise-item-info {
  flex: 1;
  min-width: 0;
}

/* Target (stacked - name above category): */
.exercise-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
```

### Pattern 2: Block-Level Spans for Line Breaks
**What:** Use `display: block` on child spans to ensure they each take a full line.
**When to use:** When spans need to stack vertically within a flex column.
**Example:**
```css
.exercise-item-name {
  display: block; /* Ensures name takes full width of its line */
}

.exercise-item-category {
  display: block; /* Ensures category starts on new line */
}
```

### Anti-Patterns to Avoid
- **Adding <br> tags in JSX:** Creates unnecessary DOM nodes; use CSS instead
- **Using margins to force layout:** flex-direction: column handles spacing naturally
- **Changing the outer flex structure:** Keep `.exercise-list-item` horizontal for badge alignment

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Vertical stacking | Manual positioning | flex-direction: column | Clean, semantic CSS |
| Text truncation | JavaScript truncation | text-overflow: ellipsis | Already in codebase |

**Key insight:** The existing flex structure (`.exercise-list-item` as row, `.exercise-item-info` as content block) is already correct. Only the inner layout of `.exercise-item-info` needs modification.

## Common Pitfalls

### Pitfall 1: Breaking Badge Alignment
**What goes wrong:** Category moves below badge instead of staying left-aligned with name.
**Why it happens:** Modifying the parent flex container instead of the info container.
**How to avoid:** Only modify `.exercise-item-info`, keep `.exercise-list-item` as `display: flex` with `align-items: center`.
**Warning signs:** Badge wraps to next line or category appears to the right of badge.

### Pitfall 2: Text Overflow Issues
**What goes wrong:** Long exercise names break the layout when stacked.
**Why it happens:** `min-width: 0` may need reinforcement for the column layout.
**How to avoid:** Ensure `min-width: 0` is on `.exercise-item-info` and name has `text-overflow: ellipsis`.
**Warning signs:** Exercise names push the badge off-screen or wrap awkwardly.

### Pitfall 3: Inconsistent Vertical Spacing
**What goes wrong:** Gap between name and category is too large or too small.
**Why it happens:** Default flex gap or margin-bottom values don't match design intent.
**How to avoid:** Add small `gap` value (2-4px) to the column flex container or use `margin-top` on category.
**Warning signs:** Layout looks cramped or too spaced out compared to mockup.

## Code Examples

Verified patterns from existing codebase (styles.css section 18):

### Current Exercise Item Structure (TSX)
```tsx
// Source: ExercisePickerModal.tsx lines 261-269
<div class="exercise-list-item ${isSystem ? 'system' : ''} ${isExcluded ? 'disabled' : ''}">
  <div class="exercise-item-info">
    <span class="exercise-item-name">{exercise.name}</span>
    <span class="exercise-item-category">{exercise.category}</span>
  </div>
  {!exercise.is_system && (
    <span class="badge-custom">Custom</span>
  )}
</div>
```

### Current CSS (Section 18)
```css
/* Source: styles.css lines 2795-2818 */
.exercise-item-info {
  flex: 1;
  min-width: 0; /* for text truncation */
}

.exercise-item-name {
  font-size: 0.9375rem; /* 15px */
  font-weight: 500;
  color: #fafafa;
}

.exercise-item-category {
  font-size: 0.75rem; /* 12px */
  color: #71717a;
}
```

### Target CSS (Column Layout)
```css
/* Modified .exercise-item-info for vertical stacking */
.exercise-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px; /* Small gap between name and category */
}

.exercise-item-name {
  display: block; /* Force full-width block */
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fafafa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exercise-item-category {
  display: block;
  font-size: 0.75rem;
  color: #71717a;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline name + category | Stacked name over category | Phase 12 | Better visual hierarchy |

**Deprecated/outdated:**
- None - this is a new layout enhancement

## Open Questions

No open questions. This is a well-defined CSS change with clear before/after states.

1. **Vertical alignment of badge with stacked content**
   - What we know: Badge is currently centered with `align-items: center` on parent
   - What's unclear: Should badge align to top, center, or baseline of the stacked content?
   - Recommendation: Keep `align-items: center` initially; adjust to `flex-start` if badge looks misaligned with taller content block

## Sources

### Primary (HIGH confidence)
- `apps/web/css/styles.css` - Section 18 exercise picker styles (lines 2765-2855)
- `apps/web/src/components/ExercisePickerModal.tsx` - Component structure (lines 254-271)
- `badge-mockup.html` - Design reference showing inline layout with category below name

### Secondary (MEDIUM confidence)
- `.planning/phases/11-frontend-updates/11-01-SUMMARY.md` - Documents Phase 11 implementation decisions

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries, pure CSS modification
- Architecture: HIGH - Existing codebase patterns well documented
- Pitfalls: HIGH - Based on direct code analysis of current implementation

**Research date:** 2026-02-02
**Valid until:** N/A - CSS flexbox is stable

---
*Phase: 12-exercise-picker-layout*
*Research completed: 2026-02-02*
