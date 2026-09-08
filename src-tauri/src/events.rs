use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use crate::commands::serial::AppState;

pub fn start_reader_thread(
    state: Arc<AppState>,
    app: AppHandle,
) -> std::thread::JoinHandle<()> {
    std::thread::spawn(move || {
        let mut buf = [0u8; 1024];
        loop {
            let data = {
                let mut port_guard = state.port.lock().unwrap();
                match port_guard.as_mut() {
                    Some(port) => {
                        match port.read(&mut buf) {
                            Ok(n) if n > 0 => Some(buf[..n].to_vec()),
                            Ok(_) => None,
                            Err(e) => {
                                eprintln!("Serial read error: {}", e);
                                break;
                            }
                        }
                    }
                    None => {
                        std::thread::sleep(Duration::from_millis(10));
                        continue;
                    }
                }
            };

            if let Some(data) = data {
                let _ = app.emit("serial-data-received", data);
            }

            std::thread::sleep(Duration::from_millis(1));
        }
    })
}
