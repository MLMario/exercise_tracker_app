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

    // Insert all workout log exercises and their sets
    if (workoutExercises && workoutExercises.length > 0) {
      for (let index = 0; index < workoutExercises.length; index++) {
        const ex = workoutExercises[index];

        // Get rest_seconds from exercise level (normalized schema)
        const restSeconds = ex.rest_seconds || ex.sets?.[0]?.rest_seconds || 60;

        // Insert workout_log_exercise (parent record - normalized, no aggregates)
        const { data: logExercise, error: exError } = await window.supabaseClient
          .from('workout_log_exercises')
          .insert({
            workout_log_id: workoutLog.id,
            exercise_id: ex.exercise_id,
            rest_seconds: restSeconds,
            order: ex.order !== undefined ? ex.order : index
          })
          .select()
          .single();

        if (exError) {
          // Rollback: delete the workout log if exercises fail
          await window.supabaseClient
            .from('workout_logs')
            .delete()
            .eq('id', workoutLog.id);

          return { data: null, error: exError };
        }

        // Insert individual sets (required for normalized schema)
        if (Array.isArray(ex.sets) && ex.sets.length > 0) {
          const setsToInsert = ex.sets.map(set => ({
            workout_log_exercise_id: logExercise.id,
            set_number: set.set_number,
            weight: set.weight || 0,
            reps: set.reps || 0,
            is_done: set.is_done || false
          }));

          const { error: setsError } = await window.supabaseClient
            .from('workout_log_sets')
            .insert(setsToInsert);

          if (setsError) {
            console.error('Failed to insert sets:', setsError);
            // Continue anyway - the parent exercise was saved
          }
        }
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
    // Fetch workout log with exercises, sets, and exercise details (normalized schema)
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
          rest_seconds,
          order,
          exercises (
            id,
            name,
            category
          ),
          workout_log_sets (
            id,
            set_number,
            weight,
            reps,
            is_done
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error };
    }

    // Sort exercises by order and sets by set_number
    if (data.workout_log_exercises) {
      data.workout_log_exercises.sort((a, b) => a.order - b.order);
      data.workout_log_exercises.forEach(ex => {
        if (ex.workout_log_sets) {
          ex.workout_log_sets.sort((a, b) => a.set_number - b.set_number);
        }
      });
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

    // Fetch workout log exercises with their sets (normalized schema)
    const { data, error } = await window.supabaseClient
      .from('workout_log_exercises')
      .select(`
        id,
        rest_seconds,
        workout_logs!inner (
          id,
          user_id,
          started_at
        ),
        workout_log_sets (
          id,
          set_number,
          weight,
          reps,
          is_done
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

    // Helper function to calculate metrics from sets
    const calculateMetrics = (exercises) => {
      let totalSets = 0;
      let maxWeight = 0;
      let maxVolumeSet = 0;

      exercises.forEach(ex => {
        const sets = ex.workout_log_sets || [];
        const completedSets = sets.filter(s => s.is_done);
        totalSets += completedSets.length;

        sets.forEach(set => {
          if (set.weight > maxWeight) maxWeight = set.weight;
          // Volume: weight × reps for weighted exercises, just reps for bodyweight
          const volume = (set.weight > 0)
            ? (set.weight * (set.reps || 0))
            : (set.reps || 0);
          if (volume > maxVolumeSet) maxVolumeSet = volume;
        });
      });

      return { totalSets, maxWeight, maxVolumeSet };
    };

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
        .map(([date, exercises]) => {
          const metrics = calculateMetrics(exercises);
          return {
            date,
            exercises,
            total_sets: metrics.totalSets,
            max_weight: metrics.maxWeight,
            max_volume_set: metrics.maxVolumeSet
          };
        })
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
        .map((session, index) => {
          const metrics = calculateMetrics(session.exercises);
          return {
            ...session,
            session_number: limitedData.length - index, // Reverse numbering
            total_sets: metrics.totalSets,
            max_weight: metrics.maxWeight,
            max_volume_set: metrics.maxVolumeSet
          };
        })
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
 * @param {Object} options - { metric: 'total_sets' | 'max_volume_set', mode: 'date' | 'session', limit: number }
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
        } else if (metric === 'max_volume_set') {
          values.push(item.max_volume_set);
        }
      });
    } else {
      // Session mode - reverse to show oldest to newest
      const reversedData = [...historyData].reverse();

      reversedData.forEach((item, index) => {
        labels.push(`Session ${index + 1}`);

        if (metric === 'total_sets') {
          values.push(item.total_sets);
        } else if (metric === 'max_volume_set') {
          values.push(item.max_volume_set);
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

    // Fetch workout log exercises with their sets (normalized schema)
    const { data, error } = await window.supabaseClient
      .from('workout_log_exercises')
      .select(`
        rest_seconds,
        workout_logs!inner (
          user_id,
          started_at
        ),
        workout_log_sets (
          set_number,
          weight,
          reps,
          is_done
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

    // Calculate aggregates from sets
    const sets = mostRecent.workout_log_sets || [];
    const completedSets = sets.filter(s => s.is_done);
    const firstSet = sets.find(s => s.set_number === 1) || sets[0];

    return {
      sets: completedSets.length || sets.length,
      reps: firstSet?.reps || 10,
      weight: firstSet?.weight || 0,
      rest_seconds: mostRecent.rest_seconds || 60
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
