# Technology Stack

**Analysis Date:** 2026-01-12

## Languages

**Primary:**
- JavaScript (ES6+) - All application code

**Secondary:**
- HTML5 - Document structure (`index.html`)
- CSS3 - Styling (`css/styles.css`)
- SQL - Database migrations (`sql/*.sql`)

## Runtime

**Environment:**
- Browser runtime (no server-side Node.js)
- No build step required (direct browser execution)

**Package Manager:**
- None - Dependencies loaded via CDN
- No package.json or lockfile

## Frameworks

**Core:**
- Alpine.js 3.x - Reactive UI framework (CDN: `cdn.jsdelivr.net/npm/alpinejs@3.x.x`)

**Visualization:**
- Chart.js - Progress charts and data visualization (CDN: `cdn.jsdelivr.net/npm/chart.js`)

**Build/Dev:**
- None - No build tooling, bundler, or transpiler

## Key Dependencies

**Critical:**
- Supabase JS SDK v2 - Database access, authentication, real-time (`cdn.jsdelivr.net/npm/@supabase/supabase-js@2`)
- Alpine.js 3.x - All UI reactivity and component state management
- Chart.js - All progress visualization charts

**Infrastructure:**
- LocalStorage - Workout backup/restore for offline resilience

## Configuration

**Environment:**
- `js/config.local.js` (gitignored) - Supabase URL and anon key as window globals
- `js/supabase.js` - Falls back to placeholders if config.local.js not present

**Build:**
- No build configuration files
- No TypeScript, no bundler config

## Platform Requirements

**Development:**
- Any platform with a modern browser
- No local dependencies to install
- Simple HTTP server for local development (or open index.html directly)

**Production:**
- Static file hosting (any CDN, GitHub Pages, Vercel, Netlify)
- Supabase project for backend

---

*Stack analysis: 2026-01-12*
*Update after major dependency changes*
