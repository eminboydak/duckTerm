---
name: test-hardware
description: Use when testing serial communication with real hardware (Arduino, ESP32, USB-UART adapter). Guides loopback test, port discovery verification, signal line testing. Triggers on hardware test, serial test, loopback, Arduino, ESP32.
---

# Hardware Test Procedures

Standard procedures for testing serial communication with real hardware.

## Loopback Test

The most basic serial test — connect TX to RX on the same port.

### Setup
1. Connect a USB-UART adapter or use Arduino's built-in serial
2. Physically connect TX pin to RX pin (loopback)
3. Open duckTerm, select the port, set baud rate (try 9600 first)

### Test Steps
1. Send any ASCII text
2. Verify the same text appears in the receive window
3. Send hex bytes: `0x48 0x65 0x6C 0x6C 0x6F` (should display "Hello")
4. Test different baud rates: 9600, 19200, 38400, 57600, 115200
5. Test with line endings: `\r\n`, `\n`, none

### Expected Results
- Sent data echoes back exactly
- No garbled characters at correct baud rate
- Garbled characters at wrong baud rate (expected)

## Port Discovery Test

Verify duckTerm can find available serial ports.

1. Connect a USB-UART adapter
2. Run duckTerm
3. Check that the port appears in the dropdown
4. Disconnect — port should disappear
5. Reconnect — port should reappear

## Signal Line Test

Test RTS/DTR control and CTS/DSR/RI/CD reading.

1. Open a connection
2. Toggle RTS checkbox — measure voltage on RTS pin (should go high/low)
3. Toggle DTR checkbox — measure voltage on DTR pin
4. Connect CTS to RTS on the adapter — toggle RTS, verify CTS state changes

## Common Issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| No data received | Wrong baud rate | Match sender/receiver rates |
| Garbled text | Baud rate mismatch | Ensure both sides use same rate |
| Port not found | Permission issue | Add user to `dialout` group (Linux) |
| Permission denied | Port in use | Close other terminal apps |
