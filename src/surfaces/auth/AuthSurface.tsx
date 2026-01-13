/**
 * AuthSurface Component
 *
 * Container component for all authentication-related UI surfaces:
 * login, register, reset password, and update password.
 *
 * This component manages auth-specific state and provides sub-surface routing.
 * State variables mirror the Alpine.js implementation in js/app.js lines 6-24.
 */

import { useState, useEffect } from 'preact/hooks';
import { auth } from '@/services/auth';

/**
 * Auth sub-surface type - controls which auth form is displayed
 */
export type AuthSubSurface = 'login' | 'register' | 'reset' | 'updatePassword';

/**
 * Password field identifiers for toggling visibility
 */
export type PasswordField =
  | 'login'
  | 'register'
  | 'confirm'
  | 'update'
  | 'updateConfirm';

/**
 * AuthSurface container component
 *
 * Manages auth form state and sub-surface routing.
 * Will render the appropriate auth form based on authSurface state.
 */
export function AuthSurface() {
  // ==================== AUTH STATE ====================
  // Mirrors js/app.js lines 6-24 state variables

  // Current sub-surface (which auth form to show)
  const [authSurface, setAuthSurface] = useState<AuthSubSurface>('login');

  // Form field values
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');

  // Loading state for async operations
  const [authLoading, setAuthLoading] = useState(false);

  // Password visibility toggles (per field)
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [showUpdateConfirmPassword, setShowUpdateConfirmPassword] = useState(false);

  // Status flags for reset and update flows
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  // Password recovery mode flag
  // Prevents SIGNED_IN from overriding PASSWORD_RECOVERY navigation
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState(false);

  // Messages
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    // Check URL hash for password recovery tokens
    // Supabase recovery links include type=recovery in the hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashType = hashParams.get('type');

    if (hashType === 'recovery') {
      console.log('[AUTH DEBUG] Detected recovery token in URL, setting isPasswordRecoveryMode = true');
      setIsPasswordRecoveryMode(true);
      setAuthSurface('updatePassword');
    }

    // Listen for auth state changes
    const subscription = auth.onAuthStateChange((event, _session) => {
      // Handle PASSWORD_RECOVERY event (user clicked reset link in email)
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecoveryMode(true);
        setAuthSurface('updatePassword');
        setError('');
        setSuccessMessage('');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // ==================== ACTIONS ====================

  /**
   * Switch to a different auth sub-surface
   * Clears form state when switching between surfaces
   */
  const switchAuthSurface = (surface: AuthSubSurface) => {
    setAuthSurface(surface);
    setError('');
    setSuccessMessage('');

    // Reset form fields when switching surfaces
    if (surface === 'login' || surface === 'register') {
      setResetEmailSent(false);
      setPasswordUpdateSuccess(false);
    }
  };

  /**
   * Toggle password visibility for a specific field
   */
  const togglePasswordVisibility = (field: PasswordField) => {
    switch (field) {
      case 'login':
        setShowLoginPassword((prev) => !prev);
        break;
      case 'register':
        setShowRegisterPassword((prev) => !prev);
        break;
      case 'confirm':
        setShowConfirmPassword((prev) => !prev);
        break;
      case 'update':
        setShowUpdatePassword((prev) => !prev);
        break;
      case 'updateConfirm':
        setShowUpdateConfirmPassword((prev) => !prev);
        break;
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => setError('');

  /**
   * Clear success message
   */
  const clearSuccessMessage = () => setSuccessMessage('');

  // ==================== RENDER ====================

  // Placeholder content for each sub-surface
  // These will be replaced with actual form components in plan 06-02
  const renderSubSurface = () => {
    switch (authSurface) {
      case 'login':
        return (
          <div class="auth-surface-placeholder" data-surface="login">
            <h2>Login Surface</h2>
            <p>Email: {authEmail || '(empty)'}</p>
            <p>Loading: {authLoading ? 'true' : 'false'}</p>
            <button type="button" onClick={() => switchAuthSurface('register')}>
              Switch to Register
            </button>
            <button type="button" onClick={() => switchAuthSurface('reset')}>
              Forgot Password
            </button>
          </div>
        );

      case 'register':
        return (
          <div class="auth-surface-placeholder" data-surface="register">
            <h2>Register Surface</h2>
            <p>Email: {authEmail || '(empty)'}</p>
            <p>Confirm Password: {authConfirmPassword ? '***' : '(empty)'}</p>
            <button type="button" onClick={() => switchAuthSurface('login')}>
              Switch to Login
            </button>
          </div>
        );

      case 'reset':
        return (
          <div class="auth-surface-placeholder" data-surface="reset">
            <h2>Reset Password Surface</h2>
            <p>Reset Email Sent: {resetEmailSent ? 'true' : 'false'}</p>
            <button type="button" onClick={() => switchAuthSurface('login')}>
              Back to Login
            </button>
          </div>
        );

      case 'updatePassword':
        return (
          <div class="auth-surface-placeholder" data-surface="updatePassword">
            <h2>Update Password Surface</h2>
            <p>Password Update Success: {passwordUpdateSuccess ? 'true' : 'false'}</p>
            <p>Recovery Mode: {isPasswordRecoveryMode ? 'true' : 'false'}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div class="auth-surface-container">
      {/* Error display */}
      {error && (
        <div class="error-message" onClick={clearError}>
          {error}
        </div>
      )}

      {/* Success message display */}
      {successMessage && (
        <div class="success-message" onClick={clearSuccessMessage}>
          {successMessage}
        </div>
      )}

      {/* Sub-surface content */}
      {renderSubSurface()}

      {/* Debug info (remove in production) */}
      <div class="debug-info" style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#666' }}>
        <p>Current sub-surface: {authSurface}</p>
        <p>Password visibility - Login: {showLoginPassword ? 'on' : 'off'}, Register: {showRegisterPassword ? 'on' : 'off'}</p>
      </div>
    </div>
  );
}

export default AuthSurface;
