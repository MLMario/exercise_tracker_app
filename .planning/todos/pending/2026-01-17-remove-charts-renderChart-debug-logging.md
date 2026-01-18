---
created: 2026-01-17T00:00
title: Remove [charts.renderChart] debug logging
area: ui
files:
  - packages/shared/src/services/charts.ts:227-379
---

## Problem

The charts service contains multiple console.log and console.error statements prefixed with `[charts.renderChart]` that are debug logging from development. These should be removed as part of the ongoing debug cleanup effort (v2.4 milestone).

Found 7 instances in `packages/shared/src/services/charts.ts`:
- Line 227: console.log for function entry
- Line 235: console.error for missing canvas
- Line 239: console.log for canvas found
- Line 249: console.log for destroying existing chart
- Line 255: console.error for missing 2D context
- Line 361: console.log for chart creation success
- Line 379: console.error in catch block

## Solution

Remove all 7 console statements. Keep error handling logic but remove the logging. Consider if any errors should be surfaced differently (though likely not needed for chart rendering).
