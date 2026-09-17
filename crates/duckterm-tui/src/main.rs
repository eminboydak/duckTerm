use clap::Parser;
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::CrosstermBackend,
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, List, ListItem, Paragraph},
    Frame, Terminal,
};
use std::io;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use duckterm_core::buffer::RingBuffer;
use duckterm_core::protocol::{bytes_to_ascii, bytes_to_hex, LineEnding};
use duckterm_core::serial::{list_ports, open_port, SerialConfig};

#[derive(Parser)]
#[command(name = "duckterm-tui", about = "Serial terminal TUI for embedded engineers")]
struct Cli {
    #[arg(short, long)]
    port: Option<String>,
    #[arg(short, long, default_value = "9600")]
    baud: u32,
    #[arg(long)]
    mock: bool,
}

enum InputMode {
    Normal,
    Command,
}

struct App {
    lines: Vec<String>,
    rx_buffer: RingBuffer,
    input: String,
    input_mode: InputMode,
    connected: bool,
    port_name: String,
    baud_rate: u32,
    line_ending: LineEnding,
    auto_scroll: bool,
    view_mode: ViewMode,
    port: Option<Box<dyn serialport::SerialPort>>,
    rx_count: usize,
    tx_count: usize,
}

#[derive(Clone, Copy, PartialEq)]
enum ViewMode {
    Ascii,
    Hex,
}

impl App {
    fn new(baud_rate: u32, port_name: String) -> Self {
        Self {
            lines: Vec::new(),
            rx_buffer: RingBuffer::new(65536),
            input: String::new(),
            input_mode: InputMode::Normal,
            connected: false,
            port_name,
            baud_rate,
            line_ending: LineEnding::LF,
            auto_scroll: true,
            view_mode: ViewMode::Ascii,
            port: None,
            rx_count: 0,
            tx_count: 0,
        }
    }

    fn add_rx_line(&mut self, data: &[u8]) {
        self.rx_count += data.len();
        let text = match self.view_mode {
            ViewMode::Ascii => bytes_to_ascii(data),
            ViewMode::Hex => bytes_to_hex(data, " "),
        };
        self.lines.push(format!("< {}", text));
        if self.lines.len() > 1000 {
            self.lines.drain(0..self.lines.len() - 1000);
        }
    }

    fn add_tx_line(&mut self, data: &[u8]) {
        self.tx_count += data.len();
        let text = match self.view_mode {
            ViewMode::Ascii => bytes_to_ascii(data),
            ViewMode::Hex => bytes_to_hex(data, " "),
        };
        self.lines.push(format!("> {}", text));
    }

    fn connect(&mut self) {
        if self.connected {
            self.disconnect();
            return;
        }
        if self.port_name.is_empty() {
            self.lines.push("✗ No port specified".to_string());
            return;
        }
        let config = SerialConfig {
            baud_rate: self.baud_rate,
            ..Default::default()
        };
        match open_port(&self.port_name, &config) {
            Ok(port) => {
                self.port = Some(port);
                self.connected = true;
                self.lines
                    .push(format!("✓ Connected to {} @ {} baud", self.port_name, self.baud_rate));
            }
            Err(e) => {
                self.lines.push(format!("✗ Failed to connect: {}", e));
            }
        }
    }

    fn disconnect(&mut self) {
        self.port = None;
        self.connected = false;
        self.lines
            .push(format!("✗ Disconnected from {}", self.port_name));
    }

    fn send_data(&mut self, data: &[u8]) {
        if let Some(port) = self.port.as_mut() {
            match port.write(data) {
                Ok(n) => {
                    self.tx_count += n;
                    self.add_tx_line(data);
                }
                Err(e) => {
                    self.lines.push(format!("✗ Send error: {}", e));
                }
            }
        }
    }

    fn read_data(&mut self) {
        if let Some(port) = self.port.as_mut() {
            let mut buf = [0u8; 4096];
            match port.read(&mut buf) {
                Ok(n) if n > 0 => {
                    self.add_rx_line(&buf[..n]);
                }
                Ok(_) => {}
                Err(ref e) if e.kind() == std::io::ErrorKind::TimedOut => {}
                Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {}
                Err(e) => {
                    self.lines.push(format!("✗ Read error: {}", e));
                }
            }
        }
    }
}

fn ui(f: &mut Frame, app: &App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Min(0),
            Constraint::Length(3),
            Constraint::Length(1),
        ])
        .split(f.area());

    // Terminal output
    let terminal_block = Block::default()
        .title(format!(
            " 🦆 duckTerm TUI — {} @ {} baud ",
            if app.connected {
                &app.port_name
            } else {
                "disconnected"
            },
            app.baud_rate
        ))
        .borders(Borders::ALL)
        .style(Style::default().fg(Color::White));

    let items: Vec<ListItem> = app
        .lines
        .iter()
        .map(|l| {
            let color = if l.starts_with('>') {
                Color::Cyan
            } else if l.starts_with('<') {
                Color::Green
            } else if l.starts_with('✓') {
                Color::Green
            } else if l.starts_with('✗') {
                Color::Red
            } else {
                Color::Gray
            };
            ListItem::new(Line::from(Span::styled(l.as_str(), Style::default().fg(color))))
        })
        .collect();

    let list = List::new(items).block(terminal_block);
    f.render_widget(list, chunks[0]);

    // Input area
    let input_block = Block::default()
        .title(format!(" Input [{}] ", app.line_ending.label()))
        .borders(Borders::ALL)
        .style(Style::default().fg(if app.connected {
            Color::Yellow
        } else {
            Color::DarkGray
        }));

    let input_paragraph = Paragraph::new(app.input.as_str()).block(input_block);
    f.render_widget(input_paragraph, chunks[1]);

    // Status bar
    let mode_indicator = match app.view_mode {
        ViewMode::Ascii => "ASCII",
        ViewMode::Hex => "HEX",
    };
    let status = format!(
        " {} | {} | {} | {} | RX:{} TX:{} | i:type l:clear s:scroll e:ending t:mode q:quit ",
        app.port_name,
        app.baud_rate,
        app.line_ending.label(),
        mode_indicator,
        app.rx_count,
        app.tx_count,
    );
    let status_bar = Paragraph::new(status).style(Style::default().fg(Color::Black).bg(Color::White));
    f.render_widget(status_bar, chunks[2]);
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let port_name = cli
        .port
        .unwrap_or_else(|| {
            if cli.mock {
                "mock-0".to_string()
            } else {
                String::new()
            }
        });

    let mut app = App::new(cli.baud, port_name);

    // Auto-connect if port specified
    if !app.port_name.is_empty() {
        app.connect();
    } else if let Ok(ports) = list_ports() {
        app.lines.push("Available ports:".to_string());
        for p in &ports {
            app.lines.push(format!("  {} ({})", p.name, p.port_type));
        }
    }

    loop {
        terminal.draw(|f| ui(f, &app))?;

        // Read serial data if connected
        if app.connected {
            app.read_data();
        }

        if event::poll(Duration::from_millis(10))? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match app.input_mode {
                        InputMode::Normal => match key.code {
                            KeyCode::Char('q') => break,
                            KeyCode::Char('c') => app.connect(),
                            KeyCode::Char('i') | KeyCode::Char('a') => {
                                app.input_mode = InputMode::Command;
                            }
                            KeyCode::Tab => {
                                app.view_mode = match app.view_mode {
                                    ViewMode::Ascii => ViewMode::Hex,
                                    ViewMode::Hex => ViewMode::Ascii,
                                };
                            }
                            KeyCode::Char('l') => app.lines.clear(),
                            KeyCode::Char('s') => app.auto_scroll = !app.auto_scroll,
                            KeyCode::Char('e') => {
                                app.line_ending = match app.line_ending {
                                    LineEnding::None => LineEnding::LF,
                                    LineEnding::LF => LineEnding::CR,
                                    LineEnding::CR => LineEnding::CRLF,
                                    LineEnding::CRLF => LineEnding::None,
                                };
                            }
                            _ => {}
                        },
                        InputMode::Command => match key.code {
                            KeyCode::Esc => {
                                app.input_mode = InputMode::Normal;
                                app.input.clear();
                            }
                            KeyCode::Enter => {
                                if !app.input.is_empty() && app.connected {
                                    let mut data = app.input.as_bytes().to_vec();
                                    data.extend_from_slice(app.line_ending.as_bytes());
                                    app.send_data(&data);
                                }
                                app.input.clear();
                                app.input_mode = InputMode::Normal;
                            }
                            KeyCode::Backspace => {
                                app.input.pop();
                            }
                            KeyCode::Char(c) => {
                                app.input.push(c);
                            }
                            _ => {}
                        },
                    }
                }
            }
        }
    }

    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;

    Ok(())
}
