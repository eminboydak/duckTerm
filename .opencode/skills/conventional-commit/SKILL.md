---
name: conventional-commit
description: Use when creating git commits or branches in this repo. Enforces Conventional Commits formatting, atomic English commits, and branch naming (type/scope-description) branched from dev. Triggers on commit, branch, git, Conventional Commits, PR.
---

# Conventional Commit & Branch Workflow

Enforce the repository's git conventions from `AGENTS.md`. All commit and branch text is **English**.

## Branches

- Feature/fix/refactor work branches off **`dev`**, never `main`.
  - Exception: `hotfix/` may branch off `main` for urgent production fixes.
- Naming: `type/scope-short-description`, lowercase `kebab-case`.
- Valid types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `hotfix`.
- Examples: `feat/serial-connection`, `fix/hex-view-overflow`, `chore/update-deps`.

## Commits

- **Atomic**: one logical change per commit. If the description needs "and", split it into multiple commits.
- Format: `type(scope): subject`
  - `type`: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `style`.
  - `scope` (optional): affected area (`serial`, `ui`, `tauri`, `docs`...).
  - `subject`: imperative mood, lowercase first word, no trailing period, ≤72 chars.
- Body: explain **why**, not what. Wrap at ~72 chars. Reference issues/ADRs.
- Breaking change: `feat(api)!: ...` plus a `BREAKING CHANGE: <reason>` footer.
- Stage only the files relevant to the commit. Never bundle unrelated changes.

## Procedure

1. Confirm you are on a correctly named branch off `dev`.
2. Stage the files for **one** logical change.
3. Re-read the staged diff.
4. Write the commit message following the format above.
5. Repeat per logical change until the work is fully committed.
6. Never push unless the user explicitly asks.

## Examples

```
feat(serial): add port discovery with USB metadata
fix(ui): prevent terminal overflow on rapid input
docs(adr): add DT-0001 tech stack selection
refactor(tauri)!: replace IPC command interface

BREAKING CHANGE: frontend must use new invoke() signatures.
```
