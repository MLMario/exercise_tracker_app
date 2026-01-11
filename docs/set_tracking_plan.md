# Exercise Logging UI Redesign - Implementation Plan

## Overview

This document outlines the plan to redesign the exercise logging UI to support **per-set tracking** instead of the current per-exercise aggregate tracking.

---

## Current vs. Proposed Model

### Current Model (Per-Exercise)
```
workout_log_exercises
├── exercise_id
├── sets_completed: 3     (single number)
├── reps: 10              (same for all sets)
├── weight: 185           (same for all sets)
├── rest_seconds: 90      (same for all sets)
└── is_done: true         (one checkbox for entire exercise)
```

**Limitations:**
- Cannot track different weights per set
- Cannot track different reps per set (e.g., failure on last set)
- Cannot mark individual sets as done
- Cannot have different rest times per set

### Proposed Model (Per-Set)
```
workout_log_exercises (parent - one per exercise)
├── exercise_id
├── order
└── workout_log_sets (children - one per set)
    ├── set_number: 1
    ├── weight: 175
    ├── reps: 9
    ├── rest_seconds: 120
    └── is_done: true
```

**Benefits:**
- Track individual set performance
- Different weights/reps per set
- Individual set completion checkboxes
- Per-set rest timers

---

## Database Schema Changes

### New Table: `workout_log_sets`

This table stores individual set data for each exercise in a workout.

```sql
-- New table for per-set tracking
CREATE TABLE workout_log_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_log_exercise_id UUID NOT NULL REFERENCES workout_log_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight DECIMAL(10, 2) DEFAULT 0,
  reps INTEGER DEFAULT 0,
  rest_seconds INTEGER DEFAULT 60,
  is_done BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (workout_log_exercise_id, set_number)
);

-- Enable RLS
ALTER TABLE workout_log_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access sets from their own workout logs
CREATE POLICY "Users can manage their own workout sets"
ON workout_log_sets
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM workout_log_exercises wle
    JOIN workout_logs wl ON wl.id = wle.workout_log_id
    WHERE wle.id = workout_log_sets.workout_log_exercise_id
    AND wl.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workout_log_exercises wle
    JOIN workout_logs wl ON wl.id = wle.workout_log_id
    WHERE wle.id = workout_log_sets.workout_log_exercise_id
    AND wl.user_id = auth.uid()
  )
);

-- Index for faster queries
CREATE INDEX idx_workout_log_sets_exercise ON workout_log_sets(workout_log_exercise_id);
```

### Modify `workout_log_exercises`

The parent table now becomes a lightweight link between workout_log and exercise:

```sql
-- Make the old aggregate columns nullable (for backwards compatibility)
-- OR remove them if doing a clean migration
ALTER TABLE workout_log_exercises
  ALTER COLUMN sets_completed DROP NOT NULL,
  ALTER COLUMN reps DROP NOT NULL,
  ALTER COLUMN weight DROP NOT NULL,
  ALTER COLUMN rest_seconds DROP NOT NULL;

-- These columns will be deprecated but kept for backwards compatibility
-- New workouts will store data in workout_log_sets instead
```

---

## UI Design Changes

### Current UI Structure
```
Exercise Card
├── Exercise Name
├── Category Badge
├── Sets Input (single number)
├── Reps Input (single number)
├── Weight Input (single number)
├── Rest Input (single number)
├── Done Checkbox (one for exercise)
└── Rest Timer Button
```

### Proposed UI Structure
```
Exercise Card
├── Exercise Header
│   ├── Exercise Name
│   ├── Category Badge
│   └── Delete Exercise Button (X)
├── Column Headers: Set | lbs | Reps | ✓
├── Set Rows (dynamic list)
│   └── Each Set Row:
│       ├── Set number (1, 2, 3...)
│       ├── Weight input
│       ├── Reps input
│       ├── Done checkbox (green when checked)
│       └── Rest timer (shows below row when done)
├── "+ Add Set" Button (adds new set)
└── Rest Timer (countdown between sets)
```

### Key UI Features

1. **Per-Set Rows**
   - Each set is its own row with individual inputs
   - Checkmark turns green when set is completed
   - Rest timer appears below each set after marking done

2. **Set Numbers**
   - Sequential numbering: 1, 2, 3...
   - Numbers displayed in rounded badge

3. **Rest Timer**
   - Shows countdown (e.g., "2:00", "1:30")
   - Appears between sets after marking done
   - Per-set rest time (can vary)

4. **Add/Remove Sets**
   - "+ Add Set" button at bottom of each exercise
   - Delete button to remove individual sets

---

## Data Flow Changes

### Start Workout
```javascript
// When loading template, expand default sets
activeWorkout.exercises = templateExercises.map(te => ({
  exercise_id: te.exercise_id,
  name: te.exercise.name,
  category: te.exercise.category,
  sets: generateSetsArray(te)  // Array of set objects
}));

function generateSetsArray(templateExercise) {
  const sets = [];
  for (let i = 0; i < templateExercise.default_sets; i++) {
    sets.push({
      set_number: i + 1,
      weight: templateExercise.default_weight,
      reps: templateExercise.default_reps,
      rest_seconds: templateExercise.default_rest_seconds,
      is_done: false
    });
  }
  return sets;
}
```

### Finish Workout
```javascript
// Save workout with per-set data
async function createWorkoutLog(workoutData) {
  // 1. Create workout_log record
  const workoutLog = await supabase
    .from('workout_logs')
    .insert({ ... })
    .select()
    .single();

  // 2. Create workout_log_exercises records
  for (const exercise of workoutData.exercises) {
    const logExercise = await supabase
      .from('workout_log_exercises')
      .insert({
        workout_log_id: workoutLog.id,
        exercise_id: exercise.exercise_id,
        order: exercise.order
        // No aggregate fields - all data is in sets
      })
      .select()
      .single();

    // 3. Create workout_log_sets records
    const setsToInsert = exercise.sets.map(set => ({
      workout_log_exercise_id: logExercise.id,
      set_number: set.set_number,
      weight: set.weight,
      reps: set.reps,
      rest_seconds: set.rest_seconds,
      is_done: set.is_done
    }));

    await supabase
      .from('workout_log_sets')
      .insert(setsToInsert);
  }
}
```

---

## Metrics Calculation Changes

### Total Sets
```sql
-- Before: SUM of sets_completed column
-- After: COUNT of workout_log_sets rows where is_done = true

SELECT COUNT(wls.id) as total_sets
FROM workout_log_sets wls
JOIN workout_log_exercises wle ON wle.id = wls.workout_log_exercise_id
WHERE wle.exercise_id = $exercise_id
  AND wls.is_done = true;
```

### Max Volume
```sql
-- Before: MAX of (weight * reps) per exercise record
-- After: MAX of (weight * reps) per individual set

SELECT MAX(wls.weight * wls.reps) as max_volume
FROM workout_log_sets wls
JOIN workout_log_exercises wle ON wle.id = wls.workout_log_exercise_id
WHERE wle.exercise_id = $exercise_id
  AND wls.is_done = true;
```

---

## Migration Strategy

### Phase 1: Database Changes
1. Create `workout_log_sets` table
2. Add RLS policies
3. Add indexes

### Phase 2: Backwards Compatibility
- Keep existing `workout_log_exercises` columns
- New workouts write to new tables
- Old workouts still readable via old columns
- Metrics queries check both schemas

### Phase 3: UI Updates
1. Update Alpine.js data model
2. Redesign exercise card component
3. Add per-set row rendering
4. Add add/remove set buttons
5. Update rest timer to be per-set

---

## Files to Modify

| File | Changes |
|------|---------|
| `sql/schema.sql` | Add new table |
| `js/logging.js` | Update save/load functions for per-set data |
| `js/app.js` | Update activeWorkout data model |
| `index.html` | Redesign exercise card template |
| `css/styles.css` | Add styles for set rows |
| `js/charts.js` | Update metrics calculations |

---

## Next Steps

1. Review this plan and provide feedback
2. Review the mock UI design (see `mock_set_ui.html`)
3. Approve database schema changes
4. Execute SQL migration in Supabase
5. Implement frontend changes

