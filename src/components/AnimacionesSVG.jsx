// src/components/AnimacionesSVG.jsx
// ============================================================
// SPRINT 4 — GRÁFICO 3: Animaciones SVG/CSS controladas por eventos
// 4 animaciones:
//   1. Barra circular SVG (se llena al cargar)
//   2. Tarjeta alerta pulse CSS (puntaje < 60)
//   3. Flip card 3D CSS (resumen / detalle)
//   4. Contador numérico animado desde 0
// Transiciones de página con Framer Motion
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── 1. Barra circular SVG ────────────────────────────────────────────────
export function BarraCircularSVG({ puntaje = 0, size = 120, label = '' }) {
  const [valor, setValor] = useState(0)

  useEffect(() => {
    // Animar desde 0 al valor real
    setValor(0)
    const timeout = setTimeout(() => setValor(puntaje), 100)
    return () => clearTimeout(timeout)
  }, [puntaje])

  const radio        = (size - 16) / 2
  const circunferencia = 2 * Math.PI * radio
  const offset       = circunferencia - (valor / 100) * circunferencia

  const color = valor >= 85 ? '#22c55e'
              : valor >= 70 ? '#eab308'
              : valor >= 50 ? '#f97316'
              : '#ef4444'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Fondo */}
        <circle
          cx={size / 2} cy={size / 2} r={radio}
          fill="none" stroke="#1f1f1f" strokeWidth={8}
        />
        {/* Arco animado */}
        <circle
          cx={size / 2} cy={size / 2} r={radio}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {/* Texto centrado dentro */}
      <div style={{
        marginTop: -(size / 2 + 20),
        marginBottom: size / 2 - 14,
        fontFamily: 'monospace', fontWeight: 700,
        fontSize: size * 0.18, color,
        textAlign: 'center', lineHeight: 1,
      }}>
        {Math.round(valor)}
      </div>
      {label && (
        <span style={{ color: '#888', fontSize: 11, fontFamily: 'monospace', marginTop: 4 }}>
          {label}
        </span>
      )}
    </div>
  )
}

// ── 2. Tarjeta alerta pulse (rojo parpadeante) ──────────────────────────
const pulseCSS = `
@keyframes pulse-rojo {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); border-color: #ef4444; }
  50%       { box-shadow: 0 0 0 10px rgba(239,68,68,0); border-color: #b91c1c; }
}
@keyframes pulse-verde {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
}
`

export function TarjetaAlerta({ puntaje = 0, nombre = '', fecha = '' }) {
  const esCritico = puntaje < 60

  return (
    <>
      <style>{pulseCSS}</style>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          background: esCritico ? 'rgba(127,29,29,0.2)' : 'rgba(20,83,45,0.2)',
          border: `2px solid ${esCritico ? '#ef4444' : '#22c55e'}`,
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          animation: esCritico ? 'pulse-rojo 1.6s infinite' : 'pulse-verde 2s infinite',
          cursor: 'default',
          fontFamily: 'monospace',
        }}
      >
        <span style={{ fontSize: 24 }}>{esCritico ? '⚠️' : '✅'}</span>
        <div>
          <div style={{ color: esCritico ? '#fca5a5' : '#86efac', fontWeight: 700, fontSize: 13 }}>
            {nombre}
          </div>
          <div style={{ color: '#888', fontSize: 11 }}>
            Puntaje: <span style={{ color: esCritico ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
              {puntaje.toFixed(1)}
            </span>
          </div>
          {fecha && <div style={{ color: '#555', fontSize: 10 }}>{fecha}</div>}
        </div>
        <div style={{
          marginLeft: 'auto',
          background: esCritico ? '#7f1d1d' : '#14532d',
          color: esCritico ? '#fca5a5' : '#86efac',
          padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
        }}>
          {esCritico ? 'CRÍTICO' : puntaje >= 85 ? 'EXCELENTE' : puntaje >= 70 ? 'BUENO' : 'REGULAR'}
        </div>
      </motion.div>
    </>
  )
}

// ── 3. Flip Card 3D ──────────────────────────────────────────────────────
const flipCSS = `
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
.flip-card-inner { position:relative; width:100%; height:100%; transition:transform 0.65s cubic-bezier(0.4,0,0.2,1); transform-style:preserve-3d; }
.flip-card-inner.flipped { transform: rotateY(180deg); }
.flip-face { position:absolute; width:100%; height:100%; backface-visibility:hidden; border-radius:12px; overflow:hidden; }
.flip-back  { transform: rotateY(180deg); }
`

export function FlipCard({ personal = {}, criterios = [] }) {
  const [flipped, setFlipped] = useState(false)

  const puntaje = personal.puntaje_total || 0
  const nivel   = puntaje >= 85 ? 'EXCELENTE' : puntaje >= 70 ? 'BUENO' : puntaje >= 50 ? 'REGULAR' : 'CRÍTICO'
  const colNivel = puntaje >= 85 ? '#22c55e' : puntaje >= 70 ? '#eab308' : puntaje >= 50 ? '#f97316' : '#ef4444'

  return (
    <>
      <style>{flipCSS}</style>
      <div
        onClick={() => setFlipped(f => !f)}
        style={{ perspective: 1200, width: '100%', height: 200, cursor: 'pointer' }}
        title="Clic para voltear"
      >
        <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
          {/* FRENTE */}
          <div className="flip-face" style={{ background: '#111', border: '1px solid #222' }}>
            <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#888', fontSize: 10, letterSpacing: '0.15em' }}>RESUMEN</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginTop: 4 }}>
                    {personal.nombre || 'Personal'}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>{personal.rango || ''}</div>
                </div>
                <div style={{
                  background: colNivel, color: '#000',
                  padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                }}>
                  {nivel}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                <div>
                  <div style={{ color: '#555', fontSize: 10 }}>PUNTAJE TOTAL</div>
                  <div style={{ color: colNivel, fontSize: 32, fontWeight: 700 }}>
                    {puntaje.toFixed(1)}
                  </div>
                </div>
                <div style={{ color: '#333', fontSize: 10, marginBottom: 4 }}>
                  {personal.especialidad || ''}<br />
                  {personal.ultima_evaluacion || ''}
                </div>
              </div>
              <div style={{ color: '#333', fontSize: 9, textAlign: 'right' }}>
                CLIC PARA VER DETALLE ↩
              </div>
            </div>
          </div>

          {/* REVERSO — criterios */}
          <div className="flip-face flip-back" style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}>
            <div style={{ padding: '14px 16px', fontFamily: 'monospace', height: '100%', overflow: 'hidden' }}>
              <div style={{ color: '#cc0000', fontSize: 10, letterSpacing: '0.15em', marginBottom: 8 }}>
                DETALLE DE CRITERIOS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                {criterios.slice(0, 8).map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#888', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>
                      {c.nombre}
                    </span>
                    <span style={{
                      color: c.puntaje >= 85 ? '#22c55e' : c.puntaje >= 70 ? '#eab308' : c.puntaje >= 50 ? '#f97316' : '#ef4444',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {c.puntaje}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ color: '#333', fontSize: 9, textAlign: 'right', marginTop: 6 }}>
                CLIC PARA VOLVER ↩
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── 4. Contador numérico animado ─────────────────────────────────────────
export function ContadorAnimado({ valorFinal = 0, duracion = 1500, decimales = 1, label = '', color = '#cc0000' }) {
  const [actual, setActual] = useState(0)
  const startRef = useRef(null)
  const rafRef   = useRef(null)

  useEffect(() => {
    setActual(0)
    startRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duracion, 1)
      // Easing ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setActual(valorFinal * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [valorFinal, duracion])

  return (
    <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
      <motion.div
        key={valorFinal}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        style={{ color, fontSize: 42, fontWeight: 800, lineHeight: 1 }}
      >
        {actual.toFixed(decimales)}
      </motion.div>
      {label && (
        <div style={{ color: '#666', fontSize: 11, letterSpacing: '0.12em', marginTop: 4 }}>
          {label}
        </div>
      )}
    </div>
  )
}

// ── Panel de animaciones unificado (para mostrar las 4 juntas) ────────────
export default function PanelAnimaciones({ personal = {}, criterios = [], historial = [] }) {
  const puntaje = personal.puntaje_total || 0
  const esAlerta = puntaje < 60

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'monospace' }}>
      {/* Título */}
      <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.18em' }}>
        COMPONENTES GRÁFICOS — SPRINT 4
      </div>

      {/* Row 1: Circular + Contador */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          background: '#0d0d0d', border: '1px solid #1f1f1f',
          borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{ color: '#555', fontSize: 9, letterSpacing: '0.15em' }}>BARRA CIRCULAR SVG</div>
          <BarraCircularSVG puntaje={puntaje} size={110} label="PUNTAJE TOTAL" />
        </div>

        <div style={{
          background: '#0d0d0d', border: '1px solid #1f1f1f',
          borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <div style={{ color: '#555', fontSize: 9, letterSpacing: '0.15em' }}>CONTADOR ANIMADO</div>
          <ContadorAnimado valorFinal={puntaje} duracion={1800} label="PUNTOS TOTALES" />
        </div>
      </div>

      {/* Row 2: Alerta pulse */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 12, padding: 12 }}>
        <div style={{ color: '#555', fontSize: 9, letterSpacing: '0.15em', marginBottom: 8 }}>
          ALERTA PULSE CSS {esAlerta ? '(PUNTAJE CRÍTICO)' : '(RENDIMIENTO NORMAL)'}
        </div>
        <TarjetaAlerta
          puntaje={puntaje}
          nombre={personal.nombre ? `${personal.rango || ''} ${personal.nombre} ${personal.apellido || ''}`.trim() : 'Sin selección'}
          fecha={personal.ultima_evaluacion || ''}
        />
      </div>

      {/* Row 3: Flip card */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 12, padding: 12 }}>
        <div style={{ color: '#555', fontSize: 9, letterSpacing: '0.15em', marginBottom: 8 }}>
          FLIP CARD 3D — RESUMEN / DETALLE
        </div>
        <FlipCard personal={personal} criterios={criterios} />
      </div>
    </div>
  )
}
