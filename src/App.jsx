// src/App.jsx — SPRINT 4 actualizado
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import NavbarComandante from './components/NavbarComandante'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'

// Páginas Admin (sprints anteriores)
import DashboardPage    from './pages/DashboardPage'
import PersonalPage     from './pages/PersonalPage'
import DisciplinasPage  from './pages/DisciplinasPage'
import EvaluacionesPage from './pages/EvaluacionesPage'
import MeritosPage      from './pages/MeritosPage'
import BajasPage        from './pages/BajasPage'
import ActividadesPage  from './pages/ActividadesPage'
import ReportesPage     from './pages/ReportesPage'

// Páginas Comandante
import ComandanteDashboard    from './pages/ComandanteDashboard'
import ComandanteCursantes    from './pages/ComandanteCursantes'
import ComandanteEvaluaciones from './pages/ComandanteEvaluaciones'
import ComandantePredicciones from './pages/ComandantePredicciones'
import ComandanteDiagnosticos from './pages/ComandanteDiagnosticos'

// ── SPRINT 4: Nuevas páginas ──────────────────────────────────────────────
import GraficosPage       from './pages/GraficosPage'
import BibliotecaTecnicas from './pages/BibliotecaTecnicas'

function Layout({ children }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0f0f0f' }}>
      <Navbar />
      <main style={{ flex:1, overflowY:'auto' }}>{children}</main>
    </div>
  )
}

function LayoutComandante({ children }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <NavbarComandante />
      <main style={{ flex:1, overflowY:'auto' }}>{children}</main>
    </div>
  )
}

function RoleRouter() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if ((user.rol||'').toUpperCase()==='COMANDANTE') return <Navigate to="/comandante" replace />
  return <Navigate to="/dashboard" replace />
}

function ComandanteRoute({ children }) {
  return (
    <PrivateRoute allowedRoles={['COMANDANTE']}>
      <LayoutComandante>{children}</LayoutComandante>
    </PrivateRoute>
  )
}

function AdminRoute({ children }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/"       element={<LandingPage />} />
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/inicio" element={<PrivateRoute><RoleRouter /></PrivateRoute>} />

            {/* COMANDANTE */}
            <Route path="/comandante"              element={<ComandanteRoute><ComandanteDashboard /></ComandanteRoute>} />
            <Route path="/comandante/cursantes"    element={<ComandanteRoute><ComandanteCursantes /></ComandanteRoute>} />
            <Route path="/comandante/evaluaciones" element={<ComandanteRoute><ComandanteEvaluaciones /></ComandanteRoute>} />
            <Route path="/comandante/predicciones" element={<ComandanteRoute><ComandantePredicciones /></ComandanteRoute>} />
            <Route path="/comandante/diagnosticos" element={<ComandanteRoute><ComandanteDiagnosticos /></ComandanteRoute>} />

            {/* ADMIN y otros */}
            <Route path="/dashboard"    element={<AdminRoute><DashboardPage /></AdminRoute>} />
            <Route path="/personal"     element={<AdminRoute><PersonalPage /></AdminRoute>} />
            <Route path="/disciplinas"  element={<AdminRoute><DisciplinasPage /></AdminRoute>} />
            <Route path="/evaluaciones" element={<AdminRoute><EvaluacionesPage /></AdminRoute>} />
            <Route path="/meritos"      element={<AdminRoute><MeritosPage /></AdminRoute>} />
            <Route path="/bajas"        element={<AdminRoute><BajasPage /></AdminRoute>} />
            <Route path="/actividades"  element={<AdminRoute><ActividadesPage /></AdminRoute>} />
            <Route path="/reportes"     element={<AdminRoute><ReportesPage /></AdminRoute>} />

            {/* ── SPRINT 4: Nuevas rutas ─────────────────────────────────── */}
            <Route path="/graficos"   element={<AdminRoute><GraficosPage /></AdminRoute>} />
            <Route path="/biblioteca" element={<AdminRoute><BibliotecaTecnicas /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
