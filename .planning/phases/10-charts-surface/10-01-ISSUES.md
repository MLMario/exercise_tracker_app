# UAT Issues: Phase 10 Plan 01

**Tested:** 2026-01-13 (round 2, post-fix)
**Source:** .planning/phases/10-charts-surface/10-01-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Chart goes blank on page refresh (PERSISTS after 10-01-FIX)

**Discovered:** 2026-01-13
**Phase/Plan:** 10-01
**Severity:** Blocker
**Feature:** Chart rendering
**Description:** When refreshing the charts page, the chart canvas becomes blank
**Expected:** Chart should re-render with data after page refresh
**Actual:** Chart canvas is empty after refresh
**Repro:**
1. Navigate to charts page (chart displays correctly)
2. Refresh the page (F5 or browser refresh)
3. Chart is now blank

**Additional observations (round 1):**
- Chart works when navigating within app (SPA navigation)
- Chart works when opening localhost in new tab (was wrong - actually fails)
- Chart blank after page refresh (F5)
- Chart blank when reopening localhost after closing tab
- **Console error:** `chart.js:13  Uncaught TypeError: Cannot read properties of null (reading 'save')` - trying to render to null canvas context
- Delete button still works on blank chart

**Round 2 findings (post 10-01-FIX attempt):**
- Add chart: **PASS** - newly added charts render correctly
- Delete chart: **PASS** - charts delete successfully
- Page refresh (F5): **FAIL** - charts blank with same error
- New tab: **FAIL** - charts blank with same error
- Console error persists: `Cannot read properties of null (reading 'save')`

**Critical insight - Architecture misunderstanding:**

The **entire visible UI is Alpine.js**, not Preact:
- `index.html` line 10: `<div x-data="fitnessApp" x-init="init()">` wraps everything
- Charts section (lines 374-409) uses Alpine.js `x-for` to render `<canvas :id="'chart-' + chart.id">`
- Legacy JS files (`js/app.js`, `js/charts.js`) control the visible dashboard
- Preact app (`src/main.tsx`) renders to a **separate hidden `#app` div** appended to body

**The 10-01-FIX modified Preact components that aren't being displayed!**

**Actual bug location:** `js/app.js` lines 381-392 (loadUserCharts)
```javascript
async loadUserCharts() {
  const { data, error } = await window.charts.getUserCharts();
  this.userCharts = data || [];
  await this.$nextTick();  // <-- This doesn't reliably wait for canvas
  await this.renderAllCharts();  // <-- Tries to render before canvas is ready
}
```

**Why it fails on refresh:**
1. Alpine.js sets `userCharts` data
2. `x-for` reactively starts creating `<canvas>` elements
3. `$nextTick()` returns before canvas elements are fully initialized in render tree
4. `renderAllCharts()` finds canvas via `getElementById` but context not ready
5. Chart.js creates chart, but canvas becomes invalid by first animation frame
6. Error: `Cannot read properties of null (reading 'save')` - context lost

**Fix approach:**
- **Option A:** Fix timing in `js/app.js` - add retry/delay or use MutationObserver
- **Option B:** Add `requestAnimationFrame` wrapper around renderAllCharts
- **Option C:** Use `setTimeout(0)` after `$nextTick()` (quick workaround)

## Fix History

### 10-01-FIX (2026-01-13) - WRONG TARGET
**Attempted:** Fix canvas timing in Preact components using useRef pattern
**Result:** Fix applied to Preact components that ARE NOT VISIBLE. The visible UI uses Alpine.js + legacy JS, not Preact.
**Commits:** `052f438`, `40c420c`
**Lesson:** Should have verified which code renders the visible UI before fixing

### Fix attempt 2 (2026-01-13) - requestAnimationFrame
**Attempted:** Added `requestAnimationFrame` after `$nextTick()` in `js/app.js` loadUserCharts
**Result:** No more console error, but charts still blank
**Analysis:** Timing improved (no crash) but canvas still not rendering content

### Fix attempt 3 (2026-01-13) - double requestAnimationFrame
**Attempted:** Used nested `requestAnimationFrame(() => requestAnimationFrame(resolve))` pattern
**Result:** Charts still blank, no console errors
**Analysis:** Timing is not the root cause; something else prevents chart rendering

### Current state (2026-01-13)
**Status:** OPEN - deferred to Phase 11 Integration
**Code modified:** `js/app.js` line 389 now has double-rAF (keeps crash fix)
**Symptoms after double-rAF fix:**
- Charts work when added dynamically (Add Chart button)
- Charts blank on page refresh (F5) or new tab
- No JavaScript errors in console with double-rAF fix
- Canvas element exists, context obtainable, but chart doesn't display
- Root cause likely deeper than timing - possibly Alpine.js reactive rendering or Chart.js lifecycle issue

## Resolved Issues

[None yet]

---

*Phase: 10-charts-surface*
*Plan: 01*
*Tested: 2026-01-13 (round 3 - deferred)*
