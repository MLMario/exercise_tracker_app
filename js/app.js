document.addEventListener('alpine:init', () => {
  Alpine.data('fitnessApp', () => ({
    // ==================== STATE VARIABLES ====================

    // Auth state
    user: null,
    isLoading: true,
    currentSurface: 'auth', // 'auth', 'dashboard', 'workout', 'templateEditor'
    authSurface: 'login', // 'login', 'register', 'reset', or 'updatePassword'

    // Auth form fields
    authEmail: '',
    authPassword: '',
    authLoading: false,
    authConfirmPassword: '',
    showLoginPassword: false,
    showRegisterPassword: false,
    showConfirmPassword: false,
    showUpdatePassword: false,
    showUpdateConfirmPassword: false,
    resetEmailSent: false,
    passwordUpdateSuccess: false,
    isPasswordRecoveryMode: false, // Flag to prevent SIGNED_IN from overriding PASSWORD_RECOVERY

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
      exercises: [] // { exercise_id, name, category, order, rest_seconds, sets: [{ set_number, weight, reps, is_done }] }
    },

    // Template change detection
    originalTemplateSnapshot: null,

    // Template update modal
    showTemplateUpdateModal: false,
    pendingWorkoutData: null,

    // Workout confirmation modals
    showFinishWorkoutModal: false,
    showCancelWorkoutModal: false,

    // Delete chart modal
    showDeleteChartModal: false,
    pendingDeleteChartId: null,

    // Timer state (NOT timerState object)
    timerActive: false,
    timerPaused: false,
    timerSeconds: 0,
    timerTotalSeconds: 0,           // Total seconds for progress calculation
    activeTimerExerciseIndex: null, // Which exercise has the active timer

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
      // Set up storage event listener for multi-tab sync
      this.setupStorageEventListener();

      // Check URL hash for password recovery tokens BEFORE setting up auth listener
      // Supabase recovery links include type=recovery in the hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashType = hashParams.get('type');
      console.log('[AUTH DEBUG] URL hash type:', hashType);
      if (hashType === 'recovery') {
        console.log('[AUTH DEBUG] Detected recovery token in URL, setting isPasswordRecoveryMode = true');
        this.isPasswordRecoveryMode = true;
        this.currentSurface = 'auth';
        this.authSurface = 'updatePassword';
      }

      // Listen for auth state changes
      window.auth.onAuthStateChange((event, session) => {
        console.log('[AUTH DEBUG] Event:', event, 'Session:', session ? 'exists' : 'null', 'User:', session?.user?.email);
        this.user = session?.user || null;

        // Handle PASSWORD_RECOVERY event (user clicked reset link in email)
        if (event === 'PASSWORD_RECOVERY') {
          this.isPasswordRecoveryMode = true;
          this.currentSurface = 'auth';
          this.authSurface = 'updatePassword';
          this.error = '';
          this.successMessage = '';
          return; // Don't navigate to dashboard
        }

        // If we're in password recovery mode, stay on updatePassword surface
        // (Supabase fires SIGNED_IN after PASSWORD_RECOVERY, which would override)
        if (this.isPasswordRecoveryMode) {
          return;
        }

        if (this.user) {
          this.currentSurface = 'dashboard';
          this.loadDashboardAndRestore();
        } else {
          this.currentSurface = 'auth';
          this.templates = [];
          this.userCharts = [];
          this.destroyAllCharts();
        }
      });

      // Check initial session
      console.log('[AUTH DEBUG] Checking initial session...');
      console.log('[AUTH DEBUG] Current URL:', window.location.href);
      console.log('[AUTH DEBUG] URL hash:', window.location.hash);
      const session = await window.auth.getSession();
      console.log('[AUTH DEBUG] Initial session result:', session ? 'exists' : 'null', session?.user?.email);
      console.log('[AUTH DEBUG] isPasswordRecoveryMode:', this.isPasswordRecoveryMode);
      this.user = session?.user || null;
      if (this.user && !this.isPasswordRecoveryMode) {
        console.log('[AUTH DEBUG] Navigating to dashboard (user exists, not in recovery mode)');
        this.currentSurface = 'dashboard';
        await this.loadDashboardAndRestore();
      } else if (this.isPasswordRecoveryMode) {
        console.log('[AUTH DEBUG] Staying on updatePassword surface (recovery mode active)');
      }
      this.isLoading = false;

      // Set up watcher for automatic localStorage backup
      this.setupWorkoutWatcher();
    },

    async loadDashboardAndRestore() {
      await this.loadDashboard();
      // After dashboard loads (templates available), try to restore workout
      await this.restoreWorkoutFromStorage();
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
        if (this.authSurface === 'login') {
          result = await window.auth.login(this.authEmail, this.authPassword);
        } else {
          // Validate password confirmation for register mode
          if (!this.validatePasswords()) {
            this.error = 'Passwords do not match';
            this.authLoading = false;
            return;
          }
          result = await window.auth.register(this.authEmail, this.authPassword);
        }

        if (result.error) {
          this.error = result.error.message;
        } else {
          this.authEmail = '';
          this.authPassword = '';
          this.authConfirmPassword = '';
          this.successMessage = this.authSurface === 'login' ? 'Logged in successfully' : 'Account created successfully';
          this.clearMessages();
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.authLoading = false;
      }
    },

    switchAuthSurface(surface) {
      this.authSurface = surface;
      this.error = '';
      this.successMessage = '';

      // Reset resetEmailSent when leaving reset surface
      if (surface !== 'reset') {
        this.resetEmailSent = false;
      }

      // Reset passwordUpdateSuccess when leaving updatePassword surface
      if (surface !== 'updatePassword') {
        this.passwordUpdateSuccess = false;
      }

      // Clear password fields when switching surfaces
      this.authPassword = '';
      this.authConfirmPassword = '';
    },

    togglePasswordVisibility(field) {
      if (field === 'login') {
        this.showLoginPassword = !this.showLoginPassword;
      } else if (field === 'register') {
        this.showRegisterPassword = !this.showRegisterPassword;
      } else if (field === 'confirm') {
        this.showConfirmPassword = !this.showConfirmPassword;
      } else if (field === 'update') {
        this.showUpdatePassword = !this.showUpdatePassword;
      } else if (field === 'updateConfirm') {
        this.showUpdateConfirmPassword = !this.showUpdateConfirmPassword;
      }
    },

    async handlePasswordReset() {
      this.error = '';
      this.successMessage = '';

      if (!this.authEmail) {
        this.error = 'Email is required';
        return;
      }

      this.authLoading = true;

      try {
        const result = await window.auth.resetPassword(this.authEmail);

        if (result.error) {
          this.error = result.error.message;
        } else {
          this.resetEmailSent = true;
          this.successMessage = 'Password reset email sent. Check your inbox.';
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.authLoading = false;
      }
    },

    validatePasswords() {
      return this.authPassword === this.authConfirmPassword;
    },

    async handlePasswordUpdate() {
      this.error = '';
      this.successMessage = '';

      // Validate passwords match
      if (this.authPassword !== this.authConfirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      // Validate password length
      if (this.authPassword.length < 6) {
        this.error = 'Password must be at least 6 characters';
        return;
      }

      this.authLoading = true;

      try {
        const result = await window.auth.updateUser(this.authPassword);

        if (result.error) {
          this.error = result.error.message;
        } else {
          this.passwordUpdateSuccess = true;
          this.successMessage = 'Password updated successfully!';
          // Clear password fields
          this.authPassword = '';
          this.authConfirmPassword = '';
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.authLoading = false;
      }
    },

    goToLoginAfterPasswordUpdate() {
      this.passwordUpdateSuccess = false;
      this.isPasswordRecoveryMode = false; // Clear flag so normal auth flow resumes
      this.authSurface = 'login';
      this.error = '';
      this.successMessage = '';
      this.showUpdatePassword = false;
      this.showUpdateConfirmPassword = false;
    },

    async handleLogout() {
      // Clear workout backup before logout (while user.id is still available)
      this.clearWorkoutFromStorage();
      await window.auth.logout();
      this.authEmail = '';
      this.authPassword = '';
      this.authConfirmPassword = '';
      this.authSurface = 'login';
      this.showLoginPassword = false;
      this.showRegisterPassword = false;
      this.showConfirmPassword = false;
      this.showUpdatePassword = false;
      this.showUpdateConfirmPassword = false;
      this.resetEmailSent = false;
      this.passwordUpdateSuccess = false;
      this.isPasswordRecoveryMode = false;
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
        exercises: template.exercises.map(ex => ({
          ...ex,
          sets: ex.sets ? ex.sets.map(set => ({ ...set })) : []
        }))
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
          default_rest_seconds: 90,
          sets: [
            { set_number: 1, weight: 0, reps: 10 },
            { set_number: 2, weight: 0, reps: 10 },
            { set_number: 3, weight: 0, reps: 10 }
          ]
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
          rest_seconds: 90,
          sets: this.generateSetsArray(3, 0, 10)
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

    addSetToTemplateExercise(exIndex) {
      const exercise = this.editingTemplate.exercises[exIndex];
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets.push({
        set_number: exercise.sets.length + 1,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 10
      });
    },

    removeSetFromTemplateExercise(exIndex, setIndex) {
      const exercise = this.editingTemplate.exercises[exIndex];
      if (exercise.sets.length > 1) {
        exercise.sets.splice(setIndex, 1);
        exercise.sets.forEach((set, i) => set.set_number = i + 1);
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
        exercises: template.exercises.map((te, exIndex) => ({
          exercise_id: te.exercise_id,
          name: te.name,
          category: te.category,
          order: exIndex,
          rest_seconds: te.default_rest_seconds || 90,
          sets: te.sets.map(set => ({
            set_number: set.set_number,
            weight: set.weight,
            reps: set.reps,
            is_done: false
          }))
        }))
      };

      // Store deep copy for change detection
      this.originalTemplateSnapshot = JSON.parse(JSON.stringify({
        exercises: template.exercises.map(te => ({
          exercise_id: te.exercise_id,
          sets: te.sets.map(set => ({
            set_number: set.set_number,
            weight: set.weight,
            reps: set.reps
          }))
        }))
      }));

      this.currentSurface = 'workout';
      this.error = '';
      this.successMessage = '';
    },

    // Generate an array of set objects (rest_seconds now at exercise level)
    generateSetsArray(count, weight, reps) {
      return Array.from({ length: count }, (_, i) => ({
        set_number: i + 1,
        weight: weight,
        reps: reps,
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

    // Combined function to handle delete button click
    // This ensures both operations happen atomically
    deleteSetWithSwipeReset(exerciseIndex, setIndex) {
      // First, remove the set (this modifies the data)
      this.removeSetFromExercise(exerciseIndex, setIndex);
      // Then clear the swipe UI state
      this.handleSwipeCancel();
    },

    // Swipe-to-delete handlers for set rows using Pointer Events
    // Pointer Events work better than Touch Events for real-time drag tracking
    handleSwipeStart(event) {
      // Don't interfere if clicking the delete button
      if (event.target.closest('.btn-remove-set')) {
        return;
      }

      // Close any previously revealed rows first
      this.handleSwipeCancel();

      const wrapper = event.currentTarget;

      // Get clientX/Y from either touch or pointer event
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      wrapper._swipeData = {
        startX: clientX,
        startY: clientY,
        currentX: clientX,
        isDragging: false,
        pointerId: event.pointerId || null
      };

      // Capture pointer for smoother tracking (Pointer Events only)
      if (event.pointerId && wrapper.setPointerCapture) {
        wrapper.setPointerCapture(event.pointerId);
      }
    },

    handleSwipeMove(event) {
      const wrapper = event.currentTarget;
      if (!wrapper._swipeData) return;

      // Get clientX/Y from either touch or pointer event
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      const deltaX = clientX - wrapper._swipeData.startX;
      const deltaY = clientY - wrapper._swipeData.startY;

      // Only handle horizontal swipes (more horizontal than vertical movement)
      if (!wrapper._swipeData.isDragging && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
        wrapper._swipeData.isDragging = true;
        wrapper.classList.add('swiping');
      }

      if (wrapper._swipeData.isDragging) {
        // Prevent default to stop scrolling when swiping horizontally
        if (event.cancelable) {
          event.preventDefault();
        }

        wrapper._swipeData.currentX = clientX;

        // Only allow swiping left (negative deltaX), constrain to max swipe distance
        const swipeDistance = Math.min(0, deltaX);
        const maxSwipe = -80; // Maximum swipe distance (enough to reveal delete button)
        const constrainedDistance = Math.max(maxSwipe, swipeDistance);

        // Apply transform directly for smooth real-time tracking
        const setRow = wrapper.querySelector('.set-row');
        if (setRow) {
          setRow.style.transform = `translateX(${constrainedDistance}px)`;
        }

        // Show delete background proportionally
        const progress = Math.abs(constrainedDistance) / Math.abs(maxSwipe);
        wrapper.style.setProperty('--swipe-progress', progress);
      }
    },

    handleSwipeEnd(event) {
      const wrapper = event.currentTarget;
      if (!wrapper._swipeData) return;

      const deltaX = wrapper._swipeData.currentX - wrapper._swipeData.startX;
      const threshold = -40; // Swipe threshold to reveal delete button

      wrapper.classList.remove('swiping');

      const setRow = wrapper.querySelector('.set-row');

      if (wrapper._swipeData.isDragging && deltaX < threshold) {
        // Swipe was far enough - snap to revealed position
        wrapper.classList.add('swipe-revealed');
        if (setRow) {
          setRow.style.transform = 'translateX(-70px)'; // Snap to reveal position
        }
      } else {
        // Swipe wasn't far enough - snap back to original position
        wrapper.classList.remove('swipe-revealed');
        if (setRow) {
          setRow.style.transform = '';
        }
      }

      // Release pointer capture
      if (wrapper._swipeData.pointerId && wrapper.releasePointerCapture) {
        try {
          wrapper.releasePointerCapture(wrapper._swipeData.pointerId);
        } catch (e) {
          // Ignore if already released
        }
      }

      wrapper._swipeData = null;
    },

    // Close any open swipe-revealed rows when user taps elsewhere
    handleSwipeCancel() {
      // Close all revealed swipe rows
      const revealedWrappers = document.querySelectorAll('.set-row-wrapper.swipe-revealed');
      revealedWrappers.forEach(wrapper => {
        wrapper.classList.remove('swipe-revealed');
      });

      // Clear transform on ALL set rows to handle edge cases with Alpine's DOM reuse
      const allSetRows = document.querySelectorAll('.set-row');
      allSetRows.forEach(setRow => {
        setRow.style.transform = '';
      });
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

      this.showFinishWorkoutModal = true;
    },

    async saveWorkoutAndCleanup() {
      try {
        const workoutData = this.pendingWorkoutData || {
          template_id: this.activeWorkout.template_id,
          started_at: this.activeWorkout.started_at,
          finished_at: new Date().toISOString(),
          exercises: this.activeWorkout.exercises
        };

        const { error } = await window.logging.createWorkoutLog(workoutData);
        if (error) throw new Error(error.message);

        this.successMessage = 'Workout saved successfully!';
        this.clearMessages();

        // Clear localStorage backup
        this.clearWorkoutFromStorage();

        // Reset workout state
        this.activeWorkout = {
          template_id: null,
          template_name: '',
          started_at: null,
          exercises: []
        };
        this.originalTemplateSnapshot = null;
        this.pendingWorkoutData = null;
        this.stopTimer();

        // Return to dashboard and reload
        this.currentSurface = 'dashboard';
        await this.loadDashboard();
      } catch (err) {
        this.error = 'Failed to save workout: ' + err.message;
      }
    },

    async confirmTemplateUpdate() {
      try {
        const templateExercises = this.activeWorkout.exercises.map(ex => ({
          exercise_id: ex.exercise_id,
          name: ex.name,
          category: ex.category,
          default_rest_seconds: ex.rest_seconds,
          sets: ex.sets.map(set => ({
            set_number: set.set_number,
            weight: set.weight,
            reps: set.reps
          }))
        }));

        const template = this.templates.find(t => t.id === this.activeWorkout.template_id);
        const templateName = template?.name || this.activeWorkout.template_name;

        const { error } = await window.templates.updateTemplate(
          this.activeWorkout.template_id,
          templateName,
          templateExercises
        );

        if (error) {
          this.error = 'Failed to update template: ' + error.message;
        }
      } catch (err) {
        this.error = 'Failed to update template: ' + err.message;
      }

      this.showTemplateUpdateModal = false;
      await this.saveWorkoutAndCleanup();
    },

    declineTemplateUpdate() {
      this.showTemplateUpdateModal = false;
      this.saveWorkoutAndCleanup();
    },

    cancelWorkout() {
      this.showCancelWorkoutModal = true;
    },

    // Finish workout modal handlers
    confirmFinishWorkout() {
      this.showFinishWorkoutModal = false;

      if (this.activeWorkout.template_id && this.hasTemplateChanges()) {
        this.pendingWorkoutData = {
          template_id: this.activeWorkout.template_id,
          started_at: this.activeWorkout.started_at,
          finished_at: new Date().toISOString(),
          exercises: this.activeWorkout.exercises
        };
        this.showTemplateUpdateModal = true;
        return;
      }

      this.saveWorkoutAndCleanup();
    },

    dismissFinishWorkoutModal() {
      this.showFinishWorkoutModal = false;
    },

    // Cancel workout modal handlers
    confirmCancelWorkout() {
      this.showCancelWorkoutModal = false;
      this.stopTimer();

      // Clear localStorage backup
      this.clearWorkoutFromStorage();

      this.activeWorkout = {
        template_id: null,
        template_name: '',
        started_at: null,
        exercises: []
      };
      this.originalTemplateSnapshot = null;
      this.currentSurface = 'dashboard';
      this.successMessage = 'Workout cancelled';
      this.clearMessages();
    },

    dismissCancelWorkoutModal() {
      this.showCancelWorkoutModal = false;
    },

    hasTemplateChanges() {
      if (!this.originalTemplateSnapshot || !this.activeWorkout.template_id) {
        return false;
      }

      const original = this.originalTemplateSnapshot.exercises;
      const current = this.activeWorkout.exercises;

      // Check exercise count
      if (original.length !== current.length) return true;

      // Check each exercise
      for (const currEx of current) {
        const origEx = original.find(e => e.exercise_id === currEx.exercise_id);

        // New exercise added
        if (!origEx) return true;

        // Set count changed
        if (origEx.sets.length !== currEx.sets.length) return true;

        // Check set values
        for (let j = 0; j < currEx.sets.length; j++) {
          const origSet = origEx.sets[j];
          const currSet = currEx.sets[j];

          if (!origSet) return true;
          if (origSet.weight !== currSet.weight || origSet.reps !== currSet.reps) {
            return true;
          }
        }
      }

      // Check if any original exercises removed
      for (const origEx of original) {
        if (!current.find(e => e.exercise_id === origEx.exercise_id)) {
          return true;
        }
      }

      return false;
    },

    // ==================== TIMER METHODS ====================

    startRestTimer(seconds, exIndex) {
      if (!seconds || seconds <= 0) return;

      // Stop any existing timer first
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      this.timerActive = true;
      this.timerPaused = false;
      this.timerSeconds = seconds;
      this.timerTotalSeconds = seconds;
      this.activeTimerExerciseIndex = exIndex;

      // Start countdown
      this.timerInterval = setInterval(() => {
        if (!this.timerPaused) {
          this.timerSeconds--;
          if (this.timerSeconds <= 0) {
            this.timerSeconds = 0;
            this.timerActive = false;
            clearInterval(this.timerInterval);
            this.timerInterval = null;
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
      this.timerTotalSeconds = 0;
      this.activeTimerExerciseIndex = null;
    },

    toggleTimerPause() {
      this.timerPaused = !this.timerPaused;
    },

    adjustTimer(seconds, exIndex) {
      if (this.isTimerActiveForExercise(exIndex)) {
        // Timer is running for this exercise - adjust running timer
        this.timerSeconds += seconds;
        this.timerTotalSeconds += seconds;
        if (this.timerSeconds < 0) this.timerSeconds = 0;
        if (this.timerTotalSeconds < 0) this.timerTotalSeconds = 0;
      } else {
        // Timer is idle - adjust the exercise's default rest_seconds
        const exercise = this.activeWorkout.exercises[exIndex];
        if (exercise) {
          exercise.rest_seconds += seconds;
          if (exercise.rest_seconds < 0) exercise.rest_seconds = 0;
        }
      }
    },

    // Check if timer is active for a specific exercise
    isTimerActiveForExercise(exIndex) {
      return this.timerActive && this.activeTimerExerciseIndex === exIndex;
    },

    // Get timer progress percentage (100 = full, 0 = empty)
    getTimerProgress(exIndex) {
      if (!this.isTimerActiveForExercise(exIndex)) {
        return 100; // Full bar when idle
      }
      if (this.timerTotalSeconds <= 0) {
        return 0;
      }
      return Math.round((this.timerSeconds / this.timerTotalSeconds) * 100);
    },

    formatTime(seconds) {
      if (seconds === undefined || seconds === null || isNaN(seconds)) {
        seconds = 0;
      }
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Format workout date as calendar date
    formatWorkoutDate(isoString) {
      if (!isoString) return '';
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
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

    removeChart(id) {
      this.pendingDeleteChartId = id;
      this.showDeleteChartModal = true;
    },

    dismissDeleteChartModal() {
      this.showDeleteChartModal = false;
      this.pendingDeleteChartId = null;
    },

    async confirmDeleteChart() {
      const id = this.pendingDeleteChartId;
      this.showDeleteChartModal = false;
      this.pendingDeleteChartId = null;

      this.error = '';
      try {
        // Destroy chart instance
        if (this.chartInstances[id]) {
          this.chartInstances[id].destroy();
          delete this.chartInstances[id];
        }

        const { error } = await window.charts.deleteChart(id);
        if (error) throw new Error(error.message);

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
    },

    // ==================== LOCALSTORAGE BACKUP METHODS ====================

    getWorkoutStorageKey() {
      return this.user ? `activeWorkout_${this.user.id}` : null;
    },

    saveWorkoutToStorage() {
      const key = this.getWorkoutStorageKey();
      if (!key) return;

      // Only save if there's an active workout
      if (!this.activeWorkout.started_at || this.activeWorkout.exercises.length === 0) {
        return;
      }

      const backupData = {
        activeWorkout: this.activeWorkout,
        originalTemplateSnapshot: this.originalTemplateSnapshot,
        last_saved_at: new Date().toISOString()
      };

      localStorage.setItem(key, JSON.stringify(backupData));
    },

    loadWorkoutFromStorage() {
      const key = this.getWorkoutStorageKey();
      if (!key) return null;

      const stored = localStorage.getItem(key);
      if (!stored) return null;

      try {
        const backupData = JSON.parse(stored);

        // Basic validation - check required fields exist
        if (!backupData.activeWorkout ||
            !backupData.activeWorkout.started_at ||
            !Array.isArray(backupData.activeWorkout.exercises) ||
            backupData.activeWorkout.exercises.length === 0) {
          this.clearWorkoutFromStorage();
          return null;
        }

        return backupData;
      } catch (e) {
        // Corrupted data - silently discard
        this.clearWorkoutFromStorage();
        return null;
      }
    },

    clearWorkoutFromStorage() {
      const key = this.getWorkoutStorageKey();
      if (key) {
        localStorage.removeItem(key);
      }
    },

    async restoreWorkoutFromStorage() {
      const backupData = this.loadWorkoutFromStorage();
      if (!backupData) return false;

      const { activeWorkout, originalTemplateSnapshot } = backupData;

      // Check if template still exists (if workout was from a template)
      if (activeWorkout.template_id) {
        const templateExists = this.templates.some(t => t.id === activeWorkout.template_id);
        if (!templateExists) {
          // Template was deleted - discard and warn user
          this.clearWorkoutFromStorage();
          this.error = 'Your previous workout was discarded because the template was deleted.';
          this.clearMessages();
          return false;
        }
      }

      // Restore the workout state
      this.activeWorkout = activeWorkout;
      this.originalTemplateSnapshot = originalTemplateSnapshot;
      this.currentSurface = 'workout';

      return true;
    },

    setupWorkoutWatcher() {
      // Watch activeWorkout deeply for any changes
      this.$watch('activeWorkout', () => {
        this.saveWorkoutToStorage();
      }, { deep: true });
    },

    setupStorageEventListener() {
      // Listen for storage changes from other tabs
      window.addEventListener('storage', (event) => {
        const key = this.getWorkoutStorageKey();
        if (event.key !== key) return;

        if (event.newValue === null) {
          // Workout was cleared in another tab
          if (this.currentSurface === 'workout') {
            this.activeWorkout = {
              template_id: null,
              template_name: '',
              started_at: null,
              exercises: []
            };
            this.originalTemplateSnapshot = null;
            this.stopTimer();
            this.currentSurface = 'dashboard';
          }
        } else {
          // Workout was updated in another tab - sync it
          try {
            const backupData = JSON.parse(event.newValue);
            if (backupData.activeWorkout) {
              this.activeWorkout = backupData.activeWorkout;
              this.originalTemplateSnapshot = backupData.originalTemplateSnapshot;
              if (this.currentSurface !== 'workout' && this.activeWorkout.started_at) {
                this.currentSurface = 'workout';
              }
            }
          } catch (e) {
            // Ignore parse errors from other tabs
          }
        }
      });
    }
  }));
});
