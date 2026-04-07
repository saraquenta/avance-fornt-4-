import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Users, ClipboardList, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Award, Activity
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const NIVEL_COLORS = {
  EXCELENTE: '#16a34a',
  BUENO:     '#2563eb',
  REGULAR:   '#d97706',
  CRITICO:   '#dc2626',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)

  const cargarStats = () => {
    api.get('/evaluaciones/dashboard/stats/')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargarStats()
    const intervalo = setInterval(cargarStats, 60000)
    return () => clearInterval(intervalo)
  }, [])

  // Datos para graficos
  const dataNiveles = stats ? [
    { name: 'Excelente', value: stats.niveles?.EXCELENTE || 0, color: '#16a34a' },
    { name: 'Bueno',     value: stats.niveles?.BUENO     || 0, color: '#2563eb' },
    { name: 'Regular',   value: stats.niveles?.REGULAR   || 0, color: '#d97706' },
    { name: 'Critico',   value: stats.niveles?.CRITICO   || 0, color: '#dc2626' },
  ] : []

  const dataRecientes = stats?.recientes?.map((ev, i) => ({
    name:    ev.personal?.split(' ').pop() || `Eval ${i+1}`,
    puntaje: ev.puntaje,
  })) || []

  const dataArea = stats?.recientes?.map((ev, i) => ({
    name:    ev.fecha || `D${i+1}`,
    puntaje: ev.puntaje,
    meta:    70,
  })) || []

  const cards = [
    { label: 'Personal Activo',      value: stats?.personal_activo  || 0,  icon: Users,         color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    { label: 'Evaluaciones del Mes', value: stats?.evaluaciones_mes || 0,  icon: ClipboardList, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Promedio General',     value: stats?.promedio_general || '--', icon: TrendingUp,   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    { label: 'Alertas Activas',      value: stats?.alertas          || 0,  icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  ]

  const accesos = [
    { label: 'Gestionar Personal',   icon: Users,         ruta: '/personal',     color: '#16a34a' },
    { label: 'Registrar Evaluacion', icon: ClipboardList, ruta: '/evaluaciones', color: '#2563eb' },
    { label: 'Ver Reportes',         icon: Award,         ruta: '/reportes',     color: '#7c3aed' },
    { label: 'Historial Actividad',  icon: Activity,      ruta: '/evaluaciones', color: '#d97706' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p style={{ color: '#64748b' }}>Cargando dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
          Rol: <span className="font-semibold" style={{ color: '#16a34a' }}>{user?.rol}</span>
          &nbsp;·&nbsp;Sistema de Evaluacion de Desempeno Militar
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} className="rounded-xl p-4 flex items-center gap-3 transition-transform hover:-translate-y-1"
              style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <div className="rounded-xl p-2.5" style={{ background: c.color }}>
                <Icon size={20} color="white" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#64748b' }}>{c.label}</p>
                <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Graficos fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* BarChart — puntajes recientes */}
        <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: '#0f172a' }}>
            Ultimas Evaluaciones — Puntaje
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataRecientes} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                formatter={(v) => [`${v} pts`, 'Puntaje']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="puntaje" radius={[6,6,0,0]}>
                {dataRecientes.map((entry, i) => (
                  <Cell key={i} fill={
                    entry.puntaje >= 85 ? '#16a34a' :
                    entry.puntaje >= 70 ? '#2563eb' :
                    entry.puntaje >= 50 ? '#d97706' : '#dc2626'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PieChart — distribucion por nivel */}
        <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: '#0f172a' }}>
            Distribucion por Nivel de Desempeno
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dataNiveles.filter(d => d.value > 0)}
                cx="50%" cy="50%"
                outerRadius={75}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {dataNiveles.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graficos fila 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* AreaChart — progreso vs meta */}
        <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: '#0f172a' }}>
            Progreso vs Meta (70 puntos)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dataArea} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPuntaje" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="puntaje" stroke="#16a34a" strokeWidth={2} fill="url(#colorPuntaje)" name="Puntaje" />
              <Line type="monotone" dataKey="meta" stroke="#dc2626" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Meta" />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Acceso rapido + Estado */}
        <div className="grid grid-rows-2 gap-4">
          {/* Acceso rapido */}
          <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 className="text-sm font-bold mb-3" style={{ color: '#0f172a' }}>Acceso Rapido</h2>
            <div className="grid grid-cols-2 gap-2">
              {accesos.map((a, i) => {
                const Icon = a.icon
                return (
                  <button key={i} onClick={() => navigate(a.ruta)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all hover:opacity-90 hover:scale-105"
                    style={{ background: a.color, border: 'none', cursor: 'pointer' }}>
                    <Icon size={14} color="white" />
                    <span className="text-white text-xs font-semibold">{a.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Estado del sistema */}
          <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 className="text-sm font-bold mb-3" style={{ color: '#0f172a' }}>Estado del Sistema</h2>
            <div className="space-y-2">
              {[
                { label: 'Backend Django',        ok: true  },
                { label: 'Base de datos',         ok: true  },
                { label: 'Autenticacion JWT',     ok: true  },
                { label: 'Evaluaciones activas',  ok: true  },
                { label: 'Motor ML',              ok: false },
                { label: 'Reportes PDF',          ok: true  },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.ok
                    ? <CheckCircle size={14} color="#16a34a" />
                    : <Clock       size={14} color="#d97706" />}
                  <span className="text-xs flex-1" style={{ color: item.ok ? '#15803d' : '#92400e' }}>
                    {item.label}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: item.ok ? '#dcfce7' : '#fef9c3', color: item.ok ? '#15803d' : '#92400e' }}>
                    {item.ok ? 'Activo' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluaciones recientes */}
      {stats?.recientes?.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="px-5 py-3" style={{ background: '#1e3a2f' }}>
            <h2 className="text-sm font-bold text-white">Evaluaciones Recientes</h2>
          </div>
          <table className="w-full text-sm" style={{ background: 'white' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Personal', 'Periodo', 'Fecha', 'Puntaje', 'Nivel'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recientes.map((ev, i) => {
                const nivel = ev.puntaje >= 85 ? 'EXCELENTE' : ev.puntaje >= 70 ? 'BUENO' : ev.puntaje >= 50 ? 'REGULAR' : 'CRITICO'
                const color = NIVEL_COLORS[nivel]
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="px-4 py-2 font-medium text-xs" style={{ color: '#0f172a' }}>{ev.personal}</td>
                    <td className="px-4 py-2 text-xs" style={{ color: '#64748b' }}>{ev.periodo}</td>
                    <td className="px-4 py-2 text-xs" style={{ color: '#64748b' }}>{ev.fecha}</td>
                    <td className="px-4 py-2">
                      <span className="font-bold text-sm" style={{ color }}>{ev.puntaje}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: `${color}20`, color }}>
                        {nivel}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}