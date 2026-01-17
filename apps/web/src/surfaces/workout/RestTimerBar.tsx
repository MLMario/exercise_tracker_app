/**
 * RestTimerBar Component
 *
 * Presentational component for the rest timer display.
 * Horizontal inline layout: [-10s] [bar] [time] [+10s]
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
 * Renders horizontal inline rest timer: [-10s] [bar] [time] [+10s]
 *
 * CSS states:
 * - idle: Timer not running, full bar
 * - running: Timer counting down, bar shrinking
 * - complete: Timer finished (0 seconds), bar empty
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
    <div class="rest-timer-inline">
      <button
        type="button"
        class="btn-timer-adjust"
        onClick={() => onAdjust(-10)}
      >
        -10s
      </button>
      <div class="rest-timer-bar">
        <div
          class={`rest-timer-bar-fill ${getTimerBarClass()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span class="rest-timer-time">{formatTime(displaySeconds)}</span>
      <button
        type="button"
        class="btn-timer-adjust"
        onClick={() => onAdjust(10)}
      >
        +10s
      </button>
    </div>
  );
}

export default RestTimerBar;
