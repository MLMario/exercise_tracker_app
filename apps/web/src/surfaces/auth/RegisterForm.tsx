/**
 * RegisterForm Component
 *
 * Controlled form component for user registration.
 * Receives all state and handlers from parent AuthSurface component.
 *
 * Matches behavior from js/app.js handleAuth and index.html lines 100-172.
 */

import type { JSX } from 'preact';

/**
 * Props interface for RegisterForm component
 */
export interface RegisterFormProps {
  /** Email input value */
  email: string;
  /** Email setter function */
  setEmail: (email: string) => void;
  /** Password setter function (value managed by parent) */
  setPassword: (password: string) => void;
  /** Confirm password setter function */
  setConfirmPassword: (confirmPassword: string) => void;
  /** Password visibility state */
  showPassword: boolean;
  /** Confirm password visibility state */
  showConfirmPassword: boolean;
  /** Toggle password visibility handler */
  onTogglePassword: (field: 'register' | 'confirm') => void;
  /** Error message to display */
  error: string;
  /** Loading state for submit button */
  isLoading: boolean;
  /** Form submission handler */
  onSubmit: () => void;
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
 * RegisterForm Component
 *
 * Renders the registration form with email/password/confirm inputs,
 * password visibility toggles, and password hint.
 */
export function RegisterForm({
  email,
  setEmail,
  setPassword,
  setConfirmPassword,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  error,
  isLoading,
  onSubmit,
}: RegisterFormProps) {
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
      <form onSubmit={handleSubmit}>
        {/* Error Message */}
        {error && <div class="error-message">{error}</div>}

        <div class="form-group">
          <label for="register-email">Email</label>
          <input
            type="email"
            id="register-email"
            class="input"
            value={email}
            onInput={handleEmailChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="register-password">Password</label>
          <div class="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="register-password"
              class="input has-toggle"
              onInput={handlePasswordChange}
              placeholder="Create a password"
              required
              minLength={6}
            />
            <button
              type="button"
              class="password-toggle"
              onClick={() => onTogglePassword('register')}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <p class="password-hint">Minimum 6 characters</p>
        </div>

        <div class="form-group">
          <label for="register-confirm">Confirm Password</label>
          <div class="input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="register-confirm"
              class="input has-toggle"
              onInput={handleConfirmPasswordChange}
              placeholder="Confirm your password"
              required
              minLength={6}
            />
            <button
              type="button"
              class="password-toggle"
              onClick={() => onTogglePassword('confirm')}
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
          <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;
