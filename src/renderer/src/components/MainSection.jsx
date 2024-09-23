export default function MainSection() {
  return (
    <div className="flex-1">
      <div className="flex h-full p-1">
        <div className="bg-ctp-surface0 m-1 basis-1/4">
          <div className="flex flex-col p-1 h-full">
            {/* Send Sequences */}
            <div className="bg-ctp-surface1 m-1 flex-1">
              <h1 className="text-center text-ctp-text">3.1.1</h1>
            </div>

            {/* Recieve Sequences */}
            <div className="bg-ctp-surface1 m-1 flex-1">
              <h1 className="text-center text-ctp-text">3.1.2</h1>
            </div>
          </div>
        </div>

        <div className="bg-ctp-surface0 m-1 basis-3/4">
          <div className="flex flex-col p-1 h-full">
            {/* Communication Window */}
            <div className="bg-ctp-surface1 m-1 flex-1">
              <h1 className="text-center text-ctp-text">3.2</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
