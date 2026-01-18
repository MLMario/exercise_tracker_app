# Codebase Structure

**Analysis Date:** 2026-01-17

## Directory Layout

```
exercise_tracker_app/
├── apps/                    # Applications
│   ├── web/                # Vite + Preact web app
│   │   ├── src/
│   │   │   ├── main.tsx    # Entry point
│   │   │   ├── components/ # Reusable UI components
│   │   │   └── surfaces/   # Major UI sections
│   │   ├── css/            # Stylesheets
│   │   ├── assets/         # Static files
│   │   ├── vite.config.ts  # Build config
│   │   └── package.json    # @ironlift/web
│   └── ios/                # React Native placeholder
├── packages/               # Shared libraries
│   └── shared/            # @ironlift/shared
│       └── src/
│           ├── lib/        # Supabase client
│           ├── services/   # Business logic
│           └── types/      # TypeScript contracts
├── sql/                    # Database migrations
├── docs/                   # Documentation
├── .planning/              # GSD project planning
├── pnpm-workspace.yaml     # Workspace config
├── tsconfig.json           # Root TypeScript config
├── vercel.json             # Deployment config
└── package.json            # Root scripts
```

## Directory Purposes

**apps/web/:**
- Purpose: Main web application
- Contains: Preact components, surfaces, entry point
- Key files: `src/main.tsx` (entry), `vite.config.ts` (build)
- Subdirectories: `src/components/`, `src/surfaces/`, `css/`, `assets/`

**apps/web/src/surfaces/:**
- Purpose: Major application sections as container components
- Contains: auth/, dashboard/, template-editor/, workout/
- Key files: `AuthSurface.tsx`, `DashboardSurface.tsx`, `WorkoutSurface.tsx`
- Subdirectories: Each surface has its own folder with sub-components

**apps/web/src/components/:**
- Purpose: Reusable UI components shared across surfaces
- Contains: Modals, generic UI elements
- Key files: `ConfirmationModal.tsx`, `ExercisePickerModal.tsx`, `InfoModal.tsx`

**packages/shared/:**
- Purpose: Shared code consumed by all apps
- Contains: Services, types, Supabase client
- Key files: `src/index.ts` (barrel), `src/lib/supabase.ts`
- Subdirectories: `src/services/`, `src/types/`, `src/lib/`

**packages/shared/src/services/:**
- Purpose: Business logic layer
- Contains: Auth, exercises, templates, logging, charts services
- Key files: `auth.ts`, `exercises.ts`, `templates.ts`, `logging.ts`, `charts.ts`

**packages/shared/src/types/:**
- Purpose: TypeScript type definitions
- Contains: Database row types, service interfaces
- Key files: `database.ts`, `services.ts`

**sql/:**
- Purpose: Supabase database migrations
- Contains: SQL migration files
- Key files: `migration_per_set_tracking.sql`, `migration_schema_cleanup.sql`

## Key File Locations

**Entry Points:**
- `apps/web/src/main.tsx` - Web app entry, renders App component
- `packages/shared/src/index.ts` - Shared package barrel export

**Configuration:**
- `tsconfig.json` - Root TypeScript config
- `apps/web/vite.config.ts` - Vite build configuration
- `apps/web/tsconfig.json` - Web app TypeScript settings
- `.env` - Environment variables (Supabase credentials)
- `vercel.json` - Vercel deployment configuration

**Core Logic:**
- `packages/shared/src/services/auth.ts` - Authentication
- `packages/shared/src/services/templates.ts` - Template CRUD
- `packages/shared/src/services/logging.ts` - Workout logging
- `packages/shared/src/services/charts.ts` - Chart operations
- `packages/shared/src/lib/supabase.ts` - Supabase client

**Testing:**
- Not configured - No test files or directories

**Documentation:**
- `docs/` - Project documentation
- `.planning/` - GSD planning documents

## Naming Conventions

**Files:**
- PascalCase.tsx - React/Preact components (`ConfirmationModal.tsx`)
- camelCase.ts - Services and utilities (`auth.ts`, `supabase.ts`)
- kebab-case.sql - Migration files (`migration_per_set_tracking.sql`)
- index.ts - Barrel export files

**Directories:**
- kebab-case - Feature directories (`template-editor/`, `workout/`)
- Plural names - Collections (`services/`, `types/`, `components/`)

**Special Patterns:**
- `index.ts` - Directory exports for clean imports
- `*.d.ts` - Type declaration files (`env.d.ts`)

## Where to Add New Code

**New Feature:**
- Primary code: Create surface in `apps/web/src/surfaces/[feature]/`
- Service logic: `packages/shared/src/services/[feature].ts`
- Types: `packages/shared/src/types/database.ts` (extend existing)
- Tests: Not configured yet

**New Component:**
- Reusable: `apps/web/src/components/[ComponentName].tsx`
- Surface-specific: `apps/web/src/surfaces/[surface]/[ComponentName].tsx`
- Types: Inline in component file or `packages/shared/src/types/`

**New Service:**
- Implementation: `packages/shared/src/services/[name].ts`
- Interface: `packages/shared/src/types/services.ts`
- Export: Add to `packages/shared/src/services/index.ts` barrel

**Utilities:**
- Shared helpers: `packages/shared/src/lib/`
- Type definitions: `packages/shared/src/types/`

## Special Directories

**.planning/:**
- Purpose: GSD project planning documents
- Source: Created by /gsd commands
- Committed: Yes

**sql/:**
- Purpose: Database migration scripts
- Source: Manual creation for Supabase schema changes
- Committed: Yes

**apps/ios/:**
- Purpose: Future React Native iOS app
- Source: Placeholder with `.gitkeep`
- Committed: Yes (placeholder only)

---

*Structure analysis: 2026-01-17*
*Update when directory structure changes*
