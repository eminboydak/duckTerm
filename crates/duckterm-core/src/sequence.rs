use serde::{Deserialize, Serialize};

/// How to interpret sequence data bytes.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DataFormat {
    Ascii,
    Hex,
    Decimal,
    Binary,
}

impl Default for DataFormat {
    fn default() -> Self {
        Self::Hex
    }
}

/// A single send or receive sequence.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sequence {
    pub name: String,
    pub data_raw: String,
    pub format: DataFormat,
    /// For receive sequences: what to do when this pattern is detected.
    pub action: Option<SequenceAction>,
}

/// Action triggered when a receive sequence matches.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SequenceAction {
    /// Send another sequence as response.
    Answer { sequence_name: String },
    /// Insert a comment in the terminal/log.
    Comment { text: String },
    /// Stop communication.
    Stop,
    /// Validate checksum in the matched data.
    ValidateChecksum { algorithm: ChecksumAlgorithm },
}

/// Supported checksum algorithms.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ChecksumAlgorithm {
    Mod256,
    Xor,
    Crc8,
    Crc16,
    Crc16Ccitt,
    Crc16Modbus,
    Crc32,
    Lrc,
}

impl ChecksumAlgorithm {
    pub fn label(&self) -> &'static str {
        match self {
            Self::Mod256 => "MOD256",
            Self::Xor => "XOR",
            Self::Crc8 => "CRC-8",
            Self::Crc16 => "CRC-16",
            Self::Crc16Ccitt => "CRC-CCITT",
            Self::Crc16Modbus => "CRC-MODBUS",
            Self::Crc32 => "CRC-32",
            Self::Lrc => "LRC",
        }
    }
}

impl Default for ChecksumAlgorithm {
    fn default() -> Self {
        Self::Crc16Ccitt
    }
}

/// Parse a raw string in the given format into bytes.
pub fn parse_sequence_data(raw: &str, format: &DataFormat) -> Result<Vec<u8>, String> {
    match format {
        DataFormat::Ascii => Ok(raw.as_bytes().to_vec()),
        DataFormat::Hex => {
            let cleaned: String = raw.chars().filter(|c| !c.is_whitespace()).collect();
            if cleaned.len() % 2 != 0 {
                return Err("Hex string must have even length".into());
            }
            (0..cleaned.len())
                .step_by(2)
                .map(|i| u8::from_str_radix(&cleaned[i..i + 2], 16).map_err(|e| e.to_string()))
                .collect()
        }
        DataFormat::Decimal => raw
            .split_whitespace()
            .map(|s| s.parse::<u8>().map_err(|e| e.to_string()))
            .collect(),
        DataFormat::Binary => raw
            .split_whitespace()
            .map(|s| {
                if s.len() != 8 {
                    return Err("Each byte must be 8 bits".into());
                }
                u8::from_str_radix(s, 2).map_err(|e| e.to_string())
            })
            .collect(),
    }
}

/// Check for wildcard matches. Supports '?' (exactly one byte) and '#' (zero or one byte).
pub fn match_wildcard(pattern: &[u8], data: &[u8]) -> bool {
    match_wildcard_inner(pattern, data, 0, 0)
}

fn match_wildcard_inner(pattern: &[u8], data: &[u8], pi: usize, di: usize) -> bool {
    if pi == pattern.len() {
        return di == data.len();
    }

    match pattern[pi] {
        b'?' => {
            // Matches exactly one byte
            if di < data.len() {
                match_wildcard_inner(pattern, data, pi + 1, di + 1)
            } else {
                false
            }
        }
        b'#' => {
            // Matches zero or one byte — try both paths
            if match_wildcard_inner(pattern, data, pi + 1, di) {
                return true;
            }
            if di < data.len() {
                return match_wildcard_inner(pattern, data, pi + 1, di + 1);
            }
            false
        }
        b => {
            // Exact match
            if di < data.len() && data[di] == b {
                match_wildcard_inner(pattern, data, pi + 1, di + 1)
            } else {
                false
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_hex() {
        let data = parse_sequence_data("48 65 6C 6C 6F", &DataFormat::Hex).unwrap();
        assert_eq!(data, b"Hello");
    }

    #[test]
    fn test_parse_hex_no_space() {
        let data = parse_sequence_data("48656C6C6F", &DataFormat::Hex).unwrap();
        assert_eq!(data, b"Hello");
    }

    #[test]
    fn test_parse_ascii() {
        let data = parse_sequence_data("Hello", &DataFormat::Ascii).unwrap();
        assert_eq!(data, b"Hello");
    }

    #[test]
    fn test_parse_decimal() {
        let data = parse_sequence_data("72 101 108 108 111", &DataFormat::Decimal).unwrap();
        assert_eq!(data, b"Hello");
    }

    #[test]
    fn test_parse_binary() {
        let data = parse_sequence_data("01001000 01100101", &DataFormat::Binary).unwrap();
        assert_eq!(data, b"He");
    }

    #[test]
    fn test_wildcard_question_mark() {
        assert!(match_wildcard(b"AT?", b"AT\r"));
        assert!(!match_wildcard(b"AT?", b"AT"));
        assert!(match_wildcard(b"??", b"AB"));
    }

    #[test]
    fn test_wildcard_hash() {
        assert!(match_wildcard(b"AT#", b"AT"));
        assert!(match_wildcard(b"AT#", b"AT\r"));
        assert!(match_wildcard(b"A#B", b"AB"));
        assert!(match_wildcard(b"A#B", b"AxB"));
    }

    #[test]
    fn test_wildcard_exact() {
        assert!(match_wildcard(b"Hello", b"Hello"));
        assert!(!match_wildcard(b"Hello", b"World"));
    }
}
