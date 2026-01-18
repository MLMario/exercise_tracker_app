# Template Editor UI Cleanup

## What This Is

A focused UI polish pass on the template-editor surface to fix layout and text overflow issues. Specifically addressing header button alignment and exercise name truncation for better visual consistency.

## Core Value

Both issues are equally important — the header layout and exercise name truncation must both work correctly for a polished user experience.

## Requirements

### Validated

- ✓ Template editor surface exists with working functionality — existing
- ✓ Header with Cancel and Save buttons present — existing
- ✓ Exercise info display component present — existing
- ✓ btn-primary and btn-secondary CSS classes exist — existing
- ✓ App header displays Cancel (btn-secondary), title "New Template", and Save (btn-primary) in a single row — v2.3
- ✓ Exercise name truncates with ellipsis when text is too long — v2.3
- ✓ Truncated exercise names show full name in tooltip on hover — v2.3

### Active

(None — milestone complete)

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
- Header buttons and title exist but layout needs alignment
- Exercise names can overflow their container without truncation
- btn-primary and btn-secondary classes already defined in stylesheet

## Constraints

- **Tech stack**: CSS changes preferred, minimal JS if needed
- **Scope**: Template-editor surface only, no cross-surface changes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Template-editor only | Keep changes scoped to avoid unintended side effects | ✓ Good |
| Tooltip on truncation | Better UX — user can see full exercise name on hover | ✓ Good |
| Match dashboard-surface pattern | Consistent header flexbox layout across surfaces | ✓ Good |
| Native browser title attribute | Simplest tooltip solution, works across all browsers | ✓ Good |

## Context

**Current State:**
- v2.3 shipped with header layout fix and exercise name truncation
- Template editor header now matches dashboard-surface pattern
- Native browser tooltips used for truncated exercise names

---
*Last updated: 2026-01-17 after v2.3 milestone*
