# Coding Conventions

**Analysis Date:** 2026-01-12

## Naming Patterns

**Files:**
- kebab-case for all JS files (`auth.js`, `supabase.js`, `config.local.js`)
- No test files (testing not implemented)
- Single `index.html` entry point

**Functions:**
- camelCase for all functions (`handleAuth`, `loadDashboard`, `getTemplates`)
- Async functions: no special prefix (`async function createWorkoutLog`)
- Handlers: `handle*` prefix (`handleAuth`, `handleLogout`, `handlePasswordReset`)
- Getters: `get*` prefix (`getTemplates`, `getSession`, `getCurrentUser`)

**Variables:**
- camelCase for variables (`authEmail`, `timerSeconds`, `activeWorkout`)
- UPPER_SNAKE_CASE for constants (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
- No underscore prefix for private members

**Types:**
- No TypeScript - plain JavaScript
- JSDoc comments for type hints

## Code Style

**Formatting:**
- 2-space indentation
- Single quotes for strings (mostly)
- Semicolons required
- ~100 character line length

**Linting:**
- No ESLint or Prettier configured
- Manual code style consistency

## Import Organization

**Script Loading Order (in index.html):**
1. External CDN scripts (Supabase, Alpine, Chart.js)
2. Local config (`js/config.local.js`)
3. Core modules (`js/supabase.js`)
4. Service modules (`js/auth.js`, `js/exercises.js`, etc.)
5. App entry (`js/app.js`)

**Module Exports:**
- All modules export to `window` namespace
- Example: `window.auth = { login, register, ... }`

**No Path Aliases:**
- Direct script tag loading, no imports/exports

## Error Handling

**Patterns:**
- Return `{ data, error }` or `{ error }` objects from service functions
- Check for error in caller and set UI state
- Try/catch wrapping async operations

**Error Types:**
- Standard JavaScript `Error` objects
- Supabase error objects passed through

**Example pattern from `js/auth.js`:**
```javascript
async function login(email, password) {
  try {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email, password
    });
    if (error) return { user: null, error };
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
}
```

## Logging

**Framework:**
- Browser console only (`console.log`, `console.error`)
- Debug prefix: `[AUTH DEBUG]` for auth-related logs

**Patterns:**
- Log errors before returning: `console.error('Error:', error)`
- Debug logs for auth flow: `console.log('[AUTH DEBUG] Event:', event)`

## Comments

**When to Comment:**
- Module header with description and dependencies (`js/auth.js`)
- JSDoc for public API functions
- Complex logic explanation

**JSDoc:**
- Used for all service module functions
- Format: `@param`, `@returns`

**Example from `js/auth.js`:**
```javascript
/**
 * Register a new user with email and password
 *
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
```

**TODO Comments:**
- None found in codebase (clean)

## Function Design

**Size:**
- Most functions under 50 lines
- Main Alpine component has larger methods

**Parameters:**
- Support both object and separate parameters for flexibility
- Example from `js/logging.js`:
```javascript
async function createWorkoutLog(workoutDataOrTemplateId, startedAt, exercises) {
  // Support both object parameter and separate parameters
  let templateId, workoutStartedAt, workoutExercises;
  if (typeof workoutDataOrTemplateId === 'object') {
    // Called with object
  } else {
    // Called with separate params
  }
}
```

**Return Values:**
- Consistent `{ data, error }` pattern
- Always return error: null on success

## Module Design

**Exports:**
- All exports to window namespace
- Object with named functions

**Pattern:**
```javascript
// At end of each module
window.moduleName = {
  functionA,
  functionB,
  functionC
};
```

**No Barrel Files:**
- Each module self-contained
- No index.js re-exports

## Alpine.js Conventions

**Component Structure:**
- Single component `fitnessApp` via `Alpine.data()`
- All state as reactive properties
- Methods mixed with data

**State Naming:**
- UI state: `isLoading`, `showExercisePicker`, `currentSurface`
- Form state: `authEmail`, `authPassword`, `newExerciseName`
- Data arrays: `templates`, `userCharts`, `availableExercises`

**Event Handlers:**
- Form submission: `@submit.prevent="handleAuth"`
- Click handlers: `@click="startWorkoutFromTemplate(template)"`

---

*Convention analysis: 2026-01-12*
*Update when patterns change*
