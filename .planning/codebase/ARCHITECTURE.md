# Architecture

**Analysis Date:** 2026-01-12

## Pattern Overview

**Overall:** Single Page Application (SPA) with Alpine.js

**Key Characteristics:**
- Zero build step (CDN-loaded dependencies)
- Component-based UI via Alpine.js x-data
- Service modules exposed via window namespace
- Supabase as Backend-as-a-Service (BaaS)

## Layers

**UI Layer (Alpine.js Component):**
- Purpose: Render UI, handle user interactions, manage component state
- Contains: Reactive data, event handlers, template bindings
- Location: `index.html` (templates), `js/app.js` (component definition)
- Depends on: All service modules
- Used by: Direct user interaction

**Service Layer (Window Modules):**
- Purpose: Encapsulate domain logic and Supabase operations
- Contains: CRUD operations, data transformation, business rules
- Location: `js/*.js` (auth, exercises, templates, logging, charts, timer)
- Depends on: Supabase client (`window.supabaseClient`)
- Used by: UI layer (`js/app.js`)

**Data Layer (Supabase):**
- Purpose: Persistent storage, authentication
- Contains: PostgreSQL database, auth service
- Location: External (Supabase cloud)
- Depends on: Nothing
- Used by: Service layer

## Data Flow

**User Action Lifecycle:**

1. User interacts with UI (click, form submit)
2. Alpine.js event handler invoked (e.g., `@click="handleAuth"`)
3. Handler calls service module (e.g., `window.auth.login()`)
4. Service module calls Supabase client
5. Supabase returns data/error
6. Service returns result to handler
7. Handler updates component state (reactive)
8. Alpine.js re-renders affected UI

**State Management:**
- Component state: Alpine.js reactive properties in `fitnessApp`
- Persistent state: Supabase database
- Offline backup: LocalStorage for active workout

## Key Abstractions

**Alpine Component (fitnessApp):**
- Purpose: Main application state and behavior
- Location: `js/app.js`
- Pattern: Single reactive data object with methods

**Service Modules:**
- Purpose: Domain-specific operations
- Examples: `window.auth`, `window.exercises`, `window.templates`, `window.logging`, `window.charts`
- Pattern: Object with async functions, exported to window namespace

**Surfaces:**
- Purpose: Full-screen UI states (like routes without a router)
- Examples: `auth`, `dashboard`, `workout`, `templateEditor`
- Pattern: `currentSurface` variable controls which surface is visible

## Entry Points

**HTML Entry:**
- Location: `index.html`
- Triggers: Browser page load
- Responsibilities: Load all scripts, define Alpine templates

**App Initialization:**
- Location: `js/app.js` (`init()` method)
- Triggers: `alpine:init` event
- Responsibilities: Set up auth listener, restore session, load dashboard

**Script Loading Order:**
```
1. Supabase CDN
2. Alpine.js CDN (deferred)
3. Chart.js CDN
4. js/config.local.js (credentials)
5. js/supabase.js (client init)
6. js/auth.js
7. js/exercises.js
8. js/templates.js
9. js/logging.js
10. js/timer.js
11. js/charts.js
12. js/app.js (Alpine component)
```

## Error Handling

**Strategy:** Return error objects, display in UI

**Patterns:**
- Service functions return `{ data, error }` or `{ error }` objects
- UI handlers check for errors and set `this.error` for display
- Toast messages for user feedback (`error`, `successMessage`)
- Try/catch in async service functions

**Error Display:**
- Toast container in `index.html`
- Auto-dismiss after 5 seconds (`clearMessages()`)

## Cross-Cutting Concerns

**Logging:**
- Browser console only
- Debug statements with `[AUTH DEBUG]` prefix in `js/auth.js`

**Validation:**
- Client-side validation in service functions
- Form validation via HTML5 attributes (required, minlength)
- No Zod or validation library

**Authentication:**
- Checked at start of most service functions
- `supabaseClient.auth.getUser()` for current user
- RLS policies in Supabase for data protection

**State Persistence:**
- Active workout backed up to localStorage
- Multi-tab sync via `storage` event listener

---

*Architecture analysis: 2026-01-12*
*Update when major patterns change*
