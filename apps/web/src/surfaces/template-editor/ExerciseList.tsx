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
 * - List of ExerciseEditor components for each exercise
 * - Empty state when no exercises
 * - Footer with Add Exercise button
 */
export function ExerciseList({
  exercises,
  onAddExercise,
  onRemove,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onUpdateRestTime,
  isSubmitting = false
}: ExerciseListProps) {
  return (
    <div class="form-section">
      {/* Exercises List */}
      <div class="exercises-list">
        {exercises.map((exercise, index) => (
          <ExerciseEditor
            key={exercise.exercise_id || index}
            exercise={exercise}
            index={index}
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

      {/* Footer - Add Exercise button */}
      <div class="footer-actions">
        <button
          type="button"
          class="btn btn-primary btn-block"
          onClick={onAddExercise}
          disabled={isSubmitting}
        >
          Add Exercise
        </button>
      </div>
    </div>
  );
}

export default ExerciseList;
