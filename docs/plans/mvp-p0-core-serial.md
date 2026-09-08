# MVP P0: Core Serial + Hex View

## Status: In Progress

## Date: 2026-09-08

## Scope

All P0 features in a single PR with TDD approach.

### Features

1. Port Discovery — List available serial ports with USB metadata
2. Connect/Disconnect — Full config (baud, data bits, parity, stop bits, flow control)
3. Send Data — Text + Hex + File
4. Receive Data — ASCII view with auto-scroll
5. Connection Status — Visual indicator, byte counter
6. Hex View — ASCII/HEX/Binary toggle (DockLight-style)
7. Signal Control — RTS/DTR toggle, CTS/DSR/RI/CD display

### UI Layout

```
┌─────────────────────────────────────────────────┐
│ ConnectionBar                                    │
│ [Port ▾] [Baud ▾] [Connect] [Disconnect]        │
├──────────────────────────────────────┬──────────┤
│ TerminalView                         │ Sidebar  │
│ [ASCII] [HEX] [Binary]              │ Port info│
│ > TX: Hello World                   │ Signals  │
│ < RX: 48 65 6C 6C 6F               │          │
├──────────────────────────────────────┤          │
│ [Input...] [Send] [HEX] [File]      │          │
├──────────────────────────────────────┴──────────┤
│ StatusBar: ● Connected | TX: 1.2KB | RX: 3.4KB │
└─────────────────────────────────────────────────┘
```

### Tech Decisions

- Buffer: Configurable 1K-100K, default 10K
- Colors: DaisyUI tokens (TX = primary, RX = secondary)
- Hex toggle: ASCII / HEX / Binary buttons
- Test: Rust unit test + loopback

### TDD Workflow

```
RED → GREEN → REFACTOR
1. Write failing test
2. Write minimal code to pass
3. Clean up
```

### Implementation Order

| Step | Feature           | Test                  | Implementation                 |
| ---- | ----------------- | --------------------- | ------------------------------ |
| 1    | Port Discovery    | test_list_ports       | commands/serial.rs             |
| 2    | Serial Open/Close | test_open_close       | commands/serial.rs             |
| 3    | Serial Write/Read | test_write_read       | commands/serial.rs + events.rs |
| 4    | Connection Status | test_connection_state | state.rs                       |
| 5    | Terminal ASCII    | Component test        | TerminalOutput.svelte          |
| 6    | Terminal HEX      | Component test        | hex.ts                         |
| 7    | Input Bar         | Component test        | InputBar.svelte                |
| 8    | Sidebar           | Component test        | Sidebar.svelte                 |
| 9    | CI Pipeline       | workflow test         | .github/workflows/ci.yml       |
| 10   | Release Pipeline  | workflow test         | .github/workflows/release.yml  |

### CI/CD

- CI: Test on push/PR (Rust test + frontend build + lint)
- Release: Build on tag (macOS ARM, macOS Intel, Windows, Linux)
- Artifacts: .dmg, .exe, .AppImage, .deb, .rpm
