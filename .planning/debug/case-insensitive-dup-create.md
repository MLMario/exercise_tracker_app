---
status: diagnosed
trigger: "Case-insensitive duplicate name detection missing on exercise create"
created: 2026-02-04T00:00:00Z
updated: 2026-02-04T00:00:00Z
---

## Current Focus

hypothesis: createExercise has no pre-insert case-insensitive duplicate check; relies solely on DB unique constraint which does not exist
test: Read createExercise service code and DB schema
expecting: No ilike query before insert; no unique index on (user_id, lower(name))
next_action: Report diagnosis

## Symptoms

expected: "bench press" should be rejected if "Bench Press" already exists for the same user
actual: "bench press" is allowed through, creating a case-variant duplicate
errors: None (silent success)
reproduction: Create exercise "Bench Press", then create "bench press" -- second succeeds
started: Always broken for create path (update path is correctly handled)

## Eliminated

(none needed -- root cause found on first hypothesis)

## Evidence

- timestamp: 2026-02-04T00:01:00Z
  checked: createExercise in packages/shared/src/services/exercises.ts (lines 88-151)
  found: No pre-insert duplicate name check. Only catches post-insert Postgres error code 23505 (unique constraint violation). No .ilike() query before insert.
  implication: The function relies entirely on the database unique constraint to catch duplicates.

- timestamp: 2026-02-04T00:02:00Z
  checked: exercises table schema in sql/current_schema.sql (lines 4-18)
  found: No UNIQUE constraint or index on (user_id, name) or (user_id, lower(name)). Only constraints are PK and FK.
  implication: The database has NO uniqueness enforcement on exercise names at all. The 23505 handler is dead code -- it can never trigger.

- timestamp: 2026-02-04T00:03:00Z
  checked: updateExercise in packages/shared/src/services/exercises.ts (lines 341-353)
  found: Update path DOES have a proper case-insensitive check using .ilike('name', trimmedName) scoped to user_id, is_system=false, and .neq('id', id).
  implication: The update path was correctly implemented with case-insensitive duplicate detection. The create path was not given the same treatment.

- timestamp: 2026-02-04T00:04:00Z
  checked: exerciseExists function in packages/shared/src/services/exercises.ts (lines 189-211)
  found: Uses .eq('name', name.trim()) -- case-SENSITIVE exact match. Not used in createExercise anyway.
  implication: Even the helper function meant for checking existence is case-sensitive, and it is not called during create flow.

- timestamp: 2026-02-04T00:05:00Z
  checked: handleCreate in MyExercisesList.tsx (lines 194-208)
  found: No client-side duplicate check. Calls exercises.createExercise(createName.trim(), ...) directly and relies on the service to return an error.
  implication: Frontend is not at fault -- it correctly delegates to the service. The service is the problem.

- timestamp: 2026-02-04T00:06:00Z
  checked: .planning/research/PITFALLS.md and SUMMARY.md
  found: Project research explicitly identified this gap: "Consider adding a DB-level unique index (user_id, lower(name)) for defense in depth" and noted uniqueness is "enforced only at the application level (query check)."
  implication: The team knew this was needed but it was deferred and never added to the create path.

## Resolution

root_cause: createExercise() in packages/shared/src/services/exercises.ts has no application-level case-insensitive duplicate name check before the INSERT, AND the database has no unique constraint/index on (user_id, lower(name)) to catch it. The only "protection" is a handler for Postgres error 23505 that can never fire because no such constraint exists.
fix: (diagnosis only -- not applied)
verification: (diagnosis only)
files_changed: []
