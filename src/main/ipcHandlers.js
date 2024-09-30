import { ipcMain } from 'electron'
import { getSerialPorts } from './serial'

export function setupIPC() {
  ipcMain.handle('get-serial-ports', getSerialPorts)
}
