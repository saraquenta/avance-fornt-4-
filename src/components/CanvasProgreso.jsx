import { useEffect, useRef, useCallback } from 'react'

export default function CanvasProgreso({ historial = [], meta = 75, nombrePersonal = '' }) {
  const canvasRef  = useRef(null)
  const tooltipRef = useRef(null)
  const animRef    = useRef(null)
  const progressRef = useRef(0)   // 0→1 para animación de entrada

  // ── Función de color según puntaje (rojo→amarillo→verde) ──────────────
  const puntajeColor = useCallback((puntaje, alpha = 1) => {
    if (puntaje >= 85) return `rgba(34,197,94,${alpha})`   // verde
    if (puntaje >= 70) return `rgba(234,179,8,${alpha})`   // amarillo
    if (puntaje >= 50) return `rgba(249,115,22,${alpha})`  // naranja
    return `rgba(239,68,68,${alpha})`                        // rojo
  }, [])

  // ── Degradado continuo de color ───────────────────────────────────────
  const crearDegradadoLinea = useCallback((ctx, puntos, canvasH, padT, padB) => {
    if (puntos.length < 2) return '#cc0000'
    const grad = ctx.createLinearGradient(puntos[0].x, 0, puntos[puntos.length - 1].x, 0)
    puntos.forEach((p, i) => {
      const t = i / (puntos.length - 1)
      const puntaje = p.puntaje
      const color = puntajeColor(puntaje)
      grad.addColorStop(t, color)
    })
    return grad
  }, [puntajeColor])

  // ── Render principal con progreso animado ─────────────────────────────
  const render = useCallback((progress = 1) => {
    const canvas = canvasRef.current
    if (!canvas || historial.length === 0) return
    const ctx = canvas.getContext('2d')

    const W   = canvas.width
    const H   = canvas.height
    const PAD = { t: 40, r: 30, b: 50, l: 55 }
    const gW  = W - PAD.l - PAD.r
    const gH  = H - PAD.t - PAD.b

    // Fondo
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    // Grid horizontal
    for (let v = 0; v <= 100; v += 20) {
      const y = PAD.t + gH - (v / 100) * gH
      ctx.beginPath()
      ctx.strokeStyle = v === 0 ? '#333' : '#1a1a1a'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.moveTo(PAD.l, y)
      ctx.lineTo(PAD.l + gW, y)
      ctx.stroke()
      ctx.setLineDash([])

      // Etiqueta Y
      ctx.fillStyle = '#555'
      ctx.font = '11px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(v, PAD.l - 8, y + 4)
    }

    // Puntos calculados (solo hasta `progress`)
    const visibles = Math.max(2, Math.ceil(historial.length * progress))
    const subset   = historial.slice(0, visibles)

    const puntos = subset.map((ev, i) => ({
      x:      PAD.l + (i / Math.max(historial.length - 1, 1)) * gW,
      y:      PAD.t + gH - (ev.puntaje / 100) * gH,
      puntaje: ev.puntaje,
      fecha:   ev.fecha,
      periodo: ev.periodo,
    }))

    if (puntos.length < 2) return

    // ── Área sombreada bajo la curva ──────────────────────────────────
    const areaGrad = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + gH)
    areaGrad.addColorStop(0,   'rgba(204,0,0,0.18)')
    areaGrad.addColorStop(0.5, 'rgba(234,179,8,0.10)')
    areaGrad.addColorStop(1,   'rgba(34,197,94,0.03)')

    ctx.beginPath()
    ctx.moveTo(puntos[0].x, PAD.t + gH)
    puntos.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(puntos[puntos.length - 1].x, PAD.t + gH)
    ctx.closePath()
    ctx.fillStyle = areaGrad
    ctx.fill()

    // ── Línea principal con degradado ────────────────────────────────
    ctx.beginPath()
    ctx.moveTo(puntos[0].x, puntos[0].y)
    for (let i = 1; i < puntos.length; i++) {
      // Curva suave (bezier)
      const cpx = (puntos[i - 1].x + puntos[i].x) / 2
      ctx.bezierCurveTo(cpx, puntos[i - 1].y, cpx, puntos[i].y, puntos[i].x, puntos[i].y)
    }
    ctx.strokeStyle = crearDegradadoLinea(ctx, puntos, H, PAD.t, PAD.b)
    ctx.lineWidth   = 3
    ctx.lineJoin    = 'round'
    ctx.stroke()

    // ── Puntos sobre la línea ─────────────────────────────────────────
    puntos.forEach((p, i) => {
      const col = puntajeColor(p.puntaje)
      ctx.beginPath()
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
      ctx.fillStyle   = col
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth   = 1.5
      ctx.stroke()
    })

    // ── Línea META (configurable) ─────────────────────────────────────
    const metaY = PAD.t + gH - (meta / 100) * gH
    ctx.beginPath()
    ctx.setLineDash([8, 5])
    ctx.strokeStyle = 'rgba(251,191,36,0.7)'
    ctx.lineWidth   = 1.5
    ctx.moveTo(PAD.l, metaY)
    ctx.lineTo(PAD.l + gW, metaY)
    ctx.stroke()
    ctx.setLineDash([])

    // Etiqueta META
    ctx.fillStyle = 'rgba(251,191,36,0.9)'
    ctx.font      = 'bold 11px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`META ${meta}`, PAD.l + 4, metaY - 5)

    // ── Eje X: fechas ──────────────────────────────────────────────────
    ctx.fillStyle  = '#666'
    ctx.font       = '10px monospace'
    ctx.textAlign  = 'center'
    const maxLabels = Math.min(subset.length, 6)
    const paso = Math.max(1, Math.floor(subset.length / maxLabels))
    subset.forEach((ev, i) => {
      if (i % paso !== 0 && i !== subset.length - 1) return
      const x = PAD.l + (i / Math.max(historial.length - 1, 1)) * gW
      const fecha = ev.fecha?.substring(5) || ''  // MM-DD
      ctx.fillText(fecha, x, H - 12)
    })

    // ── Título ────────────────────────────────────────────────────────
    ctx.fillStyle = '#888'
    ctx.font      = '12px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`PROGRESO TEMPORAL — ${nombrePersonal.toUpperCase()}`, PAD.l, 22)

  }, [historial, meta, nombrePersonal, puntajeColor, crearDegradadoLinea])

  // ── Animación de entrada ──────────────────────────────────────────────
  useEffect(() => {
    if (historial.length === 0) return
    progressRef.current = 0
    if (animRef.current) cancelAnimationFrame(animRef.current)

    const step = () => {
      progressRef.current = Math.min(progressRef.current + 0.04, 1)
      render(progressRef.current)
      if (progressRef.current < 1) animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [historial, meta, render])

  // ── Tooltip al mover el mouse ──────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const canvas  = canvasRef.current
    const tooltip = tooltipRef.current
    if (!canvas || !tooltip || historial.length === 0) return

    const rect = canvas.getBoundingClientRect()
    const mx   = e.clientX - rect.left
    const my   = e.clientY - rect.top

    const W   = canvas.width
    const H   = canvas.height
    const PAD = { t: 40, r: 30, b: 50, l: 55 }
    const gW  = W - PAD.l - PAD.r
    const gH  = H - PAD.t - PAD.b

    // Encontrar punto más cercano
    let closest = null
    let minDist = Infinity

    historial.forEach((ev, i) => {
      const px = PAD.l + (i / Math.max(historial.length - 1, 1)) * gW
      const py = PAD.t + gH - (ev.puntaje / 100) * gH
      const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2)
      if (dist < minDist) {
        minDist = dist
        closest = { ev, px, py }
      }
    })

    if (closest && minDist < 30) {
      const { ev, px, py } = closest
      const nivel = ev.puntaje >= 85 ? 'EXCELENTE' :
                    ev.puntaje >= 70 ? 'BUENO' :
                    ev.puntaje >= 50 ? 'REGULAR' : 'CRÍTICO'
      tooltip.style.display = 'block'
      tooltip.style.left    = `${e.clientX - rect.left + 12}px`
      tooltip.style.top     = `${e.clientY - rect.top - 20}px`
      tooltip.innerHTML = `
        <div style="font-weight:700;color:#fff;font-size:13px">${ev.puntaje.toFixed(1)} pts</div>
        <div style="color:#aaa;font-size:11px">${ev.fecha}</div>
        <div style="color:#aaa;font-size:11px">${ev.periodo}</div>
        <div style="font-size:11px;margin-top:3px;color:${
          ev.puntaje >= 85 ? '#22c55e' :
          ev.puntaje >= 70 ? '#eab308' :
          ev.puntaje >= 50 ? '#f97316' : '#ef4444'
        }">${nivel}</div>
      `
    } else {
      tooltip.style.display = 'none'
    }
  }, [historial])

  const handleMouseLeave = useCallback(() => {
    if (tooltipRef.current) tooltipRef.current.style.display = 'none'
  }, [])

  // ── Redimensión ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const resizeObserver = new ResizeObserver(() => {
      canvas.width  = parent.clientWidth
      canvas.height = 280
      render(1)
    })
    resizeObserver.observe(parent)
    canvas.width  = parent.clientWidth || 600
    canvas.height = 280
    return () => resizeObserver.disconnect()
  }, [render])

  if (historial.length === 0) {
    return (
      <div style={{
        background: '#0a0a0a', borderRadius: 12, padding: 40,
        textAlign: 'center', color: '#555', fontFamily: 'monospace',
        border: '1px solid #1f1f1f',
      }}>
        Sin historial de evaluaciones disponible
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', background: '#0a0a0a', borderRadius: 12, overflow: 'hidden', border: '1px solid #1f1f1f' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          display: 'none',
          position: 'absolute',
          background: 'rgba(15,15,15,0.95)',
          border: '1px solid #cc0000',
          borderRadius: 8,
          padding: '8px 12px',
          pointerEvents: 'none',
          zIndex: 10,
          fontFamily: 'monospace',
          minWidth: 120,
          backdropFilter: 'blur(4px)',
        }}
      />
    </div>
  )
}
