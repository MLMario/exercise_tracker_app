# UAT Issues: Phase 15 Plan 01

**Tested:** 2026-01-14
**Source:** .planning/phases/15-dashboard-service-imports/15-01-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Chart fails to render - "category" scale not registered

**Discovered:** 2026-01-14
**Phase/Plan:** 15-01
**Severity:** Major
**Feature:** Dashboard progress charts
**Description:** Chart component fails to render, producing a console error about "category" scale not being registered in Chart.js.
**Expected:** Charts should render with progress data (or empty state if no data)
**Actual:** Chart area is empty with console error:
```
Uncaught Error: 
charts.ts:345 [charts.renderChart] Error rendering chart: Error: "category" is not a registered scale.
    at Object.renderChart (charts.ts:240:27)
    at Object.__ (ChartCard.tsx:145:31)
renderChart	@	charts.ts:345
(anonymous)	@	ChartCard.tsx:145
Promise.then		
loadUserCharts	@	DashboardSurface.tsx:168
await in loadUserCharts		
handleCreateChart	@	DashboardSurface.tsx:354
await in handleCreateChart		
handleSubmit	@	AddChartModal.tsx:80

**Repro:**
1. Log in to the app
2. Navigate to Dashboard
3. Observe chart area and browser console

**Note:** This is a Chart.js configuration issue - the CategoryScale needs to be explicitly registered when using tree-shaking imports. This may be a pre-existing issue not introduced by Phase 15's refactoring, but it was observed during UAT.

## Resolved Issues

[None yet]

---

*Phase: 15-dashboard-service-imports*
*Plan: 01*
*Tested: 2026-01-14*
