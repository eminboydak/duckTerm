/// Modbus RTU frame builder and parser.
///
/// Modbus RTU frame format:
/// [slave_addr(1)] [function_code(1)] [data(0-253)] [CRC(2)]
///
/// Supported function codes:
/// 0x01 - Read Coils
/// 0x02 - Read Discrete Inputs
/// 0x03 - Read Holding Registers
/// 0x04 - Read Input Registers
/// 0x05 - Write Single Coil
/// 0x06 - Write Single Register
/// 0x0F - Write Multiple Coils
/// 0x10 - Write Multiple Registers

use crate::checksum::calculate_checksum;
use crate::sequence::ChecksumAlgorithm;

/// Modbus function codes
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ModbusFunction {
    ReadCoils,           // 0x01
    ReadDiscreteInputs,  // 0x02
    ReadHoldingRegisters, // 0x03
    ReadInputRegisters,  // 0x04
    WriteSingleCoil,     // 0x05
    WriteSingleRegister, // 0x06
    WriteMultipleCoils,  // 0x0F
    WriteMultipleRegisters, // 0x10
}

impl ModbusFunction {
    pub fn from_u8(code: u8) -> Option<Self> {
        match code {
            0x01 => Some(Self::ReadCoils),
            0x02 => Some(Self::ReadDiscreteInputs),
            0x03 => Some(Self::ReadHoldingRegisters),
            0x04 => Some(Self::ReadInputRegisters),
            0x05 => Some(Self::WriteSingleCoil),
            0x06 => Some(Self::WriteSingleRegister),
            0x0F => Some(Self::WriteMultipleCoils),
            0x10 => Some(Self::WriteMultipleRegisters),
            _ => None,
        }
    }

    pub fn to_u8(self) -> u8 {
        match self {
            Self::ReadCoils => 0x01,
            Self::ReadDiscreteInputs => 0x02,
            Self::ReadHoldingRegisters => 0x03,
            Self::ReadInputRegisters => 0x04,
            Self::WriteSingleCoil => 0x05,
            Self::WriteSingleRegister => 0x06,
            Self::WriteMultipleCoils => 0x0F,
            Self::WriteMultipleRegisters => 0x10,
        }
    }
}

/// Modbus RTU frame
#[derive(Debug, Clone, PartialEq)]
pub struct ModbusFrame {
    pub slave_addr: u8,
    pub function: ModbusFunction,
    pub data: Vec<u8>,
}

impl ModbusFrame {
    /// Build a Read Coils/Inputs/Register frame.
    pub fn read(slave_addr: u8, function: ModbusFunction, start_addr: u16, quantity: u16) -> Self {
        Self {
            slave_addr,
            function,
            data: vec![
                (start_addr >> 8) as u8,
                start_addr as u8,
                (quantity >> 8) as u8,
                quantity as u8,
            ],
        }
    }

    /// Build a Write Single Coil/Register frame.
    pub fn write_single(slave_addr: u8, function: ModbusFunction, addr: u16, value: u16) -> Self {
        Self {
            slave_addr,
            function,
            data: vec![
                (addr >> 8) as u8,
                addr as u8,
                (value >> 8) as u8,
                value as u8,
            ],
        }
    }

    /// Serialize to bytes with CRC.
    pub fn to_bytes(&self) -> Vec<u8> {
        let mut frame = vec![self.slave_addr, self.function.to_u8()];
        frame.extend_from_slice(&self.data);
        let crc = calculate_checksum(&frame, &ChecksumAlgorithm::Crc16Modbus);
        frame.extend_from_slice(&crc);
        frame
    }

    /// Parse a frame from bytes (without CRC validation).
    pub fn from_bytes(bytes: &[u8]) -> Option<Self> {
        if bytes.len() < 4 {
            return None;
        }
        let function = ModbusFunction::from_u8(bytes[1])?;
        let data = bytes[2..bytes.len() - 2].to_vec();
        Some(Self {
            slave_addr: bytes[0],
            function,
            data,
        })
    }

    /// Validate CRC of a received frame.
    pub fn validate_crc(bytes: &[u8]) -> bool {
        if bytes.len() < 4 {
            return false;
        }
        let payload = &bytes[..bytes.len() - 2];
        let expected_crc = calculate_checksum(payload, &ChecksumAlgorithm::Crc16Modbus);
        let actual_crc = &bytes[bytes.len() - 2..];
        expected_crc[0] == actual_crc[0] && expected_crc[1] == actual_crc[1]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_holding_registers() {
        let frame = ModbusFrame::read(0x01, ModbusFunction::ReadHoldingRegisters, 0x0000, 0x000A);
        let bytes = frame.to_bytes();
        assert_eq!(bytes[0], 0x01); // slave
        assert_eq!(bytes[1], 0x03); // function
        assert_eq!(bytes[2], 0x00); // start addr high
        assert_eq!(bytes[3], 0x00); // start addr low
        assert_eq!(bytes[4], 0x00); // quantity high
        assert_eq!(bytes[5], 0x0A); // quantity low
        assert_eq!(bytes.len(), 8); // 6 data + 2 CRC
    }

    #[test]
    fn test_write_single_register() {
        let frame = ModbusFrame::write_single(0x02, ModbusFunction::WriteSingleRegister, 0x0100, 0x00FF);
        let bytes = frame.to_bytes();
        assert_eq!(bytes[0], 0x02);
        assert_eq!(bytes[1], 0x06);
        assert_eq!(bytes[2], 0x01);
        assert_eq!(bytes[3], 0x00);
        assert_eq!(bytes[4], 0x00);
        assert_eq!(bytes[5], 0xFF);
    }

    #[test]
    fn test_parse_frame() {
        let frame = ModbusFrame::read(0x01, ModbusFunction::ReadCoils, 0x0000, 0x0010);
        let bytes = frame.to_bytes();
        let parsed = ModbusFrame::from_bytes(&bytes).unwrap();
        assert_eq!(parsed.slave_addr, 0x01);
        assert_eq!(parsed.function, ModbusFunction::ReadCoils);
        assert_eq!(parsed.data, vec![0x00, 0x00, 0x00, 0x10]);
    }

    #[test]
    fn test_validate_crc() {
        let frame = ModbusFrame::read(0x01, ModbusFunction::ReadHoldingRegisters, 0x0000, 0x000A);
        let bytes = frame.to_bytes();
        assert!(ModbusFrame::validate_crc(&bytes));
    }

    #[test]
    fn test_invalid_crc() {
        let frame = ModbusFrame::read(0x01, ModbusFunction::ReadHoldingRegisters, 0x0000, 0x000A);
        let mut bytes = frame.to_bytes();
        bytes[6] ^= 0xFF; // corrupt CRC
        assert!(!ModbusFrame::validate_crc(&bytes));
    }

    #[test]
    fn test_function_code_roundtrip() {
        for code in 0x01..=0x10 {
            if let Some(f) = ModbusFunction::from_u8(code) {
                assert_eq!(f.to_u8(), code);
            }
        }
    }
}
