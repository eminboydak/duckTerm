import IconMenu from './components/IconMenu'
import MainSection from './components/MainSection'
import PopUpMenu from './components/PopUpMenu'
import StatusBar from './components/StatusBar'

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="ctp-macchiato bg-ctp-base flex flex-col h-screen">
        <IconMenu />
        <StatusBar />
        <MainSection />
      </div>
    </>
  )
}

export default App
