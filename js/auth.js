/**
 * Authentication Module for Exercise Tracker App
 *
 * This module provides authentication functions using Supabase Auth.
 * All functions work with the global window.supabaseClient instance.
 *
 * Dependencies:
 * - Supabase client (window.supabaseClient must be initialized)
 * - Alpine.js (for reactivity in the app)
 */

/**
 * Register a new user with email and password
 *
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{user: Object|null, error: Error|null}>} Registration result
 */
async function register(email, password) {
  try {
    // Validate inputs
    if (!email || !password) {
      return {
        user: null,
        error: new Error('Email and password are required')
      };
    }

    if (password.length < 6) {
      return {
        user: null,
        error: new Error('Password must be at least 6 characters long')
      };
    }

    // Attempt to sign up the user
    const { data, error } = await window.supabaseClient.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('Registration error:', err);
    return {
      user: null,
      error: err
    };
  }
}

/**
 * Login an existing user with email and password
 *
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{user: Object|null, error: Error|null}>} Login result
 */
async function login(email, password) {
  try {
    // Validate inputs
    if (!email || !password) {
      return {
        user: null,
        error: new Error('Email and password are required')
      };
    }

    // Attempt to sign in the user
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('Login error:', err);
    return {
      user: null,
      error: err
    };
  }
}

/**
 * Logout the current user
 *
 * @returns {Promise<{error: Error|null}>} Logout result
 */
async function logout() {
  try {
    const { error } = await window.supabaseClient.auth.signOut();

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error('Logout error:', err);
    return { error: err };
  }
}

/**
 * Reset password for a user via email
 *
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, error: Error|null}>} Reset password result
 */
async function resetPassword(email) {
  try {
    // Validate input
    if (!email) {
      return {
        success: false,
        error: new Error('Email is required')
      };
    }

    // Get the current site URL for the redirect
    // This ensures the reset link brings users back to this exact deployment
    const redirectTo = window.location.origin + window.location.pathname;
    console.log('[AUTH DEBUG] resetPasswordForEmail redirectTo:', redirectTo);

    // Attempt to send password reset email with explicit redirect URL
    const { data, error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Reset password error:', err);
    return {
      success: false,
      error: err
    };
  }
}

/**
 * Update user's password (used after PASSWORD_RECOVERY event)
 *
 * @param {string} password - New password
 * @returns {Promise<{success: boolean, error: Error|null}>} Update result
 */
async function updateUser(password) {
  try {
    if (!password) {
      return {
        success: false,
        error: new Error('Password is required')
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: new Error('Password must be at least 6 characters')
      };
    }

    const { data, error } = await window.supabaseClient.auth.updateUser({ password });

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Update user error:', err);
    return {
      success: false,
      error: err
    };
  }
}

/**
 * Get the current authenticated user
 *
 * @returns {Promise<Object|null>} Current user object or null if not authenticated
 */
async function getCurrentUser() {
  try {
    const { data, error } = await window.supabaseClient.auth.getUser();

    if (error) {
      console.error('Get current user error:', error);
      return null;
    }

    return data.user;
  } catch (err) {
    console.error('Get current user error:', err);
    return null;
  }
}

/**
 * Get the current session
 *
 * @returns {Promise<Object|null>} Current session object or null if no active session
 */
async function getSession() {
  try {
    const { data, error } = await window.supabaseClient.auth.getSession();

    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    return data.session;
  } catch (err) {
    console.error('Get session error:', err);
    return null;
  }
}

/**
 * Listen for authentication state changes
 *
 * @param {Function} callback - Callback function to execute on auth state change
 *                              Receives (event, session) as parameters
 * @returns {Object} Subscription object with unsubscribe method for cleanup
 */
function onAuthStateChange(callback) {
  try {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    const { data: subscription } = window.supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        // Execute the callback with event and session data
        callback(event, session);
      }
    );

    // Return subscription for cleanup
    return subscription;
  } catch (err) {
    console.error('Auth state change listener error:', err);
    return null;
  }
}

/**
 * Export all authentication functions to the window object
 * for use throughout the application
 */
window.auth = {
  register,
  login,
  logout,
  resetPassword,
  updateUser,
  getCurrentUser,
  getSession,
  onAuthStateChange
};

console.log('Auth module loaded successfully');
