import { FaFile, FaFolderOpen, FaPlay, FaPrint, FaSave, FaStop } from 'react-icons/fa'
import PopUpMenu from './PopUpMenu'
import { useState } from 'react'

export default function IconMenu() {
  const [isEnabled, setIsEnabled] = useState(false)

  return (
    <div className="h-8">
      <div className="flex">
        <div className="flex space-x-2 m-1">
          {/* Section 1 */}
          <div
            className="text-ctp-text hover:text-ctp-green p-1"
            onClick={() => {
              setIsEnabled(true)
            }}
          >
            <FaFile />
          </div>
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaFolderOpen />
          </div>
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaSave />
          </div>
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaPrint />
          </div>

          {/* Section 2 */}
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaPlay />
          </div>
          <div className="text-ctp-text hover:text-ctp-green p-1">
            <FaStop />
          </div>

          {/* Section 3 */}
          {/* Section 4 */}
          {/* Section 5 */}
          {/* Section 6 */}
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
