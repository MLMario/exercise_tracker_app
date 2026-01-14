# Project Milestones: Ironlift Strength

## v1.3 UI Refinements (Shipped: 2026-01-14)

**Delivered:** Compact 2-column mini-grid layout for templates with improved dashboard UX.

**Phases completed:** 18 (1 plan total)

**Key accomplishments:**
- Implemented 2-column mini-grid layout for templates
- Restructured TemplateCard to compact mini-card design
- Added icon buttons (edit/delete) in card header with btn-icon-xs styling
- Full-width Start button with btn-xs compact variant
- Removed "X exercise(s) available" visual clutter from dashboard

**Stats:**
- 1 phase, 1 plan
- 4 files modified, +90 net lines
- Same day completion

**Git range:** feat(18-01) (2 commits)

**What's next:** Project feature-complete. Future work TBD based on user feedback.

---

## v1.2 Legacy Code Cleanup (Shipped: 2026-01-14)

**Delivered:** Complete removal of legacy JavaScript files and window globals, achieving 100% TypeScript codebase with direct ES module imports.

**Phases completed:** 14-17 (5 plans total)

**Key accomplishments:**
- All Preact surfaces now use direct ES module imports (no window.* globals)
- Removed 3,560 lines of legacy JavaScript code
- Deleted 8 legacy files (auth, exercises, templates, logging, charts, timer, supabase, app.alpine)
- Fixed Chart.js v4 component registration issue
- Clean index.html without legacy script tags

**Stats:**
- 4 phases, 5 plans
- 8 files deleted, 3,560 lines removed
- 9,166 lines of TypeScript remaining
- 1 day from start to ship

**Git range:** feat(14-01) -> chore(17-02)

**What's next:** Project complete - all planned refactoring milestones shipped.

---

## v1.1 Fixes & Polish (Shipped: 2026-01-13)

**Delivered:** Bug fixes for workout visibility, password recovery, and chart metrics. UI polish with rebranding to "Ironlift Strength".

**Phases completed:** 12-13 (3 plans total)

**Key accomplishments:**
- Fixed workout visibility on alt-tab (useRef pattern)
- Fixed password recovery routing
- Removed broken Max Weight chart metric
- Clean production console (no debug logs)
- Dashboard header with logout button
- Rebranded to "Ironlift Strength"

**Stats:**
- 2 phases, 3 plans
- 9 min total execution time

**Git range:** feat(12-01) -> feat(13-01)

---

## v1.0 Exercise Tracker Refactor (Shipped: 2026-01-13)

**Delivered:** Complete migration from zero-build vanilla JavaScript to TypeScript + Vite with Preact-based surface architecture.

**Phases completed:** 1-11 (27 plans total)

**Key accomplishments:**
- Vite + TypeScript build pipeline with strict mode
- Surface-based architecture (Auth, Dashboard, Workout, TemplateEditor, Charts)
- Full type coverage with TypeScript services
- Preact UI framework (4KB, React-compatible)
- Multi-tab sync and localStorage backup
- All original functionality preserved

**Stats:**
- 11 phases, 27 plans
- ~9,000 lines of TypeScript
- ~100 min total execution time

**Git range:** feat(01-01) -> feat(11-03)

---
