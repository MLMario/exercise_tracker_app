# Phase 20: Exercise Delete - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Delete custom exercises with confirmation modal and dependency warnings. Users initiate delete from the exercise row, see a confirmation with optional dependency info, and the exercise is permanently removed. Creating exercises and editing exercises are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Delete trigger placement
- Trash icon button on the exercise row, to the right of the edit (pencil) button
- Trash icon only, no text label
- Always visible regardless of accordion expand/collapse state
- Icon styled in danger red color

### Confirmation modal design
- Centered overlay modal with backdrop dimming
- Calm confirmation tone, not alarming
- Modal title: "Delete Exercise?"
- Body message: "Delete [Exercise Name]. All history will be deleted with it."
- "Delete Exercise" button styled as red danger button
- "Keep Exercise" button styled as neutral/outlined
- Exercise name appears in the body text, not the title

### Dependency warning content
- Only check template dependencies (not workout logs or chart selections)
- If exercise is used in templates, show a simple warning: "This exercise is used in templates."
- No counts, no template names — just the fact
- Warning appears below the main delete message
- Warning styled as amber/yellow warning box

### Post-delete behavior
- No toast or explicit feedback — exercise removal from list is the feedback
- Instant removal from list, no animation
- If last exercise deleted, show the empty state from Phase 18
- Deletion is final once confirmed — no undo capability

### Claude's Discretion
- Exact modal dimensions and padding
- Warning box icon choice
- Error handling if delete fails
- How to handle the accordion state if expanded when delete is tapped

</decisions>

<specifics>
## Specific Ideas

- Delete message wording specifically: "Delete [Exercise Name]. All history will be deleted with it."
- Trash icon should match the pencil icon size/style but in danger red
- The modal is the safety net — no additional undo mechanisms needed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-exercise-delete*
*Context gathered: 2026-02-03*
