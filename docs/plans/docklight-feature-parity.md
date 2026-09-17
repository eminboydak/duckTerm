# duckTerm Feature Plan — DockLight Parity Roadmap

> DockLight referans araştırmasına dayalı kapsamlı özellik haritası.
> Hedef: DockLight'ın tüm temel özelliklerini iki edition'da (GUI + TUI) sunmak.

## Öncelik Sistemi

- **P0 (MVP):** İlk release'de olmalı — temel serial terminal işlevselliği
- **P1 (v1.0):** Tam ürün deneyimi için gerekli
- **P2 (v1.x):** İleri düzey / niş özellikler

---

## P0 — MVP (Şu anki durum + acil eksikler)

### Zaten Mevcut ✅
- [x] Port Discovery — port listesi, USB metadata
- [x] Connect/Disconnect — baud, data bits, parity, stop bits, flow control
- [x] Send Data — Text + Hex modu
- [x] Receive Data — ASCII view, auto-scroll
- [x] Connection Status — StatusBar, TX/RX byte sayaçları
- [x] Hex/Binary/ASCII Toggle — view mode switching
- [x] Mock backend — test için sahte port

### Eklenmesi Gereken (P0)
- [ ] **Line Ending seçeneği** — None/LF/CR/CRLF (core'da `LineEnding` zaten hazır)
- [ ] **Timestamp toggle** — store'da var, UI'a bağlanacak
- [ ] **Signal Control (gerçek)** — RTS/DTR toggle, CTS/DSR/RI/CD izleme (Sidebar placeholder'ları gerçek API'ye bağlanacak)
- [ ] **Clear Terminal** — buton var ama terminal.clear() chưa bağlandı
- [ ] **Connection bar parity bits** — data bits display (8N1 formatında)

---

## P1 — v1.0 (Tam Ürün)

### Data Display & Representation
- [ ] **Kanal Renklendirme** — TX (primary), RX (secondary) renk ayrımı
- [ ] **Control Character Display** — ASCII < 32 için metin karşılığı gösterme (↵, ↩, ·)
- [ ] **Formatted Text Output** — zengin metin gösterimi (renk, font)
- [ ] **Plain Text Mode** — yüksek performans, renksiz mod
- [ ] **Communication Filter** —ham veriyi gizle, sadece eşleşen receive sequence'leri göster

### Data Sending & Sequences
- [ ] **Send Sequences** — kullanıcının tanımladığı veri dizilerini kaydetme ve gönderme
- [ ] **Send Sequence Wildcards** — `?` (tek karakter), `#` (sıfır veya bir karakter) placeholder'ları
- [ ] **Automatic Checksum** — gönderimde otomatik checksum hesaplama:
  - MOD256, XOR, CRC-7, CRC-8, CRC-DOW
  - MOD65536, CRC-CCITT, CRC-XMODEM, CRC-16, CRC-MODBUS, CRC-32
  - LRC, LRC-ASCII, generic CRC (width, polynomial, init, finalXOR, reflected)
- [ ] **Inter-Character Delays** — karakterler arası gecikme (0.01-2.55s, `&` + F9)
- [ ] **Break State Transmission** — TX hattında sürekli space durumu gönderme
- [ ] **Handshake Signal in Sequence** — Send Sequence içinde RTS/DTR değiştirme (`!` + F11)

### Data Receiving & Sequences
- [ ] **Receive Sequences** — gelen veride desen tanıma
- [ ] **Receive Wildcards** — değişken parçalar için `?` ve `#`
- [ ] **Receive Action: Answer** — eşleşme sonrası otomatik Send Sequence gönderme
- [ ] **Receive Action: Comment** — iletişim penceresine yorum ekleme
- [ ] **Receive Action: Trigger (Snapshot)** — tetikleme olayı前后 veri yakalama
- [ ] **Receive Action: Stop** — eşleşme sonrası iletişimi durdurma
- [ ] **Receive Action: Checksum Validation** — otomatik checksum doğrulama
- [ ] **Handshake Signal Detection** — CTS/DSR/DCD/RI durum değişikliği algılama
- [ ] **Break State Detection** — RX hattında Break state algılama

### Logging & Export
- [ ] **Plain Text Logging** — hızlı, büyük miktarda veri
- [ ] **HTML Logging** — stil Sahipli, renkli log
- [ ] **Binary Data Logging** — NUL bytes ve control characters dahil
- [ ] **Log Start/Stop Controls** — F2/F3 tuşları veya toolbar
- [ ] **Clipboard Operations** — Copy/Paste (Ctrl+C/V)
- [ ] **Project Save/Load** — .duckterm proje dosyası (sequences, settings, documentation)

### Protocol Analysis
- [ ] **Snapshot/Trigger Capture** — tetikleme sonrası veri yakalama
- [ ] **Find in Terminal** — Ctrl+F ile arama (ASCII/HEX/Decimal/Binary)

### User Interface
- [ ] **Multi-Tab** — eş zamanlı çoklu port bağlantısı
- [ ] **Keyboard Shortcuts** — F5 Start, F6 Stop, F2/F3 Logging, Ctrl+F Find
- [ ] **Keyboard Console** — doğrudan klavye girişi (Ctrl+F5)

---

## P2 — v1.x (İleri Düzey)

### Network & Extended Interfaces
- [ ] **TCP Client Mode** — uzak sunucuya TCP bağlantısı
- [ ] **TCP Server Mode** — yerel portta TCP bağlantısı kabulü
- [ ] **UDP Peer Mode** — datagram iletişimi
- [ ] **USB HID Support** — USB HID Custom Class cihazlara erişim
- [ ] **Named Pipes** — süreçler arası iletişim
- [ ] **Bluetooth SPP** — Bluetooth Serial Port Profile

### Scripting & Automation
- [ ] **Scripting Engine** — Rust embedded scripting (Rhai veya Lua) veya WASM
- [ ] **DL Object API eşdeğeri** — programlanabilir arayüz:
  - SendSequence, WaitForSequence, Start/StopCommunication
  - CalcChecksum, GetHandshakeSignals, SetHandshakeSignals
  - InputBox, AddComment, ClearCommWindows
- [ ] **OnSend/OnReceive Event Hooks** — gönderme/alma olaylarında callback
- [ ] **FileInput/FileOutput** — script'lerden dosya okuma/yazma
- [ ] **Side Channels** — çoklu veri bağlantısı
- [ ] **Command Line Execution** — otomatik script başlatma

### Advanced Features
- [ ] **9-bit Protocol Support** — parity switching (MDB multidrop bus)
- [ ] **COBS Encoding/Decoding** — COBS encoder/decoder
- [ ] **Modbus RTU Support** — built-in CRC + frame decoding
- [ ] **Monitoring Mode (Full Duplex)** — iki cihaz arasındaki iletişimi izleme
- [ ] **Docklight Tap Hardware** — donanım tabanlı izleme (low-level)
- [ ] **Real-time Filtering** — çalışma sırasında veri filtreleme
- [ ] **CSV Test Runner** — CSV tabanlı test çalıştırma + pass/fail raporlama

### Performance & Timing
- [ ] **High-Resolution Timing** — milisaniye hassasiyetinde zaman damgası
- [ ] **Input Buffer Overflow Prevention** — tampon taşma önleme ayarları
- [ ] **Performance Optimization** — yüksek hızlı veri akışı için optimizasyon

### Data Visualization
- [ ] **Real-Time Data Plot** — gelen sayısal verilerin canlı grafik gösterimi
- [ ] **Data Recording** — veri kaydı ve geri oynatma

---

## Mimari Notlar

### duckterm-core'e eklenmesi gerekenler
- `sequence.rs` — Send/Receive Sequence modelleri, wildcard matching
- `checksum.rs` — CRC/MOD/LRC hesaplama (tüm varyantlar)
- `protocol.rs` — mevcut LineEnding'e ek olarak COBS, Modbus frame
- `logging.rs` — plain text ve HTML log yazıcı

### duckterm-gui'e eklenmesi gerekenler
- Sequence Editor dialog'u
- Checksum Calculator paneli
- Signal Control paneli (gerçek RTS/DTR/CTS/DSR)
- Multi-Tab desteği
- Log viewer/export

### duckterm-tui'ye eklenmesi gerekenler
- Same core features, keyboard-driven UI
- Tab switching, sequence triggers
- Inline signal display

---

## Kaynaklar

- DockLight resmi site: docklight.de
- DockLight VBScript API referansı
- `serialport` crate docs: docs.rs/serialport
- ratatui docs: ratatui.rs
