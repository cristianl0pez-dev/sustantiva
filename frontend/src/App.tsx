import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import DashboardLayout from './pages/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Estudiantes from './pages/Estudiantes'
import EstudianteDetail from './pages/EstudianteDetail'
import Bootcamps from './pages/Bootcamps'
import Tickets from './pages/Tickets'
import TicketDetail from './pages/TicketDetail'
import RiesgoConfig from './pages/RiesgoConfig'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return null
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="estudiantes" element={<Estudiantes />} />
        <Route path="estudiantes/:id" element={<EstudianteDetail />} />
        <Route path="bootcamps" element={<Bootcamps />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="riesgo" element={<RiesgoConfig />} />
      </Route>
    </Routes>
  )
}

export default App
