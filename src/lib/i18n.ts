import { settingsState } from '$lib/stores/settings'

export type Lang = 'tr' | 'en'

const translations: Record<Lang, Record<string, string>> = {
  en: {
    'app.title': 'duckTerm',
    // Header
    'header.log.start': 'Start Log',
    'header.log.stop': 'Stop Log',
    'header.log.save': 'Save Log',
    'header.settings': 'Settings',
    'header.find': 'Find',
    'header.saveProject': 'Save Project',
    'header.loadProject': 'Load Project',
    // ConnectionBar
    'conn.port.select': 'Select port',
    'conn.connect': 'Connect',
    'conn.disconnect': 'Disconnect',
    'conn.refresh': 'Refresh',
    'conn.error.select': 'Select a port',
    // Sidebar
    'sidebar.portInfo': 'Port Info',
    'sidebar.portInfo.none': 'No connection',
    'sidebar.portInfo.port': 'Port',
    'sidebar.portInfo.baud': 'Baud',
    'sidebar.portInfo.config': 'Config',
    'sidebar.signals': 'Signals',
    'sidebar.actions': 'Quick Actions',
    'sidebar.actions.break': 'Send Break',
    'sidebar.actions.clear': 'Clear Buffer',
    // StatusBar
    'status.connected': 'Connected',
    'status.disconnected': 'Disconnected',
    'status.tx': 'TX',
    'status.rx': 'RX',
    // InputBar
    'input.text': 'Text',
    'input.hex': 'HEX',
    'input.placeholder.text': 'Type your message...',
    'input.placeholder.hex': 'Hex: 48 65 6C 6C 6F',
    'input.send': 'Send',
    // TerminalView
    'term.clear': 'Clear',
    'term.empty': 'No data yet — connect to a port and send/receive data',
    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.timestamps': 'Show Timestamps',
    'settings.buffer': 'Buffer Limit',
    'settings.lines': 'lines',
    'settings.close': 'Close',
    // Find
    'find.placeholder.text': 'Search...',
    'find.placeholder.hex': '48 65 6C',
    'find.matches': 'matches',
    // Sequences
    'seq.send': 'Send Sequences',
    'seq.receive': 'Receive Sequences',
    'seq.new': 'New Sequence',
    'seq.edit': 'Edit Sequence',
    'seq.name': 'Name',
    'seq.format': 'Data Format',
    'seq.data': 'Data',
    'seq.cancel': 'Cancel',
    'seq.save': 'Save',
    'seq.empty': 'No sequences yet',
    // Checksum
    'checksum.title': 'Checksum',
    'checksum.calculate': 'Calculate',
    'checksum.result': 'Result',
    'checksum.placeholder': 'HEX data: 48 65 6C 6C 6F',
    // Shortcuts
    'shortcuts.title': 'Keyboard Shortcuts',
    'shortcuts.help': 'Show this help',
    'shortcuts.connect': 'Connect to port',
    'shortcuts.disconnect': 'Disconnect',
    'shortcuts.clear': 'Clear terminal',
    'shortcuts.log': 'Toggle logging',
    'shortcuts.pause': 'Pause/resume terminal',
    'shortcuts.find': 'Find in terminal',
    'shortcuts.copy': 'Copy selection',
    'shortcuts.copyAll': 'Copy all lines',
    'shortcuts.paste': 'Paste to input',
    'shortcuts.history': 'Send history',
    'shortcuts.close': 'Close',
  },
  tr: {
    'app.title': 'duckTerm',
    // Header
    'header.log.start': 'Log Başlat',
    'header.log.stop': 'Log Durdur',
    'header.log.save': 'Kaydet',
    'header.settings': 'Ayarlar',
    'header.find': 'Ara',
    'header.saveProject': 'Projeyi Kaydet',
    'header.loadProject': 'Proje Yükle',
    // ConnectionBar
    'conn.port.select': 'Port seçin',
    'conn.connect': 'Bağlan',
    'conn.disconnect': 'Kes',
    'conn.refresh': 'Yenile',
    'conn.error.select': 'Port seçin',
    // Sidebar
    'sidebar.portInfo': 'Port Bilgisi',
    'sidebar.portInfo.none': 'Bağlantı yok',
    'sidebar.portInfo.port': 'Port',
    'sidebar.portInfo.baud': 'Baud',
    'sidebar.portInfo.config': 'Yapılandırma',
    'sidebar.signals': 'Sinyaller',
    'sidebar.actions': 'Hızlı İşlemler',
    'sidebar.actions.break': 'Break Gönder',
    'sidebar.actions.clear': 'Tamponu Temizle',
    // StatusBar
    'status.connected': 'Bağlı',
    'status.disconnected': 'Bağlantı Yok',
    'status.tx': 'GÖN',
    'status.rx': 'AL',
    // InputBar
    'input.text': 'Metin',
    'input.hex': 'HEX',
    'input.placeholder.text': 'Mesajınızı yazın...',
    'input.placeholder.hex': 'Hex: 48 65 6C 6C 6F',
    'input.send': 'Gönder',
    // TerminalView
    'term.clear': 'Temizle',
    'term.empty': 'Henüz veri yok — port bağlanın ve veri gönderin/alın',
    // Settings
    'settings.title': 'Ayarlar',
    'settings.theme': 'Tema',
    'settings.language': 'Dil',
    'settings.timestamps': 'Zaman Damgası Göster',
    'settings.buffer': 'Tampon Boyutu',
    'settings.lines': 'satır',
    'settings.close': 'Kapat',
    // Find
    'find.placeholder.text': 'Ara...',
    'find.placeholder.hex': '48 65 6C',
    'find.matches': 'eşleşme',
    // Sequences
    'seq.send': 'Gönderme Sıraları',
    'seq.receive': 'Alma Sıraları',
    'seq.new': 'Yeni Sıra',
    'seq.edit': 'Sırayı Düzenle',
    'seq.name': 'İsim',
    'seq.format': 'Veri Formatı',
    'seq.data': 'Veri',
    'seq.cancel': 'İptal',
    'seq.save': 'Kaydet',
    'seq.empty': 'Henüz sıra yok',
    // Checksum
    'checksum.title': 'Checksum',
    'checksum.calculate': 'Hesapla',
    'checksum.result': 'Sonuç',
    'checksum.placeholder': 'HEX veri: 48 65 6C 6C 6F',
    // Kısayollar
    'shortcuts.title': 'Klavye Kısayolları',
    'shortcuts.help': 'Bu yardımı göster',
    'shortcuts.connect': 'Porta bağlan',
    'shortcuts.disconnect': 'Bağlantıyı kes',
    'shortcuts.clear': 'Terminali temizle',
    'shortcuts.log': 'Kaydı aç/kapat',
    'shortcuts.pause': 'Terminali duraklat/devam ettir',
    'shortcuts.find': 'Terminalde ara',
    'shortcuts.copy': 'Seçimi kopyala',
    'shortcuts.copyAll': 'Tüm satırları kopyala',
    'shortcuts.paste': 'Girişe yapıştır',
    'shortcuts.history': 'Gönderme geçmişi',
    'shortcuts.close': 'Kapat',
  },
}

export function t(key: string): string {
  const lang = (settingsState.value.lang || 'en') as Lang
  return translations[lang]?.[key] || translations.en[key] || key
}
