/**
 * Exercises CRUD Module
 * Handles all exercise-related database operations for the fitness tracking app
 */

/**
 * Get all exercises for the current user
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
async function getExercises() {
  try {
    const { data, error } = await window.supabaseClient
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
    return { data: null, error: err };
  }
}

/**
 * Get exercises filtered by category for the current user
 * @param {string} category - One of: 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
async function getExercisesByCategory(category) {
  try {
    const { data, error } = await window.supabaseClient
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
    return { data: null, error: err };
  }
}

/**
 * Create a new exercise for the current user
 * @param {string} name - Exercise name
 * @param {string} category - Exercise category
 * @param {string|null} equipment - Equipment needed (optional)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
async function createExercise(name, category, equipment = null) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return { data: null, error: userError || new Error('No authenticated user') };
    }

    // Validate inputs
    if (!name || !category) {
      const validationError = new Error('Name and category are required');
      console.error('Validation error:', validationError);
      return { data: null, error: validationError };
    }

    // Insert new exercise
    const { data, error } = await window.supabaseClient
      .from('exercises')
      .insert([
        {
          user_id: user.id,
          name: name.trim(),
          category: category,
          equipment: equipment ? equipment.trim() : null
        }
      ])
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        console.error('Exercise with this name already exists');
        return {
          data: null,
          error: new Error('An exercise with this name already exists')
        };
      }
      console.error('Error creating exercise:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error in createExercise:', err);
    return { data: null, error: err };
  }
}

/**
 * Delete an exercise by ID
 * @param {string} id - Exercise UUID
 * @returns {Promise<{error: Error|null}>}
 */
async function deleteExercise(id) {
  try {
    if (!id) {
      const validationError = new Error('Exercise ID is required');
      console.error('Validation error:', validationError);
      return { error: validationError };
    }

    const { error } = await window.supabaseClient
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting exercise:', error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error in deleteExercise:', err);
    return { error: err };
  }
}

/**
 * Check if an exercise with the given name already exists for the current user
 * @param {string} name - Exercise name to check
 * @returns {Promise<boolean>}
 */
async function exerciseExists(name) {
  try {
    if (!name) {
      return false;
    }

    const { data, error } = await window.supabaseClient
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
 * Get the list of predefined exercise categories
 * @returns {Array<string>}
 */
function getCategories() {
  return ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];
}

// Export all functions to window.exercises namespace
window.exercises = {
  getExercises,
  getExercisesByCategory,
  createExercise,
  deleteExercise,
  exerciseExists,
  getCategories
};
