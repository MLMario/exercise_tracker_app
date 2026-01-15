# Phase 18: Template List Redesign - Context

**Gathered:** 2026-01-14
**Status:** Ready for planning

<vision>
## How This Should Work

The template list on the dashboard transforms from the current single-column layout to a compact 2-column mini-grid. Each template appears as a small card with the name in the header alongside edit/delete icon buttons, and a full-width Start button at the bottom.

The design follows the mockup exactly: `.mockups/template-mockup-2-mini-grid.html`

Additionally, remove the "X exercise(s) available" text from the bottom of the dashboard — it's visual clutter that doesn't add value.

</vision>

<essential>
## What Must Be Nailed

- **Space efficiency** — Fit more templates in the viewport. The mockup shows 6 templates in ~200px vs ~600px for the current design.
- **Clean look** — Compact, modern aesthetic with less visual clutter. The mini-card design with icon buttons keeps things tight.
- **Exact mockup match** — Implement the design as shown, not a variation.

</essential>

<boundaries>
## What's Out of Scope

- Template editor functionality (just the list view)
- New template features (this is purely visual redesign)
- Other dashboard sections (focus on template grid + exercise count removal)

</boundaries>

<specifics>
## Specific Ideas

- Follow mockup: `.mockups/template-mockup-2-mini-grid.html`
- 2-column grid using CSS grid
- Compact cards with edit/delete SVG icons in header (12x12px)
- Full-width Start button (btn-xs size)
- Remove "X exercise(s) available" text from dashboard

</specifics>

<notes>
## Additional Context

This combines what was originally planned as Phase 18 (template grid) and Phase 19 (remove exercise count). Both are dashboard cleanup, so they belong together.

Phase 19 in the roadmap may need to be updated or marked complete since the exercise count removal is now included here.

</notes>

---

*Phase: 18-template-list-redesign*
*Context gathered: 2026-01-14*
