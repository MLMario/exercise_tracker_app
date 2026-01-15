# UAT Issues: Phase 7 Plan 3

**Tested:** 2026-01-13
**Source:** .planning/phases/07-dashboard-surface/07-03-SUMMARY.md
**Tester:** User via /gsd:verify-work (discovered during Phase 8 testing)

## Open Issues

### UAT-002: Chart.js error on page load

**Discovered:** 2026-01-13
**Phase/Plan:** 07-03 (related to legacy chart code)
**Severity:** Major
**Feature:** Charts (legacy code)
**Description:** Console error on page load: `Uncaught TypeError: Cannot read properties of null (reading 'save')` in chart.js
**Expected:** No JavaScript errors on page load
**Actual:** Repeated chart.js errors in console, charts don't render
**Repro:**
1. Start the application
2. Open browser console
3. Observe repeated chart.js errors

**Root Cause (likely):** Old Alpine.js chart code and new Preact chart code both attempt to render to canvas elements. The coexistence of both systems during migration causes conflicts.

**Resolution:** Defer to Phase 12 (Integration) when old code is removed. Alternatively, temporarily disable old chart rendering in `js/app.js` if blocking development.

## Expected Behavior (Not Bugs)

### UAT-001: Two dashboards rendering simultaneously → RECLASSIFIED

**Discovered:** 2026-01-13
**Reclassified:** 2026-01-13 after code investigation
**Status:** Expected Behavior - Not a Bug

**Original Report:** Both the old Alpine.js dashboard AND the new Preact DashboardSurface render on the page simultaneously.

**Investigation Findings:**
This is **intentional behavior** per the migration strategy:

1. **Different mount points:**
   - Old Alpine.js dashboard → `.app` container (in index.html markup)
   - New Preact dashboard → `#app` container (dynamically created)

2. **By design:** The progressive migration strategy allows both systems to coexist during development so new surfaces can be tested alongside old ones.

3. **ROADMAP confirms:** Phase 12 (Integration) explicitly includes "old code removed" - removal is intentionally deferred.

**Files involved:**
- Old dashboard: `js/app.js` + `index.html` lines 323-412
- New dashboard: `src/surfaces/dashboard/DashboardSurface.tsx` + `src/main.tsx`

**Resolution:** No action needed until Phase 12. When Phase 12 executes:
- Remove `js/app.js` script tag from index.html
- Remove old Alpine.js HTML markup from index.html
- Clean up `js/` directory
- Preact surfaces become sole UI layer

## Resolved Issues

[None yet]

---

*Phase: 07-dashboard-surface*
*Plan: 03*
*Tested: 2026-01-13*
*Updated: 2026-01-13 (UAT-001 reclassified after investigation)*
