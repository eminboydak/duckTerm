# 🦆 duckTerm

> Free, open-source, cross-platform serial terminal for embedded engineers.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC131?logo=tauri&logoColor=black)](https://v2.tauri.app)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-5-5A0EF8)](https://daisyui.com)
[![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20Linux-blue)](<>)

---

## Features

| Feature                  | Description                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Serial Communication** | Connect to any serial port with full configuration (baud rate, data bits, parity, stop bits, flow control) |
| **Hex & ASCII Views**    | Toggle between hex dump and ASCII terminal, or view both side by side                                      |
| **Multi-Tab**            | Open multiple port connections simultaneously                                                              |
| **Real-Time Data Plot**  | Visualize incoming numeric data as live charts                                                             |
| **Quick Macros**         | Save and trigger frequently-used commands                                                                  |
| **Signal Control**       | Toggle RTS/DTR, monitor CTS/DSR/RI/CD states                                                               |
| **Light & Dark Themes**  | Built-in business (dark) and wireframe (light) themes                                                      |

## Quick Start

```bash
# Clone
git clone https://github.com/eminboydak/duckTerm.git
cd duckTerm

# Install
pnpm install

# Run
pnpm tauri dev
```

## Tech Stack

| Layer    | Technology                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Desktop  | [Tauri 2.x](https://v2.tauri.app) — Rust backend, native WebView                                       |
| Frontend | [Svelte 5](https://svelte.dev) — compile-time, no virtual DOM                                          |
| Styling  | [Tailwind CSS v4](https://tailwindcss.com) + [DaisyUI v5](https://daisyui.com)                         |
| Serial   | [tauri-plugin-serialport](https://github.com/nicegui-dev/tauri-plugin-serialport)                      |
| Font     | [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (terminal) · [Inter](https://rsms.me/inter/) (UI) |

## Project Structure

```
duckTerm/
├── src-tauri/           # Rust backend (Tauri)
│   ├── src/             # Serial I/O, IPC commands
│   ├── capabilities/    # Permission definitions
│   └── icons/           # App icons
├── src/                 # Svelte frontend
│   ├── lib/             # Components & stores
│   └── assets/          # Static assets
├── docs/                # Documentation
│   ├── decisions/       # ADRs (DT-XXXX)
│   ├── specs/           # Technical specifications
│   └── architecture/    # System diagrams
├── AGENTS.md            # AI agent guidelines
└── opencode.json        # OpenCode configuration
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) © [Emin Boydak](https://github.com/eminboydak)
