import IconMenu from './components/IconMenu'
import MainSection from './components/MainSection'
import PopUpMenu from './components/PopUpMenu'
import StatusBar from './components/StatusBar'

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="ctp-mocha bg-ctp-base flex flex-col h-screen">
        <IconMenu />
        <StatusBar />
        <MainSection />
        <PopUpMenu>
          <div className="bg-ctp-surface2 size-80"></div>
        </PopUpMenu>
      </div>
    </>
  )
}

export default App
