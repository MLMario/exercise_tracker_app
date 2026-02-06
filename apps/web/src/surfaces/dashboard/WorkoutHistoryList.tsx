/**
 * WorkoutHistoryList Component
 *
 * Displays workout history as a browsable timeline with summary statistics,
 * compact workout cards with badges, and Load More pagination.
 *
 * Features:
 * - Summary bar showing total workouts, sets, and volume
 * - Vertical timeline with date markers and dots
 * - Workout cards with template name and metric badges
 * - Load More pagination (7 items per page)
 * - Empty state when no workout history exists
 */

import { useState, useEffect } from 'preact/hooks';
import type { WorkoutHistoryItem, WorkoutSummaryStats } from '@ironlift/shared';
import { logging } from '@ironlift/shared';

interface WorkoutHistoryListProps {
  /** Callback when a workout is selected (optional, for Phase 24 navigation) */
  onSelectWorkout?: (workoutId: string) => void;
}

/**
 * Format large numbers with 'k' suffix for readability.
 * @example formatVolume(45200) => "45.2k"
 * @example formatVolume(1000) => "1k"
 * @example formatVolume(750) => "750"
 */
function formatVolume(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k % 1 === 0 ? k + 'k' : k.toFixed(1) + 'k';
  }
  return n.toLocaleString();
}

/**
 * Format ISO date string to short date format without year.
 * @example formatWorkoutDate("2026-02-05T10:30:00Z") => "Feb 5"
 */
function formatWorkoutDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

const PAGE_SIZE = 7;

export function WorkoutHistoryList({ onSelectWorkout }: WorkoutHistoryListProps) {
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [summary, setSummary] = useState<WorkoutSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');

  // Initial load on mount
  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Fetch summary and first page in parallel
        const [summaryResult, pageResult] = await Promise.all([
          logging.getWorkoutSummaryStats(),
          logging.getWorkoutLogsPaginated(0, PAGE_SIZE)
        ]);

        if (summaryResult.error) {
          setError('Failed to load workout summary');
          setIsLoading(false);
          return;
        }

        if (pageResult.error) {
          setError('Failed to load workout history');
          setIsLoading(false);
          return;
        }

        setSummary(summaryResult.data);
        if (pageResult.data) {
          setWorkouts(pageResult.data.data);
          setHasMore(pageResult.data.hasMore);
        }
      } catch {
        setError('An unexpected error occurred');
      }

      setIsLoading(false);
    };

    loadInitial();
  }, []);

  // Load more workouts
  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const result = await logging.getWorkoutLogsPaginated(workouts.length, PAGE_SIZE);

      if (result.error) {
        // Silently fail - user can retry
        setIsLoadingMore(false);
        return;
      }

      if (result.data) {
        // Use functional setState to avoid stale closure
        setWorkouts(prev => [...prev, ...result.data!.data]);
        setHasMore(result.data.hasMore);
      }
    } catch {
      // Silently fail - user can retry
    }

    setIsLoadingMore(false);
  };

  // Handle workout card click
  const handleCardClick = (workoutId: string) => {
    if (onSelectWorkout) {
      onSelectWorkout(workoutId);
    }
    // Phase 24 will wire up navigation
  };

  // Loading state
  if (isLoading) {
    return <div class="my-exercises-loading">Loading history...</div>;
  }

  // Error state
  if (error) {
    return <div class="error-message">{error}</div>;
  }

  // Empty state
  if (workouts.length === 0) {
    return (
      <div class="history-empty">
        <p class="history-empty-text">No workout history yet</p>
      </div>
    );
  }

  // Content state
  return (
    <>
      {/* Summary bar - only shown when data exists */}
      {summary && (
        <div class="history-summary">
          <div class="history-summary-stat">
            <div class="history-summary-val">{summary.totalWorkouts}</div>
            <div class="history-summary-label">Workouts</div>
          </div>
          <div class="history-summary-stat">
            <div class="history-summary-val">{summary.totalSets}</div>
            <div class="history-summary-label">Sets</div>
          </div>
          <div class="history-summary-stat">
            <div class="history-summary-val">{formatVolume(summary.totalVolume)}</div>
            <div class="history-summary-label">lbs</div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div class="history-timeline">
        {workouts.map((workout) => (
          <div key={workout.id} class="history-timeline-item">
            <div class="history-timeline-dot" />
            <div class="history-timeline-date">{formatWorkoutDate(workout.started_at)}</div>
            <div
              class="history-card"
              onClick={() => handleCardClick(workout.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(workout.id);
                }
              }}
            >
              <div class="history-card-header">
                {workout.template_name || 'Quick Workout'}
              </div>
              <div class="history-card-badges">
                <span class="history-badge">
                  {workout.exercise_count} exercises
                </span>
                <span class="history-badge success">
                  {workout.completed_sets} sets
                </span>
                <span class="history-badge">
                  {formatVolume(workout.total_volume)} lbs
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More button */}
      {hasMore && (
        <button
          type="button"
          class="history-load-more"
          onClick={loadMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </>
  );
}
