import { FaFile, FaFolderOpen, FaPlay, FaSave, FaStop } from 'react-icons/fa'
import PopUpMenu from './PopUpMenu'
import { useState } from 'react'
import { FaGear } from 'react-icons/fa6'
import Tab from './Tab'

export default function IconMenu() {
  const [settingIsOpen, setSettingIsOpen] = useState(false)
  const [serialPorts, setSerialPorts] = useState([])

  const settingTabs = [
    {
      title: 'Communication',
      content: (
        <div>
          <form className="max-w-sm mx-auto grid grid-cols-3 gap-4">
            {/* Device: */}
            <label
              htmlFor="device"
              className="block mb-2 font-bold text-ctp-text text-right content-center"
            >
              Device:
            </label>
            <select
              id="device"
              className="col-span-2 bg-ctp-surface0 text-ctp-text rounded-md focus:ring-ctp-green focus:border-ctp-green block w-full p-2.5"
            >
              {serialPorts.length > 0 ? (
                serialPorts.map((port, index) => (
                  <option key={index} value={port}>
                    {port}
                  </option>
                ))
              ) : (
                <option value="">No devices available</option>
              )}
            </select>

            {/* Baud Rate: */}
            <label
              htmlFor="baud-rate"
              className="block mb-2 font-bold text-ctp-text text-right content-center"
            >
              Baud Rate:
            </label>
            <select
              id="baud-rate"
              className="col-span-2 bg-ctp-surface0 text-ctp-text rounded-md focus:ring-ctp-green focus:border-ctp-green block w-full p-2.5"
            >
              <option>110</option>
              <option>300</option>
              <option>1200</option>
              <option>2400</option>
              <option>4800</option>
              <option selected>9600</option>
              <option>14400</option>
              <option>19200</option>
              <option>38400</option>
              <option>57600</option>
              <option>115200</option>
            </select>

            {/* Data Bits: */}
            <label
              htmlFor="data-bits"
              className="block mb-2 font-bold text-ctp-text text-right content-center"
            >
              Data Bits:
            </label>
            <select
              id="data-bits"
              className="col-span-2 bg-ctp-surface0 text-ctp-text rounded-md focus:ring-ctp-green focus:border-ctp-green block w-full p-2.5"
            >
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option selected>8</option>
            </select>

            {/* Stop Bits: */}
            <label
              htmlFor="stop-bits"
              className="block mb-2 font-bold text-ctp-text text-right content-center"
            >
              Stop Bits:
            </label>
            <select
              id="stop-bits"
              className="col-span-2 bg-ctp-surface0 text-ctp-text rounded-md focus:ring-ctp-green focus:border-ctp-green block w-full p-2.5"
            >
              <option selected>1</option>
              <option>1.5</option>
              <option>2</option>
            </select>

            {/* Parity: */}
            <label
              htmlFor="parity"
              className="block mb-2 font-bold text-ctp-text text-right content-center"
            >
              Parity:
            </label>
            <select
              id="parity"
              className="col-span-2 bg-ctp-surface0 text-ctp-text rounded-md focus:ring-ctp-green focus:border-ctp-green block w-full p-2.5"
            >
              <option selected>None</option>
              <option>Even</option>
              <option>Odd</option>
              <option>Mark</option>
              <option>Space</option>
            </select>
          </form>
        </div>
      )
    },
    {
      title: 'Program',
      content: <div></div>
    }
  ]

  return (
    <div className="h-8">
      <div className="flex">
        <div className="flex space-x-2 m-1">
          {/* New Project */}
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaFile />
          </div>

          {/* Open Project */}
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaFolderOpen />
          </div>

          {/* Save Project */}
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaSave />
          </div>

          {/* Start Communication */}
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaPlay />
          </div>

          {/* Stop Communication */}
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaStop />
          </div>

          {/* Project / Communication Settings */}
          <div
            className="text-ctp-text hover:text-ctp-green p-1"
            onClick={() => {
              setSettingIsOpen(true)
              window.api.getSerialPorts().then((ports) => {
                setSerialPorts(ports) // Gelen portları state'e kaydediyoruz
              })
            }}
          >
            <FaGear />
          </div>
        </div>

        {/* Pop-up Menu */}
        {settingIsOpen && (
          <PopUpMenu
            onClick={() => {
              setSettingIsOpen(false)
            }}
          >
            <div className="select-none">
              <Tab tabs={settingTabs} />
            </div>
          </PopUpMenu>
        )}
      </div>
    </div>
  )
}
