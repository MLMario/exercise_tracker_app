# IronLift Monorepo Structure

## What is `pnpm-workspace.yaml`?

`pnpm-workspace.yaml` is a configuration file that tells pnpm (a fast, disk-efficient package manager) which folders contain packages in your monorepo. It enables:

1. **Shared dependencies** - Install once at root, use everywhere
2. **Cross-package imports** - `@ironlift/shared` can be imported in `apps/web`
3. **Linked local packages** - Changes in `packages/shared` immediately available to apps
4. **Single lockfile** - One `pnpm-lock.yaml` for the entire monorepo

**Example `pnpm-workspace.yaml`:**
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**Alternative: npm workspaces** (if you prefer npm over pnpm)
In `package.json`:
```json
{
  "workspaces": ["packages/*", "apps/*"]
}
```

---

## Complete New Structure

```
ironlift_app/                          ← Renamed from exercise_tracker_app
│
├── .claude/                           ← STAYS AT ROOT (Claude Code config)
│   └── settings.local.json
│
├── .git/                              ← STAYS AT ROOT (git repository)
│
├── .gitignore                         ← STAYS AT ROOT (updated for monorepo)
│
├── .planning/                         ← STAYS AT ROOT (project planning docs)
│   ├── codebase/
│   ├── milestones/
│   ├── PROJECT.md
│   └── structure.md                   ← This file
│
├── .vercel/                           ← STAYS AT ROOT (Vercel project config)
│   └── project.json
│
├── .mockup/                           ← STAYS AT ROOT (design mockups)
├── .mockups/                          ← STAYS AT ROOT (design mockups)
│
├── .env                               ← STAYS AT ROOT (shared env vars)
├── .env.example                       ← STAYS AT ROOT (env template)
│
├── docs/                              ← STAYS AT ROOT (documentation)
│   └── *.md
│
├── sql/                               ← STAYS AT ROOT (database migrations)
│   └── *.sql
│
├── package.json                       ← ROOT WORKSPACE CONFIG (new)
├── pnpm-workspace.yaml                ← WORKSPACE DEFINITION (new)
├── pnpm-lock.yaml                     ← SINGLE LOCKFILE (new, replaces package-lock.json)
│
├── packages/
│   └── shared/                        ← EXTRACTED FROM src/
│       ├── src/
│       │   ├── index.ts               ← Barrel export for all shared code
│       │   │
│       │   ├── lib/
│       │   │   └── supabase.ts        ← FROM: src/lib/supabase.ts
│       │   │
│       │   ├── types/
│       │   │   ├── index.ts           ← FROM: src/types/index.ts
│       │   │   ├── database.ts        ← FROM: src/types/database.ts
│       │   │   └── services.ts        ← FROM: src/types/services.ts
│       │   │
│       │   └── services/
│       │       ├── index.ts           ← FROM: src/services/index.ts
│       │       ├── auth.ts            ← FROM: src/services/auth.ts
│       │       ├── exercises.ts       ← FROM: src/services/exercises.ts
│       │       ├── templates.ts       ← FROM: src/services/templates.ts
│       │       ├── logging.ts         ← FROM: src/services/logging.ts
│       │       └── charts.ts          ← FROM: src/services/charts.ts
│       │
│       ├── package.json               ← Package config (name: @ironlift/shared)
│       └── tsconfig.json              ← TypeScript config for shared package
│
└── apps/
    ├── web/                           ← CURRENT PREACT APP (moved)
    │   ├── src/
    │   │   ├── main.tsx               ← FROM: src/main.tsx
    │   │   ├── env.d.ts               ← FROM: src/env.d.ts
    │   │   │
    │   │   ├── components/            ← FROM: src/components/
    │   │   │   ├── index.ts
    │   │   │   ├── ConfirmationModal.tsx
    │   │   │   ├── ExercisePickerModal.tsx
    │   │   │   └── InfoModal.tsx
    │   │   │
    │   │   └── surfaces/              ← FROM: src/surfaces/
    │   │       ├── index.ts
    │   │       ├── auth/
    │   │       ├── dashboard/
    │   │       ├── template-editor/
    │   │       └── workout/
    │   │
    │   ├── css/                       ← FROM: css/
    │   │   └── styles.css
    │   │
    │   ├── assets/                    ← FROM: assets/
    │   │   └── (static files)
    │   │
    │   ├── index.html                 ← FROM: index.html
    │   ├── vite.config.ts             ← FROM: vite.config.ts (updated paths)
    │   ├── tsconfig.json              ← FROM: tsconfig.json (updated paths)
    │   ├── vercel.json                ← FROM: vercel.json
    │   └── package.json               ← Package config (name: @ironlift/web)
    │
    └── ios/                           ← FUTURE REACT NATIVE APP (scaffold)
        ├── src/
        │   ├── App.tsx
        │   └── screens/
        │       └── (placeholder)
        ├── package.json               ← Package config (name: @ironlift/ios)
        └── tsconfig.json

```

---

## Files That Are DELETED or REPLACED

| Old Location | Action | Notes |
|--------------|--------|-------|
| `js/` | DELETE | Legacy JavaScript, no longer used |
| `dist/` | DELETE | Build output, regenerated on build |
| `node_modules/` | DELETE | Will be recreated at root level |
| `package-lock.json` | DELETE | Replaced by `pnpm-lock.yaml` |

---

## Package Configurations

### Root `package.json`
```json
{
  "name": "ironlift",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @ironlift/web dev",
    "build": "pnpm --filter @ironlift/web build",
    "build:all": "pnpm -r build",
    "clean": "pnpm -r exec rm -rf dist node_modules"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### `packages/shared/package.json`
```json
{
  "name": "@ironlift/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./services": "./src/services/index.ts",
    "./lib": "./src/lib/supabase.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.90.1"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### `apps/web/package.json`
```json
{
  "name": "@ironlift/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ironlift/shared": "workspace:*",
    "preact": "^10.28.2",
    "chart.js": "^4.5.1"
  },
  "devDependencies": {
    "@preact/preset-vite": "^2.10.2",
    "vite": "^7.3.1",
    "vite-plugin-static-copy": "^3.1.4"
  }
}
```

---

## Import Changes After Migration

### Before (current)
```typescript
import { supabase } from '@/lib/supabase';
import { TemplateService } from '@/services';
import { Template } from '@/types';
```

### After (monorepo)
```typescript
import { supabase } from '@ironlift/shared/lib';
import { TemplateService } from '@ironlift/shared/services';
import { Template } from '@ironlift/shared/types';

// OR using barrel export:
import { supabase, TemplateService, Template } from '@ironlift/shared';
```

---

## Vercel Deployment Changes

Update `apps/web/vercel.json` or root `vercel.json`:
```json
{
  "buildCommand": "cd apps/web && pnpm build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "framework": "vite"
}
```

Or configure in Vercel Dashboard:
- **Root Directory**: `apps/web`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`

---

## Summary of What Stays Where

| Category | Location | Reason |
|----------|----------|--------|
| Git/Version Control | Root | Must be at repo root |
| Claude Code Config | Root | Tool configuration |
| Planning/Docs | Root | Project-wide documentation |
| Vercel Config | Root | Deployment configuration |
| Environment Files | Root | Shared across all apps |
| SQL Migrations | Root | Database-level, not app-specific |
| Mockups | Root | Design assets for all apps |
| Shared Code | `packages/shared/` | Reusable across web & ios |
| Web App | `apps/web/` | Web-specific UI and config |
| iOS App | `apps/ios/` | iOS-specific UI and config |
