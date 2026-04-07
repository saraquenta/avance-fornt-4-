import { useEffect, useState } from 'react'
import api from '../services/api'
import Radar3D from '../components/Radar3D'
import {
  Search, Plus, Pencil, Trash2, X, Save,
  User, ChevronLeft, ChevronRight, Shield, TrendingUp
} from 'lucide-react'

const RANGOS = ['GENERAL','CORONEL','TENIENTE_CORONEL','MAYOR','CAPITAN','TENIENTE','SUBTENIENTE','SARGENTO','CABO','SOLDADO']
const ESPECIALIDADES = ['KARATE','JUDO','TAEKWONDO','BOXEO','DEFENSA_PERSONAL']
const ESTADOS = ['ACTIVO','INACTIVO','BAJA']

const RANGO_COLOR = {
  GENERAL: '#7c3aed', CORONEL: '#1d4ed8', TENIENTE_CORONEL: '#0369a1',
  MAYOR: '#0891b2', CAPITAN: '#16a34a', TENIENTE: '#65a30d',
  SUBTENIENTE: '#ca8a04', SARGENTO: '#ea580c', CABO: '#dc2626', SOLDADO: '#6b7280',
}

const empty = {
  nombre: '', apellido: '', ci: '', rango: 'CAPITAN',
  especialidad: 'KARATE', estado: 'ACTIVO', fecha_ingreso: '', observaciones: ''
}

export default function PersonalPage() {
  const [personal, setPersonal]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [busqueda, setBusqueda]   = useState('')
  const [pagina, setPagina]       = useState(1)
  const [modal, setModal]         = useState(null)   // null | 'crear' | 'editar' | 'eliminar'
  const [perfilModal, setPerfilModal] = useState(null)
  
  // Estados para competencias y radar
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

  const abrirCrear = () => { setForm(empty); setError(''); setModal('crear') }
  const abrirEditar = (p) => { setSelec(p); setForm({ ...p }); setError(''); setModal('editar') }
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

  return (
    <div className="p-8 min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: '#16a34a' }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>Personal Militar</h1>
            <p className="text-xs" style={{ color: '#64748b' }}>
              {filtrado.length} registro{filtrado.length !== 1 ? 's' : ''} encontrado{filtrado.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:scale-105"
          style={{ background: '#16a34a', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}
        >
          <Plus size={16} /> Agregar Personal
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Buscar por nombre, CI, rango o especialidad..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            color: '#0f172a',
          }}
        />
      </div>

      {/* Tabla */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#1e3a2f' }}>
              {['#','Nombre Completo','CI','Rango','Especialidad','Ingreso','Estado','Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Cargando...</td></tr>
            ) : pagActual.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">No se encontraron registros</td></tr>
            ) : pagActual.map((p, i) => (
              <tr
                key={p.id}
                className="transition-colors hover:bg-green-50"
                style={{ background: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}
              >
                <td className="px-4 py-3 text-gray-400 text-xs">{(pagina - 1) * POR_PAGINA + i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: RANGO_COLOR[p.rango] || '#6b7280' }}
                    >
                      {p.apellido[0]}{p.nombre[0]}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#0f172a' }}>{p.apellido} {p.nombre}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.ci}</td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `${RANGO_COLOR[p.rango]}20`,
                      color: RANGO_COLOR[p.rango] || '#6b7280'
                    }}
                  >
                    {p.rango.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{p.especialidad.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{p.fecha_ingreso}</td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: p.estado === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                      color: p.estado === 'ACTIVO' ? '#15803d' : '#dc2626',
                    }}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPerfilModal(p);
                        setCompetencias([]);
                        setLoadingRadar(true);
                        api.get(`/evaluaciones/competencias/${p.id}/`)
                          .then(res => setCompetencias(res.data.competencias))
                          .catch(() => {})
                          .finally(() => setLoadingRadar(false))
                      }}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{ background: '#f0fdf4', color: '#16a34a' }}
                      title="Ver perfil 3D"
                    >
                      <TrendingUp size={14} />
                    </button>
                    <button
                      onClick={() => abrirEditar(p)}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{ background: '#eff6ff', color: '#2563eb' }}
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => abrirEliminar(p)}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{ background: '#fef2f2', color: '#dc2626' }}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs" style={{ color: '#64748b' }}>
            Página {pagina} de {totalPags}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="p-2 rounded-lg disabled:opacity-40"
              style={{ background: 'white', border: '1px solid #e2e8f0' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPagina(p => Math.min(totalPags, p + 1))}
              disabled={pagina === totalPags}
              className="p-2 rounded-lg disabled:opacity-40"
              style={{ background: 'white', border: '1px solid #e2e8f0' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {(modal === 'crear' || modal === 'editar') && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'white', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <User size={20} color="#16a34a" />
                <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>
                  {modal === 'crear' ? 'Agregar Personal' : 'Editar Personal'}
                </h2>
              </div>
              <button onClick={cerrar} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'nombre',   label: 'Nombre *',   type: 'text' },
                { name: 'apellido', label: 'Apellido *',  type: 'text' },
                { name: 'ci',       label: 'C.I. *',      type: 'text' },
                { name: 'fecha_ingreso', label: 'Fecha Ingreso *', type: 'date' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleInput}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #e2e8f0', color: '#0f172a' }}
                  />
                </div>
              ))}

              {[
                { name: 'rango',         label: 'Rango',         options: RANGOS },
                { name: 'especialidad', label: 'Especialidad', options: ESPECIALIDADES },
                { name: 'estado',       label: 'Estado',       options: ESTADOS },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>{f.label}</label>
                  <select
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleInput}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #e2e8f0', color: '#0f172a' }}
                  >
                    {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              ))}

              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Observaciones</label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleInput}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ border: '1px solid #e2e8f0', color: '#0f172a' }}
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={cerrar}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#f1f5f9', color: '#475569' }}
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: '#16a34a' }}
              >
                <Save size={15} />
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {modal === 'eliminar' && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm mx-4" style={{ background: 'white', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fef2f2' }}>
                <Trash2 size={26} color="#dc2626" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>Dar de Baja</h2>
              <p className="text-sm mb-6" style={{ color: '#64748b' }}>
                ¿Dar de baja a <strong>{seleccionado?.apellido} {seleccionado?.nombre}</strong>?
                El registro cambiará a estado INACTIVO.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cerrar}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#f1f5f9', color: '#475569' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminar}
                  disabled={guardando}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#dc2626' }}
                >
                  {guardando ? 'Procesando...' : 'Dar de Baja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERFIL 3D (Radar dinámico) */}
      {perfilModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl w-full max-w-2xl mx-4"
            style={{ background: '#0f172a', border: '1px solid #1e3a5f', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
            
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#1e3a5f' }}>
              <div>
                <h2 className="font-bold text-white text-lg">
                  {perfilModal.apellido} {perfilModal.nombre}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#4ade80' }}>
                  {perfilModal.rango?.replace('_',' ')} — {perfilModal.especialidad?.replace('_',' ')}
                </p>
              </div>
              <button onClick={() => { setPerfilModal(null); setCompetencias([]) }}
                className="p-1.5 rounded-lg hover:bg-gray-800">
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div className="p-5">
              {loadingRadar ? (
                <div className="flex flex-col items-center justify-center" style={{ height: 420 }}>
                  <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"/>
                  <p style={{ color: '#4ade80', fontSize: 13 }}>Cargando competencias...</p>
                </div>
              ) : competencias.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ height: 420 }}>
                  <p style={{ color: '#64748b', fontSize: 13 }}>
                    Este personal no tiene evaluaciones registradas aún.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {competencias.map((c, i) => {
                      const color = c.puntaje >= 85 ? '#4ade80'
                                  : c.puntaje >= 70 ? '#60a5fa'
                                  : c.puntaje >= 50 ? '#fbbf24'
                                  : '#f87171'
                      return (
                        <div key={i} className="rounded-lg px-3 py-2 flex items-center justify-between"
                          style={{ background: '#0d1f35', border: `1px solid ${color}30` }}>
                          <span style={{ color: '#94a3b8', fontSize: 11 }}>{c.nombre}</span>
                          <span style={{ color, fontSize: 12, fontWeight: 'bold' }}>{c.puntaje}</span>
                        </div>
                      )
                    })}
                  </div>
                  <Radar3D competencias={competencias} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}