// src/components/NavbarCursante.jsx
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home, BookOpen, Calendar, User,
  Award, Clock, LogOut, Shield,
} from 'lucide-react'

const links = [
  { to: '/cursante/inicio',          label: 'Inicio',          icon: Home     },
  { to: '/cursante/asignaturas',     label: 'Mis Asignaturas', icon: BookOpen },
  { to: '/cursante/calificaciones',  label: 'Calificaciones',  icon: Award    },
  { to: '/cursante/horarios',        label: 'Horarios',        icon: Clock    },
  { to: '/cursante/calendario',      label: 'Calendario',      icon: Calendar },
  { to: '/cursante/perfil',          label: 'Mi Perfil',       icon: User     },
]

export default function NavbarCursante() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <aside style={{
      width: 220, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
      borderRight: '2px solid rgba(204,0,0,0.25)', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(204,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', border: '2px solid #cc0000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(204,0,0,0.15)', flexShrink: 0,
          }}>
            <Shield size={18} color="#cc0000" />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em' }}>EAME</p>
            <p style={{ color: '#cc0000', fontSize: 9, opacity: 0.8 }}>Portal Cursante</p>
          </div>
        </div>
        <div style={{
          padding: '6px 10px', borderRadius: 8,
          background: 'rgba(204,0,0,0.08)', border: '1px solid rgba(204,0,0,0.2)',
        }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: '#cc0000', letterSpacing: '0.1em' }}>MÓDULO CURSANTE</p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Sistema EAME · Bolivia</p>
        </div>
      </div>

      {/* Links */}
      <nav style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none',
              background: active ? 'rgba(204,0,0,0.15)' : 'transparent',
              color: active ? '#ff4444' : 'rgba(255,255,255,0.5)',
              borderLeft: active ? '3px solid #cc0000' : '3px solid transparent',
              transition: 'all 0.2s',
            }}>
              <Icon size={15} color={active ? '#cc0000' : undefined} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Separador */}
      <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(204,0,0,0.3),transparent)', margin: '0 14px' }} />

      {/* Usuario */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(204,0,0,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'rgba(204,0,0,0.2)',
            color: '#cc0000', border: '1px solid rgba(204,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
          }}>
            {(user?.nombre || user?.username || 'C')[0]}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: 'white', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>
              {user?.nombre || user?.username}
            </p>
            <p style={{ fontSize: 10, color: '#cc0000', opacity: 0.7 }}>Cursante</p>
          </div>
        </div>
        <button onClick={logout} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
          color: '#ff8888', background: 'rgba(139,0,0,0.25)', border: '1px solid rgba(139,0,0,0.4)',
          cursor: 'pointer',
        }}>
          <LogOut size={13} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}