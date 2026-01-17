/**
 * ExercisePickerModal Component
 *
 * Modal dialog for selecting or creating exercises.
 * Used in template editor to add exercises to templates.
 *
 * Matches behavior from:
 * - index.html lines 664-749 (HTML structure)
 * - js/app.js lines 538-691 (exercise picker methods)
 */

import { useState, useMemo, useEffect } from 'preact/hooks';
import type { JSX } from 'preact';
import type { Exercise } from '@ironlift/shared';

/**
 * Category options for new exercise creation.
 * Matches index.html lines 731-739.
 */
const CATEGORY_OPTIONS = [
  'Legs',
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Other',
] as const;

/**
 * Props interface for ExercisePickerModal component.
 */
export interface ExercisePickerModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Available exercises for selection */
  exercises: Exercise[];
  /** Exercise IDs to exclude (already added to template) */
  excludeIds?: string[];
  /** Handler to close the modal */
  onClose: () => void;
  /** Handler when an exercise is selected */
  onSelect: (exercise: Exercise) => void;
  /** Handler to create a new exercise (optional) */
  onCreateExercise?: (name: string, category: string) => Promise<Exercise | null>;
}

/**
 * ExercisePickerModal Component
 *
 * Renders a modal with:
 * - Search input for filtering exercises
 * - Scrollable list of available exercises
 * - Toggle for new exercise form
 * - New exercise creation form
 */
export function ExercisePickerModal({
  isOpen,
  exercises,
  excludeIds = [],
  onClose,
  onSelect,
  onCreateExercise,
}: ExercisePickerModalProps) {
  // ==================== STATE ====================
  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('');

  // New exercise form state
  const [showNewExerciseForm, setShowNewExerciseForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // ==================== EFFECTS ====================
  /**
   * Reset state when modal opens.
   * Matches js/app.js lines 538-543 (openExercisePickerForTemplate).
   */
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setShowNewExerciseForm(false);
      setNewExerciseName('');
      setNewExerciseCategory('');
      setIsCreating(false);
      setError('');
    }
  }, [isOpen]);

  // ==================== COMPUTED ====================
  /**
   * Filter exercises by search query.
   * Matches js/app.js lines 559-567 (filteredExercises getter).
   */
  const filteredExercises = useMemo(() => {
    if (!searchQuery) {
      return exercises;
    }
    const query = searchQuery.toLowerCase();
    return exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(query) ||
        ex.category.toLowerCase().includes(query)
    );
  }, [exercises, searchQuery]);

  // ==================== HANDLERS ====================
  /**
   * Handle search input change.
   */
  const handleSearch = (e: JSX.TargetedEvent<HTMLInputElement>): void => {
    setSearchQuery(e.currentTarget.value);
  };

  /**
   * Handle exercise selection.
   * Matches js/app.js lines 570-590.
   */
  const handleSelect = (exercise: Exercise): void => {
    // Check if exercise is excluded (already added)
    if (excludeIds.includes(exercise.id)) {
      setError('Exercise already added to template');
      return;
    }

    // Call onSelect and close modal
    onSelect(exercise);
    onClose();
  };

  /**
   * Toggle new exercise form visibility.
   */
  const toggleNewExerciseForm = (): void => {
    setShowNewExerciseForm((prev) => !prev);
    setError('');
  };

  /**
   * Handle new exercise creation.
   * Matches js/app.js lines 653-691 (createNewExercise).
   */
  const handleCreateExercise = async (
    e: JSX.TargetedEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // Validate name
    if (!newExerciseName || newExerciseName.trim() === '') {
      setError('Exercise name is required');
      return;
    }

    // Validate category
    if (!newExerciseCategory) {
      setError('Exercise category is required');
      return;
    }

    // Check if onCreateExercise is provided
    if (!onCreateExercise) {
      setError('Exercise creation not available');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const newExercise = await onCreateExercise(
        newExerciseName.trim(),
        newExerciseCategory
      );

      if (newExercise) {
        // Auto-select the new exercise
        onSelect(newExercise);
        onClose();
      } else {
        setError('Failed to create exercise');
      }
    } catch (err) {
      setError(
        'Failed to create exercise: ' +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handle click on modal overlay (close modal).
   */
  const handleOverlayClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
    // Only close if clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ==================== RENDER ====================
  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div class="modal-overlay" onClick={handleOverlayClick}>
      <div class="modal exercise-picker-modal">
        {/* Modal header - matches index.html lines 666-670 */}
        <div class="modal-header">
          <h2>Add Exercise</h2>
          <button
            type="button"
            class="btn btn-icon"
            onClick={onClose}
            title="Close"
          >
            <span>&times;</span>
          </button>
        </div>

        <div class="modal-body">
          {/* Error message display */}
          {error && (
            <div class="error-message" onClick={() => setError('')}>
              {error}
            </div>
          )}

          {/* Search input - matches index.html lines 675-680 */}
          <div class="form-group">
            <input
              type="text"
              value={searchQuery}
              onInput={handleSearch}
              class="input"
              placeholder="Search exercises..."
            />
          </div>

          {/* Scrollable exercise list - matches index.html lines 683-700 */}
          <div class="exercise-list-container">
            <div class="exercise-list">
              {filteredExercises.map((exercise) => {
                const isExcluded = excludeIds.includes(exercise.id);
                return (
                  <div
                    key={exercise.id}
                    onClick={() => !isExcluded && handleSelect(exercise)}
                    class={`exercise-list-item ${isExcluded ? 'disabled' : ''}`}
                  >
                    <div class="exercise-item-info">
                      <span class="exercise-item-name">{exercise.name}</span>
                      <span class="badge badge-small"> ({exercise.category})</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state - matches index.html lines 698-700 */}
            {filteredExercises.length === 0 && !showNewExerciseForm && (
              <div class="empty-state">
                <p>No exercises found. Try a different search or create a new exercise.</p>
              </div>
            )}
          </div>

          {/* Create new exercise toggle - matches index.html lines 703-708 */}
          <button
            type="button"
            onClick={toggleNewExerciseForm}
            class="btn btn-secondary btn-block"
          >
            {showNewExerciseForm ? 'Cancel New Exercise' : 'Create New Exercise'}
          </button>

          {/* New exercise form - matches index.html lines 710-749 */}
          {showNewExerciseForm && (
            <div class="new-exercise-form">
              <form onSubmit={handleCreateExercise}>
                <div class="form-group">
                  <label for="new-exercise-name">Exercise Name</label>
                  <input
                    id="new-exercise-name"
                    type="text"
                    value={newExerciseName}
                    onInput={(e) => setNewExerciseName(e.currentTarget.value)}
                    class="input"
                    placeholder="e.g., Barbell Squat"
                    required
                    disabled={isCreating}
                  />
                </div>

                <div class="form-group">
                  <label for="new-exercise-category">Category</label>
                  <select
                    id="new-exercise-category"
                    value={newExerciseCategory}
                    onChange={(e) => setNewExerciseCategory(e.currentTarget.value)}
                    class="input"
                    required
                    disabled={isCreating}
                  >
                    <option value="">Select category...</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowNewExerciseForm(false)}
                    class="btn btn-secondary"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExercisePickerModal;
