/**
 * AddChartModal Component
 *
 * Modal dialog for adding a new progress chart.
 * Allows selecting exercise, metric type, and x-axis mode.
 *
 * Matches behavior from js/app.js openAddChartModal and createChart methods.
 */

import { useState, useEffect } from 'preact/hooks';
import type { JSX } from 'preact';
import type { Exercise } from '@ironlift/shared';

/**
 * Props interface for AddChartModal component
 */
export interface AddChartModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Available exercises for selection */
  exercises: Exercise[];
  /** Handler to close the modal */
  onClose: () => void;
  /** Handler for form submission */
  onSubmit: (exerciseId: string, metricType: string, xAxisMode: string) => void;
  /** Error message to display */
  error: string;
}

/**
 * Metric type options for chart configuration
 */
const METRIC_TYPE_OPTIONS = [
  { value: 'max_volume_set', label: 'Max Volume (per set)' },
  { value: 'total_sets', label: 'Total Sets' },
];

/**
 * X-axis mode options for chart configuration
 */
const X_AXIS_MODE_OPTIONS = [
  { value: 'date', label: 'By Date' },
  { value: 'session', label: 'By Session' },
];

/**
 * AddChartModal Component
 *
 * Renders a modal with form for configuring a new chart.
 * Includes exercise dropdown, metric type, and x-axis mode selection.
 */
export function AddChartModal({
  isOpen,
  exercises,
  onClose,
  onSubmit,
  error,
}: AddChartModalProps) {
  // Form state
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [selectedMetricType, setSelectedMetricType] = useState('');
  const [selectedXAxisMode, setSelectedXAxisMode] = useState('');

  /**
   * Reset form state when modal opens
   */
  useEffect(() => {
    if (isOpen) {
      setSelectedExerciseId('');
      setSelectedMetricType('');
      setSelectedXAxisMode('');
    }
  }, [isOpen]);

  /**
   * Handle form submission
   */
  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(selectedExerciseId, selectedMetricType, selectedXAxisMode);
  };

  /**
   * Handle exercise selection change
   */
  const handleExerciseChange = (e: JSX.TargetedEvent<HTMLSelectElement>) => {
    setSelectedExerciseId(e.currentTarget.value);
  };

  /**
   * Handle metric type selection change
   */
  const handleMetricTypeChange = (e: JSX.TargetedEvent<HTMLSelectElement>) => {
    setSelectedMetricType(e.currentTarget.value);
  };

  /**
   * Handle x-axis mode selection change
   */
  const handleXAxisModeChange = (e: JSX.TargetedEvent<HTMLSelectElement>) => {
    setSelectedXAxisMode(e.currentTarget.value);
  };

  /**
   * Handle click on modal overlay (close modal)
   */
  const handleOverlayClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    // Only close if clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Sort exercises by category then name for better UX
  const sortedExercises = [...exercises].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div class="modal-overlay" onClick={handleOverlayClick}>
      <div class="modal-content add-chart-modal">
        {/* Modal header */}
        <div class="modal-header">
          <h2>Add Progress Chart</h2>
          <button
            type="button"
            class="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Modal body with form */}
        <form onSubmit={handleSubmit}>
          {/* Error message display */}
          {error && <div class="error-message">{error}</div>}

          {/* Exercise selection */}
          <div class="form-group">
            <label for="chart-exercise">Exercise</label>
            <select
              id="chart-exercise"
              class="input"
              value={selectedExerciseId}
              onChange={handleExerciseChange}
              required
            >
              <option value="">Select an exercise...</option>
              {sortedExercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} ({exercise.category})
                </option>
              ))}
            </select>
          </div>

          {/* Metric type selection */}
          <div class="form-group">
            <label for="chart-metric">Metric Type</label>
            <select
              id="chart-metric"
              class="input"
              value={selectedMetricType}
              onChange={handleMetricTypeChange}
              required
            >
              <option value="">Select a metric...</option>
              {METRIC_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* X-axis mode selection */}
          <div class="form-group">
            <label for="chart-xaxis">X-Axis Mode</label>
            <select
              id="chart-xaxis"
              class="input"
              value={selectedXAxisMode}
              onChange={handleXAxisModeChange}
              required
            >
              <option value="">Select x-axis mode...</option>
              {X_AXIS_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Form actions */}
          <div class="modal-actions">
            <button
              type="button"
              class="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
            >
              Add Chart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddChartModal;
