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

import { useState, useMemo, useEffect, useRef, useCallback } from 'preact/hooks';
import type { JSX } from 'preact';
import type { Exercise, ExerciseCategory } from '@ironlift/shared';
import { useAsyncOperation, useClickOutside } from '@/hooks';

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
 * Filter category options for dropdown (no Cardio per ExerciseCategory type).
 */
const FILTER_CATEGORIES: readonly ('All Categories' | ExerciseCategory)[] = [
  'All Categories',
  'Chest',
  'Back',
  'Shoulders',
  'Legs',
  'Arms',
  'Core',
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
  const [selectedCategory, setSelectedCategory] = useState<'All Categories' | ExerciseCategory>('All Categories');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // New exercise form state
  const [showNewExerciseForm, setShowNewExerciseForm] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('');

  // Async operation state for exercise creation
  const { error, isLoading: isCreating, setError, reset: resetAsync, execute } = useAsyncOperation({ trackSuccess: false });

  // Close dropdown when clicking outside
  const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);
  useClickOutside(dropdownRef, closeDropdown);

  // ==================== EFFECTS ====================
  /**
   * Reset state when modal opens.
   * Matches js/app.js lines 538-543 (openExercisePickerForTemplate).
   */
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategory('All Categories');
      setIsDropdownOpen(false);
      setShowNewExerciseForm(false);
      setNewExerciseName('');
      setNewExerciseCategory('');
      resetAsync();
    }
  }, [isOpen, resetAsync]);

  // ==================== COMPUTED ====================
  /**
   * Filter exercises by search query.
   * Matches js/app.js lines 559-567 (filteredExercises getter).
   */
  const filteredExercises = useMemo(() => {
    let result = exercises;

    // Filter by category first (if not "All Categories")
    if (selectedCategory !== 'All Categories') {
      result = result.filter((ex) => ex.category === selectedCategory);
    }

    // Filter by search query - NAME ONLY (not category, per PICK-01)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((ex) => ex.name.toLowerCase().includes(query));
    }

    // Sort: user exercises first (is_system=false), then alphabetically
    return [...result].sort((a, b) => {
      // Primary: is_system (false < true, so user exercises first)
      if (a.is_system !== b.is_system) {
        return a.is_system ? 1 : -1;
      }
      // Secondary: alphabetical by name
      return a.name.localeCompare(b.name);
    });
  }, [exercises, selectedCategory, searchQuery]);

  // ==================== HANDLERS ====================
  /**
   * Handle search input change.
   */
  const handleSearch = (e: JSX.TargetedEvent<HTMLInputElement>): void => {
    setSearchQuery(e.currentTarget.value);
  };

  /**
   * Handle category selection from dropdown.
   */
  const handleCategorySelect = (category: 'All Categories' | ExerciseCategory): void => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
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

    const newExercise = await execute(async () => {
      const result = await onCreateExercise(
        newExerciseName.trim(),
        newExerciseCategory
      );
      if (!result) {
        throw new Error('Failed to create exercise');
      }
      return result;
    });

    if (newExercise) {
      // Auto-select the new exercise
      onSelect(newExercise);
      onClose();
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

          {/* Category filter dropdown - PICK-02: above search input */}
          <div class="category-dropdown-wrapper">
            <div class="category-dropdown" ref={dropdownRef}>
              <button
                type="button"
                class="dropdown-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <span>{selectedCategory}</span>
                <svg
                  class={`dropdown-chevron ${isDropdownOpen ? 'open' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                >
                  <path d="M6 9L1 4h10z" />
                </svg>
              </button>
              {isDropdownOpen && (
                <ul class="dropdown-menu" role="listbox">
                  {FILTER_CATEGORIES.map((category) => (
                    <li
                      key={category}
                      role="option"
                      aria-selected={category === selectedCategory}
                      class={category === selectedCategory ? 'selected' : ''}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

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
                    class={`exercise-list-item ${exercise.is_system ? 'system' : ''} ${isExcluded ? 'disabled' : ''}`}
                  >
                    <div class="exercise-item-info">
                      <span class="exercise-item-name">{exercise.name}</span>
                      <span class="exercise-item-category">{exercise.category}</span>
                    </div>
                    {!exercise.is_system && (
                      <span class="badge-custom">Custom</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredExercises.length === 0 && !showNewExerciseForm && (
              <div class="empty-state">
                <p>No exercises found</p>
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
