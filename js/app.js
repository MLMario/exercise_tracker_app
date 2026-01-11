document.addEventListener('alpine:init', () => {
  Alpine.data('fitnessApp', () => ({
    // ==================== STATE VARIABLES ====================

    // Auth state
    user: null,
    isLoading: true,
    currentSurface: 'auth', // 'auth', 'dashboard', 'workout', 'templateEditor'
    authMode: 'login', // 'login' or 'register'

    // Auth form fields (NOT authForm object)
    authEmail: '',
    authPassword: '',
    authLoading: false,

    // Dashboard data
    templates: [],
    userCharts: [],
    chartInstances: {}, // Store Chart.js instances for cleanup
    availableExercises: [],

    // Template editor state (always an object, never null)
    editingTemplate: {
      id: null,
      name: '',
      exercises: []
    },

    // Exercise picker modal
    showExercisePicker: false,
    exercisePickerContext: null, // 'template' or 'workout'
    exerciseSearchQuery: '', // NOT exerciseFilter
    showNewExerciseForm: false,
    newExerciseName: '', // NOT newExerciseForm.name
    newExerciseCategory: '', // NOT newExerciseForm.category

    // Workout state (snake_case properties)
    activeWorkout: {
      template_id: null,
      template_name: '',
      started_at: null,
      exercises: [] // { exercise_id, name, category, order, sets: [{ set_number, weight, reps, rest_seconds, is_done }] }
    },

    // Timer state (NOT timerState object)
    timerActive: false,
    timerPaused: false,
    timerSeconds: 0,

    // Add chart modal
    showAddChartModal: false,
    newChart: {
      exercise_id: '',
      metric_type: '',
      x_axis_mode: ''
    },

    // Messages (strings, not null)
    error: '',
    successMessage: '',

    // ==================== INITIALIZATION ====================

    async init() {
      // Listen for auth state changes
      window.auth.onAuthStateChange((event, session) => {
        this.user = session?.user || null;
        if (this.user) {
          this.currentSurface = 'dashboard';
          this.loadDashboard();
        } else {
          this.currentSurface = 'auth';
          this.templates = [];
          this.userCharts = [];
          this.destroyAllCharts();
        }
      });

      // Check initial session
      const session = await window.auth.getSession();
      this.user = session?.user || null;
      if (this.user) {
        this.currentSurface = 'dashboard';
        await this.loadDashboard();
      }
      this.isLoading = false;
    },

    // ==================== AUTH METHODS ====================

    async handleAuth() {
      this.error = '';
      this.authLoading = true;

      if (!this.authEmail || !this.authPassword) {
        this.error = 'Email and password are required';
        this.authLoading = false;
        return;
      }

      try {
        let result;
        if (this.authMode === 'login') {
          result = await window.auth.login(this.authEmail, this.authPassword);
        } else {
          result = await window.auth.register(this.authEmail, this.authPassword);
        }

        if (result.error) {
          this.error = result.error.message;
        } else {
          this.authEmail = '';
          this.authPassword = '';
          this.successMessage = this.authMode === 'login' ? 'Logged in successfully' : 'Account created successfully';
          this.clearMessages();
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.authLoading = false;
      }
    },

    async handleLogout() {
      await window.auth.logout();
      this.authEmail = '';
      this.authPassword = '';
      this.destroyAllCharts();
      this.successMessage = 'Logged out successfully';
      this.clearMessages();
    },

    // ==================== DASHBOARD METHODS ====================

    async loadDashboard() {
      this.error = '';
      this.successMessage = '';
      try {
        await Promise.all([
          this.loadTemplates(),
          this.loadExercises(),
          this.loadUserCharts()
        ]);
      } catch (err) {
        this.error = 'Failed to load dashboard: ' + err.message;
      }
    },

    async loadTemplates() {
      try {
        const { data, error } = await window.templates.getTemplates();
        if (error) throw new Error(error.message);
        this.templates = data || [];
      } catch (err) {
        throw new Error('Failed to load templates: ' + err.message);
      }
    },

    async loadExercises() {
      try {
        const { data, error } = await window.exercises.getExercises();
        if (error) throw new Error(error.message);
        this.availableExercises = data || [];
      } catch (err) {
        throw new Error('Failed to load exercises: ' + err.message);
      }
    },

    async loadUserCharts() {
      try {
        const { data, error } = await window.charts.getUserCharts();
        if (error) throw new Error(error.message);
        this.userCharts = data || [];
        // Wait for DOM to update, then render charts
        await this.$nextTick();
        await this.renderAllCharts();
      } catch (err) {
        throw new Error('Failed to load charts: ' + err.message);
      }
    },

    async renderAllCharts() {
      this.destroyAllCharts();

      for (const chart of this.userCharts) {
        try {
          const canvasId = `chart-${chart.id}`;
          const canvas = document.getElementById(canvasId);

          if (!canvas) {
            console.warn(`Canvas not found for chart ${chart.id}`);
            continue;
          }

          const { data: chartData, error } = await window.logging.getExerciseMetrics(
            chart.exercise_id,
            { metric: chart.metric_type, mode: chart.x_axis_mode }
          );

          if (error) {
            console.error(`Failed to get metrics for chart ${chart.id}:`, error);
            continue;
          }

          const chartInstance = window.charts.renderChart(
            canvasId,
            chartData,
            {
              metricType: chart.metric_type,
              exerciseName: chart.exercises?.name || 'Exercise'
            }
          );

          this.chartInstances[chart.id] = chartInstance;
        } catch (err) {
          console.error(`Failed to render chart ${chart.id}:`, err);
        }
      }
    },

    destroyAllCharts() {
      Object.values(this.chartInstances).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      this.chartInstances = {};
    },

    // ==================== TEMPLATE METHODS ====================

    createNewTemplate() {
      this.editingTemplate = {
        id: null,
        name: '',
        exercises: []
      };
      this.currentSurface = 'templateEditor';
      this.error = '';
      this.successMessage = '';
    },

    editTemplate(template) {
      this.editingTemplate = {
        id: template.id,
        name: template.name,
        exercises: template.exercises.map(ex => ({ ...ex }))
      };
      this.currentSurface = 'templateEditor';
      this.error = '';
      this.successMessage = '';
    },

    async saveTemplate() {
      this.error = '';
      this.successMessage = '';

      if (!this.editingTemplate.name || this.editingTemplate.name.trim() === '') {
        this.error = 'Template name is required';
        return;
      }

      if (this.editingTemplate.exercises.length === 0) {
        this.error = 'Add at least one exercise to the template';
        return;
      }

      try {
        if (this.editingTemplate.id) {
          // Update existing
          const { error } = await window.templates.updateTemplate(
            this.editingTemplate.id,
            this.editingTemplate.name,
            this.editingTemplate.exercises
          );
          if (error) throw new Error(error.message);
          this.successMessage = 'Template updated successfully';
        } else {
          // Create new
          const { error } = await window.templates.createTemplate(
            this.editingTemplate.name,
            this.editingTemplate.exercises
          );
          if (error) throw new Error(error.message);
          this.successMessage = 'Template created successfully';
        }

        this.clearMessages();
        this.currentSurface = 'dashboard';
        await this.loadTemplates();
      } catch (err) {
        this.error = 'Failed to save template: ' + err.message;
      }
    },

    async deleteTemplate(id) {
      if (!confirm('Are you sure you want to delete this template?')) {
        return;
      }

      this.error = '';
      this.successMessage = '';
      try {
        const { error } = await window.templates.deleteTemplate(id);
        if (error) throw new Error(error.message);
        this.successMessage = 'Template deleted successfully';
        this.clearMessages();
        await this.loadTemplates();
      } catch (err) {
        this.error = 'Failed to delete template: ' + err.message;
      }
    },

    cancelTemplateEdit() {
      this.currentSurface = 'dashboard';
      this.editingTemplate = {
        id: null,
        name: '',
        exercises: []
      };
    },

    openExercisePickerForTemplate() {
      this.exercisePickerContext = 'template';
      this.showExercisePicker = true;
      this.exerciseSearchQuery = '';
      this.showNewExerciseForm = false;
    },

    openExercisePickerForWorkout() {
      this.exercisePickerContext = 'workout';
      this.showExercisePicker = true;
      this.exerciseSearchQuery = '';
      this.showNewExerciseForm = false;
    },

    closeExercisePicker() {
      this.showExercisePicker = false;
      this.exercisePickerContext = null;
      this.exerciseSearchQuery = '';
      this.showNewExerciseForm = false;
    },

    get filteredExercises() {
      if (!this.exerciseSearchQuery) {
        return this.availableExercises;
      }
      const query = this.exerciseSearchQuery.toLowerCase();
      return this.availableExercises.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        ex.category.toLowerCase().includes(query)
      );
    },

    selectExercise(exercise) {
      if (this.exercisePickerContext === 'template') {
        // Check if already added
        const exists = this.editingTemplate.exercises.some(ex => ex.exercise_id === exercise.id);
        if (exists) {
          this.error = 'Exercise already added to template';
          this.clearMessages();
          return;
        }

        this.editingTemplate.exercises.push({
          exercise_id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          default_sets: 3,
          default_reps: 10,
          default_weight: 0,
          default_rest_seconds: 90
        });
      } else if (this.exercisePickerContext === 'workout') {
        // Check if already added
        const exists = this.activeWorkout.exercises.some(ex => ex.exercise_id === exercise.id);
        if (exists) {
          this.error = 'Exercise already added to workout';
          this.clearMessages();
          return;
        }

        this.activeWorkout.exercises.push({
          exercise_id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          order: this.activeWorkout.exercises.length,
          sets: this.generateSetsArray(3, 0, 10, 90)
        });
      }

      this.closeExercisePicker();
    },

    removeExerciseFromTemplate(index) {
      this.editingTemplate.exercises.splice(index, 1);
    },

    moveExerciseUp(index) {
      if (index > 0) {
        const temp = this.editingTemplate.exercises[index];
        this.editingTemplate.exercises[index] = this.editingTemplate.exercises[index - 1];
        this.editingTemplate.exercises[index - 1] = temp;
      }
    },

    moveExerciseDown(index) {
      if (index < this.editingTemplate.exercises.length - 1) {
        const temp = this.editingTemplate.exercises[index];
        this.editingTemplate.exercises[index] = this.editingTemplate.exercises[index + 1];
        this.editingTemplate.exercises[index + 1] = temp;
      }
    },

    // ==================== NEW EXERCISE METHODS ====================

    async createNewExercise() {
      if (!this.newExerciseName || this.newExerciseName.trim() === '') {
        this.error = 'Exercise name is required';
        this.clearMessages();
        return;
      }

      if (!this.newExerciseCategory) {
        this.error = 'Exercise category is required';
        this.clearMessages();
        return;
      }

      try {
        const { data: newExercise, error } = await window.exercises.createExercise(
          this.newExerciseName,
          this.newExerciseCategory
        );

        if (error) throw new Error(error.message);

        this.successMessage = 'Exercise created successfully';
        this.clearMessages();

        // Add to available exercises
        this.availableExercises.push(newExercise);

        // Add to current form
        this.selectExercise(newExercise);

        // Reset form
        this.newExerciseName = '';
        this.newExerciseCategory = '';
        this.showNewExerciseForm = false;
      } catch (err) {
        this.error = 'Failed to create exercise: ' + err.message;
        this.clearMessages();
      }
    },

    // ==================== WORKOUT METHODS ====================

    startWorkoutFromTemplate(template) {
      this.activeWorkout = {
        template_id: template.id,
        template_name: template.name,
        started_at: new Date().toISOString(),
        exercises: template.exercises.map((ex, exIndex) => ({
          exercise_id: ex.exercise_id,
          name: ex.name,
          category: ex.category,
          order: exIndex,
          sets: this.generateSetsArray(
            ex.default_sets || 3,
            ex.default_weight || 0,
            ex.default_reps || 10,
            ex.default_rest_seconds || 90
          )
        }))
      };
      this.currentSurface = 'workout';
      this.error = '';
      this.successMessage = '';
    },

    // Generate an array of set objects
    generateSetsArray(count, weight, reps, rest_seconds) {
      return Array.from({ length: count }, (_, i) => ({
        set_number: i + 1,
        weight: weight,
        reps: reps,
        rest_seconds: rest_seconds,
        is_done: false
      }));
    },

    // Add a new set to an exercise
    addSetToExercise(exerciseIndex) {
      const exercise = this.activeWorkout.exercises[exerciseIndex];
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets.push({
        set_number: exercise.sets.length + 1,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 10,
        rest_seconds: lastSet?.rest_seconds || 90,
        is_done: false
      });
    },

    // Remove a set from an exercise
    removeSetFromExercise(exerciseIndex, setIndex) {
      const exercise = this.activeWorkout.exercises[exerciseIndex];
      if (exercise.sets.length > 1) {
        exercise.sets.splice(setIndex, 1);
        // Renumber remaining sets
        exercise.sets.forEach((set, i) => set.set_number = i + 1);
      }
    },

    removeExerciseFromWorkout(index) {
      // Stop timer if it's active
      if (this.timerActive) {
        this.stopTimer();
      }

      this.activeWorkout.exercises.splice(index, 1);
    },

    async finishWorkout() {
      this.error = '';
      this.successMessage = '';

      if (this.activeWorkout.exercises.length === 0) {
        this.error = 'Add at least one exercise to finish the workout';
        return;
      }

      if (!confirm('Finish and save this workout?')) {
        return;
      }

      try {
        const workoutData = {
          template_id: this.activeWorkout.template_id,
          started_at: this.activeWorkout.started_at,
          finished_at: new Date().toISOString(),
          exercises: this.activeWorkout.exercises
        };

        const { error } = await window.logging.createWorkoutLog(workoutData);
        if (error) throw new Error(error.message);

        this.successMessage = 'Workout saved successfully!';
        this.clearMessages();

        // Reset workout state
        this.activeWorkout = {
          template_id: null,
          template_name: '',
          started_at: null,
          exercises: []
        };
        this.stopTimer();

        // Return to dashboard and reload
        this.currentSurface = 'dashboard';
        await this.loadDashboard();
      } catch (err) {
        this.error = 'Failed to save workout: ' + err.message;
      }
    },

    // ==================== TIMER METHODS ====================

    startRestTimer(seconds) {
      if (!seconds || seconds <= 0) return;

      this.timerActive = true;
      this.timerPaused = false;
      this.timerSeconds = seconds;

      // Start countdown
      this.timerInterval = setInterval(() => {
        if (!this.timerPaused) {
          this.timerSeconds--;
          if (this.timerSeconds <= 0) {
            this.stopTimer();
            // Play notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Rest Timer Complete!', {
                body: 'Time to start your next set'
              });
            }
          }
        }
      }, 1000);
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.timerActive = false;
      this.timerPaused = false;
      this.timerSeconds = 0;
    },

    toggleTimerPause() {
      this.timerPaused = !this.timerPaused;
    },

    adjustTimer(seconds) {
      this.timerSeconds += seconds;
      if (this.timerSeconds < 0) {
        this.timerSeconds = 0;
      }
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // ==================== CHART METHODS ====================

    openAddChartModal() {
      this.showAddChartModal = true;
      this.newChart = {
        exercise_id: '',
        metric_type: '',
        x_axis_mode: ''
      };
      this.error = '';
      this.successMessage = '';
    },

    closeAddChartModal() {
      this.showAddChartModal = false;
      this.newChart = {
        exercise_id: '',
        metric_type: '',
        x_axis_mode: ''
      };
    },

    async createChart() {
      this.error = '';
      this.successMessage = '';

      if (!this.newChart.exercise_id) {
        this.error = 'Please select an exercise';
        return;
      }

      if (!this.newChart.metric_type) {
        this.error = 'Please select a metric type';
        return;
      }

      if (!this.newChart.x_axis_mode) {
        this.error = 'Please select an x-axis mode';
        return;
      }

      try {
        const { error } = await window.charts.createChart({
          exercise_id: this.newChart.exercise_id,
          metric_type: this.newChart.metric_type,
          x_axis_mode: this.newChart.x_axis_mode
        });

        if (error) throw new Error(error.message);

        this.successMessage = 'Chart added successfully';
        this.clearMessages();
        this.closeAddChartModal();
        await this.loadUserCharts();
      } catch (err) {
        this.error = 'Failed to add chart: ' + err.message;
      }
    },

    async removeChart(id) {
      if (!confirm('Remove this chart from your dashboard?')) {
        return;
      }

      this.error = '';
      this.successMessage = '';
      try {
        // Destroy chart instance
        if (this.chartInstances[id]) {
          this.chartInstances[id].destroy();
          delete this.chartInstances[id];
        }

        const { error } = await window.charts.deleteChart(id);
        if (error) throw new Error(error.message);

        this.successMessage = 'Chart removed successfully';
        this.clearMessages();
        await this.loadUserCharts();
      } catch (err) {
        this.error = 'Failed to remove chart: ' + err.message;
      }
    },

    // ==================== UTILITY METHODS ====================

    clearMessages() {
      setTimeout(() => {
        this.error = '';
        this.successMessage = '';
      }, 5000);
    }
  }));
});
