# Roadmap: Exercise Tracker Refactor

## Overview

Technical debt refactor migrating a fitness tracking app from zero-build vanilla JavaScript to TypeScript + Vite with surface-based architecture. The journey starts with build tooling and type foundations, evaluates UI framework options, then systematically refactors each surface while preserving identical behavior.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Vite + TypeScript setup, project structure, build pipeline
- [x] **Phase 2: Type System** - Supabase schema types, shared interfaces, service module types
- [x] **Phase 3: Framework Evaluation** - Evaluate Alpine.js alternatives, make framework selection → **Preact**
- [x] **Phase 4: Auth Service** - Migrate auth service with full TypeScript types
- [x] **Phase 5: Data Services** - Migrate exercises, templates, logging services with types
- [x] **Phase 6: Auth Surface** - Refactor auth UI (login, register, password reset, session)
- [ ] **Phase 7: Dashboard Surface** - Refactor main dashboard view and navigation
- [ ] **Phase 8: Template Editor Surface** - Refactor template CRUD operations
- [ ] **Phase 9: Exercise Library Surface** - Refactor exercise browser, filter, custom creation
- [ ] **Phase 10: Workout Surface** - Refactor active workout (timer, sets, swipe gestures)
- [ ] **Phase 11: Charts Surface** - Refactor progress charts rendering
- [ ] **Phase 12: Integration** - Multi-tab sync, localStorage backup, routing, final cleanup

## Phase Details

### Phase 1: Foundation
**Goal**: Vite build working with TypeScript, project structure established, existing JS loadable
**Depends on**: Nothing (first phase)
**Research**: Unlikely (standard Vite/TypeScript setup)
**Plans**: TBD

### Phase 2: Type System
**Goal**: Complete type definitions for Supabase schema and service interfaces
**Depends on**: Phase 1
**Research**: Unlikely (analyzing existing code patterns)
**Plans**: TBD

### Phase 3: Framework Evaluation
**Goal**: Evaluate Alpine.js vs Vue/React/Preact, select framework for surfaces
**Depends on**: Phase 1
**Research**: Likely (comparing UI frameworks)
**Research topics**: Current Alpine.js ecosystem, Vue 3 composition API, React/Preact bundle sizes, migration complexity from Alpine.js patterns
**Plans**: TBD

### Phase 4: Auth Service
**Goal**: Auth service fully typed and migrated to new architecture
**Depends on**: Phase 2
**Research**: Unlikely (internal refactoring, Supabase auth patterns established)
**Plans**: TBD

### Phase 5: Data Services
**Goal**: Exercises, templates, and logging services migrated with types
**Depends on**: Phase 2
**Research**: Unlikely (internal refactoring)
**Plans**: TBD

### Phase 6: Auth Surface
**Goal**: Login, register, password reset UI refactored to new architecture
**Depends on**: Phase 3, Phase 4
**Research**: Unlikely (internal UI patterns)
**Plans**: TBD

### Phase 7: Dashboard Surface
**Goal**: Main dashboard view and navigation refactored
**Depends on**: Phase 3, Phase 5
**Research**: Unlikely (internal UI patterns)
**Plans**: TBD

### Phase 8: Template Editor Surface
**Goal**: Template create/edit/delete/reorder UI refactored
**Depends on**: Phase 5, Phase 7
**Research**: Unlikely (internal UI patterns)
**Plans**: TBD

### Phase 9: Exercise Library Surface
**Goal**: Exercise browser, filter, and custom exercise creation refactored
**Depends on**: Phase 5, Phase 7
**Research**: Unlikely (internal UI patterns)
**Plans**: TBD

### Phase 10: Workout Surface
**Goal**: Active workout tracking (timer, sets, swipe gestures) refactored - the complex one
**Depends on**: Phase 5, Phase 8
**Research**: Unlikely (internal patterns, but complex implementation)
**Plans**: TBD

### Phase 11: Charts Surface
**Goal**: Progress charts rendering refactored with clean Chart.js integration
**Depends on**: Phase 5
**Research**: Unlikely (Chart.js already in use)
**Plans**: TBD

### Phase 12: Integration
**Goal**: Multi-tab sync, localStorage backup, routing wired up, old code removed
**Depends on**: All surface phases (6-11)
**Research**: Unlikely (wiring existing pieces)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-01-12 |
| 2. Type System | 2/2 | Complete | 2026-01-12 |
| 3. Framework Evaluation | 1/1 | Complete | 2026-01-12 |
| 4. Auth Service | 1/1 | Complete | 2026-01-12 |
| 5. Data Services | 3/3 | Complete | 2026-01-12 |
| 6. Auth Surface | 3/3 | Complete | 2026-01-12 |
| 7. Dashboard Surface | 0/TBD | Not started | - |
| 8. Template Editor Surface | 0/TBD | Not started | - |
| 9. Exercise Library Surface | 0/TBD | Not started | - |
| 10. Workout Surface | 0/TBD | Not started | - |
| 11. Charts Surface | 0/TBD | Not started | - |
| 12. Integration | 0/TBD | Not started | - |
