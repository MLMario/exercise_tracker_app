# Testing Patterns

**Analysis Date:** 2026-01-17

## Test Framework

**Runner:**
- Not configured - No test framework installed

**Assertion Library:**
- Not configured

**Run Commands:**
```bash
# No test commands available
# Recommended setup would be:
# npm test                              # Run all tests
# npm test -- --watch                   # Watch mode
# npm run test:coverage                 # Coverage report
```

## Test File Organization

**Location:**
- No test files exist in the codebase
- Recommended: `*.test.ts` alongside source files (co-located)

**Naming:**
- Recommended: `[module-name].test.ts` for unit tests
- Recommended: `[feature].integration.test.ts` for integration tests

**Structure:**
```
# Recommended structure (not implemented):
packages/shared/
  src/
    services/
      auth.ts
      auth.test.ts        # Co-located tests
      templates.ts
      templates.test.ts
apps/web/
  src/
    components/
      ConfirmationModal.tsx
      ConfirmationModal.test.tsx
```

## Test Structure

**Suite Organization:**
- Not implemented

**Recommended Pattern:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ServiceName', () => {
  describe('functionName', () => {
    beforeEach(() => {
      // reset state
    });

    it('should handle success case', () => {
      // arrange
      // act
      // assert
    });

    it('should handle error case', () => {
      // test code
    });
  });
});
```

## Mocking

**Framework:**
- Not configured
- Recommended: Vitest built-in mocking (`vi`)

**What Should Be Mocked:**
- Supabase client calls
- localStorage operations
- Chart.js rendering

**What Should NOT Be Mocked:**
- Pure utility functions
- Type definitions
- Internal business logic

## Fixtures and Factories

**Test Data:**
- Not implemented
- Recommended: Factory functions for creating test entities

**Recommended Pattern:**
```typescript
function createTestExercise(overrides?: Partial<Exercise>): Exercise {
  return {
    id: 'test-id',
    name: 'Test Exercise',
    category: 'Chest',
    user_id: 'user-123',
    ...overrides
  };
}
```

## Coverage

**Requirements:**
- No coverage targets defined
- Recommended: 80% for services, 60% for UI components

**Configuration:**
- Not configured
- Recommended: Vitest coverage via c8

## Test Types

**Unit Tests:**
- Not implemented
- Priority areas: Services (`auth.ts`, `templates.ts`, `logging.ts`)

**Integration Tests:**
- Not implemented
- Priority: Auth flow, workout logging flow

**E2E Tests:**
- Not implemented
- Recommended: Playwright for critical user flows

## Common Patterns

**Async Testing:**
```typescript
// Recommended pattern
it('should handle async operation', async () => {
  const result = await service.someAsyncFunction();
  expect(result.data).toBeDefined();
  expect(result.error).toBeNull();
});
```

**Error Testing:**
```typescript
// Recommended pattern for service errors
it('should return error on invalid input', async () => {
  const result = await service.someFunction(invalidInput);
  expect(result.data).toBeNull();
  expect(result.error).toBeDefined();
});
```

**Snapshot Testing:**
- Not applicable (no configuration)

## Recommendations

**Immediate Priorities:**
1. Install Vitest (`pnpm add -D vitest`)
2. Configure `vitest.config.ts`
3. Add test scripts to `package.json`
4. Write tests for critical services:
   - `packages/shared/src/services/auth.ts`
   - `packages/shared/src/services/templates.ts`
   - `packages/shared/src/services/logging.ts`

**Testing Stack Suggestion:**
- Vitest - Test runner (integrates with Vite)
- @testing-library/preact - Component testing
- msw - API mocking
- c8 - Coverage reporting

**CI Integration:**
- Add GitHub Actions workflow for automated testing
- Run tests on pull requests
- Enforce coverage thresholds

---

*Testing analysis: 2026-01-17*
*Update when test patterns are established*
