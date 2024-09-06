import Versions from './components/Versions'

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <h1 className="text-3xl font-bold underline text-center">Hello world!</h1>
    </>
  )
}

export default App
