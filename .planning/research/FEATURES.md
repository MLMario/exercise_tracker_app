# Feature Landscape: Exercise History (v4.0)

**Domain:** Workout history tracking in fitness apps
**Researched:** 2026-02-05
**Overall confidence:** HIGH (verified against multiple established apps)

---

## Table Stakes

Features users expect from workout history. Missing any of these makes the product feel incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Chronological timeline | Users expect to scroll through workouts by date, most recent first | Low | Industry standard across Strong, Hevy, FitNotes |
| Workout summary card | Quick glance at what was done: workout name, date, exercise count | Low | Should include template name, date, badge indicators |
| Exercise preview on cards | See 2-3 exercise names without opening detail | Low | Prevents unnecessary navigation for quick lookup |
| Workout detail view | Full breakdown of exercises, sets, weights, reps | Medium | Tap-to-expand from list; core navigation pattern |
| Set completion status | Visual distinction between completed vs skipped sets | Low | Critical for accuracy of logged data; schema has `is_done` boolean |
| Date/time display | When the workout occurred (date + time or relative "2 days ago") | Low | Relative time for recent, absolute for older |
| Back navigation | Return to list from detail view | Low | Standard UX, header back button |
| Pagination/infinite scroll | Handle large history without performance issues | Medium | "Load More" or infinite scroll; 7 initial is reasonable |

**Critical for v4.0:** All table stakes features listed above. The target implementation in PROJECT.md correctly captures these.

---

## Differentiators

Features that set the product apart. Not expected by users, but valued when present.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Summary stats bar | Total workouts, sets, volume at a glance | Low | Already in target spec; provides quick wins. Hevy shows monthly summaries. |
| Volume calculation | Total weight lifted (sets * reps * weight) | Low | Meaningful progress metric, easy to compute from existing data |
| Badge indicators | Visual markers for PRs, first-time exercises, template completions | Medium | Hevy shows PR badges; adds motivation/gamification |
| Date grouping headers | Group workouts by week/month in timeline | Low | Visual breaks aid scanning; "This Week", "January 2026" |
| Set count per exercise | Show "3 sets" alongside exercise name in preview | Low | Quick info without opening detail |
| Workout duration display | How long the session took | Medium | Requires started_at tracking (schema already has this) but needs ended_at or duration_seconds |
| Empty state design | Motivational message when no history exists | Low | "No workouts yet. Start your first session!" |
| Template name badge | Shows which template was used for the workout | Low | Already available via template_id FK in workout_logs |

**Recommended for v4.0:** Summary stats bar, volume calculation, date grouping headers, empty state design. These provide meaningful differentiation at low complexity.

**Defer to post-v4.0:** Badge indicators (PRs require calculating max values per exercise), workout duration (needs ended_at column in schema).

---

## Anti-Features

Things to deliberately NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Inline workout editing | History is a record; editing creates confusion about what actually happened. Sync conflicts if offline. | Mark as read-only. If editing needed, it's a separate future feature with audit trail. |
| Social sharing from history | Scope creep; social features require significant infrastructure (followers, privacy, notifications). Hevy offers this but it's complex. | Focus on personal tracking; social is a future milestone. |
| Complex filtering/sorting | Over-engineering for v4.0; users mostly scroll chronologically. Strong and FitNotes work fine without filters. | Start with chronological only; add filtering if users request it. |
| Charts in history view | Duplicates existing Charts surface; creates confusion about where to view progress. | Keep charts separate; history is for browsing logs, charts for trends. |
| Workout deletion from history | Risky UX; accidental deletion loses valuable data forever. No undo in history makes this dangerous. | If needed later, add with confirmation modal + soft delete. |
| Automatic categorization | AI/ML classification is complex and error-prone. "Workout type" classification adds little value. | Let template name be the category; explicit is better than implicit. |
| Comparison mode | "Compare this workout to previous" adds significant UI complexity (split view, diff highlighting). | Defer; users can manually compare by looking at two workouts. |
| Notes/comments on workouts | Adds schema complexity (new column), UI overhead (text input, display). Low priority for v4.0. | Defer to future; current schema doesn't support notes. |
| Photo attachments | Storage costs, bandwidth, privacy concerns. Hevy limits to Pro. Not core to history viewing. | Explicitly out of scope per PROJECT.md guidance. |
| Offline history editing | Sync conflicts are notoriously difficult. History is typically viewed, not edited. | History is read-only; no editing means no sync issues. |
| Expand/collapse all sets inline | Showing all set details inline makes the list overwhelming. FitNotes does this poorly. | Keep cards compact; tap to navigate to detail view instead. |
| Swipe actions on history cards | Already have tap-to-view; adding swipe-to-delete or swipe-for-options overcomplicates the interaction. | Single tap to view details is sufficient. |
| Real-time sync animations | "Your friend just finished a workout" push updates. Out of scope, requires websockets. | Static list that refreshes on pull-to-refresh or navigation. |

---

## Feature Dependencies

```
History List Surface
  |
  +-- Summary Stats Bar (workouts count, sets count, total volume)
  |     |
  |     +-- Requires: Query across all workout_logs + workout_log_sets
  |
  +-- Workout Cards (timeline)
  |     |
  |     +-- Template name (JOIN templates)
  |     +-- Date display (from started_at)
  |     +-- Exercise preview (JOIN workout_log_exercises -> exercises, LIMIT 3)
  |     +-- Badge indicators (optional)
  |
  +-- Pagination ("Load More")
  |     |
  |     +-- Initial: 7 workouts
  |     +-- Load: 7 more per click
  |
  +-- Empty State (when count = 0)

Workout Detail Surface
  |
  +-- Back Navigation (to History List)
  |
  +-- Exercise Blocks
  |     |
  |     +-- Exercise name header
  |     +-- Set grid (set #, weight, reps, is_done)
  |
  +-- Visual distinction for completed vs skipped sets
```

**Navigation flow:**
1. Settings Menu > "Exercise History" > History List Surface
2. History List Surface > Tap card > Workout Detail Surface
3. Workout Detail Surface > Back button > History List Surface

---

## MVP Recommendation for v4.0

Based on research, the target implementation in PROJECT.md captures the correct scope.

**Build (Table Stakes + Key Differentiators):**
1. Timeline view with workout cards (chronological, newest first)
2. Summary stats bar (workouts count, sets count, total volume)
3. Compact cards with template name, date, exercise preview
4. Pagination with "Load More" (7 initial workouts)
5. Workout Detail surface with full exercise/set breakdown
6. Visual distinction for completed vs skipped sets
7. Empty state for users with no history

**Defer to post-v4.0:**
- Workout duration display (needs schema update for ended_at)
- PR badges (needs max value calculation logic, per-exercise history queries)
- Filtering by date range or template
- Sorting options beyond chronological
- Workout deletion functionality
- Notes/comments support
- Date grouping headers (nice to have, can add later)

---

## Data Available for History

From `current_schema.sql`, the following data is queryable:

| Table | Fields Available | Use in History |
|-------|-----------------|----------------|
| `workout_logs` | id, user_id, template_id, started_at, created_at | Workout card: date, link to template |
| `workout_log_exercises` | exercise_id, rest_seconds, order | Exercise blocks in detail view |
| `workout_log_sets` | set_number, weight, reps, is_done | Set grid with completion status |
| `templates` | name | Template name on workout card |
| `exercises` | name, category | Exercise name in preview and detail |

**Key insight:** The `is_done` boolean on `workout_log_sets` enables the completed/skipped visual distinction. The `started_at` timestamp on `workout_logs` enables date grouping and relative time display.

**Query patterns:**
- History list: `workout_logs` + JOIN `templates` + subquery for exercise preview
- Detail view: `workout_log_exercises` + JOIN `exercises` + `workout_log_sets`
- Summary stats: Aggregate across all user's `workout_logs` and `workout_log_sets`

---

## Industry Patterns Observed

From research on Strong, Hevy, FitNotes, Setgraph:

| Pattern | Strong | Hevy | FitNotes | Recommendation |
|---------|--------|------|----------|----------------|
| History access | Dedicated tab | History tab | History screen | Settings > Exercise History menu item |
| Card layout | Compact with date | Template name + date | Date + exercises | Template name, date, exercise preview |
| Pagination | Infinite scroll | Load more | Load more | "Load More" button, 7 initial |
| Detail navigation | Tap to expand | Tap to detail screen | Tap to expand | Tap navigates to detail surface |
| Set display | Grid (weight/reps) | List per set | Grid | Set grid: #, weight, reps, done |
| Completed indicator | Checkmark | Green highlight | Checkmark | Visual distinction (color or icon) |
| Summary stats | Volume per workout | Monthly volume | None | Summary bar with totals |
| Empty state | None visible | None visible | None visible | Designed empty state with CTA |

**Key takeaways:**
1. **Speed matters:** Users expect fast loading; pagination is correct approach
2. **Minimal friction:** Single tap to see detail, single tap to go back
3. **Volume as key metric:** Total weight lifted is universally tracked
4. **PR recognition:** Most apps highlight personal records, but this adds complexity
5. **Offline support:** History should work offline (cache previously fetched data)
6. **No hover states on mobile:** Cards should be tap-only, not hover-to-reveal

---

## Technical Implementation Notes

**Summary Stats Calculation:**
```sql
-- Total workouts: COUNT(workout_logs)
-- Total sets: SUM(set counts from workout_log_sets)
-- Total volume: SUM(weight * reps) from workout_log_sets WHERE is_done = true
```

**Exercise Preview (3 exercises max):**
```sql
SELECT DISTINCT ON (wle.workout_log_id) e.name
FROM workout_log_exercises wle
JOIN exercises e ON wle.exercise_id = e.id
WHERE wle.workout_log_id = ?
ORDER BY wle.order
LIMIT 3
```

**Pagination:**
- Cursor-based pagination using `started_at` is recommended for consistency
- Alternative: Offset-based with LIMIT 7, OFFSET n*7

---

## Sources

### High Confidence (Official/Established Apps)
- [Strong Workout Tracker - App Store](https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577) - Official app listing
- [Hevy Features: Gym Progress](https://www.hevyapp.com/features/gym-progress/) - Official documentation
- [Hevy Features: Gym Performance](https://www.hevyapp.com/features/gym-performance/) - Official documentation
- [FitNotes Progress Tracking](http://www.fitnotesapp.com/progress_tracking/) - Official documentation
- [StrengthLog App](https://www.strengthlog.com/) - Official site

### Medium Confidence (Industry Analysis)
- [Stormotion: Fitness App Features](https://stormotion.io/blog/fitness-app-features/) - 15 must-have features guide
- [Setgraph: Best Workout Tracking Apps 2025](https://setgraph.app/ai-blog/best-workout-tracking-apps) - Comparison analysis
- [GymGod: Strong vs Hevy Comparison 2026](https://gymgod.app/blog/strong-vs-hevy) - Feature comparison
- [PRPath: Strong vs Hevy 2026](https://www.prpath.app/blog/strong-vs-hevy-2026.html) - Feature comparison
- [Stormotion: Fitness App UI Design](https://stormotion.io/blog/fitness-app-ux/) - UX patterns

### Low Confidence (General Patterns)
- [Madappgang: Fitness App Design](https://madappgang.com/blog/the-best-fitness-app-design-examples-and-typical-mistakes/) - UX patterns
- [Resourcifi: Fitness App Development Mistakes](https://www.resourcifi.com/fitness-app-development-mistakes-avoid/) - Anti-patterns
- [Zfort: Fitness App UX Best Practices](https://www.zfort.com/blog/How-to-Design-a-Fitness-App-UX-UI-Best-Practices-for-Engagement-and-Retention) - UX patterns

---
*Research conducted: 2026-02-05*
*Confidence: HIGH - verified against established fitness apps with large user bases*
*Previous version: v3.0 Settings & Exercise Management (archived)*
