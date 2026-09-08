# Contributing to duckTerm

Thank you for considering contributing to duckTerm! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Rust toolchain ([rustup](https://rustup.rs))
- Node.js 20+ and pnpm
- Tauri CLI: `cargo install tauri-cli`
- Platform-specific:
  - **macOS:** Xcode Command Line Tools
  - **Windows:** WebView2, MSVC Build Tools
  - **Linux:** `sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`

### Quick Start

```bash
git clone https://github.com/eminboydak/duckTerm.git
cd duckTerm
pnpm install
pnpm tauri dev
```

## Branch Strategy

- **`main`** — Production-ready, protected
- **`dev`** — Integration branch, all PRs target here
- **`feature/*`** — Feature branches from dev
- **`fix/*`** — Bug fix branches from dev
- **`hotfix/*`** — Urgent fixes from main (exception)

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

# Examples:
feat(serial): add port discovery with USB metadata
fix(ui): prevent terminal overflow on rapid input
docs(adr): add DT-0001 tech stack selection
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `style`

**Rules:**
- One logical change per commit
- English only
- Imperative mood, ≤72 chars, no period
- Stage only relevant files

## Pull Request Process

1. Create branch from `dev`: `type/scope-description`
2. Implement with tests
3. Run verification (lint, typecheck, build)
4. Commit with Conventional Commits
5. Create PR targeting `dev`
6. Wait for review and CI pass
7. Merge (squash or rebase)

## Code Style

- **Rust:** `cargo fmt`, `cargo clippy`
- **TypeScript/Svelte:** Prettier (auto-formatted)
- **Commit messages:** Conventional Commits
- **File names:** English, lowercase `kebab-case`

## Reporting Issues

Use GitHub Issues with the provided templates:
- **Bug Report:** Steps to reproduce, expected vs actual behavior
- **Feature Request:** Motivation, proposed solution, alternatives

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
