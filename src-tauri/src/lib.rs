pub mod commands;
pub mod events;

use std::sync::Arc;
use commands::serial::{AppState, SerialConfig, PortInfo};

#[tauri::command]
fn list_ports() -> Result<Vec<PortInfo>, String> {
    commands::serial::list_ports()
}

#[tauri::command]
fn open_port(
    state: tauri::State<'_, Arc<AppState>>,
    port_name: String,
    config: SerialConfig,
) -> Result<(), String> {
    let port = commands::serial::open_port(&port_name, &config)?;
    let mut p = state.port.lock().unwrap();
    *p = Some(port);
    Ok(())
}

#[tauri::command]
fn close_port(state: tauri::State<'_, Arc<AppState>>) -> Result<(), String> {
    let mut p = state.port.lock().unwrap();
    *p = None;
    Ok(())
}

#[tauri::command]
fn write_data(
    state: tauri::State<'_, Arc<AppState>>,
    data: Vec<u8>,
) -> Result<usize, String> {
    let mut p = state.port.lock().unwrap();
    let port = p.as_mut().ok_or("No port open")?;
    commands::serial::write_data(port, &data)
}

#[tauri::command]
fn get_port_status(state: tauri::State<'_, Arc<AppState>>) -> Result<bool, String> {
    let p = state.port.lock().unwrap();
    Ok(p.is_some())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_serialport::init())
        .manage(app_state.clone())
        .invoke_handler(tauri::generate_handler![
            list_ports,
            open_port,
            close_port,
            write_data,
            get_port_status
        ])
        .setup(move |app| {
            let handle = app.handle().clone();
            let state_for_reader = app_state.clone();
            events::start_reader_thread(state_for_reader, handle);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
