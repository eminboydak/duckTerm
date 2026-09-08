---
name: create-adr
description: Use when creating Architecture Decision Records under docs/ADR/. DT-XXXX numbered format, English content, structured context/decision/consequences. Triggers on ADR, decision, architecture decision.
---

# Create Architecture Decision Record

Create new ADRs under `docs/ADR/`. Content is **English**. File names use **English kebab-case**.

## Format

ADRs follow the MADR-lite format:

```markdown
# DT-XXXX: Title

* **Date:** YYYY-MM-DD
* **Status:** Proposed | Accepted | Deprecated | Superseded by DT-XXXX
* **Domain:** Architecture & Governance

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

## Procedure

1. Read `docs/ADR/INDEX.md` to find the next available number.
2. Create `docs/ADR/DT-XXXX-short-descriptive-title.md` with the format above.
3. Fill all sections with English content.
4. Set the `Status` field: `Proposed`, `Accepted`, `Deprecated`, or `Superseded`.
5. Update `docs/ADR/INDEX.md` — add a row to the ledger table.
6. Commit with `docs(adr): add DT-XXXX title`.

## Rules

- Never delete historical ADRs. Mark old ones as `Deprecated` or `Superseded`.
- Sequential numbering, no gaps.
- English prose only in ADR bodies.
- Keep `docs/ADR/INDEX.md` up to date.
- Stage only the ADR files. Never bundle unrelated changes.
