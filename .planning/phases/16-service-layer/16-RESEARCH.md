# Phase 16: Service Layer - Research

**Researched:** 2026-02-03
**Domain:** Supabase service functions (updateExercise, getUserExercises, getExerciseDependencies)
**Confidence:** HIGH

## Summary

This phase adds three new service functions to the existing `exercises.ts` service module, plus updates to the `ExercisesService` interface in `types/services.ts`. The codebase has strong, consistent patterns for service functions that must be followed exactly.

The key technical challenges are: (1) case-insensitive duplicate name checking that excludes the exercise being updated, (2) input validation with typed error returns that differ from the existing generic `Error` pattern, and (3) efficient dependency counting across three tables. All RLS policies already exist -- no migration work is needed.

**Primary recommendation:** Follow the exact patterns in `createExercise` and `deleteExercise` for auth checks, error handling, and return types. Use Supabase `.ilike()` + `.neq()` for the uniqueness check. Use `{ count: 'exact', head: true }` for dependency counts.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.90.1 | Database client | Already used throughout all services |

### Supporting
No new libraries needed. This phase only adds functions to an existing service file.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side `.ilike()` for uniqueness | DB unique constraint (citext/lower index) | DB constraint would be ideal but requires migration; `.ilike()` handles it at service layer per CONTEXT.md decisions |
| Three separate count queries for dependencies | Single Postgres RPC function | RPC would be more efficient but requires a migration; three parallel queries with `{ count: 'exact', head: true }` is simpler and migration-free |

## Architecture Patterns

### Existing Service Structure (MUST follow)
```
packages/shared/src/
  services/
    exercises.ts      # <-- Add functions here
    index.ts          # <-- Already exports exercises
  types/
    services.ts       # <-- Add interface methods + new types here
    database.ts       # <-- Exercise type already defined
    index.ts          # <-- Already re-exports everything
  lib/
    supabase.ts       # <-- Import client from here
```

### Pattern 1: Service Function Structure
**What:** Every service function follows a try/catch with auth check, validation, Supabase call, error mapping, return.
**When to use:** Every new function.
**Example (from createExercise):**
```typescript
async function functionName(params): Promise<ServiceResult<ReturnType>> {
  try {
    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: userError || new Error('No authenticated user') };
    }

    // 2. Validate inputs
    // ...

    // 3. Supabase operation
    const { data, error } = await supabase.from('exercises')...

    // 4. Handle Supabase errors
    if (error) {
      return { data: null, error };
    }

    // 5. Return success
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in functionName:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
```

### Pattern 2: Service Export Object
**What:** Functions are defined as standalone then assembled into an exported object matching the interface.
**When to use:** When adding new functions to the service.
**Example:**
```typescript
// At bottom of exercises.ts
export const exercises: ExercisesService = {
  getExercises,
  // ... existing functions
  updateExercise,        // ADD
  getUserExercises,      // ADD
  getExerciseDependencies, // ADD
};
```

### Pattern 3: Return Types
**What:** The codebase uses two return type patterns:
- `ServiceResult<T>` = `{ data: T | null; error: Error | null }` -- for functions that return data
- `ServiceError` = `{ error: Error | null }` -- for void operations (delete)
**When to use:**
- `updateExercise` returns `ServiceResult<Exercise>` (returns full updated exercise)
- `getUserExercises` returns `ServiceResult<Exercise[]>`
- `getExerciseDependencies` returns `ServiceResult<ExerciseDependencies>` (new type)

### Anti-Patterns to Avoid
- **Importing supabase from anywhere other than `../lib/supabase`:** Always use the shared client instance.
- **Throwing errors instead of returning them:** Service functions never throw; they catch and return `{ data: null, error }`.
- **Returning bare booleans or strings:** Always use `ServiceResult<T>` or `ServiceError` wrappers.
- **Skipping the auth check:** Every mutation function (update) must verify `supabase.auth.getUser()` first. Read functions that are user-scoped also need it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Case-insensitive string comparison | `name.toLowerCase() === ...` client-side | Supabase `.ilike('name', exactName)` | DB-level comparison is authoritative; client-side could miss edge cases |
| Row counting | `.select('*')` then `.length` | `.select('*', { count: 'exact', head: true })` | Avoids transferring row data; returns only the count |
| Error type discrimination | Throwing different Error subclasses | String literal union type (`'DUPLICATE_NAME' \| 'INVALID_NAME' \| 'EMPTY_NAME'`) | Simpler, type-safe, no class hierarchy needed |

## Common Pitfalls

### Pitfall 1: Forgetting to exclude current exercise from uniqueness check
**What goes wrong:** When updating exercise "Bench Press" to "bench press" (just changing case), the uniqueness check finds itself and reports a false duplicate.
**Why it happens:** The `.ilike()` query matches the exercise's own row.
**How to avoid:** Chain `.neq('id', exerciseId)` to exclude the exercise being updated from the uniqueness query.
**Warning signs:** Users cannot save an exercise without changing the name.

### Pitfall 2: Not scoping uniqueness check to user's exercises only
**What goes wrong:** Uniqueness check matches system exercise names and blocks the update.
**Why it happens:** RLS SELECT policy returns system exercises too (`is_system = true`), so a bare `.ilike()` query would match "Bench Press" from the system library.
**How to avoid:** Add `.eq('user_id', user.id)` AND `.eq('is_system', false)` to the uniqueness query.
**Warning signs:** Users cannot name their exercises the same as any system exercise.

### Pitfall 3: Supabase update returning 0 rows silently
**What goes wrong:** `.update().eq('id', id)` succeeds with no error but returns empty data if the RLS policy blocks the update (e.g., trying to update a system exercise or another user's exercise).
**Why it happens:** Supabase/PostgREST returns success with empty result set when RLS filters out the row, rather than an error.
**How to avoid:** After `.update().select().single()`, the `.single()` will error if no row is returned. Check for this and return a clear "exercise not found or not editable" error.
**Warning signs:** Update appears to succeed but nothing changes in the database.

### Pitfall 4: Not trimming whitespace before uniqueness check
**What goes wrong:** "Bench Press " and "Bench Press" would be treated as different names, but the trim happens after the check.
**Why it happens:** Input is compared before sanitization.
**How to avoid:** Trim the name FIRST, then do the uniqueness check with the trimmed value.
**Warning signs:** Duplicate exercises that differ only by trailing spaces.

### Pitfall 5: Partial update object overwriting fields with undefined
**What goes wrong:** Sending `{ name: undefined, category: 'Chest' }` to Supabase could clear the name.
**Why it happens:** Supabase JS client may include `undefined` keys in the PATCH payload.
**How to avoid:** Build the update object conditionally -- only include keys that were actually provided.
**Warning signs:** Fields disappear after partial updates.

## Code Examples

### updateExercise -- Core update with validation
```typescript
// Source: Codebase patterns from createExercise + Supabase .ilike() docs

interface UpdateExerciseParams {
  id: string;
  name?: string;
  category?: ExerciseCategory;
}

// Error types per CONTEXT.md decisions
type UpdateExerciseError = 'DUPLICATE_NAME' | 'INVALID_NAME' | 'EMPTY_NAME';

interface UpdateExerciseResult {
  data: Exercise | null;
  error: Error | null;
  validationError?: UpdateExerciseError;
}

async function updateExercise(
  params: UpdateExerciseParams
): Promise<UpdateExerciseResult> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: userError || new Error('No authenticated user') };
    }

    const { id, name, category } = params;

    // Build update object conditionally (only provided fields)
    const updateData: Record<string, string> = {};

    if (name !== undefined) {
      const trimmedName = name.trim();

      // Reject empty/whitespace-only
      if (!trimmedName) {
        return { data: null, error: null, validationError: 'EMPTY_NAME' };
      }

      // Validate: letters, numbers, spaces only
      if (!/^[a-zA-Z0-9 ]+$/.test(trimmedName)) {
        return { data: null, error: null, validationError: 'INVALID_NAME' };
      }

      // Case-insensitive uniqueness check, scoped to user's exercises, excluding self
      const { data: existing } = await supabase
        .from('exercises')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_system', false)
        .ilike('name', trimmedName)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return { data: null, error: null, validationError: 'DUPLICATE_NAME' };
      }

      updateData.name = trimmedName;
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    // Nothing to update
    if (Object.keys(updateData).length === 0) {
      return { data: null, error: new Error('No fields to update') };
    }

    const { data, error } = await supabase
      .from('exercises')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Exercise, error: null };
  } catch (err) {
    console.error('Unexpected error in updateExercise:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
```

### getUserExercises -- Filtered to user-created only
```typescript
// Source: Codebase pattern from getExercises + CONTEXT.md decisions

async function getUserExercises(): Promise<ServiceResult<Exercise[]>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: userError || new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_system', false)
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    return { data: data as Exercise[], error: null };
  } catch (err) {
    console.error('Unexpected error in getUserExercises:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
```

### getExerciseDependencies -- Counting references across tables
```typescript
// Source: Supabase count docs + codebase patterns

interface ExerciseDependencies {
  templateCount: number;
  workoutLogCount: number;
  chartCount: number;
}

async function getExerciseDependencies(
  exerciseId: string
): Promise<ServiceResult<ExerciseDependencies>> {
  try {
    // Run all three counts in parallel for efficiency
    const [templateResult, workoutLogResult, chartResult] = await Promise.all([
      supabase
        .from('template_exercises')
        .select('*', { count: 'exact', head: true })
        .eq('exercise_id', exerciseId),
      supabase
        .from('workout_log_exercises')
        .select('*', { count: 'exact', head: true })
        .eq('exercise_id', exerciseId),
      supabase
        .from('user_charts')
        .select('*', { count: 'exact', head: true })
        .eq('exercise_id', exerciseId),
    ]);

    // Check for errors
    const firstError = templateResult.error || workoutLogResult.error || chartResult.error;
    if (firstError) {
      return { data: null, error: firstError };
    }

    return {
      data: {
        templateCount: templateResult.count ?? 0,
        workoutLogCount: workoutLogResult.count ?? 0,
        chartCount: chartResult.count ?? 0,
      },
      error: null,
    };
  } catch (err) {
    console.error('Unexpected error in getExerciseDependencies:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Generic `new Error(message)` for all validation | Typed validation error discriminants | This phase | Callers can switch on error type for specific UI feedback |
| `exerciseExists(name)` for uniqueness | `.ilike()` + `.neq()` scoped query | This phase | Case-insensitive, self-excluding, user-scoped check |
| No partial update support | Conditional update object building | This phase | Can update name alone, category alone, or both |

## Open Questions

1. **ExercisesService interface update approach**
   - What we know: The interface in `types/services.ts` needs three new method signatures. The `UpdateExerciseResult` type extends the existing pattern with a `validationError` field.
   - What's unclear: Whether to add `validationError` as an optional field on the existing `ServiceResult<T>` or create a separate result type for `updateExercise` only.
   - Recommendation: Create a dedicated `UpdateExerciseResult` type that extends the pattern. This keeps the generic `ServiceResult<T>` clean while giving `updateExercise` its typed error field. The planner should decide on exact type name.

2. **Uniqueness check and `.ilike()` exact matching**
   - What we know: `.ilike('name', value)` does pattern matching. For exact case-insensitive comparison, the value must not contain wildcards.
   - What's unclear: Whether Supabase's `.ilike()` with no wildcards does an exact match (SQL: `name ILIKE 'Bench Press'` matches exactly "bench press", "BENCH PRESS", etc. but NOT "My Bench Press").
   - Recommendation: Use `.ilike('name', trimmedName)` without `%` wildcards. In PostgreSQL, `ILIKE` without wildcards is an exact case-insensitive match. HIGH confidence this is correct behavior.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/shared/src/services/exercises.ts` -- createExercise, deleteExercise patterns
- Existing codebase: `packages/shared/src/types/services.ts` -- ServiceResult, ServiceError, ExercisesService interface
- Existing codebase: `packages/shared/src/types/database.ts` -- Exercise, ExerciseCategory types
- Existing codebase: `sql/current_schema.sql` -- table structures for exercises, template_exercises, workout_log_exercises, user_charts
- Existing codebase: `sql/migration_system_exercises.sql` -- RLS policies (all four already exist)

### Secondary (MEDIUM confidence)
- Supabase official docs: `.ilike()` method for case-insensitive pattern matching (https://supabase.com/docs/reference/javascript/ilike)
- Supabase official docs: `.neq()` filter for excluding rows (https://supabase.com/docs/reference/javascript/using-filters)
- Supabase official docs: `{ count: 'exact', head: true }` for efficient counting (https://supabase.com/docs/reference/javascript/select)

### Tertiary (LOW confidence)
- None -- all findings verified against codebase and official docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries; all existing patterns verified in codebase
- Architecture: HIGH -- three functions added to existing file following established patterns
- Pitfalls: HIGH -- all pitfalls derived from direct codebase analysis and Supabase documented behavior
- Code examples: MEDIUM -- patterns are correct but exact type structure is planner's discretion per CONTEXT.md

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (stable domain, no external dependencies changing)
