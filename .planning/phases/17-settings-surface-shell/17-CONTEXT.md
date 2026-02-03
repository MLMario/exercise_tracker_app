# Phase 17: Settings Surface Shell - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

A Settings surface accessible from the dashboard via a gear icon. The panel contains a menu with "My Exercises" (navigable) and a Log Out button (relocated from dashboard header). Users can navigate back to the dashboard. This phase delivers the shell and navigation only -- exercise list, edit, delete, and create are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Settings layout
- Slide-in panel from the right (~80% screen width)
- Dashboard visible behind with darkened overlay
- Tapping the darkened backdrop closes the panel
- Panel has a header with "Settings" title and back arrow

### Navigation feel
- Panel slides in from the right with animation
- Close via back arrow in panel header or tapping backdrop
- No swipe-to-close gesture -- buttons only
- "My Exercises" navigates within the panel (replaces menu content inside the same panel; back arrow returns to menu)

### Gear icon placement
- Replaces the current logout button position in dashboard header (far right)
- Solid gear icon, no label text
- Matches existing header element colors

### Menu items
- Only two items for now: "My Exercises" and Log Out (no disabled/coming-soon placeholders)
- "My Exercises" styled as a card-style menu item with icon (list icon from mock), label, and chevron
- No exercise count badge
- Log Out as a full-width outlined button with red text, separated below the menu items (matches mock reference)

### Claude's Discretion
- Exact animation timing and easing
- Panel shadow/border styling
- Spacing and padding values
- Icon SVG source (Lucide, custom, etc.)

</decisions>

<specifics>
## Specific Ideas

- Reference mock: `mocks/option-c-v4.html` -- follow the visual style for menu items (card with icon, label, chevron) and logout button (red outlined, full-width)
- Settings header: back arrow + "Settings" title (as shown in mock View 2)
- "My Exercises" icon: list-style icon matching the mock's SVG pattern

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 17-settings-surface-shell*
*Context gathered: 2026-02-03*
