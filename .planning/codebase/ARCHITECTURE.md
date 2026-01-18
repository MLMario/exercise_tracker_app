# Architecture

**Analysis Date:** 2026-01-17

## Pattern Overview

**Overall:** Monorepo-based Layered Architecture with Surface-based UI Routing

**Key Characteristics:**
- Monorepo with pnpm workspaces (shared library + apps)
- Layered model: Data Access -> Services -> UI Surfaces
- State-based navigation (no URL routing)
- TypeScript-first with strict mode enabled

## Layers

**Data Access Layer:**
- Purpose: Initialize and configure Supabase client
- Contains: Supabase client instance with environment validation
- Location: `packages/shared/src/lib/supabase.ts`
- Depends on: Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Used by: Service layer

**Service Layer:**
- Purpose: Business logic, data transformation, API coordination
- Contains: auth, exercises, templates, logging, charts services
- Location: `packages/shared/src/services/*.ts`
- Depends on: Data access layer (Supabase client)
- Used by: UI surfaces

**Type Layer:**
- Purpose: Data contracts between layers
- Contains: Database row types, service interfaces, result types
- Location: `packages/shared/src/types/*.ts`
- Depends on: Nothing (pure types)
- Used by: All layers

**UI Surface Layer:**
- Purpose: Major app sections as container components
- Contains: AuthSurface, DashboardSurface, TemplateEditorSurface, WorkoutSurface
- Location: `apps/web/src/surfaces/*/`
- Depends on: Service layer, component layer
- Used by: Root App component

**Component Layer:**
- Purpose: Reusable presentational components
- Contains: Modals, cards, forms
- Location: `apps/web/src/components/`
- Depends on: Types only
- Used by: Surface layer

## Data Flow

**Authentication Flow:**

1. User submits credentials in AuthSurface
2. Component calls `auth.login()` or `auth.register()` from shared services
3. Service makes Supabase auth call, returns `{ user, error }`
4. Component passes user to root App via callback prop
5. App's auth listener detects SIGNED_IN event
6. App navigates to DashboardSurface

**Workout Session Flow:**

1. User starts workout from template in DashboardSurface
2. App receives `onStartWorkout` callback, navigates to WorkoutSurface
3. WorkoutSurface loads template data, manages in-flight workout state
4. User completes sets, clicks finish
5. WorkoutSurface calls `logging.createWorkoutLog()` with exercises/sets data
6. Service inserts workout log and cascading records in Supabase
7. App receives `onFinish` callback, navigates back to dashboard

**State Management:**
- File-based: Active workout backed up to localStorage (`activeWorkout_${userId}`)
- No global state library - prop-based state passing
- Each surface manages its own local state

## Key Abstractions

**Service:**
- Purpose: Encapsulate business logic for a domain
- Examples: `packages/shared/src/services/auth.ts`, `templates.ts`, `logging.ts`
- Pattern: Module-level functions exported as object properties

**Surface:**
- Purpose: Major UI section with self-contained state
- Examples: `apps/web/src/surfaces/auth/AuthSurface.tsx`, `dashboard/DashboardSurface.tsx`
- Pattern: Container component with callback props for navigation

**Result Type:**
- Purpose: Consistent error handling across services
- Pattern: `{ data: T | null, error: Error | null }`
- Examples: `AuthResult`, `ServiceResult<T>` in `packages/shared/src/types/services.ts`

## Entry Points

**Web Application:**
- Location: `apps/web/src/main.tsx`
- Triggers: Browser loads application
- Responsibilities: Render App component, manage surface routing, handle auth state

**Shared Package:**
- Location: `packages/shared/src/index.ts`
- Triggers: Imported by web app
- Responsibilities: Export types and services as barrel module

## Error Handling

**Strategy:** Return error objects, handle at surface level

**Patterns:**
- Services return `{ data, error }` tuple (Supabase convention)
- Surfaces display error messages in UI state
- Console.error for unexpected failures
- No global error boundary configured

## Cross-Cutting Concerns

**Logging:**
- Console.log with prefix pattern: `[DEBUG module.tsx]`
- Console.error for errors
- No structured logging or external service

**Validation:**
- Manual validation in surfaces (form inputs)
- TypeScript types for compile-time checking
- No runtime validation library (Zod, Yup)

**Authentication:**
- Supabase Auth with email/password
- Session management via Supabase client
- Auth state listener in root App component

---

*Architecture analysis: 2026-01-17*
*Update when major patterns change*
