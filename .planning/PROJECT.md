# Ironlift Strength

## What This Is

A fitness tracking app built with TypeScript, Preact, and Vite. Features workout templates with compact mini-grid layout, exercise tracking with rest timers, progress charts, and multi-tab sync. Migrated from Alpine.js to Preact in v1.0 refactor, polished in v1.1, and refined UI in v1.3.

## Core Value

**The app must work exactly as before.** This is a pure refactor - if the app behaves differently after migration, the refactor failed.

## Requirements

### Validated

**v1.3 UI Refinements (shipped 2026-01-14):**
- ✓ 2-column mini-grid template layout — v1.3
- ✓ Compact mini-card design for templates — v1.3
- ✓ Icon buttons (edit/delete) in card header — v1.3
- ✓ Removed "X exercise(s) available" dashboard clutter — v1.3

**v1.1 Fixes & Polish (shipped 2026-01-13):**
- ✓ Workout visibility preserved on alt-tab — v1.1
- ✓ Password recovery routing fixed — v1.1
- ✓ Max Weight chart metric REMOVED — v1.1
- ✓ Clean production console output (no debug logs) — v1.1
- ✓ Chart card styling with hover effects — v1.1
- ✓ Dashboard header with logout button — v1.1
- ✓ App rebranded to "Ironlift Strength" — v1.1

**v1.0 Refactor (shipped 2026-01-13):**
- ✓ Vite build setup with TypeScript — v1.0
- ✓ Surface-based module structure (auth, dashboard, workout, templateEditor, charts) — v1.0
- ✓ Preact as UI framework (4KB, React-compatible) — v1.0
- ✓ Type definitions for all service modules — v1.0
- ✓ Type definitions for Supabase schema — v1.0

**Original functionality (preserved):**
- ✓ User authentication (login, register, password reset, session persistence)
- ✓ Workout templates (create, edit, delete, reorder exercises)
- ✓ Exercise library (browse, filter, create custom exercises)
- ✓ Active workout tracking (start from template, add/remove sets, rest timer)
- ✓ Workout logging (save completed workouts to history)
- ✓ Progress charts (configurable charts per exercise, multiple metrics)
- ✓ Multi-tab sync (workout state synced across browser tabs)
- ✓ Offline backup (active workout persists in localStorage)

### Active

None — project complete.

### Out of Scope

- New features — pure refactor, no new functionality
- Test coverage — defer to separate project
- Offline-first architecture — would require service workers, sync queue
- Data export — useful but not part of this refactor
- Full UI/UX redesign — only template list refined in v1.3; other views preserved from original

## Context

**Current State (post v1.3):**
- Vite + TypeScript build pipeline with strict mode
- 100% TypeScript codebase — all legacy JS deleted
- Preact-based surfaces: Auth, Dashboard, Template Editor, Workout, Charts
- Service modules in `src/services/` with full TypeScript types and direct ES imports
- No window.* globals — all services use direct ES module imports
- Supabase client initialized in `src/lib/supabase.ts` using `.env` variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Supabase as backend (PostgreSQL + Auth)
- App rebranded to "Ironlift Strength"
- Dashboard template list uses compact 2-column mini-grid layout
- All UAT bugs fixed, production build verified working

**Architecture:**
- Surface-based: Each major UI section is a self-contained Preact component
- Services: TypeScript modules wrapping Supabase operations
- Types: Full type coverage via `src/types/` with barrel exports

**Previous Pain Points (resolved):**
- ~~Workout surface complex and tangled~~ → Now modular WorkoutSurface with clean components
- ~~Chart rendering messy~~ → Charts service properly typed and integrated
- ~~Auth flow convoluted~~ → AuthSurface with clear sub-surface state machine
- ~~1400-line monolith~~ → Deleted in v1.2, replaced by modular surfaces
- ~~Debug console.log in production~~ → All debug logging removed
- ~~Legacy js/ files~~ → Deleted in v1.2, pure TypeScript codebase
- ~~Duplicate Supabase initialization (CDN + config.local.js + Vite bundle)~~ → Single source via src/lib/supabase.ts using .env
- ~~Chart.js v4 "category scale not registered" error~~ → Fixed: explicit Chart.js component registration (CategoryScale, LinearScale, LineController, LineElement, PointElement, Legend, Tooltip, Filler) in charts.ts:18-40

## Constraints

- **Backend**: Supabase — must continue using, not negotiable
- **Framework**: Preact — selected in v1.0, proven to work well
- **Deployment**: Static hosting — Vite output deploys to static host
- **Behavior**: Identical — app works exactly the same post-refactor

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vite as bundler | Fast, modern, great DX, minimal config | ✓ Good - fast builds, HMR works great |
| TypeScript (strict mode) | Type safety, better refactoring, IDE support | ✓ Good - caught many bugs during migration |
| Surface-based modules | Matches existing `currentSurface` pattern, clear boundaries | ✓ Good - clean separation of concerns |
| Preact over Alpine.js | React-compatible 4KB framework, better ecosystem for scaling | ✓ Good - smooth migration, familiar patterns |
| ServiceResult<T> pattern | Consistent error handling across services | ✓ Good - type-safe success/error returns |
| Barrel exports | Clean imports via @/types, @/services | ✓ Good - improved DX |
| ESM-only (type: module) | Modern module system, Vite-native | ✓ Good - no CJS interop issues |
| userId-based localStorage | Workout backup per user, not per template | ✓ Good - proper multi-tab sync |
| useRef for closures | Event listener callbacks capture state; use refs for current values | ✓ Good - fixed alt-tab visibility bug |
| Chart.js explicit registration | Chart.js v4+ requires manual component registration | ✓ Good - fixed "category scale not registered" error |
| Mini-grid template layout | More templates visible in viewport, cleaner aesthetic | ✓ Good - improved dashboard UX |

---

*Last updated: 2026-01-14 after v1.3 milestone*
