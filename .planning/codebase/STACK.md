# Technology Stack

**Analysis Date:** 2026-01-17

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- CSS - Stylesheets (`apps/web/css/styles.css`)
- JavaScript - Configuration files (`vite.config.ts`)

## Runtime

**Environment:**
- Node.js (inferred from pnpm) - Development and build
- Browser-based (Preact web framework) - `apps/web/src/main.tsx`
- Vite development server - `apps/web/vite.config.ts`

**Package Manager:**
- pnpm (version inferred from lockfile)
- Lockfile: `pnpm-lock.yaml` (lockfileVersion 9.0)
- Workspace: `pnpm-workspace.yaml` specifying `packages/*` and `apps/*`

## Frameworks

**Core:**
- Preact 10.28.2 - Lightweight React alternative for UI (`apps/web/package.json`)
- Alpine.js 3.15.3 - Lightweight DOM manipulation (`apps/web/package.json`)

**Testing:**
- Not configured - No test framework installed

**Build/Dev:**
- Vite 7.3.1 - Build tool and dev server (`apps/web/vite.config.ts`)
- @preact/preset-vite 2.10.2 - Preact integration (`apps/web/vite.config.ts`)
- vite-plugin-static-copy 3.1.4 - Static asset handling (`apps/web/vite.config.ts`)
- TypeScript 5.9.3 - Type checking and compilation (`package.json`)

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.90.1 - Database & Authentication (`packages/shared/package.json`)
- chart.js 4.5.1 - Data visualization for exercise metrics (`packages/shared/package.json`)
- preact 10.28.2 - UI framework (`apps/web/package.json`)

**Infrastructure:**
- Node.js built-ins - File system, path operations
- Rollup 4.55.1 - Module bundler (via Vite)

## Configuration

**Environment:**
- Vite pattern with `VITE_` prefix for environment variables
- Required vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `.env` file with `.env.example` template

**Build:**
- `tsconfig.json` - TypeScript compiler options (ES2020 target, React-JSX)
- `apps/web/vite.config.ts` - Vite build configuration
- `apps/web/tsconfig.json` - Web app specific TypeScript settings

## Platform Requirements

**Development:**
- Any platform with Node.js and pnpm
- No Docker required
- Supabase cloud backend (no local DB setup needed)

**Production:**
- Vercel - Deployment platform (`vercel.json`)
- Build command: `pnpm --filter @ironlift/web build`
- Output directory: `apps/web/dist`

---

*Stack analysis: 2026-01-17*
*Update after major dependency changes*
