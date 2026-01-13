/**
 * TemplateCard Component
 *
 * Presentational component for displaying a single workout template.
 * Receives all state and handlers from parent TemplateList/DashboardSurface.
 *
 * Matches structure from index.html lines 344-365.
 */

import type { TemplateWithExercises } from '@/types';

/**
 * Props interface for TemplateCard component
 */
export interface TemplateCardProps {
  /** Template data to display */
  template: TemplateWithExercises;
  /** Handler for edit action */
  onEdit: (template: TemplateWithExercises) => void;
  /** Handler for delete action */
  onDelete: (id: string) => void;
  /** Handler for start workout action */
  onStartWorkout: (template: TemplateWithExercises) => void;
}

/**
 * Edit (pencil) icon SVG
 */
function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

/**
 * Delete (trash) icon SVG
 */
function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

/**
 * TemplateCard Component
 *
 * Renders a single template card with name, exercise count,
 * and action buttons (start workout, edit, delete).
 */
export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onStartWorkout,
}: TemplateCardProps) {
  /**
   * Handle edit button click
   */
  const handleEdit = () => {
    onEdit(template);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = () => {
    onDelete(template.id);
  };

  /**
   * Handle start workout button click
   */
  const handleStartWorkout = () => {
    onStartWorkout(template);
  };

  return (
    <div class="card template-card">
      <div class="template-header">
        <h3 class="template-name">{template.name}</h3>
        <span class="badge">{template.exercises.length} exercises</span>
      </div>
      <div class="template-actions">
        <button
          type="button"
          class="btn btn-primary"
          onClick={handleStartWorkout}
        >
          Start Workout
        </button>
        <button
          type="button"
          class="btn btn-icon"
          title="Edit"
          onClick={handleEdit}
        >
          <EditIcon />
        </button>
        <button
          type="button"
          class="btn btn-icon btn-danger"
          title="Delete"
          onClick={handleDelete}
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
}

export default TemplateCard;
