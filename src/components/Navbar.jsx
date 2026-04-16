import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, ClipboardList,
  FileBarChart, LogOut, Shield, BookOpen,
  Award, UserMinus, Activity
} from 'lucide-react'

const links = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/personal',     label: 'Cursantes',    icon: Users           },
  { to: '/disciplinas',  label: 'Disciplinas',  icon: BookOpen        },
  { to: '/evaluaciones', label: 'Evaluaciones', icon: ClipboardList   },
  { to: '/meritos',      label: 'Méritos',      icon: Award           },
  { to: '/bajas',        label: 'Bajas',        icon: UserMinus       },
  { to: '/actividades',  label: 'Actividades',  icon: Activity        },
  { to: '/reportes',     label: 'Reportes',     icon: FileBarChart    },
]

// PALETA: Negro #0a0a0a, Rojo #cc0000 / #991b1b, Plomo #4b5563 / #9ca3af

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <aside
      className="w-56 min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
        borderRight: '2px solid #cc000033',
      }}
    >
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: '#cc000033' }}>
        <div className="flex items-center gap-2 mb-1">
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            border: '2px solid #cc0000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(204,0,0,0.15)',
            fontSize: 16,
          }}>
            <Shield size={16} color="#cc0000" />
          </div>
          <span className="font-bold text-sm" style={{ color: 'white', letterSpacing: '0.08em' }}>
            EAME
          </span>
        </div>
        <p className="text-xs" style={{ color: '#9ca3af', letterSpacing: '0.12em', marginTop: 2 }}>
          Sistema de Evaluación
        </p>
        <div style={{ height: 1, background: 'linear-gradient(90deg, #cc0000, transparent)', marginTop: 8, opacity: 0.6 }} />
      </div>

      {/* Links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(204,0,0,0.18)' : 'transparent',
                color: active ? '#ff4444' : 'rgba(255,255,255,0.5)',
                borderLeft: active ? '3px solid #cc0000' : '3px solid transparent',
                letterSpacing: '0.03em',
              }}
            >
              <Icon size={15} color={active ? '#cc0000' : undefined} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Línea */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #cc0000, transparent)', margin: '0 16px', opacity: 0.4 }} />

      {/* Usuario */}
      <div className="p-4 border-t" style={{ borderColor: '#cc000022' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(204,0,0,0.2)', color: '#ff4444', border: '1px solid #cc000055' }}>
            {user?.nombre?.[0] || 'U'}
          </div>
          <div>
            <p className="text-white text-xs font-semibold truncate" style={{ maxWidth: 110 }}>{user?.nombre}</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>{user?.rol}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
          style={{
            background: 'rgba(204,0,0,0.25)',
            border: '1px solid #cc000066',
            color: '#ff6666',
            letterSpacing: '0.1em',
          }}
        >
          <LogOut size={13} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}