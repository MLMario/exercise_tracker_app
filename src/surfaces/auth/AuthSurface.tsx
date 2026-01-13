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
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { UpdatePasswordForm } from './UpdatePasswordForm';

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
   * Matches js/app.js lines 208-226
   */
  const switchAuthSurface = (surface: AuthSubSurface) => {
    setAuthSurface(surface);
    setError('');
    setSuccessMessage('');

    // Reset status flags when switching surfaces
    if (surface !== 'reset') {
      setResetEmailSent(false);
    }
    if (surface !== 'updatePassword') {
      setPasswordUpdateSuccess(false);
    }

    // Clear password fields when switching surfaces
    setAuthPassword('');
    setAuthConfirmPassword('');
  };

  /**
   * Toggle password visibility for a specific field
   * Matches js/app.js lines 228-240
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
   * Validate that password and confirm password match
   * Matches js/app.js lines 269-271
   */
  const validatePasswords = (): boolean => {
    return authPassword === authConfirmPassword;
  };

  /**
   * Handle auth form submission (login or register)
   * Matches js/app.js lines 168-206
   */
  const handleAuth = async () => {
    setError('');
    setAuthLoading(true);

    // Validate inputs
    if (!authEmail || !authPassword) {
      setError('Email and password are required');
      setAuthLoading(false);
      return;
    }

    try {
      let result;
      if (authSurface === 'login') {
        result = await auth.login(authEmail, authPassword);
      } else {
        // Validate password confirmation for register mode
        if (!validatePasswords()) {
          setError('Passwords do not match');
          setAuthLoading(false);
          return;
        }
        result = await auth.register(authEmail, authPassword);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        // Clear form fields on success
        setAuthEmail('');
        setAuthPassword('');
        setAuthConfirmPassword('');
        setSuccessMessage(
          authSurface === 'login'
            ? 'Logged in successfully'
            : 'Account created successfully'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Handle password reset request
   * Matches js/app.js lines 242-267
   */
  const handlePasswordReset = async () => {
    setError('');
    setSuccessMessage('');

    if (!authEmail) {
      setError('Email is required');
      return;
    }

    setAuthLoading(true);

    try {
      const result = await auth.resetPassword(authEmail);

      if (result.error) {
        setError(result.error.message);
      } else {
        setResetEmailSent(true);
        setSuccessMessage('Password reset email sent. Check your inbox.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Handle password update (after clicking recovery link)
   * Matches js/app.js lines 273-308
   */
  const handlePasswordUpdate = async () => {
    setError('');
    setSuccessMessage('');

    // Validate passwords match
    if (authPassword !== authConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (authPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setAuthLoading(true);

    try {
      const result = await auth.updateUser(authPassword);

      if (result.error) {
        setError(result.error.message);
      } else {
        setPasswordUpdateSuccess(true);
        setSuccessMessage('Password updated successfully!');
        // Clear password fields
        setAuthPassword('');
        setAuthConfirmPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Navigate to login after password update success
   * Matches js/app.js lines 310-318
   */
  const goToLoginAfterPasswordUpdate = () => {
    setPasswordUpdateSuccess(false);
    setIsPasswordRecoveryMode(false); // Clear flag so normal auth flow resumes
    // Clear URL hash to remove recovery tokens - prevents main.tsx from re-detecting recovery mode
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
    setAuthSurface('login');
    setError('');
    setSuccessMessage('');
    setShowUpdatePassword(false);
    setShowUpdateConfirmPassword(false);
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

  /**
   * Render the appropriate sub-surface based on authSurface state
   */
  const renderSubSurface = () => {
    switch (authSurface) {
      case 'login':
        return (
          <LoginForm
            email={authEmail}
            setEmail={setAuthEmail}
            setPassword={setAuthPassword}
            showPassword={showLoginPassword}
            onTogglePassword={() => togglePasswordVisibility('login')}
            error={error}
            isLoading={authLoading}
            onSubmit={handleAuth}
            onForgotPassword={() => switchAuthSurface('reset')}
          />
        );

      case 'register':
        return (
          <RegisterForm
            email={authEmail}
            setEmail={setAuthEmail}
            setPassword={setAuthPassword}
            setConfirmPassword={setAuthConfirmPassword}
            showPassword={showRegisterPassword}
            showConfirmPassword={showConfirmPassword}
            onTogglePassword={(field) => togglePasswordVisibility(field)}
            error={error}
            isLoading={authLoading}
            onSubmit={handleAuth}
          />
        );

      case 'reset':
        return (
          <ResetPasswordForm
            email={authEmail}
            setEmail={setAuthEmail}
            error={error}
            isLoading={authLoading}
            resetEmailSent={resetEmailSent}
            onSubmit={handlePasswordReset}
            onBackToLogin={() => switchAuthSurface('login')}
          />
        );

      case 'updatePassword':
        return (
          <UpdatePasswordForm
            password={authPassword}
            setPassword={setAuthPassword}
            confirmPassword={authConfirmPassword}
            setConfirmPassword={setAuthConfirmPassword}
            showPassword={showUpdatePassword}
            showConfirmPassword={showUpdateConfirmPassword}
            onTogglePassword={(field) => togglePasswordVisibility(field)}
            error={error}
            isLoading={authLoading}
            passwordUpdateSuccess={passwordUpdateSuccess}
            onSubmit={handlePasswordUpdate}
            onGoToLogin={goToLoginAfterPasswordUpdate}
          />
        );

      default:
        return null;
    }
  };

  // Determine if tabs should be shown
  const showTabs = authSurface !== 'reset' && authSurface !== 'updatePassword';

  return (
    <div class="auth-surface-container">
      {/* Tab Navigation - matches index.html lines 30-43 */}
      {showTabs && (
        <div class="auth-tabs">
          <button
            class={`auth-tab${authSurface === 'login' ? ' active' : ''}`}
            onClick={() => switchAuthSurface('login')}
          >
            Login
          </button>
          <button
            class={`auth-tab${authSurface === 'register' ? ' active' : ''}`}
            onClick={() => switchAuthSurface('register')}
          >
            Register
          </button>
        </div>
      )}

      {/* Success message display */}
      {successMessage && (
        <div class="success-message" onClick={clearSuccessMessage}>
          {successMessage}
        </div>
      )}

      {/* Surfaces Container */}
      <div class="surfaces-container">
        {renderSubSurface()}
      </div>

      {/* Footer switch links */}
      {showTabs && (
        <div class="auth-footer">
          {authSurface === 'login' ? (
            <p>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchAuthSurface('register'); }}>
                Sign up
              </a>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchAuthSurface('login'); }}>
                Log in
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default AuthSurface;
