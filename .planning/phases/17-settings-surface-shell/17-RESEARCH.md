# Phase 17: Settings Surface Shell - Research

**Researched:** 2026-02-03
**Domain:** Preact slide-in panel UI, surface navigation, CSS animations
**Confidence:** HIGH

## Summary

This phase adds a Settings panel that slides in from the right side of the dashboard, triggered by a gear icon in the dashboard header. The panel is NOT a new top-level "surface" in the `main.tsx` routing sense -- it is an overlay panel rendered as part of the DashboardSurface component (or alongside it). The panel contains two menu items ("My Exercises" with chevron and "Log Out" button) and supports internal sub-navigation where "My Exercises" replaces the menu content within the same panel.

The codebase already has established patterns for overlays (modal-overlay with `position: fixed`), animations (fadeIn, slideUp keyframes), and CSS variables for consistent theming. The settings panel follows these patterns but introduces a new slide-from-right animation. The existing logout button in the dashboard header gets replaced by a gear icon button.

**Primary recommendation:** Implement the settings panel as a child component within DashboardSurface, using CSS `transform: translateX()` for the slide animation and the existing overlay/backdrop pattern for the dimmed background. Use an internal `panelView` state ('menu' | 'exercises') to handle sub-navigation within the panel.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Preact | existing | Component rendering | Already the app framework |
| preact/hooks | existing | useState, useCallback, useEffect | Already used throughout app |
| CSS (styles.css) | existing | All styling | App uses a single CSS file, no CSS-in-JS |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none new) | - | - | No new dependencies needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS transform animation | @use-gesture for swipe | Context says "no swipe-to-close -- buttons only", so gesture library not needed |
| Separate surface in main.tsx | Overlay panel in DashboardSurface | Panel is an overlay on dashboard, not a full surface replacement |
| Preact portals | Direct DOM child | Portals unnecessary -- panel lives in dashboard component tree, z-index handles layering |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
  surfaces/
    dashboard/
      DashboardSurface.tsx      # MODIFY - replace logout btn with gear icon, add onOpenSettings or render panel
      SettingsPanel.tsx          # NEW - the slide-in panel component
      SettingsMenu.tsx           # NEW - menu view (My Exercises item + Log Out button)
      index.ts                  # MODIFY - export new components
    ...
  apps/web/css/
    styles.css                  # MODIFY - add settings panel CSS
```

### Pattern 1: Settings Panel as Dashboard Child (NOT a new AppSurface)

**What:** The settings panel is rendered inside (or alongside) DashboardSurface, NOT as a new `AppSurface` type in main.tsx. The panel overlays the dashboard with a backdrop.

**When to use:** When the UI is a transient overlay that doesn't replace the entire screen context.

**Why:** The context explicitly states "Dashboard visible behind with darkened overlay" -- this is an overlay pattern, not a surface-switch pattern. The `main.tsx` routing uses `AppSurface = 'auth' | 'dashboard' | 'templateEditor' | 'workout'` and settings does not belong here because the dashboard remains rendered behind the panel.

**Example:**
```typescript
// In DashboardSurface.tsx
const [settingsOpen, setSettingsOpen] = useState(false);

return (
  <div class="dashboard-surface-container">
    {/* existing header, content, etc. */}
    <header class="dashboard-header">
      <span class="brand-logo">...</span>
      <button class="settings-btn" onClick={() => setSettingsOpen(true)} type="button">
        {/* gear SVG icon */}
      </button>
    </header>
    {/* ...existing content... */}

    {/* Settings Panel - rendered as overlay */}
    <SettingsPanel
      isOpen={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      onLogout={onLogout}
    />
  </div>
);
```

### Pattern 2: Slide-from-Right with CSS Transform

**What:** Panel uses `transform: translateX(100%)` when hidden and `transform: translateX(0)` when visible, with a CSS transition.

**When to use:** For slide-in panels that need smooth animation.

**Example:**
```css
/* Backdrop overlay */
.settings-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-normal);
}

.settings-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

/* Panel */
.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80%;
  max-width: 400px;
  background-color: var(--color-bg-surface);
  border-left: 1px solid var(--color-border);
  z-index: 1001;
  transform: translateX(100%);
  transition: transform var(--transition-normal);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.settings-panel.open {
  transform: translateX(0);
}
```

### Pattern 3: Internal Panel Navigation via State

**What:** The panel has a `panelView` state that controls which content is shown. The back arrow behavior changes based on the current view.

**When to use:** For panels with sub-navigation that replaces content within the same container.

**Example:**
```typescript
// In SettingsPanel.tsx
type PanelView = 'menu' | 'exercises';
const [panelView, setPanelView] = useState<PanelView>('menu');

// Back button behavior depends on view
const handleBack = () => {
  if (panelView === 'exercises') {
    setPanelView('menu');  // Go back to menu
  } else {
    onClose();  // Close the panel
  }
};

// Reset view when panel closes
useEffect(() => {
  if (!isOpen) {
    setPanelView('menu');
  }
}, [isOpen]);
```

### Pattern 4: Existing Logout Flow Reuse

**What:** The `onLogout` callback already exists in DashboardSurface props. It flows from `main.tsx`'s `handleLogout` through DashboardSurface to the new SettingsPanel.

**Why:** No changes to auth flow needed. The logout button just moves from dashboard header to settings menu.

**Example:**
```typescript
// DashboardSurface already receives onLogout prop
// Just pass it through to SettingsPanel
<SettingsPanel
  isOpen={settingsOpen}
  onClose={() => setSettingsOpen(false)}
  onLogout={onLogout}  // Same prop, new location
/>
```

### Anti-Patterns to Avoid
- **Adding 'settings' to AppSurface type in main.tsx:** The settings panel is an overlay, not a surface replacement. The dashboard stays mounted behind it.
- **Using display:none/block for animation:** Use CSS transforms for smooth GPU-accelerated animations. The panel should always be in the DOM when open.
- **Rendering panel conditionally with `{settingsOpen && <SettingsPanel />}`:** This prevents exit animations. Instead, always render the panel and control visibility via CSS class.
- **Forgetting to reset panelView on close:** If user navigates to "My Exercises" then closes, reopening should show the menu, not exercises.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG gear icon | Custom SVG from scratch | Copy from mock (option-c-v4.html line 711-712) | Exact SVG path already provided in the reference mock |
| SVG back arrow | Custom SVG | Copy from mock (line 732-734) | Same as above |
| SVG list icon | Custom SVG | Copy from mock (line 744-749) | Same as above |
| SVG chevron | Custom SVG | Copy from mock (line 757-759) | Same as above |
| Color values | New colors | Existing CSS variables | `--color-text-secondary` (#a1a1aa), `--color-danger` (#f87171), `--color-bg-elevated` (#27272a), `--color-border` (#2a2a2a), `--color-accent` (#4f9eff) |
| Overlay backdrop pattern | Custom implementation | Follow existing `.modal-overlay` pattern | Already has `position: fixed`, `rgba(0,0,0,0.8)`, `z-index: 1000` |
| Transition timing | Custom values | `--transition-normal` (250ms ease-in-out) and `--transition-fast` (150ms ease-in-out) | Consistency with existing animations |

**Key insight:** Every visual element in this phase has a reference in the mock HTML (option-c-v4.html). Extract SVGs, colors, and spacing directly from there, mapped to existing CSS variables.

## Common Pitfalls

### Pitfall 1: Panel Doesn't Animate on Close
**What goes wrong:** If the panel component is conditionally rendered (`{isOpen && <Panel />}`), removing it from the DOM prevents the exit animation from playing.
**Why it happens:** Preact unmounts the component immediately on state change.
**How to avoid:** Always render the panel in the DOM. Control visibility via CSS classes (`.open` class toggles `transform` and backdrop `opacity`).
**Warning signs:** Panel snaps closed instead of sliding out.

### Pitfall 2: Scroll Lock on Body
**What goes wrong:** When the settings panel is open, the dashboard behind it can scroll, causing jarring UX.
**Why it happens:** The panel is `position: fixed` but the body still scrolls.
**How to avoid:** Add `overflow: hidden` to the body or dashboard container when the panel is open. Or rely on the backdrop's `pointer-events: auto` to capture all interactions.
**Warning signs:** Dashboard content scrolls behind the panel.

### Pitfall 3: Z-Index Conflicts with Dashboard Header
**What goes wrong:** The dashboard header has `z-index: 100` (sticky). The settings panel needs to appear above it.
**Why it happens:** Stacking context issues.
**How to avoid:** Use `z-index: 1000` for backdrop and `z-index: 1001` for panel (matching existing `.modal-overlay` z-index pattern).
**Warning signs:** Dashboard header peeks through or appears above the backdrop.

### Pitfall 4: Gear Icon Not Matching Existing Button Size
**What goes wrong:** The gear icon button looks misaligned or too small/large compared to the old logout button.
**Why it happens:** Different padding, font-size, or min-height than the existing button.
**How to avoid:** Use `min-height: 36px` and `min-width: 36px` (matching existing `--min-tap-target: 44px` or close). Reference the mock's `.settings-button` styles.
**Warning signs:** Header looks unbalanced after the change.

### Pitfall 5: Forgetting to Remove Old Logout Button
**What goes wrong:** Both the old text "Logout" button and the new gear icon appear in the header.
**Why it happens:** Incomplete refactoring -- adding gear icon without removing old button.
**How to avoid:** In DashboardSurface.tsx, the `onLogout && (<button class="logout-btn" ...>)` block on lines 443-451 must be replaced (not supplemented) with the gear icon button.
**Warning signs:** Two buttons in the header.

### Pitfall 6: Panel Width on Small Screens
**What goes wrong:** The 80% width panel leaves very little visible dashboard on small screens, or the panel is too narrow.
**Why it happens:** Fixed percentage without a max-width or min-width.
**How to avoid:** Use `width: 80%` with `max-width: 400px` (the app's max container width is 480px). This ensures the panel works well at any screen size.
**Warning signs:** Panel too wide on phone, too narrow on tablet.

## Code Examples

### Gear Icon Button (replacing logout button in DashboardSurface)
```typescript
// Source: mocks/option-c-v4.html lines 709-714
<button
  class="settings-btn"
  onClick={() => setSettingsOpen(true)}
  type="button"
  aria-label="Settings"
>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
</button>
```

### Settings Panel Component Structure
```typescript
// Source: Derived from codebase patterns + mock reference
import { useState, useEffect } from 'preact/hooks';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

type PanelView = 'menu' | 'exercises';

export function SettingsPanel({ isOpen, onClose, onLogout }: SettingsPanelProps) {
  const [panelView, setPanelView] = useState<PanelView>('menu');

  // Reset to menu view when panel closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to let close animation finish before resetting
      const timer = setTimeout(() => setPanelView('menu'), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleBack = () => {
    if (panelView === 'exercises') {
      setPanelView('menu');
    } else {
      onClose();
    }
  };

  const handleBackdropClick = () => {
    onClose();
  };

  const headerTitle = panelView === 'menu' ? 'Settings' : 'My Exercises';
  const backLabel = panelView === 'menu' ? 'Back' : 'Settings';

  return (
    <>
      <div
        class={`settings-backdrop ${isOpen ? 'open' : ''}`}
        onClick={handleBackdropClick}
      />
      <div class={`settings-panel ${isOpen ? 'open' : ''}`}>
        {/* Panel header */}
        <div class="settings-panel-header">
          <div class="settings-header-left">
            <button class="settings-back-btn" onClick={handleBack} type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              {backLabel}
            </button>
            <span class="settings-header-title">{headerTitle}</span>
          </div>
        </div>

        {/* Panel content */}
        <div class="settings-panel-content">
          {panelView === 'menu' && (
            <SettingsMenu
              onMyExercises={() => setPanelView('exercises')}
              onLogout={onLogout}
            />
          )}
          {panelView === 'exercises' && (
            <div class="my-exercises-placeholder">
              {/* My Exercises content - future phase */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

### Settings Menu Component
```typescript
// Source: Derived from mock option-c-v4.html View 2 (lines 741-795)
interface SettingsMenuProps {
  onMyExercises: () => void;
  onLogout?: () => void;
}

export function SettingsMenu({ onMyExercises, onLogout }: SettingsMenuProps) {
  return (
    <div class="settings-menu">
      {/* My Exercises menu item */}
      <div class="settings-menu-item" onClick={onMyExercises}>
        <div class="settings-menu-item-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 5h12M6 12h12M6 19h12"></path>
            <circle cx="3" cy="5" r="1" fill="currentColor"></circle>
            <circle cx="3" cy="12" r="1" fill="currentColor"></circle>
            <circle cx="3" cy="19" r="1" fill="currentColor"></circle>
          </svg>
        </div>
        <div class="settings-menu-item-content">
          <span class="settings-menu-item-label">My Exercises</span>
        </div>
        <div class="settings-menu-item-chevron">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </div>
      </div>

      {/* Log Out button */}
      {onLogout && (
        <button class="settings-logout-btn" onClick={onLogout} type="button">
          Log Out
        </button>
      )}
    </div>
  );
}
```

### CSS for Settings Panel
```css
/* Source: Derived from existing patterns + mock option-c-v4.html */

/* Gear icon button in dashboard header */
.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  min-height: 36px;
  min-width: 36px;
}

.settings-btn:hover {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

/* Settings backdrop */
.settings-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-normal);
}

.settings-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

/* Settings panel */
.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80%;
  max-width: 400px;
  background-color: var(--color-bg-surface);
  border-left: 1px solid var(--color-border);
  z-index: 1001;
  transform: translateX(100%);
  transition: transform var(--transition-normal);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.settings-panel.open {
  transform: translateX(0);
}

/* Settings panel header */
.settings-panel-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
}

.settings-header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.settings-back-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  margin: calc(-1 * var(--spacing-sm));
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  min-height: var(--min-tap-target);
  min-width: var(--min-tap-target);
  font-family: inherit;
}

.settings-back-btn:hover {
  background: rgba(79, 158, 255, 0.1);
}

.settings-header-title {
  font-size: 1.25rem;
  font-weight: 600;
}

/* Settings panel content */
.settings-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

/* Settings menu item (card style) */
.settings-menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-sm);
}

.settings-menu-item:hover {
  border-color: #3a3a3a;
}

.settings-menu-item-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.settings-menu-item-content {
  flex: 1;
}

.settings-menu-item-label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.settings-menu-item-chevron {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
}

/* Settings logout button */
.settings-logout-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-danger);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  margin-top: var(--spacing-md);
  transition: all var(--transition-fast);
  min-height: var(--min-tap-target);
  font-family: inherit;
}

.settings-logout-btn:hover {
  background-color: rgba(248, 113, 113, 0.1);
  border-color: var(--color-danger);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Logout button in dashboard header | Gear icon in header, logout in settings | This phase | Cleaner header, room for future settings |
| No settings surface | Settings slide-in panel | This phase | Foundation for exercise management and future settings |

**Deprecated/outdated:**
- The `.logout-btn` CSS class will become unused after this phase (the old logout button is removed from dashboard header).

## Open Questions

1. **My Exercises sub-view content**
   - What we know: Clicking "My Exercises" navigates within the panel (replaces menu content). Back arrow returns to menu.
   - What's unclear: What exactly shows in the My Exercises view for this phase? This is a "shell" phase.
   - Recommendation: Show a placeholder or empty state in this phase. The actual exercise list content is a future phase. The important thing is that the navigation TO and FROM the sub-view works correctly.

2. **Body scroll lock**
   - What we know: Panel overlay should capture all interactions.
   - What's unclear: Whether the existing app structure needs explicit `overflow: hidden` on body when panel is open.
   - Recommendation: The backdrop with `pointer-events: auto` should be sufficient. If scrolling bleeds through, add `overflow: hidden` to body via JS toggle. Test during implementation.

## Sources

### Primary (HIGH confidence)
- `apps/web/src/main.tsx` - Surface routing pattern (AppSurface type, conditional rendering)
- `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` - Dashboard header structure, onLogout prop
- `apps/web/css/styles.css` - CSS variables, existing overlay/modal patterns, dashboard header styles
- `mocks/option-c-v4.html` - Reference mock with SVGs, colors, layout for all three views
- `.planning/phases/17-settings-surface-shell/17-CONTEXT.md` - User decisions constraining implementation

### Secondary (MEDIUM confidence)
- CSS animation patterns from existing codebase (fadeIn, slideUp keyframes)
- z-index layering strategy from `.modal-overlay` (z-index: 1000)

### Tertiary (LOW confidence)
- None. All findings verified against codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries, all existing patterns
- Architecture: HIGH - Directly derived from codebase analysis and mock reference
- Pitfalls: HIGH - Based on concrete code review (z-index values, conditional rendering patterns)

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (stable -- no external dependencies)
