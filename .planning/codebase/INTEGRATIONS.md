# External Integrations

**Analysis Date:** 2026-02-09

## APIs & External Services

**Supabase (Primary Backend):**
- Supabase - Complete backend-as-a-service for database, authentication, and APIs
  - SDK/Client: `@supabase/supabase-js` 2.90.1
  - Location: `packages/shared/src/lib/supabase.ts` (client initialization)
  - Initialized with: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Data Storage

**Databases:**
- PostgreSQL (hosted on Supabase)
  - Client: `@supabase/supabase-js` (createClient)
  - Connection: Environment variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Schema location: `sql/` directory
    - `current_schema.sql` - Active database schema
    - Migration files for version control:
      - `migration_cascade_delete.sql`
      - `migration_per_set_tracking.sql`
      - `migration_schema_cleanup.sql`
      - `migration_system_exercises.sql`
      - `migration_template_sets.sql`
  - Tables (from schema and code usage):
    - `exercises` - Exercise library with categories, equipment, metadata
    - `templates` - Workout template definitions (user-owned)
    - `template_exercises` - Junction table linking exercises to templates
    - `workout_logs` - Recorded workout sessions with timestamp
    - `workout_log_exercises` - Exercises performed in a workout session
    - `workout_log_sets` - Individual sets (weight, reps) within each exercise

**File Storage:**
- Local filesystem only
  - No external file storage service (S3, Cloud Storage) detected
  - Static assets served from `apps/web/assets/`

**Caching:**
- None configured
- In-memory state management via Preact hooks

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
  - Implementation: Email/password authentication
  - Service location: `packages/shared/src/services/auth.ts`
  - Features:
    - User registration (email + password, min 6 characters)
    - Email/password login
    - Session management (getSession, getCurrentUser)
    - Password reset (resetPasswordForEmail with redirect URL)
    - Password update (updateUser)
    - Auth state subscriptions (onAuthStateChange)
  - Session storage: Browser storage managed by Supabase SDK (localStorage)
  - Password recovery: Email-based with redirect URL set to current origin

## Monitoring & Observability

**Error Tracking:**
- Not detected - No external error tracking service configured
- Error handling: Console logging with error objects

**Logs:**
- Console-based logging (console.error, console.warn)
- Location: Service functions log errors to browser console
  - `packages/shared/src/services/` - Error logs in auth, exercises, logging, templates
  - `packages/shared/src/lib/supabase.ts` - Client initialization validation errors
- No centralized logging or log aggregation service detected

## CI/CD & Deployment

**Hosting:**
- Vercel (configured in `vercel.json`)
  - Build command: `pnpm --filter @ironlift/web build`
  - Output directory: `apps/web/dist`
  - Install command: `pnpm install`
  - Framework: Vite

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or CircleCI config found
- Manual deployment assumed (push to Vercel from git)

## Environment Configuration

**Required env vars:**
- `VITE_SUPABASE_URL` - Supabase project URL (format: https://xxxx.supabase.co)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

**Type definitions:**
- Defined in `packages/shared/src/env.d.ts`
- Vite client type definitions referenced

**Secrets location:**
- `.env` file at project root (not committed)
- Loaded by Vite from root directory (via `envDir: '../../'` in vite.config.ts)
- Client-safe variables only (prefixed with VITE_)

## Webhooks & Callbacks

**Incoming:**
- Not detected - No incoming webhook endpoints configured
- Password reset callback: Supabase redirects recovery emails to `window.location.origin + window.location.pathname`

**Outgoing:**
- None configured
- App consumes Supabase database changes via subscriptions (polling model)

## Real-time Features

**Supabase Real-time:**
- Not explicitly used in current codebase
- Auth state changes subscribed via `auth.onAuthStateChange()` listener
  - Responds to: SIGNED_IN, SIGNED_OUT, PASSWORD_RECOVERY events
  - Location: `apps/web/src/main.tsx` line 148

## Data Synchronization

**Backup/Sync:**
- Local storage backup of active workout in progress
  - Key: `activeWorkout_${userId}` in localStorage
  - Location: `apps/web/src/main.tsx` (checkForSavedWorkout function)
  - Automatic save via useWorkoutBackup hook in shared package

## Cross-Origin & CORS

**API Requests:**
- All requests through Supabase SDK (handles CORS automatically)
- Password reset email links set to current origin for proper redirect handling

---

*Integration audit: 2026-02-09*
