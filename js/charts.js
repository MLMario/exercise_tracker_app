/**
 * Charts Management Module
 * Handles chart CRUD operations and Chart.js rendering for exercise metrics
 */

/**
 * Get all charts for the current user
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
async function getUserCharts() {
  try {
    const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') };
    }

    const { data, error } = await window.supabaseClient
      .from('user_charts')
      .select(`
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
      `)
      .eq('user_id', user.id)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching user charts:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in getUserCharts:', err);
    return { data: null, error: err };
  }
}

/**
 * Create a new chart
 * @param {string} exerciseId - UUID of the exercise
 * @param {string} metricType - 'total_sets' or 'max_volume'
 * @param {string} xAxisMode - 'date' or 'session'
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
async function createChart(exerciseId, metricType, xAxisMode) {
  try {
    const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') };
    }

    // Get the current max order value
    const { data: existingCharts, error: fetchError } = await window.supabaseClient
      .from('user_charts')
      .select('order')
      .eq('user_id', user.id)
      .order('order', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing charts for order:', fetchError);
      return { data: null, error: fetchError };
    }

    const nextOrder = existingCharts && existingCharts.length > 0
      ? existingCharts[0].order + 1
      : 0;

    // Create the new chart
    const { data, error } = await window.supabaseClient
      .from('user_charts')
      .insert([{
        user_id: user.id,
        exercise_id: exerciseId,
        metric_type: metricType,
        x_axis_mode: xAxisMode,
        order: nextOrder
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating chart:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in createChart:', err);
    return { data: null, error: err };
  }
}

/**
 * Delete a chart by ID
 * @param {string} id - UUID of the chart to delete
 * @returns {Promise<{error: Error|null}>}
 */
async function deleteChart(id) {
  try {
    const { error } = await window.supabaseClient
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
    return { error: err };
  }
}

/**
 * Reorder charts based on array position
 * @param {Array<string>} chartIds - Array of chart UUIDs in desired order
 * @returns {Promise<{error: Error|null}>}
 */
async function reorderCharts(chartIds) {
  try {
    // Update each chart's order based on its position in the array
    const updates = chartIds.map((id, index) => {
      return window.supabaseClient
        .from('user_charts')
        .update({ order: index })
        .eq('id', id);
    });

    // Execute all updates
    const results = await Promise.all(updates);

    // Check if any updates failed
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error reordering charts:', errors);
      return { error: errors[0].error };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error in reorderCharts:', err);
    return { error: err };
  }
}

/**
 * Render a Chart.js line chart
 * @param {string} canvasId - ID of the canvas element
 * @param {Object} chartData - { labels: Array, values: Array }
 * @param {Object} options - { metricType: string, exerciseName: string }
 * @returns {Chart|null} Chart.js instance or null if error
 */
function renderChart(canvasId, chartData, options) {
  try {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Canvas element with id '${canvasId}' not found`);
      return null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return null;
    }

    const { metricType, exerciseName } = options;
    const yAxisLabel = getMetricDisplayName(metricType);

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
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
          tension: 0.4
        }]
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
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#4f9eff',
            borderWidth: 1,
            padding: 10,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: {
              color: '#2a2a2a',
              drawBorder: false
            },
            ticks: {
              color: '#ffffff',
              font: {
                family: 'system-ui',
                size: 11
              },
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#2a2a2a',
              drawBorder: false
            },
            ticks: {
              color: '#ffffff',
              font: {
                family: 'system-ui',
                size: 11
              }
            },
            title: {
              display: true,
              text: yAxisLabel,
              color: '#ffffff',
              font: {
                family: 'system-ui',
                size: 12
              }
            }
          }
        }
      }
    });

    return chartInstance;
  } catch (err) {
    console.error('Error rendering chart:', err);
    return null;
  }
}

/**
 * Destroy a Chart.js instance to prevent memory leaks
 * @param {Chart} chartInstance - The Chart.js instance to destroy
 */
function destroyChart(chartInstance) {
  if (chartInstance && typeof chartInstance.destroy === 'function') {
    chartInstance.destroy();
  }
}

/**
 * Get display name for metric type
 * @param {string} metricType - 'total_sets' or 'max_volume'
 * @returns {string} Display name
 */
function getMetricDisplayName(metricType) {
  switch (metricType) {
    case 'total_sets':
      return 'Total Sets';
    case 'max_volume':
      return 'Max Volume (lbs)';
    default:
      return metricType;
  }
}

/**
 * Get display name for x-axis mode
 * @param {string} mode - 'date' or 'session'
 * @returns {string} Display name
 */
function getModeDisplayName(mode) {
  switch (mode) {
    case 'date':
      return 'By Date';
    case 'session':
      return 'By Session';
    default:
      return mode;
  }
}

// Export all functions to window.charts namespace
window.charts = {
  getUserCharts,
  createChart,
  deleteChart,
  reorderCharts,
  renderChart,
  destroyChart,
  getMetricDisplayName,
  getModeDisplayName
};
