/**
 * ChartCard Component
 *
 * Displays a single user chart with Chart.js canvas and delete functionality.
 * The canvas element is provided for Chart.js to render into.
 *
 * Matches behavior from js/app.js chart rendering.
 */

import type { Chart } from 'chart.js';
import type { UserChart } from './DashboardSurface';

/**
 * Props interface for ChartCard component
 */
export interface ChartCardProps {
  /** Chart configuration data */
  chart: UserChart;
  /** The rendered Chart.js instance (null while loading) */
  chartInstance: Chart | null;
  /** Handler for deleting this chart */
  onDelete: (id: string) => void;
}

/**
 * Trash icon SVG for delete button
 */
function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width="16"
      height="16"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

/**
 * Format metric type for display
 */
function formatMetricType(metricType: string): string {
  switch (metricType) {
    case 'max_weight':
      return 'Max Weight';
    case 'max_volume_set':
      return 'Max Volume';
    case 'total_sets':
      return 'Total Sets';
    default:
      return metricType;
  }
}

/**
 * ChartCard Component
 *
 * Renders a chart card with title, canvas element, and delete button.
 * The canvas is used by Chart.js to render the chart.
 */
export function ChartCard({
  chart,
  chartInstance,
  onDelete,
}: ChartCardProps) {
  /**
   * Handle delete button click
   */
  const handleDeleteClick = () => {
    onDelete(chart.id);
  };

  // Build chart title from exercise name and metric type
  const exerciseName = chart.exercises?.name || 'Exercise';
  const metricLabel = formatMetricType(chart.metric_type);
  const chartTitle = `${exerciseName} - ${metricLabel}`;

  return (
    <div class="chart-card">
      {/* Chart header with title and delete button */}
      <div class="chart-card-header">
        <h3 class="chart-card-title">{chartTitle}</h3>
        <button
          type="button"
          class="chart-delete-btn"
          onClick={handleDeleteClick}
          aria-label={`Delete ${chartTitle} chart`}
        >
          <TrashIcon />
        </button>
      </div>

      {/* Chart canvas container */}
      <div class="chart-card-content">
        {/* Loading indicator when chart not yet rendered */}
        {!chartInstance && (
          <div class="chart-loading">
            Loading chart...
          </div>
        )}

        {/* Canvas element for Chart.js - always rendered for DOM availability */}
        <canvas
          id={`chart-${chart.id}`}
          class={chartInstance ? 'chart-canvas' : 'chart-canvas loading'}
        />
      </div>
    </div>
  );
}

export default ChartCard;
