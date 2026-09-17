# Architecture Overview

> System diagram and data flow for duckTerm.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        duckTerm                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────────────────┐   │
│  │  duckterm-core   │◄───┤  duckterm-gui (Tauri 2.x)    │   │
│  │                  │    │                              │   │
│  │  - Serial I/O    │    │  ┌──────────┐ ┌──────────┐  │   │
│  │  - Mock Backend  │    │  │ Preact   │ │ Rust     │  │   │
│  │  - Protocol      │    │  │ Frontend │◄┤ Backend  │  │   │
│  │  - Buffer        │    │  │          │ │          │  │   │
│  │  - Checksum      │    │  └──────────┘ └──────────┘  │   │
│  │                  │    └──────────────────────────────┘   │
│  └────────┬─────────┘                                       │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │  duckterm-tui    │    (ratatui + crossterm + clap)       │
│  │                  │                                       │
│  │  - TUI Layout    │                                       │
│  │  - Keyboard Nav  │                                       │
│  │  - Terminal UI   │                                       │
│  └────────┬─────────┘                                       │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            ▼
   ┌────────────────┐
   │  Serial Port   │
   │  (USB-UART)    │
   └────────┬───────┘
            │
            ▼
   ┌────────────────┐
   │  External HW   │
   │  (Arduino, etc)│
   └────────────────┘
```

## Crate Workspace

```
duckTerm/
├── Cargo.toml                    ← workspace root
├── crates/
│   ├── duckterm-core/            ← shared serial I/O, protocol, buffer
│   │   └── src/
│   │       ├── lib.rs            ← public API
│   │       ├── serial.rs         ← SerialConfig, AppState, open/write/read
│   │       ├── serial_mock.rs    ← MockPort for testing
│   │       ├── protocol.rs       ← LineEnding, bytes_to_hex/ascii/binary
│   │       └── buffer.rs         ← RingBuffer
│   ├── duckterm-gui/             ← Tauri 2.x desktop app
│   │   └── src/
│   │       ├── lib.rs            ← Tauri commands + app runner
│   │       └── events.rs         ← serial reader thread
│   └── duckterm-tui/             ← ratatui terminal app
│       └── src/
│           └── main.rs           ← CLI + TUI layout
├── src/                          ← Preact frontend (GUI)
├── site/                         ← Landing page (DaisyUI)
└── docs/                         ← This documentation
```

## Data Flow

### GUI (duckterm-gui)
```
User Input → Preact Store → Tauri IPC invoke → Rust Handler → Serial Port Write → Hardware
Hardware → Serial Port Read → Rust Event Emitter → Tauri Events → Preact Store → Terminal View
UI Toggle → Tauri IPC invoke → Rust Handler → Serial Port Control Lines (RTS/DTR)
```

### TUI (duckterm-tui)
```
User Input → crossterm Event → App State Update → Serial Port Write → Hardware
Hardware → Serial Port Read → App State Buffer → ratatui Render → Terminal
```

### Shared (duckterm-core)
```
Both editions use:
- serial.rs: SerialConfig, AppState, open_port, write_data, read_data
- serial_mock.rs: MockPort (feature-gated: --features mock)
- protocol.rs: LineEnding, bytes_to_hex, bytes_to_ascii, bytes_to_binary
- buffer.rs: RingBuffer for incoming data
```

## Key Design Decisions

- **Crate workspace:** shared `duckterm-core` avoids code duplication between GUI and TUI
- **Mock feature:** `--features mock` enables MockPort for testing without hardware
- **Serial data streams:** GUI uses Tauri events; TUI uses direct read in main loop
- **Terminal buffer:** configurable max size (default 10,000 lines / 64KB ring buffer)
- **Hex view:** `bytes_to_hex()` in core, rendered by each edition's UI layer
