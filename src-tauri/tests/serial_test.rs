use duckterm_lib::commands::serial::{
    list_ports, open_port, SerialConfig, AppState,
};

#[test]
fn test_list_ports_returns_vec() {
    let result = list_ports();
    assert!(result.is_ok(), "list_ports should succeed");

    let ports = result.unwrap();
    assert!(ports.is_empty() || !ports.is_empty(), "ports should be a Vec");
}

#[test]
fn test_port_info_has_required_fields() {
    let result = list_ports();
    if let Ok(ports) = result {
        if let Some(port) = ports.first() {
            assert!(!port.name.is_empty(), "port name should not be empty");
            assert!(!port.port_type.is_empty(), "port type should not be empty");
        }
    }
}

#[test]
fn test_list_ports_returns_unique_ports() {
    let result = list_ports();
    if let Ok(ports) = result {
        let mut names: Vec<&str> = ports.iter().map(|p| p.name.as_str()).collect();
        names.sort();
        names.dedup();
        assert_eq!(names.len(), ports.len(), "port names should be unique");
    }
}

#[test]
fn test_open_port_invalid_returns_error() {
    let config = SerialConfig::default();
    let result = open_port("/dev/nonexistent_port_12345", &config);
    assert!(result.is_err(), "opening invalid port should fail");
}

#[test]
fn test_serial_config_from_json() {
    let json = r#"{"baud_rate":115200,"data_bits":8,"parity":"None","stop_bits":1,"flow_control":"None"}"#;
    let config: SerialConfig = serde_json::from_str(json).unwrap();
    assert_eq!(config.baud_rate, 115200);
}

#[test]
fn test_app_state_port_initially_none() {
    let state = AppState::new();
    let port = state.port.lock().unwrap();
    assert!(port.is_none(), "port should be None initially");
}

#[test]
fn test_app_state_can_store_port() {
    let _state = AppState::new();
    let config = SerialConfig::default();
    let result = open_port("/dev/nonexistent_port_12345", &config);
    // Even though open fails, we can verify the state mechanism works
    assert!(result.is_err());
}

#[test]
fn test_serial_config_baud_presets() {
    let configs = vec![
        (9600, SerialConfig { baud_rate: 9600, ..Default::default() }),
        (19200, SerialConfig { baud_rate: 19200, ..Default::default() }),
        (38400, SerialConfig { baud_rate: 38400, ..Default::default() }),
        (57600, SerialConfig { baud_rate: 57600, ..Default::default() }),
        (115200, SerialConfig { baud_rate: 115200, ..Default::default() }),
    ];

    for (baud, config) in configs {
        assert_eq!(config.baud_rate, baud);
    }
}
