# Framework Evaluation: Exercise Tracker Refactor

## Current Alpine.js Analysis

### Reactive State Inventory

**Total reactive properties: 46**

| Surface | Properties | Count |
|---------|-----------|-------|
| Auth | user, isLoading, currentSurface, authSurface, authEmail, authPassword, authLoading, authConfirmPassword, showLoginPassword, showRegisterPassword, showConfirmPassword, showUpdatePassword, showUpdateConfirmPassword, resetEmailSent, passwordUpdateSuccess, isPasswordRecoveryMode | 16 |
| Dashboard | templates, userCharts, chartInstances, chartsNeedRefresh, availableExercises | 5 |
| Template Editor | editingTemplate (object), showExercisePicker, exercisePickerContext, exerciseSearchQuery, showNewExerciseForm, newExerciseName, newExerciseCategory | 7 |
| Workout | activeWorkout (object), originalTemplateSnapshot, showTemplateUpdateModal, pendingWorkoutData, showFinishWorkoutModal, showCancelWorkoutModal, showDeleteChartModal, pendingDeleteChartId | 8 |
| Timer | timerActive, timerPaused, timerSeconds, timerTotalSeconds, activeTimerExerciseIndex | 5 |
| Chart Modal | showAddChartModal, newChart (object) | 2 |
| Messages | error, successMessage | 2 |
| Internal | timerInterval (non-reactive, interval ID) | 1 |

**Nested object structures:**
- `editingTemplate`: `{ id, name, exercises[] }` - exercises have nested sets
- `activeWorkout`: `{ template_id, template_name, started_at, exercises[] }` - exercises have nested sets with `is_done`
- `newChart`: `{ exercise_id, metric_type, x_axis_mode }`
- `chartInstances`: Dictionary of Chart.js instances (keyed by chart ID)

### Template Directive Usage

| Directive | Count | Usage Pattern |
|-----------|-------|---------------|
| `x-data` | 1 | Single app-wide component |
| `x-init` | 1 | Calls `init()` for session check |
| `x-show` | 42 | Surface switching, modals, conditional UI |
| `x-if` / `template x-if` | 11 | Login/register footers, password success state |
| `x-for` | 11 | Templates, charts, exercises, sets loops |
| `x-text` | 27 | Dynamic text display |
| `x-model` | 26 | Form inputs (email, password, weights, reps) |
| `@click` | 54 | Button handlers, navigation |
| `@submit.prevent` | 5 | Form submissions |
| `:class` | 22 | Conditional styling (active tabs, done sets) |
| `:disabled` | 8 | Button disabled states |
| `:type` | 5 | Password visibility toggle |
| `:style` | 2 | Timer progress bar width |
| `:id` | 1 | Dynamic canvas IDs for charts |
| `:value` | 2 | Select option values |
| `@pointerdown/move/up` | 6 | Swipe gesture handling |
| `@touchstart/move/end` | 3 | Touch fallback for swipe |
| `@click.stop` | 1 | Stop propagation for swipe wrappers |
| `@click.self` | 5 | Modal overlay dismiss |
| `@click.prevent` | 4 | Prevent default on links |

**Total Alpine directives in HTML: ~165**

### Alpine-Specific Features Used

| Feature | Location | Complexity |
|---------|----------|------------|
| `Alpine.data()` registration | js/app.js:2 | Standard |
| `init()` lifecycle method | js/app.js:91-158 | Auth state, storage listeners |
| `$nextTick` | js/app.js:387 | Wait for DOM before chart render |
| `$watch` deep | js/app.js:1380-1382 | Auto-save workout on any change |
| Computed getter `filteredExercises` | js/app.js:559-568 | Exercise search filter |
| Reactive nested objects | Throughout | Deep reactivity for exercises/sets |

**NOT used:**
- `x-cloak` (no FOUC handling)
- `x-transition` (no Alpine transitions)
- `$refs` (using document.getElementById instead)
- `Alpine.store()` (all state in single component)

### Migration Complexity Areas

#### 1. Multi-Tab Sync (High Complexity)
**Location:** js/app.js:1385-1419

```javascript
window.addEventListener('storage', (event) => {
  // Syncs activeWorkout across browser tabs
  // Handles workout cleared vs updated scenarios
});
```

**Challenges:**
- Must preserve localStorage-based sync
- State updates from external events
- Race condition handling between tabs

#### 2. Chart.js Integration (Medium Complexity)
**Location:** js/app.js:394-439

```javascript
chartInstances: {}, // Store instances for cleanup
async renderAllCharts() { /* ... */ }
destroyAllCharts() { /* ... */ }
```

**Challenges:**
- Chart instances stored outside reactive state
- Manual DOM access via `document.getElementById`
- Lifecycle cleanup on surface change

#### 3. Workout State Backup/Restore (Medium Complexity)
**Location:** js/app.js:1294-1376

**Features:**
- User-scoped storage keys
- Deep clone for change detection
- Validation on restore
- Template existence check

**Challenges:**
- Deep watching of workout object
- Serialize/deserialize complex nested state

#### 4. Timer State Management (Medium Complexity)
**Location:** js/app.js:1089-1182

**Features:**
- Per-exercise timer tracking
- Pause/resume functionality
- Browser notifications
- Progress percentage calculation

**Challenges:**
- Interval management outside reactive system
- Coordinated state updates (timerSeconds + timerActive)

#### 5. Swipe-to-Delete Gestures (High Complexity)
**Location:** js/app.js:774-896

**Features:**
- Pointer and touch event handling
- Transform-based animation
- Threshold detection
- State cleanup after delete

**Challenges:**
- Direct DOM manipulation for performance
- Pointer capture API usage
- Complex event coordination

### Code Statistics

| Metric | Value |
|--------|-------|
| Total lines in app.js | 1,422 |
| Methods in fitnessApp | 55 |
| Async methods | 20 |
| Event handlers | 12 |
| Lines of HTML | 927 |
| Surfaces | 4 (auth, dashboard, workout, templateEditor) |
| Modals | 5 (exercisePicker, addChart, templateUpdate, finishWorkout, cancelWorkout, deleteChart) |

### Current Architecture Pattern

```
index.html
  └── x-data="fitnessApp" (single monolithic component)
      ├── State: 46 reactive properties
      ├── Methods: 55 functions
      └── Template: 165+ Alpine directives

js/app.js
  └── Alpine.data('fitnessApp', () => ({ ... }))
      └── All UI logic in one 1422-line object

js/*.js (service modules)
  └── window.auth, window.templates, window.exercises, etc.
      └── Pure service functions, no UI coupling
```

**Key observation:** The service layer (auth, templates, exercises, logging, charts) is already well-separated. The migration challenge is purely the UI layer - the 1422-line monolith in app.js.

---

## Framework Comparison

| Criterion | Weight | Alpine.js (Keep) | Vue 3 | Preact | Solid.js |
|-----------|--------|------------------|-------|--------|----------|
| **Migration effort** | High | None | Medium-High | High | Medium |
| **Bundle size (gzip)** | Medium | 15KB (CDN) | 33KB | 4KB | 7KB |
| **TypeScript support** | High | Limited | Excellent | Good | Excellent |
| **Vite integration** | High | Manual | Native (@vitejs/plugin-vue) | Native (@preact/preset-vite) | Native (vite-plugin-solid) |
| **Learning curve** | Low | None | Medium | Medium (if no React exp) | Medium |
| **Ecosystem** | Medium | Small | Large | Large (React compat) | Growing |
| **Surface architecture fit** | High | Poor (monolith) | Excellent (SFC) | Good (components) | Good (components) |
| **Reactivity model** | - | Proxy-based | Proxy-based | Virtual DOM | Fine-grained signals |

### Candidate Analysis

#### Option 1: Keep Alpine.js

**Pros:**
- Zero migration cost
- Familiar patterns
- Proven working implementation
- CDN-based (no build required for Alpine)

**Cons:**
- Limited TypeScript support (no official types, community @types/alpinejs exists but incomplete)
- Encourages monolithic components (current 1422-line file)
- No component model - all in one x-data
- Harder to test in isolation
- No tree-shaking (full library loaded)

**TypeScript integration:**
- Would require manual type annotations
- x-data object would need `as const` assertions
- Template directives have no type checking

#### Option 2: Vue 3 + Composition API

**Pros:**
- First-class TypeScript support (Vue 3 written in TypeScript)
- Single File Components (SFC) for clean surface separation
- Reactivity system similar to Alpine (Proxy-based)
- `ref()` and `reactive()` translate naturally from Alpine state
- Excellent Vite integration (officially maintained)
- Large ecosystem (Vue Router, Pinia for state if needed)
- Good dev tools

**Cons:**
- Full rewrite required (can't incrementally migrate)
- Larger bundle than Alpine (33KB vs 15KB gzip)
- Template syntax differences (v-show vs x-show, v-for vs x-for)
- Learning curve for Composition API patterns

**Migration path:**
- `x-show` → `v-show`
- `x-for` → `v-for`
- `@click` → `@click`
- `x-model` → `v-model`
- Alpine reactive object → Vue `reactive()` or `ref()`
- `init()` → `onMounted()`
- `$watch` → `watch()`
- `$nextTick` → `nextTick()`

#### Option 3: Preact

**Pros:**
- Tiny bundle (4KB gzip, smallest option)
- React ecosystem compatible (most React libraries work)
- Good TypeScript support via JSX
- Hooks for state management (`useState`, `useEffect`)
- Vite preset available

**Cons:**
- JSX is completely different from Alpine template syntax
- Mental model shift (declarative templates → JSX)
- Need to learn hooks if no React experience
- Two-way binding requires manual handling (no v-model equivalent)
- Would require complete rewrite

**Migration path:**
- Alpine template directives → JSX
- `x-show` → conditional rendering `{show && <div>}`
- `x-for` → `.map()`
- `x-model` → controlled inputs with `useState`
- All reactive state → `useState` or `useReducer`

#### Option 4: Solid.js

**Pros:**
- Fine-grained reactivity (most similar to Alpine's model)
- Tiny bundle (7KB gzip)
- Excellent TypeScript support
- Signals are conceptually similar to Alpine's reactive properties
- Best runtime performance of all options
- JSX with true reactivity (no virtual DOM diffing)

**Cons:**
- Smaller ecosystem than Vue/React
- Less community resources for troubleshooting
- JSX syntax (though with reactive primitives)
- Requires understanding signals vs state

**Migration path:**
- Alpine reactive properties → Solid signals (`createSignal`)
- Nested objects → `createStore`
- `$watch` → `createEffect`
- Template syntax → JSX (but reactive expressions work naturally)

### Bundle Size Comparison

| Framework | Production (gzip) | With routing |
|-----------|-------------------|--------------|
| Alpine.js | ~15KB | N/A (uses custom) |
| Vue 3 | ~33KB | +10KB (vue-router) |
| Preact | ~4KB | +3KB (preact-router) |
| Solid.js | ~7KB | +3KB (solid-router) |

*Current app doesn't use client-side routing - all surfaces in single page.*

### TypeScript Integration Quality

| Framework | Types | Template Type Checking | IDE Support |
|-----------|-------|------------------------|-------------|
| Alpine.js | @types/alpinejs (partial) | None | Limited |
| Vue 3 | Built-in | Yes (Volar) | Excellent |
| Preact | Built-in (JSX) | Yes (TSX) | Excellent |
| Solid.js | Built-in | Yes (TSX) | Excellent |

---

## Migration Analysis

### Top Candidates: Vue 3 and Solid.js

Based on the comparison, the top two candidates are:
1. **Vue 3** - Best ecosystem, similar template syntax, excellent TypeScript
2. **Solid.js** - Best reactivity fit, smallest bundle with good TypeScript

### Per-Surface Migration Complexity

#### Auth Surface

| Framework | Complexity | Notes |
|-----------|------------|-------|
| Vue 3 | **Low** | Direct template translation, v-model for forms |
| Solid.js | **Low** | Signals for form state, JSX for templates |

**Current patterns:**
- 16 reactive properties (form fields, visibility toggles)
- Form validation (`validatePasswords()`)
- Auth state listener (`onAuthStateChange`)
- Surface switching (`switchAuthSurface`)

**Migration notes:**
- Both frameworks handle forms easily
- Auth state listener → `onMounted` (Vue) / `onMount` (Solid)
- Password recovery mode flag → signal/ref

#### Dashboard Surface

| Framework | Complexity | Notes |
|-----------|------------|-------|
| Vue 3 | **Medium** | Chart.js integration needs care |
| Solid.js | **Medium** | Chart.js integration, effect cleanup |

**Current patterns:**
- Template list rendering
- Chart.js instance management
- `chartsNeedRefresh` flag for conditional reload

**Migration notes:**
- Chart.js integration requires lifecycle handling
- Both: use `onMounted`/`onMount` for initial render
- Both: cleanup in `onUnmounted`/`onCleanup`

#### Workout Surface

| Framework | Complexity | Notes |
|-----------|------------|-------|
| Vue 3 | **High** | Swipe gestures, timer, deep watching |
| Solid.js | **High** | Swipe gestures, timer, store for nested state |

**Current patterns:**
- Deep nested state (`activeWorkout.exercises[].sets[]`)
- Swipe-to-delete with pointer events
- Timer with interval management
- LocalStorage backup with `$watch` deep

**Migration notes:**
- **Vue 3:** `reactive()` for activeWorkout, `watch(activeWorkout, ..., { deep: true })`
- **Solid.js:** `createStore()` for nested state, `createEffect()` for auto-save
- Swipe gestures: Similar in both (DOM refs + pointer events)
- Timer: `setInterval` management similar in both

#### Template Editor Surface

| Framework | Complexity | Notes |
|-----------|------------|-------|
| Vue 3 | **Medium** | Array manipulation, nested forms |
| Solid.js | **Medium** | Store mutations, nested forms |

**Current patterns:**
- Editing nested template structure
- Add/remove/reorder exercises
- Add/remove sets per exercise

**Migration notes:**
- Array mutation patterns differ slightly
- Vue: direct mutation works with reactive arrays
- Solid: use `produce()` from solid-js/store

### What Needs Complete Rewrite vs Adaptation

| Component | Vue 3 | Solid.js |
|-----------|-------|----------|
| State declarations | Adapt (reactive/ref) | Adapt (signals/store) |
| Template syntax | Adapt (v-* directives) | Rewrite (JSX) |
| Event handlers | Keep (nearly identical) | Adapt (JSX syntax) |
| Computed properties | Adapt (computed()) | Adapt (derived signals) |
| Watchers | Adapt (watch()) | Adapt (createEffect) |
| Lifecycle hooks | Adapt (onMounted, etc.) | Adapt (onMount, etc.) |
| Service calls | Keep (unchanged) | Keep (unchanged) |

### Risk Assessment

#### Vue 3 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bundle size increase | Certain | Low | Accept 18KB increase |
| Learning curve | Medium | Medium | Good docs, tutorials |
| Breaking changes in Vue 4 | Low | Medium | Vue 3 is LTS |
| Template debugging harder | Medium | Low | Vue DevTools |

#### Solid.js Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Smaller ecosystem | Certain | Medium | Most needs covered |
| Fewer tutorials | Medium | Medium | Good official docs |
| Team unfamiliarity | Medium | Medium | Solo dev, can learn |
| Breaking changes | Medium | Medium | Young framework |

---

## Recommendation

### Recommended: Vue 3 + Composition API

**Key reasons:**

1. **Template syntax familiarity** - Vue's template directives (`v-show`, `v-for`, `v-model`, `@click`) are nearly identical to Alpine's (`x-show`, `x-for`, `x-model`, `@click`). This significantly reduces cognitive load during migration.

2. **Excellent TypeScript support** - Vue 3 was written in TypeScript and has first-class support. With Volar extension, templates get full type checking. This aligns with the project's TypeScript migration goal.

3. **Single File Components (SFC)** - Perfect for surface-based architecture. Each surface becomes its own `.vue` file with scoped styles, template, and script. This naturally breaks up the 1422-line monolith.

4. **Proven ecosystem** - Large community, extensive documentation, Vue DevTools for debugging, and battle-tested in production.

### Migration Approach: Incremental Rewrite

**Phase 1: Setup Vue alongside Alpine**
- Install Vue 3 + Vite plugin
- Create Vue app mount point
- Keep Alpine running for existing surfaces

**Phase 2: Migrate surface by surface**
- Start with simplest surface (Auth)
- Move to Dashboard, Template Editor
- End with Workout (most complex)

**Phase 3: Remove Alpine**
- Delete Alpine code after all surfaces migrated
- Remove CDN script tag
- Clean up global window.* service references (move to imports)

### Risks to Monitor

1. **Chart.js lifecycle** - Ensure proper cleanup when switching between surfaces
2. **Multi-tab sync** - Test thoroughly after migration
3. **Swipe gestures** - May need custom directive or composable
4. **Bundle size** - Monitor production build size (target: under 100KB total)

### Alternative: Solid.js

If bundle size is critical priority or Vue 3 proves problematic:
- Solid.js offers similar fine-grained reactivity
- Smaller bundle (7KB vs 33KB)
- Trade-off: JSX rewrite required, smaller ecosystem

---

## Decision

**Selected: Preact**

**Date:** 2026-01-12

**Rationale:**
- User prioritized scalability and efficient feature development over migration ease
- React ecosystem provides the largest library of pre-built components
- Preact chosen over full React for bundle size (4KB vs 40KB gzip)
- API-compatible with React - can swap to full React if needed later
- JSX rewrite required but acceptable trade-off for ecosystem access

**Migration approach:** Full rewrite, surface by surface
- Start with Auth surface (simplest)
- Progress through Dashboard, Template Editor
- End with Workout (most complex - timer, swipe gestures)

**Risks to monitor:**
- JSX learning curve (different from Alpine templates)
- Two-way binding requires manual handling (controlled inputs)
- Swipe gestures may need custom hooks
- Chart.js lifecycle management in functional components
