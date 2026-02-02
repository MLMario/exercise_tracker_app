# Phase 8: Database Schema Migration - Research

**Researched:** 2026-02-01
**Domain:** Supabase/PostgreSQL schema migration, RLS policies
**Confidence:** HIGH

## Summary

This phase involves modifying the `exercises` table to support system (pre-created) exercises alongside user-created exercises, and updating RLS policies to allow shared read access to system exercises while restricting writes to user-owned data.

The project uses **manual SQL migration files** stored in `./sql/` with descriptive naming (e.g., `migration_per_set_tracking.sql`). There is no Supabase CLI migration system in use. Migrations are run directly in the Supabase SQL Editor.

The existing `exercises` table has a simple schema with `user_id NOT NULL` constraint. The proposed changes allow `NULL` user_id for system exercises and add new metadata columns with CHECK constraints.

**Primary recommendation:** Create a single migration file `migration_system_exercises.sql` following the established project patterns, with clear phase sections for schema changes, RLS policies, and indexes.

## Standard Stack

### Core
| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| PostgreSQL | 15+ (Supabase) | Database | Supabase's underlying database |
| Supabase RLS | - | Row-level security | Native Supabase access control |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| Supabase SQL Editor | Execute migrations | Run migration SQL manually |
| pgAdmin/psql | Debug and verify | Check schema after migration |

### Project-Specific Patterns
| Pattern | Source | Usage |
|---------|--------|-------|
| Manual SQL files | `./sql/migration_*.sql` | All schema changes |
| Current schema doc | `./sql/current_schema.sql` | Reference document (not executable) |

**Installation:** N/A - Uses existing Supabase project infrastructure.

## Architecture Patterns

### Migration File Structure
Based on existing migrations (`migration_per_set_tracking.sql`, `migration_template_sets.sql`):

```
-- Migration: [Descriptive Name]
-- Description: [What this migration does]
-- Date: [YYYY-MM-DD]
--
-- IMPORTANT: Run this in your Supabase SQL Editor
-- [Additional notes about compatibility/impact]

-- ============================================
-- STEP 1: [First logical group]
-- ============================================
[SQL statements]

-- ============================================
-- STEP 2: [Second logical group]
-- ============================================
[SQL statements]

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- [Commented-out queries to verify success]

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
/*
[Commented-out rollback statements]
*/
```

### RLS Policy Pattern (From Existing Migrations)
The project uses descriptive policy names and separate policies for each operation:

```sql
-- Pattern from migration_template_sets.sql
CREATE POLICY "Users can view their own [resource]"
ON [table]
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM [join_path]
    WHERE [condition] AND [parent].user_id = auth.uid()
  )
);
```

### Index Naming Convention
From existing migrations:
- `idx_[table]_[column]` - Single column index
- `idx_[table]_[column1]_[column2]` - Composite index

Examples:
- `idx_workout_log_sets_exercise`
- `idx_workout_log_sets_exercise_done`
- `idx_template_exercise_sets_template_exercise`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth.uid() per-row evaluation | Bare `auth.uid()` in policies | `(SELECT auth.uid())` wrapper | 10-100x performance improvement on large tables |
| NULL user_id filtering | Custom application logic | PostgreSQL partial indexes | Database-level optimization |
| Policy role filtering | Checking role in USING clause | `TO authenticated` clause | Prevents unnecessary policy evaluation for anon users |

**Key insight:** Supabase RLS policies can have massive performance impact. The `(SELECT auth.uid())` wrapper pattern is critical for tables that may grow to thousands of rows.

## Common Pitfalls

### Pitfall 1: Bare auth.uid() in Policies
**What goes wrong:** RLS policy calls `auth.uid()` on every row, causing O(n) function calls instead of O(1).
**Why it happens:** Natural SQL syntax is `user_id = auth.uid()`.
**How to avoid:** Always use `(SELECT auth.uid())` wrapper pattern.
**Warning signs:** Slow queries on tables with 1000+ rows.

### Pitfall 2: Missing Index on user_id for NULL Values
**What goes wrong:** Queries filtering by `user_id IS NULL` (system exercises) don't use index efficiently.
**Why it happens:** B-tree indexes don't index NULL by default in all query patterns.
**How to avoid:** Create explicit index that includes NULL values: `CREATE INDEX idx_exercises_user_id ON exercises (user_id);`
**Warning signs:** Full table scans when filtering system exercises.

### Pitfall 3: Forgetting TO Clause in Policies
**What goes wrong:** Policies with `auth.uid()` still evaluate for anonymous users, wasting resources.
**Why it happens:** Default policy applies to all roles.
**How to avoid:** Add `TO authenticated` to policies that require authentication.
**Warning signs:** Policies running for unauthenticated requests.

### Pitfall 4: Not Dropping Old Policies Before Creating New
**What goes wrong:** Multiple conflicting policies on same table/operation.
**Why it happens:** CREATE POLICY doesn't replace existing policies.
**How to avoid:** Always `DROP POLICY IF EXISTS` before `CREATE POLICY`.
**Warning signs:** Unexpected RLS behavior, permission denied errors.

### Pitfall 5: CHECK Constraints with Wrong Syntax
**What goes wrong:** Constraint creation fails due to syntax error.
**Why it happens:** PostgreSQL CHECK syntax varies slightly from other databases.
**How to avoid:** Use `CHECK (column = ANY (ARRAY['value1', 'value2']))` pattern.
**Warning signs:** Syntax errors during migration.

### Pitfall 6: ALTER TABLE Column Order Matters
**What goes wrong:** Foreign key or constraint references fail.
**Why it happens:** Dropping NOT NULL on user_id before updating existing data.
**How to avoid:** Order operations: first add columns, then modify constraints.
**Warning signs:** Constraint violation errors during migration.

## Code Examples

Verified patterns from proposal and existing migrations:

### Schema Change: Allow NULL user_id
```sql
-- Source: pre_created_exercise_list_proposal.md
ALTER TABLE public.exercises ALTER COLUMN user_id DROP NOT NULL;
```

### Schema Change: Add Columns with CHECK Constraints
```sql
-- Source: pre_created_exercise_list_proposal.md
ALTER TABLE public.exercises
  ADD COLUMN instructions text[],
  ADD COLUMN level text CHECK (level = ANY (ARRAY['beginner', 'intermediate', 'expert'])),
  ADD COLUMN force text CHECK (force = ANY (ARRAY['push', 'pull', 'static'])),
  ADD COLUMN mechanic text CHECK (mechanic = ANY (ARRAY['compound', 'isolation'])),
  ADD COLUMN is_system boolean NOT NULL DEFAULT false;
```

### Partial Index for System Exercises
```sql
-- Source: pre_created_exercise_list_proposal.md
-- Efficient lookup of system exercises only
CREATE INDEX idx_exercises_system ON public.exercises (id) WHERE is_system = true;
```

### Index on user_id (Including NULL)
```sql
-- Source: pre_created_exercise_list_proposal.md
CREATE INDEX idx_exercises_user_id ON public.exercises (user_id);
```

### RLS Policy: SELECT with OR Condition (Optimized)
```sql
-- Source: pre_created_exercise_list_proposal.md (adapted with TO clause)
-- Uses (SELECT auth.uid()) for performance optimization
CREATE POLICY exercises_select_policy ON public.exercises
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR is_system = true
  );
```

### RLS Policy: INSERT Restriction
```sql
-- Source: pre_created_exercise_list_proposal.md
CREATE POLICY exercises_insert_policy ON public.exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND is_system = false
  );
```

### RLS Policy: UPDATE Restriction
```sql
-- Source: pre_created_exercise_list_proposal.md
CREATE POLICY exercises_update_policy ON public.exercises
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND is_system = false
  );
```

### RLS Policy: DELETE Restriction
```sql
-- Source: pre_created_exercise_list_proposal.md
CREATE POLICY exercises_delete_policy ON public.exercises
  FOR DELETE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    AND is_system = false
  );
```

### Verification Query: Check Policies Exist
```sql
-- Source: migration_per_set_tracking.sql pattern
SELECT policyname FROM pg_policies WHERE tablename = 'exercises';
```

### Verification Query: Check Indexes Exist
```sql
-- Source: migration_template_sets.sql pattern
SELECT indexname FROM pg_indexes WHERE tablename = 'exercises';
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `auth.uid()` bare | `(SELECT auth.uid())` wrapped | Supabase best practices 2024 | 10-100x RLS performance |
| All roles policy | `TO authenticated` clause | PostgreSQL 15+ recommendation | Prevents anon policy evaluation |

**Deprecated/outdated:**
- Using `auth.uid()::text` cast: The exercises FK references `auth.users(id)` which is UUID, so no cast needed for comparison.

## Project-Specific Findings

### Current Exercises Table Schema
From `./sql/current_schema.sql`:
```sql
CREATE TABLE public.exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,  -- Will become nullable
  name text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['Chest'::text, 'Back'::text, 'Shoulders'::text, 'Legs'::text, 'Arms'::text, 'Core'::text])),
  equipment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

### Existing RLS on Exercises
**Finding:** No explicit RLS policies for exercises table found in migration files. The table may have RLS enabled with policies set directly in Supabase dashboard, or RLS may not be enabled yet.

**Recommendation:** Migration should:
1. Enable RLS if not already enabled: `ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;`
2. Drop any existing policies before creating new ones
3. Create all four CRUD policies

### Category Constraint Decision
From CONTEXT.md: Keep existing 6 categories (Chest, Back, Shoulders, Legs, Arms, Core). The proposal mentions mapping from GitHub DB primaryMuscles to these categories. No need to update the CHECK constraint for categories (requirement SCHEMA-07 mentions adding 'Other', but CONTEXT.md says keep existing 6).

**Clarification needed:** SCHEMA-07 says "Category CHECK constraint updated to include 'Other'" but CONTEXT.md says "Keep existing 6 categories." The planner should resolve this discrepancy.

### Foreign Key Impact
Tables that reference `exercises.id`:
- `template_exercises.exercise_id`
- `workout_log_exercises.exercise_id`
- `user_charts.exercise_id`

These FKs remain valid since we're only changing `user_id` constraint, not the primary key.

## Open Questions

1. **Current RLS State**
   - What we know: No RLS policies in migration files
   - What's unclear: Whether RLS is enabled with dashboard-created policies
   - Recommendation: Migration should handle both cases (DROP IF EXISTS)

2. **Category Constraint ('Other')**
   - What we know: Requirements say add 'Other', CONTEXT says keep 6 categories
   - What's unclear: Which is the correct decision
   - Recommendation: Follow CONTEXT.md (keep 6 categories) as it's the most recent decision

3. **Anonymous User Access**
   - What we know: `TO authenticated` excludes anon users
   - What's unclear: Should anon users be able to read system exercises?
   - Recommendation: Default to `TO authenticated` for consistency; if anon access needed, add separate policy

## Sources

### Primary (HIGH confidence)
- `./sql/migration_per_set_tracking.sql` - Pattern for migration file structure, RLS policies
- `./sql/migration_template_sets.sql` - Pattern for index naming, verification queries
- `./sql/current_schema.sql` - Current exercises table schema
- `./pre_created_exercise_list_proposal.md` - Detailed SQL for all changes
- `./.planning/phases/08-database-schema-migration/08-CONTEXT.md` - User decisions

### Secondary (MEDIUM confidence)
- [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) - `(SELECT auth.uid())` pattern
- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - Policy syntax and patterns

### Tertiary (LOW confidence)
- `./docs/precreated_plan.md` - Earlier plan using `is_global` terminology (superseded by proposal)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified against existing migration files
- Architecture: HIGH - Patterns extracted from project's own migrations
- Pitfalls: HIGH - From Supabase official documentation and PostgreSQL best practices

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable PostgreSQL/Supabase patterns)
