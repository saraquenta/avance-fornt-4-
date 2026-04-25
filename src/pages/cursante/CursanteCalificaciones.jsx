// src/pages/cursante/CursanteCalificaciones.jsx
import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Award, ChevronDown, ChevronUp, Star } from 'lucide-react'

const card = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12 }

const nivelInfo = (p) => {
  if (p >= 85) return { label: 'EXCELENTE', color: '#22c55e' }
  if (p >= 70) return { label: 'BUENO',     color: '#eab308' }
  if (p >= 50) return { label: 'REGULAR',   color: '#f97316' }
  return          { label: 'CRÍTICO',   color: '#ef4444' }
}

export default function CursanteCalificaciones() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandido, setExp] = useState(null)

  useEffect(() => {
    api.get('/cursante/calificaciones/').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f' }}>
      <div style={{ width: 36, height: 36, border: '4px solid #cc0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!data) return <div style={{ color: '#4b5563', textAlign: 'center', padding: 60 }}>No se encontraron datos</div>

  const { evaluaciones = [], promedio_general = 0, total_evaluaciones = 0, categorias = {} } = data
  const ni = nivelInfo(promedio_general)

  return (
    <div style={{ padding: 28, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 8, borderRadius: 10, background: '#cc0000' }}><Award size={22} color="white" /></div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Mis Calificaciones</h1>
          <p style={{ fontSize: 11, color: '#6b7280' }}>{total_evaluaciones} evaluación(es) registrada(s)</p>
        </div>
      </div>

      {/* Promedio general destacado */}
      <div style={{ ...card, padding: '28px 32px', marginBottom: 20, background: 'linear-gradient(135deg, #141414 0%, #1a0000 100%)', borderLeft: `4px solid ${ni.color}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: ni.color, lineHeight: 1 }}>{promedio_general}</div>
            <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: '0.15em', marginTop: 4 }}>PROMEDIO GENERAL</div>
            <div style={{ marginTop: 8, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${ni.color}22`, color: ni.color, border: `1px solid ${ni.color}44` }}>
              {ni.label}
            </div>
          </div>
          <div style={{ height: 80, width: 1, background: '#1f1f1f' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ textAlign: 'center', padding: '12px 16px', borderRadius: 10, background: '#0f0f0f', border: '1px solid #1f1f1f' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#9ca3af' }}>{total_evaluaciones}</div>
              <div style={{ fontSize: 10, color: '#4b5563' }}>EVALUACIONES</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 16px', borderRadius: 10, background: '#0f0f0f', border: '1px solid #1f1f1f' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#cc0000' }}>
                {evaluaciones.length > 0 ? evaluaciones[0].puntaje_total : '—'}
              </div>
              <div style={{ fontSize: 10, color: '#4b5563' }}>ÚLTIMA EVAL.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Promedios por categoría */}
      {Object.keys(categorias).length > 0 && (
        <div style={{ ...card, padding: 20, marginBottom: 20 }}>
          <p style={{ color: '#cc0000', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 14 }}>PROMEDIO POR CATEGORÍA</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {Object.entries(categorias).map(([cat, info]) => {
              const prom = info.criterios.length > 0
                ? Math.round(info.criterios.reduce((s, c) => s + c.promedio, 0) / info.criterios.length * 10) / 10
                : 0
              const ni2 = nivelInfo(prom)
              return (
                <div key={cat} style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: ni2.color, fontWeight: 800, fontSize: 18 }}>{prom}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: '#1f1f1f' }}>
                    <div style={{ height: 5, borderRadius: 3, width: `${Math.min(prom, 100)}%`, background: ni2.color }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#4b5563', marginTop: 4 }}>Peso: {info.peso}%</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Historial de evaluaciones */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: '#1a0000', borderBottom: '1px solid rgba(204,0,0,0.15)' }}>
          <h2 style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Historial de Evaluaciones</h2>
        </div>
        {evaluaciones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>No tienes evaluaciones registradas aún.</div>
        ) : evaluaciones.map((ev, i) => {
          const ni2  = nivelInfo(ev.puntaje_total)
          const abierto = expandido === ev.id
          return (
            <div key={ev.id} style={{ borderBottom: '1px solid #1f1f1f' }}>
              <div
                onClick={() => setExp(abierto ? null : ev.id)}
                style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: i % 2 === 0 ? '#111' : '#141414' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={13} color="#cc0000" fill="#cc0000" />
                    <span style={{ color: ni2.color, fontWeight: 800, fontSize: 18 }}>{ev.puntaje_total}</span>
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{ev.periodo}</p>
                    <p style={{ color: '#4b5563', fontSize: 11 }}>{ev.fecha}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${ni2.color}20`, color: ni2.color, border: `1px solid ${ni2.color}40` }}>{ni2.label}</span>
                  {abierto ? <ChevronUp size={15} color="#4b5563" /> : <ChevronDown size={15} color="#4b5563" />}
                </div>
              </div>

              {abierto && (
                <div style={{ padding: '14px 20px', background: '#0d0d0d', borderTop: '1px solid #1a1a1a' }}>
                  {ev.observaciones && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: '#141414', border: '1px solid #1f1f1f', color: '#9ca3af', fontSize: 12, marginBottom: 12, fontStyle: 'italic' }}>
                      "{ev.observaciones}"
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                    {ev.detalles.map((d, j) => {
                      const dc = nivelInfo(d.puntaje)
                      return (
                        <div key={j} style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 6, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600 }}>{d.criterio}</p>
                            <p style={{ color: '#4b5563', fontSize: 10 }}>{d.categoria}</p>
                          </div>
                          <span style={{ color: dc.color, fontWeight: 800, fontSize: 16 }}>{d.puntaje}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}