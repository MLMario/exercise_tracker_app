/**
 * useWorkoutBackup Hook
 *
 * Provides localStorage backup operations for active workouts.
 * Extracted from WorkoutSurface to reduce component size and improve reusability.
 */

import { useCallback } from 'preact/hooks';

/**
 * LocalStorage backup data structure.
 */
export interface WorkoutBackupData {
  activeWorkout: {
    template_id: string | null;
    template_name: string;
    started_at: string | null;
    exercises: Array<{
      exercise_id: string;
      name: string;
      category: string;
      order: number;
      rest_seconds: number;
      sets: Array<{
        set_number: number;
        weight: number;
        reps: number;
        is_done: boolean;
      }>;
    }>;
  };
  originalTemplateSnapshot: {
    exercises: Array<{
      exercise_id: string;
      sets: Array<{
        set_number: number;
        weight: number;
        reps: number;
      }>;
    }>;
  } | null;
  last_saved_at: string;
}

export interface UseWorkoutBackup {
  getStorageKey: () => string | null;
  save: (activeWorkout: WorkoutBackupData['activeWorkout'], snapshot: WorkoutBackupData['originalTemplateSnapshot']) => void;
  clear: () => void;
}

/**
 * Hook for managing workout localStorage backup/restore.
 *
 * @param userId - Current user ID for scoped storage key
 * @returns Object with getStorageKey, save, and clear functions
 */
export function useWorkoutBackup(userId: string | undefined): UseWorkoutBackup {
  const getStorageKey = useCallback((): string | null => {
    return userId ? `activeWorkout_${userId}` : null;
  }, [userId]);

  const save = useCallback((
    activeWorkout: WorkoutBackupData['activeWorkout'],
    snapshot: WorkoutBackupData['originalTemplateSnapshot']
  ): void => {
    const key = userId ? `activeWorkout_${userId}` : null;
    if (!key || !activeWorkout.started_at || activeWorkout.exercises.length === 0) return;

    const backupData: WorkoutBackupData = {
      activeWorkout,
      originalTemplateSnapshot: snapshot,
      last_saved_at: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify(backupData));
  }, [userId]);

  const clear = useCallback((): void => {
    const key = userId ? `activeWorkout_${userId}` : null;
    if (key) {
      localStorage.removeItem(key);
    }
  }, [userId]);

  return { getStorageKey, save, clear };
}
