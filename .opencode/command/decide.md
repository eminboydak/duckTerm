---
description: Create a new ADR (Architecture Decision Record) with DT-XXXX format
agent: build
---

Create a new Architecture Decision Record.

## Procedure

1. Read `docs/ADR/INDEX.md` to find the next available DT-XXXX number.
2. Create `docs/ADR/DT-XXXX-short-descriptive-title.md`.
3. Use the MADR-lite format:

```markdown
# DT-XXXX: Title

* **Date:** YYYY-MM-DD
* **Status:** Proposed
* **Domain:** [Architecture & Governance | Tech Stack | UI/UX | Serial I/O | Build & Release]

## Context
[Problem statement and background]

## Decision
[The decision with numbered sub-sections]

## Consequences
* **Positive:** [benefits]
* **Negative:** [trade-offs]

## References
* [cross-references to other ADRs]
```

4. Fill all sections with English content.
5. Update `docs/ADR/INDEX.md` — add a row to the ledger table.
6. Commit with `docs(adr): add DT-XXXX title`.

## Rules

- Never delete historical ADRs. Mark old ones as `Deprecated` or `Superseded`.
- Sequential numbering, no gaps.
- English only.
- Keep `docs/ADR/INDEX.md` up to date.
