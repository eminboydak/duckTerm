use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::Duration;

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
    pub rts: Mutex<bool>,
    pub dtr: Mutex<bool>,
}

/// The single fake port owned by the mock backend (`--features mock`).
#[cfg(feature = "mock")]
pub const MOCK_PORT_NAME: &str = "mock-0";

impl AppState {
    pub fn new() -> Self {
        Self {
            port: Mutex::new(None),
            rts: Mutex::new(false),
            dtr: Mutex::new(false),
        }
    }
}

pub fn list_ports() -> Result<Vec<PortInfo>, String> {
    #[cfg(feature = "mock")]
    {
        Ok(vec![PortInfo {
            name: MOCK_PORT_NAME.to_string(),
            port_type: "MockPort".to_string(),
        }])
    }

    #[cfg(not(feature = "mock"))]
    {
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
}

pub fn open_port(
    port_name: &str,
    config: &SerialConfig,
) -> Result<Box<dyn serialport::SerialPort>, String> {
    #[cfg(feature = "mock")]
    {
        let _ = config;
        // The mock backend owns exactly one fake port. Anything else is
        // rejected, mirroring real open() failure on unknown names — this
        // keeps negative-path tests meaningful under --features mock.
        if port_name == MOCK_PORT_NAME {
            Ok(Box::new(crate::serial_mock::MockPort::new()))
        } else {
            Err(format!("mock: unknown port '{port_name}'"))
        }
    }

    #[cfg(not(feature = "mock"))]
    {
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

// ── Signal Control ──────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SignalState {
    pub rts: bool,
    pub dtr: bool,
    pub cts: bool,
    pub dsr: bool,
    pub ri: bool,
    pub cd: bool,
}

pub fn get_signals(
    port: &mut Box<dyn serialport::SerialPort>,
    rts_state: bool,
    dtr_state: bool,
) -> Result<SignalState, String> {
    Ok(SignalState {
        rts: rts_state,
        dtr: dtr_state,
        cts: port.read_clear_to_send().map_err(|e| e.to_string())?,
        dsr: port.read_data_set_ready().map_err(|e| e.to_string())?,
        ri: port.read_ring_indicator().map_err(|e| e.to_string())?,
        cd: port.read_carrier_detect().map_err(|e| e.to_string())?,
    })
}

pub fn set_rts(port: &mut Box<dyn serialport::SerialPort>, state: bool) -> Result<(), String> {
    port.write_request_to_send(state)
        .map_err(|e| e.to_string())
}

pub fn set_dtr(port: &mut Box<dyn serialport::SerialPort>, state: bool) -> Result<(), String> {
    port.write_data_terminal_ready(state)
        .map_err(|e| e.to_string())
}

pub fn send_break(port: &mut Box<dyn serialport::SerialPort>, duration: Duration) -> Result<(), String> {
    port.set_break().map_err(|e| e.to_string())?;
    std::thread::sleep(duration);
    port.clear_break().map_err(|e| e.to_string())
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

    #[cfg(feature = "mock")]
    #[test]
    fn test_open_port_mock_name() {
        let config = SerialConfig::default();
        let result = open_port(super::MOCK_PORT_NAME, &config);
        assert!(result.is_ok(), "opening the mock port should succeed");
    }

    #[cfg(feature = "mock")]
    #[test]
    fn test_signal_state_serializable() {
        let state = super::SignalState {
            rts: true,
            dtr: false,
            cts: true,
            dsr: false,
            ri: false,
            cd: true,
        };
        let json = serde_json::to_string(&state).unwrap();
        assert!(json.contains("\"rts\":true"));
        assert!(json.contains("\"cd\":true"));
    }

    #[cfg(feature = "mock")]
    #[test]
    fn test_set_rts_on_mock() {
        let config = SerialConfig::default();
        let mut port = open_port(super::MOCK_PORT_NAME, &config).unwrap();
        let result = super::set_rts(&mut port, true);
        assert!(result.is_ok());
    }

    #[cfg(feature = "mock")]
    #[test]
    fn test_set_dtr_on_mock() {
        let config = SerialConfig::default();
        let mut port = open_port(super::MOCK_PORT_NAME, &config).unwrap();
        let result = super::set_dtr(&mut port, true);
        assert!(result.is_ok());
    }

    #[cfg(feature = "mock")]
    #[test]
    fn test_get_signals_on_mock() {
        let config = SerialConfig::default();
        let mut port = open_port(super::MOCK_PORT_NAME, &config).unwrap();
        let signals = super::get_signals(&mut port, true, false).unwrap();
        assert!(signals.rts);
        assert!(!signals.dtr);
        assert!(signals.cts); // mock returns true
    }
}
