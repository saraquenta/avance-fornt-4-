import { useEffect, useState } from 'react'
import api from '../services/api'
import {
  ClipboardList, Plus, X, Save, ChevronDown,
  ChevronUp, Star, Trash2, Eye
} from 'lucide-react'

const NIVEL_COLOR = {
  EXCELENTE: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  BUENO:     { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  REGULAR:   { bg: '#fef9c3', color: '#a16207', border: '#fde047' },
  CRITICO:   { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
}

function getNivel(p) {
  if (p >= 85) return 'EXCELENTE'
  if (p >= 70) return 'BUENO'
  if (p >= 50) return 'REGULAR'
  return 'CRITICO'
}

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

  const [form, setForm] = useState({
    personal_id: '',
    periodo: '',
    observaciones: '',
    puntajes: {}
  })

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
      catRes.data.forEach(cat => {
        cat.criterios.forEach(cr => { puntajesIniciales[cr.id] = 70 })
      })
      setForm(f => ({ ...f, puntajes: puntajesIniciales }))
    }).catch(err => console.error("Error cargando datos:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const puntajeTotal = () => {
    if (!categorias.length) return 0
    let total = 0
    categorias.forEach(cat => {
      const pesoCriterio = cat.peso / cat.criterios.length
      cat.criterios.forEach(cr => {
        const p = form.puntajes[cr.id] || 0
        total += p * (pesoCriterio / 100)
      })
    })
    return Math.round(total * 10) / 10
  }

  const guardar = async () => {
    if (!form.personal_id || !form.periodo) {
      setError('Selecciona el personal y el periodo'); return
    }
    setGuardando(true); setError('')
    try {
      await api.post('/evaluaciones/crear/', form)
      cargar(); setModal(false)
      setForm(f => ({ ...f, personal_id: '', periodo: '', observaciones: '' }))
    } catch {
      // Se eliminó la (e) que no se usaba para evitar el error visual
      setError('Error al guardar la evaluación')
    } finally { setGuardando(false) }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta evaluación?')) return
    try {
      await api.delete(`/evaluaciones/${id}/`)
      cargar()
    } catch {
      alert('No se pudo eliminar la evaluación')
    }
  }

  const filtradas = evaluaciones.filter(ev =>
    !filtroPersonal || ev.personal_nombre?.toLowerCase().includes(filtroPersonal.toLowerCase())
  )

  return (
    <div className="p-8 min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: '#2563eb' }}>
            <ClipboardList size={24} color="white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Evaluaciones</h1>
            <p className="text-xs" style={{ color: '#64748b' }}>{filtradas.length} evaluación(es) registrada(s)</p>
          </div>
        </div>
        <button
          onClick={() => { setError(''); setModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
          style={{ background: '#2563eb', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
        >
          <Plus size={16} /> Nueva Evaluación
        </button>
      </div>

      {/* Filtro */}
      <input
        type="text"
        placeholder="Filtrar por nombre del personal..."
        value={filtroPersonal}
        onChange={e => setFiltro(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-5"
        style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a' }}
      />

      {/* Tabla */}
      {loading ? (
        <p className="text-center text-gray-400 py-16">Cargando evaluaciones...</p>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#1e3a5f' }}>
                {['#', 'Personal', 'Periodo', 'Fecha', 'Puntaje', 'Nivel', 'Evaluador', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    No hay evaluaciones registradas. Crea la primera.
                  </td>
                </tr>
              ) : filtradas.map((ev, i) => {
                const nivel = getNivel(ev.puntaje_total)
                const nc    = NIVEL_COLOR[nivel]
                return (
                  <tr
                    key={ev.id}
                    style={{ background: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#0f172a' }}>{ev.personal_nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{ev.periodo}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{ev.fecha}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={13} color="#d97706" fill="#d97706" />
                        <span className="font-bold" style={{ color: '#0f172a' }}>{ev.puntaje_total}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: nc.bg, color: nc.color, border: `1px solid ${nc.border}` }}>
                        {nivel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{ev.evaluador_nombre}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDetalle(ev)}
                          className="p-1.5 rounded-lg"
                          style={{ background: '#eff6ff', color: '#2563eb' }}
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => eliminar(ev.id)}
                          className="p-1.5 rounded-lg"
                          style={{ background: '#fef2f2', color: '#dc2626' }}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
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
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'white', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#e2e8f0' }}>
              <div className="flex items-center gap-2">
                <ClipboardList size={20} color="#2563eb" />
                <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>Nueva Evaluación</h2>
              </div>
              <button onClick={() => setModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Personal *</label>
                  <select
                    value={form.personal_id}
                    onChange={e => setForm(f => ({ ...f, personal_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #e2e8f0', color: '#0f172a' }}
                  >
                    <option value="">Seleccionar...</option>
                    {personal.map(p => (
                      <option key={p.id} value={p.id}>{p.apellido} {p.nombre} - {p.rango}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Periodo *</label>
                  <input
                    type="text"
                    placeholder="Ej: Trimestre I - 2026"
                    value={form.periodo}
                    onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #e2e8f0', color: '#0f172a' }}
                  />
                </div>
              </div>

              <div className="rounded-xl p-4 text-center" style={{ background: NIVEL_COLOR[getNivel(puntajeTotal())].bg, border: `1px solid ${NIVEL_COLOR[getNivel(puntajeTotal())].border}` }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#64748b' }}>PUNTAJE PONDERADO EN TIEMPO REAL</p>
                <p className="text-4xl font-bold" style={{ color: NIVEL_COLOR[getNivel(puntajeTotal())].color }}>
                  {puntajeTotal()}
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: NIVEL_COLOR[getNivel(puntajeTotal())].color }}>
                  {getNivel(puntajeTotal())}
                </p>
              </div>

              {categorias.map(cat => (
                <CategoriaSliders
                  key={cat.id}
                  categoria={cat}
                  puntajes={form.puntajes}
                  onChange={(criterioId, val) => setForm(f => ({
                    ...f,
                    puntajes: { ...f.puntajes, [criterioId]: val }
                  }))}
                />
              ))}

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Observaciones</label>
                <textarea
                  rows={2}
                  value={form.observaciones}
                  onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  placeholder="Observaciones generales de la evaluación..."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ border: '1px solid #e2e8f0', color: '#0f172a' }}
                />
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#f1f5f9', color: '#475569' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={guardar}
                  disabled={guardando}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: '#2563eb' }}
                >
                  <Save size={15} />
                  {guardando ? 'Guardando...' : 'Guardar Evaluación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE (Simplificado para el ejemplo) */}
      {detalle && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl w-full max-w-lg mx-4 p-6" style={{ background: 'white' }}>
             <div className="flex justify-between mb-4">
                <h2 className="font-bold">Detalles de {detalle.personal_nombre}</h2>
                <X className="cursor-pointer" onClick={() => setDetalle(null)} />
             </div>
             <p className="text-sm">Puntaje Total: <strong>{detalle.puntaje_total}</strong></p>
             <p className="text-sm">Periodo: {detalle.periodo}</p>
             <div className="mt-4 p-3 bg-gray-50 rounded italic text-sm">
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
    <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #e2e8f0' }}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: '#1e3a5f' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-semibold">{categoria.nombre}</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            Peso: {categoria.peso}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-bold">{promCat}/100</span>
          {abierto ? <ChevronUp size={16} color="white" /> : <ChevronDown size={16} color="white" />}
        </div>
      </button>

      {abierto && (
        <div className="p-4 space-y-4 bg-white">
          {categoria.criterios.map(cr => {
            const val = puntajes[cr.id] || 0
            const color = val >= 85 ? '#16a34a' : val >= 70 ? '#2563eb' : val >= 50 ? '#d97706' : '#dc2626'
            return (
              <div key={cr.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium" style={{ color: '#374151' }}>{cr.nombre}</span>
                  <span className="text-sm font-bold px-2 py-0.5 rounded-full text-white" style={{ background: color, minWidth: 36, textAlign: 'center' }}>
                    {val}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  onChange={e => onChange(cr.id, parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: color, background: '#e2e8f0' }}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}