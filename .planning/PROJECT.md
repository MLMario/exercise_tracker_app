# Exercise Tracker Refactor

## What This Is

A technical debt refactor of an existing fitness tracking app. Migrating from zero-build vanilla JavaScript to a modern TypeScript + Vite stack with modular, surface-based architecture. The goal is to make the codebase easier to work with so new features can be added without fighting a 1400-line monolith.

## Core Value

**The app must work exactly as before.** This is a pure refactor - if the app behaves differently after migration, the refactor failed.

## Requirements

### Validated

<!-- Existing functionality that must be preserved -->

- ✓ User authentication (login, register, password reset, session persistence) — existing
- ✓ Workout templates (create, edit, delete, reorder exercises) — existing
- ✓ Exercise library (browse, filter, create custom exercises) — existing
- ✓ Active workout tracking (start from template, add/remove sets, rest timer) — existing
- ✓ Workout logging (save completed workouts to history) — existing
- ✓ Progress charts (configurable charts per exercise, multiple metrics) — existing
- ✓ Multi-tab sync (workout state synced across browser tabs) — existing
- ✓ Offline backup (active workout persists in localStorage) — existing

### Active

<!-- Current scope - building toward these -->

- [ ] Vite build setup with TypeScript
- [ ] Surface-based module structure (auth, dashboard, workout, templateEditor)
- [x] Evaluate and select UI framework (Alpine.js, Vue, React, or Preact) — Preact selected
- [ ] Type definitions for all service modules
- [ ] Type definitions for Supabase schema

### Out of Scope

- New features — pure refactor, no new functionality
- Test coverage — defer to separate project
- Offline-first architecture — would require service workers, sync queue
- Data export — useful but not part of this refactor
- UI/UX changes — visual design stays the same

## Context

**Current State:**
- Single-page app with zero build step
- All code in `js/*.js` files loaded via CDN
- Main component `fitnessApp` in `js/app.js` is 1400+ lines
- Service modules (`auth`, `exercises`, `templates`, `logging`, `charts`) exposed via `window.*`
- Supabase as backend (PostgreSQL + Auth)
- Deployed to static hosting

**Pain Points:**
- Workout surface (timer, sets, swipe gestures) is complex and tangled
- Chart rendering (Chart.js integration) is messy
- Auth flow (password recovery) logic is convoluted
- Adding features requires understanding the entire monolith

**Codebase Documentation:**
- Full codebase map available in `.planning/codebase/`
- See `ARCHITECTURE.md` for current patterns
- See `CONCERNS.md` for tech debt details

## Constraints

- **Backend**: Supabase — must continue using, not negotiable
- **Framework**: Open to change — evaluate Alpine.js alternatives (Vue, React, Preact)
- **Deployment**: Static hosting — Vite output must deploy same way
- **Behavior**: Identical — app must work exactly the same post-refactor

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vite as bundler | Fast, modern, great DX, minimal config | — Pending |
| TypeScript (full migration) | Type safety, better refactoring, IDE support | — Pending |
| Surface-based modules | Matches existing `currentSurface` pattern, clear boundaries | — Pending |
| Evaluate UI frameworks | Alpine.js may not be best fit for modular structure | Preact - best ecosystem for scaling, 4KB bundle |

---

*Last updated: 2026-01-12 after initialization*
