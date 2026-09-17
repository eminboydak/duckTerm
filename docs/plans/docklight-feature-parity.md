# duckTerm Feature Plan — DockLight Parity Roadmap

> DockLight referans araştırmasına dayalı kapsamlı özellik haritası.
> Hedef: DockLight'ın tüm temel özelliklerini iki edition'da (GUI + TUI) sunmak.

## Öncelik Sistemi

- **P0 (MVP):** İlk release'de olmalı — temel serial terminal işlevselliği
- **P1 (v1.0):** Tam ürün deneyimi için gerekli
- **P2 (v1.x):** İleri düzey / niş özellikler

---

## P0 — MVP ✅ TAMAM

- [x] Port Discovery — port listesi, USB metadata
- [x] Connect/Disconnect — baud, data bits, parity, stop bits, flow control
- [x] Send Data — Text + Hex modu
- [x] Receive Data — ASCII view, auto-scroll
- [x] Connection Status — StatusBar, TX/RX byte sayaçları
- [x] Hex/Binary/ASCII Toggle — view mode switching
- [x] Mock backend — test için sahte port (20 test)
- [x] Line Ending — None/LF/CR/CRLF seçimi
- [x] Timestamp toggle — settings'den kontrol
- [x] Signal Control — RTS/DTR toggle, CTS/DSR/RI/CD izleme (500ms polling)
- [x] Clear Terminal — buton bağlı

---

## P1 — v1.0 🔄

### Data Display & Representation
- [x] Kanal Renklendirme — TX (primary), RX (secondary)
- [x] Control Character Display — ↵, ↩, ·
- [x] Communication Filter — regex terminal filtresi

### Data Sending & Sequences
- [x] Send Sequences — kaydedilebilir veri dizileri, tıkla ile gönder
- [x] Receive Sequences — desen tanıma listesi
- [x] Sequence Editor UI — Sidebar panel + dialog
- [x] Checksum Calculator — MOD256, XOR, CRC-8/16/CCITT/MODBUS/32, LRC
- [x] Automatic Checksum in Sequence — XOR/CRC8/CRC16/CRC16MODBUS/LRC
- [x] Inter-Character Delays — sequence başına delay

### Data Receiving & Sequences
- [x] Receive Actions (Answer, Comment, Stop, Checksum Validation)
- [x] Wildcard Matching UI (core hazır)
- [x] Handshake Signal Detection — rise/fall/change rules
- [x] Break State Detection — inter-byte gap detector

### Project Management
- [x] Project Save/Load — `.duck` formatı, native dialog
- [x] Multi-Tab — çoklu port bağlantısı
- [x] Connection Profiles — kaydedilebilir port ayarları

### Logging & Export
- [x] HTML Logging — renkli log dosyası
- [x] Plain Text Logging — TXT export
- [x] Binary Log Export — ham RX bytes
- [x] Clipboard Operations — Ctrl+C/V/Shift+C

### UI
- [x] DaisyUI Theme Picker — 25 tema
- [x] TR/EN i18n — 65+ çeviri
- [x] Find in Terminal — Ctrl+F
- [x] Keyboard Shortcuts — F1-F8, 11 kısayol
- [x] Timestamp Format — Time/ISO/Relative
- [x] Auto Port Refresh — 5sn interval
- [x] Send History — ↑/↓ ok tuşları
- [x] Terminal Pause — F8
- [x] Hex Dump View — offset + ASCII
- [x] Live Data Rate — StatusBar B/s
- [x] Data Plot — canvas chart
- [x] Break State — 250ms break pulse
- [x] Send File — dosya gönderme

---

## P2 — v1.x

### Network
- [ ] TCP Client/Server, UDP, USB HID, Named Pipes, Bluetooth SPP

### Scripting
- [ ] Scripting Engine (Rhai/Lua), Event Hooks, File I/O, Side Channels

### Advanced
- [ ] 9-bit Protocol, COBS, Modbus RTU, Monitoring Mode, CSV Test Runner

### Performance
- [ ] High-Resolution Timing, Buffer Overflow Prevention

### Visualization
- [ ] Real-Time Data Plot, Data Recording

### MCP Server
- [ ] AI-Powered Serial — list_ports, send_data, read_data, wait_for_sequence, send_receive

---

## Mimari

### duckterm-core modülleri (tamamlandı ✅)
- `serial.rs` — SerialConfig, AppState, open/write/read, signal control
- `serial_mock.rs` — MockPort (feature-gated)
- `protocol.rs` — LineEnding, bytes_to_hex/ascii/binary
- `buffer.rs` — RingBuffer
- `sequence.rs` — Sequence, DataFormat, wildcard matching
- `checksum.rs` — MOD256, XOR, CRC-8/16/CCITT/MODBUS/32, LRC
- `project.rs` — .duck project save/load (JSON)

### GUI Component'leri (tamamlandı ✅)
- App, TabBar, ConnectionBar, TerminalView, TerminalOutput
- InputBar, Sidebar, StatusBar
- SettingsDialog, SequenceEditorDialog, SequencePanel
- ChecksumCalculator

---

## Kaynaklar

- DockLight: docklight.de
- serialport crate: docs.rs/serialport
- ratatui: ratatui.rs
