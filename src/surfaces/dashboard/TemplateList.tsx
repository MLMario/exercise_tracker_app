/**
 * TemplateList Component
 *
 * Presentational component for displaying the list of workout templates.
 * Receives all state and handlers from parent DashboardSurface.
 *
 * Matches structure from index.html lines 335-372.
 */

import type { TemplateWithExercises } from '@/types';
import { TemplateCard } from './TemplateCard';

/**
 * Props interface for TemplateList component
 */
export interface TemplateListProps {
  /** Array of templates to display */
  templates: TemplateWithExercises[];
  /** Handler for creating a new template */
  onCreateNew: () => void;
  /** Handler for editing a template */
  onEdit: (template: TemplateWithExercises) => void;
  /** Handler for deleting a template */
  onDelete: (id: string) => void;
  /** Handler for starting a workout from a template */
  onStartWorkout: (template: TemplateWithExercises) => void;
}

/**
 * TemplateList Component
 *
 * Renders the template section with header, create button,
 * grid of template cards, and empty state.
 */
export function TemplateList({
  templates,
  onCreateNew,
  onEdit,
  onDelete,
  onStartWorkout,
}: TemplateListProps) {
  return (
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">My Templates</h2>
        <button
          type="button"
          class="btn btn-primary"
          onClick={onCreateNew}
        >
          Create Template
        </button>
      </div>

      {/* Template grid */}
      {templates.length > 0 && (
        <div class="templates-grid">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={onEdit}
              onDelete={onDelete}
              onStartWorkout={onStartWorkout}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {templates.length === 0 && (
        <div class="empty-state">
          <p>No templates yet. Create your first workout template to get started!</p>
        </div>
      )}
    </section>
  );
}

export default TemplateList;
