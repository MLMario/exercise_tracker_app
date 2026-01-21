# Exercise Tracker App

## What This Is

An exercise tracking application with template-based workout management, real-time progress charts, and user authentication. Built with Preact and TypeScript.

## Core Value

Simple, effective workout tracking with clean visual feedback on progress.

## Requirements

### Validated

- ✓ Template editor surface exists with working functionality — existing
- ✓ Header with Cancel and Save buttons present — existing
- ✓ Exercise info display component present — existing
- ✓ btn-primary and btn-secondary CSS classes exist — existing
- ✓ App header displays Cancel (btn-secondary), title "New Template", and Save (btn-primary) in a single row — v2.3
- ✓ Exercise name truncates with ellipsis when text is too long — v2.3
- ✓ Truncated exercise names show full name in tooltip on hover — v2.3
- ✓ Production code free of DEBUG console.log statements — v2.4
- ✓ Exercise card action buttons in footer (cleaner header) — v2.5
- ✓ Swipe-to-delete uses @use-gesture/react library (cleaner implementation) — v2.6
- ✓ Spring-like animations on swipe gestures with overshoot effect — v2.6
- ✓ Velocity-based snap decision for fast swipes — v2.6
- ✓ iOS-style rubberband effect when over-dragging — v2.6

### Active

(None — ready for next milestone)

### Out of Scope

- Other surfaces — header changes are template-editor specific only
- JavaScript changes — CSS-first approach unless absolutely necessary
- New components — working with existing markup structure

## Context

**Technical Environment:**
- Preact-based web application with TypeScript
- Surface-based UI architecture (AuthSurface, DashboardSurface, TemplateEditorSurface, WorkoutSurface)
- CSS styling in `apps/web/css/styles.css`
- Template editor surface at `apps/web/src/surfaces/template-editor/`

**Current State:**
- v2.3 shipped with header layout fix and exercise name truncation
- v2.4 shipped with debug logging cleanup (39 statements removed)
- v2.5 shipped with exercise card action footer redesign
- v2.6 shipped with swipe gesture refactor using @use-gesture/react
- Template editor header matches dashboard-surface pattern
- Native browser tooltips used for truncated exercise names
- Production codebase clean of debug logging
- Exercise card header now cleaner (progress ring, name, chevron only)
- Swipe-to-delete with spring animations, velocity snap, and rubberband effects

## Constraints

- **Tech stack**: CSS changes preferred, minimal JS if needed
- **Scope**: Per-milestone focus areas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Template-editor only | Keep changes scoped to avoid unintended side effects | ✓ Good |
| Tooltip on truncation | Better UX — user can see full exercise name on hover | ✓ Good |
| Match dashboard-surface pattern | Consistent header flexbox layout across surfaces | ✓ Good |
| Native browser title attribute | Simplest tooltip solution, works across all browsers | ✓ Good |
| Remove all DEBUG console.log | Production code should not have debug logging | ✓ Good |
| Keep console.error statements | Error logging remains useful for production debugging | ✓ Good |
| Move buttons to card-action-footer | Cleaner header, better UX for action visibility | ✓ Good |
| Remove button always visible | No hover-reveal needed in footer, improves discoverability | ✓ Good |
| @use-gesture/react for swipe handling | Standard library, cleaner code (~70 line reduction) | ✓ Good |
| Explicit preact/compat aliases in vite.config.ts | Ensures @use-gesture/react resolves correctly in production | ✓ Good |
| CSS cubic-bezier for spring animation | No additional dependency needed, sufficient for use case | ✓ Good |
| Velocity threshold 0.5 px/ms | Fast swipes feel responsive, minimum -10px prevents accidental triggers | ✓ Good |
| Rubberband 0.2 multiplier | iOS-style 5:1 resistance feels natural | ✓ Good |

---
*Last updated: 2026-01-19 after v2.6 milestone*
