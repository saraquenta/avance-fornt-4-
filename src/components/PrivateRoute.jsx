import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * PrivateRoute — Protege rutas y opcionalmente restringe por rol.
 *
 * Props:
 * allowedRoles?: string[]  — si se define, solo esos roles acceden.
 * redirectTo?: string      — ruta alternativa si no está autenticado.
 */
export default function PrivateRoute({ children, allowedRoles, redirectTo = '/login' }) {
  const { user, loading } = useAuth()

  // 1. Esperar a que cargue el estado de autenticación (evita parpadeos)
  if (loading) return null

  // 2. Si no hay usuario autenticado -> redirigir al login
  if (!user) return <Navigate to={redirectTo} replace />

  // 3. Si se definen roles permitidos, verificar el acceso
  if (allowedRoles && allowedRoles.length > 0) {
    const rolUsuario      = (user.rol || '').toUpperCase()
    const rolesPermitidos = allowedRoles.map(r => r.toUpperCase())

    if (!rolesPermitidos.includes(rolUsuario)) {
      // Redirigir al área correspondiente según su propio rol si intenta acceder a ruta prohibida
      if (rolUsuario === 'COMANDANTE') {
        return <Navigate to="/comandante" replace />
      }
      
      if (rolUsuario === 'CURSANTE') {
        return <Navigate to="/cursante/inicio" replace />
      }

      // Por defecto para administradores u otros roles
      return <Navigate to="/dashboard" replace />
    }
  }

  // 4. Si todo está correcto, renderizar los componentes hijos
  return children
}