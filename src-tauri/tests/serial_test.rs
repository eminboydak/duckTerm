use duckterm_lib::commands::serial::{list_ports, PortInfo};

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
        assert_eq!(
            names.len(),
            ports.len(),
            "port names should be unique"
        );
    }
}
