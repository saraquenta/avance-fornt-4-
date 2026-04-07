import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  FileBarChart, Download, User, Users,
  Star, TrendingUp, TrendingDown, Award
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, LineChart, Line, Legend
} from 'recharts'

const NIVEL_COLOR = {
  EXCELENTE: '#16a34a',
  BUENO:     '#2563eb',
  REGULAR:   '#d97706',
  CRITICO:   '#dc2626',
}

function getNivel(p) {
  if (p >= 85) return 'EXCELENTE'
  if (p >= 70) return 'BUENO'
  if (p >= 50) return 'REGULAR'
  return 'CRITICO'
}

export default function ReportesPage() {
  const [stats, setStats]         = useState(null)
  const [evaluaciones, setEvals]  = useState([])
  const [personal, setPersonal]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [descargando, setDesc]    = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/evaluaciones/dashboard/stats/'),
      api.get('/evaluaciones/'),
      api.get('/personal/'),
    ]).then(([sRes, eRes, pRes]) => {
      setStats(sRes.data)
      setEvals(Array.isArray(eRes.data) ? eRes.data : eRes.data.results || [])
      setPersonal(Array.isArray(pRes.data) ? pRes.data : pRes.data.results || [])
    }).finally(() => setLoading(false))
  }, [])

  const descargarIndividual = async (personalId, nombre) => {
    setDesc(personalId)
    try {
      const res = await api.get(`/evaluaciones/reporte/individual/${personalId}/`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a   = document.createElement('a')
      a.href    = url
      a.download = `reporte_${nombre}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally { setDesc(null) }
  }

  const descargarGeneral = async () => {
    setDesc('general')
    try {
      const res = await api.get('/evaluaciones/reporte/general/', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a   = document.createElement('a')
      a.href    = url
      a.download = 'reporte_general_unidad.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } finally { setDesc(null) }
  }

  // Datos para grafico de niveles
  const dataNiveles = stats ? [
    { name: 'Excelente', value: stats.niveles?.EXCELENTE || 0, color: '#16a34a' },
    { name: 'Bueno',     value: stats.niveles?.BUENO     || 0, color: '#2563eb' },
    { name: 'Regular',   value: stats.niveles?.REGULAR   || 0, color: '#d97706' },
    { name: 'Critico',   value: stats.niveles?.CRITICO   || 0, color: '#dc2626' },
  ] : []

  // Ranking de personal
  const ranking = personal.map(p => {
    const evs = evaluaciones.filter(e => e.personal === p.id)
    const avg  = evs.length ? Math.round(evs.reduce((s, e) => s + e.puntaje_total, 0) / evs.length * 10) / 10 : 0
    return { ...p, promedio: avg, totalEvals: evs.length }
  }).filter(p => p.totalEvals > 0).sort((a, b) => b.promedio - a.promedio)

  // Datos para grafico de barras
  const dataRanking = ranking.slice(0, 8).map(p => ({
    name:     `${p.apellido.substring(0,8)}`,
    promedio: p.promedio,
    color:    NIVEL_COLOR[getNivel(p.promedio)]
  }))

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400">Cargando reportes...</p>
    </div>
  )

  return (
    <div className="p-8 min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: '#7c3aed' }}>
            <FileBarChart size={24} color="white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Reportes y Analisis</h1>
            <p className="text-xs" style={{ color: '#64748b' }}>Visualizacion y descarga de reportes PDF</p>
          </div>
        </div>
        <button
          onClick={descargarGeneral}
          disabled={descargando === 'general'}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
          style={{ background: '#7c3aed', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}
        >
          <Download size={16} />
          {descargando === 'general' ? 'Generando...' : 'Reporte General PDF'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Personal Evaluado', value: ranking.length,              icon: Users,       color: '#2563eb' },
          { label: 'Total Evaluaciones', value: evaluaciones.length,         icon: FileBarChart, color: '#7c3aed' },
          { label: 'Promedio General',   value: stats?.promedio_general || 0, icon: TrendingUp,  color: '#16a34a' },
          { label: 'Alertas Criticas',   value: stats?.alertas || 0,          icon: TrendingDown, color: '#dc2626' },
        ].map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div className="p-2.5 rounded-xl" style={{ background: c.color }}>
                <Icon size={18} color="white" />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#64748b' }}>{c.label}</p>
                <p className="text-xl font-bold" style={{ color: c.color }}>{c.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Graficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Grafico de barras */}
        <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: '#0f172a' }}>Ranking de Promedios por Personal</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dataRanking} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                formatter={(v) => [`${v} pts`, 'Promedio']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                {dataRanking.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grafico de pie */}
        <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: '#0f172a' }}>Distribucion por Nivel de Desempeno</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dataNiveles}
                cx="50%" cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
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

      {/* Tabla de ranking con descarga individual */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-4" style={{ background: '#1e3a5f' }}>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Award size={16} /> Ranking Completo del Personal
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['#', 'Personal', 'Rango', 'Especialidad', 'Evaluaciones', 'Promedio', 'Nivel', 'Reporte'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranking.map((p, i) => {
              const nivel = getNivel(p.promedio)
              const nc    = NIVEL_COLOR[nivel]
              return (
                <tr
                  key={p.id}
                  style={{ background: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: i < 3 ? ['#f59e0b','#9ca3af','#b45309'][i] : '#e2e8f0', color: i < 3 ? 'white' : '#64748b', display: 'inline-flex' }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: nc }}>
                        {p.apellido[0]}
                      </div>
                      <span className="font-semibold text-xs" style={{ color: '#0f172a' }}>{p.apellido} {p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{p.rango?.replace('_',' ')}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{p.especialidad?.replace('_',' ')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ background: '#eff6ff', color: '#2563eb' }}>
                      {p.totalEvals}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star size={12} color="#d97706" fill="#d97706" />
                      <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{p.promedio}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${nc}20`, color: nc }}>
                      {nivel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => descargarIndividual(p.id, `${p.apellido}_${p.nombre}`)}
                      disabled={descargando === p.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: '#7c3aed' }}
                    >
                      <Download size={12} />
                      {descargando === p.id ? '...' : 'PDF'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}