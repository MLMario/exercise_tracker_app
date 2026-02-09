# Testing Patterns

**Analysis Date:** 2026-02-09

## Test Framework

**Runner:**
- Vitest 4.0.18 - installed via `apps/web/package.json`
- Config: `apps/web/vitest.config.ts`

**Assertion Library:**
- Built-in Vitest assertions: `expect()` API (compatible with Jest)

**Run Commands:**
```bash
npm run test              # Run tests in watch mode
npm run test:run          # Run tests once and exit
```

Both commands are defined in `apps/web/package.json`.

## Test File Organization

**Location:**
- Co-located with source code in `__tests__` directories
- Test files placed in same directory as components being tested

**Naming:**
- Suffix: `.test.ts` or `.test.tsx` (observed pattern)
- Example: `DashboardSurface.perf.test.tsx` tests `DashboardSurface.tsx`
- Performance tests use `.perf.test.tsx` suffix for clarity

**Structure:**
```
src/
├── components/
├── hooks/
├── surfaces/
│   ├── dashboard/
│   │   ├── DashboardSurface.tsx
│   │   └── __tests__/
│   │       ├── DashboardSurface.perf.test.tsx
│   │       └── SettingsPanel.perf.test.tsx
│   └── workout/
│       └── __tests__/
│           └── WorkoutSurface.perf.test.tsx
└── test-utils/
    └── performance.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/preact'
import { useState, useCallback } from 'preact/hooks'
import { createRenderSpy, type RenderSpy } from '@ironlift/shared/test-utils'

describe('Feature Name - Test Category', () => {
  let spy: RenderSpy

  beforeEach(() => {
    spy = createRenderSpy()
  })

  afterEach(() => {
    spy.reset()
  })

  it('should do something specific', () => {
    // Test implementation
  })
})
```

**Patterns:**
- Setup phase: `beforeEach` initializes test utilities (spies, mocks)
- Teardown phase: `afterEach` resets state for isolation
- Assertion phase: `expect()` verifies behavior

## Mocking

**Framework:** Vitest built-in with `vi` object

**Patterns:**
- Performance spies for tracking renders: `createRenderSpy()` from `@ironlift/shared/test-utils`
- Effect spies for tracking side effects: `createEffectSpy()` from `@ironlift/shared/test-utils`
- Component creation for baseline and optimized comparisons

Example from `DashboardSurface.perf.test.tsx`:
```typescript
const spy = createRenderSpy()
const { getByTestId } = render(<ModalTestHarness parentSpy={parentSpy} childSpy={childSpy} />)
parentSpy.reset()
await act(async () => {
  fireEvent.click(getByTestId('open-chart-modal'))
})
const parentRenders = parentSpy.getRenderCount()
```

**What to Mock:**
- Component render counts (via `createRenderSpy()`)
- Effect executions (via `createEffectSpy()`)
- User interactions (via `fireEvent`)
- Async operations (wrapped in `act()`)

**What NOT to Mock:**
- Component render logic itself - test real behavior
- State management - test actual state updates
- DOM queries - use `@testing-library/preact` to query real DOM

## Fixtures and Factories

**Test Data:**
- Component test harnesses created inline as test-specific components
- Example from `SettingsPanel.perf.test.tsx`:
  ```typescript
  function ChildWithEffectSync({ onCreatingChange, spy, effectSpy }: ChildProps) {
    spy.recordRender()
    const [isCreating, setIsCreating] = useState(false)
    useEffect(() => {
      effectSpy.recordEffect()
      onCreatingChange?.(isCreating)
    }, [isCreating, onCreatingChange])
    // ...
  }
  ```

**Location:**
- Fixtures defined in same test file near describe blocks
- Test components replicating production patterns for baseline/optimized comparison
- No separate fixtures directory - inline factories preferred

## Coverage

**Requirements:** Not enforced (no coverage config in `vitest.config.ts`)

**View Coverage:**
- Coverage measurement not configured - no command available
- Tests focus on specific performance characteristics rather than line coverage

## Test Types

**Unit Tests:**
- Scope: Individual functions and components in isolation
- Approach: Direct function calls with mocked dependencies
- Rare in this codebase - focus is on performance testing

**Integration Tests:**
- Scope: Component interaction with child components and state management
- Approach: Render test component harness, fire events, verify state changes
- Example: `DashboardSurface.perf.test.tsx` tests modal open/close with parent-child interaction

**Performance Tests:**
- Scope: Render counts and effect execution tracking
- Approach: Measure baseline behavior, then compare with optimized pattern
- Pattern: Two test suites in same file - baseline vs optimized
- Examples: `DashboardSurface.perf.test.tsx`, `SettingsPanel.perf.test.tsx`, `WorkoutSurface.perf.test.tsx`
- Focus on documenting actual behavior before optimization (baseline tests act as documentation)

## Common Patterns

**Async Testing:**
```typescript
await act(async () => {
  fireEvent.click(getByTestId('open-chart-modal'))
})

// Assertions after act() completes
expect(parentSpy.getRenderCount()).toBe(1)
```

Pattern: Wrap user interactions in `act()` to ensure state updates complete before assertions.

**Error Testing:**
- Error handling tested via `useAsyncOperation` hook tests
- Pattern: Execute operation with error path, verify error state captured
- Example from `performance.test.ts`:
  ```typescript
  it('handles async interactions', async () => {
    const spy = createRenderSpy()
    const metrics = await measureRenderCount({
      spy,
      interaction: async () => {
        await Promise.resolve()
        spy.recordRender()
      },
    })
    expect(metrics.renderCount).toBe(1)
  })
  ```

**Rendering Spy Utilities:**
- `createRenderSpy()`: Returns object with methods:
  - `recordRender()`: Called at start of component render
  - `getRenderCount()`: Returns total render count
  - `getMetrics()`: Returns render metrics (time, average, etc.)
  - `reset()`: Clears recorded renders between test phases

- `createEffectSpy()`: Returns object with methods:
  - `recordEffect()`: Called when effect runs
  - `getEffectCount()`: Returns total effect executions
  - `reset()`: Clears recorded effects

**Test Structure Example:**
From `DashboardSurface.perf.test.tsx` - baseline and optimized comparison:

1. Define baseline test component (current implementation)
2. Define baseline test suite with multiple scenarios
3. Define optimized test component (proposed implementation)
4. Define optimized test suite with identical scenarios
5. Include summary table comparing baseline vs optimized metrics
6. Include analysis section explaining benefits and tradeoffs

This pattern documents both current and proposed behavior simultaneously.

---

*Testing analysis: 2026-02-09*
