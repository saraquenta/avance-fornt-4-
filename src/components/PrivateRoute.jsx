import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * PrivateRoute — Protege rutas y opcionalmente restringe por rol.
 *
 * Props:
 *   allowedRoles?: string[]  — si se define, solo esos roles acceden.
 *   redirectTo?: string      — ruta alternativa si no está autenticado.
 */
export default function PrivateRoute({ children, allowedRoles, redirectTo = '/login' }) {
  const { user, loading } = useAuth()

  // Esperar a que cargue el estado de autenticación
  if (loading) return null

  // No autenticado → login
  if (!user) return <Navigate to={redirectTo} replace />

  // Si se definen roles permitidos, verificar
  if (allowedRoles && allowedRoles.length > 0) {
    const rolUsuario      = (user.rol || '').toUpperCase()
    const rolesPermitidos = allowedRoles.map(r => r.toUpperCase())

    if (!rolesPermitidos.includes(rolUsuario)) {
      // Redirigir al área correspondiente según su propio rol
      if (rolUsuario === 'COMANDANTE') return <Navigate to="/comandante" replace />
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}