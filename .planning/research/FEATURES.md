# Features Research: Settings & Exercise Management

**Domain:** Fitness/Workout Tracker App - Settings Surface & Custom Exercise CRUD
**Researched:** 2026-02-03
**Overall confidence:** HIGH (patterns well-established across major competitors)

---

## Table Stakes

Features users expect from settings and exercise management surfaces in workout tracker apps. Missing any of these makes the product feel incomplete or broken.

### Settings Surface

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Gear icon entry point | Universal settings pattern. Users look for gear/cog icon. Strong, Hevy, Fitbit, Apple Fitness all use it. | Low | Place far-right in header per convention. Replaces or augments logout button location. |
| Settings menu with clear sections | Every fitness app organizes settings into logical groups (Profile, Exercises, Preferences). Hevy uses Profile tab with Exercises sub-section. Strong uses distinct settings screens. | Low | Menu items as list/cards, not tabs. Disabled items should show "Coming Soon" text so users know features are planned, not missing. |
| Logout in settings | Standard mobile/web pattern. Dashboard header logout is unusual for mature apps. Strong, Hevy, MyFitnessPal all place logout in settings/profile. | Low | Bottom of settings menu per convention. Often visually distinct (red text or separated from other items). |
| Back navigation to dashboard | Users must be able to return. Arrow-left or "Back" link is universal. | Low | Consistent with other surfaces that have back navigation. |

### My Exercises / Exercise Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Exercise list showing only user-created exercises | Hevy separates custom exercises from library exercises. Users expect to manage what they created, not browse the full library (873 system exercises would overwhelm). | Low | Critical scope decision already made. System exercises excluded. |
| Create exercise | Hevy, Strong, JEFIT all support creating custom exercises. Users who cannot find an exercise in the library need to create their own. | Low | Can reuse existing ExercisePickerModal create flow, or provide a dedicated button. |
| Edit exercise (name + category) | Hevy allows editing name, muscle groups, equipment. Strong allows editing custom exercise details. Users expect to fix typos and recategorize. | Medium | Slide-in panel from right is appropriate per Adobe Commerce pattern library for sub-task editing. Fields: name (text input) + category (dropdown). Keep minimal -- name and category are the two user-visible attributes. |
| Delete exercise with confirmation | Universal destructive action pattern. NN/Group recommends confirmation dialogs for irreversible actions. Hevy uses three-dot menu > Delete. | Medium | Must include confirmation modal. Button labels should be specific: "Delete Exercise" / "Keep Exercise", not "Yes" / "No". |
| Search by name | Hevy and Strong both offer exercise search. Even with a small list, search reduces friction. Consistent with existing Exercise Picker search behavior. | Low | Name-only search, consistent with v2.8 decision for Exercise Picker. |
| Category filter | Hevy filters by equipment and muscle group. Category filter aligns with existing picker pattern from v2.8. | Low | Reuse same dropdown pattern from ExercisePickerModal (180px partial-width). |
| Empty state when no custom exercises | NN/Group and multiple UX studies emphasize that empty states are critical onboarding moments. Fitness apps lose 40% of new users when empty states just say "no data." | Low | Must include: explanatory text ("You haven't created any custom exercises yet"), context about what custom exercises are for, and a clear CTA button ("Create Your First Exercise"). Single action path -- do not offer multiple options. |

### Edit Panel (Slide-In Overlay)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Slide-in from right | Adobe Commerce pattern library documents this as the standard for sub-task editing. Maintains context with the parent list visible behind a scrim. PatternFly modeless overlay uses same pattern. | Medium | Panel should not fully obscure parent page. Semi-transparent backdrop on the list behind it. |
| Name text input | Primary editable field. Pre-populated with current value. | Low | Standard text input with clear/focus behavior. |
| Category dropdown | Secondary editable field. Must match the 7 categories (Chest, Back, Shoulders, Arms, Core, Legs, Other). | Low | Reuse existing dropdown component pattern. |
| Save / Cancel actions | Universal form pattern. "Save" as primary action, "Cancel" as secondary. | Low | Save validates non-empty name. Cancel dismisses without saving. No auto-save -- explicit save matches the app's existing patterns (template editor uses explicit Save). |
| Close on backdrop click | Standard overlay dismissal pattern. Clicking the scrim/backdrop area dismisses the panel. | Low | Should behave as Cancel (discard unsaved changes). |

### Delete Confirmation

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Confirmation modal | NN/Group: confirmation dialogs prevent errors for irreversible actions. Smashing Magazine: measure destructiveness by reversibility, complexity, frequency. Exercise deletion is irreversible and infrequent -- warrants confirmation. | Low | Simple modal with exercise name, warning text, and two buttons. |
| Specific button labels | NN/Group and Intuit design guidelines: use action-specific labels, not generic Yes/No. | Low | "Delete Exercise" (destructive, red) and "Keep Exercise" (secondary). |
| Dependency warning (if in use) | Cloudscape Design System pattern: warn about cascading effects. If exercise is used in templates or workout logs, user must know. Hevy does not block deletion but data persists. | Medium | Check template_exercises and workout_log_exercises for references. If found, show warning: "This exercise is used in X template(s) and Y workout log(s). Deleting it will remove it from these." Do NOT block deletion -- warn and let user decide. |

---

## Differentiators

Features that are not expected but would set the product apart. Prioritize these after table stakes are solid.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Inline exercise count badge on settings menu | Shows "My Exercises (3)" in the settings menu, giving users a quick sense of their custom library size without navigating in. No major competitor does this consistently. | Low | Minor but polished touch. |
| Undo after delete (toast) | Instead of or in addition to confirmation, show a timed "Undo" toast after deletion. UX Movement and Smashing Magazine recommend undo for moderate-severity actions. Reduces friction while maintaining safety. | Medium | 5-second toast with "Undo" button. Soft-delete then hard-delete after timeout. Adds complexity but significantly improves UX. Defer to post-MVP. |
| Sort options for exercise list | Sort by name (A-Z, Z-A), by category, or by date created. Hevy sorts alphabetically by default. Offering sort gives power users control. | Low | Dropdown or toggle. Low effort, moderate value. |
| Bulk actions (multi-select delete) | Select multiple exercises and delete in one action. Useful for users who created many test exercises. JEFIT supports bulk management. | Medium | Adds multi-select UI state, select-all, bulk confirmation. Defer to later. |
| Exercise usage indicator | Show where each exercise is used (e.g., "Used in 2 templates, 5 workouts"). Provides context before editing/deleting. Similar to IDE "find usages" pattern. | Medium | Requires joining across template_exercises and workout_log_exercises. Valuable for informed decision-making but not expected. |
| Animated slide-in panel transitions | Spring-based animation on the edit panel slide-in/out. Consistent with existing swipe gesture polish (v2.6). Makes the app feel premium. | Low | Reuse cubic-bezier pattern from swipe animations. Low effort, high perceived quality. |
| Keyboard shortcut support | Esc to close panels/modals, Enter to save. Desktop power-user feature. | Low | Minor effort, significant desktop UX improvement. |

---

## Anti-Features

Things to deliberately NOT build. Common mistakes in this domain that would hurt the product.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Showing system exercises in My Exercises | With 873 system exercises, the list becomes unmanageable. Users cannot edit/delete system exercises anyway. Hevy separates library exercises from custom exercises. This decision is already correctly scoped. | Show only user-created exercises. System exercises remain accessible only through the Exercise Picker in template/workout flows. |
| Exercise images/GIFs/videos in management view | Storage and bandwidth costs are significant. Hevy limits this to Pro users. For a management CRUD view, visual media adds complexity without proportional value -- users know their own exercises by name. | Keep the list text-based with name + category. Images/videos are a future enhancement for the exercise picker, not the management view. Already listed as out of scope. |
| Complex exercise metadata editing | Hevy allows editing equipment, primary/secondary muscles, exercise type, media. This creates a heavyweight edit form that is slow to load and intimidating. For a tracker focused on simplicity, it adds friction. | Limit edit to name + category only. These are the two fields users actually see in the picker and templates. Other metadata (instructions, level, force, mechanic) is stored but not user-editable in v3.0. |
| Tabbed settings interface | Tabs (Profile / Exercises / Preferences) add navigation complexity within the settings surface. With Profile and Preferences disabled, tabs would show two grayed-out tabs and one active one -- poor UX. | Use a menu/list pattern instead. Each menu item navigates to its sub-view. "My Exercises" is a menu item that opens the exercise list. Disabled items appear as grayed menu rows with "Coming Soon" text. |
| Blocking delete when exercise is in use | Forcing users to manually remove an exercise from every template before deleting it creates excessive friction. Users will abandon the flow or get frustrated. | Warn about dependencies in the confirmation modal, but allow deletion. The exercise data in existing workout logs should be preserved (denormalized or soft-referenced) so historical data is not lost. |
| Auto-save on edit | Auto-save removes user control and can cause accidental changes. The existing app uses explicit Save/Cancel in the template editor. Inconsistency would confuse users. | Explicit Save/Cancel buttons on the edit panel. Consistent with template editor pattern. |
| Search across system + custom exercises in management view | Mixing the management view with the picker view. The management view is for CRUD operations on user exercises. Searching system exercises here would confuse the scope -- users cannot edit system exercises. | Keep search scoped to custom exercises only. System exercise browsing belongs in the Exercise Picker. |
| Full-page navigation for edit | Navigating to a separate page/surface to edit a single exercise's name and category is overkill. Loses context of the list. | Slide-in overlay panel maintains list context. User can see which exercise they selected. |
| Drag-to-reorder exercises | Manual ordering adds state complexity (sort_order column, drag handling, persistence). Fitness apps do not generally support custom sort order for exercise libraries. | Alphabetical sort by default. Optional sort controls as a differentiator later. |
| Inline editing in the list | Editing directly in the list row (contentEditable or inline inputs) is error-prone on mobile, hard to validate, and inconsistent with the explicit save pattern. | Dedicated slide-in edit panel with proper form controls and save/cancel. |
| Deep settings hierarchy | Multi-level nesting (Settings > My Exercises > Exercise Detail > Edit) adds cognitive load. Strong and Hevy keep exercise management to 2 levels max. | Settings menu (level 1) > My Exercises list with inline actions (level 2). Edit panel is an overlay on level 2, not a new level. |
| Profile and Preferences as functional stubs | Building partially functional Profile or Preferences views that do nothing creates a worse impression than clearly labeling them "Coming Soon." Users will try to interact and get frustrated by non-functional forms. | Disabled menu items with "Coming Soon" label. Clear, honest, zero confusion. |

---

## Feature Dependencies

```
Settings Surface (gear icon entry)
  |
  +-- Settings Menu
  |     |
  |     +-- My Exercises (active)
  |     |     |
  |     |     +-- Exercise List (requires: fetchUserExercises service)
  |     |     |     |
  |     |     |     +-- Search (requires: list exists)
  |     |     |     +-- Category Filter (requires: list exists)
  |     |     |     +-- Empty State (requires: list exists, shown when count=0)
  |     |     |
  |     |     +-- Create Exercise (requires: existing create modal/flow)
  |     |     +-- Edit Exercise (requires: slide-in panel + updateExercise service)
  |     |     +-- Delete Exercise (requires: confirmation modal + dependency check)
  |     |
  |     +-- Profile (disabled, "Coming Soon")
  |     +-- Preferences (disabled, "Coming Soon")
  |     +-- Log Out (requires: existing auth.logout, relocated from dashboard)
  |
  +-- Dashboard Header Change (remove logout, add gear icon)
```

### Critical Path

1. **updateExercise service** -- backend must exist before edit UI works
2. **Settings surface + menu** -- container must exist before My Exercises view
3. **Exercise list** -- list must render before search/filter/CRUD actions
4. **Edit panel + Delete modal** -- can be built in parallel once list exists

---

## MVP Recommendation

For v3.0, prioritize all Table Stakes features. They represent the complete, expected experience.

**Build in this order:**

1. **Backend: updateExercise service function** -- unblocks edit functionality
2. **Settings surface + gear icon + menu** -- establishes the new surface, relocates logout
3. **My Exercises list with empty state** -- core view, handles the zero-exercise case
4. **Search + category filter** -- reuse existing patterns from ExercisePickerModal
5. **Create exercise from My Exercises** -- reuse existing modal
6. **Edit slide-in panel** -- name + category editing
7. **Delete with confirmation modal** -- including dependency warning

**Defer to post-v3.0:**
- Undo-after-delete toast (nice UX but adds soft-delete complexity)
- Sort options (alphabetical default is fine for v3.0)
- Bulk actions (low user need initially)
- Exercise usage indicators (valuable but requires cross-table queries on every render)
- Profile and Preferences content (already scoped as "Coming Soon")

---

## Competitor Patterns Summary

| Pattern | Strong | Hevy | JEFIT | IronFactor v3.0 Plan |
|---------|--------|------|-------|---------------------|
| Custom exercise create | Yes | Yes (7 free, unlimited Pro) | Yes | Yes (unlimited, free) |
| Custom exercise edit | Yes (all fields) | Yes (name, muscles, equipment, media) | Yes | Yes (name + category only) |
| Custom exercise delete | Yes | Yes (three-dot menu) | Yes | Yes (with dependency warning) |
| Exercise management location | Inline in library | Profile tab > Exercises | Exercise database section | Settings > My Exercises |
| System exercises in management | Mixed with custom | Separated (custom section below "Recent") | Mixed | Excluded (custom only) |
| Edit UI pattern | Full screen | Full screen edit view | Full screen | Slide-in overlay panel |
| Delete confirmation | Simple dialog | Simple dialog | Simple dialog | Dialog with dependency info |
| Search/filter in management | Yes | Yes (equipment, muscle) | Yes | Yes (name search + category) |
| Empty state | Minimal | Minimal | Minimal | Designed empty state with CTA |
| Settings access | Tab bar item | Profile tab | Menu/hamburger | Gear icon in header |

---

## Sources

### Competitor Analysis
- [Hevy Custom Exercises Feature Page](https://www.hevyapp.com/features/custom-exercises/) - MEDIUM confidence (marketing page, some details verified via help docs)
- [Hevy Workout Settings](https://www.hevyapp.com/features/workout-settings/) - MEDIUM confidence
- [Strong App Review 2026](https://www.prpath.app/blog/strong-app-review-2026.html) - MEDIUM confidence
- [Strong vs Hevy Comparison 2026](https://gymgod.app/blog/strong-vs-hevy) - MEDIUM confidence
- [Best Gym Workout Tracker Apps 2026](https://www.jefit.com/wp/guide/best-gym-workout-tracker-apps-of-2026-top-5-reviewed-and-compared-for-every-fitness-goal/) - MEDIUM confidence
- [Best Weightlifting Apps 2025](https://just12reps.com/best-weightlifting-apps-of-2025-compare-strong-fitbod-hevy-jefit-just12reps/) - MEDIUM confidence

### UX Patterns
- [NN/Group: Confirmation Dialogs](https://www.nngroup.com/articles/confirmation-dialog/) - HIGH confidence (authoritative UX research)
- [Smashing Magazine: Dangerous Actions in UIs](https://www.smashingmagazine.com/2024/09/how-manage-dangerous-actions-user-interfaces/) - HIGH confidence
- [Adobe Commerce: Slide-out Panels Pattern](https://developer.adobe.com/commerce/admin-developer/pattern-library/containers/slideouts-modals-overlays) - HIGH confidence (established pattern library)
- [PatternFly: Modeless Overlay](https://pf3.patternfly.org/v3/pattern-library/forms-and-controls/modeless-overlay/) - HIGH confidence
- [Intuit Content Design: Confirmations](https://contentdesign.intuit.com/product-and-ui/confirmations/) - HIGH confidence
- [NN/Group: Empty States in Applications](https://www.nngroup.com/articles/empty-state-interface-design/) - HIGH confidence
- [Carbon Design System: Empty States](https://carbondesignsystem.com/patterns/empty-states-pattern/) - HIGH confidence

### Fitness App UX
- [Stormotion: Fitness App UI Design](https://stormotion.io/blog/fitness-app-ux/) - MEDIUM confidence
- [Eastern Peak: Fitness App Design Best Practices](https://easternpeak.com/blog/fitness-app-design-best-practices/) - MEDIUM confidence
- [15 Must-Have Features for Fitness App 2026](https://codetheorem.co/blogs/features-for-fitness-app/) - LOW confidence (listicle, generic)
- [Dataconomy: UX Practices for Fitness Apps 2025](https://dataconomy.com/2025/11/11/best-ux-ui-practices-for-fitness-apps-retaining-and-re-engaging-users/) - MEDIUM confidence

### Settings/Profile UX
- [MyFitnessPal: Change Units](https://support.myfitnesspal.com/hc/en-us/articles/360032623891-How-do-I-change-my-preferred-units-of-measure) - HIGH confidence (official help docs)
- [Fitbod: Unit of Measurement](https://fitbod.zendesk.com/hc/en-us/articles/23560953306263-Unit-of-Measurement) - HIGH confidence (official help docs)
- [Apple: Change Fitness Settings](https://support.apple.com/guide/iphone/change-fitness-settings-iph5f0e22170/ios) - HIGH confidence (official docs)
