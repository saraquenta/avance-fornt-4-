import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../services/api'
import { Plus, X, Save, Pencil, Trash2, Search, Activity, Calendar, MapPin, Users } from 'lucide-react'

/* ─── tipos / estados ───────────────────────────── */
const TIPOS  = ['Entrenamiento','Competencia','Seminario','Evaluación','Demostración','Examen']
const ESTADOS = ['Programada','En Curso','Finalizada']

const TIPO_COLOR = {
  'Entrenamiento': { color: '#cc0000', bg: 'rgba(204,0,0,0.15)',  border: 'rgba(204,0,0,0.3)' },
  'Competencia':   { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.2)' },
  'Seminario':     { color: '#6b7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)' },
  'Evaluación':    { color: '#d97706', bg: 'rgba(217,119,6,0.15)',  border: 'rgba(217,119,6,0.3)' },
  'Demostración':  { color: '#4b5563', bg: 'rgba(75,85,99,0.2)',   border: 'rgba(75,85,99,0.3)' },
  'Examen':        { color: '#881111', bg: 'rgba(136,17,17,0.2)',  border: 'rgba(136,17,17,0.3)' },
}

const ESTADO_COLOR = {
  'Programada': { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' },
  'En Curso':   { color: '#cc0000', bg: 'rgba(204,0,0,0.15)',    border: 'rgba(204,0,0,0.3)' },
  'Finalizada': { color: '#4b5563', bg: 'rgba(75,85,99,0.15)',   border: 'rgba(75,85,99,0.3)' },
}

/* ─── Seed data ─────────────────────────────────── */
const SEED = [
  { id:1,  titulo:'Entrenamiento Karate – Kata',       tipo:'Entrenamiento', disciplina_nombre:'Karate',  fecha_fin:'2026-04-20T08:00', ubicacion:'Dojo Principal',    instructor_nombre:'Sgto. Quispe',   estado:'Programada',  participaciones_count:18 },
  { id:2,  titulo:'Competencia Interna Judo',          tipo:'Competencia',   disciplina_nombre:'Judo',    fecha_fin:'2026-04-22T09:00', ubicacion:'Gimnasio A',        instructor_nombre:'Tte. Flores',    estado:'En Curso',    participaciones_count:24 },
  { id:3,  titulo:'Seminario Defensa Personal Avanzado',tipo:'Seminario',    disciplina_nombre:'Defensa Personal',fecha_fin:'2026-04-18T14:00',ubicacion:'Aula 3',      instructor_nombre:'Cnel. Mamani',   estado:'Finalizada',  participaciones_count:30 },
  { id:4,  titulo:'Evaluación Taekwondo – Cinturón',   tipo:'Evaluación',    disciplina_nombre:'Taekwondo',fecha_fin:'2026-04-25T10:00',ubicacion:'Dojo Secundario',   instructor_nombre:'Sgto. Chura',    estado:'Programada',  participaciones_count:12 },
  { id:5,  titulo:'Entrenamiento Boxeo – Sparring',    tipo:'Entrenamiento', disciplina_nombre:'Boxeo',   fecha_fin:'2026-04-19T07:00', ubicacion:'Ring de Boxeo',     instructor_nombre:'Cab. Vargas',    estado:'Finalizada',  participaciones_count:8  },
  { id:6,  titulo:'Demostración Krav Maga',            tipo:'Demostración',  disciplina_nombre:'Krav Maga',fecha_fin:'2026-04-30T11:00',ubicacion:'Patio Central',     instructor_nombre:'Tte. Pérez',     estado:'Programada',  participaciones_count:40 },
  { id:7,  titulo:'Examen Final Jiu Jitsu',            tipo:'Examen',        disciplina_nombre:'BJJ',     fecha_fin:'2026-05-02T09:00', ubicacion:'Dojo Principal',    instructor_nombre:'Sgto. Apaza',    estado:'Programada',  participaciones_count:15 },
  { id:8,  titulo:'Competencia Regional Karate',       tipo:'Competencia',   disciplina_nombre:'Karate',  fecha_fin:'2026-05-10T08:00', ubicacion:'Coliseo Municipal', instructor_nombre:'Cnel. Ruiz',     estado:'Programada',  participaciones_count:22 },
]

const EMPTY = { titulo:'', tipo:'Entrenamiento', fecha_fin:'', ubicacion:'', estado:'Programada' }

const inputStyle = { width:'100%', padding:'8px 12px', borderRadius:8, fontSize:13, color:'white', outline:'none', background:'rgba(255,255,255,0.05)', border:'1px solid #2a2a2a' }
const selectStyle = { width:'100%', padding:'8px 12px', borderRadius:8, fontSize:13, color:'white', outline:'none', background:'#1a1a1a', border:'1px solid #2a2a2a' }
const labelStyle = { display:'block', fontSize:10, fontWeight:700, color:'#cc0000', marginBottom:5, letterSpacing:'0.1em' }
const cardStyle = { background:'#141414', border:'1px solid #1f1f1f', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.4)' }

/* ═══════════════════════════════════════════════════
   CANVAS API — Timeline de actividades (Sprint 4)
═══════════════════════════════════════════════════ */
function TimelineCanvas({ actividades }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const mouseRef  = useRef({ x: -1, y: -1 })
  const progressRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height

    // Fondo
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, W, H)

    if (!actividades.length) return

    const progress = progressRef.current
    const PAD = 60
    const lineY = H / 2
    const lineW = W - PAD * 2

    // Línea base con degradado
    const grad = ctx.createLinearGradient(PAD, 0, W - PAD, 0)
    grad.addColorStop(0, 'transparent')
    grad.addColorStop(0.1, '#cc0000')
    grad.addColorStop(0.9, '#cc0000')
    grad.addColorStop(1, 'transparent')
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(PAD, lineY)
    ctx.lineTo(PAD + lineW * Math.min(progress, 1), lineY)
    ctx.stroke()
    ctx.setLineDash([])

    // Particulas en la línea
    for (let i = 0; i < 4; i++) {
      const px = PAD + (lineW * ((Date.now() * 0.0002 + i * 0.25) % 1))
      ctx.beginPath()
      ctx.arc(px, lineY, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(204,0,0,${0.3 + Math.sin(Date.now() * 0.005 + i) * 0.2})`
      ctx.fill()
    }

    // Puntos de actividad
    const step = lineW / (actividades.length - 1 || 1)
    actividades.forEach((act, idx) => {
      const x = PAD + idx * step
      const reveal = Math.min(1, (progress - idx * 0.12) * 3)
      if (reveal <= 0) return

      const tc = TIPO_COLOR[act.tipo] || TIPO_COLOR['Entrenamiento']
      const isHovered = Math.abs(mouseRef.current.x - x) < 24 && Math.abs(mouseRef.current.y - lineY) < 60

      // Línea vertical
      const above = idx % 2 === 0
      const yEnd = above ? lineY - 70 : lineY + 70
      ctx.strokeStyle = isHovered ? '#cc0000' : 'rgba(204,0,0,0.35)'
      ctx.lineWidth = isHovered ? 1.5 : 1
      ctx.beginPath()
      ctx.moveTo(x, lineY)
      ctx.lineTo(x, yEnd)
      ctx.stroke()

      // Círculo del punto
      const radius = isHovered ? 8 : 6
      ctx.beginPath()
      ctx.arc(x, lineY, radius * reveal, 0, Math.PI * 2)
      ctx.fillStyle = isHovered ? '#cc0000' : 'rgba(204,0,0,0.7)'
      ctx.fill()
      ctx.strokeStyle = isHovered ? '#ff4444' : 'rgba(204,0,0,0.4)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Pulse ring en hover
      if (isHovered) {
        const pulse = ((Date.now() % 1200) / 1200)
        ctx.beginPath()
        ctx.arc(x, lineY, 8 + pulse * 16, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(204,0,0,${0.4 - pulse * 0.4})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Etiqueta
      const labelY = above ? yEnd - 8 : yEnd + 8
      ctx.save()
      ctx.globalAlpha = reveal

      // Caja del label
      const boxW = 110, boxH = above ? -44 : 44
      const boxX = x - boxW / 2
      const boxTop = above ? labelY - 40 : labelY

      ctx.fillStyle = isHovered ? 'rgba(204,0,0,0.12)' : 'rgba(20,20,20,0.9)'
      ctx.strokeStyle = isHovered ? 'rgba(204,0,0,0.5)' : 'rgba(204,0,0,0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(boxX, boxTop, boxW, 38, 6)
      ctx.fill()
      ctx.stroke()

      // Tipo badge
      ctx.fillStyle = tc.color
      ctx.font = 'bold 9px "Segoe UI", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(act.tipo.toUpperCase(), x, boxTop + 13)

      // Título
      const title = act.titulo.length > 15 ? act.titulo.substring(0, 14) + '…' : act.titulo
      ctx.fillStyle = isHovered ? 'white' : '#9ca3af'
      ctx.font = '10px "Segoe UI", sans-serif'
      ctx.fillText(title, x, boxTop + 26)

      // Estado punto
      const sc = ESTADO_COLOR[act.estado]
      ctx.fillStyle = sc?.color || '#6b7280'
      ctx.font = '9px "Segoe UI", sans-serif'
      ctx.fillText(act.estado, x, boxTop + 38)

      ctx.restore()
    })

    // Tooltip ampliado en hover
    const hovIdx = actividades.findIndex((_, idx) => {
      const x = PAD + idx * step
      return Math.abs(mouseRef.current.x - x) < 24
    })
    if (hovIdx >= 0 && mouseRef.current.x > 0) {
      const act = actividades[hovIdx]
      const tx = Math.min(mouseRef.current.x, W - 200)
      const ty = mouseRef.current.y > H / 2 ? mouseRef.current.y - 110 : mouseRef.current.y + 20

      ctx.fillStyle = 'rgba(15,15,15,0.95)'
      ctx.strokeStyle = 'rgba(204,0,0,0.6)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(tx, ty, 190, 90, 8)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#cc0000'
      ctx.font = 'bold 10px "Segoe UI"'
      ctx.textAlign = 'left'
      ctx.fillText(act.tipo, tx + 10, ty + 16)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 11px "Segoe UI"'
      const fullTitle = act.titulo.length > 26 ? act.titulo.substring(0, 25) + '…' : act.titulo
      ctx.fillText(fullTitle, tx + 10, ty + 32)
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px "Segoe UI"'
      ctx.fillText(`📍 ${act.ubicacion || '—'}`, tx + 10, ty + 48)
      ctx.fillText(`👤 ${act.instructor_nombre || '—'}`, tx + 10, ty + 62)
      ctx.fillStyle = ESTADO_COLOR[act.estado]?.color || '#9ca3af'
      ctx.fillText(`● ${act.estado}  ·  ${act.participaciones_count || 0} participantes`, tx + 10, ty + 78)
    }

  }, [actividades])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const start = Date.now()
    const loop = () => {
      const elapsed = (Date.now() - start) / 1000
      progressRef.current = Math.min(elapsed / 1.2, 1)
      draw()
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)

    const onMove = e => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => { mouseRef.current = { x: -1, y: -1 } }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    const onResize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [draw])

  return (
    <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block', cursor:'crosshair' }} />
  )
}

/* ═══════════════════════════════════════════════════
   SVG Circular Animado — Distribución por estado (Sprint 4)
═══════════════════════════════════════════════════ */
function EstadoDonut({ actividades }) {
  const total = actividades.length || 1
  const programadas = actividades.filter(a => a.estado === 'Programada').length
  const enCurso     = actividades.filter(a => a.estado === 'En Curso').length
  const finalizadas = actividades.filter(a => a.estado === 'Finalizada').length

  const [animated, setAnimated] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(1), 50)
    return () => clearTimeout(t)
  }, [actividades])

  const R = 52, C = R * 2 * Math.PI
  const segments = [
    { value: programadas, color: '#6b7280', label: 'Programadas' },
    { value: enCurso,     color: '#cc0000', label: 'En Curso' },
    { value: finalizadas, color: '#374151', label: 'Finalizadas' },
  ]

  let cumulative = 0
  const paths = segments.map((seg, i) => {
    const frac = (seg.value / total) * animated
    const dash = C * frac
    const offset = C * (1 - cumulative)
    cumulative += frac
    return (
      <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={seg.color} strokeWidth={i === 1 ? 14 : 10}
        strokeDasharray={`${dash} ${C - dash}`}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)', transformOrigin:'center', transform:'rotate(-90deg) scaleY(-1)' }}
      />
    )
  })

  return (
    <div style={{ display:'flex', alignItems:'center', gap:24 }}>
      <div style={{ position:'relative', flexShrink:0 }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Track */}
          <circle cx="70" cy="70" r={R} fill="none" stroke="#1f1f1f" strokeWidth="14" />
          {paths}
          {/* Centro */}
          <text x="70" y="64" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">{total}</text>
          <text x="70" y="80" textAnchor="middle" fill="#4b5563" fontSize="9">TOTAL</text>
        </svg>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:s.color }} />
              <span style={{ fontSize:12, color:'#9ca3af' }}>{s.label}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:60, height:4, borderRadius:2, background:'#1f1f1f', overflow:'hidden' }}>
                <div style={{ width:`${(s.value/total)*100*animated}%`, height:'100%', background:s.color, transition:'width 1.2s ease' }} />
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:s.color, minWidth:20, textAlign:'right' }}>{s.value}</span>
            </div>
          </div>
        ))}
        {/* Alerta pulse si hay En Curso */}
        {enCurso > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4, padding:'6px 10px', borderRadius:8, background:'rgba(204,0,0,0.1)', border:'1px solid rgba(204,0,0,0.25)' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#cc0000', animation:'pulse-ring 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize:11, color:'#cc0000', fontWeight:600 }}>{enCurso} actividad(es) en curso</span>
            <style>{`@keyframes pulse-ring{0%,100%{box-shadow:0 0 0 0 rgba(204,0,0,0.6)}50%{box-shadow:0 0 0 6px rgba(204,0,0,0)}}`}</style>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════ */
export default function ActividadesPage() {
  const [actividades, setActividades] = useState([])
  const [loading, setLoading]         = useState(true)
  const [busqueda, setBusqueda]       = useState('')
  const [filtroTipo, setFiltroTipo]   = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [modal, setModal]             = useState(null)
  const [seleccionado, setSelec]      = useState(null)
  const [form, setForm]               = useState(EMPTY)
  const [guardando, setGuardando]     = useState(false)
  const [error, setError]             = useState('')
  const [nextId, setNextId]           = useState(9)
  const [vista, setVista]             = useState('tabla') // 'tabla' | 'timeline'

  useEffect(() => {
    setLoading(true)
    api.get('/actividades/')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || []
        setActividades(data.length ? data : SEED)
      })
      .catch(() => setActividades(SEED))
      .finally(() => setLoading(false))
  }, [])

  const filtradas = actividades.filter(a => {
    const matchB = !busqueda || a.titulo?.toLowerCase().includes(busqueda.toLowerCase())
    const matchT = !filtroTipo || a.tipo === filtroTipo
    const matchE = !filtroEstado || a.estado === filtroEstado
    return matchB && matchT && matchE
  })

  const abrirCrear   = () => { setForm(EMPTY); setError(''); setModal('crear') }
  const abrirEditar  = a => { setSelec(a); setForm({ titulo:a.titulo, tipo:a.tipo, fecha_fin:a.fecha_fin?.slice(0,16), ubicacion:a.ubicacion, estado:a.estado }); setError(''); setModal('editar') }
  const abrirEliminar = a => { setSelec(a); setModal('eliminar') }
  const cerrar = () => { setModal(null); setSelec(null); setError('') }
  const handleInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const guardar = async () => {
    if (!form.titulo || !form.fecha_fin) { setError('Título y fecha son obligatorios'); return }
    setGuardando(true); setError('')
    try {
      if (modal === 'crear') {
        const nueva = { ...form, id: nextId, disciplina_nombre: '', instructor_nombre: 'Sin asignar', participaciones_count: 0 }
        setActividades(prev => [nueva, ...prev])
        setNextId(n => n + 1)
        try { await api.post('/actividades/', form) } catch {}
      } else {
        setActividades(prev => prev.map(a => a.id === seleccionado.id ? { ...a, ...form } : a))
        try { await api.put(`/actividades/${seleccionado.id}/`, form) } catch {}
      }
      cerrar()
    } finally { setGuardando(false) }
  }

  const eliminar = async () => {
    setGuardando(true)
    setActividades(prev => prev.filter(a => a.id !== seleccionado.id))
    try { await api.delete(`/actividades/${seleccionado.id}/`) } catch {}
    cerrar(); setGuardando(false)
  }

  return (
    <div style={{ padding:32, minHeight:'100vh', background:'#0f0f0f' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ padding:8, borderRadius:10, background:'#cc0000' }}>
            <Activity size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'white' }}>Actividades</h1>
            <p style={{ fontSize:11, color:'#6b7280' }}>Gestión de entrenamientos y eventos — {filtradas.length} actividad(es)</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {/* Toggle vista */}
          <div style={{ display:'flex', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:8, overflow:'hidden' }}>
            {[['tabla','≡ Tabla'], ['timeline','⟣ Timeline']].map(([v, lbl]) => (
              <button key={v} onClick={() => setVista(v)} style={{ padding:'8px 14px', fontSize:12, fontWeight:600, color: vista===v ? 'white' : '#6b7280', background: vista===v ? '#cc0000' : 'transparent', border:'none', cursor:'pointer', transition:'all 0.2s' }}>{lbl}</button>
            ))}
          </div>
          <button onClick={abrirCrear} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:10, fontSize:13, fontWeight:600, color:'white', cursor:'pointer', background:'#cc0000', border:'none', boxShadow:'0 4px 14px rgba(204,0,0,0.4)' }}>
            <Plus size={15} /> Nueva Actividad
          </button>
        </div>
      </div>

      {/* Stats + Donut SVG */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        {/* KPIs */}
        <div style={{ ...cardStyle, padding:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { label:'Total',       value: actividades.length,                                        color:'#cc0000' },
            { label:'En Curso',    value: actividades.filter(a=>a.estado==='En Curso').length,        color:'#cc0000' },
            { label:'Programadas', value: actividades.filter(a=>a.estado==='Programada').length,      color:'#9ca3af' },
            { label:'Finalizadas', value: actividades.filter(a=>a.estado==='Finalizada').length,      color:'#4b5563' },
          ].map((k,i) => (
            <div key={i} style={{ padding:'12px 14px', borderRadius:8, background:'#1a1a1a', border:'1px solid #2a2a2a' }}>
              <p style={{ fontSize:10, color:'#4b5563', marginBottom:4 }}>{k.label.toUpperCase()}</p>
              <p style={{ fontSize:28, fontWeight:700, color:k.color }}>{k.value}</p>
            </div>
          ))}
        </div>
        {/* Donut SVG animado */}
        <div style={{ ...cardStyle, padding:20 }}>
          <h3 style={{ fontSize:12, fontWeight:700, color:'#6b7280', marginBottom:16, letterSpacing:'0.08em' }}>DISTRIBUCIÓN POR ESTADO</h3>
          <EstadoDonut actividades={actividades} />
        </div>
      </div>

      {/* Canvas Timeline */}
      {vista === 'timeline' && (
        <div style={{ ...cardStyle, marginBottom:20, overflow:'hidden' }}>
          <div style={{ padding:'12px 20px', background:'#1a0000', borderBottom:'1px solid rgba(204,0,0,0.15)', display:'flex', alignItems:'center', gap:8 }}>
            <Activity size={14} color="#cc0000" />
            <span style={{ fontSize:12, fontWeight:700, color:'white' }}>Timeline de Actividades</span>
            <span style={{ fontSize:10, color:'#4b5563', marginLeft:4 }}>— mueve el cursor sobre los puntos</span>
          </div>
          <div style={{ height:320 }}>
            <TimelineCanvas actividades={filtradas.slice(0,8)} />
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:220 }}>
          <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#4b5563' }} />
          <input type="text" placeholder="Buscar actividades..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
            style={{ ...inputStyle, paddingLeft:34, background:'#1a1a1a', border:'1px solid #2a2a2a' }} />
        </div>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ ...selectStyle, minWidth:150 }}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={{ ...selectStyle, minWidth:140 }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Tabla */}
      {vista === 'tabla' && (
        <div style={{ ...cardStyle, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#1a0000' }}>
                {['#','Actividad','Tipo','Fecha Fin','Ubicación','Instructor','Estado','Part.','Acciones'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#9ca3af', letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign:'center', padding:48, color:'#4b5563' }}>Cargando...</td></tr>
              ) : filtradas.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign:'center', padding:48, color:'#4b5563' }}>No se encontraron actividades</td></tr>
              ) : filtradas.map((a, i) => {
                const tc = TIPO_COLOR[a.tipo] || TIPO_COLOR['Entrenamiento']
                const ec = ESTADO_COLOR[a.estado] || ESTADO_COLOR['Programada']
                return (
                  <tr key={a.id} style={{ background: i%2===0 ? '#111' : '#141414', borderBottom:'1px solid #1f1f1f' }}>
                    <td style={{ padding:'10px 16px', color:'#4b5563', fontSize:12 }}>{a.id}</td>
                    <td style={{ padding:'10px 16px' }}>
                      <p style={{ color:'white', fontWeight:600, fontSize:13 }}>{a.titulo}</p>
                      {a.disciplina_nombre && <p style={{ color:'#4b5563', fontSize:10 }}>{a.disciplina_nombre}</p>}
                    </td>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:tc.bg, color:tc.color, border:`1px solid ${tc.border}` }}>{a.tipo}</span>
                    </td>
                    <td style={{ padding:'10px 16px', color:'#6b7280', fontSize:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <Calendar size={11} color="#4b5563" />
                        {a.fecha_fin?.slice(0,16).replace('T', ' ') || '—'}
                      </div>
                    </td>
                    <td style={{ padding:'10px 16px', color:'#6b7280', fontSize:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <MapPin size={11} color="#4b5563" />
                        {a.ubicacion || '—'}
                      </div>
                    </td>
                    <td style={{ padding:'10px 16px', color:'#9ca3af', fontSize:12 }}>{a.instructor_nombre || '—'}</td>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:ec.bg, color:ec.color, border:`1px solid ${ec.border}` }}>{a.estado}</span>
                    </td>
                    <td style={{ padding:'10px 16px', textAlign:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <Users size={11} color="#4b5563" />
                        <span style={{ fontSize:13, fontWeight:600, color:'#9ca3af' }}>{a.participaciones_count || 0}</span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 16px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => abrirEditar(a)} style={{ padding:6, borderRadius:8, background:'#1a1a1a', border:'1px solid #2a2a2a', cursor:'pointer' }}><Pencil size={13} color="#9ca3af" /></button>
                        <button onClick={() => abrirEliminar(a)} style={{ padding:6, borderRadius:8, background:'rgba(204,0,0,0.1)', border:'1px solid rgba(204,0,0,0.2)', cursor:'pointer' }}><Trash2 size={13} color="#cc0000" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tarjetas en vista timeline */}
      {vista === 'timeline' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:14 }}>
          {filtradas.map(a => {
            const tc = TIPO_COLOR[a.tipo] || TIPO_COLOR['Entrenamiento']
            const ec = ESTADO_COLOR[a.estado] || ESTADO_COLOR['Programada']
            return (
              <div key={a.id} style={{ ...cardStyle, padding:16, borderTop:`2px solid ${tc.color}`, transition:'transform 0.2s', cursor:'default' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:tc.bg, color:tc.color, border:`1px solid ${tc.border}` }}>{a.tipo}</span>
                  <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, background:ec.bg, color:ec.color }}>{a.estado}</span>
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:8, lineHeight:1.3 }}>{a.titulo}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#6b7280' }}>
                    <Calendar size={11} color="#4b5563" />{a.fecha_fin?.slice(0,16).replace('T',' ') || '—'}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#6b7280' }}>
                    <MapPin size={11} color="#4b5563" />{a.ubicacion || '—'}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#6b7280' }}>
                    <Users size={11} color="#4b5563" />{a.participaciones_count || 0} participantes
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, marginTop:12 }}>
                  <button onClick={() => abrirEditar(a)} style={{ flex:1, padding:'6px 0', borderRadius:7, background:'#1a1a1a', border:'1px solid #2a2a2a', color:'#9ca3af', fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                    <Pencil size={11} /> Editar
                  </button>
                  <button onClick={() => abrirEliminar(a)} style={{ padding:'6px 10px', borderRadius:7, background:'rgba(204,0,0,0.1)', border:'1px solid rgba(204,0,0,0.2)', color:'#cc0000', cursor:'pointer' }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {(modal === 'crear' || modal === 'editar') && (
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(5px)' }}>
          <div style={{ background:'#111', border:'1px solid rgba(204,0,0,0.3)', borderRadius:16, padding:24, width:'100%', maxWidth:500, margin:'0 16px', boxShadow:'0 0 60px rgba(204,0,0,0.12)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Activity size={18} color="#cc0000" />
                <h2 style={{ fontSize:16, fontWeight:700, color:'white' }}>{modal==='crear' ? 'Nueva Actividad' : 'Editar Actividad'}</h2>
              </div>
              <button onClick={cerrar} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={18} color="#4b5563" /></button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1 / -1' }}>
                <label style={labelStyle}>TÍTULO *</label>
                <input type="text" name="titulo" value={form.titulo} onChange={handleInput} placeholder="Ej: Entrenamiento Karate" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>TIPO</label>
                <select name="tipo" value={form.tipo} onChange={handleInput} style={selectStyle}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>ESTADO</label>
                <select name="estado" value={form.estado} onChange={handleInput} style={selectStyle}>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>FECHA / HORA FIN *</label>
                <input type="datetime-local" name="fecha_fin" value={form.fecha_fin} onChange={handleInput} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>UBICACIÓN</label>
                <input type="text" name="ubicacion" value={form.ubicacion} onChange={handleInput} placeholder="Ej: Dojo Principal" style={inputStyle} />
              </div>
            </div>
            {error && <p style={{ marginTop:10, fontSize:12, color:'#ff6666', background:'rgba(204,0,0,0.1)', padding:'8px 12px', borderRadius:8 }}>{error}</p>}
            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button onClick={cerrar} style={{ flex:1, padding:10, borderRadius:10, fontSize:13, fontWeight:600, background:'#1a1a1a', border:'1px solid #2a2a2a', color:'#9ca3af', cursor:'pointer' }}>Cancelar</button>
              <button onClick={guardar} disabled={guardando} style={{ flex:1, padding:10, borderRadius:10, fontSize:13, fontWeight:600, color:'white', background:'#cc0000', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Save size={14} />{guardando ? 'Guardando...' : modal==='crear' ? 'Crear Actividad' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modal === 'eliminar' && (
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(5px)' }}>
          <div style={{ background:'#111', border:'1px solid rgba(204,0,0,0.3)', borderRadius:16, padding:24, width:'100%', maxWidth:360, margin:'0 16px', textAlign:'center' }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(204,0,0,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <Trash2 size={24} color="#cc0000" />
            </div>
            <h2 style={{ fontSize:16, fontWeight:700, color:'white', marginBottom:8 }}>Eliminar Actividad</h2>
            <p style={{ fontSize:13, color:'#6b7280', marginBottom:20 }}>¿Eliminar <strong style={{ color:'white' }}>{seleccionado?.titulo}</strong>?</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={cerrar} style={{ flex:1, padding:10, borderRadius:10, fontSize:13, fontWeight:600, background:'#1a1a1a', border:'1px solid #2a2a2a', color:'#9ca3af', cursor:'pointer' }}>Cancelar</button>
              <button onClick={eliminar} disabled={guardando} style={{ flex:1, padding:10, borderRadius:10, fontSize:13, fontWeight:600, color:'white', background:'#cc0000', border:'none', cursor:'pointer' }}>
                {guardando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}