/**
 * DashboardSurface Component
 *
 * Container component for the main dashboard view after authentication.
 * Manages templates, exercises, and charts data.
 *
 * State variables mirror the Alpine.js implementation in js/app.js lines 25-30.
 */

import { useState, useEffect, useRef } from 'preact/hooks';
import type { Chart } from 'chart.js';
import type { Exercise, TemplateWithExercises } from '@/types';
import { TemplateList } from './TemplateList';
import { ChartSection } from './ChartSection';
import { AddChartModal } from './AddChartModal';

/**
 * UserChart type for chart configuration.
 * Matches the structure returned by window.charts.getUserCharts().
 */
export interface UserChart {
  id: string;
  user_id: string;
  exercise_id: string;
  metric_type: 'total_sets' | 'max_volume_set';
  x_axis_mode: 'date' | 'session';
  order: number;
  created_at: string;
  exercises: {
    id: string;
    name: string;
    category: string;
  };
}

/**
 * Props for DashboardSurface component.
 */
interface DashboardSurfaceProps {
  /** Callback to navigate back to auth surface (logout) */
  onLogout?: () => void;
  /** Callback to navigate to template editor with existing template */
  onEditTemplate?: (template: TemplateWithExercises) => void;
  /** Callback to navigate to template editor for new template */
  onCreateNewTemplate?: () => void;
}

/**
 * DashboardSurface container component
 *
 * Manages dashboard data state and loading.
 * Will render template list, charts, and provide workout functionality.
 */
export function DashboardSurface({ onLogout, onEditTemplate, onCreateNewTemplate }: DashboardSurfaceProps) {
  // ==================== DASHBOARD STATE ====================
  // Mirrors js/app.js lines 25-30 state variables

  // Templates list - fetched from templates service
  const [templates, setTemplates] = useState<TemplateWithExercises[]>([]);

  // User charts configuration - fetched from charts service
  const [userCharts, setUserCharts] = useState<UserChart[]>([]);

  // Available exercises - fetched from exercises service
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

  // Flag to control when charts need to reload
  const [chartsNeedRefresh, setChartsNeedRefresh] = useState(true);

  // Chart.js instances keyed by chart ID - stored in ref to avoid re-renders
  const chartInstancesRef = useRef<Record<string, Chart>>({});
  // State version of chartInstances for rendering - updated after rendering
  const [chartInstances, setChartInstances] = useState<Record<string, Chart>>({});

  // Modal state for add chart
  const [showAddChartModal, setShowAddChartModal] = useState(false);

  // Modal state for delete chart confirmation
  const [showDeleteChartModal, setShowDeleteChartModal] = useState(false);
  const [pendingDeleteChartId, setPendingDeleteChartId] = useState<string | null>(null);

  // Chart modal error
  const [chartError, setChartError] = useState('');

  // Loading state for initial data fetch
  const [isLoading, setIsLoading] = useState(true);

  // Error message display
  const [error, setError] = useState('');

  // Success message display
  const [successMessage, setSuccessMessage] = useState('');

  // ==================== DATA LOADING ====================
  // Matches js/app.js lines 341-391

  /**
   * Load templates from the templates service.
   * Matches js/app.js lines 361-369.
   */
  const loadTemplates = async (): Promise<void> => {
    const { data, error } = await window.templates.getTemplates();
    if (error) throw new Error('Failed to load templates: ' + error.message);
    setTemplates(data || []);
  };

  /**
   * Load exercises from the exercises service.
   * Matches js/app.js lines 371-379.
   */
  const loadExercises = async (): Promise<void> => {
    const { data, error } = await window.exercises.getExercises();
    if (error) throw new Error('Failed to load exercises: ' + error.message);
    setAvailableExercises(data || []);
  };

  // ==================== CHART DATA LOADING ====================
  // Matches js/app.js lines 381-440

  /**
   * Load user charts from the charts service.
   * Matches js/app.js lines 381-392.
   */
  const loadUserCharts = async (): Promise<void> => {
    try {
      const { data, error } = await window.charts.getUserCharts();
      if (error) throw new Error(error.message);
      setUserCharts(data || []);
    } catch (err) {
      throw new Error('Failed to load charts: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  /**
   * Destroy all Chart.js instances to prevent memory leaks.
   * Matches js/app.js lines 433-440.
   */
  const destroyAllCharts = (): void => {
    Object.values(chartInstancesRef.current).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    chartInstancesRef.current = {};
    setChartInstances({});
  };

  /**
   * Render all charts using Chart.js.
   * Matches js/app.js lines 394-431.
   */
  const renderAllCharts = async (): Promise<void> => {
    // Destroy existing chart instances first
    destroyAllCharts();

    const newInstances: Record<string, Chart> = {};

    for (const chart of userCharts) {
      try {
        const canvasId = `chart-${chart.id}`;
        const canvas = document.getElementById(canvasId);

        if (!canvas) {
          console.warn(`Canvas not found for chart ${chart.id}`);
          continue;
        }

        const { data: chartData, error } = await window.logging.getExerciseMetrics(
          chart.exercise_id,
          { metric: chart.metric_type, mode: chart.x_axis_mode }
        );

        if (error) {
          console.error(`Failed to get metrics for chart ${chart.id}:`, error);
          continue;
        }

        if (chartData) {
          const chartInstance = window.charts.renderChart(
            canvasId,
            chartData,
            {
              metricType: chart.metric_type,
              exerciseName: chart.exercises?.name || 'Exercise'
            }
          );

          if (chartInstance) {
            newInstances[chart.id] = chartInstance;
          }
        }
      } catch (err) {
        console.error(`Failed to render chart ${chart.id}:`, err);
      }
    }

    chartInstancesRef.current = newInstances;
    setChartInstances({ ...newInstances });
  };

  /**
   * Load all dashboard data (templates and exercises in parallel).
   * Matches js/app.js lines 343-359.
   */
  const loadDashboard = async (): Promise<void> => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await Promise.all([
        loadTemplates(),
        loadExercises(),
        loadUserCharts(),
      ]);
      setChartsNeedRefresh(false);
    } catch (err) {
      setError('Failed to load dashboard: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== TEMPLATE ACTIONS ====================
  // Matches js/app.js lines 444-536, 695-730

  /**
   * Handle create new template action.
   * Navigates to template editor surface (new template).
   * Matches js/app.js lines 444-453.
   */
  const handleCreateNewTemplate = (): void => {
    setError('');
    setSuccessMessage('');
    if (onCreateNewTemplate) {
      onCreateNewTemplate();
    }
  };

  /**
   * Handle edit template action.
   * Navigates to template editor surface with existing template.
   * Matches js/app.js lines 455-467.
   */
  const handleEditTemplate = (template: TemplateWithExercises): void => {
    setError('');
    setSuccessMessage('');
    if (onEditTemplate) {
      onEditTemplate(template);
    }
  };

  /**
   * Handle delete template action.
   * Confirms deletion and calls templates service.
   * Matches js/app.js lines 511-527.
   */
  const handleDeleteTemplate = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    setError('');
    setSuccessMessage('');

    try {
      const { error } = await window.templates.deleteTemplate(id);
      if (error) throw new Error(error.message);
      setSuccessMessage('Template deleted successfully');
      // Reload templates after successful delete
      await loadTemplates();
    } catch (err) {
      setError('Failed to delete template: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  /**
   * Handle start workout action.
   * Navigates to workout surface with the selected template.
   * Matches js/app.js lines 695-730.
   */
  const handleStartWorkout = (template: TemplateWithExercises): void => {
    // Navigation will be wired to surface navigation in Phase 12
    console.log('Navigate to workout surface', template.id);
    setError('');
    setSuccessMessage('');
  };

  // ==================== CHART MODAL HANDLERS ====================
  // Matches js/app.js lines 1196-1283

  /**
   * Open the add chart modal.
   * Matches js/app.js lines 1198-1207.
   */
  const openAddChartModal = (): void => {
    setShowAddChartModal(true);
    setChartError('');
    setError('');
    setSuccessMessage('');
  };

  /**
   * Close the add chart modal.
   * Matches js/app.js lines 1209-1216.
   */
  const closeAddChartModal = (): void => {
    setShowAddChartModal(false);
    setChartError('');
  };

  /**
   * Handle chart creation.
   * Matches js/app.js lines 1218-1251.
   */
  const handleCreateChart = async (
    exerciseId: string,
    metricType: string,
    xAxisMode: string
  ): Promise<void> => {
    setChartError('');

    if (!exerciseId) {
      setChartError('Please select an exercise');
      return;
    }

    if (!metricType) {
      setChartError('Please select a metric type');
      return;
    }

    if (!xAxisMode) {
      setChartError('Please select an x-axis mode');
      return;
    }

    try {
      const { error } = await window.charts.createChart({
        exercise_id: exerciseId,
        metric_type: metricType,
        x_axis_mode: xAxisMode
      });

      if (error) throw new Error(error.message);

      closeAddChartModal();
      await loadUserCharts();
    } catch (err) {
      setChartError('Failed to add chart: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  /**
   * Handle delete chart button click.
   * Opens confirmation modal.
   * Matches js/app.js lines 1253-1256.
   */
  const handleDeleteChart = (id: string): void => {
    setPendingDeleteChartId(id);
    setShowDeleteChartModal(true);
  };

  /**
   * Dismiss the delete chart confirmation modal.
   * Matches js/app.js lines 1258-1261.
   */
  const dismissDeleteChartModal = (): void => {
    setShowDeleteChartModal(false);
    setPendingDeleteChartId(null);
  };

  /**
   * Confirm chart deletion.
   * Matches js/app.js lines 1263-1283.
   */
  const confirmDeleteChart = async (): Promise<void> => {
    const id = pendingDeleteChartId;
    setShowDeleteChartModal(false);
    setPendingDeleteChartId(null);

    if (!id) return;

    setError('');
    try {
      // Destroy chart instance
      if (chartInstancesRef.current[id]) {
        chartInstancesRef.current[id].destroy();
        delete chartInstancesRef.current[id];
        setChartInstances({ ...chartInstancesRef.current });
      }

      const { error } = await window.charts.deleteChart(id);
      if (error) throw new Error(error.message);

      await loadUserCharts();
    } catch (err) {
      setError('Failed to remove chart: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    // Load dashboard data on component mount
    loadDashboard();

    // Cleanup chart instances on unmount
    return () => {
      destroyAllCharts();
    };
  }, []);

  // ==================== RENDER ====================
  // Structure matches expected sections for dashboard

  return (
    <div class="dashboard-surface-container">
      {/* Header with logout button */}
      <header class="dashboard-header">
        <h1>Exercise Tracker</h1>
        {onLogout && (
          <button
            class="logout-btn"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        )}
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

      {/* Loading indicator */}
      {isLoading && (
        <div class="loading-indicator">
          Loading dashboard...
        </div>
      )}

      {/* Main content - only show when not loading */}
      {!isLoading && (
        <main class="dashboard-content">
          {/* Template list section */}
          <TemplateList
            templates={templates}
            onCreateNew={handleCreateNewTemplate}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onStartWorkout={handleStartWorkout}
          />

          {/* Charts section */}
          <ChartSection
            charts={userCharts}
            chartInstances={chartInstances}
            onAddChart={openAddChartModal}
            onDeleteChart={handleDeleteChart}
            onRenderCharts={renderAllCharts}
          />

          {/* Exercises info - placeholder */}
          <section class="exercises-info">
            <p class="placeholder-text">
              {availableExercises.length} exercise(s) available
            </p>
          </section>
        </main>
      )}

      {/* Add Chart Modal */}
      <AddChartModal
        isOpen={showAddChartModal}
        exercises={availableExercises}
        onClose={closeAddChartModal}
        onSubmit={handleCreateChart}
        error={chartError}
      />

      {/* Delete Chart Confirmation Modal */}
      {showDeleteChartModal && (
        <div class="modal-overlay" onClick={dismissDeleteChartModal}>
          <div class="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h2>Delete Chart</h2>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete this chart?</p>
            </div>
            <div class="modal-actions">
              <button
                type="button"
                class="btn btn-secondary"
                onClick={dismissDeleteChartModal}
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-danger"
                onClick={confirmDeleteChart}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardSurface;
