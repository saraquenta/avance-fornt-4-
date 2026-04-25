// src/pages/cursante/CursantePerfil.jsx
import { useState, useEffect } from 'react'
import api from '../../services/api'
import { User, Shield, Calendar, Award, TrendingUp } from 'lucide-react'

const card = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12 }

export default function CursantePerfil() {
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/cursante/perfil/').then(r => setPerfil(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f0f' }}>
      <div style={{ width: 36, height: 36, border: '4px solid #cc0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!perfil) return <div style={{ color: '#4b5563', textAlign: 'center', padding: 60 }}>No se encontraron datos de perfil</div>

  const nivelColor = { EXCELENTE: '#22c55e', BUENO: '#eab308', REGULAR: '#f97316', CRÍTICO: '#ef4444', 'SIN DATOS': '#6b7280' }[perfil.nivel] || '#6b7280'

  return (
    <div style={{ padding: 28, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 8, borderRadius: 10, background: '#cc0000' }}><User size={22} color="white" /></div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Mi Perfil</h1>
          <p style={{ fontSize: 11, color: '#6b7280' }}>Información personal del cursante</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, maxWidth: 900 }}>

        {/* Tarjeta identidad */}
        <div>
          <div style={{ ...card, padding: 24, textAlign: 'center', background: 'linear-gradient(135deg, #141414 0%, #1a0000 100%)', borderLeft: '4px solid #cc0000' }}>
            {/* Avatar */}
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(204,0,0,0.2)', border: '3px solid #cc0000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32, fontWeight: 900, color: '#cc0000' }}>
              {(perfil.apellido || 'C')[0]}{(perfil.nombre || '')[0] || ''}
            </div>
            <h2 style={{ color: 'white', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
              {perfil.apellido} {perfil.nombre}
            </h2>
            {perfil.rango && (
              <p style={{ color: '#cc0000', fontWeight: 700, fontSize: 12, letterSpacing: '0.12em', marginBottom: 8 }}>
                {perfil.rango.replace('_', ' ')}
              </p>
            )}
            <div style={{ padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${nivelColor}20`, color: nivelColor, border: `1px solid ${nivelColor}44`, display: 'inline-block', marginBottom: 16 }}>
              {perfil.nivel || 'SIN EVALUACIONES'}
            </div>

            {/* Stats rápidos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Promedio', value: perfil.promedio_general || '—', color: nivelColor },
                { label: 'Evaluaciones', value: perfil.total_evaluaciones || 0, color: '#9ca3af' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#0f0f0f', borderRadius: 8, padding: '10px 8px', border: '1px solid #1f1f1f' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div style={{ ...card, padding: 16, marginTop: 14, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: perfil.estado === 'ACTIVO' ? '#22c55e' : '#6b7280' }} />
              <span style={{ color: perfil.estado === 'ACTIVO' ? '#22c55e' : '#6b7280', fontWeight: 700, fontSize: 12 }}>
                {perfil.estado || 'ACTIVO'}
              </span>
            </div>
            <p style={{ color: '#4b5563', fontSize: 11 }}>Estado en la institución</p>
          </div>
        </div>

        {/* Datos personales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Datos personales */}
          <div style={{ ...card, padding: 22 }}>
            <p style={{ color: '#cc0000', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 16 }}>
              INFORMACIÓN PERSONAL
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'NOMBRE',       value: perfil.nombre,      icon: User },
                { label: 'APELLIDO',     value: perfil.apellido,    icon: User },
                { label: 'C.I.',         value: perfil.ci,          icon: Shield },
                { label: 'USUARIO',      value: perfil.username,    icon: User },
                { label: 'ESPECIALIDAD', value: perfil.especialidad?.replace('_', ' '), icon: Award },
                { label: 'RANGO',        value: perfil.rango?.replace('_', ' '),        icon: Shield },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Icon size={11} color="#cc0000" />
                    <span style={{ color: '#4b5563', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}>{label}</span>
                  </div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Datos académicos */}
          <div style={{ ...card, padding: 22 }}>
            <p style={{ color: '#cc0000', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 16 }}>
              INFORMACIÓN ACADÉMICA
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'FECHA DE INGRESO',     value: perfil.fecha_ingreso },
                { label: 'ÚLTIMA EVALUACIÓN',    value: perfil.ultima_evaluacion },
                { label: 'PROMEDIO GENERAL',     value: `${perfil.promedio_general} pts` },
                { label: 'TOTAL EVALUACIONES',   value: perfil.total_evaluaciones },
                { label: 'EMAIL',                value: perfil.email || '—' },
                { label: 'NIVEL ACADÉMICO',      value: perfil.nivel || 'SIN DATOS' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: 8, padding: '12px 14px' }}>
                  <span style={{ color: '#4b5563', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{label}</span>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{value || '—'}</p>
                </div>
              ))}
            </div>

            {perfil.observaciones && (
              <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 8, background: '#0f0f0f', border: '1px solid #1f1f1f' }}>
                <span style={{ color: '#4b5563', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>OBSERVACIONES</span>
                <p style={{ color: '#9ca3af', fontSize: 12, lineHeight: 1.6 }}>{perfil.observaciones}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}