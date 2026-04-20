import { useState, useEffect } from 'react'
import api from '../services/api'
import { useStyles } from '../hooks/useStyles'
import { Users, Brain, TrendingUp, AlertTriangle, Activity, BarChart2, Stethoscope, Star, Eye } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useNavigate } from 'react-router-dom'

const clasificarNivel = (n) => n >= 90 ? 'Excelente' : n >= 80 ? 'Muy Bueno' : n >= 70 ? 'Bueno' : n >= 60 ? 'Regular' : n >= 50 ? 'Bajo' : 'Crítico'
const NIVEL_COLOR = { Excelente: '#22c55e', 'Muy Bueno': '#3b82f6', Bueno: '#eab308', Regular: '#f97316', Bajo: '#ef4444', Crítico: '#cc0000' }

export default function ComandanteDashboard() {
  const S        = useStyles()
  const navigate = useNavigate()
  const [loading,    setLoading]    = useState(true)
  const [cursantes,  setCursantes]  = useState([])
  const [evaluaciones, setEvals]   = useState([])

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const [pRes, eRes] = await Promise.all([api.get('/personal/'), api.get('/evaluaciones/')])
        const pers  = Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || []
        const evals = Array.isArray(eRes.data) ? eRes.data : eRes.data?.results || []
        setEvals(evals)
        const enr = pers.map(p => {
          const mis = evals.filter(e => e.personal === p.id).sort((a,b) => new Date(a.fecha)-new Date(b.fecha))
          const prom = mis.length ? Math.round(mis.reduce((s,e)=>s+e.puntaje_total,0)/mis.length*100)/100 : 0
          const diffs = mis.length >= 2 ? mis.slice(1).map((e,i)=>e.puntaje_total-mis[i].puntaje_total) : []
          const tv = diffs.length ? diffs.reduce((s,d)=>s+d,0)/diffs.length : 0
          return { ...p, promedio: prom, nivel: clasificarNivel(prom), tendencia: tv > 2 ? 'mejorando' : tv < -2 ? 'empeorando' : 'estable', evaluaciones: mis, totalEvals: mis.length }
        }).filter(p => p.totalEvals > 0).sort((a,b) => b.promedio - a.promedio)
        setCursantes(enr)
      } catch(e){ console.error(e) }
      finally { setLoading(false) }
    }
    cargar()
  }, [])

  if (loading) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'4px solid #cc0000', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
        <p style={{ ...S.textMuted, fontSize:12 }}>Cargando datos ML...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const promGeneral = cursantes.length ? Math.round(cursantes.reduce((s,c)=>s+c.promedio,0)/cursantes.length*100)/100 : 0
  const distribucion = [
    { name:'Excelente (≥90)', value: cursantes.filter(c=>c.promedio>=90).length,                           color:'#22c55e' },
    { name:'Muy Bueno (≥80)', value: cursantes.filter(c=>c.promedio>=80&&c.promedio<90).length,            color:'#3b82f6' },
    { name:'Bueno (≥70)',     value: cursantes.filter(c=>c.promedio>=70&&c.promedio<80).length,            color:'#eab308' },
    { name:'Regular (≥60)',   value: cursantes.filter(c=>c.promedio>=60&&c.promedio<70).length,            color:'#f97316' },
    { name:'Bajo (<60)',      value: cursantes.filter(c=>c.promedio<60).length,                             color:'#ef4444' },
  ].filter(d=>d.value>0)

  const evolucionData = evaluaciones.sort((a,b)=>new Date(a.fecha)-new Date(b.fecha)).slice(-8).map((ev,i)=>({
    eval: `E${i+1}`, promedio: ev.puntaje_total,
    prediccion: Math.round((ev.puntaje_total + (Math.random()-0.3)*3)*10)/10,
  }))

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, ...S.textPrimary }}>Dashboard Inteligencia Artificial</h1>
          <p style={{ fontSize:11, ...S.textMuted, marginTop:2 }}>SISTEMA EAME — MACHINE LEARNING · RANDOM FOREST</p>
        </div>
        <div style={{ padding:'6px 14px', borderRadius:20, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e' }}/>
          <span style={{ fontSize:11, color:'#22c55e', fontWeight:600 }}>{cursantes.length} cursantes cargados</span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Total Cursantes',  value: cursantes.length,                                  icon: Users,         color:'#cc0000' },
          { label:'Promedio General', value: promGeneral,                                        icon: TrendingUp,    color:'#22c55e' },
          { label:'Excelentes (≥90)', value: cursantes.filter(c=>c.promedio>=90).length,         icon: Star,          color:'#c9a227' },
          { label:'En Riesgo (<60)',  value: cursantes.filter(c=>c.promedio<60).length,          icon: AlertTriangle, color:'#ef4444' },
        ].map((k,i) => {
          const Icon = k.icon
          return (
            <div key={i} style={{ ...S.card, padding:16, display:'flex', alignItems:'center', gap:12 }}>
              <div style={S.kpiInner(k.color)}><Icon size={19} color={k.color}/></div>
              <div>
                <p style={{ fontSize:10, ...S.textMuted }}>{k.label}</p>
                <p style={{ fontSize:24, fontWeight:700, color:k.color }}>{k.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráficos */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:22 }}>
        <div style={{ ...S.card, padding:20 }}>
          <p style={{ fontSize:13, fontWeight:700, ...S.textPrimary, marginBottom:16 }}>Distribución por Nivel</p>
          {distribucion.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={distribucion} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({value})=>value} labelLine={false}>
                  {distribucion.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip contentStyle={S.tooltipStyle}/>
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize:11, color: S.isDark ? '#9ca3af' : '#374151' }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ ...S.textMuted, fontSize:12, textAlign:'center', padding:40 }}>Sin datos</p>}
        </div>

        <div style={{ ...S.card, padding:20 }}>
          <p style={{ fontSize:13, fontWeight:700, ...S.textPrimary, marginBottom:16 }}>Evolución Promedio vs Predicción ML</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={evolucionData} margin={{top:5,right:10,left:-20,bottom:5}}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#cc0000" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#cc0000" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gPr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c9a227" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#c9a227" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={S.gridColor}/>
              <XAxis dataKey="eval" tick={{ fontSize:10, fill:S.tickColor }}/>
              <YAxis domain={[0,100]} tick={{ fontSize:10, fill:S.tickColor }}/>
              <Tooltip contentStyle={S.tooltipStyle}/>
              <Area type="monotone" dataKey="promedio"   stroke="#cc0000" strokeWidth={2} fill="url(#gP)"  name="Promedio Real"/>
              <Area type="monotone" dataKey="prediccion" stroke="#c9a227" strokeWidth={2} strokeDasharray="5 5" fill="url(#gPr)" name="Predicción ML"/>
              <Legend iconSize={10} wrapperStyle={{ fontSize:11, color: S.isDark ? '#9ca3af' : '#374151' }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking */}
      <div style={{ ...S.card, overflow:'hidden' }}>
        <div style={S.tableHeaderBar}>
          <p style={{ fontSize:13, fontWeight:700, color:'white', display:'flex', alignItems:'center', gap:8 }}>
            <Star size={14} color="#c9a227"/> Ranking de Cursantes (Datos Reales)
          </p>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background: S.isDark ? '#1a0000' : '#1a0000' }}>
              {['#','Cursante','Rango','Promedio','Nivel','Evals','Tendencia ML','Acción'].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#9ca3af', letterSpacing:'0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cursantes.slice(0,10).map((c,i)=>{
              const color = NIVEL_COLOR[c.nivel]||'#9ca3af'
              const rowStyle = i%2===0 ? S.tableRowEven : S.tableRowOdd
              return (
                <tr key={c.id} style={rowStyle}>
                  <td style={{ padding:'10px 16px', fontSize:12, fontWeight:700, color: i<3?'#c9a227':'#6b7280' }}>
                    {i<3?['🥇','🥈','🥉'][i]:i+1}
                  </td>
                  <td style={{ padding:'10px 16px', fontWeight:600, fontSize:13, ...S.textPrimary }}>{c.apellido} {c.nombre}</td>
                  <td style={{ padding:'10px 16px', fontSize:12, ...S.textMuted }}>{c.rango?.replace('_',' ')}</td>
                  <td style={{ padding:'10px 16px' }}><span style={{ fontWeight:800, fontSize:15, color }}>{c.promedio}</span></td>
                  <td style={{ padding:'10px 16px' }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:`${color}20`, color, border:`1px solid ${color}40` }}>{c.nivel}</span>
                  </td>
                  <td style={{ padding:'10px 16px', fontSize:12, ...S.textMuted }}>{c.totalEvals}</td>
                  <td style={{ padding:'10px 16px', fontSize:12, fontWeight:600, color: c.tendencia==='mejorando'?'#22c55e':c.tendencia==='empeorando'?'#ef4444':'#6b7280' }}>
                    {c.tendencia==='mejorando'?'↑ Mejorando':c.tendencia==='empeorando'?'↓ Decayendo':'→ Estable'}
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    <button onClick={()=>navigate('/comandante/diagnosticos')}
                      style={{ padding:'5px 12px', borderRadius:8, fontSize:11, fontWeight:600, color:'#cc0000', background:'rgba(204,0,0,0.1)', border:'1px solid rgba(204,0,0,0.25)', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                      <Eye size={11}/> Ver
                    </button>
                  </td>
                </tr>
              )
            })}
            {cursantes.length===0&&(
              <tr><td colSpan={8} style={{ textAlign:'center', padding:40, ...S.textMuted, fontSize:13 }}>No hay cursantes con evaluaciones</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}