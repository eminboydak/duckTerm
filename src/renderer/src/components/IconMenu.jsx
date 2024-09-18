import { FaFile, FaFolderOpen, FaPlay, FaPrint, FaSave, FaStop } from 'react-icons/fa'

export default function IconMenu() {
  return (
    <div className="h-8">
      <div className="flex space-x-2 m-1">
        {/* Section 1 */}
        <div
          className="text-ctp-text hover:text-ctp-green p-1"
          onClick={() => {
            alert('Testing!')
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
    </div>
  )
}
