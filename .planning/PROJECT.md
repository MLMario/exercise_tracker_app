# Exercise Tracker Refactor

## What This Is

A fitness tracking app built with TypeScript, Preact, and Vite. Features workout templates, exercise tracking with rest timers, progress charts, and multi-tab sync. Originally migrated from Alpine.js to Preact in v1.0 refactor.

## Core Value

**The app must work exactly as before.** This is a pure refactor - if the app behaves differently after migration, the refactor failed.

## Requirements

### Validated

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

**v1.1 Fixes & Polish:**
- Workout visibility after alt-tab
- Password recovery routing fix
- Chart "Max Weight" metric fix
- Auth console logging cleanup
- UI polish: button styling, form backgrounds, title rename to "Ironlift Strength"

### Out of Scope

- New features — pure refactor, no new functionality
- Test coverage — defer to separate project
- Offline-first architecture — would require service workers, sync queue
- Data export — useful but not part of this refactor
- UI/UX changes — visual design stays the same

## Context

**Current State (post v1.0):**
- Vite + TypeScript build pipeline with strict mode
- ~9,096 lines of TypeScript across services and surfaces
- Preact-based surfaces: Auth, Dashboard, Template Editor, Workout, Charts
- Service modules in `src/services/` with full TypeScript types
- Legacy service modules (`js/*.js`) still provide window.* APIs for gradual migration
- Supabase as backend (PostgreSQL + Auth)
- Deployed to static hosting

**Architecture:**
- Surface-based: Each major UI section is a self-contained Preact component
- Services: TypeScript modules wrapping Supabase operations
- Types: Full type coverage via `src/types/` with barrel exports

**Previous Pain Points (resolved in v1.0):**
- ~~Workout surface complex and tangled~~ → Now modular WorkoutSurface with clean components
- ~~Chart rendering messy~~ → Charts service properly typed and integrated
- ~~Auth flow convoluted~~ → AuthSurface with clear sub-surface state machine
- ~~1400-line monolith~~ → Archived to js/legacy/, replaced by modular surfaces

## Constraints

- **Backend**: Supabase — must continue using, not negotiable
- **Framework**: Open to change — evaluate Alpine.js alternatives (Vue, React, Preact)
- **Deployment**: Static hosting — Vite output must deploy same way
- **Behavior**: Identical — app must work exactly the same post-refactor

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

---

*Last updated: 2026-01-13 after v1.0 milestone*
