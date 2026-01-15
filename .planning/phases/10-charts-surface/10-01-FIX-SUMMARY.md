# Fix Summary: 10-01-FIX

**Phase:** 10-charts-surface
**Plan:** 10-01-FIX
**Completed:** 2026-01-13

## Issue Fixed

### UAT-001: Chart blank on page refresh (Blocker)

**Root Cause:**
The `setTimeout(0)` timing in ChartSection.useEffect was unreliable for ensuring canvas elements existed in the DOM after Preact renders. On page refresh, `renderAllCharts` ran before the canvas elements from ChartCard were mounted, causing `document.getElementById` to return null and Chart.js to fail silently.

**Solution:**
Moved chart rendering responsibility to ChartCard using useRef + useEffect pattern. This guarantees each chart renders only when its own canvas element is mounted in the DOM.

## Changes Made

### 1. ChartCard.tsx
- Added `useRef<HTMLCanvasElement>` for canvas element reference
- Added `useEffect` that renders chart when canvas ref and chartData are available
- Added new props: `chartData` (labels/values), `onChartRendered`, `onChartDestroyed`
- Changed canvas to use `ref={canvasRef}` instead of just `id`
- Call `window.charts.renderChart` inside useEffect when canvasRef.current exists
- Cleanup via `window.charts.destroyChart` on unmount
- Exported `ChartData` interface for use by parent components

### 2. ChartSection.tsx
- Removed the `useEffect` with `setTimeout(onRenderCharts, 0)`
- Removed `onRenderCharts` prop (no longer needed)
- Added `chartDataMap` prop to pass chart data to ChartCard
- Added `onChartRendered` and `onChartDestroyed` callbacks
- Pass chart data to each ChartCard for self-rendering

### 3. DashboardSurface.tsx
- Modified `loadUserCharts` to also fetch metrics data for each chart upfront
- Added `chartDataMap` state to store fetched chart data keyed by chart ID
- Removed `renderAllCharts` function and `chartInstances` state
- Added `handleChartRendered` and `handleChartDestroyed` callbacks
- Updated ChartSection props to use new API
- Updated `confirmDeleteChart` to also clean up chartDataMap

## Files Modified
- `src/surfaces/dashboard/ChartCard.tsx`
- `src/surfaces/dashboard/ChartSection.tsx`
- `src/surfaces/dashboard/DashboardSurface.tsx`

## Verification
- [x] `npm run build` succeeds
- [x] TypeScript compilation passes

## Expected Behavior After Fix
- Charts render correctly on initial navigation
- Charts render correctly after page refresh (F5)
- Charts render correctly when reopening localhost in new tab
- No console errors about null canvas
- Delete chart functionality works
- Add chart modal works and new charts render

## Commit
`fix(10-01-FIX): resolve chart blank on page refresh`
