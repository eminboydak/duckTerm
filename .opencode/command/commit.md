---
description: Create a conventional commit for the staged changes
agent: build
---

Analyze the staged changes and create a Conventional Commit.

## Procedure

1. Run `git diff --cached` to see staged changes.
2. Classify the change type: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `style`.
3. Determine scope from affected files (e.g., `serial`, `ui`, `tauri`, `docs`).
4. Write commit message: `type(scope): subject` (imperative mood, ≤72 chars, no period).
5. Add body if needed (explain **why**, not what).
6. Stage only relevant files. Never bundle unrelated changes.
7. Commit with the formatted message.

## Rules

- One logical change per commit.
- If description needs "and", split into multiple commits.
- English only.
- Never push unless user explicitly asks.
