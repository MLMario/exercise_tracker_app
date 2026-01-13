/**
 * Vite + TypeScript + Preact Entry Point
 *
 * Main application entry point that manages surface routing.
 * Renders AuthSurface, DashboardSurface, or TemplateEditorSurface based on current state.
 */

import { render } from 'preact';
import { useState } from 'preact/hooks';
import { AuthSurface, DashboardSurface, TemplateEditorSurface } from '@/surfaces';
import type { TemplateWithExercises } from '@/types';

console.log('Vite + TypeScript initialized');

/**
 * Application surface type - controls which major UI surface is displayed.
 */
type AppSurface = 'auth' | 'dashboard' | 'templateEditor';

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
 * Manages top-level surface routing between auth, dashboard, and template editor.
 * Will be enhanced later to include auth state listening.
 */
function App() {
  // Current surface state - hardcoded to 'dashboard' for testing
  // Will be controlled by auth state in future updates
  const [currentSurface, setCurrentSurface] = useState<AppSurface>('dashboard');

  // Template editing state - controls template editor surface
  const [editingTemplate, setEditingTemplate] = useState<EditingTemplateState>(null);

  /**
   * Handle logout - navigate back to auth surface
   */
  const handleLogout = () => {
    setCurrentSurface('auth');
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

  // Render the appropriate surface based on state
  if (currentSurface === 'auth') {
    return <AuthSurface />;
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

  return (
    <DashboardSurface
      onLogout={handleLogout}
      onEditTemplate={handleEditTemplate}
      onCreateNewTemplate={handleCreateNewTemplate}
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

console.log('App rendered to #app');
