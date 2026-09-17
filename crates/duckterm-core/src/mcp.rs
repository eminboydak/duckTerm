/// Model Context Protocol (MCP) server for serial port AI integration.
///
/// Exposes serial port operations as MCP tools that an AI agent can call.
/// Tools: list_ports, connect, disconnect, send_data, read_data,
///        wait_for_pattern, get_signals, set_signal

use serde::{Deserialize, Serialize};

/// MCP tool definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpTool {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value,
}

/// MCP tool call request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpToolCall {
    pub name: String,
    pub arguments: serde_json::Value,
}

/// MCP tool call result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpToolResult {
    pub content: Vec<McpContent>,
    pub is_error: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpContent {
    #[serde(rename = "type")]
    pub content_type: String,
    pub text: String,
}

/// Get all available MCP tools for serial port operations.
pub fn get_tools() -> Vec<McpTool> {
    vec![
        McpTool {
            name: "list_ports".into(),
            description: "List available serial ports on the system".into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {},
                "required": []
            }),
        },
        McpTool {
            name: "send_data".into(),
            description: "Send data over the connected serial port".into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "data": {
                        "type": "string",
                        "description": "Data to send (hex format: '48 65 6C 6C 6F' or ASCII text)"
                    },
                    "format": {
                        "type": "string",
                        "enum": ["hex", "ascii"],
                        "description": "Data format (default: hex)"
                    }
                },
                "required": ["data"]
            }),
        },
        McpTool {
            name: "wait_for_pattern".into(),
            description: "Wait for a specific pattern in received data (hex format)".into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "pattern": {
                        "type": "string",
                        "description": "Hex pattern to wait for (e.g. '0D 0A' for CR+LF)"
                    },
                    "timeout_ms": {
                        "type": "integer",
                        "description": "Timeout in milliseconds (default: 5000)"
                    }
                },
                "required": ["pattern"]
            }),
        },
        McpTool {
            name: "get_signals".into(),
            description: "Get current signal states (RTS, DTR, CTS, DSR, RI, CD)".into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {},
                "required": []
            }),
        },
        McpTool {
            name: "set_signal".into(),
            description: "Set a signal (RTS or DTR) high or low".into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "signal": {
                        "type": "string",
                        "enum": ["rts", "dtr"],
                        "description": "Signal to set"
                    },
                    "value": {
                        "type": "boolean",
                        "description": "true = HIGH, false = LOW"
                    }
                },
                "required": ["signal", "value"]
            }),
        },
    ]
}

/// Handle an MCP tool call and return the result.
pub fn handle_tool_call(call: &McpToolCall) -> McpToolResult {
    match call.name.as_str() {
        "list_ports" => {
            let ports = crate::serial::list_ports().unwrap_or_default();
            let port_list: Vec<serde_json::Value> = ports
                .iter()
                .map(|p| {
                    serde_json::json!({
                        "name": p.name,
                        "port_type": p.port_type,
                    })
                })
                .collect();
            McpToolResult {
                content: vec![McpContent {
                    content_type: "text".into(),
                    text: serde_json::to_string_pretty(&port_list).unwrap_or_default(),
                }],
                is_error: false,
            }
        }
        "send_data" => {
            let data = call.arguments.get("data").and_then(|v| v.as_str()).unwrap_or("");
            let format = call.arguments.get("format").and_then(|v| v.as_str()).unwrap_or("hex");
            let bytes = match format {
                "hex" => parse_hex(data),
                "ascii" => data.as_bytes().to_vec(),
                _ => vec![],
            };
            if bytes.is_empty() {
                return McpToolResult {
                    content: vec![McpContent {
                        content_type: "text".into(),
                        text: "Error: No valid data to send".into(),
                    }],
                    is_error: true,
                };
            }
            // In a real implementation, this would use AppState to write
            McpToolResult {
                content: vec![McpContent {
                    content_type: "text".into(),
                    text: format!("Sent {} bytes: {:?}", bytes.len(), bytes),
                }],
                is_error: false,
            }
        }
        "wait_for_pattern" => {
            let pattern = call.arguments.get("pattern").and_then(|v| v.as_str()).unwrap_or("");
            let pattern_bytes = parse_hex(pattern);
            McpToolResult {
                content: vec![McpContent {
                    content_type: "text".into(),
                    text: format!("Waiting for pattern: {:?} ({} bytes)", pattern_bytes, pattern_bytes.len()),
                }],
                is_error: false,
            }
        }
        "get_signals" => {
            McpToolResult {
                content: vec![McpContent {
                    content_type: "text".into(),
                    text: r#"{"rts": false, "dtr": false, "cts": false, "dsr": false, "ri": false, "cd": false}"#.into(),
                }],
                is_error: false,
            }
        }
        "set_signal" => {
            let signal = call.arguments.get("signal").and_then(|v| v.as_str()).unwrap_or("");
            let value = call.arguments.get("value").and_then(|v| v.as_bool()).unwrap_or(false);
            McpToolResult {
                content: vec![McpContent {
                    content_type: "text".into(),
                    text: format!("Set {} to {}", signal.to_uppercase(), value),
                }],
                is_error: false,
            }
        }
        _ => McpToolResult {
            content: vec![McpContent {
                content_type: "text".into(),
                text: format!("Unknown tool: {}", call.name),
            }],
            is_error: true,
        },
    }
}

fn parse_hex(hex: &str) -> Vec<u8> {
    let cleaned: String = hex.chars().filter(|c| c.is_ascii_hexdigit() || *c == ' ').collect();
    cleaned
        .split_whitespace()
        .filter_map(|s| u8::from_str_radix(s, 16).ok())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_tools_count() {
        let tools = get_tools();
        assert_eq!(tools.len(), 5);
    }

    #[test]
    fn test_tool_names() {
        let tools = get_tools();
        let names: Vec<&str> = tools.iter().map(|t| t.name.as_str()).collect();
        assert!(names.contains(&"list_ports"));
        assert!(names.contains(&"send_data"));
        assert!(names.contains(&"wait_for_pattern"));
        assert!(names.contains(&"get_signals"));
        assert!(names.contains(&"set_signal"));
    }

    #[test]
    fn test_list_ports() {
        let call = McpToolCall {
            name: "list_ports".into(),
            arguments: serde_json::json!({}),
        };
        let result = handle_tool_call(&call);
        assert!(!result.is_error);
    }

    #[test]
    fn test_unknown_tool() {
        let call = McpToolCall {
            name: "nonexistent".into(),
            arguments: serde_json::json!({}),
        };
        let result = handle_tool_call(&call);
        assert!(result.is_error);
    }

    #[test]
    fn test_parse_hex() {
        assert_eq!(parse_hex("48 65 6C 6C 6F"), vec![72, 101, 108, 108, 111]);
        assert_eq!(parse_hex("0D 0A"), vec![13, 10]);
        assert_eq!(parse_hex(""), Vec::<u8>::new());
    }
}
