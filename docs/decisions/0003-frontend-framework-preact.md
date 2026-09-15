# 0003: Frontend Framework — Preact + Signals

* **Date:** 2026-09-15
* **Status:** Accepted
* **Domain:** Architecture & Governance
* **Amends:** 0001 (frontend-framework row only; Tauri shell decision unchanged)

## Context

ADR-0001 selected Svelte 5 with a single-line rationale
("compile-time, tiny bundle, Tauri default") and never evaluated it against
other frontends. The project's goals have sharpened since: the maintainer
ships Preact daily (Stancona, AEB), the app must render high-frequency
serial streams, and the repo targets an embedded-engineer community.
The frontend choice deserves its own decision.

Tauri itself is frontend-agnostic: it ships maintained templates for
Vanilla, Vue, Svelte, React, Solid, Angular and Preact, recommending only
Vanilla for undecided beginners and Vite as the build tool. No conflict
either way.

## Decision

Use **Preact 10 + @preact/signals + Vite** for the duckTerm frontend.
DaisyUI v5 (CSS-only) and Tailwind v4 carry over unchanged.

| Criterion | Vanilla | Svelte 5 | Preact | React |
|---|---|---|---|---|
| Maintainer fluency | DOM plumbing | readable, not daily | daily driver | fluent-adjacent |
| Terminal render perf | full control | fine-grained | Signals close the gap | needs virtualization care |
| xterm.js path (P2) | manual | manual wrapper | via preact/compat | ready binding |
| Stancona/AEB synergy | none | none | 1:1 component carryover | close but not 1:1 |
| Agent output velocity | verbose, bug-prone | terse | strong (React-adjacent data) | strong |
| Embedded-contributor readability | degrades at scale | best | good | JSX+hooks curve |

Vanilla is rejected: Tauri recommends it for starters, but a growing app
(tabs, plots, macros, themes) needs owned state management — hand-rolled
stores punish the maintainer, agents, and contributors alike. The hot path
(terminal list) stays isolatable (virtualized list/canvas) inside any
framework.

Svelte is rejected on maintainer-velocity grounds: the project's binding
constraint is maintainer time, not contributor onboarding (most community
input arrives as issues/feature requests). One shared mental model across
duckTerm, Stancona and AEB outweighs Svelte's readability edge.

## Consequences

* **Positive:** fastest maintainer loop; component/pattern reuse with
  Stancona/AEB; React-ecosystem escape hatches via preact/compat;
  official Tauri template.
* **Negative:** one-time Svelte→Preact port of the P0 skeleton;
  embedded contributors face JSX instead of Svelte templates;
  full xterm.js emulation still needs integration work when P2 lands.
* **Neutral:** bundle size unchanged in practice (Tauri uses the OS
  WebView — 0001's "tiny bundle" rationale is corrected, not load-bearing).

## References

* [0001](0001-tech-stack-selection.md) — shell decision (unchanged)
* [Tauri create-project](https://v2.tauri.app/start/create-project/) — agnostic stance, maintained templates
* [Tauri frontend config](https://v2.tauri.app/start/frontend/) — Vite recommended
