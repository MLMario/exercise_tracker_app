/**
 * Vite + TypeScript + Preact Entry Point
 *
 * Main application entry point that manages surface routing.
 * Renders either AuthSurface or DashboardSurface based on current state.
 */

import { render } from 'preact';
import { useState } from 'preact/hooks';
import { AuthSurface, DashboardSurface } from '@/surfaces';

console.log('Vite + TypeScript initialized');

/**
 * Application surface type - controls which major UI surface is displayed.
 */
type AppSurface = 'auth' | 'dashboard';

/**
 * Root App component
 *
 * Manages top-level surface routing between auth and dashboard.
 * Will be enhanced later to include auth state listening.
 */
function App() {
  // Current surface state - hardcoded to 'dashboard' for testing
  // Will be controlled by auth state in future updates
  const [currentSurface, setCurrentSurface] = useState<AppSurface>('dashboard');

  /**
   * Handle logout - navigate back to auth surface
   */
  const handleLogout = () => {
    setCurrentSurface('auth');
  };

  // Render the appropriate surface based on state
  if (currentSurface === 'auth') {
    return <AuthSurface />;
  }

  return <DashboardSurface onLogout={handleLogout} />;
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
