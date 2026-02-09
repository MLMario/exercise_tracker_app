# Architecture

**Analysis Date:** 2026-02-09

## Pattern Overview

**Overall:** Monorepo with multi-app architecture using pnpm workspaces. Web application follows a surface-based UI routing pattern with a shared business logic layer.

**Key Characteristics:**
- Surface-based routing: Four major UI surfaces (Auth, Dashboard, TemplateEditor, Workout) controlled by top-level state in `App` component
- Separation of concerns: UI surfaces in `apps/web/src/surfaces/`, business logic in `packages/shared/src/services/`
- Monorepo workspace structure with root `package.json` coordinating pnpm workspaces
- Type-first TypeScript/Preact with no runtime framework dependencies (Preact is 10KB)
- Supabase for authentication and database
- Chart.js for data visualization

## Layers

**Application Layer (UI Surfaces):**
- Purpose: Render UI and manage local component state for major app sections
- Location: `apps/web/src/surfaces/`
- Contains: Four surface components - AuthSurface, DashboardSurface, TemplateEditorSurface, WorkoutSurface
- Depends on: Services layer, Shared components, Preact hooks
- Used by: Root App component in `apps/web/src/main.tsx`

**Routing & Navigation Layer:**
- Purpose: Top-level surface state management and routing between surfaces
- Location: `apps/web/src/main.tsx` (App component, lines 99-327)
- Contains: AppSurface type definition, auth state management, surface callbacks
- Depends on: Auth service, all surfaces
- Used by: Preact render function (line 339)

**Component Layer:**
- Purpose: Reusable UI components shared across surfaces
- Location: `apps/web/src/components/`
- Contains: ConfirmationModal, ExercisePickerModal, InfoModal
- Depends on: Preact, local hooks
- Used by: Dashboard and Workout surfaces

**Hook Layer (Local):**
- Purpose: Web-app-specific hooks for UI state and operations
- Location: `apps/web/src/hooks/`
- Contains: useAsyncOperation, useClickOutside, custom hooks
- Depends on: Preact hooks
- Used by: Surface and component code

**Service Layer (Business Logic):**
- Purpose: All application business logic, data fetching, and external API interaction
- Location: `packages/shared/src/services/`
- Contains: auth, exercises, templates, charts, logging, test-utils
- Depends on: Supabase client, database types
- Used by: Surfaces and components throughout web app; iOS app will use same layer

**Data Layer (Database Client):**
- Purpose: Supabase connection and environment configuration
- Location: `packages/shared/src/lib/supabase.ts`
- Contains: Typed Supabase client initialization with environment variable validation
- Depends on: @supabase/supabase-js, environment variables
- Used by: All service modules

**Type Layer:**
- Purpose: Type definitions for database entities, services, and domain models
- Location: `packages/shared/src/types/`
- Contains: database.ts (Exercise, Template, WorkoutLog types), services.ts (service return types)
- Depends on: @supabase/supabase-js types
- Used by: Services, surfaces, components, all application code

## Data Flow

**Authentication Flow:**

1. App component initializes and checks session via `auth.getSession()`
2. If no session exists or password recovery mode detected, render AuthSurface
3. AuthSurface renders LoginForm/RegisterForm/ResetPasswordForm based on mode
4. Form submission calls `auth.login()`, `auth.register()`, or `auth.resetPassword()`
5. Auth service sends request through Supabase client
6. Supabase emits `onAuthStateChange` event
7. Auth listener in App component (lines 136-196) catches `SIGNED_IN` event
8. App state updates: user set, currentSurface changed to 'dashboard'
9. App renders DashboardSurface

**Workout Execution Flow:**

1. DashboardSurface displays TemplateList
2. User clicks "Start Workout" on a template
3. DashboardSurface calls `onStartWorkout` callback passed from App
4. App sets activeWorkoutTemplate state, changes currentSurface to 'workout'
5. App renders WorkoutSurface with template
6. WorkoutSurface manages workout UI state (exercise progress, set completion)
7. On completion, WorkoutSurface calls `onFinish` callback
8. App resets workout state, returns to DashboardSurface
9. DashboardSurface data is fresh (templates and charts may have changed)

**Saved Workout Recovery Flow:**

1. App initializes and calls `checkForSavedWorkout(userId)` (lines 59-78)
2. Function reads localStorage key `activeWorkout_${userId}`
3. If valid saved workout exists, sets restoredWorkoutData state
4. App renders WorkoutSurface with restoredWorkout prop
5. WorkoutSurface resumes incomplete workout from saved data
6. On completion, clears saved workout from localStorage

**Template Editor Flow:**

1. User clicks "Edit" on template in TemplateList or "Create New"
2. DashboardSurface calls editTemplate callback
3. App sets editingTemplate state (either 'new' or TemplateWithExercises object)
4. App renders TemplateEditorSurface
5. TemplateEditorSurface manages exercise selection and set defaults
6. On save, TemplateEditorSurface calls `templates.createTemplate()` or `templates.updateTemplate()`
7. Service sends request through Supabase
8. TemplateEditorSurface calls `onSave` callback
9. App clears editingTemplate state, returns to dashboard
10. DashboardSurface re-fetches templates to display updates

**Chart Data Flow:**

1. DashboardSurface initializes with chartsNeedRefresh = true
2. useEffect fetches userCharts via `charts.getUserCharts()`
3. For each chart, fetches data via `charts.getChartData()`
4. ChartCard renders Chart.js instance with fetched data
5. If user creates new chart in AddChartModal:
   - Modal calls `charts.createChart()`
   - Sets chartsNeedRefresh = true
   - DashboardSurface re-fetches all charts and data

**State Management:**

- Local component state for UI (modals, loading, forms) managed with `useState`
- Top-level surface routing state in App component
- Async operations managed with `useAsyncOperation` hook
- Modal states managed with `useConfirmationModal` hook from shared
- No global state management library (Redux, Zustand, etc.)
- Data persistence: localStorage for saved workouts, Supabase for all application data

## Key Abstractions

**Surface Pattern:**
- Purpose: Represents a major UI section/page of the application
- Examples: `AuthSurface`, `DashboardSurface`, `TemplateEditorSurface`, `WorkoutSurface`
- Pattern: Functional component that manages all state for that section, accepts callbacks for navigation

**Service Module Pattern:**
- Purpose: Groups related business logic operations
- Examples: `auth.ts` (user ops), `exercises.ts` (exercise library), `templates.ts` (workout templates)
- Pattern: Exported object with method functions that return typed result (ServiceResult<T>, AuthResult, etc.)
- Each service interacts with Supabase via typed client

**Result Type Pattern:**
- Purpose: Standardized error handling across all operations
- Examples: `ServiceResult<T>`, `AuthResult`, `SuccessResult`, `ServiceError`
- Pattern: Objects with `{ data/user/success, error }` - never throws, always returns result
- Enables type-safe error checking without try-catch

**Hook for State Management:**
- Purpose: Encapsulate complex state patterns
- Examples: `useAsyncOperation`, `useConfirmationModal`, `useTimerState`
- Pattern: Custom hook returning state + callbacks to update it
- Enables composability and reuse across components

**Barrel Exports:**
- Purpose: Simplify imports and define module boundaries
- Examples: `packages/shared/src/index.ts`, `apps/web/src/surfaces/index.ts`
- Pattern: Re-export all public items from a directory with types
- Enables `import { Exercise, Template } from '@ironlift/shared'`

## Entry Points

**Web Application:**
- Location: `apps/web/src/main.tsx`
- Triggers: Browser load of built HTML
- Responsibilities: Initialize Preact app, render App component to DOM, set up root surface routing

**Build Entry:**
- Location: `apps/web/vite.config.ts`
- Triggers: `npm run dev` or `npm run build`
- Responsibilities: Configure Vite build tool, set up path aliases, configure Preact plugin

**Scripts:**
- Location: `scripts/` directory
- Examples: `import-exercises.ts` - one-time data import script
- Responsibilities: Dev utilities, data migration, database seeding

**Shared Package Entry:**
- Location: `packages/shared/src/index.ts`
- Triggers: Import from `@ironlift/shared`
- Responsibilities: Barrel export all types, services, hooks for use in web and iOS apps

## Error Handling

**Strategy:** Explicit error returns in service results, no thrown exceptions expected from services

**Patterns:**

- Service operations return `ServiceResult<T>` with `{ data, error }` structure (never throw)
- Caller checks `if (result.error)` to handle failures
- Auth operations return `AuthResult { user, error }` with User object only on success
- Success-only operations return `SuccessResult { success, error }` or `ServiceError { error }`
- Components use `useAsyncOperation` hook to manage loading/error/success states
- Error messages are displayed via UI overlays (ErrorMessage component) or logged

**Example Pattern (from `apps/web/src/hooks/useAsyncOperation.ts` lines 38-62):**
```typescript
const result = await execute(operation, {
  successMessage: 'Saved successfully',
  onSuccess: (data) => { /* update state */ },
  onError: (error) => { /* log error */ }
});
if (!result) { /* handle error via hook state */ }
```

## Cross-Cutting Concerns

**Logging:**
- Service: `packages/shared/src/services/logging.ts`
- Approach: Structured logging with context information
- Usage: `logging.log()`, `logging.error()` called from services

**Validation:**
- Approach: Input validation in service methods before Supabase calls (e.g., auth.ts lines 32-45)
- Password minimum length: 6 characters
- Email and password required for auth operations
- Saved workout validation checks required fields exist and are valid

**Authentication:**
- Provider: Supabase Auth
- Implementation: Service layer wraps Supabase auth APIs
- Session checking: Preact effect in App component on mount (lines 171-188)
- Auth state listener: Preact effect subscribed to Supabase auth changes (lines 148-168)

**Typing:**
- Strict TypeScript with no `any` types
- Database types imported from Supabase type definitions
- Services have fully typed signatures with explicit return types
- Props interfaces for all components (e.g., DashboardSurfaceProps, ConfirmationModalProps)

**Performance:**
- Component memoization with performance test baselines in `__tests__/` directories
- Modal state patterns optimized to avoid re-renders (documented in perf tests)
- Chart.js instances stored in refs to prevent recreating on re-renders
- Preact (10KB vs 42KB React) for smaller bundle

---

*Architecture analysis: 2026-02-09*
