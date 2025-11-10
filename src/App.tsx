import MainLayout from './layouts/MainLayout'
import { AppProvider } from './contexts/AppContext'

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  )
}

export default App

