# duckTerm — Agent Instructions

> Single Source of Truth for AI agents working on this repository.

## Core Purpose & Repository Boundaries

**duckTerm** is a free, open-source, cross-platform serial terminal application for embedded engineers and hardware developers. Built with Tauri 2.x + Svelte 5 + DaisyUI v5 + Rust backend.

**This repository contains:**
- Tauri desktop app (Rust backend + Svelte frontend)
- Serial communication via `tauri-plugin-serialport`
- Documentation (ADRs, architecture, guides)

**This repository does NOT contain:**
- Network (TCP/UDP) serial — future feature
- SSH/Telnet — not a terminal emulator
- Mobile apps — desktop first
- Web/PWA version

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

**Key skills for this project (13 vendor + 3 hand-written):**

Vendor (`.agents/skills/`):
- `daisyui` — Component library, theme system
- `tauri` — Tauri v2 patterns
- `tauri-ipc` — Tauri IPC command/event patterns
- `frontend-design` — UI quality, design principles
- `emil-design-eng` — Animation, polish, micro-interactions
- `brainstorming` — Feature design before implementation
- `systematic-debugging` — Root cause analysis
- `test-driven-development` — TDD workflow
- `verification-before-completion` — Verify before claiming done
- `conventional-commit` — Git commit format
- `git-commit` — Git commit creation
- `documentation-and-adrs` — ADR + documentation standards
- `embedded-dev` — Hardware testing (ESP32, UART, serial)

Hand-written (`.opencode/skills/`):
- `create-adr` — DT-XXXX ADR creation
- `test-hardware` — Serial test procedures (loopback, port discovery)
- `conventional-commit` — Repo-specific commit rules

## Sub-agent Delegation Protocol

- `@explore` — Fast codebase exploration, file discovery, pattern search
- `@general` — Complex multi-step tasks, implementation work

Always provide explicit task descriptions. Never dispatch without clear scope.

## Documentation & ADR Lifecycle

- **ADRs** (`docs/ADR/DT-XXXX-*`): Immutable once `Accepted`. Mark old as `Deprecated` or `Superseded`.
- **Architecture** (`docs/architecture/`): System diagrams, data flow.
- **Changelog** (`CHANGELOG.md`): Keep-a-Changelog format. Never modify historical entries.

Sequential numbering for ADRs (DT-0001, DT-0002...). No gaps. No deletion.

## Execution Safeguards

**Agent MUST NOT:**
- Commit without explicit user request
- Push without explicit user request
- Modify ADRs marked as `Accepted` (create new instead)
- Skip verification before claiming completion
- Use `transition: all` in CSS animations
- Use `scale(0)` for entrance animations
- Use `ease-in` on UI interactions
- Add comments unless explicitly asked

**Agent MUST:**
- Run verification commands before claiming work is complete
- Follow Conventional Commits format
- Branch from `dev`, never `main`
- Keep terminal buffer size configurable (default 10,000 lines)
- Test with real hardware when possible

## Task Workflow

```
Issue → Plan → Branch (dev) → Implement → Verify → PR → Review → Merge → Done
```

1. Classify task: Spike / Bounded / Architectural
2. Create branch from `dev`: `type/scope-description`
3. Implement with tests
4. Run verification (lint, typecheck, build)
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
- Scope: `serial`, `ui`, `tauri`, `docs`, etc.
- Subject: imperative mood, ≤72 chars, no period

## Design System Protocol

- **Framework:** Tailwind CSS v4 + DaisyUI v5
- **Theme:** Custom `duckterm` theme (dark, oklch colors)
- **Font:** JetBrains Mono (monospace)
- **Animations:** ease-out for entering, ease-in forbidden on UI, sub-300ms
- **Accessibility:** `prefers-reduced-motion` must be honored
- **Components:** Use DaisyUI components, avoid custom when possible

## Ponytail Integration

Ponytail is active. Follow the 7-step decision ladder before writing code:
1. YAGNI — Does this need to exist?
2. Codebase Reuse — Is there already code for this?
3. Standard Library — Can the stdlib handle it?
4. Native Platform — Does the OS already do this?
5. Installed Dependencies — Is there already a dependency?
6. One-liner — Can this be a single line?
7. Minimum Implementation — Write the least code possible

## References

- Development brief: `duckterm-v2-brief.md`
- ADR index: `docs/ADR/INDEX.md`
- Tauri docs: https://v2.tauri.app
- DaisyUI docs: https://daisyui.com
- Svelte docs: https://svelte.dev
