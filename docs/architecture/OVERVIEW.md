# Architecture Overview

> System diagram and data flow for duckTerm.

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                  duckTerm App                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────┐     ┌─────────────────────┐ │
│  │   Svelte 5    │     │    Rust Backend     │ │
│  │   Frontend    │◄───►│    (Tauri 2.x)      │ │
│  │               │ IPC │                     │ │
│  │  - Terminal   │     │  - Serial Port I/O  │ │
│  │  - Hex View   │     │  - Signal Control   │ │
│  │  - Controls   │     │  - Buffer Mgmt      │ │
│  └───────────────┘     └─────────┬───────────┘ │
│                                  │              │
│                                  ▼              │
│                         ┌────────────────┐      │
│                         │ Serial Port    │      │
│                         │ (USB-UART)     │      │
│                         └────────┬───────┘      │
│                                  │              │
└──────────────────────────────────┼──────────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │ External HW    │
                          │ (Arduino, etc) │
                          └────────────────┘
```

## Data Flow

### Outgoing (TX)
```
User Input → Svelte Store → Tauri IPC invoke → Rust Handler → Serial Port Write → Hardware
```

### Incoming (RX)
```
Hardware → Serial Port Read → Rust Event Emitter → Tauri Events → Svelte Store → Terminal View
```

### Signal Control
```
UI Toggle → Tauri IPC invoke → Rust Handler → Serial Port Control Lines (RTS/DTR)
```

## Key Design Decisions

- Serial data streams via Tauri events (`app.emit()`) from Rust → frontend listener
- Terminal buffer has configurable max size (default 10,000 lines)
- Hex view uses `Uint8Array` manipulation on Rust side, sent as binary events
- Multiple port connections managed via Connection tabs in Svelte store
