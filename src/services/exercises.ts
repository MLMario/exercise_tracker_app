/**
 * Exercises Service Module
 *
 * TypeScript implementation of the ExercisesService interface.
 * Provides CRUD operations for the exercise library.
 *
 * This module migrates js/exercises.js to TypeScript with full type safety.
 */

import type { Exercise, ExerciseCategory } from '@/types/database';
import type { ExercisesService, ServiceResult, ServiceError } from '@/types/services';

import { supabase } from '@/lib/supabase';

/**
 * Get all exercises for the current user.
 *
 * @returns Promise resolving to array of exercises or error
 */
async function getExercises(): Promise<ServiceResult<Exercise[]>> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching exercises:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in getExercises:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Get exercises filtered by category.
 *
 * @param category - Exercise category to filter by
 * @returns Promise resolving to filtered exercises or error
 */
async function getExercisesByCategory(
  category: ExerciseCategory
): Promise<ServiceResult<Exercise[]>> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      console.error(`Error fetching exercises for category ${category}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in getExercisesByCategory:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Create a new exercise.
 *
 * @param name - Exercise display name
 * @param category - Exercise muscle group category
 * @param equipment - Optional equipment needed
 * @returns Promise resolving to the created exercise or error
 */
async function createExercise(
  name: string,
  category: ExerciseCategory,
  equipment?: string | null
): Promise<ServiceResult<Exercise>> {
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return {
        data: null,
        error: userError || new Error('No authenticated user'),
      };
    }

    // Validate inputs
    if (!name || !category) {
      const validationError = new Error('Name and category are required');
      console.error('Validation error:', validationError);
      return { data: null, error: validationError };
    }

    // Insert new exercise
    const { data, error } = await supabase
      .from('exercises')
      .insert([
        {
          user_id: user.id,
          name: name.trim(),
          category: category,
          equipment: equipment ? equipment.trim() : null,
        },
      ])
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        console.error('Exercise with this name already exists');
        return {
          data: null,
          error: new Error('An exercise with this name already exists'),
        };
      }
      console.error('Error creating exercise:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in createExercise:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Delete an exercise by ID.
 *
 * @param id - Exercise UUID
 * @returns Promise resolving to error status
 */
async function deleteExercise(id: string): Promise<ServiceError> {
  try {
    if (!id) {
      const validationError = new Error('Exercise ID is required');
      console.error('Validation error:', validationError);
      return { error: validationError };
    }

    const { error } = await supabase.from('exercises').delete().eq('id', id);

    if (error) {
      console.error('Error deleting exercise:', error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error in deleteExercise:', err);
    return {
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Check if an exercise with the given name exists.
 *
 * @param name - Exercise name to check
 * @returns Promise resolving to true if exists, false otherwise
 */
async function exerciseExists(name: string): Promise<boolean> {
  try {
    if (!name) {
      return false;
    }

    const { data, error } = await supabase
      .from('exercises')
      .select('id')
      .eq('name', name.trim())
      .maybeSingle();

    if (error) {
      console.error('Error checking exercise existence:', error);
      return false;
    }

    return data !== null;
  } catch (err) {
    console.error('Unexpected error in exerciseExists:', err);
    return false;
  }
}

/**
 * Get the list of predefined exercise categories.
 *
 * @returns Array of category strings
 */
function getCategories(): ExerciseCategory[] {
  return ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];
}

/**
 * Exercises service object implementing the ExercisesService interface.
 * Provides all exercise CRUD operations.
 */
export const exercises: ExercisesService = {
  getExercises,
  getExercisesByCategory,
  createExercise,
  deleteExercise,
  exerciseExists,
  getCategories,
};
