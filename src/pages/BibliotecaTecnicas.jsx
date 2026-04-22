import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

// ── Marcadores de tiempo de ejemplo (en segundos) ────────────────────────
const MARCADORES_DEFAULT = [
  { tiempo: 0,   etiqueta: 'Introducción' },
  { tiempo: 15,  etiqueta: 'Posición base' },
  { tiempo: 35,  etiqueta: 'Técnica principal' },
  { tiempo: 55,  etiqueta: 'Ejercicio práctico' },
  { tiempo: 80,  etiqueta: 'Correcciones' },
]

// ── Componente reproductor de video personalizado ─────────────────────────
function ReproductorVideo({ tecnica, onMarcarVisto, personalId }) {
  const videoRef     = useRef(null)
  const progressRef  = useRef(null)
  const [playing, setPlaying]       = useState(false)
  const [velocidad, setVelocidad]   = useState(1)
  const [progreso, setProgreso]     = useState(0)
  const [duracion, setDuracion]     = useState(0)
  const [visto, setVisto]           = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [marcadorActivo, setMarcadorActivo] = useState(null)

  const velocidades = [0.5, 1, 1.5, 2]

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
  }

  const cambiarVelocidad = (vel) => {
    if (videoRef.current) videoRef.current.playbackRate = vel
    setVelocidad(vel)
  }

  const irAMarcador = (tiempo) => {
    if (videoRef.current) {
      videoRef.current.currentTime = tiempo
      setMarcadorActivo(tiempo)
      setTimeout(() => setMarcadorActivo(null), 2000)
    }
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    setProgreso((v.currentTime / v.duration) * 100)
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuracion(videoRef.current.duration)
  }

  const handleProgressClick = (e) => {
    const bar = progressRef.current
    if (!bar || !videoRef.current) return
    const rect = bar.getBoundingClientRect()
    const pos  = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pos * videoRef.current.duration
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (!document.fullscreenElement) {
      container?.requestFullscreen?.()
      setFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setFullscreen(false)
    }
  }

  const marcarComoVisto = async () => {
    try {
      await api.post('/evaluaciones/multimedia/visto/', {
        personal_id:     personalId,
        criterio_id:     tecnica.criterio_id,
        criterio_nombre: tecnica.nombre,
      })
      setVisto(true)
    } catch {
      setVisto(true)  // optimistic
    }
    onMarcarVisto?.(tecnica.criterio_id)
  }

  const formatTiempo = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        background: '#0d0d0d', border: '1px solid #222',
        borderRadius: 14, overflow: 'hidden', fontFamily: 'monospace',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: '#111',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
            {tecnica.icono} {tecnica.nombre}
          </div>
          <div style={{ color: '#666', fontSize: 11 }}>{tecnica.categoria}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {tecnica.prioridad && (
            <span style={{
              background: '#7f1d1d', color: '#fca5a5',
              padding: '2px 8px', borderRadius: 10, fontSize: 10,
            }}>PRIORITARIO</span>
          )}
          <span style={{
            background: tecnica.puntaje >= 85 ? '#14532d' : tecnica.puntaje >= 70 ? '#713f12' : '#7f1d1d',
            color: tecnica.puntaje >= 85 ? '#86efac' : tecnica.puntaje >= 70 ? '#fde047' : '#fca5a5',
            padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
          }}>
            {tecnica.puntaje} pts
          </span>
        </div>
      </div>

      {/* Video */}
      <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          src={tecnica.video_url}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setPlaying(false)}
        />

        {/* Overlay play/pause al hacer clic */}
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute', inset: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <AnimatePresence>
            {!playing && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'rgba(204,0,0,0.85)',
                  borderRadius: '50%', width: 56, height: 56,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 22, marginLeft: 4 }}>▶</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Indicador marcador activo */}
        <AnimatePresence>
          {marcadorActivo !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', top: 12, left: 12,
                background: 'rgba(204,0,0,0.9)', color: '#fff',
                padding: '4px 12px', borderRadius: 20, fontSize: 11,
              }}
            >
              ⏱ {formatTiempo(marcadorActivo)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barra de progreso clickeable */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        style={{
          height: 6, background: '#1a1a1a', cursor: 'pointer', position: 'relative',
        }}
      >
        <div style={{
          height: '100%', width: `${progreso}%`,
          background: 'linear-gradient(90deg, #cc0000, #ef4444)',
          transition: 'width 0.1s linear',
        }} />
        {/* Marcadores sobre la barra */}
        {duracion > 0 && MARCADORES_DEFAULT.map((m) => {
          const pos = (m.tiempo / duracion) * 100
          return (
            <div
              key={m.tiempo}
              title={m.etiqueta}
              style={{
                position: 'absolute', top: -3,
                left: `${pos}%`, transform: 'translateX(-50%)',
                width: 8, height: 12, background: '#fbbf24',
                borderRadius: 2, cursor: 'pointer', zIndex: 2,
              }}
              onClick={(e) => { e.stopPropagation(); irAMarcador(m.tiempo) }}
            />
          )
        })}
      </div>

      {/* Controles */}
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Fila principal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Play/pausa + tiempo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={togglePlay}
              style={{
                background: '#cc0000', color: '#fff', border: 'none',
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                fontFamily: 'monospace', fontWeight: 700, fontSize: 13,
              }}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <span style={{ color: '#666', fontSize: 11 }}>
              {formatTiempo((progreso / 100) * duracion)} / {formatTiempo(duracion)}
            </span>
          </div>

          {/* Pantalla completa */}
          <button
            onClick={toggleFullscreen}
            style={{
              background: 'transparent', color: '#666', border: '1px solid #333',
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              fontFamily: 'monospace', fontSize: 12,
            }}
          >
            {fullscreen ? '⊡' : '⊞'} FULLSCREEN
          </button>
        </div>

        {/* Velocidad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em' }}>VELOCIDAD:</span>
          {velocidades.map(v => (
            <button
              key={v}
              onClick={() => cambiarVelocidad(v)}
              style={{
                background: velocidad === v ? '#cc0000' : '#1a1a1a',
                color: velocidad === v ? '#fff' : '#888',
                border: `1px solid ${velocidad === v ? '#cc0000' : '#333'}`,
                borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: 11, fontWeight: velocidad === v ? 700 : 400,
              }}
            >
              {v}x
            </button>
          ))}
        </div>

        {/* Marcadores de tiempo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ color: '#555', fontSize: 10, letterSpacing: '0.1em' }}>SEGMENTOS:</span>
          {MARCADORES_DEFAULT.map(m => (
            <button
              key={m.tiempo}
              onClick={() => irAMarcador(m.tiempo)}
              style={{
                background: '#111', color: '#fbbf24',
                border: '1px solid #333', borderRadius: 6,
                padding: '2px 8px', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: 10,
              }}
            >
              ⏱ {m.etiqueta}
            </button>
          ))}
        </div>

        {/* Marcar como visto */}
        <motion.button
          onClick={marcarComoVisto}
          disabled={visto}
          whileHover={!visto ? { scale: 1.02 } : {}}
          whileTap={!visto ? { scale: 0.98 } : {}}
          style={{
            background: visto ? '#14532d' : 'transparent',
            color: visto ? '#86efac' : '#888',
            border: `1px solid ${visto ? '#22c55e' : '#333'}`,
            borderRadius: 8, padding: '8px 0',
            cursor: visto ? 'default' : 'pointer',
            fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
            width: '100%',
            transition: 'all 0.3s',
          }}
        >
          {visto ? '✅ MARCADO COMO VISTO' : '📋 MARCAR COMO VISTO'}
        </motion.button>
      </div>

      {/* Descripción */}
      <div style={{
        padding: '10px 14px', borderTop: '1px solid #1a1a1a',
        color: '#666', fontSize: 11, lineHeight: 1.5,
      }}>
        {tecnica.descripcion}
      </div>
    </motion.div>
  )
}

// ── Página principal BibliotecaTecnicas ───────────────────────────────────
export default function BibliotecaTecnicas() {
  const [personalId, setPersonalId]     = useState('')
  const [personalList, setPersonalList] = useState([])
  const [tecnicas, setTecnicas]         = useState([])
  const [tecnicaActiva, setTecnicaActiva] = useState(null)
  const [vistos, setVistos]             = useState(new Set())
  const [loading, setLoading]           = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS')

  // Cargar lista de personal
  useEffect(() => {
    api.get('/personal/?estado=ACTIVO&page_size=100')
      .then(r => setPersonalList(r.data.results || r.data))
      .catch(console.error)
  }, [])

  // Cargar técnicas del personal seleccionado
  useEffect(() => {
    if (!personalId) return
    setLoading(true)
    api.get(`/evaluaciones/tecnicas-multimedia/${personalId}/`)
      .then(r => {
        setTecnicas(r.data.tecnicas || [])
        // Abrir automáticamente la técnica con menor puntaje
        const primera = (r.data.tecnicas || []).find(t => t.prioridad) || (r.data.tecnicas || [])[0]
        if (primera) setTecnicaActiva(primera.criterio_id)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [personalId])

  const categorias = ['TODAS', ...new Set(tecnicas.map(t => t.categoria))]
  const tecnicasFiltradas = filtroCategoria === 'TODAS'
    ? tecnicas
    : tecnicas.filter(t => t.categoria === filtroCategoria)

  const handleMarcarVisto = (criterioId) => {
    setVistos(prev => new Set([...prev, criterioId]))
  }

  const tecnicaSeleccionada = tecnicas.find(t => t.criterio_id === tecnicaActiva)

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 24, fontFamily: 'monospace', minHeight: '100vh', background: '#080808' }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '0.08em' }}>
          🎬 BIBLIOTECA DE TÉCNICAS
        </h1>
        <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
          Videos vinculados automáticamente a los criterios con menor puntaje
        </p>
      </div>

      {/* Selector de personal */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ color: '#888', fontSize: 11, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
          SELECCIONAR PERSONAL
        </label>
        <select
          value={personalId}
          onChange={e => setPersonalId(e.target.value)}
          style={{
            background: '#111', color: '#fff', border: '1px solid #333',
            borderRadius: 8, padding: '8px 14px', fontSize: 13,
            fontFamily: 'monospace', width: '100%', maxWidth: 380,
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

      {loading && (
        <div style={{ color: '#555', textAlign: 'center', padding: 40 }}>
          Cargando técnicas...
        </div>
      )}

      {tecnicas.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>

          {/* Columna izquierda: lista de técnicas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Filtro por categoría */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  style={{
                    background: filtroCategoria === cat ? '#cc0000' : '#111',
                    color: filtroCategoria === cat ? '#fff' : '#777',
                    border: '1px solid #222', borderRadius: 6,
                    padding: '3px 10px', fontSize: 10, cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Lista */}
            {tecnicasFiltradas.map(t => (
              <motion.div
                key={t.criterio_id}
                onClick={() => setTecnicaActiva(t.criterio_id)}
                whileHover={{ x: 3 }}
                style={{
                  background: tecnicaActiva === t.criterio_id ? '#1a0000' : '#0d0d0d',
                  border: `1px solid ${tecnicaActiva === t.criterio_id ? '#cc0000' : '#1a1a1a'}`,
                  borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{t.icono}</span>
                  <div>
                    <div style={{ color: '#ddd', fontSize: 12, fontWeight: 600 }}>{t.nombre}</div>
                    <div style={{ color: '#555', fontSize: 10 }}>{t.categoria}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <span style={{
                    color: t.puntaje >= 85 ? '#22c55e' : t.puntaje >= 70 ? '#eab308' : t.puntaje >= 50 ? '#f97316' : '#ef4444',
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {t.puntaje}
                  </span>
                  {vistos.has(t.criterio_id) && (
                    <span style={{ color: '#22c55e', fontSize: 9 }}>✅ visto</span>
                  )}
                  {t.prioridad && !vistos.has(t.criterio_id) && (
                    <span style={{ color: '#ef4444', fontSize: 9 }}>⚠ débil</span>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Progreso por categoría */}
            <div style={{ marginTop: 8, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 10, padding: 12 }}>
              <div style={{ color: '#555', fontSize: 9, letterSpacing: '0.15em', marginBottom: 8 }}>
                PROGRESO VISTOS
              </div>
              {['TODAS', ...new Set(tecnicas.map(t => t.categoria))].filter(c => c !== 'TODAS').map(cat => {
                const catTecnicas = tecnicas.filter(t => t.categoria === cat)
                const vistosCount = catTecnicas.filter(t => vistos.has(t.criterio_id)).length
                const pct = catTecnicas.length ? (vistosCount / catTecnicas.length) * 100 : 0
                return (
                  <div key={cat} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ color: '#666', fontSize: 10 }}>{cat}</span>
                      <span style={{ color: '#888', fontSize: 10 }}>{vistosCount}/{catTecnicas.length}</span>
                    </div>
                    <div style={{ background: '#1a1a1a', borderRadius: 4, height: 4 }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        width: `${pct}%`,
                        background: pct === 100 ? '#22c55e' : '#cc0000',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Columna derecha: reproductor */}
          <div>
            <AnimatePresence mode="wait">
              {tecnicaSeleccionada ? (
                <ReproductorVideo
                  key={tecnicaSeleccionada.criterio_id}
                  tecnica={tecnicaSeleccionada}
                  personalId={personalId}
                  onMarcarVisto={handleMarcarVisto}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: '#0d0d0d', border: '1px solid #1a1a1a',
                    borderRadius: 14, padding: 60, textAlign: 'center', color: '#333',
                  }}
                >
                  Selecciona una técnica para reproducir
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {!loading && !personalId && (
        <div style={{
          textAlign: 'center', padding: 60,
          color: '#333', border: '1px dashed #1a1a1a', borderRadius: 14,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
          <div>Selecciona un personal para ver sus técnicas recomendadas</div>
          <div style={{ color: '#222', fontSize: 11, marginTop: 6 }}>
            Los videos se ordenan automáticamente por criterios con menor puntaje
          </div>
        </div>
      )}
    </motion.div>
  )
}
