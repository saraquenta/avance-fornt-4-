// src/pages/cursante/CursanteHorarios.jsx
import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Clock } from 'lucide-react'

const card = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12 }
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const DISC_COLORS = [
  '#cc0000', '#9ca3af', '#6b7280', '#eab308', '#f97316', '#22c55e',
]

export default function CursanteHorarios() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/cursante/horarios/').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f' }}>
      <div style={{ width: 36, height: 36, border: '4px solid #cc0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const { por_dia = {} } = data || {}

  // Colores únicos por disciplina
  const discSet = []
  Object.values(por_dia).flat().forEach(h => {
    if (!discSet.find(d => d === h.disciplina_nombre)) discSet.push(h.disciplina_nombre)
  })
  const discColor = {}
  discSet.forEach((d, i) => { discColor[d] = DISC_COLORS[i % DISC_COLORS.length] })

  return (
    <div style={{ padding: 28, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 8, borderRadius: 10, background: '#cc0000' }}><Clock size={22} color="white" /></div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Mis Horarios</h1>
          <p style={{ fontSize: 11, color: '#6b7280' }}>Horario semanal de entrenamiento</p>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.entries(discColor).map(([disc, color]) => (
          <div key={disc} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${color}15`, border: `1px solid ${color}33` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 11, color, fontWeight: 600 }}>{disc}</span>
          </div>
        ))}
      </div>

      {/* Grid semanal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {DIAS.map(dia => {
          const horarios = por_dia[dia] || []
          return (
            <div key={dia} style={{ ...card, overflow: 'hidden' }}>
              {/* Cabecera del día */}
              <div style={{ padding: '10px 16px', background: horarios.length > 0 ? '#1a0000' : '#111', borderBottom: '1px solid #1f1f1f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: horarios.length > 0 ? '#ff4444' : '#4b5563', fontWeight: 700, fontSize: 13 }}>{dia}</span>
                <span style={{ fontSize: 10, color: '#4b5563' }}>{horarios.length} clase(s)</span>
              </div>

              {/* Bloques de horario */}
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {horarios.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#2a2a2a', fontSize: 12 }}>Sin clases</div>
                ) : horarios.map(h => {
                  const color = discColor[h.disciplina_nombre] || '#6b7280'
                  return (
                    <div key={h.id} style={{ background: '#0f0f0f', border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`, borderRadius: '0 8px 8px 0', padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Clock size={11} color={color} />
                        <span style={{ color, fontWeight: 700, fontSize: 13 }}>{h.hora_inicio_str} – {h.hora_fin_str}</span>
                      </div>
                      <p style={{ color: 'white', fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{h.disciplina_nombre}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#4b5563', fontSize: 10 }}>📍 {h.aula || 'Dojo Principal'}</span>
                        {h.instructor_nombre && <span style={{ color: '#4b5563', fontSize: 10 }}>👤 {h.instructor_nombre}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Vista lista completa */}
      <div style={{ ...card, overflow: 'hidden', marginTop: 24 }}>
        <div style={{ padding: '12px 20px', background: '#1a0000', borderBottom: '1px solid rgba(204,0,0,0.15)' }}>
          <h2 style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Horario Completo</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a0000' }}>
              {['Día', 'Hora Inicio', 'Hora Fin', 'Disciplina', 'Instructor', 'Aula'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.horarios || []).map((h, i) => {
              const color = discColor[h.disciplina_nombre] || '#6b7280'
              return (
                <tr key={h.id} style={{ background: i % 2 === 0 ? '#111' : '#141414', borderBottom: '1px solid #1f1f1f' }}>
                  <td style={{ padding: '10px 16px', color: '#ff4444', fontWeight: 700, fontSize: 12 }}>{h.dia}</td>
                  <td style={{ padding: '10px 16px', color: '#9ca3af', fontSize: 12 }}>{h.hora_inicio_str}</td>
                  <td style={{ padding: '10px 16px', color: '#9ca3af', fontSize: 12 }}>{h.hora_fin_str}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: `${color}15`, color, border: `1px solid ${color}33` }}>{h.disciplina_nombre}</span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 12 }}>{h.instructor_nombre}</td>
                  <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 12 }}>{h.aula || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}