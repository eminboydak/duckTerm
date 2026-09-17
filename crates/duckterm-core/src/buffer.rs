/// Fixed-size circular buffer for serial data.
pub struct RingBuffer {
    data: Vec<u8>,
    head: usize,
    tail: usize,
    len: usize,
    capacity: usize,
}

impl RingBuffer {
    pub fn new(capacity: usize) -> Self {
        Self {
            data: vec![0; capacity],
            head: 0,
            tail: 0,
            len: 0,
            capacity,
        }
    }

    pub fn push(&mut self, bytes: &[u8]) -> usize {
        let mut written = 0;
        for &byte in bytes {
            if self.len == self.capacity {
                // Overwrite oldest: advance tail
                self.tail = (self.tail + 1) % self.capacity;
            } else {
                self.len += 1;
            }
            self.data[self.head] = byte;
            self.head = (self.head + 1) % self.capacity;
            written += 1;
        }
        written
    }

    /// Drain all available bytes, resetting the buffer.
    pub fn drain(&mut self) -> Vec<u8> {
        if self.len == 0 {
            return Vec::new();
        }
        let result = if self.tail < self.head {
            self.data[self.tail..self.head].to_vec()
        } else {
            let mut result = Vec::with_capacity(self.len);
            result.extend_from_slice(&self.data[self.tail..self.capacity]);
            result.extend_from_slice(&self.data[..self.head]);
            result
        };
        self.head = 0;
        self.tail = 0;
        self.len = 0;
        result
    }

    pub fn len(&self) -> usize {
        self.len
    }

    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    pub fn capacity(&self) -> usize {
        self.capacity
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_push_and_drain() {
        let mut buf = RingBuffer::new(16);
        buf.push(b"hello");
        assert_eq!(buf.len(), 5);
        assert_eq!(buf.drain(), b"hello");
        assert!(buf.is_empty());
    }

    #[test]
    fn test_overwrite_when_full() {
        let mut buf = RingBuffer::new(4);
        buf.push(b"1234");
        buf.push(b"56");
        // Should contain "3456" (oldest overwritten)
        assert_eq!(buf.len(), 4);
        assert_eq!(buf.drain(), b"3456");
    }

    #[test]
    fn test_empty_drain() {
        let mut buf = RingBuffer::new(8);
        assert_eq!(buf.drain(), b"");
    }

    #[test]
    fn test_capacity() {
        let buf = RingBuffer::new(1024);
        assert_eq!(buf.capacity(), 1024);
        assert!(buf.is_empty());
    }
}
