import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, X, Save, Pencil, Trash2, Search, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

const TIPOS = ['Arte Marcial', 'Defensa Personal', 'Deporte de Combate']

const DISCIPLINAS_SEED = [
  { id: 1,  nombre: 'Karate',                 codigo: 'KAR-01', tipo: 'Arte Marcial',       teoria_pct: 30, practica_pct: 60, otros_pct: 10, activo: true,  creado_en: '2025-01-14' },
  { id: 2,  nombre: 'Judo',                   codigo: 'JUD-02', tipo: 'Arte Marcial',       teoria_pct: 25, practica_pct: 65, otros_pct: 10, activo: true,  creado_en: '2025-01-14' },
  { id: 3,  nombre: 'Taekwondo',              codigo: 'TAE-03', tipo: 'Arte Marcial',       teoria_pct: 20, practica_pct: 70, otros_pct: 10, activo: true,  creado_en: '2025-01-14' },
  { id: 4,  nombre: 'Defensa Personal',       codigo: 'DEF-04', tipo: 'Defensa Personal',   teoria_pct: 15, practica_pct: 75, otros_pct: 10, activo: true,  creado_en: '2025-09-14' },
  { id: 5,  nombre: 'Boxeo',                  codigo: 'BOX-05', tipo: 'Deporte de Combate', teoria_pct: 20, practica_pct: 70, otros_pct: 10, activo: true,  creado_en: '2025-09-14' },
  { id: 6,  nombre: 'Muay Thai',              codigo: 'MUA-06', tipo: 'Arte Marcial',       teoria_pct: 25, practica_pct: 65, otros_pct: 10, activo: false, creado_en: '2025-10-01' },
  { id: 7,  nombre: 'Lucha Grecorromana',     codigo: 'LUC-07', tipo: 'Deporte de Combate', teoria_pct: 30, practica_pct: 60, otros_pct: 10, activo: true,  creado_en: '2025-10-01' },
  { id: 8,  nombre: 'Aikido',                 codigo: 'AIK-08', tipo: 'Arte Marcial',       teoria_pct: 35, practica_pct: 55, otros_pct: 10, activo: true,  creado_en: '2025-10-15' },
  { id: 9,  nombre: 'Krav Maga',              codigo: 'KRA-09', tipo: 'Defensa Personal',   teoria_pct: 20, practica_pct: 70, otros_pct: 10, activo: true,  creado_en: '2025-11-01' },
  { id: 10, nombre: 'Sambo',                  codigo: 'SAM-10', tipo: 'Arte Marcial',       teoria_pct: 25, practica_pct: 65, otros_pct: 10, activo: true,  creado_en: '2025-11-15' },
  { id: 11, nombre: 'Kick Boxing',            codigo: 'KIC-11', tipo: 'Deporte de Combate', teoria_pct: 20, practica_pct: 70, otros_pct: 10, activo: true,  creado_en: '2025-12-01' },
  { id: 12, nombre: 'Hapkido',                codigo: 'HAP-12', tipo: 'Arte Marcial',       teoria_pct: 30, practica_pct: 60, otros_pct: 10, activo: false, creado_en: '2025-12-10' },
  { id: 13, nombre: 'Wushu',                  codigo: 'WUS-13', tipo: 'Arte Marcial',       teoria_pct: 35, practica_pct: 55, otros_pct: 10, activo: true,  creado_en: '2026-01-05' },
  { id: 14, nombre: 'BJJ',                    codigo: 'BJJ-14', tipo: 'Arte Marcial',       teoria_pct: 20, practica_pct: 70, otros_pct: 10, activo: true,  creado_en: '2026-01-10' },
  { id: 15, nombre: 'Pankration',             codigo: 'PAN-15', tipo: 'Deporte de Combate', teoria_pct: 25, practica_pct: 65, otros_pct: 10, activo: true,  creado_en: '2026-01-15' },
  { id: 16, nombre: 'Capoeira',               codigo: 'CAP-16', tipo: 'Arte Marcial',       teoria_pct: 30, practica_pct: 60, otros_pct: 10, activo: false, creado_en: '2026-02-01' },
  { id: 17, nombre: 'Ninjutsu',               codigo: 'NIN-17', tipo: 'Arte Marcial',       teoria_pct: 40, practica_pct: 50, otros_pct: 10, activo: true,  creado_en: '2026-02-10' },
  { id: 18, nombre: 'Esgrima Militar',        codigo: 'ESG-18', tipo: 'Defensa Personal',   teoria_pct: 35, practica_pct: 55, otros_pct: 10, activo: true,  creado_en: '2026-02-15' },
  { id: 19, nombre: 'Kenpo',                  codigo: 'KEN-19', tipo: 'Arte Marcial',       teoria_pct: 30, practica_pct: 60, otros_pct: 10, activo: true,  creado_en: '2026-03-01' },
  { id: 20, nombre: 'Combate Cuerpo a Cuerpo',codigo: 'CCC-20', tipo: 'Defensa Personal',   teoria_pct: 15, practica_pct: 75, otros_pct: 10, activo: true,  creado_en: '2026-03-10' },
]

const TIPO_COLOR = {
  'Arte Marcial':       { color: '#cc0000',  bg: 'rgba(204,0,0,0.15)',    border: 'rgba(204,0,0,0.3)' },
  'Defensa Personal':   { color: '#9ca3af',  bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' },
  'Deporte de Combate': { color: '#6b7280',  bg: 'rgba(107,114,128,0.15)',border: 'rgba(107,114,128,0.3)' },
}

const EMPTY_FORM = { nombre: '', codigo: '', tipo: 'Arte Marcial', teoria_pct: 30, practica_pct: 60, otros_pct: 10, activo: true }
const POR_PAGINA = 8

const S = { /* inline styles shortcuts */
  input: { width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'white', outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a2a' },
  select: { width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'white', outline: 'none', background: '#1a1a1a', border: '1px solid #2a2a2a' },
  label: { display: 'block', fontSize: 10, fontWeight: 700, color: '#cc0000', marginBottom: 5, letterSpacing: '0.1em' },
}

export default function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState([])
  const [loading, setLoading]         = useState(true)
  const [busqueda, setBusqueda]       = useState('')
  const [filtroTipo, setFiltroTipo]   = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pagina, setPagina]           = useState(1)
  const [modal, setModal]             = useState(null)
  const [seleccionado, setSelec]      = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [guardando, setGuardando]     = useState(false)
  const [error, setError]             = useState('')
  const [nextId, setNextId]           = useState(21)

  useEffect(() => {
    setLoading(true)
    api.get('/disciplinas/')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setDisciplinas(data.length ? data : DISCIPLINAS_SEED)
      })
      .catch(() => setDisciplinas(DISCIPLINAS_SEED))
      .finally(() => setLoading(false))
  }, [])

  const totalPct = f => Number(f.teoria_pct) + Number(f.practica_pct) + Number(f.otros_pct)

  const filtradas = disciplinas.filter(d => {
    const matchB = !busqueda || `${d.nombre} ${d.codigo}`.toLowerCase().includes(busqueda.toLowerCase())
    const matchT = !filtroTipo || d.tipo === filtroTipo
    const matchE = !filtroEstado || (filtroEstado === 'activo' ? d.activo : !d.activo)
    return matchB && matchT && matchE
  })

  const totalPags = Math.ceil(filtradas.length / POR_PAGINA)
  const pagActual = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const abrirCrear   = () => { setForm(EMPTY_FORM); setError(''); setModal('crear') }
  const abrirEditar  = d => { setSelec(d); setForm({ ...d }); setError(''); setModal('editar') }
  const abrirEliminar = d => { setSelec(d); setModal('eliminar') }
  const cerrar = () => { setModal(null); setSelec(null); setError('') }
  const handleInput = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const guardar = async () => {
    if (!form.nombre || !form.codigo) { setError('Nombre y código son obligatorios'); return }
    const t = totalPct(form)
    if (Math.abs(t - 100) > 0.01) { setError(`Los porcentajes deben sumar 100%. Suma actual: ${t}%`); return }
    setGuardando(true); setError('')
    try {
      if (modal === 'crear') {
        const nueva = { ...form, id: nextId, creado_en: new Date().toISOString().slice(0, 10) }
        setDisciplinas(prev => [nueva, ...prev])
        setNextId(n => n + 1)
        try { await api.post('/disciplinas/', form) } catch {}
      } else {
        setDisciplinas(prev => prev.map(d => d.id === seleccionado.id ? { ...d, ...form } : d))
        try { await api.put(`/disciplinas/${seleccionado.id}/`, form) } catch {}
      }
      cerrar()
    } finally { setGuardando(false) }
  }

  const eliminar = async () => {
    setGuardando(true)
    setDisciplinas(prev => prev.filter(d => d.id !== seleccionado.id))
    try { await api.delete(`/disciplinas/${seleccionado.id}/`) } catch {}
    cerrar(); setGuardando(false)
  }

  const cardStyle = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 10, background: '#cc0000' }}>
            <BookOpen size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Gestión de Disciplinas</h1>
            <p style={{ fontSize: 11, color: '#6b7280' }}>EAME · Bolivia — {filtradas.length} disciplina(s)</p>
          </div>
        </div>
        <button onClick={abrirCrear} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', background: '#cc0000', border: 'none', boxShadow: '0 4px 14px rgba(204,0,0,0.4)' }}>
          <Plus size={15} /> Nueva Disciplina
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
          <input
            type="text" placeholder="Buscar disciplinas..." value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
            style={{ ...S.input, paddingLeft: 34, background: '#1a1a1a', border: '1px solid #2a2a2a' }}
          />
        </div>
        <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPagina(1) }} style={{ ...S.select, minWidth: 160 }}>
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1) }} style={{ ...S.select, minWidth: 140 }}>
          <option value="">Todos los estados</option>
          <option value="activo">Activa</option>
          <option value="inactivo">Inactiva</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a0000' }}>
              {['#', 'Disciplina', 'Tipo', 'Teoría', 'Práctica', 'Otros', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>Cargando...</td></tr>
            ) : pagActual.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>No se encontraron disciplinas</td></tr>
            ) : pagActual.map((d, i) => {
              const tc = TIPO_COLOR[d.tipo] || TIPO_COLOR['Arte Marcial']
              return (
                <tr key={d.id} style={{ background: i % 2 === 0 ? '#111' : '#141414', borderBottom: '1px solid #1f1f1f' }}>
                  <td style={{ padding: '10px 16px', color: '#4b5563', fontSize: 12 }}>{d.id}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(204,0,0,0.2)', border: '1px solid rgba(204,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cc0000', fontSize: 11, fontWeight: 700 }}>
                        {d.nombre.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{d.nombre}</p>
                        <p style={{ color: '#4b5563', fontSize: 10 }}>{d.codigo} · {d.creado_en}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                      {d.tipo}
                    </span>
                  </td>
                  {/* Barras de porcentaje */}
                  {[['teoria_pct','#cc0000'], ['practica_pct','#9ca3af'], ['otros_pct','#4b5563']].map(([k, clr]) => (
                    <td key={k} style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 52, height: 4, borderRadius: 2, background: '#1f1f1f' }}>
                          <div style={{ width: `${d[k]}%`, height: 4, borderRadius: 2, background: clr }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: clr }}>{d[k]}%</span>
                      </div>
                    </td>
                  ))}
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: d.activo ? 'rgba(204,0,0,0.15)' : '#1f1f1f', color: d.activo ? '#ff4444' : '#6b7280', border: `1px solid ${d.activo ? '#cc000033' : '#2a2a2a'}` }}>
                      {d.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => abrirEditar(d)} style={{ padding: 6, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: 'pointer' }} title="Editar">
                        <Pencil size={13} color="#9ca3af" />
                      </button>
                      <button onClick={() => abrirEliminar(d)} style={{ padding: 6, borderRadius: 8, background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.2)', cursor: 'pointer' }} title="Eliminar">
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

      {/* Paginación */}
      {totalPags > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <p style={{ fontSize: 12, color: '#4b5563' }}>Página {pagina} de {totalPags}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['‹', () => setPagina(p => Math.max(1, p-1)), pagina===1], ['›', () => setPagina(p => Math.min(totalPags, p+1)), pagina===totalPags]].map(([lbl, fn, dis], idx) => (
              <button key={idx} onClick={fn} disabled={dis} style={{ padding: '6px 12px', borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: 'pointer', color: 'white', opacity: dis ? 0.4 : 1 }}>{lbl}</button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {(modal === 'crear' || modal === 'editar') && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#111', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 520, margin: '0 16px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 60px rgba(204,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color="#cc0000" />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{modal === 'crear' ? 'Nueva Disciplina' : 'Editar Disciplina'}</h2>
              </div>
              <button onClick={cerrar} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#4b5563" /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={S.label}>NOMBRE *</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleInput} placeholder="Ej: Karate" style={S.input} />
              </div>
              <div>
                <label style={S.label}>CÓDIGO *</label>
                <input type="text" name="codigo" value={form.codigo} onChange={handleInput} placeholder="Ej: KAR-01" style={S.input} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={S.label}>TIPO DE DISCIPLINA</label>
                <select name="tipo" value={form.tipo} onChange={handleInput} style={S.select}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Distribución */}
            <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a2a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Distribución de Evaluación</p>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: Math.abs(totalPct(form)-100)<0.01 ? 'rgba(204,0,0,0.15)' : 'rgba(136,0,0,0.3)', color: Math.abs(totalPct(form)-100)<0.01 ? '#ff4444' : '#cc0000' }}>
                  Total: {totalPct(form)}%
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { name: 'teoria_pct',   label: 'TEORÍA (%)',   color: '#cc0000' },
                  { name: 'practica_pct', label: 'PRÁCTICA (%)', color: '#9ca3af' },
                  { name: 'otros_pct',    label: 'OTROS (%)',    color: '#4b5563' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ ...S.label, color: f.color }}>{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name]} onChange={handleInput} min={0} max={100} style={{ ...S.input, borderColor: `${f.color}44` }} />
                    <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: '#1f1f1f' }}>
                      <div style={{ width: `${Math.min(form[f.name],100)}%`, height: 3, borderRadius: 2, background: f.color, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" name="activo" id="activo_chk" checked={form.activo} onChange={handleInput} style={{ accentColor: '#cc0000' }} />
              <label htmlFor="activo_chk" style={{ fontSize: 13, color: '#9ca3af', cursor: 'pointer' }}>Disciplina activa</label>
            </div>

            {error && <p style={{ marginTop: 12, fontSize: 12, color: '#ff6666', background: 'rgba(204,0,0,0.1)', padding: '8px 12px', borderRadius: 8 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={cerrar} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} disabled={guardando} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', background: '#cc0000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Save size={14} />{guardando ? 'Guardando...' : modal === 'crear' ? 'Guardar' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modal === 'eliminar' && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#111', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, margin: '0 16px', textAlign: 'center', boxShadow: '0 0 60px rgba(204,0,0,0.12)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(204,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={24} color="#cc0000" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>Eliminar Disciplina</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>¿Eliminar <strong style={{ color: 'white' }}>{seleccionado?.nombre}</strong>? Esta acción no se puede deshacer.</p>
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