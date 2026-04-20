import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from './ThemeToggle'
import { LayoutDashboard, Users, ClipboardList, Brain, Stethoscope, LogOut, Shield } from 'lucide-react'

const links = [
  { to: '/comandante',              label: 'Dashboard ML',    icon: LayoutDashboard },
  { to: '/comandante/cursantes',    label: 'Cursantes',       icon: Users           },
  { to: '/comandante/evaluaciones', label: 'Evaluaciones',    icon: ClipboardList   },
  { to: '/comandante/predicciones', label: 'Predicciones ML', icon: Brain           },
  { to: '/comandante/diagnosticos', label: 'Diagnósticos',    icon: Stethoscope     },
]

export default function NavbarComandante() {
  const { user, logout } = useAuth()
  const { isDark }       = useTheme()
  const location         = useLocation()

  return (
    <aside style={{ width: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: isDark ? 'linear-gradient(180deg,#0d1a0f 0%,#111 100%)' : 'linear-gradient(180deg,#1a1a1a 0%,#222 100%)', borderRight: '2px solid rgba(201,162,39,0.2)', flexShrink: 0 }}>

      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(201,162,39,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid #c9a227', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,162,39,0.15)', flexShrink: 0 }}>
            <Shield size={18} color="#c9a227" />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: '0.08em' }}>EAME</p>
            <p style={{ color: '#c9a227', fontSize: 10, opacity: 0.8 }}>Sistema ML</p>
          </div>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)' }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: '#c9a227', letterSpacing: '0.12em' }}>MÓDULO COMANDANTE</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Inteligencia Artificial</p>
        </div>
      </div>

      {/* Links */}
      <nav style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (to !== '/comandante' && location.pathname.startsWith(to))
          return (
            <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: active ? 'rgba(201,162,39,0.15)' : 'transparent', color: active ? '#c9a227' : 'rgba(255,255,255,0.5)', borderLeft: active ? '3px solid #c9a227' : '3px solid transparent', transition: 'all 0.2s' }}>
              <Icon size={15} color={active ? '#c9a227' : undefined} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Separador */}
      <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,162,39,0.3),transparent)', margin: '0 14px' }} />

      {/* Toggle tema */}
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', marginBottom: 8 }}>APARIENCIA</p>
        <ThemeToggle />
      </div>

      {/* Separador */}
      <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,162,39,0.2),transparent)', margin: '0 14px' }} />

      {/* Estado ML */}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>Motor ML Activo</span>
        </div>
      </div>

      {/* Usuario */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(201,162,39,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,162,39,0.2)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {user?.nombre?.[0] || 'C'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: 'white', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{user?.nombre}</p>
            <p style={{ fontSize: 10, color: '#c9a227', opacity: 0.7 }}>Comandante</p>
          </div>
        </div>
        <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#ff8888', background: 'rgba(139,0,0,0.25)', border: '1px solid rgba(139,0,0,0.4)', cursor: 'pointer' }}>
          <LogOut size={13} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}