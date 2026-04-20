import { useState, useEffect } from 'react'
import api from '../services/api'
import { useStyles } from '../hooks/useStyles'
import { Brain, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend, LineChart, Line, ReferenceLine } from 'recharts'

const clasificarNivel = (n) => n>=90?'Excelente':n>=80?'Muy Bueno':n>=70?'Bueno':n>=60?'Regular':n>=50?'Bajo':'Crítico'

export default function ComandantePredicciones() {
  const S = useStyles()
  const [predicciones, setPredicciones] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [busquedaId,   setBusquedaId]   = useState('')
  const [individual,   setIndividual]   = useState(null)

  useEffect(()=>{
    const cargar = async () => {
      setLoading(true)
      try {
        const [pR, eR] = await Promise.all([api.get('/personal/'), api.get('/evaluaciones/')])
        const pers  = Array.isArray(pR.data) ? pR.data : pR.data?.results||[]
        const evals = Array.isArray(eR.data) ? eR.data : eR.data?.results||[]
        const enr = pers.map(p => {
          const mis = evals.filter(e=>e.personal===p.id).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))
          const prom = mis.length ? Math.round(mis.reduce((s,e)=>s+e.puntaje_total,0)/mis.length*100)/100 : 0
          const diffs = mis.length>=2 ? mis.slice(1).map((e,i)=>e.puntaje_total-mis[i].puntaje_total) : []
          const tv = diffs.length ? diffs.reduce((s,d)=>s+d,0)/diffs.length : 0
          const pred = Math.min(100,Math.max(0,Math.round((prom+tv*1.3)*100)/100))
          const conf = Math.min(97,Math.max(55,60+mis.length*6))
          return { ...p, promedio:prom, prediccion:pred, diferencia:Math.round((pred-prom)*100)/100, confianza:conf, tendencia:tv>2?'mejorando':tv<-2?'empeorando':'estable', evaluaciones:mis, totalEvals:mis.length }
        }).filter(p=>p.totalEvals>0).sort((a,b)=>b.prediccion-a.prediccion)
        setPredicciones(enr)
      } catch(e){ console.error(e) }
      finally{ setLoading(false) }
    }
    cargar()
  },[])

  const avgConf   = predicciones.length ? Math.round(predicciones.reduce((s,p)=>s+p.confianza,0)/predicciones.length) : 0
  const mejorando = predicciones.filter(p=>p.tendencia==='mejorando').length
  const empeo     = predicciones.filter(p=>p.tendencia==='empeorando').length
  const top8      = predicciones.slice(0,8)
  const scatter   = predicciones.map(p=>({x:p.promedio,y:p.prediccion}))

  const buscar = () => {
    const f = predicciones.find(p=>p.id===Number(busquedaId)||`${p.apellido} ${p.nombre}`.toLowerCase().includes(busquedaId.toLowerCase()))
    setIndividual(f||null)
  }

  if (loading) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'4px solid #cc0000', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
        <p style={{ ...S.textMuted, fontSize:12 }}>Calculando predicciones ML...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <div style={{ padding:9, borderRadius:10, background:'#cc0000' }}><Brain size={22} color="white"/></div>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, ...S.textPrimary }}>Predicciones Machine Learning</h1>
          <p style={{ fontSize:11, ...S.textMuted }}>Motor de regresión lineal · Tendencia ponderada · Datos reales</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Cursantes Analizados', value:predicciones.length,  color:'#cc0000' },
          { label:'Confianza Promedio',   value:`${avgConf}%`,         color:'#22c55e' },
          { label:'Con Tendencia +',      value:mejorando,             color:'#3b82f6' },
          { label:'Con Tendencia −',      value:empeo,                 color:'#ef4444' },
        ].map((k,i)=>(
          <div key={i} style={{ ...S.card, padding:16 }}>
            <p style={{ fontSize:10, ...S.textMuted, marginBottom:4 }}>{k.label}</p>
            <p style={{ fontSize:28, fontWeight:800, color:k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Búsqueda individual */}
      <div style={{ ...S.card, padding:20, marginBottom:22 }}>
        <p style={S.sectionLabel}>BUSCAR PREDICCIÓN INDIVIDUAL</p>
        <div style={{ display:'flex', gap:12, marginBottom: individual?16:0 }}>
          <div style={{ position:'relative', flex:1 }}>
            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:S.isDark?'#4b5563':'#94a3b8' }}/>
            <input type="text" placeholder="ID o nombre del cursante..." value={busquedaId} onChange={e=>setBusquedaId(e.target.value)} onKeyDown={e=>e.key==='Enter'&&buscar()}
              style={{ ...S.inputPl(36), width:'100%' }}/>
          </div>
          <button onClick={buscar} style={S.btnRed}><Brain size={14}/> Predecir</button>
        </div>
        {individual && (
          <div style={{ ...S.cardAlt, padding:16, marginTop:14 }}>
            <p style={{ fontSize:13, fontWeight:700, marginBottom:12, ...S.textPrimary }}>{individual.apellido} {individual.nombre} — {individual.rango?.replace('_',' ')}</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:14 }}>
              {[
                { label:'Promedio Actual', value:individual.promedio,   color:'#cc0000' },
                { label:'Predicción ML',   value:individual.prediccion, color:'#22c55e' },
                { label:'Diferencia', value:`${individual.diferencia>=0?'+':''}${individual.diferencia}`, color:individual.diferencia>=0?'#22c55e':'#ef4444' },
                { label:'Confianza', value:`${individual.confianza}%`, color:'#3b82f6' },
              ].map((s,i)=>(
                <div key={i} style={{ ...S.card, padding:'10px 12px', textAlign:'center' }}>
                  <p style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</p>
                  <p style={{ fontSize:10, ...S.textMuted, marginTop:2 }}>{s.label}</p>
                </div>
              ))}
            </div>
            {individual.evaluaciones?.length>1&&(
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={individual.evaluaciones.sort((a,b)=>new Date(a.fecha)-new Date(b.fecha)).map((ev,i)=>({ label:`${ev.periodo||`E${i+1}`}`, promedio:ev.puntaje_total }))} margin={{top:5,right:10,left:-20,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={S.gridColor}/>
                  <XAxis dataKey="label" tick={{ fontSize:9, fill:S.tickColor }}/>
                  <YAxis domain={[0,100]} tick={{ fontSize:9, fill:S.tickColor }}/>
                  <Tooltip contentStyle={S.tooltipStyle}/>
                  <Line type="monotone" dataKey="promedio" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill:'#3b82f6', r:4 }} name="Promedio"/>
                  <ReferenceLine y={individual.prediccion} stroke="#cc0000" strokeDasharray="5 5" label={{ value:`Pred: ${individual.prediccion}`, fill:'#cc0000', fontSize:10 }}/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:22 }}>
        <div style={{ ...S.card, padding:20 }}>
          <p style={{ fontSize:12, fontWeight:700, ...S.textPrimary, marginBottom:16 }}>Predicción vs Valor Real (Top 8)</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={top8} margin={{top:5,right:10,left:-20,bottom:30}}>
              <CartesianGrid strokeDasharray="3 3" stroke={S.gridColor}/>
              <XAxis dataKey="apellido" tick={{ fontSize:9, fill:S.tickColor }} angle={-25} textAnchor="end"/>
              <YAxis domain={[0,100]} tick={{ fontSize:9, fill:S.tickColor }}/>
              <Tooltip contentStyle={S.tooltipStyle}/>
              <Bar dataKey="promedio"   fill="#cc0000" name="Real"          radius={[4,4,0,0]}/>
              <Bar dataKey="prediccion" fill={S.isDark?'#4b5563':'#94a3b8'} name="Predicción ML" radius={[4,4,0,0]}/>
              <Legend iconSize={10} wrapperStyle={{ fontSize:11, color:S.isDark?'#9ca3af':'#374151' }}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ ...S.card, padding:20 }}>
          <p style={{ fontSize:12, fontWeight:700, ...S.textPrimary, marginBottom:4 }}>Precisión del Modelo</p>
          <p style={{ fontSize:10, ...S.textMuted, marginBottom:14 }}>Dispersión predicción vs valor real</p>
          <ResponsiveContainer width="100%" height={230}>
            <ScatterChart margin={{top:5,right:10,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke={S.gridColor}/>
              <XAxis dataKey="x" name="Real"       type="number" domain={[40,105]} tick={{ fontSize:9, fill:S.tickColor }}/>
              <YAxis dataKey="y" name="Predicción" type="number" domain={[40,105]} tick={{ fontSize:9, fill:S.tickColor }}/>
              <Tooltip cursor={{ strokeDasharray:'3 3' }} contentStyle={S.tooltipStyle}/>
              <Scatter data={scatter} fill="#cc0000" fillOpacity={0.7} name="Pred vs Real"/>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ ...S.card, overflow:'hidden' }}>
        <div style={S.tableHeaderBar}>
          <p style={{ fontSize:13, fontWeight:700, color:'white', display:'flex', alignItems:'center', gap:8 }}>
            <Brain size={15} color="#cc0000"/> Tabla de Predicciones
          </p>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:S.isDark?'#1a0000':'#1a0000' }}>
              {['ID','Cursante','Promedio Actual','Predicción','Diferencia','Confianza','Tendencia ML'].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#9ca3af', letterSpacing:'0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {predicciones.map((p,i)=>{
              const TI = p.tendencia==='mejorando'?TrendingUp:p.tendencia==='empeorando'?TrendingDown:Minus
              const tc = p.tendencia==='mejorando'?'#22c55e':p.tendencia==='empeorando'?'#ef4444':'#6b7280'
              const row = i%2===0 ? S.tableRowEven : S.tableRowOdd
              return (
                <tr key={p.id} style={row}>
                  <td style={{ padding:'10px 16px', fontSize:12, ...S.textMuted }}>{p.id}</td>
                  <td style={{ padding:'10px 16px' }}>
                    <p style={{ fontWeight:600, fontSize:13, ...S.textPrimary }}>{p.apellido} {p.nombre}</p>
                    <p style={{ fontSize:10, ...S.textMuted }}>{p.rango?.replace('_',' ')}</p>
                  </td>
                  <td style={{ padding:'10px 16px' }}><span style={{ fontWeight:800, fontSize:15, color:'#cc0000' }}>{p.promedio}</span></td>
                  <td style={{ padding:'10px 16px' }}><span style={{ fontWeight:800, fontSize:15, color:'#22c55e' }}>{p.prediccion}</span></td>
                  <td style={{ padding:'10px 16px' }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:p.diferencia>=0?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)', color:p.diferencia>=0?'#22c55e':'#ef4444', border:`1px solid ${p.diferencia>=0?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}` }}>
                      {p.diferencia>=0?'+':''}{p.diferencia}
                    </span>
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ flex:1, height:5, borderRadius:3, ...S.progressBg }}>
                        <div style={{ height:5, borderRadius:3, width:`${p.confianza}%`, background:p.confianza>=80?'#22c55e':'#d97706' }}/>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, ...S.textMuted, minWidth:36 }}>{p.confianza}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <TI size={13} color={tc}/>
                      <span style={{ fontSize:12, color:tc, fontWeight:600, textTransform:'capitalize' }}>{p.tendencia}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}