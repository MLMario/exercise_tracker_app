# Template Exercise Creation UI Redesign - Implementation Plan

## Overview

This document outlines the plan to redesign the **Template Editor** exercise creation UI to match the per-set UI used during workout logging. When a user adds an exercise to a template, they should configure individual sets (with weight/reps) rather than using the current aggregate form fields.

---

## Problem Statement

### Current Template Editor UI
```
Exercise Card (Template Editor)
├── Exercise Name + Category Badge
├── Single "Sets" input (number: 3)
├── Single "Reps" input (number: 10)
├── Single "Weight" input (number: 135)
├── Single "Rest" input (number: 90)
└── Move Up / Move Down / Remove buttons
```

**Issues:**
- Inconsistent with the workout logging UI which uses per-set rows
- Cannot configure different weights per set in templates (e.g., warm-up sets)
- User has to mentally translate "3 sets" into individual rows when viewing workout
- Different interaction patterns between template creation and workout execution

### Proposed Template Editor UI
```
Exercise Card (Template Editor)
├── Exercise Header
│   ├── Exercise Name
│   ├── Category Badge
│   └── Move Up / Move Down / Remove buttons
├── Column Headers: Set | lbs | Reps
├── Set Rows (default 3 when adding exercise)
│   └── Each Set Row:
│       ├── Set number badge (1, 2, 3...)
│       ├── Weight input
│       ├── Reps input
│       └── Delete set button (swipe or X)
├── "+ Add Set" Button
└── Rest Time input (shared for all sets)
```

**Benefits:**
- Consistent UI pattern between template editor and workout logging
- User can configure different weights per set in template
- What you see in template is what you get in workout
- Familiar interaction: same add/delete set gestures

---

## Database Impact

### No Schema Changes Required

The current `template_exercises` table stores:
```sql
template_exercises
├── default_sets (INTEGER)
├── default_reps (INTEGER)
├── default_weight (DECIMAL)
└── default_rest_seconds (INTEGER)
```

**Two options for storing per-set template data:**

#### Option A: New `template_exercise_sets` Table (Recommended)
```sql
CREATE TABLE template_exercise_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_exercise_id UUID NOT NULL REFERENCES template_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight DECIMAL(10, 2) DEFAULT 0,
  reps INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (template_exercise_id, set_number)
);
```

**Pros:**
- Clean normalized structure
- Matches `workout_log_sets` pattern
- Easier to query and maintain

**Cons:**
- Requires database migration
- Additional table to manage

#### Option B: JSON Column in `template_exercises`
```sql
ALTER TABLE template_exercises
ADD COLUMN sets_config JSONB DEFAULT '[]';

-- Example data:
-- [{"set_number": 1, "weight": 135, "reps": 10}, {"set_number": 2, "weight": 155, "reps": 8}]
```

**Pros:**
- No new table needed
- Single column addition
- Flexible structure

**Cons:**
- Less normalized
- Harder to query individual sets
- JSON manipulation in JavaScript

### Recommended Approach: Option A

Create `template_exercise_sets` table for consistency with the existing `workout_log_sets` pattern.

---

## Implementation Plan

### Phase 1: Database Schema Update

**Task 1.1: Create `template_exercise_sets` table**
```sql
-- New table for per-set template configuration
CREATE TABLE template_exercise_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_exercise_id UUID NOT NULL REFERENCES template_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight DECIMAL(10, 2) DEFAULT 0,
  reps INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (template_exercise_id, set_number)
);

-- Enable RLS
ALTER TABLE template_exercise_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage their own template sets"
ON template_exercise_sets
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM template_exercises te
    JOIN templates t ON t.id = te.template_id
    WHERE te.id = template_exercise_sets.template_exercise_id
    AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM template_exercises te
    JOIN templates t ON t.id = te.template_id
    WHERE te.id = template_exercise_sets.template_exercise_id
    AND t.user_id = auth.uid()
  )
);

-- Index for faster queries
CREATE INDEX idx_template_exercise_sets_exercise ON template_exercise_sets(template_exercise_id);
```

**Task 1.2: Keep existing columns for backwards compatibility**
- Keep `default_sets`, `default_reps`, `default_weight`, `default_rest_seconds` in `template_exercises`
- New templates will use `template_exercise_sets` for per-set data
- `default_rest_seconds` remains in parent table (shared for all sets)

---

### Phase 2: JavaScript Data Model Updates

**Task 2.1: Update `js/templates.js`**

Add functions:
- `loadTemplateWithSets(templateId)` - Fetch template with nested sets
- `saveTemplateWithSets(template)` - Save template and per-set data
- `addSetToTemplateExercise(exerciseIndex)` - Add a set row
- `removeSetFromTemplateExercise(exerciseIndex, setIndex)` - Remove a set row

**Task 2.2: Update `js/app.js` data model**

Update `editingTemplate` structure:
```javascript
editingTemplate: {
  id: null,
  name: '',
  exercises: [
    {
      exercise_id: 'uuid',
      name: 'Bench Press',
      category: 'Chest',
      default_rest_seconds: 90,
      sets: [
        { set_number: 1, weight: 135, reps: 10 },
        { set_number: 2, weight: 155, reps: 8 },
        { set_number: 3, weight: 175, reps: 6 }
      ]
    }
  ]
}
```

**Task 2.3: Update exercise selection behavior**

When user selects an exercise to add to template:
- Create 3 default sets automatically
- Each set gets default values: weight=0, reps=10
- User can then customize each set

```javascript
function addExerciseToTemplate(exercise) {
  const defaultSets = [
    { set_number: 1, weight: 0, reps: 10 },
    { set_number: 2, weight: 0, reps: 10 },
    { set_number: 3, weight: 0, reps: 10 }
  ];

  editingTemplate.exercises.push({
    exercise_id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    default_rest_seconds: 60,
    sets: defaultSets
  });
}
```

---

### Phase 3: UI Template Changes

**Task 3.1: Redesign Template Editor exercise card in `index.html`**

Replace current form-based layout (lines 207-287) with set-row layout:

```html
<template x-for="(ex, exIndex) in editingTemplate.exercises" :key="exIndex">
  <div class="card exercise-editor-card">
    <!-- Exercise Header -->
    <div class="exercise-header">
      <div class="exercise-title-row">
        <span class="exercise-name" x-text="ex.name"></span>
        <span class="badge" x-text="ex.category"></span>
      </div>
      <div class="exercise-header-actions">
        <button type="button" @click="moveExerciseUp(exIndex)"
                class="btn btn-icon" :disabled="exIndex === 0" title="Move up">
          <span>↑</span>
        </button>
        <button type="button" @click="moveExerciseDown(exIndex)"
                class="btn btn-icon" :disabled="exIndex === editingTemplate.exercises.length - 1" title="Move down">
          <span>↓</span>
        </button>
        <button type="button" @click="removeExerciseFromTemplate(exIndex)"
                class="btn btn-icon btn-danger" title="Remove">
          <span>✕</span>
        </button>
      </div>
    </div>

    <!-- Set Table -->
    <div class="set-table">
      <div class="set-header">
        <span>Set</span>
        <span>lbs</span>
        <span>Reps</span>
        <span></span>
      </div>

      <template x-for="(set, setIndex) in ex.sets" :key="setIndex">
        <div class="set-row-wrapper">
          <div class="set-row">
            <div class="set-number" x-text="set.set_number"></div>
            <input type="number" class="set-input" x-model.number="set.weight"
                   min="0" step="0.5" placeholder="0">
            <input type="number" class="set-input" x-model.number="set.reps"
                   min="0" placeholder="10">
            <button type="button" class="btn btn-icon btn-danger btn-small"
                    @click="removeSetFromTemplateExercise(exIndex, setIndex)"
                    x-show="ex.sets.length > 1" title="Remove Set">
              <span>✕</span>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Add Set Button -->
    <button type="button" class="btn btn-add-set"
            @click="addSetToTemplateExercise(exIndex)">
      + Add Set
    </button>

    <!-- Rest Time (shared) -->
    <div class="rest-time-row">
      <label>Rest between sets:</label>
      <input type="number" class="input input-small"
             x-model.number="ex.default_rest_seconds" min="0" placeholder="60">
      <span class="input-suffix">seconds</span>
    </div>
  </div>
</template>
```

**Task 3.2: Add/modify CSS in `css/styles.css`**

Reuse existing `.set-table`, `.set-row`, `.set-header` styles from workout UI.

Add new styles:
```css
/* Template editor specific */
.exercise-header-actions {
  display: flex;
  gap: 0.25rem;
}

.rest-time-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.5rem;
}

.rest-time-row label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.rest-time-row .input-suffix {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

---

### Phase 4: Data Flow Integration

**Task 4.1: Update `loadTemplates()` to include sets**

```javascript
async function loadTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select(`
      *,
      template_exercises (
        *,
        exercises (*),
        template_exercise_sets (*)
      )
    `)
    .order('created_at', { ascending: false });

  // Transform data to include sets array per exercise
  return data.map(template => ({
    ...template,
    exercises: template.template_exercises.map(te => ({
      ...te,
      name: te.exercises.name,
      category: te.exercises.category,
      sets: te.template_exercise_sets.length > 0
        ? te.template_exercise_sets.sort((a, b) => a.set_number - b.set_number)
        : generateDefaultSets(te) // Backwards compatibility
    }))
  }));
}
```

**Task 4.2: Update `saveTemplate()` for per-set data**

```javascript
async function saveTemplate() {
  // 1. Save/update template
  // 2. Save/update template_exercises
  // 3. For each exercise, delete old sets and insert new sets

  for (const exercise of editingTemplate.exercises) {
    // Delete existing sets
    await supabase
      .from('template_exercise_sets')
      .delete()
      .eq('template_exercise_id', exercise.template_exercise_id);

    // Insert new sets
    const setsToInsert = exercise.sets.map(set => ({
      template_exercise_id: exercise.template_exercise_id,
      set_number: set.set_number,
      weight: set.weight,
      reps: set.reps
    }));

    await supabase
      .from('template_exercise_sets')
      .insert(setsToInsert);
  }
}
```

**Task 4.3: Update `startWorkoutFromTemplate()` in `js/logging.js`**

When starting a workout, use the template's per-set configuration:

```javascript
function startWorkoutFromTemplate(template) {
  activeWorkout.exercises = template.exercises.map((te, index) => ({
    exercise_id: te.exercise_id,
    name: te.name,
    category: te.category,
    order: index,
    sets: te.sets.map(set => ({
      set_number: set.set_number,
      weight: set.weight,
      reps: set.reps,
      rest_seconds: te.default_rest_seconds,
      is_done: false
    }))
  }));
}
```

---

### Phase 5: Backwards Compatibility

**Task 5.1: Handle existing templates without `template_exercise_sets` data**

```javascript
function generateDefaultSets(templateExercise) {
  // For old templates that only have aggregate values
  const sets = [];
  const numSets = templateExercise.default_sets || 3;

  for (let i = 0; i < numSets; i++) {
    sets.push({
      set_number: i + 1,
      weight: templateExercise.default_weight || 0,
      reps: templateExercise.default_reps || 10
    });
  }
  return sets;
}
```

**Task 5.2: Migration helper (optional)**

When user edits an old template, automatically expand aggregate data into per-set rows and save with new format.

---

## Files to Modify

| File | Changes |
|------|---------|
| `sql/schema.sql` | Add `template_exercise_sets` table with RLS |
| `js/templates.js` | Add per-set CRUD functions |
| `js/app.js` | Update `editingTemplate` data model, add set manipulation functions |
| `js/logging.js` | Update `startWorkoutFromTemplate()` to use per-set data |
| `index.html` | Replace template editor exercise card with set-row UI |
| `css/styles.css` | Add styles for template editor set rows |

---

## UI Mockup

### Before (Current Form-Based UI)
```
┌─────────────────────────────────────────┐
│ Bench Press                    [Chest]  │
├─────────────────────────────────────────┤
│ Sets: [3]   Reps: [10]                  │
│ Weight: [135]   Rest: [90]              │
│                          [↑] [↓] [✕]    │
└─────────────────────────────────────────┘
```

### After (Per-Set Row UI)
```
┌─────────────────────────────────────────┐
│ Bench Press              [Chest] [↑][↓][✕]│
├─────────────────────────────────────────┤
│ Set │  lbs  │ Reps │                    │
├─────────────────────────────────────────┤
│  1  │ [135] │ [10] │ [✕]                │
│  2  │ [155] │  [8] │ [✕]                │
│  3  │ [175] │  [6] │ [✕]                │
├─────────────────────────────────────────┤
│         [+ Add Set]                     │
├─────────────────────────────────────────┤
│ Rest between sets: [60] seconds         │
└─────────────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Create new template with per-set configuration
- [ ] Edit existing template - verify backwards compatibility
- [ ] Add/remove sets in template editor
- [ ] Delete sets via swipe (if implementing swipe-to-delete)
- [ ] Start workout from template - verify sets populate correctly
- [ ] Verify rest time shared across sets
- [ ] Mobile responsive layout
- [ ] Save template and reload - verify data persistence

---

## Next Steps

1. Review and approve this plan
2. Execute SQL migration in Supabase (Phase 1)
3. Implement JavaScript changes (Phase 2)
4. Update HTML/CSS (Phase 3)
5. Integration testing (Phase 4-5)
6. Deploy and verify

---

## Notes

- Rest time remains per-exercise (not per-set) to keep UI simple
- Default 3 sets when adding new exercise matches common workout patterns
- Swipe-to-delete for sets can be added later if desired (matches workout UI)
- Consider adding "copy weight from previous set" feature in future iteration
