pub mod serial;
pub mod protocol;
pub mod buffer;
pub mod sequence;
pub mod checksum;
pub mod project;
pub mod cobs;
pub mod scripting;

#[cfg(feature = "mock")]
pub mod serial_mock;
