use crate::serial::SignalState;
use std::collections::HashMap;

/// Represents a signal transition event.
#[derive(Debug, Clone, PartialEq)]
pub struct SignalTransition {
    pub signal: String,
    pub from: bool,
    pub to: bool,
}

/// Tracks signal state changes between polls.
pub struct SignalWatcher {
    prev: Option<SignalState>,
    rules: Vec<SignalRule>,
}

/// A rule that fires when a specific signal changes.
pub struct SignalRule {
    pub id: String,
    pub signal: String,       // "cts", "dsr", "ri", "cd"
    pub on: String,           // "rise", "fall", "change"
    pub enabled: bool,
}

impl SignalWatcher {
    pub fn new() -> Self {
        Self {
            prev: None,
            rules: Vec::new(),
        }
    }

    /// Add a detection rule.
    pub fn add_rule(&mut self, rule: SignalRule) {
        self.rules.push(rule);
    }

    /// Remove a rule by id.
    pub fn remove_rule(&mut self, id: &str) {
        self.rules.retain(|r| r.id != id);
    }

    /// Clear all rules.
    pub fn clear_rules(&mut self) {
        self.rules.clear();
    }

    /// Update with new signal state. Returns list of triggered rule ids.
    pub fn update(&mut self, current: &SignalState) -> Vec<String> {
        let mut triggered = Vec::new();

        if let Some(prev) = &self.prev {
            for rule in &self.rules {
                if !rule.enabled {
                    continue;
                }
                let from = get_signal_field(prev, &rule.signal);
                let to = get_signal_field(current, &rule.signal);

                if from == to {
                    continue
                };

                let matches = match rule.on.as_str() {
                    "rise" => !from && to,
                    "fall" => from && !to,
                    "change" => true,
                    _ => false,
                };

                if matches {
                    triggered.push(rule.id.clone());
                }
            }
        }

        self.prev = Some(current.clone());
        triggered
    }

    /// Get current previous state.
    pub fn prev_state(&self) -> Option<&SignalState> {
        self.prev.as_ref()
    }
}

fn get_signal_field(state: &SignalState, name: &str) -> bool {
    match name.to_lowercase().as_str() {
        "rts" => state.rts,
        "dtr" => state.dtr,
        "cts" => state.cts,
        "dsr" => state.dsr,
        "ri" => state.ri,
        "cd" => state.cd,
        _ => false,
    }
}

impl Default for SignalWatcher {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn state(rts: bool, dtr: bool, cts: bool, dsr: bool, ri: bool, cd: bool) -> SignalState {
        SignalState { rts, dtr, cts, dsr, ri, cd }
    }

    #[test]
    fn test_no_change() {
        let mut w = SignalWatcher::new();
        w.update(&state(false, false, false, false, false, false));
        let triggered = w.update(&state(false, false, false, false, false, false));
        assert!(triggered.is_empty());
    }

    #[test]
    fn test_cts_rise() {
        let mut w = SignalWatcher::new();
        w.add_rule(SignalRule { id: "r1".into(), signal: "cts".into(), on: "rise".into(), enabled: true });
        w.update(&state(false, false, false, false, false, false));
        let triggered = w.update(&state(false, false, true, false, false, false));
        assert_eq!(triggered, vec!["r1"]);
    }

    #[test]
    fn test_cts_fall() {
        let mut w = SignalWatcher::new();
        w.add_rule(SignalRule { id: "r1".into(), signal: "cts".into(), on: "fall".into(), enabled: true });
        w.update(&state(false, false, true, false, false, false));
        let triggered = w.update(&state(false, false, false, false, false, false));
        assert_eq!(triggered, vec!["r1"]);
    }

    #[test]
    fn test_cts_change() {
        let mut w = SignalWatcher::new();
        w.add_rule(SignalRule { id: "r1".into(), signal: "cts".into(), on: "change".into(), enabled: true });
        w.update(&state(false, false, false, false, false, false));
        let triggered = w.update(&state(false, false, true, false, false, false));
        assert_eq!(triggered, vec!["r1"]);
    }

    #[test]
    fn test_disabled_rule() {
        let mut w = SignalWatcher::new();
        w.add_rule(SignalRule { id: "r1".into(), signal: "cts".into(), on: "rise".into(), enabled: false });
        w.update(&state(false, false, false, false, false, false));
        let triggered = w.update(&state(false, false, true, false, false, false));
        assert!(triggered.is_empty());
    }

    #[test]
    fn test_multiple_signals() {
        let mut w = SignalWatcher::new();
        w.add_rule(SignalRule { id: "r1".into(), signal: "cts".into(), on: "rise".into(), enabled: true });
        w.add_rule(SignalRule { id: "r2".into(), signal: "dsr".into(), on: "rise".into(), enabled: true });
        w.update(&state(false, false, false, false, false, false));
        let triggered = w.update(&state(false, false, true, true, false, false));
        assert_eq!(triggered.len(), 2);
        assert!(triggered.contains(&"r1".to_string()));
        assert!(triggered.contains(&"r2".to_string()));
    }
}
