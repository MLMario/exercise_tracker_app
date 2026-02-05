# Research Summary: Exercise History (v4.0)

**Project:** IronFactor Exercise Tracker
**Synthesized:** 2026-02-05
**Research Files:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS-v4.md

---

## Executive Summary

The Exercise History feature is a straightforward extension of the existing application architecture. The v3.0 Settings panel established a sub-view routing pattern that scales naturally to accommodate history browsing. **No new dependencies are required** -- the existing stack (Preact 10.28, TypeScript 5.9, Supabase JS 2.90) already provides all necessary capabilities including the `logging.getWorkoutLogs()` and `logging.getWorkoutLog()` services that return the required data.

The recommended approach follows industry patterns from established fitness apps (Strong, Hevy, FitNotes): a chronological timeline with compact workout cards, tap-to-navigate detail views, and "Load More" pagination starting with 7 workouts. The architecture research confirms this fits cleanly within the SettingsPanel overlay by extending the existing `PanelView` type from `'menu' | 'exercises'` to include `'history' | 'detail'`. No new top-level surfaces or routing changes are needed.

The primary risks center on data fetching patterns, not UI complexity. The N+1 query pitfall is critical -- naive implementation would trigger multiple queries per page load. The solution is a single nested Supabase query with client-side aggregation. Pagination must handle the duplicate/skip problem when new workouts are logged mid-browsing; cursor-based pagination or client-side deduplication addresses this. Scroll position preservation is solved by keeping the history list mounted while viewing workout details, following the existing panel pattern.

---

## Key Findings

### From STACK.md

| Technology | Role | Status |
|------------|------|--------|
| Preact 10.28 | UI rendering, hooks | Already installed, no changes |
| TypeScript 5.9 | Type safety | Extend with `WorkoutLogHistoryItem`, pagination types |
| Supabase JS 2.90 | Data fetching | Use existing `.range()` for pagination |
| @use-gesture/react 10.3 | Optional swipe navigation | Already installed, available if needed |
| CSS (vanilla) | Timeline, cards, detail view | Extend existing patterns |

**Key insight:** The feature reuses `logging.getWorkoutLogs()` with limit parameter and `logging.getWorkoutLog(id)` for detail. Only extension needed: add offset parameter for pagination.

**What NOT to add:** No data fetching library (react-query), no virtual list library, no date library (use native `Intl.DateTimeFormat`), no animation library (use CSS transitions), no URL routing.

### From FEATURES.md

**Table Stakes (must have for v4.0):**
- Chronological timeline (newest first)
- Workout summary cards (template name, date, exercise preview)
- Workout detail view with full exercise/set breakdown
- Set completion status (completed vs skipped visual distinction)
- Back navigation (detail -> list -> menu)
- "Load More" pagination (7 initial workouts)

**Differentiators (include for v4.0):**
- Summary stats bar (total workouts, sets, volume)
- Volume calculation (weight x reps for completed sets)
- Empty state design for users with no history

**Defer to post-v4.0:**
- Workout duration display (needs `ended_at` schema column)
- PR badges (needs max value calculation per exercise)
- Filtering/sorting options
- Date grouping headers (nice-to-have, not critical)
- Workout deletion

**Anti-features (explicitly avoid):**
- Inline workout editing (history is read-only)
- Social sharing (scope creep)
- Charts in history view (duplicates existing Charts surface)
- Complex filtering (over-engineering)

### From ARCHITECTURE.md

**Component hierarchy:**
```
SettingsPanel (owns panelView, selectedWorkoutId state)
  |-- SettingsMenu (add "Exercise History" item)
  |-- HistoryListView (timeline with summary bar)
  |     |-- HistorySummary (aggregate stats)
  |     |-- WorkoutCard (per workout)
  |     |-- LoadMoreButton
  |-- WorkoutDetailView (full breakdown)
        |-- Exercise blocks with set grids
```

**Navigation pattern:** Extend `PanelView` type. Menu -> history -> detail via state, not URL routing. Keep history list mounted when viewing detail to preserve scroll position.

**Data flow:** Each view loads its own data on mount. HistoryListView calls `logging.getWorkoutLogs()`. WorkoutDetailView calls `logging.getWorkoutLog(id)`. No lifting of workout data to SettingsPanel level.

**Build order from architecture research:**
1. Menu extension + navigation skeleton
2. History list with data loading
3. Workout detail view
4. (Optional) Expandable cards
5. (If needed) Pagination refinement

### From PITFALLS-v4.md

**Critical pitfalls:**

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| N+1 query problem | Performance degradation with large history | Single nested Supabase query; client-side aggregation |
| Offset pagination duplicates | Same workout appearing twice after new log | Cursor-based pagination OR client-side deduplication with ID Set |
| Scroll position loss | User frustration, lost progress | Keep HistoryListView mounted when viewing detail |
| Memory leak from unbounded list | Browser crash on mobile | Cap at ~100 workouts; fetch summary data only for list |

**Moderate pitfalls:**

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| Inconsistent aggregate calculations | Numbers don't add up | Shared utility function for all stat calculations |
| Null template name | UI shows "undefined" | Null-safe access: `workout.templates?.name ?? 'Untitled Workout'` |
| Slow nested joins | Multi-second delays | Index join columns; limit nested data for list view |
| No loading state on "Load More" | Duplicate requests, confusion | `isLoadingMore` state with button feedback |

**Minor pitfalls:** Subtle set status styling, locale-specific date formatting, empty state design, misleading partial totals in summary bar.

---

## Implications for Roadmap

Based on combined research, the v4.0 Exercise History feature should be implemented in **4-5 phases**. The architecture research provides a clear dependency graph; the pitfalls research identifies which phases need careful attention.

### Recommended Phase Structure

**Phase 1: Service Layer + Menu Navigation**

| Aspect | Detail |
|--------|--------|
| Rationale | Establishes data foundation before UI work; validates navigation pattern |
| Delivers | "Exercise History" menu item with placeholder view; paginated service function |
| Features | Menu navigation, `getWorkoutLogsPaginated()` service function with offset support |
| Pitfalls to avoid | Pitfall 1 (N+1 query) -- design single nested query upfront |
| Research needed | LOW -- well-documented Supabase patterns |

**Phase 2: History List Surface**

| Aspect | Detail |
|--------|--------|
| Rationale | Core viewing experience; must be solid before adding detail navigation |
| Delivers | Timeline view with workout cards, summary bar, pagination |
| Features | Chronological timeline, workout cards, summary stats bar, "Load More" button, empty state |
| Pitfalls to avoid | Pitfall 2 (pagination duplicates), Pitfall 4 (memory growth), Pitfall 6 (null template), Pitfall 8 (loading state), Pitfall 12 (empty state), Pitfall 13 (misleading totals) |
| Research needed | LOW -- standard list patterns, mockup already approved |

**Phase 3: Workout Detail Surface**

| Aspect | Detail |
|--------|--------|
| Rationale | Completes the read-only history flow; depends on list for navigation entry |
| Delivers | Full workout breakdown with exercise/set grid |
| Features | Workout detail view, exercise blocks, set grid with completion status, back navigation |
| Pitfalls to avoid | Pitfall 3 (scroll loss -- keep list mounted), Pitfall 5 (aggregate consistency), Pitfall 9 (back button), Pitfall 10 (set status visibility) |
| Research needed | LOW -- reuses existing `getWorkoutLog()` service |

**Phase 4: Polish + Edge Cases**

| Aspect | Detail |
|--------|--------|
| Rationale | Address UX refinements after core flow is working |
| Delivers | Production-ready history experience |
| Features | Date formatting refinement, loading states, error handling, accessibility |
| Pitfalls to avoid | Pitfall 11 (date locale) |
| Research needed | LOW -- standard polish work |

**Phase 5 (Optional): Expandable Cards**

| Aspect | Detail |
|--------|--------|
| Rationale | Nice-to-have inline preview; can be deferred if timeline meets needs |
| Delivers | Expand/collapse workout cards for quick preview without full navigation |
| Features | Accordion behavior, exercise preview on expand |
| Pitfalls to avoid | None critical |
| Research needed | LOW -- optional enhancement |

### Research Flags

| Phase | Research Needed? | Notes |
|-------|------------------|-------|
| Phase 1 | NO | Service patterns documented in STACK.md; Supabase `.range()` is standard |
| Phase 2 | NO | List/card patterns well-established; mockup provides design direction |
| Phase 3 | NO | Detail view follows existing SettingsPanel sub-view pattern |
| Phase 4 | NO | Standard polish work |
| Phase 5 | NO | Optional, simple accordion pattern |

**None of the phases require `/gsd:research-phase` during planning.** The existing codebase patterns and researched approaches are sufficient. All technical decisions are documented in the research files.

### Key Decision Points

Decisions that should be made during requirements/planning, informed by research:

1. **Pagination strategy:** Offset-based (simpler) vs cursor-based (more robust). Research recommends offset with client-side deduplication for v4.0 simplicity.

2. **Summary bar scope:** All-time totals (requires separate aggregate query) vs visible totals (confusing). Research recommends all-time totals with clear labeling.

3. **Memory cap:** Maximum workouts to load before disabling "Load More." Research recommends ~100 workouts as reasonable cap.

4. **Expandable cards:** Include in v4.0 or defer. Research marks as optional enhancement.

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| Stack | HIGH | Zero new dependencies; all capabilities verified in existing codebase |
| Features | HIGH | Table stakes verified against Strong, Hevy, FitNotes; clear MVP scope |
| Architecture | HIGH | Direct extension of v3.0 SettingsPanel pattern; code verified |
| Pitfalls | HIGH | Based on codebase analysis + documented Supabase/SPA patterns |
| **Overall** | **HIGH** | Feature is well-scoped, patterns are established, risks are known |

### Gaps Identified

| Gap | Impact | Resolution |
|-----|--------|------------|
| No `ended_at` column in schema | Cannot show workout duration | Defer duration display to post-v4.0; document as future enhancement |
| No database indexes verified | Potential slow queries for large history | Verify indexes during Phase 1; add if missing |
| Aggregate calculation strategy | Performance vs simplicity tradeoff | Start with client-side calculation; monitor; add RPC if needed |

None of these gaps block v4.0 implementation. They represent optimization opportunities or deferred features.

---

## Sources

### Primary Sources (HIGH confidence)

- **Codebase analysis:** Direct file reads of logging.ts, SettingsPanel.tsx, types, CSS
- **current_schema.sql:** Database structure verification
- **Supabase documentation:** PostgREST query patterns, `.range()` pagination

### Secondary Sources (MEDIUM confidence)

- **Industry apps:** Strong, Hevy, FitNotes feature analysis
- **Supabase community:** Pagination best practices, query optimization guides
- **SPA patterns:** Scroll restoration, infinite scroll memory management

### Research Files

| File | Focus | Lines |
|------|-------|-------|
| STACK.md | Technology choices, what to use and avoid | 516 |
| FEATURES.md | Table stakes, differentiators, anti-features | 233 |
| ARCHITECTURE.md | Component hierarchy, data flow, build order | 546 |
| PITFALLS-v4.md | Critical/moderate/minor pitfalls with prevention | 329 |

---

*Synthesis completed: 2026-02-05*
*Ready for roadmap creation*
