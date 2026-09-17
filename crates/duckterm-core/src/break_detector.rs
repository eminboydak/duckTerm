use std::time::{Duration, Instant};

/// Detects serial break conditions from incoming data.
pub struct BreakDetector {
    threshold: Duration,
    last_byte_time: Option<Instant>,
    break_detected: bool,
}

impl BreakDetector {
    /// Create a new detector with the given break threshold.
    /// A break is detected when the gap between bytes exceeds the threshold.
    pub fn new(threshold: Duration) -> Self {
        Self {
            threshold,
            last_byte_time: None,
            break_detected: false,
        }
    }

    /// Feed a byte timestamp. Returns true if a break was detected.
    pub fn feed(&mut self, timestamp: Instant) -> bool {
        self.break_detected = false;

        if let Some(last) = self.last_byte_time {
            let gap = timestamp.duration_since(last);
            if gap >= self.threshold {
                self.break_detected = true;
                self.last_byte_time = Some(timestamp);
                return true;
            }
        }

        self.last_byte_time = Some(timestamp);
        false
    }

    /// Check if a break was detected on the last feed.
    pub fn was_break_detected(&self) -> bool {
        self.break_detected
    }

    /// Reset the detector state.
    pub fn reset(&mut self) {
        self.last_byte_time = None;
        self.break_detected = false;
    }
}

impl Default for BreakDetector {
    fn default() -> Self {
        // Default: 3.5 character times at 9600 baud = ~3.6ms
        Self::new(Duration::from_millis(4))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_break_short_gap() {
        let mut d = BreakDetector::new(Duration::from_millis(10));
        let t0 = Instant::now();
        assert!(!d.feed(t0));
        assert!(!d.feed(t0 + Duration::from_millis(5)));
    }

    #[test]
    fn test_break_long_gap() {
        let mut d = BreakDetector::new(Duration::from_millis(10));
        let t0 = Instant::now();
        d.feed(t0);
        assert!(d.feed(t0 + Duration::from_millis(15)));
    }

    #[test]
    fn test_reset() {
        let mut d = BreakDetector::new(Duration::from_millis(10));
        let t0 = Instant::now();
        d.feed(t0);
        d.feed(t0 + Duration::from_millis(15));
        d.reset();
        assert!(!d.was_break_detected());
    }

    #[test]
    fn test_sequential_gaps() {
        let mut d = BreakDetector::new(Duration::from_millis(10));
        let t0 = Instant::now();
        // Normal data
        assert!(!d.feed(t0));
        assert!(!d.feed(t0 + Duration::from_millis(1)));
        assert!(!d.feed(t0 + Duration::from_millis(2)));
        // Break
        assert!(d.feed(t0 + Duration::from_millis(15)));
        // Normal data again
        assert!(!d.feed(t0 + Duration::from_millis(16)));
    }
}
