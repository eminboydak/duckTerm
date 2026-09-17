use crate::sequence::Sequence;
use serde::{Deserialize, Serialize};

/// duckTerm project file format (.duck).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub version: u32,
    pub port_name: Option<String>,
    pub baud_rate: u32,
    pub data_bits: u8,
    pub parity: String,
    pub stop_bits: u8,
    pub flow_control: String,
    pub line_ending: String,
    pub send_sequences: Vec<Sequence>,
    pub receive_sequences: Vec<Sequence>,
}

impl Default for Project {
    fn default() -> Self {
        Self {
            version: 1,
            port_name: None,
            baud_rate: 9600,
            data_bits: 8,
            parity: "None".to_string(),
            stop_bits: 1,
            flow_control: "None".to_string(),
            line_ending: "LF".to_string(),
            send_sequences: Vec::new(),
            receive_sequences: Vec::new(),
        }
    }
}

impl Project {
    /// Serialize to JSON bytes (for .duck file).
    pub fn to_bytes(&self) -> Result<Vec<u8>, String> {
        serde_json::to_vec_pretty(self).map_err(|e| e.to_string())
    }

    /// Deserialize from JSON bytes.
    pub fn from_bytes(data: &[u8]) -> Result<Self, String> {
        serde_json::from_slice(data).map_err(|e| e.to_string())
    }

    /// Serialize with duckTerm header comment.
    pub fn to_file_bytes(&self) -> Result<Vec<u8>, String> {
        let json = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        let header = "// duckTerm project file\n// https://github.com/eminboydak/duckTerm\n\n";
        Ok(format!("{}{}", header, json).into_bytes())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_project_default() {
        let p = Project::default();
        assert_eq!(p.version, 1);
        assert_eq!(p.baud_rate, 9600);
        assert!(p.send_sequences.is_empty());
    }

    #[test]
    fn test_project_roundtrip() {
        let mut p = Project::default();
        p.port_name = Some("/dev/ttyUSB0".to_string());
        p.baud_rate = 115200;

        let bytes = p.to_bytes().unwrap();
        let loaded = Project::from_bytes(&bytes).unwrap();
        assert_eq!(loaded.port_name, Some("/dev/ttyUSB0".to_string()));
        assert_eq!(loaded.baud_rate, 115200);
    }

    #[test]
    fn test_project_file_bytes() {
        let p = Project::default();
        let bytes = p.to_file_bytes().unwrap();
        let text = String::from_utf8(bytes).unwrap();
        assert!(text.starts_with("// duckTerm project file"));
        assert!(text.contains("\"version\": 1"));
    }
}
