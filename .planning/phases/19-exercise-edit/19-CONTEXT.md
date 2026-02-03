# Phase 19: Exercise Edit - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Inline accordion editing for exercise name and category within the My Exercises list. Users can expand a row, modify fields, save or cancel. This phase does NOT include exercise creation, deletion, or any new capabilities beyond editing existing custom exercises.

</domain>

<decisions>
## Implementation Decisions

### Accordion interaction
- Single open at a time — tapping a different row's edit icon auto-collapses the current
- Expand/collapse triggered by a pencil icon on the row (not tap-anywhere)
- Smooth slide-down/up animation for expand/collapse
- If user has unsaved changes and taps another row's edit icon, discard changes silently (no warning)

### Edit form layout
- Text input field pre-filled with current exercise name
- Dropdown/select for category selection
- Fields stacked vertically (name on top, category below), full width
- No field labels — placeholder text only for a cleaner look

### Save/Cancel behavior
- Save and Cancel buttons at the bottom of the form, side by side (Cancel left, Save right)
- Save button disabled until user actually changes something (name or category differs from original)
- Name validation: non-empty AND unique among user's exercises
- After successful save, accordion auto-collapses

### Visual feedback
- Pencil icon as the edit trigger on each exercise row
- Brief success flash (green highlight or checkmark) on the row before collapsing after save
- Errors displayed inline below the offending field (e.g., "Name already exists"), form stays open
- Expanded form area has a visually distinct background (subtle shade difference) to separate from list rows

### Claude's Discretion
- Exact animation duration and easing
- Specific shade/color for the expanded area background
- Success flash implementation details (color, duration, style)
- Loading/disabled state styling while save is in progress
- Exact dropdown component choice for category selection

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-exercise-edit*
*Context gathered: 2026-02-03*
