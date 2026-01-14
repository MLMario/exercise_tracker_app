/**
 * Vite + TypeScript + Preact Entry Point
 *
 * Main application entry point that manages surface routing.
 * Renders AuthSurface, DashboardSurface, or TemplateEditorSurface based on current state.
 */

import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { AuthSurface, DashboardSurface, TemplateEditorSurface, WorkoutSurface } from '@/surfaces';
import { auth } from '@/services/auth';
import type { TemplateWithExercises } from '@/types';
import type { User } from '@supabase/supabase-js';

// ==================== SAVED WORKOUT TYPES ====================
/**
 * Saved workout data structure from localStorage.
 * Matches WorkoutSurface's WorkoutBackupData interface.
 */
interface SavedWorkoutData {
  activeWorkout: {
    template_id: string | null;
    template_name: string;
    started_at: string;
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

/**
 * Check localStorage for a saved workout for the given user.
 * Returns the saved data if valid, null otherwise.
 *
 * @param userId - The user's ID to check for saved workout
 * @returns SavedWorkoutData if found and valid, null otherwise
 */
function checkForSavedWorkout(userId: string): SavedWorkoutData | null {
  const key = `activeWorkout_${userId}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    const data = JSON.parse(stored) as SavedWorkoutData;
    // Validate required fields
    if (!data.activeWorkout?.started_at ||
        !Array.isArray(data.activeWorkout?.exercises) ||
        data.activeWorkout.exercises.length === 0) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Application surface type - controls which major UI surface is displayed.
 */
type AppSurface = 'auth' | 'dashboard' | 'templateEditor' | 'workout';

/**
 * Template editing state.
 * - null: Not editing
 * - 'new': Creating a new template
 * - TemplateWithExercises: Editing existing template
 */
type EditingTemplateState = null | 'new' | TemplateWithExercises;

/**
 * Root App component
 *
 * Manages top-level surface routing between auth, dashboard, template editor, and workout.
 * Includes auth state listening for automatic navigation on login/logout events.
 */
function App() {
  // ==================== AUTH STATE ====================
  // Current user (null = not authenticated)
  const [user, setUser] = useState<User | null>(null);
  // Loading state while checking initial session
  const [isLoading, setIsLoading] = useState(true);
  // Password recovery mode flag - prevents SIGNED_IN from overriding navigation
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState(false);

  // ==================== SURFACE STATE ====================
  // Current surface state - controlled by auth state
  const [currentSurface, setCurrentSurface] = useState<AppSurface>('auth');

  // Template editing state - controls template editor surface
  const [editingTemplate, setEditingTemplate] = useState<EditingTemplateState>(null);

  // Active workout template - controls workout surface
  const [activeWorkoutTemplate, setActiveWorkoutTemplate] = useState<TemplateWithExercises | null>(null);

  // Restored workout data - for resuming saved workout from localStorage
  const [restoredWorkoutData, setRestoredWorkoutData] = useState<SavedWorkoutData | null>(null);

  // ==================== REFS FOR CLOSURE-SAFE STATE ACCESS ====================
  // Auth listener callback captures state at creation time. Refs provide current values.
  const currentSurfaceRef = useRef(currentSurface);
  const isPasswordRecoveryModeRef = useRef(isPasswordRecoveryMode);

  // Keep refs in sync with state
  useEffect(() => {
    currentSurfaceRef.current = currentSurface;
  }, [currentSurface]);

  useEffect(() => {
    isPasswordRecoveryModeRef.current = isPasswordRecoveryMode;
  }, [isPasswordRecoveryMode]);

  // ==================== AUTH LISTENER ====================
  useEffect(() => {
    // DEBUG: Log initial state
    console.log('[DEBUG main.tsx] useEffect start - hash:', window.location.hash);

    // Check URL hash for recovery mode before setting up listener
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashType = hashParams.get('type');
    console.log('[DEBUG main.tsx] Parsed hash type:', hashType);

    if (hashType === 'recovery') {
      console.log('[DEBUG main.tsx] Recovery mode detected from URL hash');
      setIsPasswordRecoveryMode(true);
      isPasswordRecoveryModeRef.current = true; // Set ref immediately - state sync runs on next render
      setCurrentSurface('auth');
    }

    // Set up auth state change listener
    const subscription = auth.onAuthStateChange((event, session) => {
      console.log('[DEBUG main.tsx] Auth event:', event, 'recoveryRef:', isPasswordRecoveryModeRef.current);
      if (event === 'PASSWORD_RECOVERY') {
        console.log('[DEBUG main.tsx] PASSWORD_RECOVERY event received');
        setIsPasswordRecoveryMode(true);
        isPasswordRecoveryModeRef.current = true; // Set ref immediately
        setCurrentSurface('auth');
      } else if (event === 'SIGNED_IN') {
        console.log('[DEBUG main.tsx] SIGNED_IN event - recoveryRef:', isPasswordRecoveryModeRef.current);
        // Only navigate to dashboard if not in password recovery mode
        // Use refs for current values (closure captures initial state)
        if (!isPasswordRecoveryModeRef.current && session?.user) {
          console.log('[DEBUG main.tsx] SIGNED_IN: navigating (not in recovery mode)');
          setUser(session.user);
          // Only navigate to dashboard if coming from auth surface
          // Don't interrupt workout or template editor surfaces (e.g., on alt-tab token refresh)
          if (currentSurfaceRef.current === 'auth') {
            setCurrentSurface('dashboard');
          }
        } else {
          console.log('[DEBUG main.tsx] SIGNED_IN: blocked by recovery mode');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentSurface('auth');
      }
    });

    // Check initial session
    const checkInitialSession = async () => {
      console.log('[DEBUG main.tsx] checkInitialSession - recoveryRef:', isPasswordRecoveryModeRef.current);
      const session = await auth.getSession();
      console.log('[DEBUG main.tsx] Got session:', !!session?.user, 'recoveryRef:', isPasswordRecoveryModeRef.current);
      // Only set user and navigate if there's a session and not in recovery mode
      // Use ref for current value - closure captures initial state (false)
      if (session?.user && !isPasswordRecoveryModeRef.current) {
        console.log('[DEBUG main.tsx] checkInitialSession: navigating to dashboard/workout');
        setUser(session.user);

        // Check for saved workout before navigating to dashboard
        const savedWorkout = checkForSavedWorkout(session.user.id);
        if (savedWorkout) {
          setRestoredWorkoutData(savedWorkout);
          setCurrentSurface('workout');
        } else {
          setCurrentSurface('dashboard');
        }
      }
      setIsLoading(false);
    };

    checkInitialSession();

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Handle logout - sign out and navigate back to auth surface
   * Auth listener will handle the actual navigation
   */
  const handleLogout = async () => {
    await auth.logout();
    // Auth listener will handle navigation via SIGNED_OUT event
  };

  /**
   * Handle edit template - navigate to template editor with existing template
   */
  const handleEditTemplate = (template: TemplateWithExercises) => {
    setEditingTemplate(template);
    setCurrentSurface('templateEditor');
  };

  /**
   * Handle create new template - navigate to template editor for new template
   */
  const handleCreateNewTemplate = () => {
    setEditingTemplate('new');
    setCurrentSurface('templateEditor');
  };

  /**
   * Handle template saved - return to dashboard
   */
  const handleTemplateSaved = () => {
    setEditingTemplate(null);
    setCurrentSurface('dashboard');
  };

  /**
   * Handle template cancel - return to dashboard
   */
  const handleTemplateCancel = () => {
    setEditingTemplate(null);
    setCurrentSurface('dashboard');
  };

  /**
   * Handle start workout - navigate to workout surface with template
   */
  const handleStartWorkout = (template: TemplateWithExercises) => {
    setActiveWorkoutTemplate(template);
    setCurrentSurface('workout');
  };

  /**
   * Handle workout finish - return to dashboard
   */
  const handleWorkoutFinish = () => {
    setActiveWorkoutTemplate(null);
    setRestoredWorkoutData(null);
    setCurrentSurface('dashboard');
  };

  /**
   * Handle workout cancel - return to dashboard
   */
  const handleWorkoutCancel = () => {
    setActiveWorkoutTemplate(null);
    setRestoredWorkoutData(null);
    setCurrentSurface('dashboard');
  };

  // ==================== RENDER ====================

  // Show loading screen while checking initial session
  if (isLoading) {
    return (
      <div class="loading-screen">
        <div class="loading-content">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  // Render the appropriate surface based on state
  if (currentSurface === 'auth') {
    return <AuthSurface isRecoveryMode={isPasswordRecoveryMode} />;
  }

  if (currentSurface === 'templateEditor') {
    return (
      <TemplateEditorSurface
        template={editingTemplate === 'new' ? undefined : editingTemplate || undefined}
        onSave={handleTemplateSaved}
        onCancel={handleTemplateCancel}
      />
    );
  }

  if (currentSurface === 'workout' && (activeWorkoutTemplate || restoredWorkoutData)) {
    return (
      <WorkoutSurface
        template={activeWorkoutTemplate || undefined}
        restoredWorkout={restoredWorkoutData || undefined}
        userId={user?.id}
        onFinish={handleWorkoutFinish}
        onCancel={handleWorkoutCancel}
      />
    );
  }

  return (
    <DashboardSurface
      onLogout={handleLogout}
      onEditTemplate={handleEditTemplate}
      onCreateNewTemplate={handleCreateNewTemplate}
      onStartWorkout={handleStartWorkout}
    />
  );
}

// Get or create the app mount point
let appElement = document.getElementById('app');
if (!appElement) {
  // Create #app element if it doesn't exist
  appElement = document.createElement('div');
  appElement.id = 'app';
  document.body.appendChild(appElement);
}

// Render the App component
render(<App />, appElement);
