# UAT Issues: Phase 13 Plan 01

**Tested:** 2026-01-13
**Source:** .planning/phases/13-ui-polish/13-01-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Logout button has no hover effect

**Discovered:** 2026-01-13
**Phase/Plan:** 13-01
**Severity:** Minor
**Feature:** Dashboard header logout button
**Description:** Logout button does not change appearance on hover. Expected red border/text effect not visible.
**Expected:** Button border and text turn red (#f87171) on hover with subtle red background
**Actual:** No visual change on hover
**Repro:**
1. Log in to the app
2. Look at logout button in top-right header
3. Hover over the button
4. Observe no color change

### UAT-002: Chart content disappears on page refresh and after workout actions

**Discovered:** 2026-01-13
**Phase/Plan:** 13-01
**Severity:** Major
**Feature:** Progress Charts display
**Description:** Chart content disappears after page refresh and various workout interactions. Charts only reappear after specific user interactions.
**Expected:** Charts should remain visible and update properly after page refresh and workout completion
**Actual:** Chart content is empty/invisible in multiple scenarios
**Repro:**
1. Have at least one chart configured with data
2. Refresh the page → chart content disappears
3. Interact with "Add Chart" button → chart content reappears
4. Alternatively: Switch to another browser tab and return → chart content reappears
5. Start a workout and cancel → chart content remains empty
6. Start a workout, log exercise data for the chart's exercise, finish and save → chart content remains empty

**Notes:** This appears to be a chart rendering/state management issue where charts are not properly initialized or refreshed after certain actions.

## Resolved Issues

### UAT-002: Solved by user

Root Cause #3 Found: The isRendered check was using a ref which doesn't trigger re-renders.

The Problem:

isRendered = chartInstanceRef.current !== null computed during render
Initial render: ref is null → isRendered = false
Canvas gets class chart-canvas loading → CSS opacity: 0
useEffect renders chart and sets ref
Refs don't trigger re-renders, so isRendered stays false
Canvas stays invisible forever
The Fix in ChartCard.tsx:

Changed from const isRendered = chartInstanceRef.current !== null (computed)
To const [isRendered, setIsRendered] = useState(false) (state)
setIsRendered(true) after chart renders → triggers re-render → removes loading class
setIsRendered(false) on cleanup
---

*Phase: 13-ui-polish*
*Plan: 01*
*Tested: 2026-01-13*
