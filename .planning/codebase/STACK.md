# Technology Stack

**Analysis Date:** 2026-02-09

## Languages

**Primary:**
- TypeScript 5.9.3 - Complete type safety across frontend and shared libraries

**Secondary:**
- JavaScript - Used via TypeScript compilation
- HTML/CSS - CSS files in `apps/web/css` for styling

## Runtime

**Environment:**
- Node.js (v18+ recommended based on Vite 7.x requirements)

**Package Manager:**
- pnpm - Workspace monorepo manager
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core Frontend:**
- Preact 10.28.2 - Lightweight React-like UI library
- Vite 7.3.1 - Build tool and dev server
- @preact/preset-vite 2.10.2 - Vite plugin for Preact optimization

**UI Components:**
- chart.js 4.5.1 - Data visualization for workout metrics
- @use-gesture/react 10.3.1 - Gesture handling for touch/mouse interactions
- Alpine.js 3.15.3 - Lightweight JavaScript framework for interactive elements

**Testing:**
- Vitest 4.0.18 - Unit test runner (compatible with Vite)
- @testing-library/preact 3.2.4 - Component testing utilities
- @testing-library/user-event 14.6.1 - User interaction simulation
- jsdom 28.0.0 - DOM implementation for Node.js testing

**Build/Dev:**
- tsx 4.21.0 - TypeScript execution for Node.js scripts
- vite-plugin-static-copy 3.1.4 - Copy static assets during build
- TypeScript 5.9.3 - Type checking and compilation

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.90.1 - Database, authentication, and real-time client
  - Location: Root package.json (dependency)
  - Used by: `@ironlift/shared` (peerDependency), authentication and data services

**Infrastructure:**
- Preact 10.28.2 - Efficient rendering engine with virtual DOM
  - File path: `apps/web/package.json`
  - Provides minimal React API with smaller bundle size

## Configuration

**Environment:**
- Vite environment variables loaded from `.env` file at root
- Env vars accessed via `import.meta.env` in TypeScript
- Required vars defined in `packages/shared/src/env.d.ts`:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

**Build:**
- TypeScript config: `tsconfig.json` at root
  - Target: ES2020
  - Module: ESNext
  - JSX: react-jsx with Preact jsxImportSource
  - Strict mode enabled
  - Module resolution: bundler (for Vite)
- Vite config: `apps/web/vite.config.ts`
  - Output directory: `apps/web/dist`
  - Static assets copied from `apps/web/css` and `apps/web/assets`
  - React aliases redirected to Preact/compat for compatibility
  - Environment variables from root directory via `envDir`

**Test Configuration:**
- Vitest config: `apps/web/vitest.config.ts`
  - Environment: jsdom
  - Globals: true (no need for imports)
  - File pattern: `src/**/*.{test,spec}.{ts,tsx}`
  - Setup file: `apps/web/vitest.setup.ts`

## Workspace Structure

**Monorepo Pattern:**
- pnpm workspaces with configuration in `pnpm-workspace.yaml`
- Packages: `packages/*`
- Apps: `apps/*`

**Published Packages:**
- `@ironlift/shared` (packages/shared) - Shared services, hooks, types
  - Exports: Main entry point, test-utils, wildcard re-exports
  - Main dependencies: @supabase/supabase-js, chart.js (peerDependencies)
- `@ironlift/web` (apps/web) - Web application
  - Depends on: @ironlift/shared (workspace:*)
- `@ironlift/ios` (apps/ios) - iOS application (placeholder, coming soon)
  - Depends on: @ironlift/shared (workspace:*)

## Platform Requirements

**Development:**
- Node.js 18+ (for Vite 7.x)
- pnpm 8+ (for workspace management)
- Modern browser with ES2020 support

**Production:**
- Browser with ES2020 support
- Supabase hosted backend (cloud database)
- Vercel deployment (specified in `vercel.json`)

**Database:**
- PostgreSQL via Supabase
- Schema defined in `sql/` directory
  - `current_schema.sql` - Latest schema
  - Multiple migration files for schema evolution

## Project Metadata

**Name:** ironlift
**Description:** Fitness tracking app - TypeScript/Vite refactor
**Version:** 1.0.0
**License:** ISC
**Type:** ES Modules (ES2020+)

---

*Stack analysis: 2026-02-09*
