# Phase 14: Exercise Picker Category Filter - Research

**Researched:** 2026-02-02
**Domain:** Preact custom dropdown component, filtering logic
**Confidence:** HIGH

## Summary

This phase adds a category filter dropdown to the existing ExercisePickerModal component. The implementation involves creating a custom-styled dropdown component that overlays content when opened, integrating it with the existing search filtering logic, and ensuring proper state reset when the modal reopens.

The codebase already has established patterns for modals, form inputs, and component styling. The category list is already defined in the codebase (`CATEGORY_OPTIONS` in ExercisePickerModal.tsx and `ExerciseCategory` type in database.ts). The main work involves building a reusable custom dropdown component and modifying the filtering logic to combine category and search filters.

**Primary recommendation:** Build a custom `CategoryDropdown` component inline or as a reusable component, using existing CSS variables and styling patterns. Implement a `useClickOutside` hook for closing the dropdown menu, and update the `filteredExercises` useMemo to apply both search and category filters.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Preact | 10.28.2 | UI framework | Already in use, API-compatible with React patterns |
| preact/hooks | (bundled) | State and effects | useState, useEffect, useRef, useMemo already used in codebase |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A - Custom implementation | N/A | Dropdown component | User decision: custom styled dropdown, not native select |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom dropdown | Native `<select>` | Easier but doesn't match visual style; user explicitly chose custom |
| Custom dropdown | react-dropdown-aria | Adds dependency; overkill for simple category list |

**Installation:**
No new packages required. Use existing Preact hooks and CSS patterns.

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/
│   └── ExercisePickerModal.tsx    # Modify existing - add dropdown and filter logic
├── hooks/
│   ├── index.ts                   # Add useClickOutside export
│   └── useClickOutside.ts         # NEW: Click outside detection hook
└── ...
```

### Pattern 1: Controlled Dropdown with Local State
**What:** Dropdown manages its own open/closed state internally but value is controlled by parent
**When to use:** When dropdown is a single-use component within a specific context
**Example:**
```typescript
// Source: Existing codebase patterns + standard React/Preact patterns
interface CategoryDropdownProps {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function CategoryDropdown({ value, options, onChange }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef} class="category-dropdown">
      <button
        type="button"
        class="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{value || 'All Categories'}</span>
        <ChevronIcon class={isOpen ? 'rotate' : ''} />
      </button>
      {isOpen && (
        <ul class="dropdown-menu" role="listbox">
          {options.map(option => (
            <li
              key={option}
              role="option"
              aria-selected={option === value}
              onClick={() => { onChange(option); setIsOpen(false); }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Pattern 2: useClickOutside Hook
**What:** Custom hook to detect clicks outside a referenced element
**When to use:** Dropdown menus, modals, popovers that should close on outside click
**Example:**
```typescript
// Source: Standard React/Preact pattern
import { useEffect, RefObject } from 'preact/hooks';

export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void
): void {
  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [ref, handler]);
}
```

### Pattern 3: Combined Filter Logic
**What:** Apply multiple independent filters (category AND search) in a single useMemo
**When to use:** When filters should work together, not replace each other
**Example:**
```typescript
// Source: Existing filteredExercises pattern in ExercisePickerModal.tsx
const filteredExercises = useMemo(() => {
  let result = exercises;

  // Filter by category first (if not "All Categories")
  if (selectedCategory && selectedCategory !== 'All Categories') {
    result = result.filter(ex => ex.category === selectedCategory);
  }

  // Then filter by search query (name only per PICK-01)
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(ex => ex.name.toLowerCase().includes(query));
  }

  // Sort: user exercises first, then alphabetically
  return [...result].sort((a, b) => {
    if (a.is_system !== b.is_system) return a.is_system ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
}, [exercises, selectedCategory, searchQuery]);
```

### Anti-Patterns to Avoid
- **Mutually exclusive filters:** Don't clear search when category changes or vice versa. Per CONTEXT.md: "Clearing search keeps category filter active (independent filters)"
- **Category in search:** Per PICK-01, search should filter by name only, not category. Remove the `ex.category.toLowerCase().includes(query)` from current code.
- **Native select with custom styling:** Hard to style consistently across browsers; user chose custom dropdown.
- **Global state for dropdown:** Dropdown open/closed state is UI state, keep it local.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Click outside detection | Inline event handler logic | `useClickOutside` hook | Reusable, handles cleanup, supports touch |
| Category list | Hardcoded string array | `ExerciseCategory` type + "All Categories" | Type safety, single source of truth |

**Key insight:** The category list already exists in two places: `CATEGORY_OPTIONS` in ExercisePickerModal (8 items including Cardio) and `ExerciseCategory` type in database.ts (7 items, no Cardio). Requirements specify 7 categories matching the type definition. Use the type for consistency.

## Common Pitfalls

### Pitfall 1: Inconsistent Category Lists
**What goes wrong:** Modal shows different categories than database type allows
**Why it happens:** `CATEGORY_OPTIONS` includes "Cardio" but `ExerciseCategory` type doesn't
**How to avoid:** Create filter categories from `ExerciseCategory` type + "All Categories" option
**Warning signs:** TypeScript errors when comparing filter value to exercise.category

### Pitfall 2: Search Still Matching Category Text
**What goes wrong:** Typing "chest" in search shows chest exercises even with different category selected
**Why it happens:** Current filter includes `ex.category.toLowerCase().includes(query)`
**How to avoid:** Per PICK-01, remove category from search filter logic
**Warning signs:** Requirement PICK-05 says "Category text in exercise rows does not trigger search matches"

### Pitfall 3: Dropdown Menu Behind Modal Content
**What goes wrong:** Dropdown menu appears behind the exercise list or is clipped
**Why it happens:** Missing z-index, overflow hidden on parent, or wrong position context
**How to avoid:** Use `position: absolute` with proper z-index, ensure parent has `position: relative`
**Warning signs:** Menu items not clickable or visually hidden

### Pitfall 4: Filter State Persists Across Modal Opens
**What goes wrong:** User opens modal, selects "Chest", closes, reopens - still shows "Chest"
**Why it happens:** State not reset in the modal open effect
**How to avoid:** Per CONTEXT.md: "Always resets to 'All Categories' when modal reopens"
**Warning signs:** Add to existing useEffect that resets searchQuery

### Pitfall 5: Click Outside Fires on Dropdown Trigger
**What goes wrong:** Clicking the trigger button closes the dropdown immediately
**Why it happens:** Event bubbles, mousedown on trigger triggers outside handler
**How to avoid:** Use `ref.current.contains(event.target)` check correctly
**Warning signs:** Dropdown flickers open then closed

## Code Examples

Verified patterns from codebase:

### Existing Modal State Reset Pattern
```typescript
// Source: ExercisePickerModal.tsx lines 84-92
useEffect(() => {
  if (isOpen) {
    setSearchQuery('');
    setShowNewExerciseForm(false);
    setNewExerciseName('');
    setNewExerciseCategory('');
    resetAsync();
    // ADD: setSelectedCategory('All Categories');
  }
}, [isOpen, resetAsync]);
```

### Existing Input Styling Pattern
```typescript
// Source: ExercisePickerModal.tsx lines 241-249
<div class="form-group">
  <input
    type="text"
    value={searchQuery}
    onInput={handleSearch}
    class="input"
    placeholder="Search exercises..."
  />
</div>
```

### Existing CSS Variables for Styling
```css
/* Source: styles.css */
/* Colors */
--color-bg-surface: #1a1a1a;
--color-bg-elevated: #27272a;
--color-border: #2a2a2a;
--color-text-primary: #ffffff;
--color-text-secondary: #a1a1aa;

/* Spacing */
--spacing-sm: 0.5rem;
--spacing-md: 1rem;

/* Border radius */
--radius-md: 8px;

/* Input styling - can reuse for dropdown trigger */
min-height: var(--min-tap-target);  /* 44px */
padding: 0.75rem var(--spacing-md);
background-color: var(--color-bg-surface);
border: 1px solid var(--color-border);
border-radius: var(--radius-md);
```

### Category Type Definition
```typescript
// Source: packages/shared/src/types/database.ts lines 16-23
export type ExerciseCategory =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Legs'
  | 'Arms'
  | 'Core'
  | 'Other';
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Native `<select>` for dropdowns | Custom styled dropdowns | Ongoing trend | Better visual control, but requires accessibility attention |
| onClick for outside detection | mousedown + touchstart | Standard practice | Better UX - closes before action completes |

**Deprecated/outdated:**
- Using `onClick` alone for click-outside detection (misses touch devices)
- Inline event handlers without cleanup (causes memory leaks)

## Open Questions

Things that couldn't be fully resolved:

1. **Exact dropdown width**
   - What we know: CONTEXT.md says "partial width, left-aligned"
   - What's unclear: Exact pixel or percentage value
   - Recommendation: Claude's discretion per CONTEXT.md. Suggest ~180px or 50% of modal width, whichever is smaller.

2. **Keyboard navigation within dropdown**
   - What we know: CONTEXT.md lists as "Claude's Discretion"
   - What's unclear: Whether to implement full keyboard nav (arrow keys, enter, escape)
   - Recommendation: Implement basic Escape to close, Enter to select. Arrow key navigation is nice-to-have.

3. **Dropdown animation/transition**
   - What we know: CONTEXT.md lists as "Claude's Discretion"
   - What's unclear: Specific animation style/duration
   - Recommendation: Use existing `--transition-fast` (150ms) for opacity/transform.

## Sources

### Primary (HIGH confidence)
- ExercisePickerModal.tsx - Existing component structure and patterns
- styles.css - CSS variables and form styling patterns
- database.ts - ExerciseCategory type definition

### Secondary (MEDIUM confidence)
- [Ariakit Select Component](https://ariakit.org/components/select/) - ARIA patterns for accessible dropdowns
- [React Aria useSelect](https://react-spectrum.adobe.com/react-aria/useSelect.html) - Adobe's accessibility patterns
- [usehooks-ts useOnClickOutside](https://usehooks-ts.com/react-hook/use-on-click-outside) - Click outside hook pattern
- [Mantine use-click-outside](https://mantine.dev/hooks/use-click-outside/) - Hook implementation reference

### Tertiary (LOW confidence)
- [Building an Accessible Dropdown in React](https://medium.com/@katr.zaks/building-an-accessible-dropdown-combobox-in-react-a-step-by-step-guide-f6e0439c259c) - General accessibility guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing Preact, no new dependencies
- Architecture: HIGH - Follows existing codebase patterns
- Pitfalls: HIGH - Based on requirements analysis and codebase review

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - stable domain, no fast-moving dependencies)
