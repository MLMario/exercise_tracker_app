/**
 * SetRow Component
 *
 * Presentational component for a single set row within an active workout.
 * Renders weight/reps inputs, done checkbox, and delete button.
 *
 * Structure matches index.html lines 579-615.
 * Note: Swipe gesture handlers will be added in Plan 04.
 */

import type { WorkoutSet } from './WorkoutSurface';

/**
 * Props for SetRow component.
 */
export interface SetRowProps {
  /** The set data */
  set: WorkoutSet;
  /** Index of the parent exercise */
  exerciseIndex: number;
  /** Index of this set */
  setIndex: number;
  /** Whether this set can be deleted (true if exercise has more than 1 set) */
  canDelete: boolean;
  /** Callback to update weight */
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: number) => void;
  /** Callback to update reps */
  onRepsChange: (exerciseIndex: number, setIndex: number, reps: number) => void;
  /** Callback to toggle done state */
  onToggleDone: (exerciseIndex: number, setIndex: number) => void;
  /** Callback to delete this set */
  onDelete: (exerciseIndex: number, setIndex: number) => void;
}

/**
 * SetRow component
 *
 * Renders a single set row with:
 * - Set number
 * - Weight input
 * - Reps input
 * - Done checkbox button
 * - Delete button (when canDelete is true)
 *
 * Matches index.html lines 579-615.
 */
export function SetRow({
  set,
  exerciseIndex,
  setIndex,
  canDelete,
  onWeightChange,
  onRepsChange,
  onToggleDone,
  onDelete
}: SetRowProps) {
  /**
   * Handle weight input change.
   */
  const handleWeightChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value) || 0;
    onWeightChange(exerciseIndex, setIndex, value);
  };

  /**
   * Handle reps input change.
   */
  const handleRepsChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value, 10) || 0;
    onRepsChange(exerciseIndex, setIndex, value);
  };

  /**
   * Handle checkbox click.
   */
  const handleToggleDone = (): void => {
    onToggleDone(exerciseIndex, setIndex);
  };

  /**
   * Handle delete button click.
   */
  const handleDelete = (): void => {
    onDelete(exerciseIndex, setIndex);
  };

  return (
    <div class="set-row-wrapper">
      <div class={`set-row ${set.is_done ? 'set-done' : ''}`}>
        <div class="set-number">{set.set_number}</div>
        <input
          type="number"
          class="set-input"
          value={set.weight}
          onInput={handleWeightChange}
          min={0}
          step={0.5}
          placeholder="0"
        />
        <input
          type="number"
          class="set-input"
          value={set.reps}
          onInput={handleRepsChange}
          min={0}
          placeholder="0"
        />
        <div class="set-checkbox">
          <button
            type="button"
            class={`checkbox-btn ${set.is_done ? 'checked' : ''}`}
            onClick={handleToggleDone}
          >
            {set.is_done && <span>&#10003;</span>}
          </button>
        </div>
      </div>
      {canDelete && (
        <button
          type="button"
          class="btn-remove-set"
          onClick={handleDelete}
          title="Remove Set"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
}

export default SetRow;
