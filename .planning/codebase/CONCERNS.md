# Codebase Concerns

**Analysis Date:** 2026-02-09

## Tech Debt

### Effect-Based State Synchronization (High Priority)

**Issue:** Dual state + effect pattern in MyExercisesList creates unnecessary renders and re-renders

**Files:**
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` (lines 71-78)
- `apps/web/src/surfaces/dashboard/__tests__/SettingsPanel.perf.test.tsx` (lines 575-605)

**Impact:**
- Child component (MyExercisesList) has `isCreating` state and syncs it UP to parent (SettingsPanel) via effect
- Effect fires on every state change, triggering parent re-render cascade
- Child renders twice per action: once for local state, once for parent update
- Increases render count by 100% and effect count by 100% (baseline: 6 effects per 3 cycles, optimized: 0)

**Current Pattern:**
```typescript
// MyExercisesList has own state
const [isCreating, setIsCreating] = useState(false);

// Syncs to parent via effect (antipattern)
useEffect(() => {
  onCreatingChange?.(isCreating);
}, [isCreating, onCreatingChange]);
```

**Fix Approach:**
Lift `isCreating` state to parent (SettingsPanel) and pass as prop. Child should call callback in handlers, not via effect. Eliminates all effect-based sync, reduces child renders by 50%, removes state mismatch risk.

---

### Type Safety Issues with Unsafe Casts

**Issue:** Multiple `as unknown` and `@ts-ignore` directives suppress type errors instead of fixing them

**Files:**
- `packages/shared/src/services/logging.ts` (lines 213, 272, 275, 682, 690, 693, 783, 786)
- `packages/shared/src/services/templates.ts` (lines 175, 245)
- `packages/shared/src/services/exercises.ts` (line 292)
- `packages/shared/src/services/charts.ts` (line 92)

**Impact:**
- Supabase query results (`as unknown as SomeType`) mask type mismatches
- Nested object traversal (`log.workout_log_exercises as unknown as { count: number }[]`) is brittle
- If Supabase schema changes, these casts silently fail at runtime
- Reduces IDE autocomplete and error detection

**Example Problem:**
```typescript
// Current: Type mismatch masked by cast
const formattedData: WorkoutLogSummary[] = data.map((log) => ({
  exercise_count: (log.workout_log_exercises as unknown as { count: number }[])?.[0]?.count || 0,
}));

// Better: Proper type definition for Supabase response
interface WorkoutLogCountResponse {
  id: string;
  workout_log_exercises: Array<{ count: number }>;
}
```

**Fix Approach:**
Define explicit interfaces for raw Supabase responses. Use proper type narrowing with type guards instead of `as unknown` casts. Add runtime validation in service layer.

---

### Incomplete Error Handling in JSON Parsing

**Issue:** Silent failures when parsing localStorage backup data

**Files:**
- `apps/web/src/main.tsx` (line 74-76)
- `apps/web/src/surfaces/workout/WorkoutSurface.tsx` (line 297-299)

**Impact:**
- JSON parse errors are caught but only logged in one place, silently ignored in another
- Corrupted localStorage data is deleted without user notification
- User loses their saved workout session without explanation
- No telemetry or user feedback about data loss

**Current Pattern:**
```typescript
try {
  const backupData: WorkoutBackupData = JSON.parse(event.newValue);
  // ... process
} catch {
  // Ignore parse errors - silent failure
}
```

**Fix Approach:**
Add structured error handling:
1. Log parse errors with metadata (data size, timestamp)
2. Show user-friendly message: "Your saved workout was corrupted and couldn't be recovered"
3. Optionally implement data recovery (keep multiple backup versions)

---

## Performance Bottlenecks

### Chart Data Loading and Memory Management

**Issue:** All chart data loaded upfront without pagination or lazy loading

**Files:**
- `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` (lines 142-174)

**Impact:**
- If user has many charts (50+), all chart metrics calculated on initial load
- Sequential API calls for each chart (not parallelized early enough)
- Chart.js instances stored in memory for all charts, even those not visible
- Long initial dashboard load time

**Current Pattern:**
```typescript
const loadUserCharts = async (): Promise<void> => {
  const chartsData = data || [];
  const dataMap: Record<string, ChartData | null> = {};

  for (const chart of chartsData) {  // Sequential loop!
    const { data: metricsData } = await logging.getExerciseMetrics(...);
    dataMap[chart.id] = metricsData || null;
  }
  setChartDataMap(dataMap);
};
```

**Fix Approach:**
1. Load chart metadata only initially
2. Lazy load chart data on tab/section visibility
3. Use `Promise.all()` with batch loading (5 charts at a time)
4. Implement virtual scrolling for charts list
5. Clear off-screen chart instances to free memory

---

### LocalStorage Backup Saves on Every State Change

**Issue:** `activeWorkout` state change triggers localStorage write

**Files:**
- `apps/web/src/surfaces/workout/WorkoutSurface.tsx` (lines 274-278)

**Impact:**
- User typing weight/reps triggers state update → localStorage write
- ~10-20 writes per minute during active workout
- On slower devices, can cause frame drops or 100ms+ latency
- localStorage quota exhaustion risk with large workouts

**Current Pattern:**
```typescript
useEffect(() => {
  if (activeWorkout.started_at) {
    saveWorkoutRef.current(activeWorkout, originalTemplateSnapshot);
  }
}, [activeWorkout, originalTemplateSnapshot]);  // Fires on every change!
```

**Fix Approach:**
Debounce localStorage saves (500ms-1000ms). Only save when:
1. Set marked done (explicit user action)
2. Exercise removed (important state change)
3. On-screen idle timeout (safety backup)

---

### Unbounded Exercise History Queries

**Issue:** `getExerciseHistory()` fetches up to 365 workouts without pagination

**Files:**
- `packages/shared/src/services/logging.ts` (line 379)

**Impact:**
- User with 2+ years of logs fetches 365+ workout records
- Each record includes all sets, causing large data transfer
- In-memory array sort and processing on 365+ items
- Slow chart rendering for active users

**Fix Approach:**
1. Implement proper pagination (default limit 52, optional higher)
2. Sort on server-side if Supabase supports
3. Cache previous queries
4. Add data window limit (last 90 days by default)

---

## Fragile Areas

### Multiple Refs for State Access (Closure Problem)

**Issue:** Refs used to escape closure in auth listener

**Files:**
- `apps/web/src/main.tsx` (lines 121-133, 156, 160, 175)

**Impact:**
- `currentSurfaceRef` and `isPasswordRecoveryModeRef` must be manually kept in sync with state
- If developer forgets to update ref, auth listener uses stale values
- Order of state updates matters (ref updates via manual effect, not reactive)
- Difficult to trace which value is "current"

**Current Pattern:**
```typescript
const currentSurfaceRef = useRef(currentSurface);

useEffect(() => {
  currentSurfaceRef.current = currentSurface;
}, [currentSurface]);

// Later in auth listener
if (currentSurfaceRef.current === 'auth') {
  setCurrentSurface('dashboard');
}
```

**Safe Modification:**
- Use event handlers to capture state instead of refs (pass state to callback)
- Or use `useCallback` with dependency array to recreate listener when state changes
- Or restructure: Move auth listener setup into a separate effect that re-runs when state changes

---

### Large Components with Multiple Concerns

**Issue:** Components exceed 500+ lines with multiple responsibilities

**Files:**
- `apps/web/src/surfaces/workout/WorkoutSurface.tsx` (921 lines) - Timer management, set editing, template updates, localStorage sync, modal logic
- `apps/web/src/surfaces/dashboard/DashboardSurface.tsx` (571 lines) - Data loading, chart management, modal dialogs, template/workout actions
- `apps/web/src/surfaces/dashboard/MyExercisesList.tsx` (465 lines) - List rendering, edit forms, delete logic, create logic

**Impact:**
- Difficult to test individual features without triggering full component render
- Changes to one concern affect entire component (timer changes affect localStorage saving)
- Hard to reuse timer logic in other contexts
- Performance optimizations complex (many props to memoize)

**Fix Approach:**
Extract concerns into custom hooks:
- `useWorkoutTimer()` - separate timer state and logic
- `useWorkoutPersistence()` - localStorage sync and recovery
- `useChartData()` - chart loading and caching
- `useExerciseEditor()` - form state and validation

---

### No Rollback on Partial Failures

**Issue:** Template updates succeed but workout save fails (orphaned template)

**Files:**
- `apps/web/src/surfaces/workout/WorkoutSurface.tsx` (lines 519-576)

**Impact:**
- Template is updated but workout isn't saved
- User sees "Failed to save" but template is already changed
- Inconsistent state between template and workout history
- User confused about what succeeded

**Current Pattern:**
```typescript
const confirmTemplateUpdate = async (): Promise<void> => {
  try {
    const { error: updateError } = await templates.updateTemplate(...);
    if (updateError) throw new Error(...);
    // No fallback - if next step fails, template is orphaned
  } catch (err) {
    setError('Failed to update template: ' + err.message);
  }

  await saveWorkoutAndCleanup();  // Can fail independently
};
```

**Fix Approach:**
1. Use transactions if Supabase supports (single RPC call)
2. Save workout first, then template (reverse order to avoid orphans)
3. Show explicit message: "Template updated but workout failed to save - retrying..."
4. Implement retry with exponential backoff

---

## Security Considerations

### Insufficient Input Validation on Exercise Names

**Issue:** Exercise names validated only client-side with trim()

**Files:**
- `packages/shared/src/services/exercises.ts` (lines 116, 140, 215, 346)

**Impact:**
- Database validation happens server-side, but client duplicates validation
- Special characters not filtered (could affect display or CSS)
- Very long names (1000+ chars) not bounded client-side
- Relies on Supabase RLS for true protection (good) but false sense of validation

**Current Pattern:**
```typescript
const trimmedName = name.trim();  // Only trim, no length check
const { data, error } = await exercises.createExercise(name, category);
```

**Fix Approach:**
Add comprehensive validation:
```typescript
function validateExerciseName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Name required' };
  if (trimmed.length > 100) return { valid: false, error: 'Name too long (100 chars max)' };
  if (!/^[a-zA-Z0-9\s\-_(),/]+$/.test(trimmed)) {
    return { valid: false, error: 'Invalid characters' };
  }
  return { valid: true };
}
```

---

### Missing CSRF Protection for State-Changing Operations

**Issue:** No anti-CSRF tokens on mutations (template create/update/delete, workout save)

**Files:**
- All service files in `packages/shared/src/services/`

**Impact:**
- If user visits malicious site while logged in, site can trigger template deletion
- Supabase RLS prevents unauthorized access BUT doesn't prevent CSRF
- User's own credentials allow any state-changing operation

**Risk Level:** Medium (RLS provides some protection, but defense-in-depth needed)

**Fix Approach:**
1. Verify Supabase provides CSRF tokens (check docs)
2. If not available, implement request signing with user-specific nonce
3. Add `Sec-Fetch-Site` header validation on backend

---

## Test Coverage Gaps

### No Tests for Timer Expiration Edge Cases

**Issue:** Timer logic has no tests for boundary conditions

**Files:**
- `apps/web/src/surfaces/workout/WorkoutSurface.tsx` (lines 349-376)

**Impact:**
- Edge cases untested:
  - What if timer fires exactly at second boundary? (rounding?)
  - What if browser tab is hidden during timer? (can trigger "elapsed" check twice)
  - What if `timerIntervalRef` is cleared while callback pending?
- Notification permission check happens every 1000ms (no caching)

**Fix Approach:**
Add timer tests:
```typescript
it('should handle timer completion at exact second', () => { ... });
it('should not double-fire timer completion', () => { ... });
it('should cancel notification if permission revoked', () => { ... });
```

---

### Missing Error Path Tests for Service Failures

**Issue:** Services tested for happy path only

**Files:**
- `packages/shared/src/services/` - no error simulation tests

**Impact:**
- If Supabase is down, app behavior unknown
- Partially-failed multi-step operations not tested (template update succeeds, workout save fails)
- Network timeout handling untested

**Fix Approach:**
1. Mock Supabase client in tests to return errors
2. Test each error path explicitly
3. Add integration tests with real database error scenarios

---

## Missing Critical Features

### No Offline Support

**Issue:** App fully depends on network connectivity

**Files:** All service calls in `packages/shared/src/services/`

**Impact:**
- Workout can't be started if user loses connection mid-session
- Charts and templates fail to load with no fallback
- Saved workout in localStorage won't sync until network returns

**Partial Mitigation:** Workout saved to localStorage locally, but can't save to DB without network

**Fix Approach:**
1. Implement offline queue for mutations (save to localStorage, sync on reconnect)
2. Add "working offline" UI state
3. Cache frequently-accessed data (templates, recent exercises)
4. Use service worker for offline capability

---

### No Data Export/Import

**Issue:** User data locked in app, no backup format

**Files:** No export functionality exists

**Impact:**
- User can't migrate to competing app
- No data portability (violates some privacy regulations)
- If user loses account, loses all history

**Fix Approach:**
Add export endpoints (JSON/CSV):
1. Dashboard > Settings > "Export my data"
2. Generates JSON of all templates, workouts, exercises
3. Later: import from JSON file

---

## Dependencies at Risk

### Alpine.js Included but Unused

**Issue:** `alpinejs` dependency installed but no usage in TypeScript codebase

**Files:**
- `apps/web/package.json` (line 17)
- No imports in `apps/web/src/`

**Impact:**
- Dead dependency bloats bundle (~14KB gzipped)
- Adds unused library overhead
- Creates confusion about architecture (legacy Alpine.js code being migrated)

**Context:** Codebase appears to be migration from Alpine.js to Preact/TypeScript

**Fix Approach:**
Remove from dependencies if fully migrated:
```bash
npm remove alpinejs
```

---

### Preact Version Lock

**Issue:** Preact at `^10.28.2`, potential compatibility issues with ecosystem

**Files:**
- `apps/web/package.json` (line 19)

**Impact:**
- Preact 10.x has edge cases with hooks compared to React
- Some libraries may require React 16+
- Long-term maintenance risk if Preact 11 becomes necessary

**Not Critical:** Preact 10 stable and maintained

**Recommendation:** Monitor Preact releases, document decision to use Preact

---

## Database Schema Concerns

### No Migration Tracking System

**Issue:** Supabase migrations managed manually, no version control

**Files:** No migration files found

**Impact:**
- Hard to reproduce schema in staging/dev
- Database changes not tracked in git
- Rollback requires manual SQL

**Fix Approach:**
Implement Supabase migrations:
```bash
supabase db push  # Apply migrations
supabase db pull  # Track schema changes in git
```

---

## iOS Development Incomplete

**Issue:** iOS app folder exists but contains no implementation

**Files:**
- `apps/ios/package.json` (only lists dependencies, no source code)
- `apps/ios/src/` directory empty

**Impact:**
- Recent commit "Starting iOS Development" indicates active work
- No tests or CI/CD for iOS yet
- Shared package dependency exists but iOS client not implemented

**Note:** This is expected for work-in-progress, not a "concern" per se, but worth tracking

---

## Codebase Quality Summary

**Overall Assessment:** Well-structured TypeScript codebase with good type coverage, but several performance and architectural antipatterns that should be addressed before scaling to more users or features.

**Priority Fixes (in order):**
1. Effect-based state sync in MyExercisesList (100% render increase)
2. Type safety with Supabase response casts (reduces maintainability)
3. Debounce localStorage saves (user experience)
4. Extract large components into custom hooks (testability)
5. Add error handling and telemetry for silent failures

---

*Concerns audit: 2026-02-09*
