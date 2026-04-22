// src/pages/GraficosPage.jsx
// ============================================================
// SPRINT 4 — Página que integra Gráfico 2 (Canvas) + Gráfico 3 (SVG/CSS)
// Accesible desde el Navbar bajo /graficos
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CanvasProgreso from '../components/CanvasProgreso'
import PanelAnimaciones, { BarraCircularSVG, ContadorAnimado } from '../components/AnimacionesSVG'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const TAB_CANVAS   = 'canvas'
const TAB_ANIMACIONES = 'animaciones'

export default function GraficosPage() {
  const { user } = useAuth()
  const [tab, setTab]               = useState(TAB_CANVAS)
  const [personalId, setPersonalId] = useState('')
  const [personalList, setPersonalList] = useState([])
  const [historial, setHistorial]   = useState([])
  const [competencias, setCompetencias] = useState([])
  const [personalInfo, setPersonalInfo] = useState({})
  const [meta, setMeta]             = useState(75)
  const [metaInput, setMetaInput]   = useState('75')
  const [loading, setLoading]       = useState(false)
  const [guardandoMeta, setGuardandoMeta] = useState(false)
  const [msgMeta, setMsgMeta]       = useState('')

  // Cargar lista de personal
  useEffect(() => {
    api.get('/personal/?estado=ACTIVO&page_size=100')
      .then(r => setPersonalList(r.data.results || r.data))
      .catch(console.error)

    // Cargar meta actual
    api.get('/evaluaciones/meta/')
      .then(r => { setMeta(r.data.meta); setMetaInput(String(r.data.meta)) })
      .catch(console.error)
  }, [])

  // Cargar historial y competencias al seleccionar personal
  useEffect(() => {
    if (!personalId) {
      setHistorial([])
      setCompetencias([])
      setPersonalInfo({})
      return
    }
    setLoading(true)

    Promise.all([
      api.get(`/evaluaciones/historial/${personalId}/?meta=${meta}`),
      api.get(`/evaluaciones/competencias/${personalId}/`),
      api.get(`/personal/${personalId}/`),
    ]).then(([hRes, cRes, pRes]) => {
      setHistorial(hRes.data.historial || [])
      setCompetencias(cRes.data.competencias || [])
      const p = pRes.data
      setPersonalInfo({
        id:                p.id,
        nombre:            p.nombre,
        apellido:          p.apellido,
        rango:             p.rango,
        especialidad:      p.especialidad,
        puntaje_total:     cRes.data.puntaje_total || 0,
        ultima_evaluacion: cRes.data.ultima_evaluacion || '',
      })
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [personalId, meta])

  const guardarMeta = async () => {
    const val = parseFloat(metaInput)
    if (isNaN(val) || val < 0 || val > 100) {
      setMsgMeta('Valor inválido (0-100)')
      return
    }
    setGuardandoMeta(true)
    try {
      await api.post('/evaluaciones/meta/', { meta: val })
      setMeta(val)
      setMsgMeta('✅ Meta guardada')
      setTimeout(() => setMsgMeta(''), 2000)
    } catch {
      setMsgMeta('Error al guardar')
    } finally {
      setGuardandoMeta(false)
    }
  }

  const nombreCompleto = personalInfo.nombre
    ? `${personalInfo.rango || ''} ${personalInfo.apellido} ${personalInfo.nombre}`.trim()
    : ''

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: 24, background: '#080808', minHeight: '100vh', fontFamily: 'monospace' }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '0.08em' }}>
          📊 GRÁFICOS INTERACTIVOS
        </h1>
        <p style={{ color: '#555', fontSize: 12, margin: '4px 0 0' }}>
          Sprint 4 — Canvas API · SVG Animado · CSS Keyframes · Framer Motion
        </p>
      </div>

      {/* Selector de personal */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ color: '#888', fontSize: 10, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>
            PERSONAL MILITAR
          </label>
          <select
            value={personalId}
            onChange={e => setPersonalId(e.target.value)}
            style={{
              background: '#111', color: '#fff', border: '1px solid #333',
              borderRadius: 8, padding: '8px 14px', fontSize: 13,
              fontFamily: 'monospace', minWidth: 300,
            }}
          >
            <option value="">— Seleccionar personal —</option>
            {personalList.map(p => (
              <option key={p.id} value={p.id}>
                {p.rango} — {p.apellido} {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Meta configurable (solo ADMIN) */}
        {(user?.rol === 'ADMIN') && (
          <div>
            <label style={{ color: '#888', fontSize: 10, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>
              META (línea referencia)
            </label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="number" min="0" max="100"
                value={metaInput}
                onChange={e => setMetaInput(e.target.value)}
                style={{
                  background: '#111', color: '#fbbf24', border: '1px solid #333',
                  borderRadius: 8, padding: '8px 12px', fontSize: 13,
                  fontFamily: 'monospace', width: 80,
                }}
              />
              <button
                onClick={guardarMeta}
                disabled={guardandoMeta}
                style={{
                  background: '#cc0000', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                  fontFamily: 'monospace', fontSize: 12,
                }}
              >
                {guardandoMeta ? '...' : 'GUARDAR'}
              </button>
              {msgMeta && <span style={{ color: '#22c55e', fontSize: 11 }}>{msgMeta}</span>}
            </div>
          </div>
        )}
      </div>

      {/* KPIs rápidos si hay personal seleccionado */}
      {personalInfo.nombre && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12, marginBottom: 24,
          }}
        >
          {[
            { label: 'PUNTAJE TOTAL', val: personalInfo.puntaje_total, decimales: 1 },
            { label: 'EVALUACIONES', val: historial.length, decimales: 0 },
            { label: 'CRITERIOS', val: competencias.length, decimales: 0 },
            { label: 'META', val: meta, decimales: 0 },
          ].map(kpi => (
            <div key={kpi.label} style={{
              background: '#0d0d0d', border: '1px solid #1a1a1a',
              borderRadius: 10, padding: '12px 16px',
            }}>
              <div style={{ color: '#555', fontSize: 9, letterSpacing: '0.15em', marginBottom: 6 }}>
                {kpi.label}
              </div>
              <ContadorAnimado
                valorFinal={kpi.val}
                duracion={1200}
                decimales={kpi.decimales}
                color={kpi.label === 'PUNTAJE TOTAL'
                  ? (personalInfo.puntaje_total >= 85 ? '#22c55e'
                    : personalInfo.puntaje_total >= 70 ? '#eab308'
                    : personalInfo.puntaje_total >= 50 ? '#f97316' : '#ef4444')
                  : '#cc0000'}
              />
            </div>
          ))}
        </motion.div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: '#0d0d0d', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[
          { id: TAB_CANVAS,     label: '📈 PROGRESO TEMPORAL (Canvas API)' },
          { id: TAB_ANIMACIONES, label: '🎨 ANIMACIONES SVG/CSS' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? '#cc0000' : 'transparent',
              color: tab === t.id ? '#fff' : '#666',
              border: 'none', borderRadius: 8,
              padding: '8px 16px', cursor: 'pointer',
              fontFamily: 'monospace', fontSize: 12, fontWeight: tab === t.id ? 700 : 400,
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      <AnimatePresence mode="wait">
        {tab === TAB_CANVAS && (
          <motion.div
            key="canvas"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {loading ? (
              <div style={{ color: '#555', textAlign: 'center', padding: 60 }}>Cargando datos...</div>
            ) : historial.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Canvas principal */}
                <CanvasProgreso
                  historial={historial}
                  meta={meta}
                  nombrePersonal={nombreCompleto}
                />

                {/* Leyenda */}
                <div style={{
                  display: 'flex', gap: 16, flexWrap: 'wrap',
                  background: '#0d0d0d', border: '1px solid #1a1a1a',
                  borderRadius: 10, padding: '10px 16px',
                }}>
                  {[
                    { label: 'EXCELENTE ≥85', color: '#22c55e' },
                    { label: 'BUENO ≥70', color: '#eab308' },
                    { label: 'REGULAR ≥50', color: '#f97316' },
                    { label: 'CRÍTICO <50', color: '#ef4444' },
                    { label: `META ${meta}`, color: '#fbbf24', dashed: true },
                  ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 20, height: 3, background: l.color,
                        borderTop: l.dashed ? `2px dashed ${l.color}` : 'none',
                      }} />
                      <span style={{ color: '#666', fontSize: 10 }}>{l.label}</span>
                    </div>
                  ))}
                </div>

                {/* Tabla de historial */}
                <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', color: '#555', fontSize: 9, letterSpacing: '0.15em', borderBottom: '1px solid #111' }}>
                    HISTORIAL DETALLADO
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: '#111' }}>
                          {['FECHA', 'PERÍODO', 'PUNTAJE', 'NIVEL'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#555', fontWeight: 400, letterSpacing: '0.1em' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...historial].reverse().map((ev, i) => (
                          <tr key={ev.id} style={{ borderBottom: '1px solid #111', background: i % 2 === 0 ? 'transparent' : '#080808' }}>
                            <td style={{ padding: '7px 12px', color: '#888' }}>{ev.fecha}</td>
                            <td style={{ padding: '7px 12px', color: '#888' }}>{ev.periodo}</td>
                            <td style={{ padding: '7px 12px', fontWeight: 700, color:
                              ev.puntaje >= 85 ? '#22c55e' : ev.puntaje >= 70 ? '#eab308' :
                              ev.puntaje >= 50 ? '#f97316' : '#ef4444'
                            }}>
                              {ev.puntaje.toFixed(1)}
                            </td>
                            <td style={{ padding: '7px 12px' }}>
                              <span style={{
                                background: ev.puntaje >= 85 ? '#14532d' : ev.puntaje >= 70 ? '#713f12' : ev.puntaje >= 50 ? '#431407' : '#7f1d1d',
                                color: ev.puntaje >= 85 ? '#86efac' : ev.puntaje >= 70 ? '#fde047' : ev.puntaje >= 50 ? '#fdba74' : '#fca5a5',
                                padding: '2px 8px', borderRadius: 10, fontSize: 10,
                              }}>
                                {ev.nivel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: 60, color: '#333',
                border: '1px dashed #1a1a1a', borderRadius: 14,
              }}>
                {personalId ? 'Sin evaluaciones registradas' : 'Selecciona un personal para ver su progreso'}
              </div>
            )}
          </motion.div>
        )}

        {tab === TAB_ANIMACIONES && (
          <motion.div
            key="animaciones"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {personalInfo.nombre ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Panel de animaciones */}
                <PanelAnimaciones
                  personal={personalInfo}
                  criterios={competencias}
                  historial={historial}
                />

                {/* Barras circulares por criterio */}
                <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 12, padding: 16 }}>
                  <div style={{ color: '#555', fontSize: 9, letterSpacing: '0.15em', marginBottom: 16 }}>
                    BARRAS CIRCULARES POR CRITERIO
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {competencias.slice(0, 9).map(c => (
                      <BarraCircularSVG
                        key={c.nombre}
                        puntaje={c.puntaje}
                        size={90}
                        label={c.nombre.substring(0, 8)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: 60, color: '#333',
                border: '1px dashed #1a1a1a', borderRadius: 14,
              }}>
                Selecciona un personal para ver las animaciones
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
