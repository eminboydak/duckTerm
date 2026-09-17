// ── Network Bridge ────────────────────────────────────────────
use std::sync::{Arc, Mutex};

pub struct TcpBridgeState {
    bridge: Mutex<Option<duckterm_core::network::TcpBridge>>,
}

impl TcpBridgeState {
    pub fn new() -> Self {
        Self {
            bridge: Mutex::new(None),
        }
    }
}

impl Default for TcpBridgeState {
    fn default() -> Self {
        Self::new()
    }
}

pub struct UdpBridgeState {
    bridge: Mutex<Option<duckterm_core::network::UdpBridge>>,
}

impl UdpBridgeState {
    pub fn new() -> Self {
        Self {
            bridge: Mutex::new(None),
        }
    }
}

impl Default for UdpBridgeState {
    fn default() -> Self {
        Self::new()
    }
}

#[tauri::command]
pub fn tcp_bridge_start(
    state: tauri::State<'_, Arc<TcpBridgeState>>,
    addr: String,
) -> Result<(), String> {
    let mut guard = state.bridge.lock().map_err(|e| e.to_string())?;
    let bridge = duckterm_core::network::TcpBridge::start(&addr, |data| {
        // Forward data to serial port (would need AppState reference)
        Some(data) // echo for now
    })?;
    *guard = Some(bridge);
    Ok(())
}

#[tauri::command]
pub fn tcp_bridge_stop(state: tauri::State<'_, Arc<TcpBridgeState>>) -> Result<(), String> {
    let guard = state.bridge.lock().map_err(|e| e.to_string())?;
    if let Some(bridge) = guard.as_ref() {
        bridge.stop();
    }
    Ok(())
}

#[tauri::command]
pub fn udp_bridge_start(
    state: tauri::State<'_, Arc<UdpBridgeState>>,
    addr: String,
) -> Result<(), String> {
    let mut guard = state.bridge.lock().map_err(|e| e.to_string())?;
    let bridge = duckterm_core::network::UdpBridge::start(&addr, |data, _from| {
        Some(data)
    })?;
    *guard = Some(bridge);
    Ok(())
}

#[tauri::command]
pub fn udp_bridge_stop(state: tauri::State<'_, Arc<UdpBridgeState>>) -> Result<(), String> {
    let guard = state.bridge.lock().map_err(|e| e.to_string())?;
    if let Some(bridge) = guard.as_ref() {
        bridge.stop();
    }
    Ok(())
}
