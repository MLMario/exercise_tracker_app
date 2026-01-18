# External Integrations

**Analysis Date:** 2026-01-17

## APIs & External Services

**Payment Processing:**
- Not detected

**Email/SMS:**
- Not detected (Supabase built-in auth emails only)

**External APIs:**
- Not detected

## Data Storage

**Databases:**
- Supabase (PostgreSQL) - Primary data store
  - Connection: via `VITE_SUPABASE_URL` env var
  - Client: @supabase/supabase-js 2.90.1 (`packages/shared/src/lib/supabase.ts`)
  - Tables: `exercises`, `templates`, `template_exercises`, `template_exercise_sets`, `workout_logs`, `workout_log_exercises`, `workout_log_sets`, `user_charts`
  - Migrations: SQL files in `sql/` directory

**File Storage:**
- Not detected (no user uploads)

**Caching:**
- localStorage - Active workout backup (`apps/web/src/main.tsx`)
  - Key format: `activeWorkout_${userId}`
  - Purpose: Resume interrupted workouts

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Email/password authentication
  - Implementation: Supabase client SDK (`packages/shared/src/services/auth.ts`)
  - Token storage: Handled by Supabase client (localStorage)
  - Session management: Supabase built-in session handling
  - Features: Register, login, logout, password reset

**OAuth Integrations:**
- Not configured (email/password only)

## Monitoring & Observability

**Error Tracking:**
- Not configured (no Sentry, Bugsnag, etc.)

**Analytics:**
- Not configured (no Google Analytics, Mixpanel, etc.)

**Logs:**
- Console only (stdout/stderr)
- Debug logs with `[DEBUG module]` prefix
- No external logging service

## CI/CD & Deployment

**Hosting:**
- Vercel - Web application hosting (`vercel.json`)
  - Deployment: Automatic on push (assumed)
  - Build command: `pnpm --filter @ironlift/web build`
  - Output directory: `apps/web/dist`
  - Install command: `pnpm install`

**CI Pipeline:**
- Not configured (no GitHub Actions workflows)

## Environment Configuration

**Development:**
- Required env vars:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- Secrets location: `.env` file (local)
- Template: `.env.example` available

**Staging:**
- Not configured (single environment)

**Production:**
- Secrets management: Vercel environment variables
- Same Supabase project as development (assumed)

## Webhooks & Callbacks

**Incoming:**
- Not detected

**Outgoing:**
- Not detected

## Service Dependencies

**Supabase Services Used:**
- Authentication (`supabase.auth.*`)
  - `signUp`, `signInWithPassword`, `signOut`
  - `resetPasswordForEmail`, `updateUser`
  - `onAuthStateChange` listener
- Database (`supabase.from().*`)
  - `select`, `insert`, `update`, `delete`
  - Nested selects for related data
- No Storage, Realtime, or Edge Functions detected

**Chart.js Integration:**
- Library: chart.js 4.5.1 (`packages/shared/src/services/charts.ts`)
- Components: LineController, CategoryScale, LinearScale, PointElement
- Purpose: Render exercise performance line charts
- Client-side only (no server integration)

## Third-Party Libraries

**Critical Dependencies:**
- @supabase/supabase-js 2.90.1 - Backend communication
- chart.js 4.5.1 - Data visualization
- preact 10.28.2 - UI framework
- alpinejs 3.15.3 - DOM manipulation

**No External Service Integrations:**
- No payment processing (Stripe, PayPal)
- No email service (SendGrid, Mailgun)
- No analytics (GA, Mixpanel, Amplitude)
- No error tracking (Sentry, Bugsnag)
- No feature flags (LaunchDarkly, Split)

---

*Integration audit: 2026-01-17*
*Update when adding/removing external services*
