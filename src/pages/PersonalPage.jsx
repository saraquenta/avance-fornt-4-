import { useEffect, useState } from 'react'
import api from '../services/api'
import Radar3D from '../components/Radar3D'
import {
  Search, Plus, Pencil, Trash2, X, Save,
  User, ChevronLeft, ChevronRight, Shield, TrendingUp
} from 'lucide-react'

// PALETA: negro #0a0a0a, rojo #cc0000, plomo #4b5563

const RANGOS = ['GENERAL','CORONEL','TENIENTE_CORONEL','MAYOR','CAPITAN','TENIENTE','SUBTENIENTE','SARGENTO','CABO','SOLDADO']
const ESPECIALIDADES = ['KARATE','JUDO','TAEKWONDO','BOXEO','DEFENSA_PERSONAL']
const ESTADOS = ['ACTIVO','INACTIVO','BAJA']

const RANGO_COLOR = {
  GENERAL: '#cc0000', CORONEL: '#991111', TENIENTE_CORONEL: '#771111',
  MAYOR: '#cc0000', CAPITAN: '#881111', TENIENTE: '#6b7280',
  SUBTENIENTE: '#4b5563', SARGENTO: '#374151', CABO: '#9ca3af', SOLDADO: '#6b7280',
}

const empty = {
  nombre: '', apellido: '', ci: '', rango: 'CAPITAN',
  especialidad: 'KARATE', estado: 'ACTIVO', fecha_ingreso: '', observaciones: ''
}

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
  color: 'white', outline: 'none',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const selectStyle = {
  ...{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'white', outline: 'none' },
  background: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
}

export default function PersonalPage() {
  const [personal, setPersonal]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [busqueda, setBusqueda]   = useState('')
  const [pagina, setPagina]       = useState(1)
  const [modal, setModal]         = useState(null)
  const [perfilModal, setPerfilModal] = useState(null)
  const [competencias, setCompetencias] = useState([])
  const [loadingRadar, setLoadingRadar] = useState(false)
  const [seleccionado, setSelec]  = useState(null)
  const [form, setForm]           = useState(empty)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState('')
  const POR_PAGINA = 8

  const cargar = () => {
    setLoading(true)
    api.get('/personal/')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setPersonal(data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const filtrado = personal.filter(p =>
    `${p.nombre} ${p.apellido} ${p.ci} ${p.rango} ${p.especialidad}`
      .toLowerCase().includes(busqueda.toLowerCase())
  )
  const totalPags = Math.ceil(filtrado.length / POR_PAGINA)
  const pagActual = filtrado.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const abrirCrear   = () => { setForm(empty); setError(''); setModal('crear') }
  const abrirEditar  = (p) => { setSelec(p); setForm({ ...p }); setError(''); setModal('editar') }
  const abrirEliminar = (p) => { setSelec(p); setModal('eliminar') }
  const cerrar = () => { setModal(null); setSelec(null); setError('') }
  const handleInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const guardar = async () => {
    if (!form.nombre || !form.apellido || !form.ci || !form.fecha_ingreso) {
      setError('Completa todos los campos obligatorios'); return
    }
    setGuardando(true); setError('')
    try {
      if (modal === 'crear') await api.post('/personal/', form)
      else await api.put(`/personal/${seleccionado.id}/`, form)
      cargar(); cerrar()
    } catch (e) {
      setError(e.response?.data?.ci?.[0] || 'Error al guardar, verifica los datos')
    } finally { setGuardando(false) }
  }

  const eliminar = async () => {
    setGuardando(true)
    try {
      await api.delete(`/personal/${seleccionado.id}/`)
      cargar(); cerrar()
    } finally { setGuardando(false) }
  }

  const abrirRadar = (p) => {
    setPerfilModal(p)
    setCompetencias([])
    setLoadingRadar(true)
    api.get(`/evaluaciones/competencias/${p.id}/`)
      .then(res => setCompetencias(res.data.competencias || []))
      .catch(() => {
        // datos demo si no hay backend
        setCompetencias([
          { nombre: 'Resistencia', categoria: 'Físico', puntaje: 67.7 },
          { nombre: 'Fuerza', categoria: 'Físico', puntaje: 83 },
          { nombre: 'Velocidad', categoria: 'Físico', puntaje: 79 },
          { nombre: 'Flexibilidad', categoria: 'Físico', puntaje: 76 },
          { nombre: 'Kata', categoria: 'Técnico', puntaje: 88.7 },
          { nombre: 'Kumite', categoria: 'Técnico', puntaje: 64 },
          { nombre: 'Defensa Personal', categoria: 'Táctico', puntaje: 77.7 },
          { nombre: 'Uso de Armas', categoria: 'Táctico', puntaje: 62.3 },
          { nombre: 'Disciplina', categoria: 'Actitudinal', puntaje: 71.7 },
          { nombre: 'Puntualidad', categoria: 'Actitudinal', puntaje: 87 },
          { nombre: 'Trabajo en Equipo', categoria: 'Actitudinal', puntaje: 76.7 },
          { nombre: 'Liderazgo', categoria: 'Actitudinal', puntaje: 71 },
        ])
      })
      .finally(() => setLoadingRadar(false))
  }

  // Estilos globales de la página
  const pageStyle = { padding: 32, minHeight: '100vh', background: '#0f0f0f' }

  return (
    <div style={pageStyle}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div style={{ padding: 8, borderRadius: 10, background: '#cc0000' }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Personal Militar</h1>
            <p style={{ fontSize: 11, color: '#6b7280' }}>
              {filtrado.length} registro(s) encontrado(s)
            </p>
          </div>
        </div>
        <button onClick={abrirCrear} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 18px', borderRadius: 10, fontSize: 13,
          fontWeight: 600, color: 'white', cursor: 'pointer',
          background: '#cc0000', border: 'none',
          boxShadow: '0 4px 14px rgba(204,0,0,0.4)',
        }}>
          <Plus size={15} /> Agregar Personal
        </button>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
        <input
          type="text"
          placeholder="Buscar por nombre, CI, rango o especialidad..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
          style={{
            ...inputStyle,
            paddingLeft: 36,
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
          }}
        />
      </div>

      {/* Tabla */}
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1f1f1f' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a0000' }}>
              {['#','Nombre Completo','CI','Rango','Especialidad','Ingreso','Estado','Acciones'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>Cargando...</td></tr>
            ) : pagActual.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>No se encontraron registros</td></tr>
            ) : pagActual.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? '#111' : '#141414', borderBottom: '1px solid #1f1f1f' }}>
                <td style={{ padding: '10px 16px', color: '#4b5563', fontSize: 12 }}>{(pagina - 1) * POR_PAGINA + i + 1}</td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: RANGO_COLOR[p.rango] || '#4b5563',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 11, fontWeight: 700,
                    }}>
                      {p.apellido[0]}{p.nombre[0]}
                    </div>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{p.apellido} {p.nombre}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 16px', color: '#9ca3af', fontSize: 13 }}>{p.ci}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: `${RANGO_COLOR[p.rango] || '#4b5563'}22`,
                    color: RANGO_COLOR[p.rango] || '#9ca3af',
                    border: `1px solid ${RANGO_COLOR[p.rango] || '#4b5563'}44`,
                  }}>
                    {p.rango?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', color: '#9ca3af', fontSize: 12 }}>{p.especialidad?.replace('_', ' ')}</td>
                <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 12 }}>{p.fecha_ingreso}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: p.estado === 'ACTIVO' ? 'rgba(204,0,0,0.15)' : '#1f1f1f',
                    color: p.estado === 'ACTIVO' ? '#ff4444' : '#6b7280',
                    border: `1px solid ${p.estado === 'ACTIVO' ? '#cc000044' : '#2a2a2a'}`,
                  }}>
                    {p.estado}
                  </span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => abrirRadar(p)}
                      style={{ padding: 6, borderRadius: 8, background: 'rgba(204,0,0,0.15)', border: '1px solid #cc000033', cursor: 'pointer' }}
                      title="Ver gráfico 3D">
                      <TrendingUp size={13} color="#cc0000" />
                    </button>
                    <button onClick={() => abrirEditar(p)}
                      style={{ padding: 6, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: 'pointer' }}
                      title="Editar">
                      <Pencil size={13} color="#9ca3af" />
                    </button>
                    <button onClick={() => abrirEliminar(p)}
                      style={{ padding: 6, borderRadius: 8, background: 'rgba(204,0,0,0.1)', border: '1px solid #cc000033', cursor: 'pointer' }}
                      title="Eliminar">
                      <Trash2 size={13} color="#cc0000" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPags > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <p style={{ fontSize: 12, color: '#4b5563' }}>Página {pagina} de {totalPags}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
              style={{ padding: 8, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: 'pointer', opacity: pagina === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={15} color="white" />
            </button>
            <button onClick={() => setPagina(p => Math.min(totalPags, p + 1))} disabled={pagina === totalPags}
              style={{ padding: 8, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: 'pointer', opacity: pagina === totalPags ? 0.4 : 1 }}>
              <ChevronRight size={15} color="white" />
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL CREAR / EDITAR ──────────────────────────────────────────── */}
      {(modal === 'crear' || modal === 'editar') && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div style={{ borderRadius: 16, padding: 24, width: '100%', maxWidth: 520, margin: '0 16px', maxHeight: '90vh', overflowY: 'auto', background: '#111', border: '1px solid #cc000033', boxShadow: '0 25px 50px rgba(0,0,0,0.7)' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} color="#cc0000" />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
                  {modal === 'crear' ? 'Agregar Personal' : 'Editar Personal'}
                </h2>
              </div>
              <button onClick={cerrar} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#4b5563" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { name: 'nombre',   label: 'Nombre *',        type: 'text' },
                { name: 'apellido', label: 'Apellido *',       type: 'text' },
                { name: 'ci',       label: 'C.I. *',           type: 'text' },
                { name: 'fecha_ingreso', label: 'Fecha Ingreso *', type: 'date' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#cc0000', marginBottom: 5, letterSpacing: '0.1em' }}>{f.label.toUpperCase()}</label>
                  <input type={f.type} name={f.name} value={form[f.name]} onChange={handleInput}
                    style={inputStyle} />
                </div>
              ))}

              {[
                { name: 'rango',        label: 'Rango',        options: RANGOS },
                { name: 'especialidad', label: 'Especialidad', options: ESPECIALIDADES },
                { name: 'estado',       label: 'Estado',       options: ESTADOS },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#cc0000', marginBottom: 5, letterSpacing: '0.1em' }}>{f.label.toUpperCase()}</label>
                  <select name={f.name} value={form[f.name]} onChange={handleInput} style={selectStyle}>
                    {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              ))}

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#cc0000', marginBottom: 5, letterSpacing: '0.1em' }}>OBSERVACIONES</label>
                <textarea name="observaciones" value={form.observaciones} onChange={handleInput}
                  rows={2} style={{ ...inputStyle, resize: 'none' }} />
              </div>
            </div>

            {error && <p style={{ marginTop: 12, fontSize: 12, color: '#ff6666', background: 'rgba(204,0,0,0.12)', padding: '8px 12px', borderRadius: 8, border: '1px solid #cc000033' }}>{error}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={cerrar} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', background: '#cc0000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Save size={14} /> {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ELIMINAR ────────────────────────────────────────────────── */}
      {modal === 'eliminar' && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div style={{ borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, margin: '0 16px', background: '#111', border: '1px solid #cc000033', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(204,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={24} color="#cc0000" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>Dar de Baja</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              ¿Dar de baja a <strong style={{ color: 'white' }}>{seleccionado?.apellido} {seleccionado?.nombre}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={cerrar} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#9ca3af', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={eliminar} disabled={guardando} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', background: '#cc0000', border: 'none', cursor: 'pointer' }}>
                {guardando ? 'Procesando...' : 'Dar de Baja'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL RADAR 3D — solo gráfico + nombre ────────────────────────── */}
      {perfilModal && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            width: '100%', maxWidth: 760, margin: '0 16px',
            background: '#080808',
            border: '1px solid #cc000044',
            borderRadius: 16,
            boxShadow: '0 0 60px rgba(204,0,0,0.2), 0 25px 50px rgba(0,0,0,0.8)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Botón cerrar */}
            <button onClick={() => { setPerfilModal(null); setCompetencias([]) }}
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 20,
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(204,0,0,0.2)', border: '1px solid #cc000066',
                color: '#ff4444', fontSize: 18, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
              ×
            </button>

            {/* Contenido: SOLO el gráfico 3D con nombre */}
            {loadingRadar ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 480, background: '#080808' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid #cc0000', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', marginBottom: 12 }} />
                <p style={{ color: '#cc0000', fontSize: 12, letterSpacing: '0.2em' }}>CARGANDO COMPETENCIAS...</p>
                <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
              </div>
            ) : competencias.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 480, background: '#080808' }}>
                <p style={{ color: '#4b5563', fontSize: 13 }}>Sin evaluaciones registradas aún.</p>
              </div>
            ) : (
              <Radar3D
                competencias={competencias}
                nombreCursante={`${perfilModal.apellido} ${perfilModal.nombre} — ${perfilModal.rango?.replace('_', ' ')}`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}