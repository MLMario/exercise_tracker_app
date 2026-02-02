# Phase 10: Backend Updates - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Update TypeScript types and service functions to support system exercises alongside user exercises. This includes updating the Exercise interface with new fields and modifying service functions to work with both system and user exercises. UI changes are handled in Phase 11.

</domain>

<decisions>
## Implementation Decisions

### Duplicate handling
- Users CAN create custom exercises with same names as system exercises
- Duplicate detection only checks within user's own exercises
- System exercises don't affect user's ability to create custom exercises

### Service layer design
- No filtering parameters needed in getExercises
- All filtering/sorting handled client-side (Phase 11)
- Database returns exercises ordered by name (alphabetically)
- RLS automatically filters to user's + system exercises

### Type updates
- user_id becomes nullable: `string | null` (to match what DB returns for system exercises)
- New fields are `string | null` / `string[] | null` - just stored data, not used in UI
- is_system boolean distinguishes system from user exercises
- No strict enums needed - these fields are pass-through from import

### Claude's Discretion
- Internal type organization and naming conventions

</decisions>

<specifics>
## Specific Ideas

Reference implementation from proposal (pre_created_exercise_list_proposal.md):
- Section 4: Service Layer Changes shows exact function signatures
- Section 5.2: Type Updates shows interface structure
- Pattern: `(SELECT auth.uid())` wrapper already in RLS from Phase 8

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-backend-updates*
*Context gathered: 2026-02-01*
