# UAT Issues: Phase 12 Bug Fixes

**Tested:** 2026-01-13
**Source:** .planning/phases/12-bug-fixes/12-01-SUMMARY.md, 12-02-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

None - all issues resolved.

## Resolved Issues

### UAT--001 Resolve by User. Details are:

Root Cause (Confirmed from Console)
Supabase clears the URL hash after processing the recovery tokens. By the time AuthSurface mounts:

The hash is empty (hash: "")
The PASSWORD_RECOVERY event already fired (AuthSurface missed it)

main.tsx hash:      #access_token=...&type=recovery  ✓ Detected
AuthSurface hash:   (empty)                          ✗ Too late!
Fix Applied
Pass recovery mode from parent to child via prop:

File	Change
AuthSurface.tsx:36-39	Added AuthSurfaceProps interface with isRecoveryMode prop
AuthSurface.tsx:47	Accept prop in component
AuthSurface.tsx:87-91	Use prop to set updatePassword surface
main.tsx:294	Pass isPasswordRecoveryMode state to AuthSurface
Now the flow is:

main.tsx detects type=recovery in hash before Supabase clears it
main.tsx sets isPasswordRecoveryMode = true
main.tsx renders <AuthSurface isRecoveryMode={true} />
AuthSurface uses the prop to show updatePassword form

### UAT-002: Max Weight metric feature removed

**Discovered:** 2026-01-13
**Phase/Plan:** 12-02
**Severity:** Major
**Feature:** Chart metrics
**Resolution:** Removed max_weight feature entirely per user decision (database has check constraint)

**Fix Applied via 12-FIX.md:**
- Removed 'max_weight' from ExerciseMetricType union (src/types/services.ts)
- Removed max_weight handling from getExerciseMetrics (src/services/logging.ts)
- Removed max_weight option from Add Chart dropdown (src/surfaces/dashboard/AddChartModal.tsx)
- Removed max_weight case from formatMetricType (src/surfaces/dashboard/ChartCard.tsx)

**Commits:** ad288c1, 1d6c2a0

---
*Phase: 12-bug-fixes*
*Tested: 2026-01-13*
