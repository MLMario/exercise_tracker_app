/**
 * WorkoutExerciseCard Component
 *
 * Displays one exercise with its sets in an accordion-style collapsible layout.
 * Collapsed: Progress ring + exercise name + Add Set button + remove button + chevron
 * Expanded: Set table + timer bar revealed on tap
 */

import { useState } from 'preact/hooks';
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

// Progress ring constants
const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ~100.53

// ============================================================================
// Component
// ============================================================================

/**
 * WorkoutExerciseCard component
 *
 * Renders a single exercise card in accordion style with:
 * - Header: Progress ring, exercise name, Add Set button, remove button, chevron
 * - Body (expandable): Set table + rest timer bar
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate progress
  const totalSets = exercise.sets.length;
  const completedSets = exercise.sets.filter(s => s.is_done).length;
  const isComplete = totalSets > 0 && completedSets === totalSets;
  const progressOffset = RING_CIRCUMFERENCE * (1 - (totalSets > 0 ? completedSets / totalSets : 0));

  /**
   * Toggle expand/collapse on header click.
   */
  const toggleExpanded = (): void => {
    setIsExpanded(prev => !prev);
  };

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
    <div class={`exercise-workout-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Accordion Header - Always visible */}
      <div class="card-header" onClick={toggleExpanded}>
        {/* Progress Ring */}
        <div class="progress-ring">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle class="progress-ring-bg" cx="20" cy="20" r={RING_RADIUS} />
            <circle
              class={`progress-ring-fill ${isComplete ? 'complete' : ''}`}
              cx="20"
              cy="20"
              r={RING_RADIUS}
              stroke-dasharray={RING_CIRCUMFERENCE}
              stroke-dashoffset={progressOffset}
            />
          </svg>
          <span class="progress-text">{completedSets}/{totalSets}</span>
        </div>

        {/* Exercise Info */}
        <div class="exercise-info">
          <div class="exercise-name-row">
            <span class="exercise-name">{exercise.name}</span>
          </div>
          {isComplete && (
            <div class="exercise-meta">
              <span class="complete-label">Complete</span>
            </div>
          )}
        </div>

        {/* Chevron */}
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Collapsible Body */}
      <div class="card-body">
        <div class="body-content">
          {/* Set Table */}
          <div class="set-table">
            <div class="set-header">
              <span>#</span>
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

          <RestTimerBar
            displaySeconds={timerSeconds}
            progress={timerProgress}
            isActive={isTimerActive}
            isComplete={isTimerActive && timerSeconds === 0}
            onAdjust={onAdjustTimer}
          />

          {/* Action Footer */}
          <div class="card-action-footer">
            <button
              type="button"
              class="btn-add-set"
              onClick={handleAddSet}
              title="Add Set"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Set
            </button>
            <button
              type="button"
              class="btn-remove"
              onClick={handleRemoveExercise}
              title="Remove Exercise"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutExerciseCard;
