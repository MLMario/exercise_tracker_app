# Coding Conventions

**Analysis Date:** 2026-02-09

## Naming Patterns

**Files:**
- PascalCase for components: `ConfirmationModal.tsx`, `LoginForm.tsx`, `DashboardSurface.tsx`
- camelCase for hooks: `useAsyncOperation.ts`, `useClickOutside.ts`
- camelCase for utilities and non-component files: `performance.test.ts`
- Index files use barrel export pattern: `index.ts` with `export { ... }`

**Functions:**
- PascalCase for React/Preact components (functional components)
- camelCase for regular functions: `checkForSavedWorkout()`, `handleEmailChange()`, `closeDropdown()`
- Internal handler functions follow pattern: `handle*` or `on*`: `handleSubmit()`, `onConfirm()`, `onCancel()`

**Variables:**
- camelCase for all variable declarations: `searchQuery`, `isDropdownOpen`, `selectedCategory`, `newExerciseName`
- boolean variables prefixed with `is`, `has`, `can`, `show`: `isOpen`, `isLoading`, `showPassword`, `canDismiss`, `showNewExerciseForm`
- useState setters follow pattern: `set*`: `setEmail()`, `setPassword()`, `setIsLoading()`
- Private/internal variables no prefix: follows camelCase

**Types:**
- PascalCase for interfaces and types: `ConfirmationModalProps`, `LoginFormProps`, `ExercisePickerModalProps`, `SavedWorkoutData`
- Interface props always named with `Props` suffix: `ChildProps`, `ParentProps`, `OptimizedChildProps`
- Type enums use readonly const with `as const` assertion: `CATEGORY_OPTIONS`, `FILTER_CATEGORIES`

## Code Style

**Formatting:**
- No ESLint or Prettier config detected in repo root or `apps/web` - code follows manual style conventions
- Indentation: 2 spaces (observed in all source files)
- Line length: No strict limit observed, but typical is 80-100 characters
- Quote style: Single quotes for strings: `'test'`, `'email'`

**Linting:**
- No ESLint configuration found - conventions enforced by code review and TypeScript strict mode
- TypeScript strict mode enabled in `tsconfig.json` with `"strict": true`
- No null coalescing or optional chaining overrides

## Import Organization

**Order:**
1. Third-party libraries (Preact, hooks): `import { ... } from 'preact'`, `import { ... } from 'preact/hooks'`
2. Type imports: `import type { JSX, ComponentChildren } from 'preact'`
3. Project imports from shared packages: `import { ... } from '@ironlift/shared'`, `import { auth } from '@ironlift/shared'`
4. Local component/hook imports: `import { ... } from '@/components'`, `import { ... } from '@/hooks'`
5. Local relative imports: `import { LoginForm } from './LoginForm'`, `import { ConfirmationModal } from './ConfirmationModal'`

**Path Aliases:**
- `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.json`)
- Used for: `@/components`, `@/hooks`, `@/surfaces`
- Enables clean imports across the application without relative paths

## Error Handling

**Patterns:**
- Try-catch blocks for async operations and JSON parsing: `useAsyncOperation.ts` line 54-57
- Error objects destructured: `const errorMessage = err instanceof Error ? err.message : String(err)`
- Errors thrown with descriptive messages: `throw new Error('Failed to create exercise')`
- Silent catches used for non-critical failures: `} catch { ... }` in `ChartCard.tsx`, `main.tsx`
- Async operations wrap errors via `useAsyncOperation` hook which catches and stores them in state

**State Management:**
- Errors stored in component state via `useAsyncOperation`: `const { error, isLoading, ... } = useAsyncOperation()`
- Error messages displayed directly in UI: `{error && <div class="error-message">{error}</div>}`
- Errors cleared when operation succeeds: `setSuccess()` calls `setErrorState('')`

## Logging

**Framework:** console (built-in, no custom logging library)

**Patterns:**
- Console logs used in test files only: `console.log()` in `DashboardSurface.perf.test.tsx` and `SettingsPanel.perf.test.tsx`
- Production code has NO console logs - logging driven by tests
- Performance tests log metrics for analysis: `console.log(\`BASELINE - Open Chart Modal: Parent=\${parentRenders}...\`)`
- No error logging library - errors handled via try-catch and state management

## Comments

**When to Comment:**
- JSDoc comments for all exported functions and components
- Inline comments for complex logic (state sync patterns, event handling logic)
- Section comments for logical groupings: `// ==================== STATE ====================`
- Comments explain the "why" not the "what" - code should be self-documenting

**JSDoc/TSDoc:**
- Used extensively for components and functions
- Format: `/** ... */` block comments above declarations
- Document parameters with `@param` and return values with `@returns`
- Describe purpose of component in opening sentence
- Example from `ConfirmationModal.tsx`:
  ```typescript
  /**
   * ConfirmationModal Component
   *
   * A reusable confirmation dialog component for workout actions.
   * Used for finish workout, cancel workout, and template update confirmations.
   */
  ```

## Function Design

**Size:**
- Most functions 20-50 lines (observed in `LoginForm.tsx`, `ConfirmationModal.tsx`)
- Larger surfaces ~500-900 lines with clear section comments: `DashboardSurface.tsx` (571 lines), `WorkoutSurface.tsx` (921 lines)
- No strict function size limit enforced

**Parameters:**
- Props always destructured in function signature
- No positional parameters beyond props: `function LoginForm({ email, setEmail, ... })`
- Optional props use `?:` syntax: `dismissOnOverlayClick?: boolean`
- Callback props passed as handler names: `onConfirm()`, `onCancel()`, `onSelect()`

**Return Values:**
- Components return `JSX.Element | null` explicitly typed
- Conditional early returns: `if (!isOpen) { return null; }` (ConfirmationModal, InfoModal pattern)
- Hooks return typed objects with multiple properties: `useAsyncOperation` returns `{ error, successMessage, isLoading, setError, ... }`
- No implicit undefined returns

## Module Design

**Exports:**
- Named exports for all components: `export function ConfirmationModal(...)`
- Default exports also provided for convenience: `export default ConfirmationModal`
- Type exports separate: `export interface ConfirmationModalProps { ... }` then `export type { ConfirmationModalProps }`
- Barrel files group exports from directory: `components/index.ts` re-exports all components

**Barrel Files:**
- Used for organization: `src/components/index.ts`, `src/hooks/index.ts`, `src/surfaces/index.ts`
- Pattern: named export (function/interface) followed by type export
- Example from `components/index.ts`:
  ```typescript
  export { ExercisePickerModal } from './ExercisePickerModal';
  export type { ExercisePickerModalProps } from './ExercisePickerModal';
  ```
- Enables clean imports: `import { ConfirmationModal } from '@/components'` instead of full path

---

*Convention analysis: 2026-02-09*
