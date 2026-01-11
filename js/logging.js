/**
 * Workout Logging Module
 * Handles workout logging, exercise history, and metrics calculation
 */

/**
 * Create a new workout log with exercises
 * @param {Object|string} workoutDataOrTemplateId - Either a workout data object or template UUID
 * @param {string} [startedAt] - ISO timestamp when workout started (if using separate params)
 * @param {Array} [exercises] - Array of exercise objects (if using separate params)
 * @returns {Promise<{data, error}>}
 */
async function createWorkoutLog(workoutDataOrTemplateId, startedAt, exercises) {
  try {
    // Support both object parameter and separate parameters
    let templateId, workoutStartedAt, workoutExercises;

    if (typeof workoutDataOrTemplateId === 'object' && workoutDataOrTemplateId !== null) {
      // Called with object: createWorkoutLog({ template_id, started_at, exercises })
      templateId = workoutDataOrTemplateId.template_id;
      workoutStartedAt = workoutDataOrTemplateId.started_at;
      workoutExercises = workoutDataOrTemplateId.exercises;
    } else {
      // Called with separate params: createWorkoutLog(templateId, startedAt, exercises)
      templateId = workoutDataOrTemplateId;
      workoutStartedAt = startedAt;
      workoutExercises = exercises;
    }

    // Get current user
    const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: authError || new Error('User not authenticated')
      };
    }

    // Create workout log
    const { data: workoutLog, error: logError } = await window.supabaseClient
      .from('workout_logs')
      .insert({
        user_id: user.id,
        template_id: templateId || null,
        started_at: workoutStartedAt,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (logError) {
      return { data: null, error: logError };
    }

    // Insert all workout log exercises
    if (workoutExercises && workoutExercises.length > 0) {
      const exercisesToInsert = workoutExercises.map((ex, index) => ({
        workout_log_id: workoutLog.id,
        exercise_id: ex.exercise_id,
        sets_completed: ex.sets || ex.sets_completed || 0,
        reps: ex.reps || 0,
        weight: ex.weight || 0,
        rest_seconds: ex.rest_seconds || 0,
        is_done: ex.done || ex.is_done || false,
        order: ex.order !== undefined ? ex.order : index
      }));

      const { error: exercisesError } = await window.supabaseClient
        .from('workout_log_exercises')
        .insert(exercisesToInsert);

      if (exercisesError) {
        // Rollback: delete the workout log if exercises fail
        await window.supabaseClient
          .from('workout_logs')
          .delete()
          .eq('id', workoutLog.id);

        return { data: null, error: exercisesError };
      }
    }

    return { data: workoutLog, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get workout logs for current user
 * @param {number} limit - Maximum number of logs to fetch (default 52)
 * @returns {Promise<{data, error}>}
 */
async function getWorkoutLogs(limit = 52) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: authError || new Error('User not authenticated')
      };
    }

    // Fetch workout logs with exercise count
    const { data, error } = await window.supabaseClient
      .from('workout_logs')
      .select(`
        id,
        template_id,
        started_at,
        created_at,
        workout_log_exercises (count)
      `)
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    // Format the response to include exercise_count
    const formattedData = data.map(log => ({
      ...log,
      exercise_count: log.workout_log_exercises?.[0]?.count || 0,
      workout_log_exercises: undefined // Remove the nested object
    }));

    return { data: formattedData, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get detailed workout log with all exercises
 * @param {string} id - Workout log UUID
 * @returns {Promise<{data, error}>}
 */
async function getWorkoutLog(id) {
  try {
    // Fetch workout log with exercises and exercise details
    const { data, error } = await window.supabaseClient
      .from('workout_logs')
      .select(`
        id,
        template_id,
        started_at,
        created_at,
        workout_log_exercises (
          id,
          exercise_id,
          sets_completed,
          reps,
          weight,
          rest_seconds,
          is_done,
          order,
          exercises (
            id,
            name,
            category
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error };
    }

    // Sort exercises by order
    if (data.workout_log_exercises) {
      data.workout_log_exercises.sort((a, b) => a.order - b.order);
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get exercise history for charting
 * @param {string} exerciseId - Exercise UUID
 * @param {Object} options - { mode: 'date' | 'session', limit: number }
 * @returns {Promise<{data, error}>}
 */
async function getExerciseHistory(exerciseId, options = {}) {
  try {
    const { mode = 'session', limit = 52 } = options;

    // Get current user
    const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: authError || new Error('User not authenticated')
      };
    }

    // Fetch workout log exercises for this exercise
    const { data, error } = await window.supabaseClient
      .from('workout_log_exercises')
      .select(`
        id,
        sets_completed,
        reps,
        weight,
        rest_seconds,
        is_done,
        workout_logs!inner (
          id,
          user_id,
          started_at
        )
      `)
      .eq('exercise_id', exerciseId)
      .eq('workout_logs.user_id', user.id);

    if (error) {
      return { data: null, error };
    }

    // Sort by workout started_at in memory (Supabase doesn't support ordering by nested columns)
    data.sort((a, b) => new Date(b.workout_logs.started_at) - new Date(a.workout_logs.started_at));

    // Apply limit
    const limitedData = data.slice(0, mode === 'session' ? limit : 365);

    if (mode === 'date') {
      // Group by date
      const dateMap = new Map();

      limitedData.forEach(item => {
        const date = new Date(item.workout_logs.started_at).toISOString().split('T')[0];

        if (!dateMap.has(date)) {
          dateMap.set(date, []);
        }
        dateMap.get(date).push(item);
      });

      // Convert to array and sort by date
      const groupedData = Array.from(dateMap.entries())
        .map(([date, exercises]) => ({
          date,
          exercises,
          total_sets: exercises.reduce((sum, ex) => sum + ex.sets_completed, 0),
          max_weight: Math.max(...exercises.map(ex => ex.weight)),
          max_volume: Math.max(...exercises.map(ex => ex.weight * ex.reps))
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);

      return { data: groupedData, error: null };
    } else {
      // Session mode - group by workout
      const sessionMap = new Map();

      limitedData.forEach(item => {
        const workoutId = item.workout_logs.id;

        if (!sessionMap.has(workoutId)) {
          sessionMap.set(workoutId, {
            workout_id: workoutId,
            started_at: item.workout_logs.started_at,
            exercises: []
          });
        }
        sessionMap.get(workoutId).exercises.push(item);
      });

      // Convert to array and calculate metrics
      const sessionData = Array.from(sessionMap.values())
        .map((session, index) => ({
          ...session,
          session_number: limitedData.length - index, // Reverse numbering
          total_sets: session.exercises.reduce((sum, ex) => sum + ex.sets_completed, 0),
          max_weight: Math.max(...session.exercises.map(ex => ex.weight)),
          max_volume: Math.max(...session.exercises.map(ex => ex.weight * ex.reps))
        }))
        .sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

      return { data: sessionData, error: null };
    }
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Calculate exercise metrics for charting
 * @param {string} exerciseId - Exercise UUID
 * @param {Object} options - { metric: 'total_sets' | 'max_volume', mode: 'date' | 'session', limit: number }
 * @returns {Promise<{data, error}>}
 */
async function getExerciseMetrics(exerciseId, options = {}) {
  try {
    const {
      metric = 'total_sets',
      mode = 'session',
      limit = 52
    } = options;

    // Get exercise history
    const { data: historyData, error } = await getExerciseHistory(exerciseId, { mode, limit });

    if (error) {
      return { data: null, error };
    }

    // Transform into chart-friendly format
    const labels = [];
    const values = [];

    if (mode === 'date') {
      // Reverse to show oldest to newest
      const reversedData = [...historyData].reverse();

      reversedData.forEach(item => {
        labels.push(item.date);

        if (metric === 'total_sets') {
          values.push(item.total_sets);
        } else if (metric === 'max_volume') {
          values.push(item.max_volume);
        }
      });
    } else {
      // Session mode - reverse to show oldest to newest
      const reversedData = [...historyData].reverse();

      reversedData.forEach((item, index) => {
        labels.push(`Session ${index + 1}`);

        if (metric === 'total_sets') {
          values.push(item.total_sets);
        } else if (metric === 'max_volume') {
          values.push(item.max_volume);
        }
      });
    }

    return {
      data: { labels, values },
      error: null
    };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get recent workout data for an exercise (for pre-filling defaults)
 * @param {string} exerciseId - Exercise UUID
 * @returns {Promise<{sets, reps, weight, rest_seconds} | null>}
 */
async function getRecentExerciseData(exerciseId) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await window.supabaseClient.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Fetch workout log exercises for this exercise
    const { data, error } = await window.supabaseClient
      .from('workout_log_exercises')
      .select(`
        sets_completed,
        reps,
        weight,
        rest_seconds,
        workout_logs!inner (
          user_id,
          started_at
        )
      `)
      .eq('exercise_id', exerciseId)
      .eq('workout_logs.user_id', user.id);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Sort by started_at to get most recent and take first one
    data.sort((a, b) => new Date(b.workout_logs.started_at) - new Date(a.workout_logs.started_at));
    const mostRecent = data[0];

    return {
      sets: mostRecent.sets_completed,
      reps: mostRecent.reps,
      weight: mostRecent.weight,
      rest_seconds: mostRecent.rest_seconds
    };
  } catch (err) {
    return null;
  }
}

// Export all functions
window.logging = {
  createWorkoutLog,
  getWorkoutLogs,
  getWorkoutLog,
  getExerciseHistory,
  getExerciseMetrics,
  getRecentExerciseData
};
