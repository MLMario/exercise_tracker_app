/**
 * ChartSection Component
 *
 * Displays the progress charts section with grid of chart cards.
 * Handles empty state and triggers chart rendering after DOM updates.
 *
 * Matches behavior from js/app.js chart section.
 */

import { useEffect } from 'preact/hooks';
import type { Chart } from 'chart.js';
import type { UserChart } from './DashboardSurface';
import { ChartCard } from './ChartCard';

/**
 * Props interface for ChartSection component
 */
export interface ChartSectionProps {
  /** User's chart configurations */
  charts: UserChart[];
  /** Chart.js instances keyed by chart ID */
  chartInstances: Record<string, Chart>;
  /** Handler to open add chart modal */
  onAddChart: () => void;
  /** Handler to delete a chart */
  onDeleteChart: (id: string) => void;
  /** Callback to trigger chart rendering after DOM update */
  onRenderCharts: () => Promise<void>;
}

/**
 * Plus icon SVG for add button
 */
function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width="20"
      height="20"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

/**
 * ChartSection Component
 *
 * Renders the charts section with header, add button, and grid of charts.
 * Triggers chart rendering when charts array changes.
 */
export function ChartSection({
  charts,
  chartInstances,
  onAddChart,
  onDeleteChart,
  onRenderCharts,
}: ChartSectionProps) {
  /**
   * Trigger chart rendering after DOM updates.
   * This ensures canvas elements are available for Chart.js.
   */
  useEffect(() => {
    if (charts.length > 0) {
      // Use setTimeout to ensure DOM has updated
      const timerId = setTimeout(() => {
        onRenderCharts();
      }, 0);

      return () => clearTimeout(timerId);
    }
  }, [charts]);

  return (
    <section class="charts-section">
      {/* Section header with title and add button */}
      <div class="section-header">
        <h2>Progress Charts</h2>
        <button
          type="button"
          class="btn btn-secondary btn-icon"
          onClick={onAddChart}
          aria-label="Add new chart"
        >
          <PlusIcon />
          <span>Add Chart</span>
        </button>
      </div>

      {/* Empty state message */}
      {charts.length === 0 && (
        <div class="empty-state">
          <p>No charts configured yet.</p>
          <p>Add a chart to track your progress on an exercise.</p>
        </div>
      )}

      {/* Chart cards grid */}
      {charts.length > 0 && (
        <div class="charts-grid">
          {charts.map((chart) => (
            <ChartCard
              key={chart.id}
              chart={chart}
              chartInstance={chartInstances[chart.id] || null}
              onDelete={onDeleteChart}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ChartSection;
