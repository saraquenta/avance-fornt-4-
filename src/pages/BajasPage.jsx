import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, X, Save, Pencil, Trash2, Search, UserMinus, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

const MOTIVOS = ['Bajo Rendimiento','Médico','Disciplinario','Voluntario','Problemas Disciplinarios','Problemas de Salud','Otros']
const ESTADOS = ['Pendiente','Confirmada','Rechazada']

const CURSANTES_SEED = [
  { id: 1, nombre: 'Juan Carlos', apellido: 'Pérez López',   rango: 'SOLDADO',  ci: '12345678' },
  { id: 2, nombre: 'María Elena', apellido: 'Quispe Mamani', rango: 'CABO',     ci: '87654321' },
  { id: 3, nombre: 'Carlos',      apellido: 'Mamani Condori',rango: 'SARGENTO', ci: '11223344' },
  { id: 4, nombre: 'Ana Patricia',apellido: 'Flores Ticona', rango: 'TENIENTE', ci: '10000004' },
  { id: 5, nombre: 'Roberto',     apellido: 'Chura Apaza',   rango: 'CAPITAN',  ci: '10000005' },
]

const BAJAS_SEED = [
  { id: 1, cursante: 1, cursante_nombre: 'Pérez López Juan Carlos – Soldado – CI: 12345678',   motivo: 'Bajo Rendimiento',       fecha_baja: '2024-07-15', observaciones: 'No alcanzó los mínimos requeridos en evaluaciones de desempeño.', estado: 'Rechazada', aprobado_por_nombre: 'Comandante Ruiz' },
  { id: 2, cursante: 2, cursante_nombre: 'Quispe Mamani María Elena – Cabo – CI: 87654321',    motivo: 'Médico',                 fecha_baja: '2024-08-20', observaciones: 'Incapacidad médica permanente certificada por el departamento de salud.', estado: 'Confirmada', aprobado_por_nombre: 'Comandante Ruiz' },
  { id: 3, cursante: 3, cursante_nombre: 'Mamani Condori Carlos – Sargento – CI: 11223344',    motivo: 'Voluntario',             fecha_baja: '2024-09-05', observaciones: 'Solicitud voluntaria de retiro por motivos personales.', estado: 'Pendiente', aprobado_por_nombre: null },
  { id: 4, cursante: 4, cursante_nombre: 'Flores Ticona Ana Patricia – Teniente – CI: 10000004',motivo: 'Disciplinario',        fecha_baja: '2024-10-12', observaciones: 'Falta grave contra el reglamento de la institución militar.', estado: 'Pendiente', aprobado_por_nombre: null },
  { id: 5, cursante: 5, cursante_nombre: 'Chura Apaza Roberto – Capitán – CI: 10000005',      motivo: 'Médico',                 fecha_baja: '2024-11-18', observaciones: 'Evaluación médica determinó incapacidad para continuar actividades.', estado: 'Rechazada', aprobado_por_nombre: 'Comandante Ruiz' },
  { id: 6, cursante: 1, cursante_nombre: 'Pérez López Juan Carlos – Soldado – CI: 12345678',   motivo: 'Problemas Disciplinarios',fecha_baja: '2025-03-20', observaciones: 'Reincidencia en falta al reglamento interno.', estado: 'Pendiente', aprobado_por_nombre: null },
  { id: 7, cursante: 2, cursante_nombre: 'Quispe Mamani María Elena – Cabo – CI: 87654321',    motivo: 'Otros',                  fecha_baja: '2025-04-05', observaciones: 'Traslado a otra unidad del ejército por disposición superior.', estado: 'Confirmada', aprobado_por_nombre: 'Comandante Ruiz' },
  { id: 8, cursante: 3, cursante_nombre: 'Mamani Condori Carlos – Sargento – CI: 11223344',    motivo: 'Problemas de Salud',     fecha_baja: '2025-06-22', observaciones: 'Cuadro de salud que requiere reposo prolongado.', estado: 'Pendiente', aprobado_por_nombre: null },
]

const ESTADO_COLOR = {
  'Pendiente':  { bg: 'rgba(217,119,6,0.15)',  color: '#d97706', border: 'rgba(217,119,6,0.3)' },
  'Confirmada': { bg: 'rgba(204,0,0,0.15)',    color: '#ff4444', border: 'rgba(204,0,0,0.3)' },
  'Rechazada':  { bg: 'rgba(75,85,99,0.2)',    color: '#9ca3af', border: 'rgba(75,85,99,0.3)' },
}

const MOTIVO_COLOR = {
  'Bajo Rendimiento':       { bg: 'rgba(204,0,0,0.12)',    color: '#cc0000' },
  'Médico':                 { bg: 'rgba(75,85,99,0.2)',    color: '#9ca3af' },
  'Disciplinario':          { bg: 'rgba(217,119,6,0.12)',  color: '#d97706' },
  'Voluntario':             { bg: 'rgba(55,65,81,0.2)',    color: '#6b7280' },
  'Problemas Disciplinarios':{ bg: 'rgba(136,0,0,0.2)',   color: '#cc0000' },
  'Problemas de Salud':     { bg: 'rgba(75,85,99,0.15)',   color: '#9ca3af' },
  'Otros':                  { bg: 'rgba(55,65,81,0.15)',   color: '#6b7280' },
}

const EMPTY_FORM = { cursante: '', motivo: 'Problemas Disciplinarios', fecha_baja: '', observaciones: '' }
const POR_PAGINA = 8

const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'white', outline: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid #2a2a2a' }
const selectStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'white', outline: 'none', background: '#1a1a1a', border: '1px solid #2a2a2a' }
const labelStyle = { display: 'block', fontSize: 10, fontWeight: 700, color: '#cc0000', marginBottom: 5, letterSpacing: '0.1em' }
const cardStyle = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }

export default function BajasPage() {
  const [bajas, setBajas]         = useState([])
  const [cursantes, setCursantes] = useState([])
  const [loading, setLoading]     = useState(true)
  const [busqueda, setBusqueda]   = useState('')
  const [filtroMotivo, setFiltroMotivo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pagina, setPagina]       = useState(1)
  const [modal, setModal]         = useState(null)
  const [seleccionado, setSelec]  = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState('')
  const [nextId, setNextId]       = useState(9)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/bajas/').catch(() => ({ data: [] })),
      api.get('/personal/').catch(() => ({ data: [] })),
    ]).then(([bRes, pRes]) => {
      const bData = Array.isArray(bRes.data) ? bRes.data : bRes.data?.results || []
      const pData = Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || []
      setBajas(bData.length ? bData : BAJAS_SEED)
      setCursantes(pData.length ? pData : CURSANTES_SEED)
    }).finally(() => setLoading(false))
  }, [])

  const filtradas = bajas.filter(b => {
    const matchB = !busqueda || b.cursante_nombre?.toLowerCase().includes(busqueda.toLowerCase())
    const matchM = !filtroMotivo || b.motivo === filtroMotivo
    const matchE = !filtroEstado || b.estado === filtroEstado
    return matchB && matchM && matchE
  })

  const totalPags = Math.ceil(filtradas.length / POR_PAGINA)
  const pagActual = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  const pendientes = bajas.filter(b => b.estado === 'Pendiente').length

  const abrirCrear   = () => { setForm(EMPTY_FORM); setError(''); setModal('crear') }
  const abrirEditar  = b => { setSelec(b); setForm({ cursante: b.cursante, motivo: b.motivo, fecha_baja: b.fecha_baja, observaciones: b.observaciones }); setError(''); setModal('editar') }
  const abrirEliminar = b => { setSelec(b); setModal('eliminar') }
  const abrirConfirmar = b => { setSelec(b); setModal('confirmar') }
  const cerrar = () => { setModal(null); setSelec(null); setError('') }
  const handleInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const getNombreCursante = id => {
    const c = cursantes.find(c => c.id === Number(id))
    return c ? `${c.apellido} ${c.nombre} – ${c.rango?.replace('_',' ')} – CI: ${c.ci}` : ''
  }

  const guardar = async () => {
    if (!form.cursante || !form.motivo || !form.fecha_baja || !form.observaciones) { setError('Completa todos los campos obligatorios'); return }
    setGuardando(true); setError('')
    try {
      if (modal === 'crear') {
        const nueva = { ...form, id: nextId, cursante_nombre: getNombreCursante(form.cursante), estado: 'Pendiente', aprobado_por_nombre: null }
        setBajas(prev => [nueva, ...prev])
        setNextId(n => n + 1)
        try { await api.post('/bajas/', form) } catch {}
      } else {
        setBajas(prev => prev.map(b => b.id === seleccionado.id ? { ...b, ...form, cursante_nombre: getNombreCursante(form.cursante) } : b))
        try { await api.put(`/bajas/${seleccionado.id}/`, form) } catch {}
      }
      cerrar()
    } finally { setGuardando(false) }
  }

  const eliminar = async () => {
    setGuardando(true)
    setBajas(prev => prev.filter(b => b.id !== seleccionado.id))
    try { await api.delete(`/bajas/${seleccionado.id}/`) } catch {}
    cerrar(); setGuardando(false)
  }

  const confirmarBaja = async () => {
    setGuardando(true)
    setBajas(prev => prev.map(b => b.id === seleccionado.id ? { ...b, estado: 'Confirmada', aprobado_por_nombre: 'Comandante' } : b))
    try { await api.post(`/bajas/${seleccionado.id}/confirmar/`) } catch {}
    cerrar(); setGuardando(false)
  }

  return (
    <div style={{ padding: 32, minHeight: '100vh', background: '#0f0f0f' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 10, background: '#cc0000' }}>
            <UserMinus size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Gestión de Bajas</h1>
            <p style={{ fontSize: 11, color: '#6b7280' }}>
              Registro de bajas — {filtradas.length} registro(s)
              {pendientes > 0 && <span style={{ marginLeft: 8, padding: '1px 8px', borderRadius: 20, background: 'rgba(217,119,6,0.2)', color: '#d97706', border: '1px solid rgba(217,119,6,0.3)', fontSize: 10 }}>{pendientes} pendiente(s)</span>}
            </p>
          </div>
        </div>
        <button onClick={abrirCrear} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', background: '#cc0000', border: 'none', boxShadow: '0 4px 14px rgba(204,0,0,0.4)' }}>
          <Plus size={15} /> Nueva Baja
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
          <input type="text" placeholder="Buscar bajas..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
            style={{ ...inputStyle, paddingLeft: 34, background: '#1a1a1a', border: '1px solid #2a2a2a' }} />
        </div>
        <select value={filtroMotivo} onChange={e => { setFiltroMotivo(e.target.value); setPagina(1) }} style={{ ...selectStyle, minWidth: 180 }}>
          <option value="">Todos los motivos</option>
          {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPagina(1) }} style={{ ...selectStyle, minWidth: 140 }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a0000' }}>
              {['#', 'Cursante', 'Motivo', 'Fecha Baja', 'Observaciones', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>Cargando...</td></tr>
            ) : pagActual.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>No se encontraron registros</td></tr>
            ) : pagActual.map((b, i) => {
              const ec = ESTADO_COLOR[b.estado]
              const mc = MOTIVO_COLOR[b.motivo] || MOTIVO_COLOR['Otros']
              return (
                <tr key={b.id} style={{ background: i % 2 === 0 ? '#111' : '#141414', borderBottom: '1px solid #1f1f1f' }}>
                  <td style={{ padding: '10px 16px', color: '#4b5563', fontSize: 12 }}>{b.id}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(204,0,0,0.2)', border: '1px solid rgba(204,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cc0000', fontSize: 11, fontWeight: 700 }}>
                        {b.cursante_nombre?.charAt(0) || '?'}
                      </div>
                      <span style={{ fontWeight: 600, color: 'white', fontSize: 12 }}>{b.cursante_nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: mc.bg, color: mc.color }}>{b.motivo}</span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 12 }}>{b.fecha_baja}</td>
                  <td style={{ padding: '10px 16px', color: '#4b5563', fontSize: 12, maxWidth: 180 }}>
                    <span title={b.observaciones}>{b.observaciones?.length > 50 ? b.observaciones.substring(0, 47) + '...' : b.observaciones}</span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: ec.bg, color: ec.color, border: `1px solid ${ec.border}` }}>{b.estado}</span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {b.estado === 'Pendiente' && (
                        <button onClick={() => abrirConfirmar(b)} style={{ padding: 6, borderRadius: 8, background: 'rgba(204,0,0,0.15)', border: '1px solid rgba(204,0,0,0.3)', cursor: 'pointer' }} title="Confirmar">
                          <CheckCircle size={13} color="#ff4444" />
                        </button>
                      )}
                      <button onClick={() => abrirEditar(b)} style={{ padding: 6, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: 'pointer' }}><Pencil size={13} color="#9ca3af" /></button>
                      <button onClick={() => abrirEliminar(b)} style={{ padding: 6, borderRadius: 8, background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.2)', cursor: 'pointer' }}><Trash2 size={13} color="#cc0000" /></button>
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

      {/* MODAL CREAR/EDITAR */}
      {(modal === 'crear' || modal === 'editar') && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#111', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 500, margin: '0 16px', boxShadow: '0 0 60px rgba(204,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserMinus size={18} color="#cc0000" />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{modal === 'crear' ? 'Nueva Baja' : 'Editar Baja'}</h2>
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
                <label style={labelStyle}>MOTIVO *</label>
                <select name="motivo" value={form.motivo} onChange={handleInput} style={selectStyle}>
                  {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>FECHA DE BAJA *</label>
                <input type="date" name="fecha_baja" value={form.fecha_baja} onChange={handleInput} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>OBSERVACIONES *</label>
                <textarea name="observaciones" value={form.observaciones} onChange={handleInput} rows={3} placeholder="Detalles específicos del motivo..." style={{ ...inputStyle, resize: 'none' }} />
              </div>
            </div>
            {error && <p style={{ marginTop: 10, fontSize: 12, color: '#ff6666', background: 'rgba(204,0,0,0.1)', padding: '8px 12px', borderRadius: 8 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={cerrar} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} disabled={guardando} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', background: '#cc0000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Save size={14} />{guardando ? 'Guardando...' : modal === 'crear' ? 'Registrar Baja' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR */}
      {modal === 'confirmar' && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#111', border: '1px solid rgba(204,0,0,0.3)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 380, margin: '0 16px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(217,119,6,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <AlertTriangle size={24} color="#d97706" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>Confirmar Baja</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>¿Confirmar la baja de <strong style={{ color: 'white' }}>{seleccionado?.cursante_nombre?.split('–')[0]}</strong>?</p>
            <p style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(217,119,6,0.1)', color: '#d97706', marginBottom: 20 }}>
              Esta acción cambiará el estado del cursante a BAJA.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={cerrar} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmarBaja} disabled={guardando} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', background: '#cc0000', border: 'none', cursor: 'pointer' }}>
                {guardando ? 'Confirmando...' : 'Confirmar Baja'}
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
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>Eliminar Registro</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>¿Eliminar el registro de baja de <strong style={{ color: 'white' }}>{seleccionado?.cursante_nombre?.split('–')[0]}</strong>?</p>
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