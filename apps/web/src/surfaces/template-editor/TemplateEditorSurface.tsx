/**
 * TemplateEditorSurface Component
 *
 * Container component for template creation and editing.
 * Manages editingTemplate state and save/cancel operations.
 *
 * State variables mirror the Alpine.js implementation in js/app.js lines 32-37.
 * Exercise manipulation methods mirror js/app.js lines 613-655.
 */

import { useState, useEffect } from 'preact/hooks';
import type { TemplateWithExercises, Exercise, ExerciseCategory } from '@ironlift/shared';
import { exercises, templates } from '@ironlift/shared';
import { ExerciseList } from './ExerciseList';
import { ExercisePickerModal } from '@/components';

/**
 * Set configuration within an editing exercise.
 * Matches js/app.js lines 585-589.
 */
export interface EditingSet {
  set_number: number;
  weight: number;
  reps: number;
}

/**
 * Exercise being edited in the template editor.
 * Matches js/app.js lines 580-590.
 */
export interface EditingExercise {
  exercise_id: string;
  name: string;
  category: string;
  default_rest_seconds: number;
  sets: EditingSet[];
}

/**
 * Template being edited.
 * Matches js/app.js lines 32-37.
 */
export interface EditingTemplate {
  id: string | null;
  name: string;
  exercises: EditingExercise[];
}

/**
 * Props for TemplateEditorSurface component.
 */
interface TemplateEditorSurfaceProps {
  /** Template to edit (undefined for create mode) */
  template?: TemplateWithExercises;
  /** Callback after successful save */
  onSave: () => void;
  /** Callback to navigate back (cancel) */
  onCancel: () => void;
}

/**
 * Convert a TemplateWithExercises to EditingTemplate format.
 * Matches js/app.js lines 455-467.
 */
function templateToEditing(template: TemplateWithExercises): EditingTemplate {
  return {
    id: template.id,
    name: template.name,
    exercises: template.exercises.map(ex => ({
      exercise_id: ex.exercise_id,
      name: ex.name,
      category: ex.category,
      default_rest_seconds: ex.default_rest_seconds,
      sets: ex.sets ? ex.sets.map(set => ({ ...set })) : []
    }))
  };
}

/**
 * Create an empty EditingTemplate for new template mode.
 * Matches js/app.js lines 445-449.
 */
function createEmptyTemplate(): EditingTemplate {
  return {
    id: null,
    name: '',
    exercises: []
  };
}

/**
 * TemplateEditorSurface container component
 *
 * Manages template editing state and save/cancel operations.
 * Exercises list editing will be implemented in Plan 02.
 */
export function TemplateEditorSurface({
  template,
  onSave,
  onCancel
}: TemplateEditorSurfaceProps) {
  // ==================== EDITOR STATE ====================
  // Mirrors js/app.js lines 32-37

  // Editing template state - initialized from props or empty
  const [editingTemplate, setEditingTemplate] = useState<EditingTemplate>(
    template ? templateToEditing(template) : createEmptyTemplate()
  );

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error message display
  const [error, setError] = useState('');

  // Success message display
  const [successMessage, setSuccessMessage] = useState('');

  // Exercise picker state
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

  // ==================== EFFECTS ====================

  /**
   * Load available exercises on mount.
   * Matches dashboard pattern for loading exercises.
   */
  useEffect(() => {
    const loadExercises = async (): Promise<void> => {
      try {
        const { data, error } = await exercises.getExercises();
        if (error) {
          console.error('Failed to load exercises:', error.message);
          return;
        }
        if (data) {
          setAvailableExercises(data);
        }
      } catch (err) {
        console.error('Failed to load exercises:', err);
      }
    };

    loadExercises();
  }, []);

  // ==================== HANDLERS ====================
  // Matches js/app.js lines 469-536

  /**
   * Handle template name change.
   */
  const handleNameChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    setEditingTemplate(prev => ({
      ...prev,
      name: target.value
    }));
  };

  /**
   * Handle save template.
   * Matches js/app.js lines 469-509.
   */
  const handleSave = async (): Promise<void> => {
    setError('');
    setSuccessMessage('');

    // Validate template name
    if (!editingTemplate.name || editingTemplate.name.trim() === '') {
      setError('Template name is required');
      return;
    }

    // Validate at least one exercise
    if (editingTemplate.exercises.length === 0) {
      setError('Add at least one exercise to the template');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingTemplate.id) {
        // Update existing template
        const { error } = await templates.updateTemplate(
          editingTemplate.id,
          editingTemplate.name,
          editingTemplate.exercises
        );
        if (error) throw new Error(error.message);
        setSuccessMessage('Template updated successfully');
      } else {
        // Create new template
        const { error } = await templates.createTemplate(
          editingTemplate.name,
          editingTemplate.exercises
        );
        if (error) throw new Error(error.message);
        setSuccessMessage('Template created successfully');
      }

      // Navigate back to dashboard
      onSave();
    } catch (err) {
      setError('Failed to save template: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle cancel template editing.
   * Matches js/app.js lines 529-536.
   */
  const handleCancel = (): void => {
    onCancel();
  };

  // ==================== EXERCISE MANIPULATION ====================
  // Matches js/app.js lines 613-655

  /**
   * Move exercise up in the list.
   * Matches js/app.js lines 617-623.
   */
  const handleMoveExerciseUp = (index: number): void => {
    if (index > 0) {
      setEditingTemplate(prev => {
        const newExercises = [...prev.exercises];
        const temp = newExercises[index];
        newExercises[index] = newExercises[index - 1];
        newExercises[index - 1] = temp;
        return { ...prev, exercises: newExercises };
      });
    }
  };

  /**
   * Move exercise down in the list.
   * Matches js/app.js lines 625-631.
   */
  const handleMoveExerciseDown = (index: number): void => {
    setEditingTemplate(prev => {
      if (index < prev.exercises.length - 1) {
        const newExercises = [...prev.exercises];
        const temp = newExercises[index];
        newExercises[index] = newExercises[index + 1];
        newExercises[index + 1] = temp;
        return { ...prev, exercises: newExercises };
      }
      return prev;
    });
  };

  /**
   * Remove exercise from template.
   * Matches js/app.js lines 613-615.
   */
  const handleRemoveExercise = (index: number): void => {
    setEditingTemplate(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  /**
   * Add a new set to an exercise.
   * Matches js/app.js lines 633-641.
   */
  const handleAddSet = (exerciseIndex: number): void => {
    setEditingTemplate(prev => {
      const newExercises = [...prev.exercises];
      const exercise = { ...newExercises[exerciseIndex] };
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets = [
        ...exercise.sets,
        {
          set_number: exercise.sets.length + 1,
          weight: lastSet?.weight || 0,
          reps: lastSet?.reps || 10
        }
      ];
      newExercises[exerciseIndex] = exercise;
      return { ...prev, exercises: newExercises };
    });
  };

  /**
   * Remove a set from an exercise.
   * Matches js/app.js lines 643-654.
   */
  const handleRemoveSet = (exerciseIndex: number, setIndex: number): void => {
    setEditingTemplate(prev => {
      const exercise = prev.exercises[exerciseIndex];
      if (exercise.sets.length > 1) {
        const newExercises = [...prev.exercises];
        const newExercise = { ...newExercises[exerciseIndex] };
        newExercise.sets = newExercise.sets
          .filter((_, i) => i !== setIndex)
          .map((set, i) => ({ ...set, set_number: i + 1 }));
        newExercises[exerciseIndex] = newExercise;
        return { ...prev, exercises: newExercises };
      }
      return prev;
    });
  };

  /**
   * Update a set's weight or reps.
   */
  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: number
  ): void => {
    setEditingTemplate(prev => {
      const newExercises = [...prev.exercises];
      const newExercise = { ...newExercises[exerciseIndex] };
      const newSets = [...newExercise.sets];
      newSets[setIndex] = { ...newSets[setIndex], [field]: value };
      newExercise.sets = newSets;
      newExercises[exerciseIndex] = newExercise;
      return { ...prev, exercises: newExercises };
    });
  };

  /**
   * Update an exercise's rest time.
   */
  const handleUpdateRestTime = (exerciseIndex: number, seconds: number): void => {
    setEditingTemplate(prev => {
      const newExercises = [...prev.exercises];
      newExercises[exerciseIndex] = {
        ...newExercises[exerciseIndex],
        default_rest_seconds: seconds
      };
      return { ...prev, exercises: newExercises };
    });
  };

  /**
   * Open exercise picker to add a new exercise.
   * Matches js/app.js lines 538-543 (openExercisePickerForTemplate).
   */
  const handleOpenExercisePicker = (): void => {
    setShowExercisePicker(true);
  };

  /**
   * Handle selecting an exercise from the picker.
   * Matches js/app.js lines 570-590 (selectExercise for template context).
   */
  const handleSelectExercise = (exercise: Exercise): void => {
    // Check if already added
    const exists = editingTemplate.exercises.some(
      (ex) => ex.exercise_id === exercise.id
    );
    if (exists) {
      setError('Exercise already added to template');
      return;
    }

    // Add exercise with 3 default sets
    setEditingTemplate((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exercise_id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          default_rest_seconds: 90,
          sets: [
            { set_number: 1, weight: 0, reps: 10 },
            { set_number: 2, weight: 0, reps: 10 },
            { set_number: 3, weight: 0, reps: 10 },
          ],
        },
      ],
    }));

    setShowExercisePicker(false);
  };

  /**
   * Handle creating a new exercise.
   * Matches js/app.js lines 653-691 (createNewExercise).
   */
  const handleCreateExercise = async (
    name: string,
    category: string
  ): Promise<Exercise | null> => {
    try {
      const { data: newExercise, error } = await exercises.createExercise(
        name,
        category as ExerciseCategory
      );

      if (error) {
        throw new Error(error.message);
      }

      if (newExercise) {
        // Add to available exercises
        setAvailableExercises((prev) => [...prev, newExercise]);
        setSuccessMessage('Exercise created successfully');
        return newExercise;
      }

      return null;
    } catch (err) {
      setError(
        'Failed to create exercise: ' +
          (err instanceof Error ? err.message : String(err))
      );
      return null;
    }
  };

  // ==================== RENDER ====================
  // Structure matches index.html lines 415-521

  const isEditing = editingTemplate.id !== null;
  const canSave = editingTemplate.name.trim() !== '';

  return (
    <div class="template-editor-surface">
      {/* Header with Cancel button (left), title (center), Save button (right) */}
      <header class="app-header">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <div class="header-info">
          <h1 class="app-title">
            {isEditing ? 'Edit Template' : 'New Template'}
          </h1>
        </div>
        <button
          type="button"
          class="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={!canSave || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
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

      {/* Editor content */}
      <div class="editor-content">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} class="editor-form">
          {/* Template name input */}
          <div class="form-group">
            <label for="template-name">Template Name</label>
            <input
              id="template-name"
              type="text"
              value={editingTemplate.name}
              onInput={handleNameChange}
              class="input"
              placeholder="e.g., Upper Body Day"
              required
            />
          </div>

          {/* Exercises section */}
          <ExerciseList
            exercises={editingTemplate.exercises}
            onAddExercise={handleOpenExercisePicker}
            onRemove={handleRemoveExercise}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onUpdateSet={handleUpdateSet}
            onUpdateRestTime={handleUpdateRestTime}
            isSubmitting={isSubmitting}
          />
        </form>
      </div>

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        isOpen={showExercisePicker}
        exercises={availableExercises}
        excludeIds={editingTemplate.exercises.map((e) => e.exercise_id)}
        onClose={() => setShowExercisePicker(false)}
        onSelect={handleSelectExercise}
        onCreateExercise={handleCreateExercise}
      />
    </div>
  );
}

export default TemplateEditorSurface;
