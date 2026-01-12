# Exercise Tracker App - Current State

## Summary

The Exercise Tracker App is a personal fitness tracking web application built with Alpine.js, CSS, and JavaScript (no build tools). It uses Supabase for backend services (PostgreSQL database + authentication). The app is designed for mobile-first use with a dark theme.

---

## What the User Wanted to Build (from plans)

According to `agent_prompt.md`, `set_tracking_plan.md`, and `template_set_ui_plan.md`:

### Core Goal
A fitness tracker where users can:
- Create workout templates with exercises and default sets
- Start workouts from templates and log individual set performance
- Track metrics (Total Sets, Max Volume) across time via charts
- Manage a private exercise library

### Key Features
- **Authentication**: Email/password via Supabase Auth
- **Dashboard**: Templates section + Progress Charts section
- **Template Editor**: Create/edit templates with per-set configuration
- **Workout Logging**: Track individual sets (weight, reps, completion status)
- **Rest Timer**: Per-exercise countdown with bell notification
- **Charts**: Display metrics by date or session
- **Exercise Library**: Private, user-specific exercises with categories

### Major Implementations Planned
- **Per-Set Tracking**: Shifted from aggregate (3 sets, 10 reps) to individual sets with different weights/reps
- **Template UI Redesign**: Template editor now uses per-set rows (matching workout logging UI)
- **Normalized Database Schema**: Separate tables for per-set data (`workout_log_sets`, `template_exercise_sets`)

---

## Current Project Structure

```
exercise_tracker_app/
├── index.html                          # Main HTML with Alpine.js templates
├── css/
│   └── styles.css                      # Dark-themed, mobile-first CSS
├── js/
│   ├── app.js                          # Alpine.js app controller (1082 lines)
│   ├── auth.js                         # Supabase authentication
│   ├── exercises.js                    # Exercise CRUD operations
│   ├── templates.js                    # Template CRUD with per-set support
│   ├── logging.js                      # Workout logging and metrics
│   ├── charts.js                       # Chart creation/management
│   ├── timer.js                        # Rest timer functionality
│   ├── supabase.js                     # Supabase client initialization
│   └── config.local.js                 # Local config (gitignored)
├── sql/
│   ├── migration_per_set_tracking.sql  # Creates workout_log_sets table
│   ├── migration_template_sets.sql     # Creates template_exercise_sets table
│   └── migration_schema_cleanup.sql    # Additional schema updates
├── docs/
│   ├── agent_prompt.md                 # Original requirements
│   ├── set_tracking_plan.md            # Plan for per-set workout logging
│   └── template_set_ui_plan.md         # Plan for template editor redesign
└── .claude/
    ├── CLAUDE.md                       # Development lead instructions
    └── settings.local.json             # Local settings
```

---

## What Has Been Implemented

### 1. Core Features (Complete)
- Authentication system with login/register
- Dashboard with templates and charts sections
- Template management (create, edit, delete, list)
- Workout logging with per-set tracking
- Rest timer with adjustable duration
- Charts with metric selection (total_sets, max_volume_set)
- Exercise library with CRUD operations

### 2. Database Schema (Partially Implemented)
The app uses a normalized schema with:
- `exercises` - User's private exercise library
- `templates` - Workout templates
- `template_exercises` - Link table with rest defaults
- `template_exercise_sets` - Individual set configs in templates
- `workout_logs` - Workout sessions
- `workout_log_exercises` - Exercises performed in workouts
- `workout_log_sets` - Individual set data from workouts (new)
- `user_charts` - User's saved charts

### 3. Per-Set Tracking (Implemented)
- **Workout Logging**: Individual sets tracked in `workout_log_sets` table
- **Template Configuration**: Per-set defaults in `template_exercise_sets` table
- **UI**: Both template editor and workout logging use per-set row UI
- **Metrics**: Charts calculate metrics from individual sets, not aggregates

### 4. UI/UX Features (Implemented)
- **Alpine.js Reactivity**: Two-way data binding for forms
- **Modal Dialogs**: Replace browser confirm with styled modals
  - Template update confirmation
  - Finish workout confirmation
  - Cancel workout confirmation
- **Swipe-to-Delete**: Pointer events for mobile-friendly set deletion
- **Rest Timer**: Inline progress bar showing countdown per exercise
- **Responsive Design**: Mobile-first layout with proper spacing
- **Toast Messages**: Error and success notifications
- **Dark Theme**: CSS with CSS variables for dark mode

### 5. localStorage Workout Backup (Implemented)
- **Auto-save**: Workout progress saved to localStorage on every change
- **Auto-restore**: Silently resumes workout on page load if backup exists
- **Multi-tab sync**: Changes propagate across browser tabs via storage events
- **Per-user isolation**: Backup keyed by user ID (`activeWorkout_${userId}`)
- **Validation**: Basic validation on restore; corrupted data silently discarded
- **Template deletion handling**: Shows error toast if template was deleted
- **Cleanup**: Backup cleared on finish, cancel, or logout

---

## Key Files and Their Purposes

### JavaScript Modules

#### app.js (~1210 lines)
- Alpine.js app component with full state management
- Surfaces: auth, dashboard, templateEditor, workout
- Methods for: auth, templates, workouts, charts, timers, exercises
- Advanced features: swipe-to-delete, modal management, change detection
- localStorage backup system for workout recovery

#### logging.js (490 lines)
- `createWorkoutLog()` - Save workout with per-set data
- `getWorkoutLogs()` / `getWorkoutLog()` - Fetch workout history
- `getExerciseHistory()` - Get per-set data for an exercise
- `getExerciseMetrics()` - Calculate metrics (total_sets, max_volume_set)
- Handles both date and session-based grouping

#### templates.js (200+ lines)
- `getTemplates()` - Fetch templates with nested sets
- `createTemplate()` - Create with per-set exercise configuration
- `updateTemplate()` - Modify templates and their sets
- `deleteTemplate()` - Remove template (doesn't delete logs)
- Transforms database data to app format

#### charts.js (150+ lines)
- `getUserCharts()` - Fetch user's saved charts
- `createChart()` - Add chart with exercise, metric, and x-axis mode
- `deleteChart()` - Remove chart
- `renderChart()` - Render Chart.js visualization
- Supports metrics: total_sets, max_volume_set
- Supports modes: date, session

#### exercises.js
- `getExercises()` - Get all exercises
- `createExercise()` - Create new exercise
- Category support (Legs, Chest, Back, Shoulders, Arms, Core, Cardio, Other)

#### auth.js
- `register()` - Sign up new user
- `login()` - Sign in existing user
- `logout()` - Sign out
- `getSession()` - Get current auth state
- `onAuthStateChange()` - Listen for auth changes

#### timer.js
- Rest timer logic with countdown
- Bell sound notification

### Database Migrations

#### migration_per_set_tracking.sql
- Creates `workout_log_sets` table
- Sets up RLS policies
- Creates indexes for performance
- Includes helper SQL functions for metrics

#### migration_template_sets.sql
- Creates `template_exercise_sets` table
- Enables users to define per-set defaults in templates
- RLS policies for security

---

## Notable Architecture Patterns

### 1. Per-Set Data Model
- Exercises have many sets (one-to-many relationship)
- Sets store: weight, reps, set_number, is_done
- Rest time stays at exercise level (shared for all sets)

### 2. Alpine.js State Management
- All app state in one Alpine component (`fitnessApp`)
- Clear separation of concerns by surface (auth, dashboard, etc.)
- Reactive computed properties (e.g., `filteredExercises`)

### 3. Supabase RLS (Row Level Security)
- All tables have RLS policies
- Users only see their own data
- Enforced at database level

### 4. Modal-First User Confirmations
- Replaced `window.confirm()` with styled modal dialogs
- Modals: template-update, finish-workout, cancel-workout

### 5. Swipe-to-Delete for Mobile
- Uses Pointer Events API (better than Touch Events)
- Smooth real-time tracking with `translateX()`
- Threshold-based reveal (swipe > 40px triggers delete button)

### 6. Lazy Data Loading
- Dashboard loads templates, exercises, charts in parallel
- Charts render only after DOM updates

### 7. localStorage Backup for Workout Recovery
- Uses Alpine `$watch` with deep option to detect any change to `activeWorkout`
- Stores `activeWorkout`, `originalTemplateSnapshot`, and `last_saved_at` timestamp
- On page load, checks for backup after templates load (needed for template validation)
- Multi-tab sync via `window.addEventListener('storage', ...)` event listener

---

## Recent Development History (from git)

Recent commits show:
- localStorage backup for workout recovery (auto-save, auto-restore, multi-tab sync)
- Modal-based user confirmations (replacing browser confirm)
- Cancel workout button and template update flow
- Rest timer redesigned as inline progress bar
- Swipe-to-delete functionality for sets
- Per-set logging implementation
- Bug fixes for swipe and set operations
- Template creation and Supabase integration

---

## Database Schema Overview

The normalized schema uses these relationships:
```
Users -> Exercises (1:many)
Users -> Templates (1:many)
Templates -> TemplateExercises (1:many) -> TemplateExerciseSets (1:many)
Users -> WorkoutLogs (1:many) -> WorkoutLogExercises (1:many) -> WorkoutLogSets (1:many)
Users -> UserCharts (1:many)
```

All tables have `user_id` for isolation and Row Level Security.

---

## Out of Scope

Per the original requirements, the following are NOT implemented:
- Equipment selection UI (field exists in database for future use)
- Workout history browsable list
- Custom categories
- Data export
- Full offline support (localStorage backup provides crash recovery, not offline-first)

---

## Tech Stack Verification

As specified in `agent_prompt.md`:
- Frontend: Alpine.js ✓
- Styling: Plain CSS with dark mode ✓
- Database & Auth: Supabase ✓
- Charts: Chart.js ✓
- No build tools ✓
- Static files (for Vercel) ✓
