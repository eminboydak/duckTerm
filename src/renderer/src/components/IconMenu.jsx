import { FaFile, FaFolderOpen, FaPlay, FaSave, FaStop } from 'react-icons/fa'
import PopUpMenu from './PopUpMenu'
import { useState } from 'react'
import { FaGear } from 'react-icons/fa6'

export default function IconMenu() {
  const [isEnabled, setIsEnabled] = useState(false)

  return (
    <div className="h-8">
      <div className="flex">
        <div className="flex space-x-2 m-1">
          {/* New Project */}
          <div
            className="text-ctp-text hover:text-ctp-green p-1"
            onClick={() => {
              setIsEnabled(true)
            }}
          >
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
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaGear />
          </div>
        </div>

        {/* Pop-up Menü */}
        {isEnabled && (
          <PopUpMenu
            onClick={() => {
              setIsEnabled(false)
            }}
          >
            <div className="bg-ctp-surface2 size-80"></div>
          </PopUpMenu>
        )}
      </div>
    </div>
  )
}
