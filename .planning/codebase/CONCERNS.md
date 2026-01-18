# Codebase Concerns

**Analysis Date:** 2026-01-17

## Tech Debt

**Massive Surface Components:**
- Issue: Surface components are extremely large (500-966 lines)
- Files:
  - `apps/web/src/surfaces/workout/WorkoutSurface.tsx` (966 lines)
  - `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` (572 lines)
  - `apps/web/src/surfaces/template-editor/TemplateEditorSurface.tsx` (514 lines)
  - `apps/web/src/surfaces/auth/AuthSurface.tsx` (504 lines)
  - `apps/web/src/main.tsx` (354 lines)
- Why: Rapid feature development, surfaces grew organically
- Impact: Difficult to test, maintain, and debug; high cognitive load
- Fix approach: Extract sub-components, custom hooks, and split state management

**Duplicate State Management Patterns:**
- Issue: Same useState pattern repeated across 5+ files
- Files: `WorkoutSurface.tsx`, `TemplateEditorSurface.tsx`, `AuthSurface.tsx`, `DashboardSurface.tsx`, `ExercisePickerModal.tsx`
- Pattern: `const [error, setError] = useState(''); const [isLoading, setIsLoading] = useState(false);`
- Why: No shared hooks or state management abstraction
- Impact: Code duplication, inconsistent error/loading handling
- Fix approach: Create custom hooks (`useFormState`, `useAsyncOperation`)

**Duplicate State Management Patterns:**
- Issue: Same useState pattern repeated across 5+ files
- Files: `WorkoutSurface.tsx`, `TemplateEditorSurface.tsx`, `AuthSurface.tsx`, `DashboardSurface.tsx`, `ExercisePickerModal.tsx`
- Pattern: `const [error, setError] = useState(''); const [isLoading, setIsLoading] = useState(false);`
- Why: No shared hooks or state management abstraction
- Impact: Code duplication, inconsistent error/loading handling
- Fix approach: Create custom hooks (`useFormState`, `useAsyncOperation`)

**Excessive Debug Logging:**
- Issue: 30+ DEBUG console.log statements throughout codebase
- Files:
  - `apps/web/src/main.tsx` (12+ statements)
  - `apps/web/src/surfaces/auth/AuthSurface.tsx` (7+ statements)
  - `apps/web/src/surfaces/dashboard/ChartCard.tsx` (10+ statements)
- Why: Development debugging left in code
- Impact: Performance overhead, information leakage in production
- Fix approach: Remove or conditionally compile out debug logs

## Known Bugs

**Unhandled Promise in WorkoutSurface:**
- Symptoms: Potential race condition when declining template update
- Trigger: User declines template update during workout finish
- File: `apps/web/src/surfaces/workout/WorkoutSurface.tsx` line 637
- Code: `saveWorkoutAndCleanup()` called without `await` in `declineTemplateUpdate()`
- Workaround: Usually works because async operation completes
- Root cause: Missing await on async function call
- Fix: Add `await` to `saveWorkoutAndCleanup()` call

## Security Considerations

**Environment Variables in Version Control:**
- Risk: `.env` file may be tracked with Supabase credentials
- Current mitigation: `.env.example` exists for template
- File: `.env` (should be in `.gitignore`)
- Recommendations:
  - Verify `.env` is in `.gitignore`
  - Rotate credentials if previously exposed
  - Use Vercel environment variables for production

**No Input Validation on Exercise Names:**
- Risk: Users can create exercises with empty or malicious names
- File: `apps/web/src/components/ExercisePickerModal.tsx`
- Current mitigation: None
- Recommendations: Add validation for name length and characters

## Performance Bottlenecks

**Chart Rendering Memory:**
- Problem: Chart.js instances may not be properly cleaned up
- File: `apps/web/src/surfaces/dashboard/ChartCard.tsx`
- Measurement: Not measured, potential leak on rapid re-renders
- Cause: Chart instances stored in ref, cleanup in useEffect may miss edge cases
- Improvement path: Verify cleanup on unmount, add chart instance tracking

**Sequential Data Loading:**
- Problem: Dashboard loads templates, exercises, and charts sequentially
- File: `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` (lines 219-223)
- Measurement: Not measured, perceived slow initial load
- Cause: `Promise.all()` used but individual chart metrics may load per-chart
- Improvement path: Batch chart metrics loading, add loading skeleton

## Fragile Areas

**Template Change Detection:**
- File: `apps/web/src/surfaces/workout/WorkoutSurface.tsx` (lines 471-507)
- Why fragile: Complex nested comparison with multiple early returns
- Common failures: May miss edge cases in exercise/set comparisons
- Safe modification: Add comprehensive unit tests before changing
- Test coverage: No tests exist

**Swipe Gesture Handling:**
- File: `apps/web/src/surfaces/workout/SetRow.tsx`
- Why fragile: Complex pointer/touch event state machine (321 lines)
- Common failures: Edge cases with multiple touch points, rapid swipes
- Safe modification: Extract to custom hook, add gesture library
- Test coverage: No tests exist

**Auth Surface State Machine:**
- File: `apps/web/src/surfaces/auth/AuthSurface.tsx`
- Why fragile: 13+ useState hooks managing 5 different auth flows
- Common failures: State transitions between login/register/reset/update
- Safe modification: Use state machine pattern (XState) or reducer
- Test coverage: No tests exist

## Scaling Limits

**Supabase Free Tier:**
- Current capacity: 500MB database, 1GB file storage
- Limit: Unknown user count before hitting limits
- Symptoms at limit: 429 rate limit errors, DB writes fail
- Scaling path: Upgrade to Supabase Pro plan

## Dependencies at Risk

**No Major Concerns Detected:**
- All dependencies are relatively recent versions
- chart.js, preact, supabase-js actively maintained

**Recommendation:**
- Run `pnpm audit` periodically to check for vulnerabilities

## Missing Critical Features

**No Test Coverage:**
- Problem: Zero automated tests in the codebase
- Current workaround: Manual testing only
- Blocks: Confident refactoring, CI/CD pipeline
- Implementation complexity: Medium (need to set up Vitest, write tests)

**No Linting/Formatting:**
- Problem: No ESLint or Prettier configured
- Current workaround: Manual code review
- Blocks: Consistent code style across contributors
- Implementation complexity: Low (add configs, run once)

**No Error Boundary:**
- Problem: No React error boundary to catch rendering errors
- Current workaround: None (white screen on error)
- Blocks: Graceful error recovery for users
- Implementation complexity: Low (add ErrorBoundary component)

## Test Coverage Gaps

**All Services Untested:**
- What's not tested: `auth.ts`, `exercises.ts`, `templates.ts`, `logging.ts`, `charts.ts`
- Risk: Business logic bugs go undetected
- Priority: High
- Difficulty to test: Low (pure functions with Supabase mocking)

**All UI Components Untested:**
- What's not tested: All surfaces and components
- Risk: UI regressions, broken user flows
- Priority: Medium
- Difficulty to test: Medium (need Preact Testing Library setup)

**Template Change Detection Untested:**
- What's not tested: `hasTemplateChanges()` in WorkoutSurface
- Risk: Complex comparison logic may have edge case bugs
- Priority: High (affects workout completion flow)
- Difficulty to test: Low (extract function, unit test)

---

*Concerns audit: 2026-01-17*
*Update as issues are fixed or new ones discovered*
