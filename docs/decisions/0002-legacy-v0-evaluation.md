# 0002: Legacy v0 Evaluation and Fresh Start

* **Date:** 2026-09-08
* **Status:** Accepted
* **Domain:** Architecture & Governance

## Context

The original duckTerm repository contained a v0 prototype built with Electron + React + Tailwind CSS. This prototype was developed over approximately one month (September-October 2024) with 26 commits before being abandoned.

### What was built (v0)
- Electron + React + Tailwind CSS scaffold
- Basic UI components: IconMenu, PopUpMenu, Tab, StatusBar, MainSection
- Serial port listing backend (works via `serialport` npm package)
- Communication settings tab (UI only, not connected to backend)
- Catppuccin Mocha theme
- v2 development brief document

### What was NOT built
- Actual serial connection (open/read/write/close)
- Terminal output area / data display
- Hex view, data visualization
- Connection state management
- Multiple port tabs / window management
- Any real serial terminal functionality

## Decision

Archive the v0 prototype on the `legacy/v0` branch and start fresh with Tauri 2.x + Svelte 5 + DaisyUI v5 stack.

### Reasons for fresh start
1. **Wrong framework choice**: Electron's bundle size (85MB+) and Node.js native addon rebuild issues made it unsuitable for a serial terminal app
2. **No functional code**: The v0 prototype had no working serial communication — only port listing
3. **React overhead**: Virtual DOM unnecessary for a terminal-like UI with high-frequency updates
4. **Tauri advantages**: 96% smaller bundle, Rust backend for native serial I/O, better performance profile

### What we kept from v0
- Project vision and goals (from brief document)
- MIT license
- Git history (preserved on legacy/v0 branch)

## Consequences

* **Positive:**
  - Clean slate with better-matched technology choices
  - No technical debt from abandoned prototype
  - Brief document provides clear direction for v2
  - Git history preserved for reference

* **Negative:**
  - Time invested in v0 is lost (approximately 1 month)
  - Some UI concepts from v0 may need to be reimagined

## References

- [duckTerm v2 Development Brief](../../duckterm-v2-brief.md)
- Legacy v0 branch: `legacy/v0` (archived)
