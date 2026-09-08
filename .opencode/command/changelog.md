---
description: Update CHANGELOG.md with new entries from recent commits
agent: build
---

Update `CHANGELOG.md` following Keep-a-Changelog format.

## Procedure

1. Read the current `CHANGELOG.md`.
2. Check recent commits since last release: `git log --oneline`.
3. Group commits by type: Added, Changed, Deprecated, Removed, Fixed, Security.
4. Add entries under `[Unreleased]` section.
5. Use English, be concise.
6. If a version tag exists, move `[Unreleased]` content to a new version section.
7. Commit with `docs(changelog): update changelog`.
