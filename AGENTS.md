# duckTerm — Agent Instructions

> Single Source of Truth for AI agents working on this repository.

## Core Purpose & Repository Boundaries

**duckTerm** is a free, open-source, cross-platform serial terminal for embedded engineers.
Two editions: GUI (Tauri 2.x) and TUI (ratatui), sharing a common `duckterm-core` crate.

**This repository contains:**
- `duckterm-core` — shared serial I/O, protocol, buffer, mock backend
- `duckterm-gui` — Tauri 2.x desktop app (Rust + Preact frontend)
- `duckterm-tui` — ratatui terminal app (Rust, single binary)
- `site/` — Landing page (DaisyUI 5, GitHub Pages)
- Documentation (ADRs, architecture, plans, changelog)

**This repository does NOT contain:**
- Network (TCP/UDP) serial — future P2 feature
- SSH/Telnet — not a terminal emulator
- Mobile apps — desktop + terminal first
- Web/PWA version

## Crate Workspace

```
duckTerm/
├── Cargo.toml                    ← workspace root
├── crates/
│   ├── duckterm-core/            ← shared: serial, mock, protocol, buffer
│   ├── duckterm-gui/             ← Tauri desktop app
│   └── duckterm-tui/             ← ratatui terminal app
├── src/                          ← Preact frontend (GUI)
├── site/                         ← Landing page
└── docs/                         ← Documentation
```

**Key rule:** New serial/protocol logic goes into `duckterm-core`. Both GUI and TUI consume it. Never duplicate serial logic in edition-specific crates.

## Language Rules

- **Documentation:** English (ADRs, specs, guides, README, CHANGELOG)
- **User interaction:** Turkish (chat, commit messages body can be Turkish-context)
- **Code:** English (variables, functions, comments)
- **File names:** English, lowercase `kebab-case`

## Skill & Plugin Ecosystem

Skills live in-repo and are committed:
- `.agents/skills/` — vendored via `npx skills add <owner/repo> -a opencode -y --copy`
- `.opencode/skills/` — hand-written, project-specific

Both auto-discovered by OpenCode from the repo root.

## Documentation & ADR Lifecycle

- **ADRs** (`docs/decisions/DT-XXXX-*`): Immutable once `Accepted`. Mark old as `Deprecated` or `Superseded`.
- **Plans** (`docs/plans/`): Feature roadmaps with checklists.
- **Architecture** (`docs/architecture/`): System diagrams, data flow.
- **Changelog** (`docs/changelog/CHANGELOG.md`): Keep-a-Changelog format. Never modify historical entries.

Sequential numbering for ADRs (DT-0001, DT-0002...). No gaps. No deletion.

## Execution Safeguards

**Agent MUST NOT:**
- Commit without explicit user request
- Push without explicit user request
- Modify ADRs marked as `Accepted` (create new instead)
- Skip verification before claiming completion
- Duplicate serial logic outside `duckterm-core`
- Use `transition: all` in CSS animations

**Agent MUST:**
- Run `cargo test` and `pnpm check` before claiming work is complete
- Follow Conventional Commits format
- Branch from `dev`, never `main`
- Keep terminal buffer size configurable
- Test with mock feature when no hardware available (`--features mock`)

## Task Workflow

```
Issue → Plan → Branch (dev) → Implement → Verify → PR → Review → Merge → Done
```

1. Classify task: Spike / Bounded / Architectural
2. Create branch from `dev`: `type/scope-description`
3. Implement with tests
4. Run verification: `cargo test`, `cargo test --features mock`, `pnpm check`, `pnpm build`
5. Commit with Conventional Commits
6. Create PR (never push to main directly)

## Branch Strategy & Commits

- **`main`** — Production-ready, protected
- **`dev`** — Integration branch, all PRs target here
- **`feature/*`** — Feature branches from dev
- **`fix/*`** — Bug fix branches from dev
- **`hotfix/*`** — Urgent fixes from main (exception)

**Commit format:** `type(scope): subject`
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `style`
- Scope: `core`, `gui`, `tui`, `serial`, `ui`, `docs`, `site`, etc.
- Subject: imperative mood, ≤72 chars, no period

## Design System Protocol (GUI)

- **Framework:** Tailwind CSS v4 + DaisyUI v5
- **Theme:** Custom `duckterm` theme (dark, oklch colors)
- **Font:** JetBrains Mono (monospace), Inter (UI)
- **Animations:** ease-out for entering, ease-in forbidden on UI, sub-300ms
- **Accessibility:** `prefers-reduced-motion` must be honored
- **Components:** Use DaisyUI components, avoid custom when possible

## Feature Roadmap

See `docs/plans/docklight-feature-parity.md` for the full feature plan:
- **P0 (MVP):** Core serial + hex view + signal control (current sprint)
- **P1 (v1.0):** Sequences, checksums, logging, multi-tab, project save/load
- **P2 (v1.x):** TCP/UDP, scripting, Modbus, monitoring mode, data visualization

## References

- ADR index: `docs/decisions/INDEX.md`
- Feature plan: `docs/plans/docklight-feature-parity.md`
- Architecture: `docs/architecture/OVERVIEW.md`
- Tauri docs: https://v2.tauri.app
- DaisyUI docs: https://daisyui.com
- ratatui docs: https://ratatui.rs
- Preact docs: https://preactjs.com
