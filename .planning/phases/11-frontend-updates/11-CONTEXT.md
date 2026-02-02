# Phase 11: Frontend Updates - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Add visual distinction between user-created and system exercises in the exercise picker modal. User exercises appear first with a badge, system exercises follow. No new functionality—just visual presentation and sorting.

</domain>

<decisions>
## Implementation Decisions

### Badge Design
- **Style:** Solid pill badge (Option B from mockup)
- Green gradient background (`linear-gradient(135deg, #34d399 0%, #10b981 100%)`)
- Dark text on light badge for contrast
- Uppercase "CUSTOM" text, 10px font, 600 weight
- Rounded pill shape (`border-radius: 100px`)
- Subtle shadow for depth (`box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3)`)

### Badge Placement
- Badge appears to the right of the exercise name/category
- Only shown for user-created exercises (`is_system === false`)
- System exercises have no badge

### Sorting Order
- User exercises appear first (sorted alphabetically by name)
- System exercises appear after (sorted alphabetically by name)
- Sort comparison: `is_system` flag first, then `name.localeCompare()`

### Visual Hierarchy
- User exercise names: full white (`#fafafa`)
- System exercise names: slightly muted (`#a1a1aa`)
- Categories: muted gray for both

### Claude's Discretion
- Whether to add a visual divider between custom and library sections
- Exact spacing and padding adjustments
- Hover state styling for exercise items
- Loading state handling

</decisions>

<specifics>
## Specific Ideas

**Design Reference:**
- Mockup file: `badge-mockup.html` (project root)
- Selected option: Option B (`.badge-solid` class in the mockup CSS)

**Relevant CSS from mockup:**
```css
.badge-solid {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 5px 10px;
  border-radius: 100px;
  color: #18181b;
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
}
```

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-frontend-updates*
*Context gathered: 2026-02-02*
