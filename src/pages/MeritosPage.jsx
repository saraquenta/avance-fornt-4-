import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, X, Save, Pencil, Trash2, Search, Award, ChevronLeft, ChevronRight } from 'lucide-react'

const TIPOS_MERITO = ['Disciplina', 'Mejora Continua', 'Dedicación', 'Excelencia Académica', 'Liderazgo', 'Otro']

const CURSANTES_SEED = [
  { id: 1, nombre: 'Juan Carlos', apellido: 'Pérez López',     rango: 'SOLDADO' },
  { id: 2, nombre: 'María Elena', apellido: 'Quispe Mamani',   rango: 'CABO'    },
  { id: 3, nombre: 'Carlos',      apellido: 'Mamani Condori',  rango: 'SARGENTO'},
  { id: 4, nombre: 'Ana Patricia',apellido: 'Flores Ticona',   rango: 'TENIENTE'},
  { id: 5, nombre: 'Roberto',     apellido: 'Chura Apaza',     rango: 'CAPITAN' },
]

const MERITOS_SEED = [
  { id: 1,  cursante: 1, cursante_nombre: 'Pérez López Juan Carlos – Soldado',   tipo_merito: 'Disciplina',          gestion: 2024, justificacion: 'Demostró excelente desempeño y dedicación en sus actividades marciales.', fecha: '2024-03-14' },
  { id: 2,  cursante: 2, cursante_nombre: 'Quispe Mamani María Elena – Cabo',     tipo_merito: 'Mejora Continua',     gestion: 2024, justificacion: 'Mostró mejora significativa en habilidades técnicas y tácticas.', fecha: '2024-03-15' },
  { id: 3,  cursante: 3, cursante_nombre: 'Mamani Condori Carlos – Sargento',     tipo_merito: 'Excelencia Académica',gestion: 2024, justificacion: 'Obtuvo los mejores resultados académicos en evaluaciones teóricas.', fecha: '2024-04-16' },
  { id: 4,  cursante: 1, cursante_nombre: 'Pérez López Juan Carlos – Soldado',   tipo_merito: 'Liderazgo',           gestion: 2024, justificacion: 'Demostró capacidad de liderazgo excepcional durante ejercicios de grupo.', fecha: '2024-05-20' },
  { id: 5,  cursante: 4, cursante_nombre: 'Flores Ticona Ana Patricia – Teniente',tipo_merito: 'Dedicación',         gestion: 2024, justificacion: 'Cumplió todas las actividades con puntualidad y dedicación ejemplar.', fecha: '2024-06-10' },
  { id: 6,  cursante: 5, cursante_nombre: 'Chura Apaza Roberto – Capitán',       tipo_merito: 'Disciplina',          gestion: 2024, justificacion: 'Mantuvo un comportamiento ejemplar en todas las actividades.', fecha: '2024-07-01' },
  { id: 7,  cursante: 2, cursante_nombre: 'Quispe Mamani María Elena – Cabo',     tipo_merito: 'Excelencia Académica',gestion: 2025, justificacion: 'Logró el puntaje más alto en evaluación de conocimientos marciales.', fecha: '2025-01-15' },
  { id: 8,  cursante: 3, cursante_nombre: 'Mamani Condori Carlos – Sargento',     tipo_merito: 'Mejora Continua',     gestion: 2025, justificacion: 'Evidenció notable progreso en todas las disciplinas evaluadas.', fecha: '2025-02-20' },
  { id: 9,  cursante: 4, cursante_nombre: 'Flores Ticona Ana Patricia – Teniente',tipo_merito: 'Liderazgo',          gestion: 2025, justificacion: 'Lideró eficientemente a su grupo en competencias regionales.', fecha: '2025-03-10' },
  { id: 10, cursante: 5, cursante_nombre: 'Chura Apaza Roberto – Capitán',       tipo_merito: 'Dedicación',          gestion: 2025, justificacion: 'Participó voluntariamente en actividades adicionales de entrenamiento.', fecha: '2025-04-05' },
]

const TIPO_COLOR = {
  'Disciplina':           { color: '#cc0000', bg: 'rgba(204,0,0,0.15)',    border: 'rgba(204,0,0,0.3)' },
  'Mejora Continua':      { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' },
  'Dedicación':           { color: '#d97706', bg: 'rgba(217,119,6,0.15)',  border: 'rgba(217,119,6,0.3)' },
  'Excelencia Académica': { color: '#9ca3af', bg: 'rgba(107,114,128,0.2)', border: 'rgba(107,114,128,0.3)' },
  'Liderazgo':            { color: '#6b7280', bg: 'rgba(75,85,99,0.2)',    border: 'rgba(75,85,99,0.3)' },
  'Otro':                 { color: '#4b5563', bg: 'rgba(55,65,81,0.2)',    border: 'rgba(55,65,81,0.3)' },
}

const EMPTY_FORM = { cursante: '', tipo_merito: 'Disciplina', gestion: new Date().getFullYear(), justificacion: '' }
const POR_PAGINA = 8

const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'white', outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a2a' }
const selectStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'white', outline: 'none', background: '#1a1a1a', border: '1px solid #2a2a2a' }
const labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: '#cc0000', marginBottom: 5, letterSpacing: '0.1em' }
const cardStyle = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }

export default function MeritosPage() {
  const [meritos, setMeritos]       = useState([])
  const [cursantes, setCursantes]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [busqueda, setBusqueda]     = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [pagina, setPagina]         = useState(1)
  const [modal, setModal]           = useState(null)
  const [seleccionado, setSelec]    = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [guardando, setGuardando]   = useState(false)
  const [error, setError]           = useState('')
  const [nextId, setNextId]         = useState(11)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/meritos/').catch(() => ({ data: [] })),
      api.get('/personal/').catch(() => ({ data: [] })),
    ]).then(([mRes, pRes]) => {
      const mData = Array.isArray(mRes.data) ? mRes.data : mRes.data?.results || []
      const pData = Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || []
      setMeritos(mData.length ? mData : MERITOS_SEED)
      setCursantes(pData.length ? pData : CURSANTES_SEED)
    }).finally(() => setLoading(false))
  }, [])

  const filtrados = meritos.filter(m => {
    const matchB = !busqueda || m.cursante_nombre?.toLowerCase().includes(busqueda.toLowerCase())
    const matchT = !filtroTipo || m.tipo_merito === filtroTipo
    return matchB && matchT
  })

  const totalPags = Math.ceil(filtrados.length / POR_PAGINA)
  const pagActual = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const abrirCrear   = () => { setForm(EMPTY_FORM); setError(''); setModal('crear') }
  const abrirEditar  = m => { setSelec(m); setForm({ cursante: m.cursante, tipo_merito: m.tipo_merito, gestion: m.gestion, justificacion: m.justificacion }); setError(''); setModal('editar') }
  const abrirEliminar = m => { setSelec(m); setModal('eliminar') }
  const cerrar = () => { setModal(null); setSelec(null); setError('') }
  const handleInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const getNombreCursante = id => {
    const c = cursantes.find(c => c.id === Number(id))
    return c ? `${c.apellido} ${c.nombre} – ${c.rango?.replace('_', ' ')}` : ''
  }

  const guardar = async () => {
    if (!form.cursante || !form.justificacion) { setError('Selecciona el cursante e ingresa la justificación'); return }
    const year = parseInt(form.gestion)
    if (!year || year < 2000 || year > 2100) { setError('La gestión debe ser un año válido'); return }
    setGuardando(true); setError('')
    try {
      if (modal === 'crear') {
        const nuevo = { ...form, id: nextId, cursante_nombre: getNombreCursante(form.cursante), fecha: new Date().toISOString().slice(0, 10) }
        setMeritos(prev => [nuevo, ...prev])
        setNextId(n => n + 1)
        try { await api.post('/meritos/', form) } catch {}
      } else {
        setMeritos(prev => prev.map(m => m.id === seleccionado.id ? { ...m, ...form, cursante_nombre: getNombreCursante(form.cursante) } : m))
        try { await api.put(`/meritos/${seleccionado.id}/`, form) } catch {}
      }
      cerrar()
    } finally { setGuardando(false) }
  }

  const eliminar = async () => {
    setGuardando(true)
    setMeritos(prev => prev.filter(m => m.id !== seleccionado.id))
    try { await api.delete(`/meritos/${seleccionado.id}/`) } catch {}
    cerrar(); setGuardando(false)
  }

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 10, background: '#cc0000' }}>
            <Award size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Gestión de Méritos</h1>
            <p style={{ fontSize: 11, color: '#6b7280' }}>Reconocimientos y logros — {filtrados.length} mérito(s)</p>
          </div>
        </div>
        <button onClick={abrirCrear} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', background: '#cc0000', border: 'none', boxShadow: '0 4px 14px rgba(204,0,0,0.4)' }}>
          <Plus size={15} /> Nuevo Mérito
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
          <input type="text" placeholder="Buscar méritos..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
            style={{ ...inputStyle, paddingLeft: 34, background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
        </div>
        <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPagina(1) }} style={{ ...selectStyle, minWidth: 180 }}>
          <option value="">Todos los tipos</option>
          {TIPOS_MERITO.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a0000' }}>
              {['#', 'Cursante', 'Tipo de Mérito', 'Gestión', 'Justificación', 'Fecha', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>Cargando...</td></tr>
            ) : pagActual.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>No se encontraron méritos</td></tr>
            ) : pagActual.map((m, i) => {
              const tc = TIPO_COLOR[m.tipo_merito] || TIPO_COLOR['Otro']
              return (
                <tr key={m.id} style={{ background: i % 2 === 0 ? '#111' : '#141414', borderBottom: '1px solid #1f1f1f' }}>
                  <td style={{ padding: '10px 16px', color: '#4b5563', fontSize: 12 }}>{m.id}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(204,0,0,0.2)', border: '1px solid rgba(204,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cc0000', fontSize: 11, fontWeight: 700 }}>
                        {m.cursante_nombre?.charAt(0) || '?'}
                      </div>
                      <span style={{ fontWeight: 600, color: 'white', fontSize: 12 }}>{m.cursante_nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{m.tipo_merito}</span>
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: 'white', fontSize: 14 }}>{m.gestion}</td>
                  <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 12, maxWidth: 200 }}>
                    <span title={m.justificacion}>{m.justificacion?.length > 55 ? m.justificacion.substring(0, 52) + '...' : m.justificacion}</span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#4b5563', fontSize: 12 }}>{m.fecha}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => abrirEditar(m)} style={{ padding: 6, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: 'pointer' }}><Pencil size={13} color="#9ca3af" /></button>
                      <button onClick={() => abrirEliminar(m)} style={{ padding: 6, borderRadius: 8, background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.2)', cursor: 'pointer' }}><Trash2 size={13} color="#cc0000" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPags > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <p style={{ fontSize: 12, color: '#4b5563' }}>Página {pagina} de {totalPags}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['‹', () => setPagina(p=>Math.max(1,p-1)), pagina===1], ['›', () => setPagina(p=>Math.min(totalPags,p+1)), pagina===totalPags]].map(([lbl,fn,dis],i) => (
              <button key={i} onClick={fn} disabled={dis} style={{ padding: '6px 12px', borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: 'pointer', color: 'white', opacity: dis ? 0.4 : 1 }}>{lbl}</button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {(modal === 'crear' || modal === 'editar') && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#111', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 500, margin: '0 16px', boxShadow: '0 0 60px rgba(204,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="#cc0000" />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{modal === 'crear' ? 'Nuevo Mérito' : 'Editar Mérito'}</h2>
              </div>
              <button onClick={cerrar} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#4b5563" /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>CURSANTE *</label>
                <select name="cursante" value={form.cursante} onChange={handleInput} style={selectStyle}>
                  <option value="">Seleccionar...</option>
                  {cursantes.map(c => <option key={c.id} value={c.id}>{c.apellido} {c.nombre} – {c.rango?.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>TIPO DE MÉRITO *</label>
                <select name="tipo_merito" value={form.tipo_merito} onChange={handleInput} style={selectStyle}>
                  {TIPOS_MERITO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>GESTIÓN (AÑO) *</label>
                <input type="number" name="gestion" value={form.gestion} onChange={handleInput} placeholder="2024" min={2000} max={2100} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>JUSTIFICACIÓN *</label>
                <textarea name="justificacion" value={form.justificacion} onChange={handleInput} rows={4} placeholder="Descripción detallada del mérito otorgado..." style={{ ...inputStyle, resize: 'none' }} />
              </div>
            </div>
            {error && <p style={{ marginTop: 10, fontSize: 12, color: '#ff6666', background: 'rgba(204,0,0,0.1)', padding: '8px 12px', borderRadius: 8 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={cerrar} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} disabled={guardando} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', background: '#cc0000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Save size={14} />{guardando ? 'Guardando...' : modal === 'crear' ? 'Guardar Mérito' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modal === 'eliminar' && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#111', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, margin: '0 16px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(204,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={24} color="#cc0000" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>Eliminar Mérito</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              ¿Eliminar el mérito <strong style={{ color: 'white' }}>{seleccionado?.tipo_merito}</strong> de <strong style={{ color: 'white' }}>{seleccionado?.cursante_nombre?.split('–')[0]}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={cerrar} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={eliminar} disabled={guardando} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', background: '#cc0000', border: 'none', cursor: 'pointer' }}>
                {guardando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}