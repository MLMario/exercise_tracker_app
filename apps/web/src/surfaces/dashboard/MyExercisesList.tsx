/**
 * MyExercisesList Component
 *
 * Displays user-created exercises in an alphabetically sorted list.
 * Fetches via exercises.getUserExercises() which filters to is_system=false.
 * Shows empty state with placeholder create button when no custom exercises exist.
 *
 * Inline accordion editing: tap pencil icon to expand edit form with
 * name input, category dropdown, and Save/Cancel buttons.
 * Only one row expanded at a time; switching rows discards unsaved changes.
 */

import { useState, useEffect, useCallback } from 'preact/hooks';
import type { JSX } from 'preact';
import type { Exercise, ExerciseCategory } from '@ironlift/shared';
import { exercises } from '@ironlift/shared';

export function MyExercisesList() {
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<ExerciseCategory>('Other');
  const [nameError, setNameError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const categories = exercises.getCategories();

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

  const handleEditClick = useCallback((exercise: Exercise) => {
    if (expandedId === exercise.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(exercise.id);
    setEditName(exercise.name);
    setEditCategory(exercise.category);
    setNameError('');
    setGeneralError('');
  }, [expandedId]);

  const handleCancel = useCallback(() => {
    setExpandedId(null);
    setNameError('');
    setGeneralError('');
  }, []);

  const handleSave = useCallback(async () => {
    const exercise = userExercises.find(ex => ex.id === expandedId);
    if (!exercise) return;

    setIsSaving(true);
    setNameError('');
    setGeneralError('');

    const params: { id: string; name?: string; category?: ExerciseCategory } = { id: exercise.id };
    if (editName.trim() !== exercise.name) {
      params.name = editName.trim();
    }
    if (editCategory !== exercise.category) {
      params.category = editCategory;
    }

    const result = await exercises.updateExercise(params);
    setIsSaving(false);

    if (result.validationError) {
      switch (result.validationError) {
        case 'EMPTY_NAME':
          setNameError('Exercise name is required');
          break;
        case 'INVALID_NAME':
          setNameError('Only letters, numbers, and spaces allowed');
          break;
        case 'DUPLICATE_NAME':
          setNameError('An exercise with this name already exists');
          break;
      }
    } else if (result.error) {
      setGeneralError('Failed to save changes');
    } else if (result.data) {
      const updated = result.data;
      setUserExercises(prev =>
        prev
          .map(ex => (ex.id === updated.id ? updated : ex))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setSuccessId(exercise.id);
      setTimeout(() => {
        setSuccessId(null);
        setExpandedId(null);
      }, 800);
    }
  }, [expandedId, editName, editCategory, userExercises]);

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

  const currentExercise = userExercises.find(ex => ex.id === expandedId);
  const hasChanges = currentExercise
    ? (editName.trim() !== currentExercise.name || editCategory !== currentExercise.category)
    : false;

  return (
    <div class="my-exercises-list">
      {userExercises.map((exercise) => (
        <div
          key={exercise.id}
          class={`my-exercises-row${expandedId === exercise.id ? ' editing' : ''}${successId === exercise.id ? ' save-success' : ''}`}
        >
          <div class="exercise-item-info">
            <span class="exercise-item-name">{exercise.name}</span>
            <span class="exercise-item-category">{exercise.category}</span>
          </div>
          <button
            type="button"
            class="my-exercises-edit-trigger"
            onClick={() => handleEditClick(exercise)}
            aria-label={`Edit ${exercise.name}`}
          >
            &#9998;
          </button>
          <div class="my-exercises-edit-form">
            <div class="my-exercises-edit-form-inner">
              {generalError && <div class="error-message">{generalError}</div>}
              <div>
                <input
                  type="text"
                  value={editName}
                  onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
                    setEditName(e.currentTarget.value);
                    setNameError('');
                  }}
                  placeholder="Exercise name"
                  disabled={isSaving}
                />
                {nameError && <div class="field-error">{nameError}</div>}
              </div>
              <div>
                <select
                  value={editCategory}
                  onChange={(e: JSX.TargetedEvent<HTMLSelectElement>) => {
                    setEditCategory(e.currentTarget.value as ExerciseCategory);
                  }}
                  disabled={isSaving}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div class="my-exercises-edit-actions">
                <button
                  type="button"
                  class="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
