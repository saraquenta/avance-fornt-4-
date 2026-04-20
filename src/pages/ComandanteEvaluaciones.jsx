import { useState, useEffect } from 'react'
import api from '../services/api'
import { useStyles } from '../hooks/useStyles'
import { ClipboardList, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'

const getCellColor = (val) => {
  if (!val && val!==0) return { bg:'transparent', text:'#4b5563' }
  if (val>=90) return { bg:'#15803d', text:'white' }
  if (val>=80) return { bg:'#0891b2', text:'white' }
  if (val>=70) return { bg:'#d97706', text:'white' }
  if (val>=60) return { bg:'#ea580c', text:'white' }
  return { bg:'#dc2626', text:'white' }
}

export default function ComandanteEvaluaciones() {
  const S = useStyles()
  const [evaluaciones, setEvaluaciones] = useState([])
  const [personal,     setPersonal]     = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const [eR, pR] = await Promise.all([api.get('/evaluaciones/'), api.get('/personal/')])
        setEvaluaciones(Array.isArray(eR.data) ? eR.data : eR.data?.results||[])
        setPersonal(Array.isArray(pR.data) ? pR.data : pR.data?.results||[])
      } catch(e){ console.error(e) }
      finally{ setLoading(false) }
    }
    cargar()
  }, [])

  const total = evaluaciones.length
  const periodos = [...new Set(evaluaciones.map(e=>e.periodo).filter(Boolean))]
  const statsPeriodos = periodos.map(per => {
    const evs = evaluaciones.filter(e=>e.periodo===per)
    return { periodo:per, promedio: evs.length?Math.round(evs.reduce((s,e)=>s+e.puntaje_total,0)/evs.length*100)/100:0, evaluaciones:evs.length, cursantes:[...new Set(evs.map(e=>e.personal))].length }
  })

  const distrib = [
    { rango:'85-100', label:'Excelente', color:'#22c55e', count:evaluaciones.filter(e=>e.puntaje_total>=85).length },
    { rango:'70-84',  label:'Muy Bueno', color:'#3b82f6', count:evaluaciones.filter(e=>e.puntaje_total>=70&&e.puntaje_total<85).length },
    { rango:'60-69',  label:'Bueno',     color:'#eab308', count:evaluaciones.filter(e=>e.puntaje_total>=60&&e.puntaje_total<70).length },
    { rango:'50-59',  label:'Regular',   color:'#f97316', count:evaluaciones.filter(e=>e.puntaje_total>=50&&e.puntaje_total<60).length },
    { rango:'0-49',   label:'Bajo',      color:'#ef4444', count:evaluaciones.filter(e=>e.puntaje_total<50).length },
  ]

  const evolucionData = evaluaciones.sort((a,b)=>new Date(a.fecha)-new Date(b.fecha)).slice(-10).map((ev,i)=>({ label:`E${i+1}`, puntaje:ev.puntaje_total }))

  const matrizData = personal.slice(0,20).map(p => {
    const mis = evaluaciones.filter(e=>e.personal===p.id).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))
    const prom = mis.length ? Math.round(mis.reduce((s,e)=>s+e.puntaje_total,0)/mis.length*100)/100 : 0
    return { nombre:p.apellido, promedio:prom, evals:mis }
  }).filter(d=>d.evals.length>0).sort((a,b)=>b.promedio-a.promedio)

  const maxEvals = Math.max(...matrizData.map(d=>d.evals.length),1)

  if (loading) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'4px solid #cc0000', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
        <p style={{ ...S.textMuted, fontSize:12 }}>Cargando evaluaciones...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <div style={{ padding:9, borderRadius:10, background:'#cc0000' }}><ClipboardList size={22} color="white"/></div>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, ...S.textPrimary }}>Módulo de Evaluaciones</h1>
          <p style={{ fontSize:11, ...S.textMuted }}>Módulo Comandante · Análisis de rendimiento por periodo</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Total Evaluaciones', value:total,                                                       color:'#cc0000' },
          { label:'Periodos',           value:periodos.length,                                             color:'#9ca3af' },
          { label:'Promedio General',   value:total?Math.round(evaluaciones.reduce((s,e)=>s+e.puntaje_total,0)/total*100)/100:0, color:'#22c55e' },
          { label:'Evaluados',          value:[...new Set(evaluaciones.map(e=>e.personal))].length,         color:'#3b82f6' },
        ].map((k,i)=>(
          <div key={i} style={{ ...S.card, padding:16 }}>
            <p style={{ fontSize:10, ...S.textMuted, marginBottom:4 }}>{k.label}</p>
            <p style={{ fontSize:28, fontWeight:800, color:k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Cards periodos */}
      {statsPeriodos.length>0 && (
        <div style={{ marginBottom:22 }}>
          <p style={S.sectionLabel}>EVALUACIONES POR PERIODO</p>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(statsPeriodos.length,4)},1fr)`, gap:14 }}>
            {statsPeriodos.map((p,i) => {
              const grads = ['linear-gradient(135deg,#7c3aed,#4c1d95)','linear-gradient(135deg,#1d4ed8,#1e3a8a)','linear-gradient(135deg,#0891b2,#164e63)']
              return (
                <div key={i} style={{ borderRadius:12, padding:20, color:'white', background:grads[i%grads.length] }}>
                  <p style={{ fontSize:13, fontWeight:600, marginBottom:6, opacity:0.9 }}>{p.periodo}</p>
                  <p style={{ fontSize:38, fontWeight:900, marginBottom:8 }}>{p.promedio}</p>
                  <div style={{ display:'flex', gap:16, fontSize:11, opacity:0.75 }}>
                    <span>👥 {p.cursantes} cursantes</span>
                    <span>📋 {p.evaluaciones} evals</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:22 }}>
        <div style={{ ...S.card, padding:20 }}>
          <p style={{ fontSize:12, fontWeight:700, ...S.textPrimary, marginBottom:16 }}>Distribución de Notas</p>
          {distrib.map((d,i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:11, color:d.color }}>{d.rango} — {d.label}</span>
                <span style={{ fontSize:11, fontWeight:700, ...S.textPrimary }}>{d.count}</span>
              </div>
              <div style={{ height:6, borderRadius:3, ...S.progressBg }}>
                <div style={{ height:6, borderRadius:3, width:total>0?`${(d.count/total)*100}%`:'0%', background:d.color, transition:'width 0.8s ease' }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...S.card, padding:20 }}>
          <p style={{ fontSize:12, fontWeight:700, ...S.textPrimary, marginBottom:16 }}>Evolución de Puntajes</p>
          {evolucionData.length>1 ? (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={evolucionData} margin={{top:5,right:10,left:-20,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={S.gridColor}/>
                <XAxis dataKey="label" tick={{ fontSize:10, fill:S.tickColor }}/>
                <YAxis domain={[0,100]} tick={{ fontSize:10, fill:S.tickColor }}/>
                <Tooltip contentStyle={S.tooltipStyle}/>
                <Line type="monotone" dataKey="puntaje" stroke="#cc0000" strokeWidth={2.5} dot={{ fill:'#cc0000', r:4 }} name="Puntaje"/>
              </LineChart>
            </ResponsiveContainer>
          ) : <p style={{ ...S.textMuted, fontSize:12, textAlign:'center', paddingTop:60 }}>Se necesitan más evaluaciones para mostrar el gráfico</p>}
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {[{l:'90-100 Excelente',c:'#15803d'},{l:'80-89 Muy Bueno',c:'#0891b2'},{l:'70-79 Bueno',c:'#d97706'},{l:'60-69 Regular',c:'#ea580c'},{l:'0-59 Bajo',c:'#dc2626'}].map((x,i)=>(
          <span key={i} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, color:'white', fontWeight:600, background:x.c }}>{x.l}</span>
        ))}
      </div>

      {/* Matriz calor */}
      <div style={{ ...S.card, overflow:'hidden' }}>
        <div style={S.tableHeaderBar}>
          <p style={{ fontSize:13, fontWeight:700, color:'white', display:'flex', alignItems:'center', gap:8 }}>
            <Activity size={15} color="#cc0000"/> Matriz de Rendimiento por Cursante
          </p>
        </div>
        <div style={{ overflowX:'auto', maxHeight:500, overflowY:'auto' }}>
          {matrizData.length===0 ? (
            <p style={{ textAlign:'center', padding:48, ...S.textMuted, fontSize:13 }}>No hay datos de evaluaciones registradas</p>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
              <thead>
                <tr style={{ position:'sticky', top:0, zIndex:5 }}>
                  <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#9ca3af', background:'#1a1a1a', minWidth:130, position:'sticky', left:0, zIndex:10, borderRight:`2px solid ${S.isDark?'#2a2a2a':'#e2e8f0'}` }}>Cursante</th>
                  <th style={{ padding:'10px 12px', textAlign:'center', fontSize:11, fontWeight:600, color:'#cc0000', background:'#1a1a1a', minWidth:80 }}>Promedio</th>
                  {Array.from({length:maxEvals},(_,i)=>(
                    <th key={i} style={{ padding:'10px 12px', textAlign:'center', fontSize:11, fontWeight:600, color:'#9ca3af', background:'#1a1a1a', minWidth:75 }}>Eval {i+1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrizData.map((fila,i) => {
                  const pc = getCellColor(fila.promedio)
                  const rowBg = S.isDark ? (i%2===0?'#111':'#141414') : (i%2===0?'#ffffff':'#f8fafc')
                  return (
                    <tr key={i} style={{ borderBottom:`1px solid ${S.isDark?'#1f1f1f':'#f1f5f9'}` }}>
                      <td style={{ padding:'10px 16px', fontSize:12, fontWeight:600, ...S.textPrimary, background:rowBg, position:'sticky', left:0, zIndex:5, borderRight:`2px solid ${S.isDark?'#2a2a2a':'#e2e8f0'}` }}>{fila.nombre}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center', fontWeight:800, fontSize:14, background:pc.bg, color:pc.text }}>{fila.promedio}</td>
                      {Array.from({length:maxEvals},(_,j)=>{
                        const ev = fila.evals[j]
                        if (!ev) return <td key={j} style={{ padding:'10px 12px', textAlign:'center', background:S.isDark?'#1a1a1a':'#f8fafc', color:S.isDark?'#2a2a2a':'#cbd5e1', fontSize:12 }}>—</td>
                        const {bg,text} = getCellColor(ev.puntaje_total)
                        return <td key={j} style={{ padding:'10px 12px', textAlign:'center', fontWeight:700, fontSize:13, background:bg, color:text }} title={`${ev.periodo}·${ev.fecha}`}>{ev.puntaje_total}</td>
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}