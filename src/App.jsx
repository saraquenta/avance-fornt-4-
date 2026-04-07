import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PersonalPage from './pages/PersonalPage'
import EvaluacionesPage from './pages/EvaluacionesPage'
import ReportesPage from './pages/ReportesPage'

function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>
      <Navbar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing institucional — página de inicio */}
          <Route path="/" element={<LandingPage />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas privadas del sistema */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout><DashboardPage /></Layout>
            </PrivateRoute>
          }/>

          <Route path="/personal" element={
            <PrivateRoute>
              <Layout><PersonalPage /></Layout>
            </PrivateRoute>
          }/>

          <Route path="/evaluaciones" element={
            <PrivateRoute>
              <Layout><EvaluacionesPage /></Layout>
            </PrivateRoute>
          }/>

          <Route path="/reportes" element={
            <PrivateRoute>
              <Layout><ReportesPage /></Layout>
            </PrivateRoute>
          }/>

          {/* Cualquier ruta desconocida → landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}