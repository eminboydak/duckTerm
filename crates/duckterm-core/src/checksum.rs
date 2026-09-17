use crate::sequence::ChecksumAlgorithm;

/// Calculate checksum for the given data using the specified algorithm.
pub fn calculate_checksum(data: &[u8], algorithm: &ChecksumAlgorithm) -> Vec<u8> {
    match algorithm {
        ChecksumAlgorithm::Mod256 => vec![mod256(data)],
        ChecksumAlgorithm::Xor => vec![xor(data)],
        ChecksumAlgorithm::Crc7 => vec![crc7(data)],
        ChecksumAlgorithm::Crc8 => crc8(data).to_be_bytes()[..1].to_vec(),
        ChecksumAlgorithm::CrcDow => vec![crc_dow(data)],
        ChecksumAlgorithm::Crc16 => crc16(data).to_be_bytes().to_vec(),
        ChecksumAlgorithm::Crc16Ccitt => crc16_ccitt(data).to_be_bytes().to_vec(),
        ChecksumAlgorithm::Crc16Xmodem => crc16_xmodem(data).to_be_bytes().to_vec(),
        ChecksumAlgorithm::Crc16Modbus => crc16_modbus(data).to_be_bytes().to_vec(),
        ChecksumAlgorithm::Crc32 => crc32(data).to_be_bytes().to_vec(),
        ChecksumAlgorithm::Lrc => vec![lrc(data)],
        ChecksumAlgorithm::LrcAscii => {
            let v = lrc(data);
            format!("{:02X}", v).as_bytes().to_vec()
        }
    }
}

/// Verify checksum: data includes the checksum bytes at the end.
pub fn verify_checksum(
    data_with_checksum: &[u8],
    algorithm: &ChecksumAlgorithm,
    checksum_len: usize,
) -> bool {
    if data_with_checksum.len() < checksum_len {
        return false;
    }
    let payload = &data_with_checksum[..data_with_checksum.len() - checksum_len];
    let expected = &data_with_checksum[data_with_checksum.len() - checksum_len..];
    let computed = calculate_checksum(payload, algorithm);
    computed == expected
}

fn mod256(data: &[u8]) -> u8 {
    data.iter().fold(0u8, |acc, &b| acc.wrapping_add(b))
}

fn xor(data: &[u8]) -> u8 {
    data.iter().fold(0u8, |acc, &b| acc ^ b)
}

fn lrc(data: &[u8]) -> u8 {
    (!mod256(data)).wrapping_add(1)
}

fn crc8(data: &[u8]) -> u8 {
    let mut crc: u8 = 0xFF;
    for &byte in data {
        crc ^= byte;
        for _ in 0..8 {
            if crc & 0x80 != 0 {
                crc = (crc << 1) ^ 0x07;
            } else {
                crc <<= 1;
            }
        }
    }
    crc
}

fn crc16(data: &[u8]) -> u16 {
    let mut crc: u16 = 0xFFFF;
    for &byte in data {
        crc ^= (byte as u16) << 8;
        for _ in 0..8 {
            if crc & 0x8000 != 0 {
                crc = (crc << 1) ^ 0x8005;
            } else {
                crc <<= 1;
            }
        }
    }
    crc
}

fn crc16_ccitt(data: &[u8]) -> u16 {
    let mut crc: u16 = 0xFFFF;
    for &byte in data {
        crc ^= (byte as u16) << 8;
        for _ in 0..8 {
            if crc & 0x8000 != 0 {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    crc
}

fn crc16_modbus(data: &[u8]) -> u16 {
    let mut crc: u16 = 0xFFFF;
    for &byte in data {
        crc ^= byte as u16;
        for _ in 0..8 {
            if crc & 1 != 0 {
                crc = (crc >> 1) ^ 0xA001;
            } else {
                crc >>= 1;
            }
        }
    }
    crc
}

fn crc32(data: &[u8]) -> u32 {
    let mut crc: u32 = 0xFFFFFFFF;
    for &byte in data {
        crc ^= byte as u32;
        for _ in 0..8 {
            if crc & 1 != 0 {
                crc = (crc >> 1) ^ 0xEDB88320;
            } else {
                crc >>= 1;
            }
        }
    }
    crc ^ 0xFFFFFFFF
}

fn crc7(data: &[u8]) -> u8 {
    let mut crc: u8 = 0;
    for &byte in data {
        crc ^= byte;
        for _ in 0..8 {
            crc = if crc & 0x80 != 0 { (crc << 1) ^ 0x09 } else { crc << 1 };
            crc &= 0x7F;
        }
    }
    crc
}

fn crc_dow(data: &[u8]) -> u8 {
    let mut crc: u8 = 0;
    for &byte in data {
        crc ^= byte;
        for _ in 0..8 {
            crc = if crc & 1 != 0 { (crc >> 1) ^ 0x8C } else { crc >> 1 };
        }
    }
    crc
}

fn crc16_xmodem(data: &[u8]) -> u16 {
    let mut crc: u16 = 0x0000;
    for &byte in data {
        crc ^= (byte as u16) << 8;
        for _ in 0..8 {
            if crc & 0x8000 != 0 {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    crc
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mod256() {
        assert_eq!(mod256(b"12345"), 255); // 49+50+51+52+53 = 255
    }

    #[test]
    fn test_xor() {
        assert_eq!(xor(b"\x01\x02\x03"), 0x00); // 1^2^3 = 0
    }

    #[test]
    fn test_lrc() {
        // LRC of "12345" = -(sum mod 256)
        let result = lrc(b"12345");
        assert_eq!(result, (0u8.wrapping_sub(mod256(b"12345"))));
    }

    #[test]
    fn test_crc16_modbus_known() {
        // Modbus CRC of "123456789" = 0x4B37 (well-known test vector)
        let result = crc16_modbus(b"123456789");
        assert_eq!(result, 0x4B37);
    }

    #[test]
    fn test_crc16_ccitt_known() {
        // CRC-CCITT (0xFFFF) of "123456789" = 0x29B1
        let result = crc16_ccitt(b"123456789");
        assert_eq!(result, 0x29B1);
    }

    #[test]
    fn test_crc32_known() {
        // CRC-32 of "123456789" = 0xCBF43926
        let result = crc32(b"123456789");
        assert_eq!(result, 0xCBF43926);
    }

    #[test]
    fn test_crc8() {
        // Just verify it doesn't panic and returns a value
        let result = crc8(b"Hello");
        assert_ne!(result, 0);
    }

    #[test]
    fn test_calculate_checksum_mod256() {
        let result = calculate_checksum(b"ABC", &ChecksumAlgorithm::Mod256);
        assert_eq!(result, vec![198]); // 65+66+67 = 198
    }

    #[test]
    fn test_calculate_checksum_crc16_modbus() {
        let result = calculate_checksum(b"123456789", &ChecksumAlgorithm::Crc16Modbus);
        assert_eq!(result, vec![0x4B, 0x37]); // big-endian 0x4B37
    }

    #[test]
    fn test_verify_checksum_ok() {
        let mut data = b"Hello".to_vec();
        let cs = calculate_checksum(&data, &ChecksumAlgorithm::Crc16Ccitt);
        data.extend_from_slice(&cs);
        assert!(verify_checksum(&data, &ChecksumAlgorithm::Crc16Ccitt, 2));
    }

    #[test]
    fn test_verify_checksum_wrong() {
        let mut data = b"Hello".to_vec();
        data.extend_from_slice(&[0xFF, 0xFF]); // wrong checksum
        assert!(!verify_checksum(&data, &ChecksumAlgorithm::Crc16Ccitt, 2));
    }
}
