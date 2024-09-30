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
          <form className="max-w-sm mx-auto">
            <label
              htmlFor="countries"
              className="block mb-2 font-bold text-ctp-text"
            >
              Device:
            </label>
            <select
              id="countries"
              className="bg-ctp-surface0 text-ctp-text rounded-md focus:ring-ctp-green focus:border-ctp-green block w-full p-2.5"
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
          </form>
        </div>
      )
    },
    {
      title: 'Flow Control',
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
              <p className="hidden text-ctp-text text-2xl font-bold text-center">
                This is setting pop-up
              </p>
              <Tab tabs={settingTabs} />
            </div>
          </PopUpMenu>
        )}
      </div>
    </div>
  )
}
