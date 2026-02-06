/**
 * WorkoutDetail Component
 *
 * Displays a full workout breakdown with exercise blocks and set grids.
 * Shows workout header with title and date, each exercise as a distinct block,
 * and set completion status (checkmark for done, X for skipped).
 */

import { useState, useEffect } from 'preact/hooks';
import type { WorkoutLogWithExercises } from '@ironlift/shared';
import { logging } from '@ironlift/shared';

interface WorkoutDetailProps {
  workoutId: string;
  onBack: () => void;
}

/**
 * Format ISO date string to medium date format with year.
 * @example formatDetailDate("2026-02-05T10:30:00Z") => "Feb 5, 2026"
 */
function formatDetailDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function WorkoutDetail({ workoutId }: WorkoutDetailProps) {
  const [workout, setWorkout] = useState<WorkoutLogWithExercises | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await logging.getWorkoutLog(workoutId);

        if (result.error) {
          setError('Failed to load workout');
          setIsLoading(false);
          return;
        }

        setWorkout(result.data ?? null);
      } catch {
        setError('An unexpected error occurred');
      }

      setIsLoading(false);
    };

    load();
  }, [workoutId]);

  // Loading state
  if (isLoading) {
    return <div class="my-exercises-loading">Loading workout...</div>;
  }

  // Error state
  if (error) {
    return <div class="error-message">{error}</div>;
  }

  // No workout found
  if (!workout) {
    return <div class="error-message">Workout not found</div>;
  }

  // Content state
  return (
    <>
      {/* Workout header */}
      <div class="workout-detail-header">
        <h2 class="workout-detail-title">{workout.template_name || 'Untitled Workout'}</h2>
        <span class="workout-detail-date">{formatDetailDate(workout.started_at)}</span>
      </div>

      {/* Exercises */}
      <div class="workout-detail-exercises">
        {workout.workout_log_exercises.map((exercise) => (
          <div key={exercise.id} class="exercise-block">
            {/* Exercise header */}
            <div class="exercise-block-header">
              <span class="exercise-block-name">{exercise.exercises.name}</span>
              <span
                class="exercise-block-category"
                data-category={exercise.exercises.category}
              >
                {exercise.exercises.category}
              </span>
            </div>

            {/* Set grid */}
            <div class="set-grid">
              {/* Grid header */}
              <div class="set-grid-header">
                <span>Set</span>
                <span>Weight</span>
                <span>Reps</span>
                <span>Status</span>
              </div>

              {/* Set rows */}
              {exercise.workout_log_sets.map((set) => (
                <div key={set.id} class="set-grid-row">
                  <span class="set-cell">{set.set_number}</span>
                  <span class="set-cell">{set.weight} lbs</span>
                  <span class="set-cell">{set.reps}</span>
                  <span class="set-cell set-status">
                    {set.is_done ? (
                      <svg
                        class="status-done"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    ) : (
                      <svg
                        class="status-skipped"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <path d="M18 6L6 18M6 6l12 12"></path>
                      </svg>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
