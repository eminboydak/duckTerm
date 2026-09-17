# duckTerm Documentation

> Navigation hub for all project documentation.

## Structure

| Directory | Purpose | Format |
|-----------|---------|--------|
| [decisions/](decisions/) | Architecture Decision Records (ADRs) | MADR-lite, sequential numbering |
| [plans/](plans/) | Feature plans, roadmaps | Markdown checklists |
| [specs/](specs/) | Technical specifications | Design docs, feature specs |
| [architecture/](architecture/) | System diagrams, data flow | Markdown + diagrams |
| [changelog/](changelog/) | Release history | Keep-a-Changelog |

## Decision Records

ADRs capture significant architectural decisions. They are immutable once accepted.

| ADR | Title | Status |
|-----|-------|--------|
| [0001](decisions/0001-tech-stack-selection.md) | Tech Stack Selection (Tauri + DaisyUI) | Accepted |
| [0002](decisions/0002-legacy-v0-evaluation.md) | Legacy v0 Evaluation and Fresh Start | Accepted |
| [0003](decisions/0003-frontend-framework-preact.md) | Frontend Framework — Preact + Signals (amends 0001) | Accepted |

## Feature Plans

| Plan | Title | Status |
|------|-------|--------|
| [docklight-feature-parity](plans/docklight-feature-parity.md) | DockLight Feature Parity Roadmap (P0/P1/P2) | Active |
| [mvp-p0-core-serial](plans/mvp-p0-core-serial.md) | MVP P0: Core Serial + Hex View | In Progress |

## Architecture

- [System Overview](architecture/OVERVIEW.md) — crate workspace, data flow, design decisions

## Quick Links

- [Contributing Guide](../CONTRIBUTING.md)
- [Changelog](changelog/CHANGELOG.md)
- [Landing Page](../site/index.html) — duckterm.eminboydak.com
