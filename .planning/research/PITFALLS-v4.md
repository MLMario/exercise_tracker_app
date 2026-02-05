# Pitfalls Research: Exercise History (v4.0)

**Domain:** Exercise history timeline, pagination, and detail views for existing Preact/Supabase fitness app
**Researched:** 2026-02-05
**Overall confidence:** HIGH (based on codebase analysis + domain research)

---

## Critical Pitfalls

Mistakes that cause performance degradation, data inconsistency, or require significant rework.

---

### Pitfall 1: N+1 Query Problem When Fetching Workout History with Aggregates

- **Risk:** The existing `getWorkoutLogs()` function fetches workout logs with only a count of exercises (using Supabase's aggregate syntax). For the history timeline, the UI requires additional aggregates per workout: total sets completed, total weight lifted, exercise names for preview. The naive approach would fetch the workout list first, then loop through each workout to calculate aggregates -- creating an N+1 query pattern. With 7 initial workouts + pagination loading more, this becomes 1 + N queries per page load, degrading performance as history grows.

- **Warning signs:**
  - "Load More" takes noticeably longer each time (more data to aggregate)
  - Network tab shows multiple sequential Supabase requests for each page
  - Users with 100+ workouts experience multi-second delays

- **Prevention:**
  1. Calculate aggregates at the database level using Supabase's PostgREST aggregate syntax or a dedicated SQL view/function.
  2. Extend the existing `getWorkoutLogs()` query to include nested aggregates in a single query:
     ```typescript
     .select(`
       id, template_id, started_at, created_at,
       templates (name),
       workout_log_exercises (
         id,
         exercises (name),
         workout_log_sets (weight, reps, is_done)
       )
     `)
     ```
  3. Calculate totals client-side from the nested data (single query, client-side aggregation) rather than multiple queries.
  4. For very large histories (1000+ workouts), consider a materialized view or denormalized summary columns -- but this is likely premature optimization for v4.0.

- **Phase:** History List surface -- must be addressed in the initial data fetching implementation before UI work begins.

- **Sources:**
  - [Supabase Query Optimization Docs](https://supabase.com/docs/guides/database/query-optimization)
  - [PostgREST LATERAL JOIN Performance Issue](https://github.com/PostgREST/postgrest/issues/3938)

---

### Pitfall 2: Offset-Based Pagination Skips or Duplicates Items After New Workouts

- **Risk:** The typical "Load More" pagination uses OFFSET (skip first N rows). If a user logs a new workout while viewing history, the offset calculation becomes incorrect:
  - **Scenario A:** User views page 1 (workouts 1-7), logs new workout, clicks "Load More" expecting workouts 8-14. But the new workout shifted all rows -- page 2 now shows workout 7-13, duplicating workout 7.
  - **Scenario B:** User views page 1, another session deletes a workout, "Load More" skips a workout that shifted into the previous page.

  With sorted-by-date history, newly logged workouts appear at the top, pushing older workouts down and causing duplicates on subsequent pages.

- **Warning signs:**
  - Users see the same workout card appear twice in the timeline
  - "Load More" seems to reload the last few items
  - Workouts mysteriously disappear from the list after pagination

- **Prevention:**
  1. **Use cursor-based pagination instead of offset.** After loading page 1, store the `started_at` timestamp (or `created_at`) of the last workout. Page 2 query uses `.lt('started_at', lastTimestamp)` instead of `.range(7, 13)`.
  2. If using offset pagination (simpler for v4.0), implement **duplicate filtering client-side**: maintain a Set of loaded workout IDs, filter out any IDs that already exist before appending new results.
  3. Add a unique compound sort key: `ORDER BY started_at DESC, id DESC` to ensure stable ordering even for workouts with identical timestamps.

- **Phase:** Pagination implementation phase. The pagination strategy must be decided before building "Load More" functionality.

- **Sources:**
  - [Supabase Data Pagination Best Practices](https://github.com/supabase/agent-skills/blob/main/skills/supabase-postgres-best-practices/references/data-pagination.md)
  - [Makerkit: Supabase Pagination in React](https://makerkit.dev/blog/tutorials/pagination-supabase-react)

---

### Pitfall 3: Losing Scroll Position When Returning from Workout Detail View

- **Risk:** User scrolls through history, loads more workouts, taps a workout card to view details, reads the detail, taps "Back" -- and the list has reset to the top with only 7 workouts loaded. All their scroll progress and loaded pages are lost. This is a notorious SPA pitfall: browser history navigation doesn't preserve React/Preact component state by default.

- **Warning signs:**
  - Users repeatedly scroll and tap "Load More" to get back to where they were
  - Frustration when exploring deep history
  - "Back" button feels broken

- **Prevention:**
  1. **Keep the History List mounted when viewing details.** Render the Detail view as an overlay or adjacent panel rather than replacing the list. When detail closes, the list is already in its previous state.
  2. **Cache loaded workouts in a parent component or context.** Store `loadedWorkouts[]`, `currentPage`, and `scrollPosition` outside the list component. When remounting, restore from cache.
  3. **Use sessionStorage as a fallback.** Before navigating to detail, save scroll position and loaded workout IDs to sessionStorage. On mount, check sessionStorage and restore if recent.
  4. For this app's architecture (surfaces replace each other in main.tsx), the recommended approach is **Option 1: keep list mounted**. The Settings panel already uses this pattern (always rendered, visibility controlled via CSS `.open` class).

- **Phase:** Navigation architecture phase. Must be decided before building the detail view navigation.

- **Sources:**
  - [SPA Scroll Restoration Patterns](https://www.davidtran.dev/blogs/scroll-restoration-in-spas)
  - [React Scroll Restoration in E-commerce Apps](https://blog.logrocket.com/implementing-scroll-restoration-in-ecommerce-react-apps/)

---

### Pitfall 4: Memory Leak from Unbounded Workout List Growth

- **Risk:** "Load More" appends workouts to an array in state. A user with years of workout history could load hundreds or thousands of workouts into memory. Combined with the nested exercise/set data per workout, this can cause:
  - Browser memory usage climbing to hundreds of MB
  - UI becoming sluggish as the array grows
  - Eventually, browser tab crash on mobile devices

- **Warning signs:**
  - Performance degrades after multiple "Load More" clicks
  - Mobile Safari crashes after loading 50+ pages
  - Memory usage in devtools grows without bound

- **Prevention:**
  1. **Set a reasonable maximum.** After loading ~100 workouts, disable "Load More" or show "Viewing last 100 workouts. Search or filter to find older workouts." Most users won't need to view 100+ workouts in one session.
  2. **Virtual windowing (deferred).** For truly infinite history, implement virtual scrolling that only renders visible items. Libraries: `react-window` or manual implementation. This is likely overkill for v4.0 -- a cap of 100 is simpler.
  3. **Fetch summary data, not full exercise/set details.** The timeline cards only need workout date, template name, exercise count, and total weight. Full exercise/set data should only be fetched when opening the detail view.
  4. **Compact the data structure.** Only store fields needed for the timeline card; discard unused nested data after aggregation.

- **Phase:** Data model phase. Design the workout summary type before implementing the list.

- **Sources:**
  - [Infinite Scroll Memory Management](https://dev.to/pipipi-dev/infinite-scroll-with-zustand-and-react-19-async-pitfalls-57c)

---

## Moderate Pitfalls

Mistakes that cause poor UX, confusing state, or require rework.

---

### Pitfall 5: Aggregates Calculated Inconsistently Between List and Detail

- **Risk:** The history list shows summary stats (total sets, total weight). The detail view shows per-exercise breakdowns. If these are calculated differently (e.g., list includes all sets vs. detail only shows completed sets), the numbers won't match. User sees "48 sets" on the card, opens detail, counts 45 sets total -- confusion and distrust.

- **Warning signs:**
  - Users report "the numbers don't add up"
  - QA finds discrepancies between list totals and detail sums
  - Different calculation logic in two places leads to drift over time

- **Prevention:**
  1. **Define aggregate calculations once in a shared utility function.** Create `calculateWorkoutStats(workoutLogExercises)` that returns `{ totalSets, completedSets, totalWeight, totalVolume }`. Use the same function for both list card stats and detail summary.
  2. **Be explicit about what "total" means.** In the existing `logging.ts`, `calculateMetrics()` counts `completedSets` (sets where `is_done === true`). Use this same definition everywhere. If the list card shows "12 sets," it should mean 12 completed sets, matching the green checkmarks in detail view.
  3. **Include the definition in the UI.** If showing "Total Volume: 4,500 lbs," clarify this is "completed sets only" via tooltip or small text if users find it confusing.

- **Phase:** Service layer and component implementation. Create the shared calculation utility before building either UI.

---

### Pitfall 6: Template Name Missing for Deleted Templates

- **Risk:** The `workout_logs` table has a `template_id` FK to `templates`, but templates can be deleted. When a template is deleted, `workout_logs.template_id` becomes a dangling reference (current schema has no CASCADE). If the history list tries to display `workout.templates.name` via a join, workouts with deleted templates will have `templates: null`, causing "undefined" or crashes in the UI.

- **Warning signs:**
  - Workout cards show "undefined" or blank where template name should be
  - Error: "Cannot read property 'name' of null"
  - Old workouts from deleted templates break the entire list

- **Prevention:**
  1. **Handle null template gracefully in the UI.** Display a fallback: "Untitled Workout" or "Manual Workout" when `templates` is null.
  2. **Store template name snapshot at workout creation (future enhancement).** Add `template_name` column to `workout_logs` that is populated at creation time and never changes. This preserves historical accuracy even after template rename/delete. However, this requires a schema migration -- evaluate for v4.0 or defer.
  3. **For v4.0, the null-safe UI approach is sufficient.** The query should use left join semantics (Supabase nested select does this by default), and the UI should check `workout.templates?.name ?? 'Untitled Workout'`.

- **Phase:** Timeline card component implementation.

---

### Pitfall 7: Slow "Load More" Due to Deep Nested Joins

- **Risk:** Per Supabase/PostgREST documentation, nested queries use LATERAL LEFT JOINs which execute subqueries for all rows before ORDER BY and LIMIT are applied. For a history query with 3 levels of nesting (`workout_logs -> workout_log_exercises -> exercises`, plus `workout_log_sets`), performance degrades as total data grows. A user with 500 workouts may wait 3-5 seconds for each "Load More" even though we're only fetching 7 more rows.

- **Warning signs:**
  - Supabase dashboard shows slow query times (>500ms) for history queries
  - "Load More" feels slower for long-time users than for new users
  - Query explains show sequential scans on workout_log_exercises

- **Prevention:**
  1. **Index the join columns.** Ensure indexes exist on: `workout_logs(user_id, started_at)`, `workout_log_exercises(workout_log_id)`, `workout_log_sets(workout_log_exercise_id)`. The current schema has primary keys but may lack these composite indexes.
  2. **Limit nested data.** For the list view, limit exercises to first 3-5 per workout for preview. Full exercise list loads only in detail view.
  3. **Denormalize summary stats (future).** Add `completed_sets_count` and `total_weight` columns to `workout_logs`, updated via trigger or application logic on workout save. This eliminates the need to join and aggregate at read time.
  4. **For v4.0, indexes + limited nested data should suffice.** Monitor query performance in production; denormalization is optimization for v4.1 if needed.

- **Phase:** Database/service layer phase. Check for indexes before writing the query.

- **Sources:**
  - [PostgREST LATERAL JOIN Performance](https://github.com/PostgREST/postgrest/issues/3938)
  - [Supabase Query Optimization](https://supabase.com/docs/guides/database/query-optimization)

---

### Pitfall 8: "Load More" Button Disappears While Loading (No Loading State)

- **Risk:** User clicks "Load More," the button disappears or is disabled, but there's no loading indicator. User doesn't know if anything is happening. They click again, triggering duplicate requests. Or they navigate away thinking it's broken.

- **Warning signs:**
  - Double-click results in duplicate workouts appearing
  - Users report "Load More doesn't work" when it actually does (just no feedback)
  - Sentry shows multiple identical requests within 1 second

- **Prevention:**
  1. **Show a loading state on the "Load More" button.** Change text to "Loading..." and disable the button while the request is in flight.
  2. **Add a loading spinner below the last workout card.** Visual feedback that more content is coming.
  3. **Debounce or disable the button until the current request completes.** Use a `isLoadingMore` state flag that's set `true` on click and `false` on response/error.
  4. **Follow the existing `DashboardSurface` pattern.** It uses `isLoading` state and shows "Loading dashboard..." -- adapt this pattern for pagination loading.

- **Phase:** "Load More" UI implementation.

---

### Pitfall 9: Detail View Navigation Breaks Back Button Expectations

- **Risk:** If the detail view is implemented as a new entry in browser history (`history.pushState` or a new route), users expect the browser back button to return to the list. But if state isn't preserved (Pitfall 3), the back button goes to a reset list. Alternatively, if detail is implemented as a modal/overlay without history entry, the back button might exit the entire history section instead of closing the detail.

- **Warning signs:**
  - Browser back button does something unexpected
  - Users stuck in detail view with no obvious exit
  - Android hardware back button doesn't work as expected

- **Prevention:**
  1. **For v4.0, use an internal navigation pattern (not browser history).** The SettingsPanel already demonstrates this: a `panelView` state variable controls which sub-view is shown, and a custom "Back" button navigates between views. Browser history is not modified.
  2. **Make the back navigation obvious.** A prominent back arrow/button in the detail view header, same position as SettingsPanel's back button.
  3. **If browser history integration is desired later,** use the History API carefully with proper scroll restoration. But this adds complexity -- for v4.0, internal state navigation is simpler and matches existing patterns.

- **Phase:** Navigation architecture phase. Decide detail view navigation strategy before implementation.

---

## Minor Pitfalls

Mistakes that cause annoyance or minor polish issues.

---

### Pitfall 10: Completed vs. Skipped Set Visual Distinction Too Subtle

- **Risk:** The workout detail shows a set grid with completed status per set. If the visual distinction is too subtle (e.g., just a small icon difference), users can't quickly scan to see their workout completion rate. The information is there but not effectively communicated.

- **Warning signs:**
  - Users ask "how do I know which sets I completed?"
  - Completion status requires careful reading instead of quick scanning
  - A/B testing shows users prefer clearer status

- **Prevention:**
  1. **Use strong visual contrast.** Green background/checkmark for completed sets, gray/muted for skipped. Match the existing workout surface pattern where completed sets have distinct styling.
  2. **Row-level distinction, not just an icon.** The entire row background or border should indicate status, not just a small status icon.
  3. **Consider opacity:** completed sets at 100% opacity, skipped sets at 50% opacity. This makes skipped sets visually recede.

- **Phase:** Workout Detail surface UI implementation.

---

### Pitfall 11: Date Formatting Inconsistent with User's Locale

- **Risk:** Timeline dates displayed as "2024-02-05" (ISO) or "February 5, 2024" (US English) may confuse international users expecting "5 February 2024" (UK) or "05/02/2024" (European DD/MM/YYYY). The app doesn't currently handle localization, but date formatting in the history timeline will be prominent.

- **Warning signs:**
  - Users outside US see unfamiliar date formats
  - Ambiguous dates like "02/03/2024" (Feb 3 or Mar 2?)

- **Prevention:**
  1. **Use relative dates where possible.** "Today," "Yesterday," "3 days ago," "Last Monday" are universally understood and more useful for recent history.
  2. **For older dates, use unambiguous format.** "Feb 5" or "5 Feb" with abbreviated month avoids DD/MM vs MM/DD confusion.
  3. **Use `Intl.DateTimeFormat()` with user's locale.** `new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)` will respect browser/OS locale settings.
  4. **For v4.0, a simple relative + abbreviated approach is fine.** Full i18n is future scope.

- **Phase:** Timeline card display implementation.

---

### Pitfall 12: Empty State When User Has No Workout History

- **Risk:** A new user or a user who deleted all their data will have zero workout logs. The history view must handle this gracefully -- not a blank screen, broken layout, or confusing message.

- **Warning signs:**
  - Blank white space where timeline should be
  - "No results" message without context
  - User doesn't know what to do next

- **Prevention:**
  1. **Design an encouraging empty state.** "No workouts yet! Complete your first workout to see your history here." with a visual illustration or icon.
  2. **Consider a CTA.** "Start a Workout" button that navigates to template selection. However, if history is deep in settings, this navigation might be awkward -- a simple message may be better.
  3. **Match the existing empty state pattern.** `MyExercisesList` has an empty state: "You haven't created any custom exercises yet." -- reuse this pattern with appropriate messaging.

- **Phase:** History List surface UI implementation.

---

### Pitfall 13: Summary Bar Totals Misleading for Partial History

- **Risk:** The summary bar shows "Total workouts: X, Total sets: Y, Total weight: Z lbs." If this summarizes only the visible/loaded workouts, it's misleading when the user has 100 workouts but only 7 are loaded. "28 sets" appears underwhelming when their true total is 500+ sets.

- **Warning signs:**
  - Summary stats jump dramatically after each "Load More"
  - Users think their totals are lower than reality
  - "Total workouts: 7" when user knows they've done 50+

- **Prevention:**
  1. **Summary bar should show ALL-TIME totals, not just visible.** Fetch aggregate counts separately from the paginated list. A single query like `SELECT COUNT(*), SUM(completed_sets)... FROM workout_logs WHERE user_id = $1` gives true totals without loading all data.
  2. **Clearly label the scope.** "All-time: 142 workouts, 1,847 sets, 156,000 lbs lifted"
  3. **Alternatively, remove the summary bar** if it causes confusion. The timeline itself shows workout count; per-workout stats are in the cards.
  4. **For v4.0, implement a dedicated totals query.** This is a simple aggregate query, not a performance concern.

- **Phase:** Summary bar implementation. Decide if it's all-time totals or visible totals upfront.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Data model / service layer | Pitfall 1 (N+1), Pitfall 5 (aggregate consistency) | Single nested query; shared calculation utility |
| Pagination implementation | Pitfall 2 (offset duplicates), Pitfall 4 (memory growth) | Cursor-based pagination or client-side dedup; cap at 100 |
| Navigation architecture | Pitfall 3 (scroll loss), Pitfall 9 (back button) | Keep list mounted; internal state navigation |
| Timeline list UI | Pitfall 6 (deleted template), Pitfall 8 (loading state), Pitfall 12 (empty state) | Null-safe template name; loading indicator; empty state design |
| Summary bar | Pitfall 13 (misleading totals) | Separate all-time totals query |
| Workout detail UI | Pitfall 10 (set status visibility) | Strong visual contrast for completed vs skipped |
| Date display | Pitfall 11 (locale) | Relative dates + unambiguous format |
| Performance | Pitfall 7 (slow nested joins) | Index join columns; limit nested data for list view |

---

## Sources

- Codebase analysis: `current_schema.sql`, `logging.ts`, `DashboardSurface.tsx`, `SettingsPanel.tsx`, `MyExercisesList.tsx` (HIGH confidence -- direct code reading)
- [Supabase Data Pagination Best Practices](https://github.com/supabase/agent-skills/blob/main/skills/supabase-postgres-best-practices/references/data-pagination.md) (HIGH confidence)
- [PostgREST LATERAL JOIN Performance Issue](https://github.com/PostgREST/postgrest/issues/3938) (HIGH confidence)
- [Supabase Query Optimization Docs](https://supabase.com/docs/guides/database/query-optimization) (HIGH confidence)
- [SPA Scroll Restoration Patterns](https://www.davidtran.dev/blogs/scroll-restoration-in-spas) (MEDIUM confidence)
- [React Scroll Restoration in E-commerce Apps](https://blog.logrocket.com/implementing-scroll-restoration-in-ecommerce-react-apps/) (MEDIUM confidence)
- [Infinite Scroll Memory and Duplicate Pitfalls](https://dev.to/pipipi-dev/infinite-scroll-with-zustand-and-react-19-async-pitfalls-57c) (MEDIUM confidence)
- [Makerkit: Supabase Pagination in React](https://makerkit.dev/blog/tutorials/pagination-supabase-react) (MEDIUM confidence)
