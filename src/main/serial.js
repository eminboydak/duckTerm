import { SerialPort } from 'serialport'

/* // Create a port
const port = new SerialPort(
  {
    path: '/dev/ttyUSB0',
    baudRate: 9600
  },
  function (err) {
    if (err) {
      return console.log('Error: ', err.message)
    }
  }
)

port.write('main screen turn on', function (err) {
  if (err) {
    return console.log('Error on write: ', err.message)
  }
  console.log('message written')
}) */

export async function getSerialPorts() {
  try {
    const ports = await SerialPort.list()
    const portPaths = ports.map((port) => port.path)
    return portPaths
  } catch (error) {
    console.error('Error listing ports: ', error)
    return []
  }
}
