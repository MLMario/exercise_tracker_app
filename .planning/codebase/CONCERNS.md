# Codebase Concerns

**Analysis Date:** 2026-01-12

## Tech Debt

**Large monolithic Alpine component:**
- Issue: Main `fitnessApp` component in `js/app.js` is 1400+ lines
- Files: `js/app.js`
- Why: All features added incrementally to single component
- Impact: Harder to maintain, understand, and test
- Fix approach: Extract surface-specific logic into separate modules

**No TypeScript:**
- Issue: Plain JavaScript with JSDoc comments instead of TypeScript
- Files: All `js/*.js` files
- Why: Kept simple for zero-build-step approach
- Impact: No compile-time type checking, harder refactoring
- Fix approach: Could add TypeScript with tsc for type checking only (no build)

## Known Bugs

**None documented:**
- No TODO/FIXME comments found in codebase
- Auth flow has debug logging for troubleshooting

## Security Considerations

**Supabase anon key exposed:**
- Risk: Anon key visible in `js/config.local.js` (though safe by design)
- File: `js/config.local.js`
- Current mitigation: File is gitignored, anon key designed to be public, RLS policies protect data
- Recommendations: Document that this is intentional (anon key + RLS is the security model)

**Client-side auth checks:**
- Risk: Auth state checked client-side only before API calls
- Files: All service modules check `supabaseClient.auth.getUser()`
- Current mitigation: RLS policies on Supabase enforce server-side auth
- Recommendations: Ensure all tables have proper RLS policies

**No input sanitization library:**
- Risk: XSS potential if user input rendered without escaping
- Files: `js/app.js` (Alpine templates)
- Current mitigation: Alpine.js escapes content by default with `x-text`
- Recommendations: Verify no `x-html` or `innerHTML` usage with user data

## Performance Bottlenecks

**Chart rendering on every dashboard load:**
- Problem: All charts re-rendered when returning to dashboard
- File: `js/app.js` (`loadDashboard`, `renderAllCharts`)
- Measurement: Not profiled
- Cause: Charts destroyed and recreated; `chartsNeedRefresh` flag helps but all charts still re-render
- Improvement path: Only re-render charts whose data changed

**No data pagination:**
- Problem: All templates, exercises, charts loaded at once
- Files: `js/templates.js`, `js/exercises.js`, `js/charts.js`
- Measurement: Not profiled
- Cause: Simple implementation without pagination
- Improvement path: Add pagination for users with many records (likely not needed at current scale)

## Fragile Areas

**Script loading order:**
- File: `index.html`
- Why fragile: Scripts must load in exact order (config before supabase, modules before app)
- Common failures: If order changes, undefined reference errors
- Safe modification: Keep dependency order, add comments explaining why
- Test coverage: None

**Workout state backup/restore:**
- Files: `js/app.js` (`saveWorkoutToStorage`, `restoreWorkoutFromStorage`)
- Why fragile: Complex JSON serialization, multi-tab sync, template deletion handling
- Common failures: Corrupted localStorage, template deleted while workout active
- Safe modification: Test backup/restore manually after changes
- Test coverage: None

## Scaling Limits

**Supabase Free Tier:**
- Current capacity: 500MB database, 1GB file storage, 50k monthly active users
- Limit: Sufficient for personal/small user base
- Symptoms at limit: API throttling, storage errors
- Scaling path: Upgrade to Supabase Pro

**LocalStorage backup:**
- Current capacity: ~5MB per origin
- Limit: Large workouts could approach limit
- Symptoms at limit: QuotaExceededError
- Scaling path: Compress data or use IndexedDB

## Dependencies at Risk

**Alpine.js CDN:**
- Risk: CDN dependency, version pinned to 3.x.x (auto-updates)
- Impact: Breaking changes could occur on CDN update
- Migration plan: Pin to exact version or self-host

**Chart.js CDN:**
- Risk: Same as Alpine.js
- Impact: Chart rendering could break
- Migration plan: Pin to exact version

**Supabase JS SDK CDN:**
- Risk: Pinned to @2 (major version), minor updates automatic
- Impact: Generally stable, Supabase maintains backwards compatibility
- Migration plan: Monitor for deprecation notices

## Missing Critical Features

**No offline support:**
- Problem: App requires internet connection
- Current workaround: LocalStorage backup prevents data loss on refresh
- Blocks: True offline-first usage
- Implementation complexity: High (would need service worker, sync queue)

**No data export:**
- Problem: Users cannot export their workout history
- Current workaround: None (data locked in Supabase)
- Blocks: User data portability
- Implementation complexity: Low (add export to CSV/JSON)

## Test Coverage Gaps

**All functionality:**
- What's not tested: Everything (no tests exist)
- Risk: Regressions undetected, refactoring risky
- Priority: High
- Difficulty to test: Medium (browser environment, async Supabase calls)

**Critical paths to prioritize:**
- Auth flow (login, register, password reset)
- Workout CRUD (create, log, template update)
- Template management

---

*Concerns audit: 2026-01-12*
*Update as issues are fixed or new ones discovered*
