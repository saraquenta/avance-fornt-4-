import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'

// Páginas comunes (Jefe de Evaluaciones, Admin)
import DashboardPage from './pages/DashboardPage'
import PersonalPage from './pages/PersonalPage'
import DisciplinasPage from './pages/DisciplinasPage'
import EvaluacionesPage from './pages/EvaluacionesPage'
import MeritosPage from './pages/MeritosPage'
import BajasPage from './pages/BajasPage'
import ActividadesPage from './pages/ActividadesPage'
import ReportesPage from './pages/ReportesPage'

// Dashboard exclusivo del Comandante (con módulos ML)
import ComandanteDashboard from './pages/ComandanteDashboard'

// Layout estándar con sidebar
function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>
      <Navbar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

// Layout especial para el Comandante (sin sidebar, dashboard completo)
function ComandanteLayout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Mini barra superior con logout */}
      <div className="flex items-center justify-between px-6 py-2 text-xs"
        style={{ background: '#060a06', borderBottom: '1px solid rgba(201,162,39,0.15)' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Sistema EAME</span>
          <span style={{ color: 'rgba(201,162,39,0.5)' }}>·</span>
          <span style={{ color: '#c9a227' }}>MÓDULO COMANDANTE</span>
        </div>
        <button onClick={logout}
          className="px-3 py-1 rounded text-white hover:opacity-80 transition-opacity"
          style={{ background: 'rgba(139,0,0,0.6)', border: '1px solid rgba(139,0,0,0.8)' }}>
          Cerrar Sesión
        </button>
      </div>
      {children}
    </div>
  )
}

// Enrutador según rol
function RoleRouter() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  // El Comandante va directamente a su dashboard ML
  if (user.rol === 'COMANDANTE' || user.rol === 'comandante') {
    return <Navigate to="/comandante" replace />
  }

  // Todos los demás van al dashboard estándar
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Ruta de entrada — redirige según rol */}
          <Route path="/inicio" element={<PrivateRoute><RoleRouter /></PrivateRoute>} />

          {/* ── DASHBOARD DEL COMANDANTE (con ML) ──────────────────── */}
          <Route path="/comandante" element={
            <PrivateRoute allowedRoles={['COMANDANTE', 'comandante']}>
              <ComandanteLayout>
                <ComandanteDashboard />
              </ComandanteLayout>
            </PrivateRoute>
          } />

          {/* ── RUTAS ESTÁNDAR (Jefe Evaluaciones, Admin, etc.) ──── */}
          <Route path="/dashboard" element={
            <PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>
          } />
          <Route path="/personal" element={
            <PrivateRoute><Layout><PersonalPage /></Layout></PrivateRoute>
          } />
          <Route path="/disciplinas" element={
            <PrivateRoute><Layout><DisciplinasPage /></Layout></PrivateRoute>
          } />
          <Route path="/evaluaciones" element={
            <PrivateRoute><Layout><EvaluacionesPage /></Layout></PrivateRoute>
          } />
          <Route path="/meritos" element={
            <PrivateRoute><Layout><MeritosPage /></Layout></PrivateRoute>
          } />
          <Route path="/bajas" element={
            <PrivateRoute><Layout><BajasPage /></Layout></PrivateRoute>
          } />
          <Route path="/actividades" element={
            <PrivateRoute><Layout><ActividadesPage /></Layout></PrivateRoute>
          } />
          <Route path="/reportes" element={
            <PrivateRoute><Layout><ReportesPage /></Layout></PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}