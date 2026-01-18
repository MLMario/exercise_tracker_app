# Roadmap: Template Editor UI Cleanup

## Overview

A two-phase polish pass focusing on the template editor surface. Phase 1 fixes the header button/title alignment, Phase 2 adds proper text truncation with tooltips for exercise names.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Header Layout** - Fix Cancel/Title/Save alignment in single row
- [ ] **Phase 2: Exercise Name Truncation** - Add ellipsis overflow and hover tooltip

## Phase Details

### Phase 1: Header Layout
**Goal**: App header displays Cancel (btn-secondary), title "New Template", and Save (btn-primary) in a single row: `[Cancel] New Template [Save]`
**Depends on**: Nothing (first phase)
**Research**: Unlikely (CSS layout, internal patterns)
**Plans**: TBD

Plans:
- [x] 01-01: Header flexbox layout fix

### Phase 2: Exercise Name Truncation
**Goal**: Exercise name truncates with ellipsis when text is too long, with full name shown in tooltip on hover
**Depends on**: Phase 1
**Research**: Unlikely (CSS truncation, established patterns)
**Plans**: TBD

Plans:
- [ ] 02-01: CSS truncation and tooltip implementation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Header Layout | 1/1 | Complete | 2026-01-18 |
| 2. Exercise Name Truncation | 0/1 | Not started | - |
