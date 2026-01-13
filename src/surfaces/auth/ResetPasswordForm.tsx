/**
 * ResetPasswordForm Component
 *
 * Controlled form component for password reset request.
 * Receives all state and handlers from parent AuthSurface component.
 *
 * Matches behavior from js/app.js handlePasswordReset and index.html lines 174-214.
 */

import type { JSX } from 'preact';

/**
 * Props interface for ResetPasswordForm component
 */
export interface ResetPasswordFormProps {
  /** Email input value */
  email: string;
  /** Email setter function */
  setEmail: (email: string) => void;
  /** Error message to display */
  error: string;
  /** Loading state for submit button */
  isLoading: boolean;
  /** Whether reset email has been sent (shows success state) */
  resetEmailSent: boolean;
  /** Form submission handler */
  onSubmit: () => void;
  /** Back to login handler */
  onBackToLogin: () => void;
}

/**
 * ResetPasswordForm Component
 *
 * Renders the password reset request form with email input,
 * success message when email is sent, and back to login link.
 */
export function ResetPasswordForm({
  email,
  setEmail,
  error,
  isLoading,
  resetEmailSent,
  onSubmit,
  onBackToLogin,
}: ResetPasswordFormProps) {
  /**
   * Handle form submission
   */
  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  /**
   * Handle email input change
   */
  const handleEmailChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
  };

  /**
   * Handle back to login click
   */
  const handleBackClick = (e: JSX.TargetedEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onBackToLogin();
  };

  return (
    <div class="auth-surface active">
      <a href="#" class="back-link" onClick={handleBackClick}>
        <span>←</span> Back to login
      </a>

      <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Reset Password</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Success Message */}
        {resetEmailSent && (
          <div class="success-message">
            Check your email for reset instructions.
          </div>
        )}

        {/* Error Message */}
        {error && <div class="error-message">{error}</div>}

        {!resetEmailSent && (
          <div class="form-group">
            <label for="reset-email">Email</label>
            <input
              type="email"
              id="reset-email"
              class="input"
              value={email}
              onInput={handleEmailChange}
              placeholder="you@example.com"
              required
            />
          </div>
        )}

        {!resetEmailSent && (
          <button
            type="submit"
            class={`btn btn-primary btn-block btn-submit${isLoading ? ' loading' : ''}`}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
          </button>
        )}
      </form>
    </div>
  );
}

export default ResetPasswordForm;
