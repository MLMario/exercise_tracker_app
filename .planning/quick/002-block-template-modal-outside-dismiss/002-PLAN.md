---
phase: quick-002
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/ConfirmationModal.tsx
  - apps/web/src/surfaces/workout/WorkoutSurface.tsx
autonomous: true

must_haves:
  truths:
    - "Clicking outside the template update modal does NOT dismiss it"
    - "Template update modal can only be closed via its Yes/No buttons"
    - "All other ConfirmationModal instances retain their existing overlay-dismiss behavior"
  artifacts:
    - path: "apps/web/src/components/ConfirmationModal.tsx"
      provides: "Optional dismissOnOverlayClick prop"
      contains: "dismissOnOverlayClick"
    - path: "apps/web/src/surfaces/workout/WorkoutSurface.tsx"
      provides: "Template update modal with overlay dismiss disabled"
      contains: "dismissOnOverlayClick={false}"
  key_links:
    - from: "ConfirmationModal.tsx"
      to: "handleOverlayClick"
      via: "dismissOnOverlayClick prop guards onCancel call"
      pattern: "dismissOnOverlayClick.*false|handleOverlayClick"
---

<objective>
Prevent the template update confirmation modal from being dismissed by clicking outside it.

Purpose: When users finish a workout with structural template changes, the template update modal asks whether to update the template. Clicking outside currently triggers `declineTemplateUpdate` which silently declines the update -- users may not realize they dismissed a decision. The modal should require an explicit button choice.

Output: Updated ConfirmationModal with optional `dismissOnOverlayClick` prop, and WorkoutSurface template update modal using it.
</objective>

<execution_context>
@C:\Users\MarioPC\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\MarioPC\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/ConfirmationModal.tsx
@apps/web/src/surfaces/workout/WorkoutSurface.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add dismissOnOverlayClick prop to ConfirmationModal and apply to template update modal</name>
  <files>
    apps/web/src/components/ConfirmationModal.tsx
    apps/web/src/surfaces/workout/WorkoutSurface.tsx
  </files>
  <action>
In `apps/web/src/components/ConfirmationModal.tsx`:

1. Add optional prop `dismissOnOverlayClick` to `ConfirmationModalProps` interface:
   - Type: `boolean` (optional)
   - JSDoc: `/** Whether clicking the overlay dismisses the modal. Defaults to true. */`
   - Default value: `true`

2. Destructure `dismissOnOverlayClick = true` in the component function parameters.

3. Update `handleOverlayClick` to check the prop before calling `onCancel()`:
   ```
   const handleOverlayClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
     if (e.target === e.currentTarget && dismissOnOverlayClick) {
       onCancel();
     }
   };
   ```

4. Update the component JSDoc comment (line 33) to mention the new prop: "Clicking the overlay calls onCancel unless dismissOnOverlayClick is false."

In `apps/web/src/surfaces/workout/WorkoutSurface.tsx`:

5. On the Template Update Modal `<ConfirmationModal>` instance (around line 895), add the prop:
   `dismissOnOverlayClick={false}`

Do NOT modify the Finish Workout or Cancel Workout modals -- those should retain overlay dismiss behavior.
Do NOT modify any DashboardSurface usage -- those should retain overlay dismiss behavior.
  </action>
  <verify>
    Run `npx tsc --noEmit` from `apps/web/` to confirm no type errors introduced.
    Grep for `dismissOnOverlayClick` to confirm it appears in ConfirmationModal.tsx (prop definition + usage) and WorkoutSurface.tsx (template update modal only).
    Grep for `handleOverlayClick` to confirm the guard condition is present.
  </verify>
  <done>
    - ConfirmationModal has `dismissOnOverlayClick` prop defaulting to `true`
    - Template update modal in WorkoutSurface passes `dismissOnOverlayClick={false}`
    - Overlay click on template update modal does nothing
    - All other ConfirmationModal usages unchanged (still dismiss on overlay click)
    - TypeScript compiles without errors
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes from apps/web/
2. Only the template update modal has `dismissOnOverlayClick={false}` -- no other ConfirmationModal instance is affected
3. The `handleOverlayClick` function checks `dismissOnOverlayClick` before calling `onCancel`
</verification>

<success_criteria>
- Template update confirmation modal cannot be dismissed by clicking outside
- Users must explicitly click "Yes, Update" or "No, Keep Original" to close it
- Finish Workout and Cancel Workout modals still dismiss on overlay click
- Dashboard delete modals still dismiss on overlay click
- No type errors
</success_criteria>

<output>
After completion, create `.planning/quick/002-block-template-modal-outside-dismiss/002-SUMMARY.md`
</output>
