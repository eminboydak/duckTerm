pub mod events;

use duckterm_core::serial::{AppState, PortInfo, SerialConfig, SignalState};
use duckterm_core::project::Project;
use std::sync::Arc;

#[tauri::command]
fn list_ports() -> Result<Vec<PortInfo>, String> {
    duckterm_core::serial::list_ports()
}

#[tauri::command]
fn open_port(
    state: tauri::State<'_, Arc<AppState>>,
    port_name: String,
    config: SerialConfig,
) -> Result<(), String> {
    let port = duckterm_core::serial::open_port(&port_name, &config)?;
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
fn write_data(state: tauri::State<'_, Arc<AppState>>, data: Vec<u8>) -> Result<usize, String> {
    let mut p = state.port.lock().unwrap();
    let port = p.as_mut().ok_or("No port open")?;
    duckterm_core::serial::write_data(port, &data)
}

#[tauri::command]
fn get_port_status(state: tauri::State<'_, Arc<AppState>>) -> Result<bool, String> {
    let p = state.port.lock().unwrap();
    Ok(p.is_some())
}

// ── Signal Control ──────────────────────────────────────────────

#[tauri::command]
fn get_signals(state: tauri::State<'_, Arc<AppState>>) -> Result<SignalState, String> {
    let mut p = state.port.lock().unwrap();
    let port = p.as_mut().ok_or("No port open")?;
    let rts = *state.rts.lock().unwrap();
    let dtr = *state.dtr.lock().unwrap();
    duckterm_core::serial::get_signals(port, rts, dtr)
}

#[tauri::command]
fn set_rts(state: tauri::State<'_, Arc<AppState>>, value: bool) -> Result<(), String> {
    let mut p = state.port.lock().unwrap();
    let port = p.as_mut().ok_or("No port open")?;
    duckterm_core::serial::set_rts(port, value)?;
    *state.rts.lock().unwrap() = value;
    Ok(())
}

#[tauri::command]
fn set_dtr(state: tauri::State<'_, Arc<AppState>>, value: bool) -> Result<(), String> {
    let mut p = state.port.lock().unwrap();
    let port = p.as_mut().ok_or("No port open")?;
    duckterm_core::serial::set_dtr(port, value)?;
    *state.dtr.lock().unwrap() = value;
    Ok(())
}

// ── Project Save/Load (.duck) ──────────────────────────────────

#[tauri::command]
fn save_project(path: String, project: Project) -> Result<(), String> {
    let bytes = project.to_file_bytes().map_err(|e| e.to_string())?;
    std::fs::write(&path, bytes).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_project(path: String) -> Result<Project, String> {
    let bytes = std::fs::read(&path).map_err(|e| e.to_string())?;
    Project::from_bytes(&bytes)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_serialport::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(app_state.clone())
        .invoke_handler(tauri::generate_handler![
            list_ports,
            open_port,
            close_port,
            write_data,
            get_port_status,
            get_signals,
            set_rts,
            set_dtr,
            save_project,
            load_project,
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
