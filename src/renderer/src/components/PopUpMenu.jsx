export default function PopUpMenu({ children }) {
  return (
    <div className="absolute size-full">
      <div className="absolute bg-ctp-crust size-full opacity-80"></div>

      <div className="absolute size-full flex justify-center">
        <div className="bg-ctp-surface1 size-auto place-self-center">
          <div className="m-3 h-auto w-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
