---
status: diagnosed
trigger: "Modal can be dismissed by tapping outside during save"
created: 2026-02-04T00:00:00Z
updated: 2026-02-04T00:00:00Z
---

## Current Focus

hypothesis: The overlay onClick calls dismissCreate which guards correctly, but SettingsPanel has a SECOND dismiss path (onCloseCreate) that bypasses the isCreating guard entirely.
test: Trace both dismiss paths - overlay click vs SettingsPanel backdrop/close-animation
expecting: onCloseCreate in SettingsPanel does NOT check isCreating
next_action: Report diagnosis

## Symptoms

expected: Modal should NOT be dismissible (overlay click, backdrop, panel close) while isCreating is true
actual: Modal can be closed during an active save operation
errors: none (behavioral bug)
reproduction: Open create modal, fill in fields, click Create, quickly click overlay/backdrop
started: Since create-modal feature was added

## Eliminated

(none needed - root cause found on first hypothesis)

## Evidence

- timestamp: 2026-02-04T00:00:00Z
  checked: MyExercisesList.tsx dismissCreate callback (line 186-192)
  found: dismissCreate has an `if (isCreating) return;` guard - this is CORRECT
  implication: Clicking the modal overlay directly is properly guarded

- timestamp: 2026-02-04T00:00:00Z
  checked: SettingsPanel.tsx onCloseCreate prop (line 96)
  found: onCloseCreate is `() => setShowCreateModal(false)` - NO isCreating guard
  implication: This is a BYPASS path - if triggered, it hides the modal regardless of save state

- timestamp: 2026-02-04T00:00:00Z
  checked: SettingsPanel.tsx handleBackdropClick (line 51-53)
  found: handleBackdropClick calls onClose() which closes the entire panel
  implication: Clicking the settings-panel backdrop closes the whole panel, and the useEffect on line 33-41 then runs `setShowCreateModal(false)` after 250ms, destroying the modal mid-save

- timestamp: 2026-02-04T00:00:00Z
  checked: SettingsPanel.tsx useEffect (line 33-41)
  found: When isOpen becomes false, after 250ms it calls `setShowCreateModal(false)` unconditionally
  implication: This is a THIRD unguarded dismiss path - panel close animation cleanup ignores isCreating state

## Resolution

root_cause: |
  There are THREE paths that can dismiss the create modal. Only ONE is guarded:

  1. GUARDED: Modal overlay click -> dismissCreate (line 186-192 in MyExercisesList.tsx)
     - Has `if (isCreating) return;` guard. Correct.

  2. UNGUARDED: SettingsPanel onCloseCreate prop (line 96 in SettingsPanel.tsx)
     - `() => setShowCreateModal(false)` has no isCreating check.
     - This is passed as the onCloseCreate prop. While this specific lambda is only invoked
       FROM dismissCreate (which is guarded), the real danger is path 3.

  3. UNGUARDED: SettingsPanel backdrop click -> onClose -> useEffect cleanup (lines 51-53, 33-41 in SettingsPanel.tsx)
     - Clicking the settings-panel backdrop calls onClose(), which sets isOpen=false.
     - The useEffect on line 33-41 fires after 250ms and calls setShowCreateModal(false)
       unconditionally, ripping the modal away mid-save.
     - The backdrop (settings-backdrop div on line 60-63) has NO guard against isCreating.
     - handleBack (line 43-49) also calls onClose() and has no guard.

  The fundamental problem: SettingsPanel owns the showCreateModal state but has NO visibility
  into whether a save is in progress. The isCreating state lives in MyExercisesList, but
  SettingsPanel never receives it, so it cannot guard its own dismiss paths.

fix: (not applied - diagnosis only)
verification: (not applied - diagnosis only)
files_changed: []
