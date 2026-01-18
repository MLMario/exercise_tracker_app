# Coding Conventions

**Analysis Date:** 2026-01-17

## Naming Patterns

**Files:**
- PascalCase.tsx for React/Preact components (`ConfirmationModal.tsx`, `ChartCard.tsx`)
- camelCase.ts for services and utilities (`auth.ts`, `exercises.ts`, `supabase.ts`)
- index.ts for barrel exports
- kebab-case for directories (`template-editor/`, `workout/`)

**Functions:**
- camelCase for all functions (`checkForSavedWorkout`, `handleLogout`)
- `handle*` prefix for event handlers (`handleDeleteClick`, `handleStartWorkout`)
- `on*` prefix for callback props (`onDelete`, `onCancel`, `onConfirm`)
- Async functions: no special prefix

**Variables:**
- camelCase for variables (`user`, `currentSurface`, `activeWorkoutTemplate`)
- `is*` or `has*` prefix for booleans (`isLoading`, `isOpen`, `hasChartData`)
- UPPER_SNAKE_CASE for constants (not commonly used in codebase)

**Types:**
- PascalCase for interfaces and types (`Exercise`, `Template`, `WorkoutLog`)
- `[ComponentName]Props` for component props (`ConfirmationModalProps`, `ChartCardProps`)
- No `I` prefix for interfaces
- Type unions inline: `type AppSurface = 'auth' | 'dashboard' | 'templateEditor' | 'workout'`

## Code Style

**Formatting:**
- No Prettier configured - inferred from code
- 2 space indentation
- Single quotes for strings
- Semicolons always used
- 100-120 character line length (approximate)

**Linting:**
- No ESLint configured
- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)
- Run: Manual TypeScript compilation

## Import Organization

**Order:**
1. External packages (`preact`, `@supabase/supabase-js`)
2. Internal packages (`@ironlift/shared`)
3. Relative imports (`./components`, `../types`)
4. Type imports (`import type { ... }`)

**Grouping:**
- Blank line between groups
- No automatic sorting configured

**Path Aliases:**
- `@/` maps to `apps/web/src/` (configured in Vite)
- `@ironlift/shared` for shared package imports

## Error Handling

**Patterns:**
- Services return `{ data, error }` tuples (Supabase convention)
- Surfaces display errors in component state
- Console.error for unexpected failures

**Error Types:**
- Return error from services, don't throw
- `Error` objects with descriptive messages
- No custom error classes defined

## Logging

**Framework:**
- Console.log/error (no external logging library)
- Debug prefix pattern: `[DEBUG module.tsx]`

**Patterns:**
- Structured debug logs: `console.log('[DEBUG main.tsx] Auth event:', event)`
- Error logging: `console.error('Registration error:', err)`
- Warn for recoverable issues: `console.warn('Canvas ref not available')`

## Comments

**When to Comment:**
- Section dividers for organizing code
- JSDoc for service functions
- Explanation of complex logic (not always present)

**JSDoc/TSDoc:**
- Used for service functions with `@param` and `@returns`
- Example:
```typescript
/**
 * Register a new user with email and password.
 *
 * @param email - User's email address
 * @param password - User's password (min 6 characters)
 * @returns Promise resolving to the created user or error
 */
```

**Section Comments:**
- Format: `// ==================== SECTION NAME ====================`
- Used to organize large files

**TODO Comments:**
- Not commonly used in current codebase

## Function Design

**Size:**
- Large functions exist (surfaces are 500+ lines)
- No strict limit enforced

**Parameters:**
- Destructured props in component signatures
- Object parameters for complex functions

**Return Values:**
- Explicit returns preferred
- Services return `{ data, error }` consistently

## Module Design

**Exports:**
- Named exports preferred
- Barrel files (`index.ts`) for clean imports
- Services exported as object with methods

**Barrel Files:**
- `packages/shared/src/index.ts` - Main package export
- `packages/shared/src/services/index.ts` - Service exports
- `apps/web/src/components/index.ts` - Component exports
- `apps/web/src/surfaces/index.ts` - Surface exports

---

*Convention analysis: 2026-01-17*
*Update when patterns change*
