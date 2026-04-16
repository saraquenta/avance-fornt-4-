import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Users, ClipboardList, TrendingUp, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line
} from 'recharts'

const ROJO  = '#cc0000'
const ROJO2 = '#991111'
const PLOMO = '#4b5563'
const PLOMO2 = '#9ca3af'

const NIVEL_COLORS = { EXCELENTE:'#cc0000', BUENO:'#6b7280', REGULAR:'#374151', CRITICO:'#880000' }

const cardStyle = { background:'#141414', border:'1px solid #1f1f1f', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.4)' }

/* ─── Canvas — Línea de progreso vs meta (Sprint 4) ─── */
function ProgressCanvas({ data }) {
  const canvasRef = useRef(null)
  const mouseRef  = useRef({ x:-1, y:-1 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return
    const ctx = canvas.getContext('2d')
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const W = canvas.width, H = canvas.height
    const PAD = { top:20, right:20, bottom:30, left:40 }
    const chartW = W - PAD.left - PAD.right
    const chartH = H - PAD.top - PAD.bottom
    const maxVal = 100

    let frame
    let progress = 0

    const getX = i => PAD.left + (i / (data.length - 1)) * chartW
    const getY = v => PAD.top + chartH - (v / maxVal) * chartH

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Grid
      for (let v = 0; v <= 100; v += 25) {
        const y = getY(v)
        ctx.strokeStyle = '#1f1f1f'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#374151'
        ctx.font = '9px "Segoe UI"'
        ctx.textAlign = 'right'
        ctx.fillText(v, PAD.left - 5, y + 3)
      }

      // Línea meta (70)
      const metaY = getY(70)
      ctx.strokeStyle = 'rgba(107,114,128,0.5)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([8, 5])
      ctx.beginPath(); ctx.moveTo(PAD.left, metaY); ctx.lineTo(W - PAD.right, metaY); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#4b5563'
      ctx.font = '9px "Segoe UI"'
      ctx.textAlign = 'left'
      ctx.fillText('META 70', PAD.left + 4, metaY - 4)

      // Área degradada bajo la línea
      const pts = data.map((d, i) => ({ x: getX(i), y: getY(d.puntaje) }))
      const revealCount = Math.floor(pts.length * progress)
      if (revealCount > 1) {
        const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom)
        grad.addColorStop(0, 'rgba(204,0,0,0.25)')
        grad.addColorStop(1, 'rgba(204,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(pts[0].x, H - PAD.bottom)
        pts.slice(0, revealCount).forEach(p => ctx.lineTo(p.x, p.y))
        ctx.lineTo(pts[Math.min(revealCount-1, pts.length-1)].x, H - PAD.bottom)
        ctx.closePath()
        ctx.fill()

        // Línea principal
        ctx.strokeStyle = ROJO
        ctx.lineWidth = 2.5
        ctx.lineJoin = 'round'
        ctx.beginPath()
        pts.slice(0, revealCount).forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
        ctx.stroke()

        // Puntos
        pts.slice(0, revealCount).forEach((p, i) => {
          const isHov = Math.abs(mouseRef.current.x - p.x) < 16 && Math.abs(mouseRef.current.y - p.y) < 20
          ctx.beginPath()
          ctx.arc(p.x, p.y, isHov ? 7 : 4, 0, Math.PI * 2)
          ctx.fillStyle = isHov ? '#ff4444' : ROJO
          ctx.fill()
          ctx.strokeStyle = isHov ? '#ff6666' : 'rgba(204,0,0,0.4)'
          ctx.lineWidth = isHov ? 2 : 1.5
          ctx.stroke()

          if (isHov) {
            ctx.fillStyle = 'rgba(15,15,15,0.92)'
            ctx.strokeStyle = 'rgba(204,0,0,0.5)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.roundRect(p.x - 40, p.y - 40, 80, 30, 6)
            ctx.fill(); ctx.stroke()
            ctx.fillStyle = ROJO
            ctx.font = 'bold 11px "Segoe UI"'
            ctx.textAlign = 'center'
            ctx.fillText(data[i].puntaje + ' pts', p.x, p.y - 20)
          }

          // Labels eje X
          ctx.fillStyle = '#374151'
          ctx.font = '9px "Segoe UI"'
          ctx.textAlign = 'center'
          ctx.fillText(data[i].name, p.x, H - PAD.bottom + 14)
        })
      }
    }

    const loop = () => {
      if (progress < 1) progress = Math.min(progress + 0.025, 1)
      draw()
      frame = requestAnimationFrame(loop)
    }
    loop()

    const onMove = e => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => { mouseRef.current = { x:-1, y:-1 } }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(frame)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [data])

  return <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block', cursor:'crosshair' }} />
}

export default function DashboardPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  const cargar = () => {
    api.get('/evaluaciones/dashboard/stats/')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
    const intervalo = setInterval(cargar, 60000)
    return () => clearInterval(intervalo)
  }, [])

  const dataNiveles = stats ? [
    { name:'Excelente', value: stats.niveles?.EXCELENTE || 0, color: ROJO  },
    { name:'Bueno',     value: stats.niveles?.BUENO     || 0, color: '#6b7280' },
    { name:'Regular',  value: stats.niveles?.REGULAR   || 0, color: '#374151' },
    { name:'Critico',  value: stats.niveles?.CRITICO   || 0, color: '#880000' },
  ] : []

  const dataRecientes = stats?.recientes?.map((ev, i) => ({
    name:    ev.personal?.split(' ').pop() || `E${i+1}`,
    puntaje: ev.puntaje,
  })) || []

  const dataArea = stats?.recientes?.map((ev, i) => ({
    name:    ev.fecha || `D${i+1}`,
    puntaje: ev.puntaje,
    meta:    70,
  })) || []

  const cards = [
    { label:'Personal Activo',      value: stats?.personal_activo  || 0,   icon: Users,         color: ROJO  },
    { label:'Evaluaciones del Mes', value: stats?.evaluaciones_mes || 0,   icon: ClipboardList, color: '#6b7280' },
    { label:'Promedio General',     value: stats?.promedio_general || '--', icon: TrendingUp,    color: ROJO2 },
    { label:'Alertas Activas',      value: stats?.alertas          || 0,   icon: AlertTriangle, color: '#880000' },
  ]

  const accesos = [
    { label:'Gestionar Personal',   ruta:'/personal'     },
    { label:'Registrar Evaluación', ruta:'/evaluaciones' },
    { label:'Ver Reportes',         ruta:'/reportes'     },
    { label:'Historial Actividad',  ruta:'/actividades'  },
  ]

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0f0f0f' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:`4px solid ${ROJO}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ color:PLOMO2, fontSize:12 }}>Cargando dashboard...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ padding:24, minHeight:'100vh', background:'#0f0f0f' }}>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'white' }}>Bienvenido, {user?.nombre}</h1>
        <p style={{ fontSize:12, color:PLOMO2, marginTop:4 }}>
          Rol: <span style={{ color:ROJO, fontWeight:600 }}>{user?.rol}</span>
          &nbsp;·&nbsp;Sistema de Evaluación de Desempeño Militar
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:20 }}>
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} style={{ ...cardStyle, padding:16, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:10, background:`${c.color}18`, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${c.color}33` }}>
                <Icon size={19} color={c.color} />
              </div>
              <div>
                <p style={{ fontSize:10, color:PLOMO2 }}>{c.label}</p>
                <p style={{ fontSize:24, fontWeight:700, color:c.color }}>{c.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráficos fila 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

        {/* Bar chart */}
        <div style={{ ...cardStyle, padding:20 }}>
          <h2 style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:16 }}>Últimas Evaluaciones — Puntaje</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataRecientes} margin={{ top:5, right:10, left:-20, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:PLOMO2 }} />
              <YAxis domain={[0,100]} tick={{ fontSize:10, fill:PLOMO2 }} />
              <Tooltip contentStyle={{ background:'#1a1a1a', border:'1px solid rgba(204,0,0,0.3)', borderRadius:8, fontSize:12, color:'white' }} />
              <Bar dataKey="puntaje" radius={[6,6,0,0]}>
                {dataRecientes.map((entry, i) => (
                  <Cell key={i} fill={entry.puntaje>=85 ? ROJO : entry.puntaje>=70 ? '#6b7280' : entry.puntaje>=50 ? '#374151' : '#880000'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{ ...cardStyle, padding:20 }}>
          <h2 style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:16 }}>Distribución por Nivel de Desempeño</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dataNiveles.filter(d=>d.value>0)} cx="50%" cy="50%" outerRadius={72}
                dataKey="value" label={({name,value}) => `${name}: ${value}`} labelLine={false}>
                {dataNiveles.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background:'#1a1a1a', border:'1px solid rgba(204,0,0,0.3)', borderRadius:8, fontSize:12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize:11, color:PLOMO2 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fila 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

        {/* Canvas — Progreso vs Meta (Sprint 4) */}
        <div style={{ ...cardStyle, padding:20 }}>
          <h2 style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:4 }}>Progreso vs Meta (70 pts)</h2>
          <p style={{ fontSize:10, color:'#374151', marginBottom:12 }}>Canvas API · pasa el cursor sobre los puntos</p>
          <div style={{ height:200 }}>
            {dataArea.length ? (
              <ProgressCanvas data={dataArea} />
            ) : (
              <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <p style={{ color:'#2a2a2a', fontSize:12 }}>Sin datos disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Acceso rápido + Estado */}
        <div style={{ display:'grid', gridTemplateRows:'1fr 1fr', gap:14 }}>
          <div style={{ ...cardStyle, padding:16 }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:12 }}>Acceso Rápido</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {accesos.map((a, i) => (
                <button key={i} onClick={() => navigate(a.ruta)} style={{
                  padding:'9px 10px', borderRadius:8, textAlign:'left', fontSize:11,
                  fontWeight:600, color:'white', background:'#1a0000',
                  border:'1px solid rgba(204,0,0,0.2)', cursor:'pointer', transition:'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(204,0,0,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = '#1a0000'}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, padding:16 }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:10 }}>Estado del Sistema</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { label:'Backend Django',    ok:true  },
                { label:'Base de datos',     ok:true  },
                { label:'Autenticación JWT', ok:true  },
                { label:'Motor ML',          ok:false },
                { label:'Reportes PDF',      ok:true  },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {item.ok
                    ? <CheckCircle size={13} color={ROJO} />
                    : <Clock size={13} color={PLOMO} />}
                  <span style={{ fontSize:11, flex:1, color: item.ok ? '#ff6666' : PLOMO2 }}>{item.label}</span>
                  <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, background: item.ok ? 'rgba(204,0,0,0.15)' : '#1a1a1a', color: item.ok ? '#ff4444' : PLOMO2, border:`1px solid ${item.ok ? '#cc000033' : '#2a2a2a'}` }}>
                    {item.ok ? 'Activo' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla evaluaciones recientes */}
      {stats?.recientes?.length > 0 && (
        <div style={{ ...cardStyle, overflow:'hidden' }}>
          <div style={{ padding:'12px 20px', background:'#1a0000', borderBottom:'1px solid rgba(204,0,0,0.15)' }}>
            <h2 style={{ fontSize:13, fontWeight:700, color:'white' }}>Evaluaciones Recientes</h2>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#1a0000', borderBottom:'2px solid rgba(204,0,0,0.15)' }}>
                {['Personal','Periodo','Fecha','Puntaje','Nivel'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:PLOMO2, letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recientes.map((ev, i) => {
                const nivel = ev.puntaje>=85 ? 'EXCELENTE' : ev.puntaje>=70 ? 'BUENO' : ev.puntaje>=50 ? 'REGULAR' : 'CRITICO'
                const color = NIVEL_COLORS[nivel]
                return (
                  <tr key={i} style={{ borderBottom:'1px solid #1f1f1f', background: i%2===0 ? '#111' : '#141414' }}>
                    <td style={{ padding:'10px 16px', fontSize:12, fontWeight:600, color:'white' }}>{ev.personal}</td>
                    <td style={{ padding:'10px 16px', fontSize:12, color:PLOMO2 }}>{ev.periodo}</td>
                    <td style={{ padding:'10px 16px', fontSize:12, color:PLOMO2 }}>{ev.fecha}</td>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ fontWeight:700, fontSize:14, color }}>{ev.puntaje}</span>
                    </td>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:`${color}18`, color, border:`1px solid ${color}33` }}>{nivel}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}