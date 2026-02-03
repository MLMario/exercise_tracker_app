/**
 * MyExercisesList Component
 *
 * Displays user-created exercises in an alphabetically sorted list.
 * Fetches via exercises.getUserExercises() which filters to is_system=false.
 * Shows empty state with placeholder create button when no custom exercises exist.
 *
 * Note: Rows are NOT tappable (Phase 19 adds expand-to-edit).
 * Note: Create button has NO onClick (Phase 21 wires it up).
 */

import { useState, useEffect } from 'preact/hooks';
import type { Exercise } from '@ironlift/shared';
import { exercises } from '@ironlift/shared';

export function MyExercisesList() {
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      const { data, error: fetchError } = await exercises.getUserExercises();
      if (fetchError) {
        setError('Failed to load exercises');
      } else {
        setUserExercises(data || []);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) {
    return <div class="my-exercises-loading">Loading exercises...</div>;
  }

  if (error) {
    return <div class="error-message">{error}</div>;
  }

  if (userExercises.length === 0) {
    return (
      <div class="my-exercises-empty">
        <p class="my-exercises-empty-text">
          You haven't created any custom exercises yet.
        </p>
        <button type="button" class="btn btn-primary">
          Create Exercise
        </button>
      </div>
    );
  }

  return (
    <div class="my-exercises-list">
      {userExercises.map((exercise) => (
        <div key={exercise.id} class="my-exercises-row">
          <div class="exercise-item-info">
            <span class="exercise-item-name">{exercise.name}</span>
            <span class="exercise-item-category">{exercise.category}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
