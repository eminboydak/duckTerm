pub mod serial;
pub mod protocol;
pub mod buffer;
pub mod sequence;
pub mod checksum;
pub mod project;
pub mod cobs;
pub mod scripting;
pub mod signal_watcher;
pub mod break_detector;
pub mod network;
pub mod modbus;

#[cfg(feature = "mock")]
pub mod serial_mock;
