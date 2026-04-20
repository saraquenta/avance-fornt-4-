import { useState, useEffect } from 'react'
import api from '../services/api'
import { useStyles } from '../hooks/useStyles'
import { Stethoscope, Search, AlertTriangle, TrendingUp, ChevronRight, BarChart2 } from 'lucide-react'

const cN = (n) => n>=90?'Excelente':n>=80?'Muy Bueno':n>=70?'Bueno':n>=60?'Regular':n>=50?'Bajo':'Crítico'
const NS = {
  Excelente:   { bg:'rgba(34,197,94,0.15)',  color:'#22c55e', border:'rgba(34,197,94,0.3)'  },
  'Muy Bueno': { bg:'rgba(59,130,246,0.15)', color:'#3b82f6', border:'rgba(59,130,246,0.3)' },
  Bueno:       { bg:'rgba(234,179,8,0.15)',  color:'#eab308', border:'rgba(234,179,8,0.3)'  },
  Regular:     { bg:'rgba(249,115,22,0.15)', color:'#f97316', border:'rgba(249,115,22,0.3)' },
  Bajo:        { bg:'rgba(239,68,68,0.15)',  color:'#ef4444', border:'rgba(239,68,68,0.3)'  },
  Crítico:     { bg:'rgba(204,0,0,0.2)',     color:'#cc0000', border:'rgba(204,0,0,0.4)'    },
}

function generarDiag(cursante, todos) {
  const evs = [...(cursante.evaluaciones||[])].sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))
  const prom = cursante.promedio||0
  const nivel = cN(prom)
  const proGrupo = todos.length ? Math.round(todos.reduce((s,c)=>s+c.promedio,0)/todos.length*100)/100 : 0
  const progreso = evs.length>=2 ? Math.round((evs[evs.length-1].puntaje_total-evs[0].puntaje_total)*100)/100 : 0
  const tendencia = progreso>3?'mejorando':progreso<-3?'empeorando':'estable'
  const posicion = todos.findIndex(c=>c.id===cursante.id)+1
  const percentil = Math.round((1-posicion/todos.length)*100)
  const diffs = evs.length>=2 ? evs.slice(1).map((e,i)=>e.puntaje_total-evs[i].puntaje_total) : []
  const avgD = diffs.length ? diffs.reduce((s,d)=>s+d,0)/diffs.length : 0
  const prediccion = Math.min(100,Math.max(0,Math.round((prom+avgD*1.3)*100)/100))
  const recs = prom>=90 ? ['Excelente desempeño. Candidato ideal para roles de liderazgo avanzado.','Participar en competencias regionales e internacionales.','Ser tutor de cursantes con bajo rendimiento.']
    : prom>=80 ? ['Muy buen rendimiento. Mantener la constancia en el entrenamiento.','Enfocarse en alcanzar la excelencia en las disciplinas con menor puntaje.','Revisar y reforzar técnicas específicas con el instructor.']
    : prom>=70 ? ['Rendimiento satisfactorio con margen de mejora identificado.','Incrementar sesiones de práctica en disciplinas con calificaciones bajas.','Solicitar retroalimentación del instructor para técnicas específicas.']
    : prom>=60 ? ['Rendimiento regular. Se requiere mayor dedicación y enfoque.','Implementar un plan de estudio personalizado con el instructor.','Asistir a sesiones adicionales de refuerzo semanales.','Evaluar factores externos que puedan afectar el rendimiento.']
    : ['Rendimiento bajo. Requiere intervención y atención inmediata.','Plan de reforzamiento individual urgente — prioridad alta.','Evaluación médica y psicológica recomendada.','Sesiones de tutoría diaria obligatoria con seguimiento.','Reporte al mando superior para seguimiento especial.']
  return { nivel, prom, proGrupo, progreso, tendencia, prediccion, posicion, percentil, recs, dif:Math.round((prom-proGrupo)*100)/100,
    alertas: prom<60?[{tipo:'critico',msg:`Rendimiento crítico (${prom}). Requiere intervención urgente.`}]:prom<70?[{tipo:'warning',msg:`Rendimiento en riesgo (${prom}). Monitoreo cercano recomendado.`}]:[],
    evs, fecha: new Date().toLocaleString('es-BO') }
}

export default function ComandanteDiagnosticos() {
  const S = useStyles()
  const [cursantes,  setCursantes]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [busqueda,   setBusqueda]   = useState('')
  const [busqDiag,   setBusqDiag]   = useState('')
  const [modal,      setModal]      = useState(null)

  useEffect(()=>{
    const cargar = async () => {
      setLoading(true)
      try {
        const [pR,eR] = await Promise.all([api.get('/personal/'),api.get('/evaluaciones/')])
        const pers  = Array.isArray(pR.data)?pR.data:pR.data?.results||[]
        const evals = Array.isArray(eR.data)?eR.data:eR.data?.results||[]
        const enr = pers.map(p=>{
          const mis = evals.filter(e=>e.personal===p.id).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))
          const prom = mis.length?Math.round(mis.reduce((s,e)=>s+e.puntaje_total,0)/mis.length*100)/100:0
          return {...p,promedio:prom,nivel:cN(prom),evaluaciones:mis,totalEvals:mis.length}
        }).filter(p=>p.totalEvals>0).sort((a,b)=>b.promedio-a.promedio)
        setCursantes(enr)
      } catch(e){ console.error(e) }
      finally{ setLoading(false) }
    }
    cargar()
  },[])

  const abrirDiag = (c) => setModal({ cursante:c, diag:generarDiag(c,cursantes) })

  const buscarYDiag = () => {
    const f = cursantes.find(c=>c.id===Number(busqDiag)||`${c.apellido} ${c.nombre}`.toLowerCase().includes(busqDiag.toLowerCase()))
    if(f) abrirDiag(f)
  }

  const filtrados = cursantes.filter(c => !busqueda || `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase()))

  if (loading) return (
    <div style={{ ...S.page, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'4px solid #cc0000', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
        <p style={{ ...S.textMuted, fontSize:12 }}>Cargando diagnósticos...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <div style={{ padding:9, borderRadius:10, background:'#cc0000' }}><Stethoscope size={22} color="white"/></div>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, ...S.textPrimary }}>Sistema de Diagnósticos</h1>
          <p style={{ fontSize:11, ...S.textMuted }}>Análisis IA · Fortalezas · Debilidades · Recomendaciones personalizadas</p>
        </div>
      </div>

      {/* Búsqueda directa */}
      <div style={{ ...S.card, padding:20, marginBottom:22 }}>
        <p style={S.sectionLabel}>BUSCAR DIAGNÓSTICO</p>
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ position:'relative', flex:1 }}>
            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:S.isDark?'#4b5563':'#94a3b8' }}/>
            <input type="text" placeholder="ID o nombre del cursante..." value={busqDiag} onChange={e=>setBusqDiag(e.target.value)} onKeyDown={e=>e.key==='Enter'&&buscarYDiag()}
              style={{ ...S.inputPl(36), width:'100%' }}/>
          </div>
          <button onClick={buscarYDiag} style={S.btnRed}><Stethoscope size={14}/> Diagnosticar</button>
        </div>
        <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
          {cursantes.slice(0,6).map(c=>(
            <button key={c.id} onClick={()=>abrirDiag(c)}
              style={{ ...S.cardAlt, padding:'4px 10px', borderRadius:20, fontSize:10, ...S.textMuted, cursor:'pointer', border:`1px solid ${S.isDark?'#2a2a2a':'#e2e8f0'}` }}>
              {c.apellido} ({c.promedio})
            </button>
          ))}
        </div>
      </div>

      {/* Filtro */}
      <div style={{ position:'relative', marginBottom:16 }}>
        <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:S.isDark?'#4b5563':'#94a3b8' }}/>
        <input type="text" placeholder="Filtrar lista..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}
          style={{ ...S.inputPl(36), width:'100%' }}/>
      </div>

      <p style={S.sectionLabel}>LISTA DE DIAGNÓSTICOS ({filtrados.length})</p>

      {/* Grid tarjetas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
        {filtrados.map((c)=>{
          const ns = NS[c.nivel]||NS['Regular']
          const d  = generarDiag(c,cursantes)
          return (
            <div key={c.id} style={{ ...S.card, padding:18, borderLeft:`3px solid ${ns.color}`, position:'relative', transition:'transform 0.2s,box-shadow 0.2s', cursor:'default' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=S.isDark?'0 6px 20px rgba(0,0,0,0.4)':'0 6px 20px rgba(0,0,0,0.1)' }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=S.isDark?'0 1px 4px rgba(0,0,0,0.4)':'0 1px 6px rgba(0,0,0,0.07)' }}>
              {d.alertas.length>0&&(
                <div style={{ position:'absolute', top:10, right:10, width:8, height:8, borderRadius:'50%', background:d.alertas[0].tipo==='critico'?'#ef4444':'#f97316', animation:'pb 1.5s infinite' }}/>
              )}
              <p style={{ fontWeight:700, fontSize:13, marginBottom:3, ...S.textPrimary }}>{c.apellido} {c.nombre}</p>
              <p style={{ fontSize:10, marginBottom:12, ...S.textMuted }}>{c.rango?.replace('_',' ')}</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:28, fontWeight:900, color:ns.color }}>{c.promedio}</span>
                <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:ns.bg, color:ns.color, border:`1px solid ${ns.border}` }}>{c.nivel}</span>
              </div>
              <div style={{ height:5, borderRadius:3, ...S.progressBg, marginBottom:14 }}>
                <div style={{ height:5, borderRadius:3, width:`${Math.min(c.promedio,100)}%`, background:ns.color }}/>
              </div>
              <button onClick={()=>abrirDiag(c)}
                style={{ ...S.btnGhost, width:'100%', justifyContent:'center', transition:'background 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=S.isDark?'rgba(204,0,0,0.2)':'rgba(204,0,0,0.12)'}
                onMouseLeave={e=>e.currentTarget.style.background=S.isDark?'rgba(204,0,0,0.1)':'rgba(204,0,0,0.07)'}>
                <Stethoscope size={13}/> Ver Diagnóstico
              </button>
            </div>
          )
        })}
      </div>

      {modal && <ModalDiag cursante={modal.cursante} diag={modal.diag} onClose={()=>setModal(null)} S={S}/>}
      <style>{`@keyframes pb{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.4)}}`}</style>
    </div>
  )
}

function ModalDiag({ cursante, diag, onClose, S }) {
  const ns = NS[diag.nivel]||NS['Regular']
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modal, padding:28, width:'100%', maxWidth:700, margin:'0 16px', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:800, marginBottom:4, ...S.textPrimary }}>{cursante.apellido} {cursante.nombre}</h2>
            <p style={{ fontSize:12, ...S.textMuted }}>{cursante.rango?.replace('_',' ')} · {cursante.especialidad?.replace('_',' ')}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:26, lineHeight:1, ...S.textMuted }}>×</button>
        </div>

        {/* Resumen header */}
        <div style={{ background:'linear-gradient(135deg,#1a0000,#0f0f0f)', borderRadius:12, padding:'18px 24px', marginBottom:20, border:'1px solid rgba(204,0,0,0.25)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>PROMEDIO GENERAL · ANÁLISIS ML</p>
            <p style={{ fontSize:13, color:'#9ca3af' }}>{cursante.totalEvals} evaluaciones · Posición #{diag.posicion}</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:48, fontWeight:900, color:ns.color, lineHeight:1 }}>{diag.prom}</p>
            <span style={{ padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700, background:ns.bg, color:ns.color, border:`1px solid ${ns.border}` }}>{diag.nivel}</span>
          </div>
        </div>

        {/* Alertas */}
        {diag.alertas.map((a,i)=>(
          <div key={i} style={{ padding:'10px 16px', borderRadius:10, marginBottom:14, display:'flex', alignItems:'center', gap:10, background:a.tipo==='critico'?'rgba(239,68,68,0.1)':'rgba(249,115,22,0.1)', border:`1px solid ${a.tipo==='critico'?'rgba(239,68,68,0.3)':'rgba(249,115,22,0.3)'}` }}>
            <AlertTriangle size={15} color={a.tipo==='critico'?'#ef4444':'#f97316'}/>
            <p style={{ fontSize:13, fontWeight:600, color:a.tipo==='critico'?'#ef4444':'#f97316' }}>{a.msg}</p>
          </div>
        ))}

        {/* 3 columnas */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
          {/* Comparación */}
          <div style={{ ...S.cardAlt, padding:'14px 16px' }}>
            <p style={{ fontSize:10, fontWeight:700, color:'#cc0000', letterSpacing:'0.1em', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}><BarChart2 size={11}/> COMPARACIÓN GRUPO</p>
            {[
              { l:'Promedio cursante', v:diag.prom,      c:ns.color },
              { l:'Promedio grupo',    v:diag.proGrupo,  c:S.isDark?'#9ca3af':'#374151' },
              { l:'Diferencia', v:`${diag.dif>=0?'+':''}${diag.dif}`, c:diag.dif>=0?'#22c55e':'#ef4444' },
              { l:'Posición ranking',  v:`#${diag.posicion}`, c:'#cc0000' },
              { l:'Percentil',         v:`Top ${100-diag.percentil}%`, c:'#3b82f6' },
            ].map((x,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:11, ...S.textMuted }}>{x.l}</span>
                <span style={{ fontSize:11, fontWeight:700, color:x.c }}>{x.v}</span>
              </div>
            ))}
          </div>
          {/* Progreso */}
          <div style={{ ...S.cardAlt, padding:'14px 16px', textAlign:'center' }}>
            <p style={{ fontSize:10, fontWeight:700, color:'#cc0000', letterSpacing:'0.1em', marginBottom:10 }}>PROGRESO REAL</p>
            <p style={{ fontSize:36, fontWeight:900, color:diag.progreso>0?'#22c55e':diag.progreso<0?'#ef4444':S.isDark?'#9ca3af':'#374151' }}>{diag.progreso>0?'+':''}{diag.progreso}</p>
            <p style={{ fontSize:10, ...S.textMuted, marginTop:4 }}>desde primera eval</p>
            <p style={{ fontSize:12, fontWeight:600, marginTop:10, color:diag.tendencia==='mejorando'?'#22c55e':diag.tendencia==='empeorando'?'#ef4444':'#6b7280' }}>
              {diag.tendencia==='mejorando'?'↑ Mejorando':diag.tendencia==='empeorando'?'↓ Decayendo':'→ Estable'}
            </p>
          </div>
          {/* Predicción */}
          <div style={{ ...S.cardAlt, padding:'14px 16px', textAlign:'center' }}>
            <p style={{ fontSize:10, fontWeight:700, color:'#cc0000', letterSpacing:'0.1em', marginBottom:10 }}>PREDICCIÓN ML</p>
            <p style={{ fontSize:36, fontWeight:900, color:'#22c55e' }}>{diag.prediccion}</p>
            <p style={{ fontSize:10, ...S.textMuted, marginTop:4 }}>próxima evaluación</p>
            <div style={{ marginTop:10, padding:'6px 10px', borderRadius:8, background:diag.prediccion>=diag.prom?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${diag.prediccion>=diag.prom?'rgba(34,197,94,0.25)':'rgba(239,68,68,0.25)'}` }}>
              <span style={{ fontSize:11, fontWeight:700, color:diag.prediccion>=diag.prom?'#22c55e':'#ef4444' }}>
                {diag.prediccion>=diag.prom?'+':''}{Math.round((diag.prediccion-diag.prom)*100)/100} esperado
              </span>
            </div>
          </div>
        </div>

        {/* Historial */}
        <p style={S.sectionLabel}>HISTORIAL DE EVALUACIONES</p>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
          {diag.evs.length===0
            ? <p style={{ fontSize:12, ...S.textMuted }}>Sin evaluaciones registradas</p>
            : diag.evs.map((ev,i)=>{
                const c = ev.puntaje_total>=85?'#22c55e':ev.puntaje_total>=70?'#3b82f6':ev.puntaje_total>=60?'#eab308':'#ef4444'
                return (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px', borderRadius:8, ...S.cardAlt }}>
                    <div>
                      <p style={{ fontSize:12, fontWeight:600, ...S.textPrimary }}>{ev.periodo||`Eval ${i+1}`}</p>
                      <p style={{ fontSize:10, ...S.textMuted }}>{ev.fecha}</p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:90, height:5, borderRadius:3, ...S.progressBg }}>
                        <div style={{ height:5, borderRadius:3, width:`${ev.puntaje_total}%`, background:c }}/>
                      </div>
                      <span style={{ fontSize:16, fontWeight:800, color:c, minWidth:40, textAlign:'right' }}>{ev.puntaje_total}</span>
                    </div>
                  </div>
                )
              })}
        </div>

        {/* Recomendaciones */}
        <p style={S.sectionLabel}>💡 RECOMENDACIONES IA PERSONALIZADAS</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {diag.recs.map((r,i)=>(
            <div key={i} style={{ padding:'10px 12px', borderRadius:8, ...S.cardAlt, display:'flex', alignItems:'flex-start', gap:8 }}>
              <ChevronRight size={12} color="#cc0000" style={{ flexShrink:0, marginTop:2 }}/>
              <p style={{ fontSize:11, ...S.textSecondary, lineHeight:1.5 }}>{r}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign:'right', fontSize:10, ...S.textMuted, marginTop:16 }}>Análisis realizado: {diag.fecha}</p>
      </div>
    </div>
  )
}