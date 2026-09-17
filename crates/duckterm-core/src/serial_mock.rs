use std::io::{Read, Write};
use std::time::Duration;

pub struct MockPort {
    rx_buf: Vec<u8>,
}

impl MockPort {
    pub fn new() -> Self {
        Self {
            rx_buf: Vec::new(),
        }
    }
}

impl Read for MockPort {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        if self.rx_buf.is_empty() {
            std::thread::sleep(Duration::from_millis(10));
            return Ok(0);
        }
        let n = std::cmp::min(buf.len(), self.rx_buf.len());
        buf[..n].copy_from_slice(&self.rx_buf[..n]);
        self.rx_buf.drain(..n);
        Ok(n)
    }
}

impl Write for MockPort {
    fn write(&mut self, data: &[u8]) -> std::io::Result<usize> {
        self.rx_buf.extend_from_slice(data);
        Ok(data.len())
    }

    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}

impl serialport::SerialPort for MockPort {
    fn name(&self) -> Option<String> {
        Some("MOCK-PORT".to_string())
    }

    fn baud_rate(&self) -> serialport::Result<u32> {
        Ok(9600)
    }

    fn data_bits(&self) -> serialport::Result<serialport::DataBits> {
        Ok(serialport::DataBits::Eight)
    }

    fn parity(&self) -> serialport::Result<serialport::Parity> {
        Ok(serialport::Parity::None)
    }

    fn stop_bits(&self) -> serialport::Result<serialport::StopBits> {
        Ok(serialport::StopBits::One)
    }

    fn flow_control(&self) -> serialport::Result<serialport::FlowControl> {
        Ok(serialport::FlowControl::None)
    }

    fn set_baud_rate(&mut self, _: u32) -> serialport::Result<()> {
        Ok(())
    }

    fn set_data_bits(&mut self, _: serialport::DataBits) -> serialport::Result<()> {
        Ok(())
    }

    fn set_parity(&mut self, _: serialport::Parity) -> serialport::Result<()> {
        Ok(())
    }

    fn set_stop_bits(&mut self, _: serialport::StopBits) -> serialport::Result<()> {
        Ok(())
    }

    fn set_flow_control(&mut self, _: serialport::FlowControl) -> serialport::Result<()> {
        Ok(())
    }

    fn write_data_terminal_ready(&mut self, _: bool) -> serialport::Result<()> {
        Ok(())
    }

    fn write_request_to_send(&mut self, _: bool) -> serialport::Result<()> {
        Ok(())
    }

    fn bytes_to_read(&self) -> serialport::Result<u32> {
        Ok(self.rx_buf.len() as u32)
    }

    fn bytes_to_write(&self) -> serialport::Result<u32> {
        Ok(0)
    }

    fn clear(&self, _: serialport::ClearBuffer) -> serialport::Result<()> {
        Ok(())
    }

    fn read_clear_to_send(&mut self) -> serialport::Result<bool> {
        Ok(true)
    }

    fn read_data_set_ready(&mut self) -> serialport::Result<bool> {
        Ok(true)
    }

    fn read_ring_indicator(&mut self) -> serialport::Result<bool> {
        Ok(false)
    }

    fn read_carrier_detect(&mut self) -> serialport::Result<bool> {
        Ok(false)
    }

    fn try_clone(&self) -> serialport::Result<Box<dyn serialport::SerialPort>> {
        Ok(Box::new(MockPort::new()))
    }

    fn set_timeout(&mut self, _: Duration) -> serialport::Result<()> {
        Ok(())
    }

    fn timeout(&self) -> Duration {
        Duration::from_millis(100)
    }

    fn set_break(&self) -> serialport::Result<()> {
        Ok(())
    }

    fn clear_break(&self) -> serialport::Result<()> {
        Ok(())
    }
}
