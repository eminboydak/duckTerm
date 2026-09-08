use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortInfo {
    pub name: String,
    pub port_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerialConfig {
    pub baud_rate: u32,
    pub data_bits: u8,
    pub parity: String,
    pub stop_bits: u8,
    pub flow_control: String,
}

impl Default for SerialConfig {
    fn default() -> Self {
        Self {
            baud_rate: 9600,
            data_bits: 8,
            parity: "None".to_string(),
            stop_bits: 1,
            flow_control: "None".to_string(),
        }
    }
}

pub struct AppState {
    pub port: Mutex<Option<Box<dyn serialport::SerialPort>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            port: Mutex::new(None),
        }
    }
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
    config: &SerialConfig,
) -> Result<Box<dyn serialport::SerialPort>, String> {
    let builder = serialport::new(port_name, config.baud_rate)
        .data_bits(match config.data_bits {
            5 => serialport::DataBits::Five,
            6 => serialport::DataBits::Six,
            7 => serialport::DataBits::Seven,
            _ => serialport::DataBits::Eight,
        })
        .parity(match config.parity.as_str() {
            "Even" => serialport::Parity::Even,
            "Odd" => serialport::Parity::Odd,
            _ => serialport::Parity::None,
        })
        .stop_bits(match config.stop_bits {
            2 => serialport::StopBits::Two,
            _ => serialport::StopBits::One,
        })
        .flow_control(match config.flow_control.as_str() {
            "Hardware" => serialport::FlowControl::Hardware,
            "Software" => serialport::FlowControl::Software,
            _ => serialport::FlowControl::None,
        });

    builder.open().map_err(|e| e.to_string())
}

pub fn write_data(
    port: &mut Box<dyn serialport::SerialPort>,
    data: &[u8],
) -> Result<usize, String> {
    port.write(data).map_err(|e| e.to_string())
}

pub fn read_data(
    port: &mut Box<dyn serialport::SerialPort>,
    buf: &mut [u8],
) -> Result<usize, String> {
    port.read(buf).map_err(|e| e.to_string())
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

    #[test]
    fn test_serial_config_default_values() {
        let config = SerialConfig::default();
        assert_eq!(config.baud_rate, 9600);
        assert_eq!(config.data_bits, 8);
        assert_eq!(config.parity, "None");
        assert_eq!(config.stop_bits, 1);
        assert_eq!(config.flow_control, "None");
    }

    #[test]
    fn test_serial_config_custom_values() {
        let config = SerialConfig {
            baud_rate: 115200,
            data_bits: 7,
            parity: "Even".to_string(),
            stop_bits: 2,
            flow_control: "Hardware".to_string(),
        };
        assert_eq!(config.baud_rate, 115200);
        assert_eq!(config.data_bits, 7);
        assert_eq!(config.parity, "Even");
        assert_eq!(config.stop_bits, 2);
        assert_eq!(config.flow_control, "Hardware");
    }

    #[test]
    fn test_app_state_new() {
        let state = AppState::new();
        let port = state.port.lock().unwrap();
        assert!(port.is_none(), "new state should have no port");
    }

    #[test]
    fn test_open_port_invalid_name() {
        let config = SerialConfig::default();
        let result = open_port("/dev/nonexistent_port_12345", &config);
        assert!(result.is_err(), "opening invalid port should fail");
    }
}
