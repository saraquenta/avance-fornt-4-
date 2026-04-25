// src/pages/cursante/CursanteMisAsignaturas.jsx
import { useState, useEffect } from 'react'
import api from '../../services/api'
import { BookOpen, X, Calendar, FileText, Award, ChevronRight } from 'lucide-react'

const card = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }

const TIPO_COLOR = {
  tarea:       { color: '#cc0000', bg: 'rgba(204,0,0,0.15)', icon: '📝' },
  material:    { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: '📖' },
  informacion: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', icon: 'ℹ️' },
  evaluacion:  { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '📊' },
}

const TIPO_DISC = {
  'Arte Marcial':       { color: '#cc0000' },
  'Defensa Personal':   { color: '#9ca3af' },
  'Deporte de Combate': { color: '#6b7280' },
}

export default function CursanteMisAsignaturas() {
  const [asignaturas, setAsignaturas] = useState([])
  const [seleccionada, setSelec]      = useState(null)
  const [detalle, setDetalle]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [loadingDetalle, setLoadingD] = useState(false)

  useEffect(() => {
    api.get('/cursante/asignaturas/')
       .then(r => setAsignaturas(r.data.asignaturas || []))
       .catch(console.error)
       .finally(() => setLoading(false))
  }, [])

  const abrirDetalle = (asig) => {
    setSelec(asig)
    setLoadingD(true)
    api.get(`/cursante/asignaturas/${asig.id}/`)
       .then(r => setDetalle(r.data))
       .catch(console.error)
       .finally(() => setLoadingD(false))
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f' }}>
      <div style={{ width: 36, height: 36, border: '4px solid #cc0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: 'auto' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ padding: 28, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 8, borderRadius: 10, background: '#cc0000' }}><BookOpen size={22} color="white" /></div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Mis Asignaturas</h1>
          <p style={{ fontSize: 11, color: '#6b7280' }}>{asignaturas.length} disciplina(s) disponibles</p>
        </div>
      </div>

      {/* Grid de asignaturas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {asignaturas.map(a => {
          const tc  = TIPO_DISC[a.tipo] || { color: '#6b7280' }
          const prom = a.promedio || 0
          const color = prom >= 85 ? '#22c55e' : prom >= 70 ? '#eab308' : prom >= 50 ? '#f97316' : prom > 0 ? '#ef4444' : '#4b5563'
          return (
            <div key={a.id} onClick={() => abrirDetalle(a)} style={{
              ...card, padding: 20, cursor: 'pointer',
              borderTop: `3px solid ${tc.color}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.4)' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${tc.color}22`, border: `2px solid ${tc.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tc.color, fontSize: 16, fontWeight: 700 }}>
                  {a.nombre.substring(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: `${tc.color}15`, color: tc.color, border: `1px solid ${tc.color}33` }}>{a.tipo}</span>
              </div>

              <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{a.nombre}</h3>
              <p style={{ color: '#4b5563', fontSize: 11, marginBottom: 14 }}>{a.codigo}</p>

              {/* Barras de distribución */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                {[
                  { label: 'Teoría', val: a.teoria_pct, color: '#cc0000' },
                  { label: 'Práctica', val: a.practica_pct, color: '#9ca3af' },
                  { label: 'Otros', val: a.otros_pct, color: '#4b5563' },
                ].map(b => (
                  <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, color: '#4b5563', width: 50 }}>{b.label}</span>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#1f1f1f' }}>
                      <div style={{ width: `${b.val}%`, height: 4, borderRadius: 2, background: b.color }} />
                    </div>
                    <span style={{ fontSize: 9, color: b.color, fontWeight: 700, width: 30, textAlign: 'right' }}>{b.val}%</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: color, fontSize: 22, fontWeight: 800 }}>{prom || '—'}</span>
                  {prom > 0 && <span style={{ color: '#4b5563', fontSize: 11, marginLeft: 4 }}>pts</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#6b7280' }}>{a.total_tareas} item(s)</span>
                  <ChevronRight size={14} color="#cc0000" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal detalle de asignatura */}
      {seleccionada && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
          <div style={{ ...card, width: '100%', maxWidth: 680, margin: '0 16px', maxHeight: '90vh', overflowY: 'auto', background: '#111', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 16, boxShadow: '0 0 60px rgba(204,0,0,0.15)' }}>

            {/* Header modal */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f1f1f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookOpen size={18} color="#cc0000" />
                <div>
                  <h2 style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{seleccionada.nombre}</h2>
                  <p style={{ color: '#6b7280', fontSize: 11 }}>{seleccionada.codigo} · {seleccionada.tipo}</p>
                </div>
              </div>
              <button onClick={() => { setSelec(null); setDetalle(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#4b5563" />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {loadingDetalle ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#4b5563' }}>Cargando detalle...</div>
              ) : detalle ? (
                <>
                  {/* Horarios de la materia */}
                  {detalle.horarios?.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <p style={{ color: '#cc0000', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>HORARIOS DE CLASE</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {detalle.horarios.map(h => (
                          <div key={h.id} style={{ padding: '8px 14px', borderRadius: 8, background: '#1a0000', border: '1px solid rgba(204,0,0,0.2)' }}>
                            <p style={{ color: '#ff4444', fontWeight: 700, fontSize: 12 }}>{h.dia}</p>
                            <p style={{ color: '#9ca3af', fontSize: 11 }}>{h.hora_inicio_str} – {h.hora_fin_str}</p>
                            <p style={{ color: '#4b5563', fontSize: 10 }}>{h.aula}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contenido por periodos */}
                  {Object.entries(detalle.periodos || {}).length === 0 && (
                    <p style={{ color: '#4b5563', textAlign: 'center', padding: 30 }}>Sin materiales registrados aún.</p>
                  )}
                  {Object.entries(detalle.periodos || {}).map(([periodo, tareas]) => (
                    <div key={periodo} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cc0000' }} />
                        <p style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{periodo}</p>
                        <span style={{ color: '#4b5563', fontSize: 11 }}>({tareas.length} elemento(s))</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 16 }}>
                        {tareas.map(t => {
                          const tc = TIPO_COLOR[t.tipo] || TIPO_COLOR.material
                          return (
                            <div key={t.id} style={{ background: '#141414', border: `1px solid ${tc.color}22`, borderLeft: `3px solid ${tc.color}`, borderRadius: '0 8px 8px 0', padding: '12px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>{tc.icon}</span>
                                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: tc.bg, color: tc.color }}>{t.tipo}</span>
                                </div>
                                {t.fecha_entrega && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Calendar size={10} color="#eab308" />
                                    <span style={{ color: '#eab308', fontSize: 10 }}>Entrega: {t.fecha_entrega}</span>
                                  </div>
                                )}
                              </div>
                              <p style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t.titulo}</p>
                              <p style={{ color: '#6b7280', fontSize: 11, lineHeight: 1.6 }}>{t.descripcion}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}