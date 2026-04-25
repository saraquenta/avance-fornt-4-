// src/App.jsx — COMPLETO ACTUALIZADO
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import NavbarComandante from './components/NavbarComandante'
import NavbarCursante from './components/NavbarCursante'   // ← NUEVO
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'

// Admin pages
import DashboardPage    from './pages/DashboardPage'
import PersonalPage     from './pages/PersonalPage'
import DisciplinasPage  from './pages/DisciplinasPage'
import EvaluacionesPage from './pages/EvaluacionesPage'
import MeritosPage      from './pages/MeritosPage'
import BajasPage        from './pages/BajasPage'
import ActividadesPage  from './pages/ActividadesPage'
import ReportesPage     from './pages/ReportesPage'
import GraficosPage     from './pages/GraficosPage'
import BibliotecaTecnicas from './pages/BibliotecaTecnicas'

// Comandante pages
import ComandanteDashboard    from './pages/ComandanteDashboard'
import ComandanteCursantes    from './pages/ComandanteCursantes'
import ComandanteEvaluaciones from './pages/ComandanteEvaluaciones'
import ComandantePredicciones from './pages/ComandantePredicciones'
import ComandanteDiagnosticos from './pages/ComandanteDiagnosticos'

// Cursante pages  ← NUEVO
import CursanteInicio         from './pages/cursante/CursanteInicio'
import CursanteMisAsignaturas from './pages/cursante/CursanteMisAsignaturas'
import CursanteCalificaciones from './pages/cursante/CursanteCalificaciones'
import CursanteHorarios       from './pages/cursante/CursanteHorarios'
import CursanteCalendario     from './pages/cursante/CursanteCalendario'
import CursantePerfil         from './pages/cursante/CursantePerfil'

// ── Layouts ──────────────────────────────────────────────────────────
function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f' }}>
      <Navbar />
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  )
}

function LayoutComandante({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <NavbarComandante />
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  )
}

function LayoutCursante({ children }) {         // ← NUEVO
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f' }}>
      <NavbarCursante />
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  )
}

// ── Router por rol ────────────────────────────────────────────────────
function RoleRouter() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const rol = (user.rol || '').toUpperCase()
  if (rol === 'COMANDANTE') return <Navigate to="/comandante" replace />
  if (rol === 'CURSANTE')   return <Navigate to="/cursante/inicio" replace />
  return <Navigate to="/dashboard" replace />
}

// ── Wrappers de protección ───────────────────────────────────────────
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

function CursanteRoute({ children }) {          // ← NUEVO
  return (
    <PrivateRoute allowedRoles={['CURSANTE']}>
      <LayoutCursante>{children}</LayoutCursante>
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

            {/* ── CURSANTE ─────────────────────────────────────────── */}
            <Route path="/cursante/inicio"         element={<CursanteRoute><CursanteInicio /></CursanteRoute>} />
            <Route path="/cursante/asignaturas"    element={<CursanteRoute><CursanteMisAsignaturas /></CursanteRoute>} />
            <Route path="/cursante/calificaciones" element={<CursanteRoute><CursanteCalificaciones /></CursanteRoute>} />
            <Route path="/cursante/horarios"       element={<CursanteRoute><CursanteHorarios /></CursanteRoute>} />
            <Route path="/cursante/calendario"     element={<CursanteRoute><CursanteCalendario /></CursanteRoute>} />
            <Route path="/cursante/perfil"         element={<CursanteRoute><CursantePerfil /></CursanteRoute>} />

            {/* ── COMANDANTE ─────────────────────────────────────────*/}
            <Route path="/comandante"              element={<ComandanteRoute><ComandanteDashboard /></ComandanteRoute>} />
            <Route path="/comandante/cursantes"    element={<ComandanteRoute><ComandanteCursantes /></ComandanteRoute>} />
            <Route path="/comandante/evaluaciones" element={<ComandanteRoute><ComandanteEvaluaciones /></ComandanteRoute>} />
            <Route path="/comandante/predicciones" element={<ComandanteRoute><ComandantePredicciones /></ComandanteRoute>} />
            <Route path="/comandante/diagnosticos" element={<ComandanteRoute><ComandanteDiagnosticos /></ComandanteRoute>} />

            {/* ── ADMIN ───────────────────────────────────────────── */}
            <Route path="/dashboard"    element={<AdminRoute><DashboardPage /></AdminRoute>} />
            <Route path="/personal"     element={<AdminRoute><PersonalPage /></AdminRoute>} />
            <Route path="/disciplinas"  element={<AdminRoute><DisciplinasPage /></AdminRoute>} />
            <Route path="/evaluaciones" element={<AdminRoute><EvaluacionesPage /></AdminRoute>} />
            <Route path="/meritos"      element={<AdminRoute><MeritosPage /></AdminRoute>} />
            <Route path="/bajas"        element={<AdminRoute><BajasPage /></AdminRoute>} />
            <Route path="/actividades"  element={<AdminRoute><ActividadesPage /></AdminRoute>} />
            <Route path="/reportes"     element={<AdminRoute><ReportesPage /></AdminRoute>} />
            <Route path="/graficos"     element={<AdminRoute><GraficosPage /></AdminRoute>} />
            <Route path="/biblioteca"   element={<AdminRoute><BibliotecaTecnicas /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}