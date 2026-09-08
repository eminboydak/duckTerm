# 0001: Tech Stack Selection (Tauri + Svelte + DaisyUI)

* **Date:** 2026-09-08
* **Status:** Accepted
* **Domain:** Architecture & Governance

## Context

duckTerm needs a cross-platform desktop framework for a serial terminal application. Key requirements:

- Cross-platform: Windows, macOS, Linux (equal priority)
- Small bundle size (targeting <15MB)
- Native serial I/O without Node.js native addon rebuild headaches
- Modern UI with dark theme support
- Active community and maintenance
- MIT license compatible

## Decision

Use the following tech stack:

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Desktop framework | Tauri 2.x | 96% smaller than Electron, Rust backend, native WebView |
| Frontend framework | Svelte 5 | Compile-time, no virtual DOM, tiny bundle, Tauri default |
| Styling | Tailwind CSS v4 | Utility-first, pairs with DaisyUI |
| Component library | DaisyUI v5 | Built-in themes, semantic colors, professional components |
| Font | JetBrains Mono | Monospace, ligatures, clean for terminal/data views |
| Serial communication | tauri-plugin-serialport | Rust-native, built on serialport-rs crate |

## Alternatives Considered

### Electron + React
- Pros: Larger ecosystem, more tutorials, React knowledge widespread
- Cons: 85MB+ bundle, 75% more RAM, Node.js native addon rebuild headaches for serialport
- Rejected: Bundle size and Rust backend benefits outweigh ecosystem advantage

### Flutter Desktop
- Pros: Cross-platform UI, good performance
- Cons: Dart ecosystem smaller for serial I/O, no mature serialport plugin, learning curve
- Rejected: Serial communication ecosystem not mature enough

### Qt (PySide/PyQt)
- Pros: Mature, native performance, excellent serial support
- Cons: Python adds overhead, licensing complexity (GPL/Commercial), larger bundle
- Rejected: Licensing and bundle size concerns

## Consequences

* **Positive:**
  - Bundle size 3-10MB vs 85MB+ (Electron)
  - Rust backend for native serial I/O without addon rebuilds
  - DaisyUI provides professional dark theme out of the box
  - Svelte compile-time approach means minimal runtime overhead
  - tauri-plugin-serialport handles background reader threads and signal control

* **Negative:**
  - Tauri ecosystem smaller than Electron (fewer tutorials, examples)
  - Rust learning curve for backend contributions
  - WebView differences across platforms (WebKitGTK on Linux may have quirks)
  - Serial port permission handling varies by OS (requires platform-specific testing)

## References

- [duckTerm v2 Development Brief](../../duckterm-v2-brief.md)
- [Tauri Documentation](https://v2.tauri.app)
- [DaisyUI Documentation](https://daisyui.com)
- [Svelte Documentation](https://svelte.dev)
