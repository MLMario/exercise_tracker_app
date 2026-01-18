# UAT Issues: Phase 2 Plan 01

**Tested:** 2026-01-17
**Source:** .planning/phases/02-exercise-name-truncation/02-01-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Long exercise names overflow instead of truncating

**Discovered:** 2026-01-17
**Phase/Plan:** 02-01
**Severity:** Cosmetic
**Feature:** Exercise name truncation
**Description:** Long exercise names overflow beyond their container boundary instead of truncating with ellipsis
**Expected:** Names should truncate with "..." when too long for the container
**Actual:** Names extend beyond their container boundary
**Repro:**
1. Open template editor
2. Add an exercise with a long name (e.g., "Single Leg Romanian Deadlift With Kettlebell")
3. Observe the name overflows

## Resolved Issues

[None yet]

---

*Phase: 02-exercise-name-truncation*
*Plan: 01*
*Tested: 2026-01-17*
