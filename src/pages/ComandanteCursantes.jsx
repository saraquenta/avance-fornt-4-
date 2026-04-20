import { useState, useEffect } from 'react'
import api from '../services/api'
import { useStyles } from '../hooks/useStyles'
import { Users, Search, Eye, TrendingUp, TrendingDown, Minus, Trophy, AlertTriangle } from 'lucide-react'

const clasificarNivel = (n) => n >= 90 ? 'Excelente' : n >= 80 ? 'Muy Bueno' : n >= 70 ? 'Bueno' : n >= 60 ? 'Regular' : n >= 50 ? 'Bajo' : 'Crítico'
const NIVEL_STYLE = {
  Excelente:   { bg:'rgba(34,197,94,0.15)',  color:'#22c55e', border:'rgba(34,197,94,0.3)'  },
  'Muy Bueno': { bg:'rgba(59,130,246,0.15)', color:'#3b82f6', border:'rgba(59,130,246,0.3)' },
  Bueno:       { bg:'rgba(234,179,8,0.15)',  color:'#eab308', border:'rgba(234,179,8,0.3)'  },
  Regular:     { bg:'rgba(249,115,22,0.15)', color:'#f97316', border:'rgba(249,115,22,0.3)' },
  Bajo:        { bg:'rgba(239,68,68,0.15)',  color:'#ef4444', border:'rgba(239,68,68,0.3)'  },
  Crítico:     { bg:'rgba(204,0,0,0.2)',     color:'#cc0000', border:'rgba(204,0,0,0.4)'    },
}

export default function ComandanteCursantes() {
  const S = useStyles()
  const [cursantes,  setCursantes]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [busqueda,   setBusqueda]   = useState('')
  const [filtroNivel,setFiltroNivel]= useState('')
  const [modal,      setModal]      = useState(null)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const [pR, eR] = await Promise.all([api.get('/personal/'), api.get('/evaluaciones/')])
        const pers  = Array.isArray(pR.data) ? pR.data : pR.data?.results || []
        const evals = Array.isArray(eR.data) ? eR.data : eR.data?.results || []
        const enr = pers.map(p => {
          const mis = evals.filter(e=>e.personal===p.id).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))
          const prom = mis.length ? Math.round(mis.reduce((s,e)=>s+e.puntaje_total,0)/mis.length*100)/100 : 0
          const diffs = mis.length>=2 ? mis.slice(1).map((e,i)=>e.puntaje_total-mis[i].puntaje_total) : []
          const tv = diffs.length ? diffs.reduce((s,d)=>s+d,0)/diffs.length : 0
          return { ...p, promedio:prom, nivel:clasificarNivel(prom), tendencia: tv>2?'mejorando':tv<-2?'empeorando':'estable', evaluaciones:mis, totalEvals:mis.length }
        }).filter(p=>p.totalEvals>0).sort((a,b)=>b.promedio-a.promedio)
        setCursantes(enr)
      } catch(e){ console.error(e) }
      finally{ setLoading(false) }
    }
    cargar()
  }, [])

  const filtrados = cursantes.filter(c => {
    const mb = !busqueda    || `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
    const mn = !filtroNivel || c.nivel === filtroNivel
    return mb && mn
  })

  const promGeneral = cursantes.length ? Math.round(cursantes.reduce((s,c)=>s+c.promedio,0)/cursantes.length*100)/100 : 0

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ padding:9, borderRadius:10, background:'#cc0000' }}><Users size={22} color="white"/></div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, ...S.textPrimary }}>Gestión de Cursantes</h1>
            <p style={{ fontSize:11, ...S.textMuted }}>Módulo Comandante · Machine Learning · {filtrados.length} cursante(s)</p>
          </div>
        </div>
        <div style={{ padding:'6px 14px', borderRadius:20, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e' }}/>
          <span style={{ fontSize:11, color:'#22c55e', fontWeight:600 }}>Motor ML Activo</span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Total Cursantes',  value:cursantes.length,                                  color:'#cc0000', icon:Users         },
          { label:'Promedio General', value:promGeneral,                                        color:'#22c55e', icon:TrendingUp    },
          { label:'Excelentes (≥90)', value:cursantes.filter(c=>c.promedio>=90).length,         color:'#c9a227', icon:Trophy        },
          { label:'En Riesgo (<60)',  value:cursantes.filter(c=>c.promedio<60).length,          color:'#ef4444', icon:AlertTriangle },
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

      {/* Filtros */}
      <div style={{ display:'flex', gap:12, marginBottom:18 }}>
        <div style={{ position:'relative', flex:1 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:S.isDark?'#4b5563':'#94a3b8' }}/>
          <input type="text" placeholder="Buscar cursante..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}
            style={{ ...S.inputPl(36), width:'100%' }}/>
        </div>
        <select value={filtroNivel} onChange={e=>setFiltroNivel(e.target.value)} style={S.select}>
          <option value="">Todos los niveles</option>
          {['Excelente','Muy Bueno','Bueno','Regular','Bajo','Crítico'].map(n=><option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Grid tarjetas */}
      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ width:36, height:36, border:'4px solid #cc0000', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
          <p style={{ ...S.textMuted, fontSize:12 }}>Cargando cursantes...</p>
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtrados.length === 0 ? (
        <p style={{ ...S.textMuted, fontSize:13, textAlign:'center', padding:60 }}>No se encontraron cursantes.</p>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
          {filtrados.map((c,idx) => {
            const ns = NIVEL_STYLE[c.nivel] || NIVEL_STYLE['Regular']
            const TendIcon = c.tendencia==='mejorando' ? TrendingUp : c.tendencia==='empeorando' ? TrendingDown : Minus
            const tendColor = c.tendencia==='mejorando' ? '#22c55e' : c.tendencia==='empeorando' ? '#ef4444' : '#6b7280'
            return (
              <div key={c.id} style={{ ...S.card, padding:18, borderTop:`2px solid ${ns.color}`, transition:'transform 0.2s,box-shadow 0.2s', cursor:'default' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=S.isDark?'0 8px 24px rgba(0,0,0,0.4)':'0 8px 24px rgba(0,0,0,0.12)' }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=S.isDark?'0 1px 4px rgba(0,0,0,0.4)':'0 1px 6px rgba(0,0,0,0.07)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:`${ns.color}22`, border:`2px solid ${ns.color}44`, display:'flex', alignItems:'center', justifyContent:'center', color:ns.color, fontSize:13, fontWeight:700 }}>
                    {idx<3?['🥇','🥈','🥉'][idx]:`#${idx+1}`}
                  </div>
                  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:ns.bg, color:ns.color, border:`1px solid ${ns.border}` }}>{c.nivel}</span>
                </div>
                <p style={{ fontWeight:700, fontSize:14, marginBottom:3, ...S.textPrimary }}>{c.apellido} {c.nombre}</p>
                <p style={{ fontSize:11, marginBottom:14, ...S.textMuted }}>{c.rango?.replace('_',' ')} · {c.especialidad?.replace('_',' ')}</p>
                <div style={{ textAlign:'center', marginBottom:14 }}>
                  <p style={{ fontSize:42, fontWeight:900, color:ns.color, lineHeight:1 }}>{c.promedio}</p>
                  <p style={{ fontSize:10, ...S.textMuted, marginTop:3 }}>PROMEDIO GENERAL</p>
                </div>
                <div style={{ height:6, borderRadius:3, ...S.progressBg, marginBottom:12 }}>
                  <div style={{ height:6, borderRadius:3, width:`${Math.min(c.promedio,100)}%`, background:ns.color, transition:'width 0.8s ease' }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <span style={{ fontSize:11, ...S.textMuted }}><span style={{ ...S.textSecondary, fontWeight:600 }}>{c.totalEvals}</span> evaluaciones</span>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:tendColor }}>
                    <TendIcon size={12}/><span style={{ fontWeight:600 }}>{c.tendencia}</span>
                  </div>
                </div>
                <button onClick={()=>setModal(c)}
                  style={{ ...S.btnGhost, width:'100%', justifyContent:'center', transition:'background 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background=S.isDark?'rgba(204,0,0,0.2)':'rgba(204,0,0,0.12)'}
                  onMouseLeave={e=>e.currentTarget.style.background=S.isDark?'rgba(204,0,0,0.1)':'rgba(204,0,0,0.07)'}>
                  <Eye size={13}/> Ver Detalle
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && <ModalDetalle cursante={modal} onClose={()=>setModal(null)} S={S}/>}
    </div>
  )
}

function ModalDetalle({ cursante, onClose, S }) {
  const ns = NIVEL_STYLE[cursante.nivel] || NIVEL_STYLE['Regular']
  const evs = [...(cursante.evaluaciones||[])].sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))
  const diffs = evs.length>=2 ? evs.slice(1).map((e,i)=>e.puntaje_total-evs[i].puntaje_total) : []
  const avgDiff = diffs.length ? diffs.reduce((s,d)=>s+d,0)/diffs.length : 0
  const prediccion = Math.min(100,Math.max(0,Math.round((cursante.promedio+avgDiff*1.2)*100)/100))

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modal, padding:28, width:'100%', maxWidth:540, margin:'0 16px', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:4, ...S.textPrimary }}>{cursante.apellido} {cursante.nombre}</h2>
            <p style={{ fontSize:12, ...S.textMuted }}>{cursante.rango?.replace('_',' ')} · CI: {cursante.ci}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:24, lineHeight:1, ...S.textMuted }}>×</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
          {[
            { label:'Promedio Real',  value:cursante.promedio, color:ns.color  },
            { label:'Predicción ML',  value:prediccion,        color:'#c9a227' },
            { label:'Evaluaciones',   value:cursante.totalEvals, color:S.isDark?'#9ca3af':'#374151' },
          ].map((s,i)=>(
            <div key={i} style={{ ...S.cardAlt, padding:'14px 10px', textAlign:'center' }}>
              <p style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</p>
              <p style={{ fontSize:10, ...S.textMuted, marginTop:3 }}>{s.label}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize:11, fontWeight:700, color:'#cc0000', letterSpacing:'0.1em', marginBottom:10 }}>HISTORIAL</p>
        {evs.length===0
          ? <p style={{ fontSize:12, ...S.textMuted }}>Sin evaluaciones registradas</p>
          : evs.map((ev,i)=>{
              const c = ev.puntaje_total>=85?'#22c55e':ev.puntaje_total>=70?'#3b82f6':ev.puntaje_total>=60?'#eab308':'#ef4444'
              return (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, marginBottom:6, ...S.cardAlt }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, ...S.textPrimary }}>{ev.periodo||`Eval ${i+1}`}</p>
                    <p style={{ fontSize:10, ...S.textMuted }}>{ev.fecha}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:80, height:5, borderRadius:3, ...S.progressBg }}>
                      <div style={{ height:5, borderRadius:3, width:`${ev.puntaje_total}%`, background:c }}/>
                    </div>
                    <span style={{ fontSize:15, fontWeight:800, color:c, minWidth:38, textAlign:'right' }}>{ev.puntaje_total}</span>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}