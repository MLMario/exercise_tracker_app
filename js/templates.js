/**
 * Templates CRUD Module
 * Manages workout templates and their associated exercises
 */

/**
 * Get all templates for the current user
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
async function getTemplates() {
  try {
    const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError) {
      return { data: null, error: userError };
    }

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Get templates with their exercises and sets
    const { data, error } = await window.supabaseClient
      .from('templates')
      .select(`
        id,
        name,
        created_at,
        updated_at,
        template_exercises(
          id,
          exercise_id,
          default_rest_seconds,
          order,
          exercises(
            id,
            name,
            category
          ),
          template_exercise_sets(
            set_number,
            weight,
            reps
          )
        )
      `)
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    // Transform data to include exercises array with sets
    const templatesWithExercises = data.map(template => {
      // Sort exercises by order
      const sortedTemplateExercises = (template.template_exercises || [])
        .sort((a, b) => a.order - b.order);

      // Transform to the format expected by the app
      const exercises = sortedTemplateExercises.map(te => {
        // Sort sets by set_number
        const sortedSets = (te.template_exercise_sets || [])
          .sort((a, b) => a.set_number - b.set_number);

        return {
          exercise_id: te.exercise_id,
          name: te.exercises?.name || 'Unknown Exercise',
          category: te.exercises?.category || 'Other',
          default_rest_seconds: te.default_rest_seconds,
          sets: sortedSets.map(set => ({
            set_number: set.set_number,
            weight: set.weight,
            reps: set.reps
          }))
        };
      });

      return {
        id: template.id,
        name: template.name,
        created_at: template.created_at,
        updated_at: template.updated_at,
        exercises: exercises
      };
    });

    return { data: templatesWithExercises, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get a single template by ID with its exercises
 * @param {string} id - Template UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
async function getTemplate(id) {
  try {
    const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError) {
      return { data: null, error: userError };
    }

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Get template with its exercises and sets (normalized schema)
    const { data, error } = await window.supabaseClient
      .from('templates')
      .select(`
        id,
        name,
        created_at,
        updated_at,
        template_exercises(
          id,
          exercise_id,
          default_rest_seconds,
          order,
          exercises(
            id,
            name,
            category
          ),
          template_exercise_sets(
            set_number,
            weight,
            reps
          )
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return { data: null, error };
    }

    // Sort exercises by order
    if (data.template_exercises) {
      data.template_exercises.sort((a, b) => a.order - b.order);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Create a new template
 * @param {string} name - Template name
 * @param {Array} exercises - Array of exercise objects with defaults
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
async function createTemplate(name, exercises = []) {
  try {
    const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError) {
      return { data: null, error: userError };
    }

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Create the template first
    const { data: template, error: templateError } = await window.supabaseClient
      .from('templates')
      .insert({
        user_id: user.id,
        name: name
      })
      .select()
      .single();

    if (templateError) {
      return { data: null, error: templateError };
    }

    // If exercises are provided, insert them with their sets
    if (exercises && exercises.length > 0) {
      const templateExercises = exercises.map((exercise, index) => ({
        template_id: template.id,
        exercise_id: exercise.exercise_id,
        default_rest_seconds: exercise.default_rest_seconds ?? 90,
        order: index
      }));

      const { data: insertedExercises, error: exercisesError } = await window.supabaseClient
        .from('template_exercises')
        .insert(templateExercises)
        .select('id');

      if (exercisesError) {
        // Rollback: delete the template if exercises insertion fails
        await window.supabaseClient
          .from('templates')
          .delete()
          .eq('id', template.id);

        return { data: null, error: exercisesError };
      }

      // Insert sets for each exercise
      const allSets = [];
      exercises.forEach((exercise, index) => {
        const templateExerciseId = insertedExercises[index].id;
        const sets = exercise.sets || [];

        sets.forEach(set => {
          allSets.push({
            template_exercise_id: templateExerciseId,
            set_number: set.set_number,
            weight: set.weight ?? 0,
            reps: set.reps ?? 10
          });
        });
      });

      if (allSets.length > 0) {
        const { error: setsError } = await window.supabaseClient
          .from('template_exercise_sets')
          .insert(allSets);

        if (setsError) {
          // Rollback: delete the template if sets insertion fails
          await window.supabaseClient
            .from('templates')
            .delete()
            .eq('id', template.id);

          return { data: null, error: setsError };
        }
      }
    }

    return { data: template, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update an existing template
 * @param {string} id - Template UUID
 * @param {string} name - New template name
 * @param {Array} exercises - Array of exercise objects with defaults
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
async function updateTemplate(id, name, exercises = []) {
  try {
    const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError) {
      return { data: null, error: userError };
    }

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Update template name
    const { data: template, error: templateError } = await window.supabaseClient
      .from('templates')
      .update({
        name: name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (templateError) {
      return { data: null, error: templateError };
    }

    // Delete existing template_exercises (cascades to delete sets)
    const { error: deleteError } = await window.supabaseClient
      .from('template_exercises')
      .delete()
      .eq('template_id', id);

    if (deleteError) {
      return { data: null, error: deleteError };
    }

    // Insert new template_exercises with sets if provided
    if (exercises && exercises.length > 0) {
      const templateExercises = exercises.map((exercise, index) => ({
        template_id: id,
        exercise_id: exercise.exercise_id,
        default_rest_seconds: exercise.default_rest_seconds ?? 90,
        order: index
      }));

      const { data: insertedExercises, error: exercisesError } = await window.supabaseClient
        .from('template_exercises')
        .insert(templateExercises)
        .select('id');

      if (exercisesError) {
        return { data: null, error: exercisesError };
      }

      // Insert sets for each exercise
      const allSets = [];
      exercises.forEach((exercise, index) => {
        const templateExerciseId = insertedExercises[index].id;
        const sets = exercise.sets || [];

        sets.forEach(set => {
          allSets.push({
            template_exercise_id: templateExerciseId,
            set_number: set.set_number,
            weight: set.weight ?? 0,
            reps: set.reps ?? 10
          });
        });
      });

      if (allSets.length > 0) {
        const { error: setsError } = await window.supabaseClient
          .from('template_exercise_sets')
          .insert(allSets);

        if (setsError) {
          return { data: null, error: setsError };
        }
      }
    }

    return { data: template, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Delete a template
 * @param {string} id - Template UUID
 * @returns {Promise<{error: Error|null}>}
 */
async function deleteTemplate(id) {
  try {
    const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError) {
      return { error: userError };
    }

    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await window.supabaseClient
      .from('templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    return { error };
  } catch (error) {
    return { error };
  }
}

/**
 * Add an exercise to a template
 * @param {string} templateId - Template UUID
 * @param {Object} exercise - Exercise object with defaults
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
async function addExerciseToTemplate(templateId, exercise) {
  try {
    const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError) {
      return { data: null, error: userError };
    }

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Get current max order for this template
    const { data: existingExercises, error: fetchError } = await window.supabaseClient
      .from('template_exercises')
      .select('order')
      .eq('template_id', templateId)
      .order('order', { ascending: false })
      .limit(1);

    if (fetchError) {
      return { data: null, error: fetchError };
    }

    const maxOrder = existingExercises && existingExercises.length > 0
      ? existingExercises[0].order
      : -1;

    // Insert new template_exercise
    const { data, error } = await window.supabaseClient
      .from('template_exercises')
      .insert({
        template_id: templateId,
        exercise_id: exercise.exercise_id,
        default_rest_seconds: exercise.default_rest_seconds ?? 90,
        order: maxOrder + 1
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Insert 3 default sets for the exercise
    const defaultSets = [
      { template_exercise_id: data.id, set_number: 1, weight: 0, reps: 10 },
      { template_exercise_id: data.id, set_number: 2, weight: 0, reps: 10 },
      { template_exercise_id: data.id, set_number: 3, weight: 0, reps: 10 }
    ];

    const { error: setsError } = await window.supabaseClient
      .from('template_exercise_sets')
      .insert(defaultSets);

    if (setsError) {
      // Rollback: delete the template_exercise if sets insertion fails
      await window.supabaseClient
        .from('template_exercises')
        .delete()
        .eq('id', data.id);

      return { data: null, error: setsError };
    }

    // Update template's updated_at timestamp
    await window.supabaseClient
      .from('templates')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', templateId);

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Remove an exercise from a template
 * @param {string} templateId - Template UUID
 * @param {string} exerciseId - Exercise UUID
 * @returns {Promise<{error: Error|null}>}
 */
async function removeExerciseFromTemplate(templateId, exerciseId) {
  try {
    const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError) {
      return { error: userError };
    }

    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await window.supabaseClient
      .from('template_exercises')
      .delete()
      .eq('template_id', templateId)
      .eq('exercise_id', exerciseId);

    if (error) {
      return { error };
    }

    // Update template's updated_at timestamp
    await window.supabaseClient
      .from('templates')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', templateId);

    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Update exercise defaults in a template (only rest_seconds at exercise level)
 * @param {string} templateId - Template UUID
 * @param {string} exerciseId - Exercise UUID
 * @param {Object} defaults - Object with default values (only default_rest_seconds supported)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
async function updateTemplateExercise(templateId, exerciseId, defaults) {
  try {
    const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError) {
      return { data: null, error: userError };
    }

    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const updateData = {};
    // Only default_rest_seconds is stored at exercise level (normalized schema)
    if (defaults.default_rest_seconds !== undefined) updateData.default_rest_seconds = defaults.default_rest_seconds;

    const { data, error } = await window.supabaseClient
      .from('template_exercises')
      .update(updateData)
      .eq('template_id', templateId)
      .eq('exercise_id', exerciseId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Update template's updated_at timestamp
    await window.supabaseClient
      .from('templates')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', templateId);

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Export all functions to window.templates
window.templates = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  addExerciseToTemplate,
  removeExerciseFromTemplate,
  updateTemplateExercise
};
