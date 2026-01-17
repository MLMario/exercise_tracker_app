---
created: 2026-01-17T10:44
title: Make rest timer editable by user input
area: ui
files:
  - apps/web/src/surfaces/template-editor/ExerciseEditor.tsx:73-88
---

## Problem

Phase 35 implementation added ±10s adjustment buttons and MM:SS display for the rest timer, but removed the ability for users to directly type/edit the rest time value. The timer display is now read-only — users can only adjust in 10-second increments.

Users may want to set specific rest times (e.g., 45 seconds, 75 seconds) that aren't multiples of 10.

## Solution

TBD - Options:
1. Make the MM:SS span clickable to reveal an input field (inline edit pattern)
2. Add a small edit icon next to the time that opens an input
3. Make the time display itself an editable input with MM:SS masking
