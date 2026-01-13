/**
 * ExerciseEditor Component
 *
 * Presentational component for editing a single exercise within a template.
 * Renders set table, move/remove buttons, and rest time input.
 *
 * Structure matches index.html lines 449-510.
 */

import type { EditingExercise } from './TemplateEditorSurface';

/**
 * Props for ExerciseEditor component.
 */
export interface ExerciseEditorProps {
  /** The exercise being edited */
  exercise: EditingExercise;
  /** Index of this exercise in the list */
  index: number;
  /** Whether this is the first exercise (disable move up) */
  isFirst: boolean;
  /** Whether this is the last exercise (disable move down) */
  isLast: boolean;
  /** Callback to move exercise up in the list */
  onMoveUp: () => void;
  /** Callback to move exercise down in the list */
  onMoveDown: () => void;
  /** Callback to remove this exercise */
  onRemove: () => void;
  /** Callback to add a new set to this exercise */
  onAddSet: () => void;
  /** Callback to remove a set from this exercise */
  onRemoveSet: (setIndex: number) => void;
  /** Callback to update a set's weight or reps */
  onUpdateSet: (setIndex: number, field: 'weight' | 'reps', value: number) => void;
  /** Callback to update rest time between sets */
  onUpdateRestTime: (seconds: number) => void;
}

/**
 * ExerciseEditor component
 *
 * Renders a single exercise card with:
 * - Exercise header (name, category badge, move/remove buttons)
 * - Set table with weight/reps inputs
 * - Add set button
 * - Rest time input
 *
 * Matches index.html lines 449-510.
 */
export function ExerciseEditor({
  exercise,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onUpdateRestTime
}: ExerciseEditorProps) {
  /**
   * Handle weight input change.
   */
  const handleWeightChange = (setIndex: number, e: Event): void => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value) || 0;
    onUpdateSet(setIndex, 'weight', value);
  };

  /**
   * Handle reps input change.
   */
  const handleRepsChange = (setIndex: number, e: Event): void => {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    onUpdateSet(setIndex, 'reps', value);
  };

  /**
   * Handle rest time input change.
   */
  const handleRestTimeChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    onUpdateRestTime(value);
  };

  return (
    <div class="card exercise-editor-card">
      {/* Exercise Header */}
      <div class="exercise-header">
        <div class="exercise-title-row">
          <span class="exercise-name">{exercise.name}</span>
          <span class="badge">{exercise.category}</span>
        </div>
        <div class="exercise-header-actions">
          <button
            type="button"
            onClick={onMoveUp}
            class="btn btn-icon"
            disabled={isFirst}
            title="Move up"
          >
            <span>↑</span>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            class="btn btn-icon"
            disabled={isLast}
            title="Move down"
          >
            <span>↓</span>
          </button>
          <button
            type="button"
            onClick={onRemove}
            class="btn btn-icon btn-danger"
            title="Remove"
          >
            <span>✕</span>
          </button>
        </div>
      </div>

      {/* Set Table */}
      <div class="set-table">
        <div class="set-header">
          <span>Set</span>
          <span>lbs</span>
          <span>Reps</span>
          <span></span>
        </div>

        {exercise.sets.map((set, setIndex) => (
          <div class="set-row" key={setIndex}>
            <div class="set-number">{set.set_number}</div>
            <input
              type="number"
              class="set-input"
              value={set.weight}
              onInput={(e) => handleWeightChange(setIndex, e)}
              min={0}
              step={0.5}
              placeholder="0"
            />
            <input
              type="number"
              class="set-input"
              value={set.reps}
              onInput={(e) => handleRepsChange(setIndex, e)}
              min={0}
              placeholder="10"
            />
            {exercise.sets.length > 1 && (
              <button
                type="button"
                class="btn btn-icon btn-danger btn-small"
                onClick={() => onRemoveSet(setIndex)}
                title="Remove Set"
              >
                <span>✕</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Set Button */}
      <button
        type="button"
        class="btn btn-add-set"
        onClick={onAddSet}
      >
        + Add Set
      </button>

      {/* Rest Time (shared for all sets) */}
      <div class="rest-time-row">
        <label>Rest between sets:</label>
        <input
          type="number"
          class="input input-small"
          value={exercise.default_rest_seconds}
          onInput={handleRestTimeChange}
          min={0}
          placeholder="60"
        />
        <span class="input-suffix">seconds</span>
      </div>
    </div>
  );
}

export default ExerciseEditor;
