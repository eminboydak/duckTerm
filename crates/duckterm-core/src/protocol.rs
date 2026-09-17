use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LineEnding {
    None,
    LF,
    CR,
    CRLF,
}

impl Default for LineEnding {
    fn default() -> Self {
        Self::None
    }
}

impl LineEnding {
    pub fn as_bytes(&self) -> &'static [u8] {
        match self {
            LineEnding::None => b"",
            LineEnding::LF => b"\n",
            LineEnding::CR => b"\r",
            LineEnding::CRLF => b"\r\n",
        }
    }

    pub fn label(&self) -> &'static str {
        match self {
            LineEnding::None => "None",
            LineEnding::LF => "LF",
            LineEnding::CR => "CR",
            LineEnding::CRLF => "CRLF",
        }
    }
}

pub fn bytes_to_hex(bytes: &[u8], separator: &str) -> String {
    bytes
        .iter()
        .map(|b| format!("{:02X}", b))
        .collect::<Vec<_>>()
        .join(separator)
}

pub fn bytes_to_binary(bytes: &[u8], separator: &str) -> String {
    bytes
        .iter()
        .map(|b| format!("{:08b}", b))
        .collect::<Vec<_>>()
        .join(separator)
}

pub fn bytes_to_ascii(bytes: &[u8]) -> String {
    bytes
        .iter()
        .map(|&b| {
            if b >= 32 && b <= 126 {
                b as char
            } else if b == 10 {
                '↵'
            } else if b == 13 {
                '↩'
            } else if b == 9 {
                '→'
            } else {
                '·'
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_line_ending_bytes() {
        assert_eq!(LineEnding::None.as_bytes(), b"");
        assert_eq!(LineEnding::LF.as_bytes(), b"\n");
        assert_eq!(LineEnding::CR.as_bytes(), b"\r");
        assert_eq!(LineEnding::CRLF.as_bytes(), b"\r\n");
    }

    #[test]
    fn test_bytes_to_hex() {
        assert_eq!(bytes_to_hex(&[0x48, 0x65], " "), "48 65");
        assert_eq!(bytes_to_hex(&[0xFF], ""), "FF");
    }

    #[test]
    fn test_bytes_to_binary() {
        assert_eq!(bytes_to_binary(&[0x0A], " "), "00001010");
    }

    #[test]
    fn test_bytes_to_ascii_printable() {
        assert_eq!(bytes_to_ascii(b"Hi"), "Hi");
    }

    #[test]
    fn test_bytes_to_ascii_control() {
        let input = vec![10u8, 13u8, 9u8, 0u8];
        assert_eq!(bytes_to_ascii(&input), "↵↩→·");
    }
}
