/**
 * WorkoutSurface Component
 *
 * Container component for active workout tracking.
 * Manages workout state, timer, and set tracking during exercise sessions.
 *
 * State variables mirror the Alpine.js implementation in js/app.js lines 48-77.
 */

import { useState, useEffect, useRef } from 'preact/hooks';
import type { TemplateWithExercises } from '@/types';
import { WorkoutExerciseCard } from './WorkoutExerciseCard';

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Set within an active workout.
 * Includes is_done flag for tracking completion.
 */
export interface WorkoutSet {
  set_number: number;
  weight: number;
  reps: number;
  is_done: boolean;
}

/**
 * Exercise being tracked in the workout.
 * Matches js/app.js lines 700-712.
 */
export interface WorkoutExercise {
  exercise_id: string;
  name: string;
  category: string;
  order: number;
  rest_seconds: number;
  sets: WorkoutSet[];
}

/**
 * Active workout state.
 * Matches js/app.js lines 696-713.
 */
export interface ActiveWorkout {
  template_id: string | null;
  template_name: string;
  started_at: string | null;
  exercises: WorkoutExercise[];
}

/**
 * Original template snapshot for change detection.
 * Matches js/app.js lines 716-725.
 */
interface TemplateSnapshot {
  exercises: {
    exercise_id: string;
    sets: {
      set_number: number;
      weight: number;
      reps: number;
    }[];
  }[];
}

/**
 * Props for WorkoutSurface component.
 */
interface WorkoutSurfaceProps {
  /** Template to start workout from */
  template: TemplateWithExercises;
  /** Callback when workout saved */
  onFinish?: () => void;
  /** Callback when workout cancelled */
  onCancel?: () => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format seconds to MM:SS display.
 * Matches js/app.js lines 1175-1181.
 */
function formatTime(seconds: number): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) {
    seconds = 0;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format ISO date string to readable date.
 * Matches js/app.js lines 1183-1194.
 */
function formatWorkoutDate(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// ============================================================================
// Component
// ============================================================================

/**
 * WorkoutSurface container component
 *
 * Manages active workout state and tracking.
 * Exercise cards will be implemented in Plan 02.
 */
export function WorkoutSurface({
  template,
  onFinish,
  onCancel
}: WorkoutSurfaceProps) {
  // ==================== WORKOUT STATE ====================
  // Mirrors js/app.js lines 48-77

  // Active workout state
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout>({
    template_id: null,
    template_name: '',
    started_at: null,
    exercises: []
  });

  // Original template snapshot for change detection
  const [originalTemplateSnapshot, setOriginalTemplateSnapshot] = useState<TemplateSnapshot | null>(null);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [activeTimerExerciseIndex, setActiveTimerExerciseIndex] = useState<number | null>(null);

  // Ref to store interval ID
  const timerIntervalRef = useRef<number | null>(null);

  // Modal visibility state
  const [showFinishWorkoutModal, setShowFinishWorkoutModal] = useState(false);
  const [showCancelWorkoutModal, setShowCancelWorkoutModal] = useState(false);
  const [showTemplateUpdateModal, setShowTemplateUpdateModal] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  // Pending workout data (for template update decision)
  const [pendingWorkoutData, setPendingWorkoutData] = useState<unknown | null>(null);

  // Message state
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ==================== INITIALIZATION ====================
  // Matches js/app.js lines 695-730

  useEffect(() => {
    // Initialize active workout from template
    const initialWorkout: ActiveWorkout = {
      template_id: template.id,
      template_name: template.name,
      started_at: new Date().toISOString(),
      exercises: template.exercises.map((te, exIndex) => ({
        exercise_id: te.exercise_id,
        name: te.name,
        category: te.category,
        order: exIndex,
        rest_seconds: te.default_rest_seconds || 90,
        sets: te.sets.map(set => ({
          set_number: set.set_number,
          weight: set.weight,
          reps: set.reps,
          is_done: false
        }))
      }))
    };

    setActiveWorkout(initialWorkout);

    // Store deep copy for change detection
    const snapshot: TemplateSnapshot = {
      exercises: template.exercises.map(te => ({
        exercise_id: te.exercise_id,
        sets: te.sets.map(set => ({
          set_number: set.set_number,
          weight: set.weight,
          reps: set.reps
        }))
      }))
    };
    setOriginalTemplateSnapshot(snapshot);
  }, [template]);

  // ==================== TIMER CLEANUP ====================
  // Clean up timer on unmount

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // ==================== TIMER METHODS ====================
  // Matches js/app.js lines 1089-1173

  /**
   * Check if timer is active for a specific exercise.
   * Matches js/app.js lines 1159-1161.
   */
  const isTimerActiveForExercise = (exIndex: number): boolean => {
    return timerActive && activeTimerExerciseIndex === exIndex;
  };

  /**
   * Get timer progress percentage (100 = full, 0 = empty).
   * Matches js/app.js lines 1164-1172.
   */
  const getTimerProgress = (exIndex: number): number => {
    if (!isTimerActiveForExercise(exIndex)) {
      return 100; // Full bar when idle
    }
    if (timerTotalSeconds <= 0) {
      return 0;
    }
    return Math.round((timerSeconds / timerTotalSeconds) * 100);
  };

  /**
   * Stop the current timer.
   * Matches js/app.js lines 1125-1135.
   */
  const stopTimer = (): void => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerActive(false);
    setTimerSeconds(0);
    setTimerTotalSeconds(0);
    setActiveTimerExerciseIndex(null);
  };

  /**
   * Start rest timer for an exercise.
   * Matches js/app.js lines 1090-1123.
   */
  const startRestTimer = (seconds: number, exIndex: number): void => {
    if (!seconds || seconds <= 0) return;

    // Stop any existing timer first
    stopTimer();

    setTimerActive(true);
    setTimerSeconds(seconds);
    setTimerTotalSeconds(seconds);
    setActiveTimerExerciseIndex(exIndex);

    // Start countdown
    timerIntervalRef.current = window.setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          // Timer complete
          stopTimer();
          // Play notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Rest Timer Complete!', {
              body: 'Time to start your next set'
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Adjust timer by adding/subtracting seconds.
   * Matches js/app.js lines 1141-1156.
   */
  const adjustTimer = (deltaSeconds: number, exIndex: number): void => {
    if (isTimerActiveForExercise(exIndex)) {
      // Timer is running - adjust running timer
      setTimerSeconds(prev => Math.max(0, prev + deltaSeconds));
      setTimerTotalSeconds(prev => Math.max(0, prev + deltaSeconds));
    } else {
      // Timer is idle - adjust exercise's default rest_seconds
      setActiveWorkout(prev => {
        const updated = { ...prev };
        const exercise = { ...updated.exercises[exIndex] };
        exercise.rest_seconds = Math.max(0, exercise.rest_seconds + deltaSeconds);
        updated.exercises = [...updated.exercises];
        updated.exercises[exIndex] = exercise;
        return updated;
      });
    }
  };

  // ==================== HANDLERS ====================

  /**
   * Handle cancel workout button click.
   * Matches js/app.js lines 996-999.
   */
  const handleCancelWorkout = (): void => {
    // TODO: Add confirmation modal in future plan
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Handle finish workout button click.
   * Matches js/app.js lines 907-917.
   */
  const handleFinishWorkout = (): void => {
    setError('');
    setSuccessMessage('');

    if (activeWorkout.exercises.length === 0) {
      setError('Add at least one exercise to finish the workout');
      return;
    }

    // TODO: Show finish modal and save workout in future plan
    setShowFinishWorkoutModal(true);
  };

  // ==================== SET MANAGEMENT HANDLERS ====================
  // Matches js/app.js lines 743-770

  /**
   * Add a new set to an exercise.
   * Matches js/app.js lines 743-752.
   */
  const handleAddSet = (exerciseIndex: number): void => {
    setActiveWorkout(prev => {
      const updated = { ...prev };
      const exercise = { ...updated.exercises[exerciseIndex] };
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets = [...exercise.sets, {
        set_number: exercise.sets.length + 1,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 10,
        is_done: false
      }];
      updated.exercises = [...updated.exercises];
      updated.exercises[exerciseIndex] = exercise;
      return updated;
    });
  };

  /**
   * Delete a set from an exercise.
   * Matches js/app.js lines 755-762.
   */
  const handleDeleteSet = (exerciseIndex: number, setIndex: number): void => {
    setActiveWorkout(prev => {
      const updated = { ...prev };
      const exercise = { ...updated.exercises[exerciseIndex] };
      if (exercise.sets.length > 1) {
        exercise.sets = exercise.sets.filter((_, i) => i !== setIndex);
        // Renumber remaining sets
        exercise.sets = exercise.sets.map((set, i) => ({
          ...set,
          set_number: i + 1
        }));
      }
      updated.exercises = [...updated.exercises];
      updated.exercises[exerciseIndex] = exercise;
      return updated;
    });
  };

  /**
   * Update set weight.
   */
  const handleWeightChange = (exerciseIndex: number, setIndex: number, weight: number): void => {
    setActiveWorkout(prev => {
      const updated = { ...prev };
      const exercise = { ...updated.exercises[exerciseIndex] };
      exercise.sets = [...exercise.sets];
      exercise.sets[setIndex] = { ...exercise.sets[setIndex], weight };
      updated.exercises = [...updated.exercises];
      updated.exercises[exerciseIndex] = exercise;
      return updated;
    });
  };

  /**
   * Update set reps.
   */
  const handleRepsChange = (exerciseIndex: number, setIndex: number, reps: number): void => {
    setActiveWorkout(prev => {
      const updated = { ...prev };
      const exercise = { ...updated.exercises[exerciseIndex] };
      exercise.sets = [...exercise.sets];
      exercise.sets[setIndex] = { ...exercise.sets[setIndex], reps };
      updated.exercises = [...updated.exercises];
      updated.exercises[exerciseIndex] = exercise;
      return updated;
    });
  };

  /**
   * Toggle set done state and start rest timer when marking done.
   * Matches js/app.js lines 765-770.
   */
  const handleToggleDone = (exerciseIndex: number, setIndex: number, restSeconds: number): void => {
    // Get current done state before toggle
    const currentSet = activeWorkout.exercises[exerciseIndex]?.sets[setIndex];
    const wasNotDone = currentSet && !currentSet.is_done;

    setActiveWorkout(prev => {
      const updated = { ...prev };
      const exercise = { ...updated.exercises[exerciseIndex] };
      exercise.sets = [...exercise.sets];
      const set = { ...exercise.sets[setIndex] };
      set.is_done = !set.is_done;
      exercise.sets[setIndex] = set;
      updated.exercises = [...updated.exercises];
      updated.exercises[exerciseIndex] = exercise;
      return updated;
    });

    // Start rest timer when marking set as done (not when unchecking)
    if (wasNotDone) {
      startRestTimer(restSeconds, exerciseIndex);
    }
  };

  /**
   * Remove exercise from workout.
   * Stops timer if removing exercise that has active timer.
   * Matches js/app.js lines 898-905.
   */
  const handleRemoveExercise = (index: number): void => {
    // Stop timer if removing exercise that has active timer
    if (activeTimerExerciseIndex === index) {
      stopTimer();
    }
    // Adjust activeTimerExerciseIndex if needed
    if (activeTimerExerciseIndex !== null && index < activeTimerExerciseIndex) {
      setActiveTimerExerciseIndex(prev => prev !== null ? prev - 1 : null);
    }
    setActiveWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  // ==================== RENDER ====================
  // Structure matches index.html lines 524-661

  return (
    <div class="workout-surface">
      {/* Header bar - Cancel / Title / Finish */}
      <header class="app-header workout-header">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          onClick={handleCancelWorkout}
        >
          Cancel
        </button>
        <div class="workout-info">
          <h1 class="app-title">{activeWorkout.template_name}</h1>
          <p class="workout-time">{formatWorkoutDate(activeWorkout.started_at)}</p>
        </div>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          onClick={handleFinishWorkout}
        >
          Finish
        </button>
      </header>

      {/* Error message display */}
      {error && (
        <div class="error-message" onClick={() => setError('')}>
          {error}
        </div>
      )}

      {/* Success message display */}
      {successMessage && (
        <div class="success-message" onClick={() => setSuccessMessage('')}>
          {successMessage}
        </div>
      )}

      {/* Main workout content */}
      <div class="workout-content">
        {/* Exercises list */}
        <div class="exercises-list">
          {activeWorkout.exercises.map((exercise, index) => (
            <WorkoutExerciseCard
              key={exercise.exercise_id || index}
              exercise={exercise}
              exerciseIndex={index}
              onWeightChange={handleWeightChange}
              onRepsChange={handleRepsChange}
              onToggleDone={handleToggleDone}
              onAddSet={handleAddSet}
              onDeleteSet={handleDeleteSet}
              onRemoveExercise={handleRemoveExercise}
              // Timer props
              timerSeconds={isTimerActiveForExercise(index) ? timerSeconds : exercise.rest_seconds}
              timerProgress={getTimerProgress(index)}
              isTimerActive={isTimerActiveForExercise(index)}
              onAdjustTimer={(delta) => adjustTimer(delta, index)}
            />
          ))}
        </div>

        {/* Empty state when no exercises */}
        {activeWorkout.exercises.length === 0 && (
          <div class="empty-state">
            <p>No exercises in this workout. Add some below!</p>
          </div>
        )}

        {/* Footer with Add Exercise button */}
        <div class="workout-footer">
          <button
            type="button"
            class="btn btn-primary btn-block"
            onClick={() => setShowExercisePicker(true)}
            disabled
          >
            Add Exercise
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkoutSurface;
