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
 * Edit (pencil) icon SVG - 12x12 for mini cards
 */
function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
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
 * Delete (trash) icon SVG - 12x12 for mini cards
 */
function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
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
 * Renders a compact mini-card with template name, edit/delete icons,
 * and a full-width Start button. Uses mini-grid layout styling.
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
    <div class="template-mini-card">
      <div class="template-mini-header">
        <span class="template-mini-name">{template.name}</span>
        <div class="template-mini-header-actions">
          <button
            type="button"
            class="btn-icon-xs"
            title="Edit"
            onClick={handleEdit}
          >
            <EditIcon />
          </button>
          <button
            type="button"
            class="btn-icon-xs btn-danger"
            title="Delete"
            onClick={handleDelete}
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
      <div class="template-mini-actions">
        <button
          type="button"
          class="btn btn-primary btn-xs"
          onClick={handleStartWorkout}
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default TemplateCard;
