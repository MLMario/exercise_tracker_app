// Vite + TypeScript entry point
console.log('Vite + TypeScript initialized');

import { render } from 'preact';
import { AuthSurface } from '@/surfaces';

// Get or create the app mount point
let appElement = document.getElementById('app');
if (!appElement) {
  // Create #app element if it doesn't exist
  appElement = document.createElement('div');
  appElement.id = 'app';
  document.body.appendChild(appElement);
}

// Render the AuthSurface component
render(<AuthSurface />, appElement);

console.log('AuthSurface rendered to #app');
