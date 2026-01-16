# IronFactor

## What This Is

A fitness tracking app built with TypeScript, Preact, and Vite in a pnpm monorepo architecture. Features workout templates with compact mini-grid layout, exercise tracking with rest timers, progress charts, and multi-tab sync. Migrated from Alpine.js to Preact in v1.0 refactor, polished through v1.5, and restructured as monorepo in v2.1 for multi-platform support (web + future iOS).

## Core Value

**The app must work exactly as before.** This is a pure refactor - if the app behaves differently after migration, the refactor failed.

## Requirements

### Validated

**v1.5 UX Improvements (shipped 2026-01-15):**
- ✓ Simplified chart tooltips (value + unit only) — v1.5
- ✓ InfoModal component for informational dialogs — v1.5
- ✓ Email confirmation modal after registration — v1.5
- ✓ Template delete uses styled ConfirmationModal — v1.5
- ✓ All delete actions use modal-based confirmation — v1.5

**v1.4 IronFactor Rebrand (shipped 2026-01-14):**
- ✓ IronFactor split-color logo on auth page — v1.4
- ✓ IronFactor branding on dashboard header — v1.4
- ✓ Consistent brand pattern across surfaces — v1.4

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

**v2.1 Monorepo Architecture + Root Cleanup (shipped 2026-01-16):**
- ✓ pnpm monorepo with workspace configuration — v2.1
- ✓ @ironlift/shared package with types, services, lib — v2.1
- ✓ Web app migrated to apps/web/ — v2.1
- ✓ All imports updated to @ironlift/shared — v2.1
- ✓ TypeScript composite projects for package-level type checking — v2.1
- ✓ iOS app scaffold for future React Native — v2.1
- ✓ Root directory cleaned (removed legacy js/, dist/) — v2.1

### Active

None — project feature-complete. iOS development ready when needed.

### Out of Scope

- New features — pure refactor, no new functionality
- Test coverage — defer to separate project
- Offline-first architecture — would require service workers, sync queue
- Data export — useful but not part of this refactor
- Full UI/UX redesign — only template list refined in v1.3; other views preserved from original

## Context

**Current State (post v2.1):**
- **Monorepo structure:**
  - `packages/shared/` — @ironlift/shared with types, services, lib
  - `apps/web/` — Web app with Preact surfaces
  - `apps/ios/` — iOS scaffold (placeholder for React Native)
- pnpm workspace with `workspace:*` protocol for internal dependencies
- Vite + TypeScript build pipeline with strict mode
- 100% TypeScript codebase — all legacy JS deleted
- Preact-based surfaces: Auth, Dashboard, Template Editor, Workout, Charts
- Service modules in `packages/shared/src/services/` with full TypeScript types
- Supabase client in `packages/shared/src/lib/supabase.ts` using `.env` variables
- Supabase as backend (PostgreSQL + Auth)
- App rebranded to "IronFactor" with split-color logo (Iron=white, Factor=accent blue)
- Dashboard template list uses compact 2-column mini-grid layout
- Simplified chart tooltips showing value + unit only
- Reusable InfoModal and ConfirmationModal components for dialogs
- All delete actions use styled modal confirmation (no browser confirm())
- All UAT bugs fixed, production build verified working

**Architecture:**
- **Monorepo:** pnpm workspace with packages/* and apps/* structure
- **Surface-based:** Each major UI section is a self-contained Preact component
- **Services:** TypeScript modules wrapping Supabase operations (in @ironlift/shared)
- **Types:** Full type coverage via `packages/shared/src/types/` with barrel exports

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
| Tooltip closure pattern | Capture metricType in closure for Chart.js callbacks | ✓ Good - clean tooltip customization |
| InfoModal component | Single-action modal for informational messages | ✓ Good - reusable, consistent UX |
| Modal-based confirmations | Replace browser confirm() with styled modals | ✓ Good - consistent delete UX |
| pnpm monorepo | Workspace structure for code sharing between web and iOS | ✓ Good - clean separation, shared package works well |
| Source-only shared package | No build step for shared, Vite handles transpilation | ✓ Good - simpler DX, no pre-build required |
| Package-level type checking | Each package runs tsc --noEmit independently | ✓ Good - cleaner for different path aliases |
| Ambient env types | ImportMetaEnv in shared package without vite devDep | ✓ Good - keeps shared package framework-agnostic |
| workspace:* protocol | Auto-link local packages in monorepo | ✓ Good - seamless local development |

---

*Last updated: 2026-01-16 after v2.1 milestone*
