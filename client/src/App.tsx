import { Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Signin from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectRoute from './components/ProtectRoute'
function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Signup />} />
        <Route path='/login' element={<Signin />} />
        <Route path='/dashboard' element={<ProtectRoute><Dashboard /></ProtectRoute>} />

      </Routes>

    </>
  )
}

export default App