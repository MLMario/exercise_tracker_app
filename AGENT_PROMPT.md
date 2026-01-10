# Exercise Tracker App - Development Prompt

Build a personal fitness tracking web application with the following specifications.

## Tech Stack (Required)
- **Frontend**: Alpine.js (lightweight reactivity)
- **Styling**: Plain CSS with dark mode theme
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Charts**: Chart.js
- **Hosting**: Vercel (static files)
- **No build tools** - plain HTML, CSS, JavaScript

## Core Features

### Authentication
- Email/password registration and login via Supabase Auth
- Protected routes - redirect to login if not authenticated
- Logout functionality

### Dashboard Surface
The main screen users see after login with two sections:

**Templates Section:**
- List of user's exercise templates (cards)
- "Create Template" CTA button
- Each template shows: name, exercise count, Start Workout button, Edit/Delete buttons

**Charts Section:**
- "Add Chart" button
- Unlimited charts, each showing:
  - Selected exercise's metric over time
  - Remove button (X)

### Exercise Management
- Users have a private exercise library (not shared between users)
- Each exercise has: name, category (predefined), equipment (store in DB but no UI)
- Predefined categories: Chest, Back, Shoulders, Legs, Arms, Core
- When adding to template: pick from existing library OR create new
- New exercises immediately appear in library
- No duplicate exercises allowed in the same template

### Template Management
- Templates have: name, list of exercises
- Each exercise in template has defaults: sets, reps, weight, rest_seconds
- Templates can be created, edited, deleted
- Deleting a template does NOT delete workout logs (logs are independent)

### Workout Logging Surface
Opens when user clicks "Start Workout" on a template:

- Display all exercises from template with their defaults
- User can modify sets, reps, weight, rest time for each exercise
- User can add new exercises during workout (from library or create new)
- User can remove exercises during workout
- Each exercise has a "done" checkbox (can be checked or left unchecked)
- Rest timer per set:
  - Adjustable duration
  - Countdown display
  - Bell sound (audio) when timer completes
- "Finish Workout" button saves the log
- Database stores: date, start_time, all exercise data

### Charts & Metrics
Two metrics available:
1. **Total Sets**: Sum of sets completed for an exercise
2. **Max Volume**: Highest (weight × reps) in a single set

Two X-axis modes:
1. **Date Mode**: Shows metric over time, up to 1 year of data
2. **Session Mode**: Shows metric for last 52 workout sessions containing that exercise

User can add unlimited charts to dashboard, each tracking one exercise with one metric/mode combination.

## Data Model

```
exercises
  - id, user_id, name, category, equipment (nullable), created_at
  - Unique constraint: (user_id, name)

templates
  - id, user_id, name, created_at, updated_at

template_exercises
  - id, template_id, exercise_id, default_sets, default_reps, default_weight, default_rest_seconds, order
  - Unique constraint: (template_id, exercise_id)

workout_logs
  - id, user_id, template_id (nullable, ON DELETE SET NULL), started_at, created_at

workout_log_exercises
  - id, workout_log_id, exercise_id, sets_completed, reps, weight, rest_seconds, is_done, order

user_charts
  - id, user_id, exercise_id, metric_type ('total_sets' | 'max_volume'), x_axis_mode ('date' | 'session'), order, created_at
```

All tables need Row Level Security (RLS) so users only access their own data.

## UI Requirements

- **Dark mode** theme (dark background, light text)
- **Mobile-first** responsive design - primary use is phone Chrome browser
- Clean, simple interface
- Loading states for async operations
- Error handling with user-friendly messages

## File Structure

```
index.html
css/styles.css
js/
  app.js          # Main Alpine.js app
  supabase.js     # Supabase client
  auth.js         # Auth functions
  exercises.js    # Exercise CRUD
  templates.js    # Template CRUD
  logging.js      # Workout logging
  timer.js        # Rest timer + bell
  charts.js       # Chart management
assets/
  bell.mp3        # Timer sound
sql/
  schema.sql      # Supabase schema
```

## Implementation Order

1. Project setup + Supabase client configuration
2. Authentication (login, register, logout, route protection)
3. Database schema (create tables with RLS)
4. Exercise CRUD (create, list)
5. Template CRUD (create, edit, delete, list)
6. Workout logging surface (load template, modify exercises, save log)
7. Rest timer with bell sound
8. Charts (add, display metrics, remove)
9. Polish (dark mode, mobile responsiveness, error handling)

## Out of Scope (Do NOT implement)
- Equipment selection UI (field exists in DB for future use)
- Workout history browsable list
- Custom categories
- Data export
- Offline support

## Notes
- User must create Supabase project and provide URL + anon key
- Deploy as static files to Vercel
- No server-side code needed - Supabase handles everything
