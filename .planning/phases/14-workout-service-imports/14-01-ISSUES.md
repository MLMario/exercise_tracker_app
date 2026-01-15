# UAT Issues: Phase 14 Plan 01

**Tested:** 2026-01-14
**Source:** .planning/phases/14-workout-service-imports/14-01-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Charts fail to render - "category" scale not registered

**Discovered:** 2026-01-14
**Phase/Plan:** 14-01
**Severity:** Blocker
**Feature:** Progress Charts (ChartCard.tsx)
**Description:** Charts don't render at all. Console shows "category is not a registered scale" error from Chart.js
**Expected:** Charts should render as they did before Phase 14
**Actual:** Charts fail completely with Chart.js registry error
**Repro:**
1. Log in to the app
2. Navigate to dashboard with charts
3. Observe console errors and blank chart areas

**Console errors:**
```
[charts.renderChart] Error rendering chart: Error: "category" is not a registered scale.
    at Registry._get (core.registry.js:178:13)
    at Registry.getScale (core.registry.js:90:17)
```

**Notes:** Phase 14 only modified WorkoutSurface.tsx and TemplateEditorSurface.tsx - did not touch chart code. Issue may be related to import/bundle resolution changes.

## Resolved Issues

[None yet]

---

*Phase: 14-workout-service-imports*
*Plan: 01*
*Tested: 2026-01-14*
