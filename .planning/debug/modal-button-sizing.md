---
status: diagnosed
trigger: "Delete Exercise and Keep Exercise buttons in delete confirmation modal are too large and not fully visible within modal boundaries"
created: 2026-02-03T00:00:00Z
updated: 2026-02-03T00:00:00Z
---

## Current Focus

hypothesis: Buttons use full-size `.btn` styling (large padding, min-height 44px, 1rem font) inside `modal-sm` (max-width 400px), leaving insufficient horizontal space for two side-by-side buttons.
test: Calculate available content width vs combined button widths.
expecting: Combined button width exceeds or nearly exceeds available space.
next_action: Document root cause and suggested fix.

## Symptoms

expected: "Delete Exercise" and "Keep Exercise" buttons should fit comfortably within the modal, with reasonable sizing proportional to the small modal.
actual: Buttons are too large and not fully visible within the modal boundaries.
errors: No runtime errors -- purely cosmetic/layout issue.
reproduction: Open the delete confirmation modal for any exercise in MyExercisesList.
started: Introduced with Phase 20 (exercise-delete) implementation.

## Eliminated

(none -- root cause identified on first hypothesis)

## Evidence

- timestamp: 2026-02-03T00:00:00Z
  checked: MyExercisesList.tsx modal markup (lines 306-330 and 192-216)
  found: Buttons use plain `btn btn-secondary` and `btn btn-danger` classes with no size modifier. Labels are "Keep Exercise" and "Delete Exercise".
  implication: Buttons inherit the full-size `.btn` base styling (designed for primary page actions, not compact modal footers).

- timestamp: 2026-02-03T00:00:00Z
  checked: .btn base class (styles.css lines 404-420)
  found: |
    .btn {
      padding: 0.75rem var(--spacing-lg);   /* = 12px 24px */
      font-size: 1rem;                       /* = 16px */
      min-height: var(--min-tap-target);     /* = 44px */
      white-space: nowrap;
    }
  implication: Each button is at minimum 44px tall with 24px horizontal padding on each side. The `white-space: nowrap` prevents label wrapping, so button width is driven entirely by text + padding.

- timestamp: 2026-02-03T00:00:00Z
  checked: .modal-sm and .modal classes (styles.css lines 810-883)
  found: |
    .modal { padding: var(--spacing-xl); /* = 2rem = 32px */ max-width: 480px; width: 100%; }
    .modal-sm { max-width: 400px; }
    .modal-footer { display: flex; gap: var(--spacing-sm); /* = 8px */ justify-content: flex-end; }
  implication: Available content width = 400px - 32px*2 = 336px. The footer is a simple flex row with no wrapping.

- timestamp: 2026-02-03T00:00:00Z
  checked: Calculated combined button widths
  found: |
    At 16px font-size:
    - "Keep Exercise" text ~= 110px + 48px padding = ~158px
    - "Delete Exercise" text ~= 120px + 48px padding = ~168px
    - Gap: 8px
    - Total: ~334px needed vs 336px available
    On smaller screens or with slightly different font rendering, buttons can exceed or completely fill the available space. The buttons also appear visually oversized at 44px height in a compact modal context.
  implication: The buttons barely fit (or don't fit) depending on viewport/font rendering. Even when they do technically fit, they fill the entire footer width wall-to-wall, looking disproportionately large for a small confirmation modal. On mobile viewports where `modal-sm` may be narrower than 400px due to overlay padding (16px on each side), the buttons will definitely overflow.

- timestamp: 2026-02-03T00:00:00Z
  checked: .btn-sm modifier class (styles.css lines 499-503)
  found: |
    .btn-sm {
      padding: 0.5rem var(--spacing-md);  /* = 8px 16px */
      font-size: 0.875rem;                 /* = 14px */
      min-height: 36px;
    }
  implication: A smaller button variant exists but is not used by the modal buttons.

- timestamp: 2026-02-03T00:00:00Z
  checked: modal-overlay padding constraint
  found: |
    .modal-overlay { padding: var(--spacing-md); /* = 1rem = 16px */ }
  implication: On viewports <= 432px wide (400px + 16px*2), the modal is forced narrower than 400px, making the button overflow problem worse. This is every mobile phone viewport.

## Resolution

root_cause: |
  The delete confirmation modal buttons use the full-size `.btn` base class styling
  (padding: 12px 24px, font-size: 16px, min-height: 44px) without any size reduction,
  inside a `modal-sm` container (max-width: 400px, internal padding: 32px per side).

  This creates two compounding problems:

  1. HORIZONTAL OVERFLOW: The two buttons ("Keep Exercise" ~158px + "Delete Exercise"
     ~168px + 8px gap = ~334px) nearly fill or exceed the 336px available content width.
     On mobile viewports (where overlay padding further constrains the modal), buttons
     definitely overflow. The `modal-footer` has no `flex-wrap` so buttons cannot
     gracefully reflow.

  2. VISUAL DISPROPORTION: At 44px height with 1rem font-size, the buttons are
     sized for primary page actions, not for a compact confirmation dialog. They
     appear oversized relative to the modal's content.

fix: |
  Two options (can be combined):

  Option A - Use btn-sm class on modal buttons (simplest):
    In MyExercisesList.tsx, change both button classes from:
      "btn btn-secondary" -> "btn btn-sm btn-secondary"
      "btn btn-danger"    -> "btn btn-sm btn-danger"
    This reduces padding to 8px 16px, font-size to 14px, min-height to 36px.
    Both instances of the modal (lines 207-211 and 321-325) need updating.

  Option B - Add modal-footer-specific button sizing in CSS:
    .modal-sm .modal-footer .btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      min-height: 36px;
    }
    This scopes the fix to all small modals without changing markup.

  Option C - Add flex-wrap to modal-footer (safety net):
    .modal-footer { flex-wrap: wrap; }
    This prevents overflow but doesn't fix the visual disproportion.

  Recommended: Option A (btn-sm on both buttons in both modal instances) is the
  simplest, most targeted fix. It uses an existing class, requires no CSS changes,
  and directly addresses both the overflow and visual proportion issues.

verification: |
  Not yet verified (diagnosis only).
  To verify:
  1. Open the app, navigate to exercises list with at least one custom exercise.
  2. Click the trash icon to trigger the delete confirmation modal.
  3. Confirm both buttons fit within the modal with visible spacing on both sides.
  4. Test on a narrow mobile viewport (375px wide) to confirm no overflow.
  5. Confirm buttons are visually proportional to the modal size.

files_changed: []
