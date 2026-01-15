# UAT Issues: Phase 8 Plan 3

**Tested:** 2026-01-13
**Source:** .planning/phases/08-template-editor-surface/08-03-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Already-added exercises lack visual indication in picker

**Discovered:** 2026-01-13
**Phase/Plan:** 08-03
**Severity:** Minor
**Feature:** ExercisePickerModal - exercise selection
**Description:** When opening the exercise picker, exercises that have already been added to the template are not visually distinguished. They can be searched and found, but there's no tag, badge, or visual cue that they're already in the template.
**Expected:** Already-added exercises should show a visual indicator (e.g., "Added" badge, grayed out, different background) so users know at a glance which ones are in their template.
**Actual:** Already-added exercises look identical to available ones. Clicking them does nothing (correctly prevents duplicates), but the user has no way to know this until they try to click.
**Repro:**
1. Open template editor
2. Add an exercise (e.g., "Bench Press")
3. Click "Add Exercise" to open picker
4. Find "Bench Press" in the list
5. Notice there's no visual indication it's already added

## Resolved Issues

[None yet]

---

*Phase: 08-template-editor-surface*
*Plan: 03*
*Tested: 2026-01-13*
