/**
 * ExerciseEditor Component
 *
 * Presentational component for editing a single exercise within a template.
 * Renders card header with Add Set button, set table, and rest time input.
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
 * - Card header (name, Add Set button, hover-reveal remove button)
 * - Set table with weight/reps inputs
 * - Rest time input
 */
export function ExerciseEditor({
  exercise,
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
   * Format seconds to MM:SS display.
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Decrease rest time by 10 seconds (minimum 0).
   */
  const handleDecreaseTime = (): void => {
    const newTime = Math.max(0, exercise.default_rest_seconds - 10);
    onUpdateRestTime(newTime);
  };

  /**
   * Increase rest time by 10 seconds.
   */
  const handleIncreaseTime = (): void => {
    onUpdateRestTime(exercise.default_rest_seconds + 10);
  };

  return (
    <div class="exercise-editor-card">
      {/* Card Header */}
      <div class="card-header">
        <div class="exercise-info">
          <span class="exercise-name">{exercise.name}</span>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-add-set" onClick={onAddSet} title="Add Set">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Set
          </button>
        </div>
        <button type="button" class="btn-remove" onClick={onRemove} title="Remove Exercise">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Card Body */}
      <div class="card-body">
        {/* Set Table */}
        <div class="set-table">
        <div class="set-header">
          <span>#</span>
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
            {exercise.sets.length > 1 ? (
              <button
                type="button"
                class="btn-delete-set"
                onClick={() => onRemoveSet(setIndex)}
                title="Remove Set"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            ) : (
              <span></span>
            )}
          </div>
        ))}
        </div>

        {/* Rest Timer Inline */}
        <div class="rest-timer-inline">
          <button type="button" class="btn-timer-adjust" onClick={handleDecreaseTime}>-10s</button>
          <div class="rest-timer-bar">
            <div class="rest-timer-bar-fill idle"></div>
          </div>
          <span class="rest-timer-time">{formatTime(exercise.default_rest_seconds)}</span>
          <button type="button" class="btn-timer-adjust" onClick={handleIncreaseTime}>+10s</button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseEditor;
