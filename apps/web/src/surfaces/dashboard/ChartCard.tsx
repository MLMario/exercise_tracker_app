/**
 * ChartCard Component
 *
 * Displays a single user chart with Chart.js canvas and delete functionality.
 * Uses useRef + useEffect to render chart when canvas mounts, ensuring
 * the canvas is always available before Chart.js attempts to render.
 *
 * Matches behavior from js/app.js chart rendering.
 */

import { useRef, useEffect, useState } from 'preact/hooks';
import type { Chart } from 'chart.js';
import { charts } from '@ironlift/shared';
import type { UserChart } from './DashboardSurface';

/**
 * Chart data structure for rendering
 */
export interface ChartData {
  labels: string[];
  values: number[];
}

/**
 * Props interface for ChartCard component
 */
export interface ChartCardProps {
  /** Chart configuration data */
  chart: UserChart;
  /** Chart data (labels and values) for rendering */
  chartData: ChartData | null;
  /** Handler for deleting this chart */
  onDelete: (id: string) => void;
  /** Callback when chart is rendered with its instance */
  onChartRendered?: (chartId: string, instance: Chart) => void;
  /** Callback when chart is destroyed */
  onChartDestroyed?: (chartId: string) => void;
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
 * Uses useRef to get canvas reference and useEffect to render chart
 * when canvas mounts, ensuring DOM availability.
 */
export function ChartCard({
  chart,
  chartData,
  onDelete,
  onChartRendered,
  onChartDestroyed,
}: ChartCardProps) {
  // Ref for canvas element - ensures we have DOM reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Ref for chart instance to track rendered state
  const chartInstanceRef = useRef<Chart | null>(null);
  // State to track if chart is rendered (triggers re-render to remove loading class)
  const [isRendered, setIsRendered] = useState(false);

  /**
   * Render chart when canvas mounts and chartData is available.
   * This ensures the canvas is in the DOM before Chart.js renders.
   */
  useEffect(() => {
    // Skip if no canvas or no chart data
    if (!canvasRef.current || !chartData) {
      return;
    }

    // Skip if already rendered for this data
    if (chartInstanceRef.current) {
      return;
    }

    const canvasId = `chart-${chart.id}`;

    try {
      const instance = charts.renderChart(
        canvasId,
        chartData,
        {
          metricType: chart.metric_type,
          exerciseName: chart.exercises?.name || 'Exercise'
        }
      );

      if (instance) {
        chartInstanceRef.current = instance;
        setIsRendered(true);
        if (onChartRendered) {
          onChartRendered(chart.id, instance);
        }
      }
    } catch (err) {
      // Chart render failed - leave in loading state
    }

    // Cleanup on unmount
    return () => {
      if (chartInstanceRef.current) {
        try {
          // Pass the actual Chart instance, not the canvas ID string
          charts.destroyChart(chartInstanceRef.current);
        } catch {
          // Ignore cleanup errors
        }
        chartInstanceRef.current = null;
        setIsRendered(false);
        if (onChartDestroyed) {
          onChartDestroyed(chart.id);
        }
      }
    };
  }, [chart.id, chartData, chart.metric_type, chart.exercises?.name, onChartRendered, onChartDestroyed]);

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
        {!chartData && (
          <div class="chart-loading">
            Loading chart...
          </div>
        )}

        {/* Canvas element for Chart.js - uses ref for reliable DOM access */}
        <canvas
          ref={canvasRef}
          id={`chart-${chart.id}`}
          class={isRendered ? 'chart-canvas' : 'chart-canvas loading'}
        />
      </div>
    </div>
  );
}

export default ChartCard;
