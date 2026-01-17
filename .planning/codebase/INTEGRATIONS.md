# External Integrations

**Analysis Date:** 2026-01-12

## APIs & External Services

**Payment Processing:**
- Not used

**Email/SMS:**
- Supabase Auth - Password reset emails handled by Supabase (built-in)

**External APIs:**
- None

## Data Storage

**Databases:**
- PostgreSQL on Supabase - Primary data store
  - Connection: via Supabase JS SDK (CDN)
  - Auth: Supabase anon key in `js/config.local.js`
  - Tables: exercises, templates, template_exercises, template_exercise_sets, workout_logs, workout_log_exercises, workout_log_sets, user_charts
  - Migrations: `sql/` directory (manual execution in Supabase dashboard)

**File Storage:**
- Not used

**Caching:**
- LocalStorage - Workout state backup for session recovery
  - Key: `activeWorkout_{user_id}`
  - Location: `js/app.js` (saveWorkoutToStorage, loadWorkoutFromStorage)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Email/password authentication
  - Implementation: `js/auth.js` wrapping Supabase client methods
  - Token storage: Handled by Supabase JS SDK (localStorage)
  - Session management: Automatic via supabaseClient.auth

**Features:**
- User registration (`auth.register`)
- Login/logout (`auth.login`, `auth.logout`)
- Password reset flow (`auth.resetPassword`, `auth.updateUser`)
- Auth state listener (`auth.onAuthStateChange`)

**OAuth Integrations:**
- None configured

## Monitoring & Observability

**Error Tracking:**
- None - errors logged to browser console only

**Analytics:**
- None

**Logs:**
- Browser console only
- Debug logging in auth module: `console.log('[AUTH DEBUG]...')`

## CI/CD & Deployment

**Hosting:**
- Static file hosting (deployment target configurable)
- No specific platform configured

**CI Pipeline:**
- None configured

## Environment Configuration

**Development:**
- Required: Create `js/config.local.js` with Supabase credentials
- Template: `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`
- No .env files (pure browser app)

**Staging:**
- Not configured

**Production:**
- Same as development - config.local.js with production Supabase credentials
- Anon key is safe to expose (RLS policies protect data)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-01-12*
*Update when adding/removing external services*
