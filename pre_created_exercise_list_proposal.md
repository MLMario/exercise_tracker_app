# Pre-Created Exercise List Proposal

## Overview

This proposal outlines the data model changes and implementation approach for adding a pre-created exercise library to the exercise tracker application, using data from the [free-exercise-db](https://github.com/yuhonas/free-exercise-db) repository (~800+ exercises).

---

## Current State

### Data Model
The `exercises` table currently stores user-created exercises:

```sql
CREATE TABLE public.exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,  -- Currently required
  name text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'])),
  equipment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

### User Flows
- **Template Editor** (`TemplateEditorSurface.tsx`): Users add exercises via `ExercisePickerModal`
- **Workout Recording** (`WorkoutSurface.tsx`): Users add exercises during active workout
- **Exercise Creation**: Users create custom exercises inline within the picker modal

---

## Proposed Changes

### 1. Schema Changes

#### 1.1 Modify `exercises` Table

```sql
-- Allow NULL user_id for system (pre-created) exercises
ALTER TABLE public.exercises ALTER COLUMN user_id DROP NOT NULL;

-- Add new columns for GitHub DB fields
ALTER TABLE public.exercises
  ADD COLUMN instructions text[],
  ADD COLUMN level text CHECK (level = ANY (ARRAY['beginner', 'intermediate', 'expert'])),
  ADD COLUMN force text CHECK (force = ANY (ARRAY['push', 'pull', 'static'])),
  ADD COLUMN mechanic text CHECK (mechanic = ANY (ARRAY['compound', 'isolation'])),
  ADD COLUMN is_system boolean NOT NULL DEFAULT false;

-- Add index for system exercises (partial index for efficient lookup)
CREATE INDEX idx_exercises_system ON public.exercises (id) WHERE is_system = true;

-- Add index on user_id (including NULL) for filtering
CREATE INDEX idx_exercises_user_id ON public.exercises (user_id);
```

#### 1.2 Primary Muscles to Category Mapping

The GitHub DB has 15 `primaryMuscles` values. Map them to the existing 6 categories:

| GitHub DB primaryMuscles | App Category |
|-------------------------|--------------|
| Chest | Chest |
| Lats, Lower back, Middle back, Traps | Back |
| Shoulders | Shoulders |
| Quadriceps, Hamstrings, Calves, Glutes, Adductors | Legs |
| Biceps, Triceps, Forearms | Arms |
| Abdominals | Core |

This mapping preserves backward compatibility with existing exercises and UI.

### 2. Row-Level Security (RLS) Policy Updates

Current RLS likely filters by `user_id = auth.uid()`. Update to include system exercises:

```sql
-- Drop existing policy (if any)
DROP POLICY IF EXISTS exercises_user_policy ON public.exercises;

-- New policy: Users see their own exercises + all system exercises
CREATE POLICY exercises_select_policy ON public.exercises
  FOR SELECT
  USING (
    user_id = (SELECT auth.uid())
    OR is_system = true
  );

-- Users can only insert their own exercises (not system)
CREATE POLICY exercises_insert_policy ON public.exercises
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND is_system = false
  );

-- Users can only update/delete their own exercises (not system)
CREATE POLICY exercises_update_policy ON public.exercises
  FOR UPDATE
  USING (
    user_id = (SELECT auth.uid())
    AND is_system = false
  );

CREATE POLICY exercises_delete_policy ON public.exercises
  FOR DELETE
  USING (
    user_id = (SELECT auth.uid())
    AND is_system = false
  );
```

**Performance Note**: Using `(SELECT auth.uid())` wraps the function call so it's evaluated once per query, not per row (10-100x faster on large tables per Supabase best practices).

### 3. Data Migration

#### 3.1 Seed Script for Pre-Created Exercises

Create a migration/seed script to import exercises from the GitHub DB:

```sql
-- Example batch insert (actual script would process full JSON)
INSERT INTO public.exercises (
  name,
  category,
  equipment,
  instructions,
  level,
  force,
  mechanic,
  is_system,
  user_id
) VALUES
  ('Barbell Bench Press', 'Chest', 'barbell',
   ARRAY['Lie on bench...', 'Lower bar to chest...', 'Push up...'],
   'intermediate', 'push', 'compound', true, NULL),
  ('Barbell Deadlift', 'Back', 'barbell',
   ARRAY['Stand in front of barbell...', 'Grip bar...', 'Lift...'],
   'intermediate', 'pull', 'compound', true, NULL)
  -- ... ~800 more exercises
;
```

**Performance Note**: Use batch inserts (up to 1000 rows per statement) rather than individual INSERTs for 10-50x faster bulk loading.

#### 3.2 Mapping Script

A Node.js/TypeScript script to transform the GitHub JSON:

```typescript
const MUSCLE_TO_CATEGORY: Record<string, string> = {
  'chest': 'Chest',
  'lats': 'Back',
  'lower back': 'Back',
  'middle back': 'Back',
  'traps': 'Back',
  'shoulders': 'Shoulders',
  'quadriceps': 'Legs',
  'hamstrings': 'Legs',
  'calves': 'Legs',
  'glutes': 'Legs',
  'adductors': 'Legs',
  'biceps': 'Arms',
  'triceps': 'Arms',
  'forearms': 'Arms',
  'abdominals': 'Core',
};

function mapExercise(ghExercise: GithubExercise): DbExercise {
  const primaryMuscle = ghExercise.primaryMuscles[0]?.toLowerCase();
  return {
    name: ghExercise.name,
    category: MUSCLE_TO_CATEGORY[primaryMuscle] || 'Core',
    equipment: ghExercise.equipment,
    instructions: ghExercise.instructions,
    level: ghExercise.level,
    force: ghExercise.force,
    mechanic: ghExercise.mechanic,
    is_system: true,
    user_id: null,
  };
}
```

### 4. Service Layer Changes

#### 4.1 Update `exercises.ts` Service

```typescript
// packages/shared/src/services/exercises.ts

// Updated getExercises to return both system and user exercises
export async function getExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  // RLS automatically filters to user's + system exercises
  if (error) throw error;
  return data;
}

// Updated createExercise - only for user exercises
export async function createExercise(
  name: string,
  category: ExerciseCategory
): Promise<Result<Exercise>> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: 'Not authenticated' };

  // Check for duplicates only within user's own exercises
  const { data: existing } = await supabase
    .from('exercises')
    .select('id')
    .eq('user_id', user.user.id)
    .ilike('name', name)
    .single();

  if (existing) {
    return { error: 'You already have an exercise with this name' };
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name,
      category,
      user_id: user.user.id,
      is_system: false,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}
```

### 5. UI Changes

#### 5.1 ExercisePickerModal Updates

Update `apps/web/src/components/ExercisePickerModal.tsx`:

```typescript
// Add badge to distinguish user-created exercises
function ExerciseListItem({ exercise }: { exercise: Exercise }) {
  return (
    <div className="exercise-item">
      <span>{exercise.name}</span>
      {!exercise.is_system && (
        <Badge variant="outline" size="sm">Custom</Badge>
      )}
      <span className="text-muted">{exercise.category}</span>
    </div>
  );
}

// Sort: user exercises first, then system, both alphabetically
const sortedExercises = useMemo(() => {
  return [...exercises].sort((a, b) => {
    if (a.is_system !== b.is_system) {
      return a.is_system ? 1 : -1; // User exercises first
    }
    return a.name.localeCompare(b.name);
  });
}, [exercises]);
```

#### 5.2 Type Updates

Update `packages/shared/src/types/database.ts`:

```typescript
export interface Exercise {
  id: string;
  user_id: string | null;  // NULL for system exercises
  name: string;
  category: ExerciseCategory;
  equipment: string | null;
  instructions: string[] | null;
  level: 'beginner' | 'intermediate' | 'expert' | null;
  force: 'push' | 'pull' | 'static' | null;
  mechanic: 'compound' | 'isolation' | null;
  is_system: boolean;
  created_at: string;
}
```

---

## Summary of Changes

| Layer | Change | Files Affected |
|-------|--------|----------------|
| **Database** | Allow NULL user_id, add columns, update CHECK constraint | Migration file |
| **RLS** | Update policies for system + user exercises | Migration file |
| **Seed Data** | Import ~800 exercises from GitHub DB | Seed script |
| **Types** | Add new fields to Exercise interface | `database.ts` |
| **Services** | Update getExercises, createExercise | `exercises.ts` |
| **UI** | Add "Custom" badge, sort order | `ExercisePickerModal.tsx` |

---

## Implementation Phases

### Phase 1: Database Schema Migration
1. Create migration to alter `exercises` table
2. Update RLS policies
3. Test that existing user exercises still work

### Phase 2: Data Import
1. Download and parse GitHub DB JSON
2. Create mapping script (primaryMuscles → category)
3. Generate and run seed SQL
4. Verify data integrity

### Phase 3: Backend Updates
1. Update Exercise types
2. Update exercises service functions
3. Test API with both system and user exercises

### Phase 4: Frontend Updates
1. Update ExercisePickerModal with badges
2. Update sorting logic
3. Test full user flow

---

## Considerations

### Performance
- **Index on `user_id`**: Already exists via FK, but explicit index helps NULL lookups
- **Partial index for system exercises**: Fast filtering when showing library only
- **RLS optimization**: Using `(SELECT auth.uid())` pattern for single evaluation

### Storage
- ~800 exercises with instructions = ~2-5 MB of text data
- Minimal impact on database size

### Future Enhancements (Out of Scope)
- Equipment filtering in exercise picker
- Exercise images/GIFs
- Secondary muscle group display
- Exercise difficulty filtering
- User hiding/favoriting of system exercises

---

## Appendix: GitHub DB Field Reference

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| name | string | "Barbell Bench Press" | |
| primaryMuscles | string[] | ["chest"] | Always single value |
| secondaryMuscles | string[] | ["shoulders", "triceps"] | Not used in this proposal |
| equipment | string | "barbell" | Mapped to existing equipment column |
| level | string | "intermediate" | beginner/intermediate/expert |
| force | string | "push" | push/pull/static |
| mechanic | string | "compound" | compound/isolation |
| instructions | string[] | ["Step 1...", "Step 2..."] | Array of instruction steps |
| category | string | "strength" | **Ignored** per requirements |
| images | string[] | ["bench-press.png"] | **Not imported** per requirements |
