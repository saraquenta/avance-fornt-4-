import { useEffect, useState } from 'react'
import api from '../services/api'
import { FileBarChart, Download, Users, Star, TrendingUp, TrendingDown, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const NIVEL_COLOR = { EXCELENTE: '#cc0000', BUENO: '#9ca3af', REGULAR: '#6b7280', CRITICO: '#881111' }
function getNivel(p) {
  if (p >= 85) return 'EXCELENTE'
  if (p >= 70) return 'BUENO'
  if (p >= 50) return 'REGULAR'
  return 'CRITICO'
}

const cardStyle = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }

export default function ReportesPage() {
  const [stats, setStats]        = useState(null)
  const [evaluaciones, setEvals] = useState([])
  const [personal, setPersonal]  = useState([])
  const [loading, setLoading]    = useState(true)
  const [descargando, setDesc]   = useState(null)

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
      const a = document.createElement('a'); a.href = url; a.download = `reporte_${nombre}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } finally { setDesc(null) }
  }

  const descargarGeneral = async () => {
    setDesc('general')
    try {
      const res = await api.get('/evaluaciones/reporte/general/', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = 'reporte_general_unidad.pdf'; a.click()
      URL.revokeObjectURL(url)
    } finally { setDesc(null) }
  }

  const dataNiveles = stats ? [
    { name: 'Excelente', value: stats.niveles?.EXCELENTE || 0, color: '#cc0000' },
    { name: 'Bueno',     value: stats.niveles?.BUENO     || 0, color: '#4b5563' },
    { name: 'Regular',   value: stats.niveles?.REGULAR   || 0, color: '#374151' },
    { name: 'Critico',   value: stats.niveles?.CRITICO   || 0, color: '#881111' },
  ] : []

  const ranking = personal.map(p => {
    const evs = evaluaciones.filter(e => e.personal === p.id)
    const avg = evs.length ? Math.round(evs.reduce((s,e) => s + e.puntaje_total, 0) / evs.length * 10) / 10 : 0
    return { ...p, promedio: avg, totalEvals: evs.length }
  }).filter(p => p.totalEvals > 0).sort((a,b) => b.promedio - a.promedio)

  const dataRanking = ranking.slice(0, 8).map(p => ({
    name: p.apellido.substring(0, 8),
    promedio: p.promedio,
    color: NIVEL_COLOR[getNivel(p.promedio)]
  }))

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #cc0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#6b7280', fontSize: 12 }}>Cargando reportes...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 10, background: '#cc0000' }}>
            <FileBarChart size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Reportes y Análisis</h1>
            <p style={{ fontSize: 11, color: '#6b7280' }}>Visualización y descarga de reportes PDF</p>
          </div>
        </div>
        <button onClick={descargarGeneral} disabled={descargando === 'general'}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', background: '#cc0000', border: 'none', boxShadow: '0 4px 14px rgba(204,0,0,0.4)', opacity: descargando === 'general' ? 0.6 : 1 }}>
          <Download size={15} />{descargando === 'general' ? 'Generando...' : 'Reporte General PDF'}
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Personal Evaluado',  value: ranking.length,              icon: Users,       color: '#cc0000' },
          { label: 'Total Evaluaciones', value: evaluaciones.length,         icon: FileBarChart,color: '#9ca3af' },
          { label: 'Promedio General',   value: stats?.promedio_general || 0, icon: TrendingUp,  color: '#cc0000' },
          { label: 'Alertas Críticas',   value: stats?.alertas || 0,         icon: TrendingDown,color: '#881111' },
        ].map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} style={{ ...cardStyle, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${c.color}18`, border: `1px solid ${c.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={c.color} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#6b7280' }}>{c.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ ...cardStyle, padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 16 }}>Ranking de Promedios</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dataRanking} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4b5563' }} />
              <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: '#4b5563' }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 8, fontSize: 12, color: 'white' }} />
              <Bar dataKey="promedio" radius={[6,6,0,0]}>
                {dataRanking.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...cardStyle, padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 16 }}>Distribución por Nivel</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={dataNiveles.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={80}
                dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false}>
                {dataNiveles.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla ranking */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: '#1a0000', borderBottom: '1px solid rgba(204,0,0,0.15)' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={15} color="#cc0000" /> Ranking Completo del Personal
          </h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a0000', borderBottom: '1px solid #1f1f1f' }}>
              {['#','Personal','Rango','Especialidad','Evaluaciones','Promedio','Nivel','Reporte'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranking.map((p, i) => {
              const nivel = getNivel(p.promedio)
              const nc = NIVEL_COLOR[nivel]
              return (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#111' : '#141414', borderBottom: '1px solid #1f1f1f' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: i < 3 ? 'rgba(204,0,0,0.2)' : '#1a1a1a', color: i < 3 ? '#ff4444' : '#6b7280', border: `1px solid ${i < 3 ? 'rgba(204,0,0,0.3)' : '#2a2a2a'}` }}>
                      {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${nc}22`, border: `1px solid ${nc}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: nc, fontSize: 11, fontWeight: 700 }}>{p.apellido[0]}</div>
                      <span style={{ fontWeight: 600, color: 'white', fontSize: 12 }}>{p.apellido} {p.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 12 }}>{p.rango?.replace('_',' ')}</td>
                  <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 12 }}>{p.especialidad?.replace('_',' ')}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: 'rgba(204,0,0,0.1)', color: '#cc0000', border: '1px solid rgba(204,0,0,0.2)' }}>{p.totalEvals}</span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} color="#cc0000" fill="#cc0000" />
                      <span style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{p.promedio}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${nc}22`, color: nc, border: `1px solid ${nc}44` }}>{nivel}</span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => descargarIndividual(p.id, `${p.apellido}_${p.nombre}`)} disabled={descargando === p.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'white', background: '#cc0000', border: 'none', cursor: 'pointer', opacity: descargando === p.id ? 0.6 : 1 }}>
                      <Download size={11} />{descargando === p.id ? '...' : 'PDF'}
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