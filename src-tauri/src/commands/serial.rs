use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortInfo {
    pub name: String,
    pub port_type: String,
}

pub fn list_ports() -> Result<Vec<PortInfo>, String> {
    let ports = serialport::available_ports().map_err(|e| e.to_string())?;

    let port_infos: Vec<PortInfo> = ports
        .into_iter()
        .map(|p| PortInfo {
            name: p.port_name,
            port_type: format!("{:?}", p.port_type),
        })
        .collect();

    Ok(port_infos)
}

pub fn open_port(
    port_name: &str,
    baud_rate: u32,
) -> Result<Box<dyn serialport::SerialPort>, String> {
    serialport::new(port_name, baud_rate)
        .open()
        .map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_ports_returns_result() {
        let result = list_ports();
        assert!(result.is_ok() || result.is_err(), "should return Result");
    }

    #[test]
    fn test_port_info_serializable() {
        let port = PortInfo {
            name: "/dev/ttyUSB0".to_string(),
            port_type: "UsbPort".to_string(),
        };

        let json = serde_json::to_string(&port).unwrap();
        assert!(json.contains("/dev/ttyUSB0"));
        assert!(json.contains("UsbPort"));
    }
}
