// src/pages/cursante/CursanteCalendario.jsx
import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Calendar, MapPin, Users, X } from 'lucide-react'

const card = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12 }

const TIPO_COLOR = {
  Entrenamiento: { color: '#cc0000', bg: 'rgba(204,0,0,0.15)' },
  Competencia:   { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  Seminario:     { color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
  Evaluación:    { color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  Demostración:  { color: '#4b5563', bg: 'rgba(75,85,99,0.2)' },
  Examen:        { color: '#881111', bg: 'rgba(136,17,17,0.2)' },
  competencia:   { color: '#cc0000', bg: 'rgba(204,0,0,0.15)' },
  actividad:     { color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  general:       { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
}

const ESTADO_COLOR = {
  Programada: { color: '#9ca3af' },
  'En Curso': { color: '#cc0000' },
  Finalizada: { color: '#4b5563' },
  activo:     { color: '#22c55e' },
  finalizado: { color: '#6b7280' },
}

export default function CursanteCalendario() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [seleccionado, setSelec] = useState(null)
  const [filtro, setFiltro] = useState('todo')

  useEffect(() => {
    api.get('/cursante/calendario/').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f' }}>
      <div style={{ width: 36, height: 36, border: '4px solid #cc0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const { actividades = [], anuncios = [] } = data || {}

  // Combinar todo para la vista unificada
  const eventos = [
    ...actividades.map(a => ({ ...a, _tipo: 'actividad', _fecha: a.fecha_fin?.substring(0, 10) })),
    ...anuncios.filter(a => a.fecha_evento).map(a => ({ ...a, _tipo: 'anuncio', _fecha: a.fecha_evento })),
  ].sort((a, b) => (a._fecha || '').localeCompare(b._fecha || ''))

  const filtrados = filtro === 'todo' ? eventos
    : filtro === 'actividades' ? eventos.filter(e => e._tipo === 'actividad')
    : eventos.filter(e => e._tipo === 'anuncio')

  // Agrupar por mes
  const porMes = {}
  filtrados.forEach(e => {
    if (!e._fecha) return
    const mes = e._fecha.substring(0, 7)
    porMes[mes] = porMes[mes] || []
    porMes[mes].push(e)
  })

  const nombreMes = (key) => {
    const [y, m] = key.split('-')
    const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${meses[parseInt(m)]} ${y}`
  }

  return (
    <div style={{ padding: 28, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 10, background: '#cc0000' }}><Calendar size={22} color="white" /></div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Calendario</h1>
            <p style={{ fontSize: 11, color: '#6b7280' }}>{eventos.length} evento(s) total</p>
          </div>
        </div>
        <div style={{ display: 'flex', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, overflow: 'hidden' }}>
          {[['todo', 'Todo'], ['actividades', 'Actividades'], ['anuncios', 'Anuncios']].map(([v, l]) => (
            <button key={v} onClick={() => setFiltro(v)} style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 600,
              color: filtro === v ? 'white' : '#6b7280',
              background: filtro === v ? '#cc0000' : 'transparent',
              border: 'none', cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Eventos agrupados por mes */}
      {Object.keys(porMes).length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#4b5563' }}>Sin eventos disponibles</div>
      ) : Object.entries(porMes).map(([mes, items]) => (
        <div key={mes} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h2 style={{ color: '#cc0000', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}>{nombreMes(mes).toUpperCase()}</h2>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(204,0,0,0.4), transparent)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((ev, i) => {
              const tc   = TIPO_COLOR[ev.tipo] || { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
              const sc   = ESTADO_COLOR[ev.estado] || { color: '#9ca3af' }
              const esHoy = ev._fecha === new Date().toISOString().substring(0, 10)
              return (
                <div key={i} onClick={() => setSelec(ev)} style={{
                  ...card, padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center',
                  borderLeft: `3px solid ${tc.color}`,
                  background: esHoy ? 'rgba(204,0,0,0.05)' : '#141414',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>

                  {/* Fecha */}
                  <div style={{ textAlign: 'center', minWidth: 48, padding: '4px 0' }}>
                    <div style={{ color: tc.color, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
                      {ev._fecha?.substring(8, 10)}
                    </div>
                    <div style={{ color: '#4b5563', fontSize: 9 }}>
                      {['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(ev._fecha?.substring(5, 7) || '0')]}
                    </div>
                  </div>

                  <div style={{ width: 1, height: 40, background: '#1f1f1f' }} />

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: tc.bg, color: tc.color }}>
                        {ev.tipo || (ev._tipo === 'anuncio' ? 'Anuncio' : 'Actividad')}
                      </span>
                      {esHoy && <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e' }}>● HOY</span>}
                    </div>
                    <p style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{ev.titulo}</p>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#4b5563' }}>
                      {ev.ubicacion && <span><MapPin size={10} color="#4b5563" style={{ display: 'inline', marginRight: 2 }} />{ev.ubicacion}</span>}
                      {ev.participaciones_count !== undefined && <span><Users size={10} color="#4b5563" style={{ display: 'inline', marginRight: 2 }} />{ev.participaciones_count} participantes</span>}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: sc.color }}>{ev.estado}</span>
                    {ev.fecha_fin && ev._tipo === 'actividad' && (
                      <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>
                        {ev.fecha_fin.substring(11, 16)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Modal detalle evento */}
      {seleccionado && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
          <div style={{ ...card, width: '100%', maxWidth: 480, margin: '0 16px', background: '#111', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{seleccionado.titulo}</h2>
              <button onClick={() => setSelec(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#4b5563" /></button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(204,0,0,0.15)', color: '#ff4444', border: '1px solid rgba(204,0,0,0.3)' }}>
                {seleccionado.tipo || (seleccionado._tipo === 'anuncio' ? 'Anuncio' : 'Actividad')}
              </span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#1f1f1f', color: '#9ca3af' }}>{seleccionado.estado}</span>
            </div>
            {seleccionado.contenido && (
              <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>{seleccionado.contenido}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {seleccionado._fecha && (
                <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#6b7280' }}>
                  <Calendar size={13} color="#cc0000" />
                  <span>{seleccionado._fecha}</span>
                </div>
              )}
              {seleccionado.ubicacion && (
                <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#6b7280' }}>
                  <MapPin size={13} color="#cc0000" />
                  <span>{seleccionado.ubicacion}</span>
                </div>
              )}
              {seleccionado.instructor_nombre && (
                <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#6b7280' }}>
                  <Users size={13} color="#cc0000" />
                  <span>Instructor: {seleccionado.instructor_nombre}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}