/// COBS (Consistent Overhead Byte Stuffing) encode/decode
///
/// COBS encodes data by replacing zero bytes with non-zero code bytes.
/// Each group of non-zero bytes is prefixed with a code byte indicating
/// the number of data bytes that follow (including itself minus 1).
/// Zero bytes become group separators.
pub fn cobs_encode(input: &[u8]) -> Vec<u8> {
    let mut output = Vec::with_capacity(input.len() + 2);
    let mut read_idx = 0;
    let mut code_idx = output.len();
    output.push(0); // placeholder for first code byte

    while read_idx < input.len() {
        if input[read_idx] == 0 {
            // Write code byte for current run, start new run
            output[code_idx] = (output.len() - code_idx) as u8;
            code_idx = output.len();
            output.push(0); // placeholder for next code byte
            read_idx += 1;
        } else {
            output.push(input[read_idx]);
            read_idx += 1;
            // Check if run is full (code byte can hold max 254)
            if output.len() - code_idx == 255 {
                output[code_idx] = 255;
                code_idx = output.len();
                output.push(0);
            }
        }
    }
    // Final code byte
    output[code_idx] = (output.len() - code_idx) as u8;
    output
}

pub fn cobs_decode(input: &[u8]) -> Result<Vec<u8>, String> {
    let mut output = Vec::with_capacity(input.len());
    let mut i = 0;

    while i < input.len() {
        let code = input[i] as usize;
        i += 1;

        if code == 0 {
            return Err("Unexpected zero in COBS stream".into());
        }

        for _ in 0..(code - 1) {
            if i >= input.len() {
                return Err("COBS frame truncated".into());
            }
            output.push(input[i]);
            i += 1;
        }

        if code < 255 {
            output.push(0);
        }
    }

    // Trim trailing zero (COBS end delimiter)
    if output.last() == Some(&0x00) {
        output.pop();
    }

    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_empty() {
        // Empty input → one code byte saying "0 data bytes" + end marker
        let enc = cobs_encode(b"");
        // Decode should give empty
        assert_eq!(cobs_decode(&enc).unwrap(), b"");
    }

    #[test]
    fn test_encode_simple() {
        let enc = cobs_encode(b"A");
        assert_eq!(cobs_decode(&enc).unwrap(), b"A");
    }

    #[test]
    fn test_encode_multi() {
        let enc = cobs_encode(b"ABC");
        assert_eq!(cobs_decode(&enc).unwrap(), b"ABC");
    }

    #[test]
    fn test_encode_with_zero() {
        let enc = cobs_encode(b"\x00");
        assert_eq!(cobs_decode(&enc).unwrap(), b"\x00");
    }

    #[test]
    fn test_encode_mixed() {
        let enc = cobs_encode(b"A\x00B");
        assert_eq!(cobs_decode(&enc).unwrap(), b"A\x00B");
    }

    #[test]
    fn test_roundtrip_string() {
        let original = b"Hello, World! This is a COBS test.";
        let encoded = cobs_encode(original);
        let decoded = cobs_decode(&encoded).unwrap();
        assert_eq!(decoded, original);
    }

    #[test]
    fn test_roundtrip_zeros() {
        let original = b"AB\x00CD\x00\x00EF";
        let encoded = cobs_encode(original);
        let decoded = cobs_decode(&encoded).unwrap();
        assert_eq!(decoded, original);
    }

    #[test]
    fn test_roundtrip_all_zeros() {
        let original = b"\x00\x00\x00";
        let encoded = cobs_encode(original);
        let decoded = cobs_decode(&encoded).unwrap();
        assert_eq!(decoded, original);
    }

    #[test]
    fn test_roundtrip_binary() {
        let original: Vec<u8> = (0..=255).collect();
        let encoded = cobs_encode(&original);
        let decoded = cobs_decode(&encoded).unwrap();
        assert_eq!(decoded, original);
    }
}
