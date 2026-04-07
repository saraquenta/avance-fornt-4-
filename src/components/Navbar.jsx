import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, ClipboardList,
  FileBarChart, LogOut, Shield
} from 'lucide-react'

const links = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/personal',     label: 'Personal',     icon: Users           },
  { to: '/evaluaciones', label: 'Evaluaciones', icon: ClipboardList   },
  { to: '/reportes',     label: 'Reportes',     icon: FileBarChart    },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <aside
      className="w-56 min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0f2e1a 0%, #1a3d26 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} color="#4ade80" />
          <span className="text-white font-bold text-sm">Artes Marciales</span>
        </div>
        <p className="text-xs" style={{ color: '#4ade80', opacity: 0.7 }}>Ejército de Bolivia</p>
      </div>

      {/* Links */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(74,222,128,0.15)' : 'transparent',
                color: active ? '#4ade80' : 'rgba(255,255,255,0.6)',
                borderLeft: active ? '3px solid #4ade80' : '3px solid transparent',
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: '#16a34a' }}
          >
            {user?.nombre?.[0] || 'U'}
          </div>
          <div>
            <p className="text-white text-xs font-semibold">{user?.nombre}</p>
            <p className="text-xs" style={{ color: '#4ade80', opacity: 0.8 }}>{user?.rol}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{ background: '#dc2626' }}
        >
          <LogOut size={14} /> Cerrar Sesion
        </button>
      </div>
    </aside>
  )
}