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
- Template editor header matches dashboard-surface pattern
- Native browser tooltips used for truncated exercise names
- Production codebase clean of debug logging

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

---
*Last updated: 2026-01-17 after v2.4 milestone*
