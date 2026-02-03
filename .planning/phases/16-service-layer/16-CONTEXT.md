# Phase 16: Service Layer - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Backend service functions for exercise management: `updateExercise`, `getUserExercises`, and `getExerciseDependencies`. RLS UPDATE policy already exists — no migration needed.

</domain>

<decisions>
## Implementation Decisions

### Update behavior
- Partial updates supported — can update name alone, category alone, or both
- Returns the full updated exercise object (not just success/failure)
- Name uniqueness enforced per user, case-insensitive (e.g., 'Bench Press' and 'bench press' are duplicates)
- Uniqueness check scoped to user's own exercises only — matching system exercise names is allowed

### Input validation
- Service trims whitespace from names before saving
- Service validates names contain only letters, numbers, and spaces — no special characters
- Service rejects empty/whitespace-only names
- Returns specific typed errors: DUPLICATE_NAME, INVALID_NAME, EMPTY_NAME

### getUserExercises function
- Dedicated function returning only user-created exercises (is_system = false, user_id = current user)
- Returns exercises sorted alphabetically by name (A-Z)
- Included in this phase so backend is fully ready before any UI work

### getExerciseDependencies function
- Returns dependency counts: how many templates, workout logs, and charts reference a given exercise
- Queries template_exercises, workout_log_exercises, and user_charts tables
- Included in this phase to prep for delete confirmation in Phase 20

### RLS policies
- All four policies (SELECT, INSERT, UPDATE, DELETE) already exist on exercises table
- No new migration needed — verified from migration_system_exercises.sql

### Claude's Discretion
- Exact TypeScript types and interfaces for update params/return values
- Error type implementation (string enum, union type, etc.)
- Whether dependency check uses separate queries or a single RPC call

</decisions>

<specifics>
## Specific Ideas

No specific requirements — follow existing service patterns (createExercise, deleteExercise) for consistency.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-service-layer*
*Context gathered: 2026-02-03*
