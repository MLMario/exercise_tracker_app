/**
 * RestTimerBar Component
 *
 * Presentational component for the rest timer display.
 * Shows a progress bar with countdown time and +/-10s adjustment controls.
 *
 * Structure matches index.html lines 619-636.
 */

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Props for RestTimerBar component.
 */
export interface RestTimerBarProps {
  /** Current displayed time in seconds */
  displaySeconds: number;
  /** Timer progress percentage (100 = full, 0 = empty) */
  progress: number;
  /** Whether timer is actively running for this exercise */
  isActive: boolean;
  /** Whether timer completed (seconds reached 0) */
  isComplete: boolean;
  /** Callback to adjust timer by delta seconds */
  onAdjust: (deltaSeconds: number) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format seconds to MM:SS display.
 * Matches js/app.js lines 1175-1181.
 */
function formatTime(seconds: number): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) {
    seconds = 0;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Component
// ============================================================================

/**
 * RestTimerBar component
 *
 * Renders the rest timer display with:
 * - Progress bar that fills/empties based on timer state
 * - Time display in MM:SS format
 * - +10s and -10s adjustment buttons
 *
 * CSS states:
 * - idle: Timer not running, full bar
 * - running: Timer counting down, bar shrinking
 * - complete: Timer finished (0 seconds), bar empty
 *
 * Matches index.html lines 619-636.
 */
export function RestTimerBar({
  displaySeconds,
  progress,
  isActive,
  isComplete,
  onAdjust
}: RestTimerBarProps) {
  // Determine timer bar state class
  const getTimerBarClass = (): string => {
    if (!isActive) return 'idle';
    if (!isComplete) return 'running';
    return 'complete';
  };

  return (
    <div class="rest-timer-bar-container">
      <div class="rest-timer-bar-wrapper">
        <div
          class={`rest-timer-bar-fill ${getTimerBarClass()}`}
          style={{ width: `${progress}%` }}
        />
        <span class="rest-timer-bar-time">{formatTime(displaySeconds)}</span>
      </div>
      <div class="rest-timer-controls">
        <button
          type="button"
          class="btn-timer-adjust"
          onClick={() => onAdjust(-10)}
        >
          -10s
        </button>
        <button
          type="button"
          class="btn-timer-adjust"
          onClick={() => onAdjust(10)}
        >
          +10s
        </button>
      </div>
    </div>
  );
}

export default RestTimerBar;
