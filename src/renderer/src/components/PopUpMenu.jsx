export default function PopUpMenu({ onClick, children }) {
  return (
    <div className="absolute size-full">
      <div className="absolute bg-ctp-crust size-full opacity-80" onClick={onClick}></div>

      <div className="absolute size-full flex justify-center pointer-events-none">
        <div className="bg-ctp-surface1 size-auto place-self-center shadow-lg pointer-events-auto">
          <div className="m-5 h-auto w-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
