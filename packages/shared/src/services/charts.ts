/**
 * Charts Service Module
 *
 * Handles chart CRUD operations and Chart.js rendering for exercise metrics.
 * Implements ChartsService interface with TypeScript type safety.
 */

import { supabase } from '../lib/supabase';
import type {
  ServiceResult,
  ServiceError,
  UserChartData,
  CreateChartInput,
  RenderChartOptions,
  ChartData,
  ChartsService,
} from '../types';
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  Filler,
} from 'chart.js';

// Register Chart.js components (required in Chart.js v3+)
Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  Filler
);
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

// ============================================================================
// Chart CRUD Operations
// ============================================================================

/**
 * Get all charts for the current user.
 */
async function getUserCharts(): Promise<ServiceResult<UserChartData[]>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: authError || new Error('User not authenticated'),
      };
    }

    const { data, error } = await supabase
      .from('user_charts')
      .select(
        `
        id,
        user_id,
        exercise_id,
        metric_type,
        x_axis_mode,
        order,
        created_at,
        exercises (
          id,
          name,
          category
        )
      `
      )
      .eq('user_id', user.id)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching user charts:', error);
      return { data: null, error };
    }

    return { data: data as unknown as UserChartData[], error: null };
  } catch (err) {
    console.error('Unexpected error in getUserCharts:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Create a new chart.
 */
async function createChart(
  chartData: CreateChartInput
): Promise<ServiceResult<UserChartData>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: authError || new Error('User not authenticated'),
      };
    }

    // Get the current max order value
    const { data: existingCharts, error: fetchError } = await supabase
      .from('user_charts')
      .select('order')
      .eq('user_id', user.id)
      .order('order', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing charts for order:', fetchError);
      return { data: null, error: fetchError };
    }

    const nextOrder =
      existingCharts && existingCharts.length > 0
        ? existingCharts[0].order + 1
        : 0;

    // Create the new chart
    const { data, error } = await supabase
      .from('user_charts')
      .insert([
        {
          user_id: user.id,
          exercise_id: chartData.exercise_id,
          metric_type: chartData.metric_type,
          x_axis_mode: chartData.x_axis_mode,
          order: nextOrder,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating chart:', error);
      return { data: null, error };
    }

    return { data: data as UserChartData, error: null };
  } catch (err) {
    console.error('Unexpected error in createChart:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Delete a chart by ID.
 */
async function deleteChart(id: string): Promise<ServiceError> {
  try {
    const { error } = await supabase
      .from('user_charts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting chart:', error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error in deleteChart:', err);
    return { error: err as Error };
  }
}

/**
 * Reorder charts based on array position.
 */
async function reorderCharts(chartIds: string[]): Promise<ServiceError> {
  try {
    // Update each chart's order based on its position in the array
    const updates = chartIds.map((id, index) => {
      return supabase
        .from('user_charts')
        .update({ order: index })
        .eq('id', id);
    });

    // Execute all updates
    const results = await Promise.all(updates);

    // Check if any updates failed
    const errors = results.filter(
      (result: PostgrestSingleResponse<null>) => result.error
    );
    if (errors.length > 0) {
      console.error('Error reordering charts:', errors);
      return { error: errors[0].error };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error in reorderCharts:', err);
    return { error: err as Error };
  }
}

// ============================================================================
// Chart.js Rendering
// ============================================================================

/**
 * Render a Chart.js line chart.
 */
function renderChart(
  canvasId: string,
  chartData: ChartData,
  options: RenderChartOptions
): Chart | null {
  console.log(`[charts.renderChart] Called for ${canvasId}`, {
    chartData,
    options,
  });

  try {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) {
      console.error(`[charts.renderChart] Canvas element with id '${canvasId}' not found`);
      return null;
    }

    console.log(`[charts.renderChart] Canvas found for ${canvasId}:`, {
      offsetWidth: canvas.offsetWidth,
      offsetHeight: canvas.offsetHeight,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
    });

    // Check if there's an existing chart on this canvas and destroy it
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      console.log(`[charts.renderChart] Destroying existing chart on ${canvasId}`);
      existingChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[charts.renderChart] Could not get 2D context from canvas');
      return null;
    }

    const { metricType, exerciseName } = options;
    const yAxisLabel = getMetricDisplayName(metricType);

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: `${exerciseName} - ${yAxisLabel}`,
            data: chartData.values,
            borderColor: '#4f9eff',
            backgroundColor: 'rgba(79, 158, 255, 0.1)',
            pointBackgroundColor: '#4f9eff',
            pointBorderColor: '#4f9eff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#4f9eff',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#ffffff',
              font: {
                family: 'system-ui',
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#4f9eff',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              title: () => '',
              label: (context) => {
                const value = context.parsed.y;
                if (metricType === 'max_volume_set') {
                  return `${value} lbs`;
                } else if (metricType === 'total_sets') {
                  return `${value} sets`;
                }
                return String(value);
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: '#2a2a2a',
            },
            ticks: {
              color: '#ffffff',
              font: {
                family: 'system-ui',
                size: 11,
              },
              maxRotation: 45,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#2a2a2a',
            },
            ticks: {
              color: '#ffffff',
              font: {
                family: 'system-ui',
                size: 11,
              },
            },
            title: {
              display: true,
              text: yAxisLabel,
              color: '#ffffff',
              font: {
                family: 'system-ui',
                size: 12,
              },
            },
          },
        },
      },
    });

    console.log(`[charts.renderChart] Chart created successfully for ${canvasId}`, {
      chartInstance,
      canvasAfterRender: {
        width: canvas.width,
        height: canvas.height,
      },
    });

    // Force Chart.js to recalculate dimensions after browser layout completes
    // This fixes visibility issues when canvas renders before DOM is fully laid out
    requestAnimationFrame(() => {
      if (chartInstance && typeof chartInstance.resize === 'function') {
        chartInstance.resize();
      }
    });

    return chartInstance;
  } catch (err) {
    console.error('[charts.renderChart] Error rendering chart:', err);
    return null;
  }
}

/**
 * Destroy a Chart.js instance to prevent memory leaks.
 */
function destroyChart(chartInstance: Chart | null | undefined): void {
  if (chartInstance && typeof chartInstance.destroy === 'function') {
    chartInstance.destroy();
  }
}

// ============================================================================
// Display Name Helpers
// ============================================================================

/**
 * Get display name for metric type.
 */
function getMetricDisplayName(metricType: string): string {
  switch (metricType) {
    case 'total_sets':
      return 'Total Sets';
    case 'max_volume_set':
      return 'Max Volume Set (lbs)';
    default:
      return metricType;
  }
}

/**
 * Get display name for x-axis mode.
 */
function getModeDisplayName(mode: string): string {
  switch (mode) {
    case 'date':
      return 'By Date';
    case 'session':
      return 'By Session';
    default:
      return mode;
  }
}

// ============================================================================
// Service Export
// ============================================================================

/**
 * Charts service implementing ChartsService interface.
 */
export const charts: ChartsService = {
  getUserCharts,
  createChart,
  deleteChart,
  reorderCharts,
  renderChart,
  destroyChart,
  getMetricDisplayName,
  getModeDisplayName,
};

// ============================================================================
