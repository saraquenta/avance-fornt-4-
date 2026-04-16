import { useEffect, useState } from 'react'
import api from '../services/api'
import { ClipboardList, Plus, X, Save, ChevronDown, ChevronUp, Star, Trash2, Eye } from 'lucide-react'

const NIVEL_COLOR = {
  EXCELENTE: { bg: 'rgba(204,0,0,0.18)', color: '#ff4444',  border: 'rgba(204,0,0,0.4)' },
  BUENO:     { bg: 'rgba(107,114,128,0.2)', color: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
  REGULAR:   { bg: 'rgba(75,85,99,0.2)',    color: '#6b7280',  border: 'rgba(75,85,99,0.3)' },
  CRITICO:   { bg: 'rgba(136,0,0,0.3)',     color: '#cc0000',  border: 'rgba(136,0,0,0.5)' },
}

function getNivel(p) {
  if (p >= 85) return 'EXCELENTE'
  if (p >= 70) return 'BUENO'
  if (p >= 50) return 'REGULAR'
  return 'CRITICO'
}

const cardStyle = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'white', outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a2a' }
const selectStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'white', outline: 'none', background: '#1a1a1a', border: '1px solid #2a2a2a' }
const labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: '#cc0000', marginBottom: 5, letterSpacing: '0.1em' }

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState([])
  const [personal, setPersonal]         = useState([])
  const [categorias, setCategorias]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [modal, setModal]               = useState(false)
  const [detalle, setDetalle]           = useState(null)
  const [guardando, setGuardando]       = useState(false)
  const [error, setError]               = useState('')
  const [filtroPersonal, setFiltro]     = useState('')

  const [form, setForm] = useState({ personal_id: '', periodo: '', observaciones: '', puntajes: {} })

  const cargar = () => {
    setLoading(true)
    Promise.all([
      api.get('/evaluaciones/'),
      api.get('/personal/'),
      api.get('/evaluaciones/categorias/'),
    ]).then(([evRes, perRes, catRes]) => {
      setEvaluaciones(Array.isArray(evRes.data) ? evRes.data : evRes.data.results || [])
      setPersonal(Array.isArray(perRes.data) ? perRes.data : perRes.data.results || [])
      setCategorias(catRes.data)
      const puntajesIniciales = {}
      catRes.data.forEach(cat => cat.criterios.forEach(cr => { puntajesIniciales[cr.id] = 70 }))
      setForm(f => ({ ...f, puntajes: puntajesIniciales }))
    }).catch(err => console.error('Error:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const puntajeTotal = () => {
    if (!categorias.length) return 0
    let total = 0
    categorias.forEach(cat => {
      const pesoCriterio = cat.peso / cat.criterios.length
      cat.criterios.forEach(cr => { total += (form.puntajes[cr.id] || 0) * (pesoCriterio / 100) })
    })
    return Math.round(total * 10) / 10
  }

  const guardar = async () => {
    if (!form.personal_id || !form.periodo) { setError('Selecciona el personal y el periodo'); return }
    setGuardando(true); setError('')
    try {
      await api.post('/evaluaciones/crear/', form)
      cargar(); setModal(false)
      setForm(f => ({ ...f, personal_id: '', periodo: '', observaciones: '' }))
    } catch { setError('Error al guardar la evaluación') }
    finally { setGuardando(false) }
  }

  const eliminar = async id => {
    if (!window.confirm('¿Eliminar esta evaluación?')) return
    try { await api.delete(`/evaluaciones/${id}/`); cargar() }
    catch { alert('No se pudo eliminar') }
  }

  const filtradas = evaluaciones.filter(ev =>
    !filtroPersonal || ev.personal_nombre?.toLowerCase().includes(filtroPersonal.toLowerCase())
  )

  const pt = puntajeTotal()
  const nivelActual = getNivel(pt)
  const nc = NIVEL_COLOR[nivelActual]

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 10, background: '#2563eb' }}>
            <ClipboardList size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Evaluaciones</h1>
            <p style={{ fontSize: 11, color: '#6b7280' }}>{filtradas.length} evaluación(es) registrada(s)</p>
          </div>
        </div>
        <button onClick={() => { setError(''); setModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', background: '#cc0000', border: 'none', boxShadow: '0 4px 14px rgba(204,0,0,0.4)' }}>
          <Plus size={15} /> Nueva Evaluación
        </button>
      </div>

      {/* Filtro */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <input type="text" placeholder="Filtrar por nombre del personal..." value={filtroPersonal} onChange={e => setFiltro(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 14, background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
      </div>

      {/* Tabla */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#4b5563', padding: 48 }}>Cargando evaluaciones...</p>
      ) : (
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1a0000' }}>
                {['#', 'Personal', 'Periodo', 'Fecha', 'Puntaje', 'Nivel', 'Evaluador', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>No hay evaluaciones registradas. Crea la primera.</td></tr>
              ) : filtradas.map((ev, i) => {
                const nivel = getNivel(ev.puntaje_total)
                const nc = NIVEL_COLOR[nivel]
                return (
                  <tr key={ev.id} style={{ background: i % 2 === 0 ? '#111' : '#141414', borderBottom: '1px solid #1f1f1f' }}>
                    <td style={{ padding: '10px 16px', color: '#4b5563', fontSize: 12 }}>{i + 1}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: 'white', fontSize: 13 }}>{ev.personal_nombre}</td>
                    <td style={{ padding: '10px 16px', color: '#9ca3af', fontSize: 12 }}>{ev.periodo}</td>
                    <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 12 }}>{ev.fecha}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} color="#cc0000" fill="#cc0000" />
                        <span style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{ev.puntaje_total}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: nc.bg, color: nc.color, border: `1px solid ${nc.border}` }}>{nivel}</span>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 12 }}>{ev.evaluador_nombre}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setDetalle(ev)} style={{ padding: 6, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: 'pointer' }} title="Ver detalle">
                          <Eye size={13} color="#9ca3af" />
                        </button>
                        <button onClick={() => eliminar(ev.id)} style={{ padding: 6, borderRadius: 8, background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.2)', cursor: 'pointer' }} title="Eliminar">
                          <Trash2 size={13} color="#cc0000" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL NUEVA EVALUACION */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#111', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 16, width: '100%', maxWidth: 620, margin: '0 16px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 60px rgba(204,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1f1f1f' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={18} color="#cc0000" />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Nueva Evaluación</h2>
              </div>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#4b5563" /></button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>PERSONAL *</label>
                  <select value={form.personal_id} onChange={e => setForm(f => ({ ...f, personal_id: e.target.value }))} style={selectStyle}>
                    <option value="">Seleccionar...</option>
                    {personal.map(p => <option key={p.id} value={p.id}>{p.apellido} {p.nombre} - {p.rango}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>PERIODO *</label>
                  <input type="text" placeholder="Ej: Trimestre I - 2026" value={form.periodo} onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Puntaje en tiempo real */}
              <div style={{ padding: '16px', borderRadius: 10, textAlign: 'center', marginBottom: 16, background: nc.bg, border: `1px solid ${nc.border}` }}>
                <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, letterSpacing: '0.1em' }}>PUNTAJE PONDERADO EN TIEMPO REAL</p>
                <p style={{ fontSize: 40, fontWeight: 700, color: nc.color }}>{pt}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: nc.color }}>{nivelActual}</span>
              </div>

              {categorias.map(cat => (
                <CategoriaSliders key={cat.id} categoria={cat} puntajes={form.puntajes}
                  onChange={(criterioId, val) => setForm(f => ({ ...f, puntajes: { ...f.puntajes, [criterioId]: val } }))} />
              ))}

              <div style={{ marginTop: 14 }}>
                <label style={labelStyle}>OBSERVACIONES</label>
                <textarea rows={2} value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  placeholder="Observaciones generales..." style={{ ...inputStyle, resize: 'none' }} />
              </div>

              {error && <p style={{ marginTop: 10, fontSize: 12, color: '#ff6666', background: 'rgba(204,0,0,0.1)', padding: '8px 12px', borderRadius: 8 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setModal(false)} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={guardar} disabled={guardando} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', background: '#cc0000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Save size={14} />{guardando ? 'Guardando...' : 'Guardar Evaluación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {detalle && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#111', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 460, margin: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, color: 'white', fontSize: 16 }}>Detalles — {detalle.personal_nombre}</h2>
              <button onClick={() => setDetalle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#4b5563" /></button>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              <div style={{ flex: 1, padding: 14, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>PUNTAJE TOTAL</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#cc0000' }}>{detalle.puntaje_total}</p>
              </div>
              <div style={{ flex: 1, padding: 14, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>PERIODO</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'white', marginTop: 8 }}>{detalle.periodo}</p>
              </div>
            </div>
            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>
              "{detalle.observaciones || 'Sin observaciones'}"
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoriaSliders({ categoria, puntajes, onChange }) {
  const [abierto, setAbierto] = useState(true)
  const promCat = categoria.criterios.length
    ? Math.round(categoria.criterios.reduce((s, cr) => s + (puntajes[cr.id] || 0), 0) / categoria.criterios.length)
    : 0

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 12, border: '1px solid #2a2a2a' }}>
      <button onClick={() => setAbierto(!abierto)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#1a0000', cursor: 'pointer', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{categoria.nombre}</span>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', color: '#9ca3af' }}>Peso: {categoria.peso}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{promCat}/100</span>
          {abierto ? <ChevronUp size={15} color="#9ca3af" /> : <ChevronDown size={15} color="#9ca3af" />}
        </div>
      </button>
      {abierto && (
        <div style={{ padding: 14, background: '#141414' }}>
          {categoria.criterios.map(cr => {
            const val = puntajes[cr.id] || 0
            const color = val >= 85 ? '#cc0000' : val >= 70 ? '#9ca3af' : val >= 50 ? '#6b7280' : '#881111'
            return (
              <div key={cr.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{cr.nombre}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20, color: 'white', background: color, minWidth: 36, textAlign: 'center' }}>{val}</span>
                </div>
                <input type="range" min={0} max={100} value={val} onChange={e => onChange(cr.id, parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: color, cursor: 'pointer' }} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}