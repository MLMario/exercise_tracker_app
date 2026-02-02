# Phase 8: Database Schema Migration - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Modify the exercises table to support system (pre-created) exercises alongside user-created exercises. Update RLS policies to allow all users to read system exercises while restricting writes to user's own exercises.

</domain>

<decisions>
## Implementation Decisions

### Schema Changes (from proposal)
- Allow NULL user_id for system exercises
- Add columns: instructions (text[]), level, force, mechanic, is_system (boolean)
- Add CHECK constraints for level (beginner/intermediate/expert), force (push/pull/static), mechanic (compound/isolation)
- Add partial index for system exercises lookup
- Add index on user_id for filtering

### RLS Policy Updates (from proposal)
- SELECT: user's own exercises + all system exercises
- INSERT: only user's own exercises (is_system = false)
- UPDATE/DELETE: only user's own exercises (is_system = false)
- Use `(SELECT auth.uid())` pattern for performance

### Category Constraint
- Keep existing 6 categories: Chest, Back, Shoulders, Legs, Arms, Core
- Mapping from GitHub DB primaryMuscles defined in proposal

### Claude's Discretion
- Migration file naming convention
- Index naming conventions
- Transaction handling within migration

</decisions>

<specifics>
## Specific Ideas

Reference: `pre_created_exercise_list_proposal.md` Phase 1 (Database Schema Migration) defines all schema changes in detail.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-database-schema-migration*
*Context gathered: 2026-02-01*
