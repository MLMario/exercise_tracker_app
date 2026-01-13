/**
 * DashboardSurface Component
 *
 * Container component for the main dashboard view after authentication.
 * Manages templates, exercises, and charts data.
 *
 * State variables mirror the Alpine.js implementation in js/app.js lines 25-30.
 */

import { useState, useEffect } from 'preact/hooks';
import type { Exercise, TemplateWithExercises } from '@/types';

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
}

/**
 * DashboardSurface container component
 *
 * Manages dashboard data state and loading.
 * Will render template list, charts, and provide workout functionality.
 */
export function DashboardSurface({ onLogout }: DashboardSurfaceProps) {
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

  // Loading state for initial data fetch
  const [isLoading, setIsLoading] = useState(true);

  // Error message display
  const [error, setError] = useState('');

  // Success message display
  const [successMessage, setSuccessMessage] = useState('');

  // ==================== PLACEHOLDER RENDER ====================
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
          {/* Template list section - placeholder */}
          <section class="templates-section">
            <h2>Workout Templates</h2>
            <p class="placeholder-text">
              {templates.length} template(s) loaded
            </p>
            {/* Template list will be implemented in later plans */}
          </section>

          {/* Charts section - placeholder */}
          <section class="charts-section">
            <h2>Progress Charts</h2>
            <p class="placeholder-text">
              {userCharts.length} chart(s) configured
            </p>
            {/* Charts will be implemented in later plans */}
          </section>

          {/* Exercises info - placeholder */}
          <section class="exercises-info">
            <p class="placeholder-text">
              {availableExercises.length} exercise(s) available
            </p>
          </section>
        </main>
      )}
    </div>
  );
}

export default DashboardSurface;
