export function bytesToHex(bytes: number[], separator: string = ' '): string {
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(separator);
}

export function bytesToBinary(bytes: number[], separator: string = ' '): string {
  return bytes.map(b => b.toString(2).padStart(8, '0')).join(separator);
}

export function bytesToAscii(bytes: number[]): string {
  return bytes.map(b => {
    if (b >= 32 && b <= 126) return String.fromCharCode(b);
    if (b === 10) return '↵';
    if (b === 13) return '↩';
    if (b === 9) return '→';
    return '·';
  }).join('');
}

export function hexStringToBytes(hex: string): number[] {
  const cleaned = hex.replace(/\s+/g, '').replace(/^0x/i, '');
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes.push(parseInt(cleaned.substring(i, i + 2), 16));
  }
  return bytes;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
