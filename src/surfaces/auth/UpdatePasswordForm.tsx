/**
 * UpdatePasswordForm Component
 *
 * Controlled form component for setting a new password after password recovery.
 * Receives all state and handlers from parent AuthSurface component.
 *
 * Matches behavior from js/app.js handlePasswordUpdate and index.html lines 216-300.
 */

import type { JSX } from 'preact';

/**
 * Props interface for UpdatePasswordForm component
 */
export interface UpdatePasswordFormProps {
  /** Password input value */
  password: string;
  /** Password setter function */
  setPassword: (password: string) => void;
  /** Confirm password input value */
  confirmPassword: string;
  /** Confirm password setter function */
  setConfirmPassword: (confirmPassword: string) => void;
  /** Password visibility state */
  showPassword: boolean;
  /** Confirm password visibility state */
  showConfirmPassword: boolean;
  /** Toggle password visibility handler */
  onTogglePassword: (field: 'update' | 'updateConfirm') => void;
  /** Error message to display */
  error: string;
  /** Loading state for submit button */
  isLoading: boolean;
  /** Whether password update was successful (shows success state) */
  passwordUpdateSuccess: boolean;
  /** Form submission handler */
  onSubmit: () => void;
  /** Go to login after successful update handler */
  onGoToLogin: () => void;
}

/**
 * Eye icon SVG for showing password
 */
function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

/**
 * Eye-off icon SVG for hiding password
 */
function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

/**
 * UpdatePasswordForm Component
 *
 * Renders the update password form with password/confirm inputs,
 * password visibility toggles, success state, and go to login button.
 */
export function UpdatePasswordForm({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  error,
  isLoading,
  passwordUpdateSuccess,
  onSubmit,
  onGoToLogin,
}: UpdatePasswordFormProps) {
  /**
   * Handle form submission
   */
  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  /**
   * Handle password input change
   */
  const handlePasswordChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  };

  /**
   * Handle confirm password input change
   */
  const handleConfirmPasswordChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
    setConfirmPassword(e.currentTarget.value);
  };

  return (
    <div class="auth-surface active">
      <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Set New Password</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Enter your new password below.
      </p>

      {/* Success State */}
      {passwordUpdateSuccess ? (
        <div>
          <div class="success-message">
            Your password has been updated successfully!
          </div>
          <button
            type="button"
            class="btn btn-primary btn-block"
            onClick={onGoToLogin}
          >
            Go to Login
          </button>
        </div>
      ) : (
        /* Form State */
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && <div class="error-message">{error}</div>}

          <div class="form-group">
            <label for="update-password">New Password</label>
            <div class="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="update-password"
                class="input has-toggle"
                value={password}
                onInput={handlePasswordChange}
                placeholder="Enter new password"
                required
                minLength={6}
              />
              <button
                type="button"
                class="password-toggle"
                onClick={() => onTogglePassword('update')}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <p class="password-hint">Minimum 6 characters</p>
          </div>

          <div class="form-group">
            <label for="update-confirm">Confirm New Password</label>
            <div class="input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="update-confirm"
                class="input has-toggle"
                value={confirmPassword}
                onInput={handleConfirmPasswordChange}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
              <button
                type="button"
                class="password-toggle"
                onClick={() => onTogglePassword('updateConfirm')}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            class={`btn btn-primary btn-block btn-submit${isLoading ? ' loading' : ''}`}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default UpdatePasswordForm;
