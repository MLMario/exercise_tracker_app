# Exercise Tracker App - Project Plan

## 1. Project Overview

**App Name**: Exercise Tracker

**Purpose**: A personal fitness tracking web application that allows users to create exercise templates, log workouts, and visualize their progress over time through charts.

**Target User**: Fitness enthusiasts who want to track their gym workouts from their phone browser.

**Key Value Proposition**: Simple, mobile-friendly workout logging with progress visualization - no app download required.

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Alpine.js | Lightweight reactivity, simple syntax, minimal learning curve |
| **Styling** | Plain CSS | Simple, no build step required, dark mode support |
| **Database** | Supabase (PostgreSQL) | Managed database with built-in auth and real-time capabilities |
| **Authentication** | Supabase Auth | Integrated with database, supports email/password |
| **Charts** | Chart.js | Battle-tested, simple API, good documentation |
| **Hosting** | Vercel | Free tier, perfect for static sites, easy deployment |

**No build tools required** - plain HTML, CSS, and JavaScript files.

---

## 3. Feature Requirements

### 3.1 Authentication (Must Have)
- [ ] User registration (email/password)
- [ ] User login
- [ ] User logout
- [ ] Protected routes (redirect to login if not authenticated)

### 3.2 Dashboard Surface (Must Have)
- [ ] Display list of user's exercise templates
- [ ] CTA button to create new template
- [ ] Edit existing templates
- [ ] Delete templates
- [ ] Add charts section
- [ ] Add new chart with metric selection
- [ ] Remove charts

### 3.3 Exercise Management (Must Have)
- [ ] Create new exercises (name + category)
- [ ] View list of existing exercises when adding to template
- [ ] Select from existing exercises or create new
- [ ] Prevent duplicate exercises in same template
- [ ] Per-user exercise library (private to each user)

### 3.4 Template Management (Must Have)
- [ ] Create named templates
- [ ] Add exercises to template from library or create new
- [ ] Set default sets, reps, weight, rest time per exercise
- [ ] Edit template name and exercises
- [ ] Delete template (logs remain independent)

### 3.5 Workout Logging Surface (Must Have)
- [ ] Opens when user selects a template to start workout
- [ ] Display exercises from template with sets/reps/weight/rest
- [ ] Modify sets, reps, weight during workout
- [ ] Add new exercises during workout
- [ ] Remove exercises during workout
- [ ] Mark exercises as done (checkbox)
- [ ] Rest timer per set (adjustable during workout)
- [ ] Bell sound when rest timer completes
- [ ] Save workout log (date + start time recorded)

### 3.6 Charts & Metrics (Must Have)
- [ ] Add unlimited charts to dashboard
- [ ] Select exercise for chart
- [ ] Select metric: Total Sets OR Max Volume (weight × reps)
- [ ] Select X-axis mode:
  - Date mode: show data over time (up to 1 year)
  - Session mode: show last 52 sessions of that exercise
- [ ] Remove charts

### 3.7 Design & UX (Must Have)
- [ ] Dark mode theme
- [ ] Mobile-first responsive design
- [ ] Works smoothly on phone Chrome browser

---

## 4. Data Model

### 4.1 Entity Relationship Diagram (Text)

```
users (Supabase Auth)
  │
  ├── exercises (user's private library)
  │     └── id, user_id, name, category, equipment
  │
  ├── templates
  │     ├── id, user_id, name, created_at
  │     └── template_exercises (join table)
  │           └── id, template_id, exercise_id, default_sets,
  │               default_reps, default_weight, default_rest_seconds, order
  │
  ├── workout_logs
  │     ├── id, user_id, template_id (nullable), started_at, created_at
  │     └── workout_log_exercises
  │           └── id, workout_log_id, exercise_id, sets_completed,
  │               reps, weight, rest_seconds, is_done, order
  │
  └── user_charts
        └── id, user_id, exercise_id, metric_type, x_axis_mode, order
```

### 4.2 Table Definitions

#### `exercises`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | uuid | REFERENCES auth.users(id), NOT NULL |
| name | text | NOT NULL |
| category | text | NOT NULL, CHECK (category IN predefined list) |
| equipment | text | NULLABLE (for future use) |
| created_at | timestamptz | DEFAULT now() |

**Unique constraint**: (user_id, name) - no duplicate exercise names per user

#### `templates`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| user_id | uuid | REFERENCES auth.users(id), NOT NULL |
| name | text | NOT NULL |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### `template_exercises`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| template_id | uuid | REFERENCES templates(id) ON DELETE CASCADE |
| exercise_id | uuid | REFERENCES exercises(id) |
| default_sets | integer | NOT NULL, DEFAULT 3 |
| default_reps | integer | NOT NULL, DEFAULT 10 |
| default_weight | decimal | NOT NULL, DEFAULT 0 |
| default_rest_seconds | integer | NOT NULL, DEFAULT 60 |
| order | integer | NOT NULL |

**Unique constraint**: (template_id, exercise_id) - no duplicate exercises in template

#### `workout_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| user_id | uuid | REFERENCES auth.users(id), NOT NULL |
| template_id | uuid | REFERENCES templates(id) ON DELETE SET NULL, NULLABLE |
| started_at | timestamptz | NOT NULL, DEFAULT now() |
| created_at | timestamptz | DEFAULT now() |

#### `workout_log_exercises`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| workout_log_id | uuid | REFERENCES workout_logs(id) ON DELETE CASCADE |
| exercise_id | uuid | REFERENCES exercises(id) |
| sets_completed | integer | NOT NULL |
| reps | integer | NOT NULL |
| weight | decimal | NOT NULL |
| rest_seconds | integer | NOT NULL |
| is_done | boolean | NOT NULL, DEFAULT false |
| order | integer | NOT NULL |

#### `user_charts`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| user_id | uuid | REFERENCES auth.users(id), NOT NULL |
| exercise_id | uuid | REFERENCES exercises(id) |
| metric_type | text | NOT NULL, CHECK (metric_type IN ('total_sets', 'max_volume')) |
| x_axis_mode | text | NOT NULL, CHECK (x_axis_mode IN ('date', 'session')) |
| order | integer | NOT NULL |
| created_at | timestamptz | DEFAULT now() |

### 4.3 Predefined Categories

```javascript
const CATEGORIES = [
  'Chest',
  'Back',
  'Shoulders',
  'Legs',
  'Arms',
  'Core'
];
```

---

## 5. User Flows

### 5.1 Registration & Login Flow
```
1. User visits app → sees login page
2. User clicks "Sign Up" → registration form
3. User enters email + password → account created
4. User redirected to dashboard (empty state)
```

### 5.2 Create Template Flow
```
1. User on dashboard → clicks "Create Template" CTA
2. Modal/page opens → user enters template name
3. User clicks "Add Exercise"
4. Exercise picker shows:
   - List of existing exercises (user's library)
   - Option to create new exercise
5. If creating new: enter name + select category → saved to library
6. User selects exercise → added to template
7. User sets default sets, reps, weight, rest time
8. User repeats steps 3-7 for more exercises
9. User saves template → appears in dashboard list
```

### 5.3 Log Workout Flow
```
1. User on dashboard → clicks on a template
2. Logging surface opens with template exercises loaded
3. Workout start time recorded
4. For each exercise:
   a. User adjusts sets/reps/weight if needed
   b. User starts rest timer after set
   c. Bell sounds when rest complete
   d. User marks exercise as done (or leaves unchecked)
5. User can add/remove exercises during workout
6. User clicks "Finish Workout"
7. Workout log saved to database
8. User returns to dashboard
```

### 5.4 Add Chart Flow
```
1. User on dashboard → clicks "Add Chart"
2. User selects exercise from library
3. User selects metric (Total Sets or Max Volume)
4. User selects X-axis mode (Date or Session)
5. Chart appears on dashboard
6. Chart displays data from workout logs
```

---

## 6. UI Screens & Components

### 6.1 Screen Map

```
/login          → Login page
/register       → Registration page
/dashboard      → Main dashboard (templates + charts)
/log/:id        → Workout logging surface (template id)
```

### 6.2 Dashboard Layout

```
┌─────────────────────────────────────────┐
│  Exercise Tracker            [Logout]   │
├─────────────────────────────────────────┤
│                                         │
│  MY TEMPLATES                           │
│  ┌─────────────────────────────────┐    │
│  │ + Create New Template           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Push Day           [Edit] [Del] │    │
│  │ 5 exercises                     │    │
│  │ [Start Workout]                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Leg Day            [Edit] [Del] │    │
│  │ 4 exercises                     │    │
│  │ [Start Workout]                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  MY CHARTS                              │
│  ┌─────────────────────────────────┐    │
│  │ + Add Chart                     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Bench Press - Max Volume    [X] │    │
│  │ ┌─────────────────────────┐     │    │
│  │ │      📈 Chart           │     │    │
│  │ └─────────────────────────┘     │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 6.3 Logging Surface Layout

```
┌─────────────────────────────────────────┐
│  ← Back        Push Day        [Finish] │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ [✓] Bench Press           [X]   │    │
│  │     Sets: [3]  Reps: [10]       │    │
│  │     Weight: [135] lbs           │    │
│  │     Rest: [60]s [Start Timer]   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ [ ] Incline Dumbbell      [X]   │    │
│  │     Sets: [3]  Reps: [12]       │    │
│  │     Weight: [50] lbs            │    │
│  │     Rest: [60]s [Start Timer]   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ + Add Exercise                  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🔔 REST TIMER: 0:45             │    │
│  │ [Cancel]                        │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 6.4 Component Breakdown

**Shared Components:**
- `Header` - App title + logout button
- `Button` - Primary, secondary, danger variants
- `Input` - Text, number inputs
- `Select` - Dropdown select
- `Modal` - Overlay modal for forms
- `Card` - Container for templates, charts, exercises

**Dashboard Components:**
- `TemplateList` - List of template cards
- `TemplateCard` - Single template with actions
- `ChartList` - List of chart cards
- `ChartCard` - Single chart with remove button
- `CreateTemplateModal` - Form to create/edit template
- `AddChartModal` - Form to add new chart
- `ExercisePicker` - Select or create exercise

**Logging Components:**
- `LoggingHeader` - Back button, template name, finish button
- `ExerciseLogCard` - Single exercise with inputs + timer
- `RestTimer` - Countdown timer with bell sound
- `AddExerciseButton` - Add exercise during workout

---

## 7. Implementation Phases

### Phase 1: Project Setup & Authentication
**Files to create:**
- `index.html` - Main HTML file
- `css/styles.css` - Dark mode styles
- `js/app.js` - Main Alpine.js app
- `js/supabase.js` - Supabase client setup
- `js/auth.js` - Authentication logic

**Tasks:**
1. Initialize project structure
2. Set up Supabase project (manually by user)
3. Configure Supabase client in JS
4. Implement login page
5. Implement registration page
6. Implement logout functionality
7. Add route protection (redirect if not logged in)

### Phase 2: Database Setup
**Tasks:**
1. Create all tables in Supabase (SQL migrations)
2. Set up Row Level Security (RLS) policies
3. Test database connections

### Phase 3: Exercise & Template Management
**Files to modify:**
- `js/exercises.js` - Exercise CRUD
- `js/templates.js` - Template CRUD

**Tasks:**
1. Implement exercise creation
2. Implement exercise listing (user's library)
3. Implement template creation with exercise picker
4. Implement template listing on dashboard
5. Implement template editing
6. Implement template deletion

### Phase 4: Workout Logging
**Files to create/modify:**
- `js/logging.js` - Workout logging logic
- `js/timer.js` - Rest timer with bell sound
- `assets/bell.mp3` - Bell sound file

**Tasks:**
1. Create logging surface UI
2. Load template exercises into logging view
3. Implement exercise modification during workout
4. Implement add/remove exercises during workout
5. Implement rest timer with countdown
6. Add bell sound on timer complete
7. Implement mark as done checkbox
8. Save workout log to database

### Phase 5: Charts & Metrics
**Files to create/modify:**
- `js/charts.js` - Chart management

**Tasks:**
1. Add Chart.js library
2. Implement add chart modal
3. Query workout data for metrics
4. Calculate total sets metric
5. Calculate max volume metric (weight × reps)
6. Implement date mode (up to 1 year)
7. Implement session mode (last 52 sessions)
8. Display charts on dashboard
9. Implement remove chart

### Phase 6: Polish & Deployment
**Tasks:**
1. Refine dark mode styling
2. Test on mobile Chrome
3. Fix responsive issues
4. Add loading states
5. Add error handling
6. Deploy to Vercel

---

## 8. Out of Scope

The following features are explicitly NOT included in this version:

- **Equipment UI** - Data model includes equipment field, but no UI to set/display it
- **Workout history view** - No browsable list of past workouts
- **Custom categories** - Categories are predefined only
- **Social features** - No sharing, no public profiles
- **Exercise images/videos** - Text only
- **Progressive overload suggestions** - No AI/recommendations
- **Export data** - No CSV/PDF export
- **Mobile app** - Web only (mobile-friendly browser)
- **Offline support** - Requires internet connection
- **Multiple units** - Weight in single unit (lbs or kg, not configurable)

---

## 9. File Structure

```
exercise_tracker_app/
├── index.html              # Main HTML (SPA-style with Alpine)
├── css/
│   └── styles.css          # Dark mode styles
├── js/
│   ├── app.js              # Main Alpine.js application
│   ├── supabase.js         # Supabase client configuration
│   ├── auth.js             # Authentication functions
│   ├── exercises.js        # Exercise CRUD operations
│   ├── templates.js        # Template CRUD operations
│   ├── logging.js          # Workout logging logic
│   ├── timer.js            # Rest timer functionality
│   └── charts.js           # Chart management
├── assets/
│   └── bell.mp3            # Bell sound for timer
└── sql/
    └── schema.sql          # Database schema for Supabase
```

---

## 10. Supabase Setup Instructions

Before development, the user must:

1. Create a Supabase project at https://supabase.com
2. Get the project URL and anon key
3. Run the schema SQL in Supabase SQL Editor
4. Enable Row Level Security on all tables
5. Configure auth settings (email confirmations optional)

---

## 11. Success Criteria

The app is complete when:

- [ ] Users can register and login
- [ ] Users can create, edit, delete templates
- [ ] Users can add exercises from library or create new
- [ ] Users can start a workout from a template
- [ ] Users can modify exercises during workout
- [ ] Rest timer works with bell sound
- [ ] Workout logs are saved correctly
- [ ] Charts display correct metrics
- [ ] App works on mobile Chrome
- [ ] Dark mode looks good
- [ ] Deployed to Vercel and accessible
