/**
 * TemplateEditorSurface Component
 *
 * Container component for template creation and editing.
 * Manages editingTemplate state and save/cancel operations.
 *
 * State variables mirror the Alpine.js implementation in js/app.js lines 32-37.
 */

import { useState } from 'preact/hooks';
import type { TemplateWithExercises } from '@/types';

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
        const { error } = await window.templates.updateTemplate(
          editingTemplate.id,
          editingTemplate.name,
          editingTemplate.exercises
        );
        if (error) throw new Error(error.message);
        setSuccessMessage('Template updated successfully');
      } else {
        // Create new template
        const { error } = await window.templates.createTemplate(
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
          class="btn btn-secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <h1 class="app-title">
          {isEditing ? 'Edit Template' : 'New Template'}
        </h1>
        <button
          type="button"
          class="btn btn-primary"
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

          {/* Exercises section - placeholder for Plan 02 */}
          <div class="form-section">
            <div class="section-header">
              <h3>Exercises</h3>
              <button
                type="button"
                class="btn btn-primary"
                disabled={isSubmitting}
              >
                Add Exercise
              </button>
            </div>

            {/* Exercises list placeholder */}
            <div class="exercises-list">
              {editingTemplate.exercises.length === 0 ? (
                <div class="empty-state">
                  <p>No exercises added yet. Click "Add Exercise" to start building your template.</p>
                </div>
              ) : (
                <div class="placeholder-text">
                  {editingTemplate.exercises.length} exercise(s) in template
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TemplateEditorSurface;
