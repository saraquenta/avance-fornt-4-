import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Award, Calendar, TrendingUp, Megaphone, Clock } from 'lucide-react'

const TIPO_COLOR = {
  competencia: { color: '#cc0000', bg: 'rgba(204,0,0,0.15)', border: 'rgba(204,0,0,0.3)', label: 'Competencia' },
  actividad:   { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', label: 'Actividad' },
  general:     { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)', label: 'General' },
  urgente:     { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', label: '⚠ Urgente' },
  evaluacion:  { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', label: 'Evaluación' },
}

const ESTADO_COLOR = {
  activo:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  finalizado:{ color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
}

const card = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }

export default function CursanteInicio() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/cursante/inicio/').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '4px solid #cc0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#6b7280', fontSize: 12 }}>Cargando...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const { anuncios = [], actividades_proximas = [], stats = {}, personal = {} } = data || {}
  const nivel = stats.nivel || 'SIN DATOS'
  const nivelColor = { EXCELENTE: '#22c55e', BUENO: '#eab308', REGULAR: '#f97316', CRÍTICO: '#ef4444', 'SIN DATOS': '#6b7280' }[nivel] || '#6b7280'

  return (
    <div style={{ padding: 28, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header bienvenida */}
      <div style={{ ...card, padding: '24px 28px', marginBottom: 20, borderLeft: '4px solid #cc0000',
        background: 'linear-gradient(135deg, #141414 0%, #1a0000 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#cc0000', fontSize: 11, letterSpacing: '0.15em', marginBottom: 4 }}>BIENVENIDO AL SISTEMA EAME</p>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              {personal.rango && <span style={{ color: '#cc0000' }}>{personal.rango.replace('_', ' ')} </span>}
              {personal.apellido} {personal.nombre}
            </h1>
            <p style={{ color: '#6b7280', fontSize: 12 }}>
              Especialidad: <span style={{ color: '#9ca3af' }}>{personal.especialidad?.replace('_', ' ')}</span>
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: nivelColor }}>{stats.promedio || '—'}</div>
            <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: '0.12em' }}>PROMEDIO GENERAL</div>
            <div style={{ marginTop: 6, padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: `${nivelColor}22`, color: nivelColor, border: `1px solid ${nivelColor}44` }}>
              {nivel}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Promedio',      value: stats.promedio || 0,           color: nivelColor, icon: TrendingUp, action: () => navigate('/cursante/calificaciones') },
          { label: 'Evaluaciones',  value: stats.total_evaluaciones || 0, color: '#9ca3af',  icon: Award,      action: () => navigate('/cursante/calificaciones') },
          { label: 'Próx. Actividad',value: actividades_proximas.length,  color: '#eab308',  icon: Calendar,   action: () => navigate('/cursante/calendario') },
          { label: 'Anuncios',      value: anuncios.length,               color: '#cc0000',  icon: Megaphone,  action: () => {} },
        ].map((k, i) => {
          const Icon = k.icon
          return (
            <div key={i} onClick={k.action} style={{ ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#cc000044'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1f1f1f'}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${k.color}18`, border: `1px solid ${k.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={k.color} />
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#6b7280' }}>{k.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Anuncios */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Megaphone size={15} color="#cc0000" />
            <h2 style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>Tablón de Anuncios</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {anuncios.length === 0 && <p style={{ color: '#4b5563', fontSize: 13, padding: 20, textAlign: 'center' }}>Sin anuncios recientes</p>}
            {anuncios.map(a => {
              const tc = TIPO_COLOR[a.tipo] || TIPO_COLOR.general
              const sc = ESTADO_COLOR[a.estado] || ESTADO_COLOR.activo
              return (
                <div key={a.id} style={{ ...card, padding: '14px 16px', borderLeft: `3px solid ${tc.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                        {tc.label}
                      </span>
                      {a.destacado && <span style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24' }}>★ Destacado</span>}
                    </div>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color }}>{a.estado}</span>
                  </div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{a.titulo}</p>
                  <p style={{ color: '#6b7280', fontSize: 11, lineHeight: 1.5 }}>
                    {a.contenido.length > 100 ? a.contenido.substring(0, 97) + '...' : a.contenido}
                  </p>
                  {a.fecha_evento && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <Calendar size={11} color="#4b5563" />
                      <span style={{ color: '#4b5563', fontSize: 10 }}>{a.fecha_evento}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actividades próximas */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Clock size={15} color="#cc0000" />
            <h2 style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>Actividades Próximas</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {actividades_proximas.length === 0 && <p style={{ color: '#4b5563', fontSize: 13, padding: 20, textAlign: 'center' }}>Sin actividades programadas</p>}
            {actividades_proximas.map(a => (
              <div key={a.id} style={{ ...card, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(204,0,0,0.15)', color: '#ff4444', border: '1px solid rgba(204,0,0,0.3)' }}>
                    {a.tipo}
                  </span>
                  <span style={{ fontSize: 10, color: '#6b7280' }}>Programada</span>
                </div>
                <p style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{a.titulo}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6b7280' }}>
                  {a.disciplina_nombre && <span>📚 {a.disciplina_nombre}</span>}
                  {a.ubicacion && <span>📍 {a.ubicacion}</span>}
                </div>
                {a.fecha_fin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <Calendar size={11} color="#eab308" />
                    <span style={{ color: '#eab308', fontSize: 10, fontWeight: 600 }}>
                      {a.fecha_fin.substring(0, 16).replace('T', ' ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Accesos rápidos */}
          <div style={{ ...card, padding: 16, marginTop: 16 }}>
            <p style={{ color: '#cc0000', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>ACCESO RÁPIDO</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['📚 Asignaturas', '/cursante/asignaturas'],
                ['🏆 Calificaciones', '/cursante/calificaciones'],
                ['📅 Horarios', '/cursante/horarios'],
                ['👤 Mi Perfil', '/cursante/perfil'],
              ].map(([label, ruta]) => (
                <button key={ruta} onClick={() => navigate(ruta)} style={{
                  padding: '9px 10px', borderRadius: 8, textAlign: 'left', fontSize: 11, fontWeight: 600,
                  color: 'white', background: '#1a0000', border: '1px solid rgba(204,0,0,0.2)',
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(204,0,0,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a0000'}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}