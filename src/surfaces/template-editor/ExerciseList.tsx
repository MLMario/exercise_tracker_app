/**
 * ExerciseList Component
 *
 * Presentational component for displaying and managing a list of exercises in the template editor.
 * Renders section header with Add Exercise button and maps exercises to ExerciseEditor components.
 *
 * Structure matches index.html lines 439-517.
 */

import type { EditingExercise } from './TemplateEditorSurface';
import { ExerciseEditor } from './ExerciseEditor';

/**
 * Props for ExerciseList component.
 */
export interface ExerciseListProps {
  /** List of exercises in the template */
  exercises: EditingExercise[];
  /** Callback to open exercise picker */
  onAddExercise: () => void;
  /** Callback to move an exercise up in the list */
  onMoveUp: (index: number) => void;
  /** Callback to move an exercise down in the list */
  onMoveDown: (index: number) => void;
  /** Callback to remove an exercise */
  onRemove: (index: number) => void;
  /** Callback to add a set to an exercise */
  onAddSet: (exerciseIndex: number) => void;
  /** Callback to remove a set from an exercise */
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  /** Callback to update a set's weight or reps */
  onUpdateSet: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  /** Callback to update an exercise's rest time */
  onUpdateRestTime: (exerciseIndex: number, seconds: number) => void;
  /** Whether the parent is submitting (disables Add Exercise button) */
  isSubmitting?: boolean;
}

/**
 * ExerciseList component
 *
 * Renders the exercises section of the template editor:
 * - Section header with "Exercises" title and "Add Exercise" button
 * - List of ExerciseEditor components for each exercise
 * - Empty state when no exercises
 *
 * Matches index.html lines 439-517.
 */
export function ExerciseList({
  exercises,
  onAddExercise,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onUpdateRestTime,
  isSubmitting = false
}: ExerciseListProps) {
  return (
    <div class="form-section">
      {/* Section Header */}
      <div class="section-header">
        <h3>Exercises</h3>
        <button
          type="button"
          class="btn btn-primary"
          onClick={onAddExercise}
          disabled={isSubmitting}
        >
          Add Exercise
        </button>
      </div>

      {/* Exercises List */}
      <div class="exercises-list">
        {exercises.map((exercise, index) => (
          <ExerciseEditor
            key={exercise.exercise_id || index}
            exercise={exercise}
            index={index}
            isFirst={index === 0}
            isLast={index === exercises.length - 1}
            onMoveUp={() => onMoveUp(index)}
            onMoveDown={() => onMoveDown(index)}
            onRemove={() => onRemove(index)}
            onAddSet={() => onAddSet(index)}
            onRemoveSet={(setIndex) => onRemoveSet(index, setIndex)}
            onUpdateSet={(setIndex, field, value) => onUpdateSet(index, setIndex, field, value)}
            onUpdateRestTime={(seconds) => onUpdateRestTime(index, seconds)}
          />
        ))}
      </div>

      {/* Empty State */}
      {exercises.length === 0 && (
        <div class="empty-state">
          <p>No exercises added yet. Click "Add Exercise" to start building your template.</p>
        </div>
      )}
    </div>
  );
}

export default ExerciseList;
