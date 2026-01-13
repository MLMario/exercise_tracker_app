/**
 * WorkoutExerciseCard Component
 *
 * Displays one exercise with its sets in an active workout.
 * Renders exercise header, set table with SetRow components, rest timer placeholder, and add set button.
 *
 * Structure matches index.html lines 540-646.
 */

import type { WorkoutExercise } from './WorkoutSurface';
import { SetRow } from './SetRow';
import { RestTimerBar } from './RestTimerBar';

/**
 * Props for WorkoutExerciseCard component.
 */
export interface WorkoutExerciseCardProps {
  /** The exercise being displayed */
  exercise: WorkoutExercise;
  /** Index of this exercise in the workout */
  exerciseIndex: number;
  /** Callback to update set weight */
  onWeightChange: (exerciseIndex: number, setIndex: number, weight: number) => void;
  /** Callback to update set reps */
  onRepsChange: (exerciseIndex: number, setIndex: number, reps: number) => void;
  /** Callback to toggle set done state (restSeconds passed for timer) */
  onToggleDone: (exerciseIndex: number, setIndex: number, restSeconds: number) => void;
  /** Callback to add a new set */
  onAddSet: (exerciseIndex: number) => void;
  /** Callback to delete a set */
  onDeleteSet: (exerciseIndex: number, setIndex: number) => void;
  /** Callback to remove this exercise from workout */
  onRemoveExercise: (exerciseIndex: number) => void;
  /** Current timer seconds to display */
  timerSeconds: number;
  /** Timer progress percentage (100 = full, 0 = empty) */
  timerProgress: number;
  /** Whether timer is currently active for this exercise */
  isTimerActive: boolean;
  /** Callback to adjust timer by delta seconds */
  onAdjustTimer: (deltaSeconds: number) => void;
  /** Key of the currently revealed set row (or null) */
  revealedSetKey: string | null;
  /** Callback when set swipe state changes */
  onSetSwipeStateChange: (setIndex: number, isRevealed: boolean) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * WorkoutExerciseCard component
 *
 * Renders a single exercise card with:
 * - Exercise header (name, category badge, remove button)
 * - Set table header and SetRow components
 * - Rest timer bar with countdown and controls
 * - Add Set button
 *
 * Matches index.html lines 540-646.
 */
export function WorkoutExerciseCard({
  exercise,
  exerciseIndex,
  onWeightChange,
  onRepsChange,
  onToggleDone,
  onAddSet,
  onDeleteSet,
  onRemoveExercise,
  timerSeconds,
  timerProgress,
  isTimerActive,
  onAdjustTimer,
  revealedSetKey,
  onSetSwipeStateChange
}: WorkoutExerciseCardProps) {
  /**
   * Handle remove exercise button click.
   */
  const handleRemoveExercise = (): void => {
    onRemoveExercise(exerciseIndex);
  };

  /**
   * Handle add set button click.
   */
  const handleAddSet = (): void => {
    onAddSet(exerciseIndex);
  };

  /**
   * Handle toggle done for a set.
   * Passes rest_seconds so parent can start timer.
   */
  const handleToggleDone = (exIdx: number, setIdx: number): void => {
    onToggleDone(exIdx, setIdx, exercise.rest_seconds);
  };

  return (
    <div class="card exercise-workout-card">
      {/* Exercise Header */}
      <div class="exercise-header">
        <div class="exercise-title-row">
          <span class="exercise-name">{exercise.name}</span>
          <span class="badge">{exercise.category}</span>
        </div>
        <button
          type="button"
          onClick={handleRemoveExercise}
          class="btn btn-icon btn-danger"
          title="Remove Exercise"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
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
          <SetRow
            key={setIndex}
            set={set}
            exerciseIndex={exerciseIndex}
            setIndex={setIndex}
            canDelete={exercise.sets.length > 1}
            onWeightChange={onWeightChange}
            onRepsChange={onRepsChange}
            onToggleDone={handleToggleDone}
            onDelete={onDeleteSet}
            shouldResetSwipe={revealedSetKey !== `${exerciseIndex}-${setIndex}`}
            onSwipeStateChange={(isRevealed) => onSetSwipeStateChange(setIndex, isRevealed)}
          />
        ))}
      </div>

      {/* Rest Timer Bar */}
      <RestTimerBar
        displaySeconds={timerSeconds}
        progress={timerProgress}
        isActive={isTimerActive}
        isComplete={isTimerActive && timerSeconds === 0}
        onAdjust={onAdjustTimer}
      />

      {/* Add Set Button */}
      <button
        type="button"
        class="btn btn-add-set"
        onClick={handleAddSet}
      >
        + Add Set
      </button>
    </div>
  );
}

export default WorkoutExerciseCard;
