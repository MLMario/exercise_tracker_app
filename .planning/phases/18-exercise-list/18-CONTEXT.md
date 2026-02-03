# Phase 18: Exercise List - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

My Exercises view within the Settings panel that displays user-created exercises in a simple list. No search or filter controls (deferred to v2). Users can view their exercises, see an empty state when none exist, and navigate back to Settings menu.

</domain>

<decisions>
## Implementation Decisions

### List presentation
- Each row shows exercise name on first line, category on second line (grayed out)
- Match existing exercise picker row style: name at 15px bold, category at 12px muted gray
- No "CUSTOM" badge needed since view only shows user exercises
- Sorted alphabetically A-Z by name
- No exercise count displayed
- Rows are not tappable (Phase 19 will add expand-to-edit)

### Empty state
- Text message + create button (button is placeholder, Phase 21 wires it up)
- No icon or illustration — just text and button
- Create button exists but is non-functional until Phase 21

### Navigation flow
- Tapping "My Exercises" in settings menu replaces menu content with exercise list (no slide animation)
- Panel title changes from "Settings" to "My Exercises"
- Back button returns to settings menu (not dashboard)
- Header matches settings panel header pattern (back arrow + title)

### Claude's Discretion
- Empty state message tone and exact wording
- Spacing and padding within list rows
- Loading state while exercises are fetched
- How to handle the placeholder create button (disabled vs styled differently)

</decisions>

<specifics>
## Specific Ideas

- Follow existing exercise picker modal patterns for row layout (name + category two-line format from ExercisePickerModal.tsx)
- No search or filter controls — keep view simple

</specifics>

<deferred>
## Deferred Ideas

- Search exercises by name — moved to v2 (LIST-V2-02)
- Filter exercises by category dropdown — moved to v2 (LIST-V2-03)

</deferred>

---

*Phase: 18-exercise-list*
*Context gathered: 2026-02-03*
