/**
 * DashboardSurface Component
 *
 * Container component for the main dashboard view after authentication.
 * Manages templates, exercises, and charts data.
 *
 * State variables mirror the Alpine.js implementation in js/app.js lines 25-30.
 */

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import type { Chart } from 'chart.js';
import type { Exercise, TemplateWithExercises } from '@ironlift/shared';
import { exercises, templates, logging, charts } from '@ironlift/shared';
import { TemplateList } from './TemplateList';
import { ChartSection } from './ChartSection';
import { AddChartModal } from './AddChartModal';
import { ConfirmationModal } from '@/components';
import { useAsyncOperation } from '@/hooks';
import type { ChartData } from './ChartCard';

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
  /** Callback to navigate to workout surface with a template */
  onStartWorkout?: (template: TemplateWithExercises) => void;
}

/**
 * DashboardSurface container component
 *
 * Manages dashboard data state and loading.
 * Will render template list, charts, and provide workout functionality.
 */
export function DashboardSurface({ onLogout, onEditTemplate, onCreateNewTemplate, onStartWorkout }: DashboardSurfaceProps) {
  // ==================== DASHBOARD STATE ====================
  // Mirrors js/app.js lines 25-30 state variables

  // Templates list - fetched from templates service
  const [templatesList, setTemplatesList] = useState<TemplateWithExercises[]>([]);

  // User charts configuration - fetched from charts service
  const [userCharts, setUserCharts] = useState<UserChart[]>([]);

  // Available exercises - fetched from exercises service
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

  // Flag to control when charts need to reload
  const [chartsNeedRefresh, setChartsNeedRefresh] = useState(true);

  // Chart.js instances keyed by chart ID - stored in ref to avoid re-renders
  const chartInstancesRef = useRef<Record<string, Chart>>({});

  // Chart data (labels/values) keyed by chart ID - fetched upfront for each chart
  const [chartDataMap, setChartDataMap] = useState<Record<string, ChartData | null>>({});

  // Modal state for add chart
  const [showAddChartModal, setShowAddChartModal] = useState(false);

  // Modal state for delete chart confirmation
  const [showDeleteChartModal, setShowDeleteChartModal] = useState(false);
  const [pendingDeleteChartId, setPendingDeleteChartId] = useState<string | null>(null);

  // Modal state for delete template confirmation
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
  const [pendingDeleteTemplateId, setPendingDeleteTemplateId] = useState<string | null>(null);

  // Chart modal error (kept separate - modal-scoped)
  const [chartError, setChartError] = useState('');

  // Async operation state for dashboard operations
  const {
    error,
    successMessage,
    isLoading,
    setError,
    setSuccess: setSuccessMessage,
    clearMessages,
    execute
  } = useAsyncOperation({ initialLoading: true });

  // ==================== DATA LOADING ====================
  // Matches js/app.js lines 341-391

  /**
   * Load templates from the templates service.
   * Matches js/app.js lines 361-369.
   */
  const loadTemplates = async (): Promise<void> => {
    const { data, error } = await templates.getTemplates();
    if (error) throw new Error('Failed to load templates: ' + error.message);
    setTemplatesList(data || []);
  };

  /**
   * Load exercises from the exercises service.
   * Matches js/app.js lines 371-379.
   */
  const loadExercises = async (): Promise<void> => {
    const { data, error } = await exercises.getExercises();
    if (error) throw new Error('Failed to load exercises: ' + error.message);
    setAvailableExercises(data || []);
  };

  // ==================== CHART DATA LOADING ====================
  // Matches js/app.js lines 381-440

  /**
   * Load user charts from the charts service and fetch metrics data for each.
   * Matches js/app.js lines 381-392.
   */
  const loadUserCharts = async (): Promise<void> => {
    try {
      const { data, error } = await charts.getUserCharts();
      if (error) throw new Error(error.message);

      const chartsData = data || [];
      setUserCharts(chartsData);

      // Fetch chart data for each chart upfront
      const dataMap: Record<string, ChartData | null> = {};

      for (const chart of chartsData) {
        try {
          const { data: metricsData, error: metricsError } = await logging.getExerciseMetrics(
            chart.exercise_id,
            { metric: chart.metric_type, mode: chart.x_axis_mode }
          );

          if (metricsError) {
            dataMap[chart.id] = null;
          } else {
            dataMap[chart.id] = metricsData || null;
          }
        } catch {
          dataMap[chart.id] = null;
        }
      }

      setChartDataMap(dataMap);
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
  };

  /**
   * Callback when a ChartCard renders its chart.
   * Registers the instance for tracking.
   */
  const handleChartRendered = useCallback((chartId: string, instance: Chart): void => {
    chartInstancesRef.current[chartId] = instance;
  }, []);

  /**
   * Callback when a ChartCard destroys its chart.
   * Removes the instance from tracking.
   */
  const handleChartDestroyed = useCallback((chartId: string): void => {
    delete chartInstancesRef.current[chartId];
  }, []);

  /**
   * Load all dashboard data (templates and exercises in parallel).
   * Matches js/app.js lines 343-359.
   */
  const loadDashboard = async (): Promise<void> => {
    await execute(async () => {
      await Promise.all([
        loadTemplates(),
        loadExercises(),
        loadUserCharts(),
      ]);
      setChartsNeedRefresh(false);
      return true;
    });
  };

  // ==================== TEMPLATE ACTIONS ====================
  // Matches js/app.js lines 444-536, 695-730

  /**
   * Handle create new template action.
   * Navigates to template editor surface (new template).
   * Matches js/app.js lines 444-453.
   */
  const handleCreateNewTemplate = (): void => {
    clearMessages();
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
    clearMessages();
    if (onEditTemplate) {
      onEditTemplate(template);
    }
  };

  /**
   * Handle delete template action.
   * Opens confirmation modal.
   * Matches js/app.js lines 511-527.
   */
  const handleDeleteTemplate = (id: string): void => {
    setPendingDeleteTemplateId(id);
    setShowDeleteTemplateModal(true);
  };

  /**
   * Dismiss the delete template confirmation modal.
   */
  const dismissDeleteTemplateModal = (): void => {
    setShowDeleteTemplateModal(false);
    setPendingDeleteTemplateId(null);
  };

  /**
   * Confirm template deletion.
   */
  const confirmDeleteTemplate = async (): Promise<void> => {
    const id = pendingDeleteTemplateId;
    setShowDeleteTemplateModal(false);
    setPendingDeleteTemplateId(null);

    if (!id) return;

    await execute(async () => {
      const { error: deleteError } = await templates.deleteTemplate(id);
      if (deleteError) throw new Error(deleteError.message);
      // Reload templates after successful delete
      await loadTemplates();
      return true;
    }, {
      successMessage: 'Template deleted successfully'
    });
  };

  /**
   * Handle start workout action.
   * Navigates to workout surface with the selected template.
   * Matches js/app.js lines 695-730.
   */
  const handleStartWorkout = (template: TemplateWithExercises): void => {
    clearMessages();
    if (onStartWorkout) {
      onStartWorkout(template);
    }
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
    clearMessages();
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
      const { error } = await charts.createChart({
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

    await execute(async () => {
      // Destroy chart instance
      if (chartInstancesRef.current[id]) {
        chartInstancesRef.current[id].destroy();
        delete chartInstancesRef.current[id];
      }

      // Remove chart data from map
      setChartDataMap(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      const { error: deleteError } = await charts.deleteChart(id);
      if (deleteError) throw new Error(deleteError.message);

      await loadUserCharts();
      return true;
    });
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
        <span class="brand-logo">
          <span class="iron">Iron</span>
          <span class="factor">Factor</span>
        </span>
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
            templates={templatesList}
            onCreateNew={handleCreateNewTemplate}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onStartWorkout={handleStartWorkout}
          />

          {/* Charts section */}
          <ChartSection
            charts={userCharts}
            chartDataMap={chartDataMap}
            onAddChart={openAddChartModal}
            onDeleteChart={handleDeleteChart}
            onChartRendered={handleChartRendered}
            onChartDestroyed={handleChartDestroyed}
          />
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

      {/* Delete Template Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteTemplateModal}
        title="Delete Template"
        message="Are you sure you want to delete this template?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDeleteTemplate}
        onCancel={dismissDeleteTemplateModal}
      />
    </div>
  );
}

export default DashboardSurface;
