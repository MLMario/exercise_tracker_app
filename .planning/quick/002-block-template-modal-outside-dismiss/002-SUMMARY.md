---
phase: quick-002
plan: 01
type: execute
subsystem: ui-behavior
completed: 2026-02-06
duration: 1 min

requires: []
provides:
  - "ConfirmationModal with optional dismissOnOverlayClick prop"
  - "Template update modal blocks outside clicks"
affects: []

tech-stack:
  added: []
  patterns: ["Optional behavior via props", "Default prop values"]

key-files:
  created: []
  modified:
    - apps/web/src/components/ConfirmationModal.tsx
    - apps/web/src/surfaces/workout/WorkoutSurface.tsx

decisions:
  - decision: "Add optional dismissOnOverlayClick prop to ConfirmationModal"
    rationale: "Allows selective control over overlay dismiss behavior per modal instance"
    alternatives: ["Create separate modal component for non-dismissible modals", "Add global configuration"]
    chosen: "Optional prop with default true preserves existing behavior"

tags: [modal, ui, confirmation, overlay, template]
---

# Quick Task 002: Block Template Modal Outside Dismiss

**One-liner:** Added optional dismissOnOverlayClick prop to ConfirmationModal to prevent template update modal from being dismissed by clicking outside

## Objective

Prevent the template update confirmation modal from being dismissed by clicking outside it. Users must explicitly choose "Yes, Update" or "No, Keep Original" buttons to close the modal.

## Problem

When users finish a workout with structural template changes, the template update modal asks whether to update the template. Clicking outside the modal currently triggers `declineTemplateUpdate` which silently declines the update—users may not realize they dismissed an important decision.

## Changes Made

### 1. ConfirmationModal Component Enhancement

**File:** `apps/web/src/components/ConfirmationModal.tsx`

**Changes:**
- Added `dismissOnOverlayClick?: boolean` prop to `ConfirmationModalProps` interface
- JSDoc: "Whether clicking the overlay dismisses the modal. Defaults to true."
- Destructured with default value: `dismissOnOverlayClick = true`
- Updated `handleOverlayClick` to check prop before calling `onCancel()`:
  ```typescript
  if (e.target === e.currentTarget && dismissOnOverlayClick) {
    onCancel();
  }
  ```
- Updated component JSDoc comment to mention overlay dismiss behavior

**Behavior:**
- Default `true` preserves existing behavior for all current modal instances
- When `false`, clicking overlay has no effect—modal requires button click

### 2. Template Update Modal Configuration

**File:** `apps/web/src/surfaces/workout/WorkoutSurface.tsx`

**Changes:**
- Added `dismissOnOverlayClick={false}` prop to Template Update Modal (line 903)
- Other modals unchanged:
  - Finish Workout modal: retains overlay dismiss (default behavior)
  - Cancel Workout modal: retains overlay dismiss (default behavior)
  - DashboardSurface delete modals: retain overlay dismiss (default behavior)

**Result:**
- Only the template update modal requires explicit button choice
- All other confirmation modals preserve their existing behavior

## Implementation Details

**Guard Condition:**
```typescript
const handleOverlayClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
  if (e.target === e.currentTarget && dismissOnOverlayClick) {
    onCancel();
  }
};
```

**Default Behavior Preserved:**
The `dismissOnOverlayClick = true` default ensures all existing modal instances continue working exactly as before. Only the template update modal explicitly sets it to `false`.

## Verification

✅ TypeScript compilation (pre-existing unrelated error in useClickOutside.ts)
✅ `dismissOnOverlayClick` prop appears in ConfirmationModal.tsx (4 locations):
  - Interface definition
  - JSDoc comment
  - Component parameter with default
  - Guard condition usage
✅ `dismissOnOverlayClick={false}` only in WorkoutSurface.tsx template update modal
✅ No other ConfirmationModal instances affected (DashboardSurface, other WorkoutSurface modals)
✅ `handleOverlayClick` checks `dismissOnOverlayClick` before calling `onCancel`

## Task Commits

| Task | Commit | Files Modified |
|------|--------|----------------|
| Add dismissOnOverlayClick prop and apply to template update modal | 3a014e9 | ConfirmationModal.tsx, WorkoutSurface.tsx |

## Deviations from Plan

None - plan executed exactly as written.

## User Impact

**Before:**
- Users could accidentally dismiss template update decision by clicking outside modal
- Silent decline of template update (no visual feedback)
- Potential confusion: "Did I update the template or not?"

**After:**
- Template update modal requires explicit button choice
- Users cannot accidentally dismiss important decision
- Clear, intentional action required
- Other modals retain quick dismiss capability (appropriate for less critical actions)

## Testing Notes

**Manual verification needed:**
1. Start workout from a template
2. Add an exercise or change set count
3. Click "Finish"
4. Template update modal appears
5. Click outside modal (on dark overlay)
6. **Expected:** Modal stays open, no action taken
7. Click "No, Keep Original" or "Yes, Update"
8. **Expected:** Modal closes and saves workout

**Also verify:**
- Finish Workout modal still dismisses on overlay click
- Cancel Workout modal still dismisses on overlay click
- Dashboard delete modals still dismiss on overlay click

## Next Steps

None required. Feature is complete and ready for user testing.

## Self-Check: PASSED

All files exist and commits verified.
