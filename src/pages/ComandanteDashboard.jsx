import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Users, Brain, TrendingUp, AlertTriangle,
  Activity, BarChart2, Stethoscope, Target,
  ChevronRight, Shield, Star, Clock, Eye
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts'

// ─── Datos semilla para el dashboard ─────────────────────────────────────────
const CURSANTES_SEED = [
  { id: 1, nombre: 'Carlos Mamani', periodo: 'Especialidad', promedio: 93.57, nivel: 'Excelente', tendencia: 'mejorando' },
  { id: 2, nombre: 'José Quispe', periodo: 'Especialidad', promedio: 70.98, nivel: 'Bueno', tendencia: 'estable' },
  { id: 3, nombre: 'Juan Condori', periodo: 'Especialidad', promedio: 76.23, nivel: 'Bueno', tendencia: 'mejorando' },
  { id: 6, nombre: 'Fernando Gutierrez', periodo: 'Especialidad', promedio: 98.22, nivel: 'Excelente', tendencia: 'mejorando' },
  { id: 7, nombre: 'Luis Vargas', periodo: 'Especialidad', promedio: 85.74, nivel: 'Excelente', tendencia: 'mejorando' },
  { id: 10, nombre: 'Andrés Yujra', periodo: 'Especialidad', promedio: 73.43, nivel: 'Bueno', tendencia: 'estable' },
  { id: 11, nombre: 'Pedro Ticona', periodo: 'Especialidad', promedio: 55.31, nivel: 'Regular', tendencia: 'empeorando' },
  { id: 65, nombre: 'Nelson Mamani', periodo: 'Especialidad', promedio: 100.0, nivel: 'Excelente', tendencia: 'mejorando' },
  { id: 67, nombre: 'Wilson Apaza', periodo: 'Especialidad', promedio: 56.88, nivel: 'Regular', tendencia: 'empeorando' },
  { id: 82, nombre: 'Benjamín Callisaya', periodo: 'Especialidad', promedio: 55.65, nivel: 'Regular', tendencia: 'empeorando' },
]

const PERIODOS_DATA = [
  { periodo: 'Básico', promedio: 73.74, cursantes: 150, evaluaciones: 300, color: '#7c3aed' },
  { periodo: 'Intermedio', promedio: 76.6, cursantes: 150, evaluaciones: 300, color: '#1d4ed8' },
  { periodo: 'Especialidad', promedio: 78.4, cursantes: 150, evaluaciones: 150, color: '#0891b2' },
]

const DISTRIBUCION_NIVELES = [
  { name: 'Excelente (≥90)', value: 28, color: '#15803d' },
  { name: 'Muy Bueno (≥80)', value: 42, color: '#1d4ed8' },
  { name: 'Bueno (≥70)', value: 48, color: '#0891b2' },
  { name: 'Regular (≥60)', value: 24, color: '#d97706' },
  { name: 'Bajo (<60)', value: 8, color: '#dc2626' },
]

const EVOLUCION_PROMEDIO = [
  { eval: 'Eval 1', promedio: 75.67, prediccion: 76 },
  { eval: 'Eval 2', promedio: 82.86, prediccion: 83 },
  { eval: 'Eval 3', promedio: 89.86, prediccion: 90 },
  { eval: 'Eval 4', promedio: 86.23, prediccion: 87 },
  { eval: 'Eval 5', promedio: 93.57, prediccion: 94 },
]

const RADAR_DATA = [
  { materia: 'Armas\nTácticas', valor: 86 },
  { materia: 'Box', valor: 84.8 },
  { materia: 'Combate', valor: 84.1 },
  { materia: 'Disciplina', valor: 87 },
  { materia: 'Entren.', valor: 85.3 },
  { materia: 'Jiu Jitsu', valor: 85.7 },
  { materia: 'Judo', valor: 85.8 },
  { materia: 'Lucha Pie', valor: 86 },
]

const PREDICCIONES_SEED = [
  { id: 1, nombre: 'Carlos Mamani', actual: 93.57, prediccion: 94.2, diferencia: +0.63, confianza: 92 },
  { id: 6, nombre: 'Fernando Gutierrez', actual: 98.22, prediccion: 98.8, diferencia: +0.58, confianza: 96 },
  { id: 65, nombre: 'Nelson Mamani', actual: 100.0, prediccion: 100.0, diferencia: 0, confianza: 99 },
  { id: 7, nombre: 'Luis Vargas', actual: 85.74, prediccion: 87.1, diferencia: +1.36, confianza: 88 },
  { id: 3, nombre: 'Juan Condori', actual: 76.23, prediccion: 77.8, diferencia: +1.57, confianza: 81 },
  { id: 2, nombre: 'José Quispe', actual: 70.98, prediccion: 70.5, diferencia: -0.48, confianza: 79 },
  { id: 11, nombre: 'Pedro Ticona', actual: 55.31, prediccion: 53.8, diferencia: -1.51, confianza: 74 },
  { id: 67, nombre: 'Wilson Apaza', actual: 56.88, prediccion: 55.2, diferencia: -1.68, confianza: 71 },
]

const NIVEL_COLOR = {
  Excelente: '#15803d',
  'Muy Bueno': '#1d4ed8',
  Bueno: '#0891b2',
  Regular: '#d97706',
  Bajo: '#dc2626',
  Crítico: '#991b1b',
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ComandanteDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCursante, setSelectedCursante] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Simular carga de datos desde el backend Flask (localhost:5000)
    const timer = setTimeout(() => {
      setStats({
        total_cursantes: 150,
        promedio_general: 76.6,
        excelentes: 28,
        en_riesgo: 8,
        evaluaciones_mes: 750,
        mejora_promedio: 2.3,
      })
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0d1117' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: '#c9a227', borderTopColor: 'transparent' }} />
        <p style={{ color: '#c9a227', fontFamily: 'serif', letterSpacing: '0.2em', fontSize: 12 }}>
          CARGANDO INTELIGENCIA ARTIFICIAL...
        </p>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Vista General', icon: BarChart2 },
    { id: 'predicciones', label: 'Predicciones ML', icon: Brain },
    { id: 'diagnosticos', label: 'Diagnósticos', icon: Stethoscope },
    { id: 'cursantes', label: 'Cursantes', icon: Users },
    { id: 'evaluaciones', label: 'Evaluaciones', icon: Activity },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* ── Header del Comandante ── */}
      <div className="px-8 py-5 border-b" style={{ background: '#0a0f0a', borderColor: 'rgba(201,162,39,0.2)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(201,162,39,0.2)', border: '1.5px solid #c9a227' }}>
              <Shield size={20} color="#c9a227" />
            </div>
            <div>
              <h1 className="font-bold" style={{ color: 'white', fontFamily: 'serif', letterSpacing: '0.05em' }}>
                Dashboard del Comandante
              </h1>
              <p className="text-xs mt-0.5" style={{ color: '#c9a227', opacity: 0.8, letterSpacing: '0.1em' }}>
                SISTEMA EAME — MÓDULO DE INTELIGENCIA ARTIFICIAL
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(22,163,74,0.2)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.4)' }}>
              ● Sistema ML Activo
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              CNL. {user?.nombre || 'Comandante'}
            </span>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex gap-1 mt-5">
          {tabs.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-semibold transition-all"
                style={{
                  background: active ? '#f8fafc' : 'transparent',
                  color: active ? '#0a0f0a' : 'rgba(255,255,255,0.5)',
                  borderBottom: active ? 'none' : 'none',
                }}>
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Contenido según tab ── */}
      <div className="p-6">

        {/* ══ TAB: VISTA GENERAL ══════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Cursantes', value: stats.total_cursantes, icon: Users, color: '#1d4ed8', bg: '#eff6ff' },
                { label: 'Promedio General', value: stats.promedio_general, icon: TrendingUp, color: '#15803d', bg: '#f0fdf4' },
                { label: 'Excelentes (≥90)', value: stats.excelentes, icon: Star, color: '#c9a227', bg: '#fffbeb' },
                { label: 'En Riesgo (<60)', value: stats.en_riesgo, icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2' },
              ].map((c, i) => {
                const Icon = c.icon
                return (
                  <div key={i} className="rounded-xl p-4 flex items-center gap-3 transition-all hover:-translate-y-1"
                    style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                      <Icon size={20} color={c.color} />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: '#64748b' }}>{c.label}</p>
                      <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Promedios por periodo */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {PERIODOS_DATA.map((p, i) => (
                <div key={i} className="rounded-xl p-5 text-white relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${p.color}dd, ${p.color}88)`, boxShadow: `0 4px 20px ${p.color}44` }}>
                  <div className="absolute top-3 right-3 opacity-10 text-6xl font-black">{i + 1}</div>
                  <p className="text-sm font-semibold mb-1 opacity-90">{p.periodo}</p>
                  <p className="text-4xl font-black mb-2">{p.promedio}</p>
                  <div className="flex gap-3 text-xs opacity-80">
                    <span>👥 {p.cursantes} cursantes</span>
                    <span>📋 {p.evaluaciones} evaluaciones</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráficos fila 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Distribución por nivel */}
              <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: '#0f172a' }}>
                  Distribución por Nivel de Rendimiento
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={DISTRIBUCION_NIVELES} cx="50%" cy="50%" outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${value}`}
                      labelLine={false}>
                      {DISTRIBUCION_NIVELES.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Evolución del promedio */}
              <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: '#0f172a' }}>
                  Evolución Promedio vs Predicción ML
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={EVOLUCION_PROMEDIO} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradProm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c9a227" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#c9a227" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="eval" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="promedio" stroke="#1d4ed8" strokeWidth={2} fill="url(#gradProm)" name="Promedio Real" />
                    <Area type="monotone" dataKey="prediccion" stroke="#c9a227" strokeWidth={2} strokeDasharray="5 5" fill="url(#gradPred)" name="Predicción ML" />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top cursantes */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
              <div className="px-5 py-3" style={{ background: '#0a0f0a' }}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Star size={14} color="#c9a227" /> Ranking de Cursantes
                </h3>
              </div>
              <table className="w-full text-sm" style={{ background: 'white' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {['#', 'Cursante', 'Periodo', 'Promedio', 'Nivel', 'Tendencia ML', 'Acción'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CURSANTES_SEED.sort((a, b) => b.promedio - a.promedio).map((c, i) => {
                    const color = NIVEL_COLOR[c.nivel] || '#64748b'
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td className="px-4 py-2.5 text-xs font-bold" style={{ color: i < 3 ? '#c9a227' : '#94a3b8' }}>
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-xs" style={{ color: '#0f172a' }}>{c.nombre}</td>
                        <td className="px-4 py-2.5 text-xs" style={{ color: '#64748b' }}>{c.periodo}</td>
                        <td className="px-4 py-2.5">
                          <span className="font-bold text-sm" style={{ color }}>{c.promedio}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: `${color}20`, color }}>
                            {c.nivel}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs" style={{
                            color: c.tendencia === 'mejorando' ? '#15803d' : c.tendencia === 'empeorando' ? '#dc2626' : '#64748b'
                          }}>
                            {c.tendencia === 'mejorando' ? '↑ Mejorando' : c.tendencia === 'empeorando' ? '↓ Decayendo' : '→ Estable'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <button onClick={() => { setSelectedCursante(c); setActiveTab('diagnosticos') }}
                            className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                            style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                            <Eye size={11} /> Ver
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ TAB: PREDICCIONES ML ════════════════════════════════════════ */}
        {activeTab === 'predicciones' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl" style={{ background: '#1e3a5f' }}>
                <Brain size={22} color="#c9a227" />
              </div>
              <div>
                <h2 className="font-bold text-lg" style={{ color: '#0f172a' }}>Predicciones de Rendimiento</h2>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Motor Random Forest — Precisión: 94.2% | R²: 0.891
                </p>
              </div>
            </div>

            {/* Métricas del modelo */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Precisión (R²)', value: '0.891', color: '#15803d', desc: 'Coeficiente de determinación' },
                { label: 'RMSE', value: '3.24', color: '#1d4ed8', desc: 'Error cuadrático medio' },
                { label: 'MAE', value: '2.18', color: '#0891b2', desc: 'Error absoluto medio' },
                { label: 'Confianza Avg', value: '84.5%', color: '#c9a227', desc: 'Promedio de confianza' },
              ].map((m, i) => (
                <div key={i} className="rounded-xl p-4 text-center" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                  <p className="text-2xl font-black mb-1" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-xs font-semibold" style={{ color: '#0f172a' }}>{m.label}</p>
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{m.desc}</p>
                </div>
              ))}
            </div>

            {/* Gráfico predicción vs real */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: '#0f172a' }}>
                  Comparación: Valor Real vs Predicción ML
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={PREDICCIONES_SEED.slice(0, 6)} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="nombre" tick={{ fontSize: 9, fill: '#64748b' }} angle={-30} textAnchor="end" />
                    <YAxis domain={[50, 105]} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="actual" fill="#1d4ed8" name="Real" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="prediccion" fill="#c9a227" name="Predicción ML" radius={[4, 4, 0, 0]} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: '#0f172a' }}>
                  Radar de Competencias — Cursante Destacado
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="materia" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Radar name="Rendimiento" dataKey="valor" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="Predicción" dataKey="valor" stroke="#c9a227" fill="#c9a227" fillOpacity={0.1} strokeDasharray="5 5" strokeWidth={1.5} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabla de predicciones */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#1e3a5f' }}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Brain size={14} color="#c9a227" /> Predicciones Individuales
                </h3>
                <span className="text-xs text-white opacity-60">Modelo: Random Forest v2.1</span>
              </div>
              <table className="w-full text-sm" style={{ background: 'white' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {['Cursante', 'Promedio Actual', 'Predicción ML', 'Diferencia', 'Confianza', 'Acción'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PREDICCIONES_SEED.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td className="px-4 py-2.5 font-semibold text-xs" style={{ color: '#0f172a' }}>{p.nombre}</td>
                      <td className="px-4 py-2.5 font-bold text-sm" style={{ color: '#1d4ed8' }}>{p.actual}</td>
                      <td className="px-4 py-2.5 font-bold text-sm" style={{ color: '#c9a227' }}>{p.prediccion}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            background: p.diferencia >= 0 ? '#dcfce7' : '#fee2e2',
                            color: p.diferencia >= 0 ? '#15803d' : '#dc2626'
                          }}>
                          {p.diferencia >= 0 ? '+' : ''}{p.diferencia}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${p.confianza}%`, background: p.confianza >= 85 ? '#15803d' : '#d97706' }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: '#64748b' }}>{p.confianza}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => { setSelectedCursante(CURSANTES_SEED.find(c => c.id === p.id)); setActiveTab('diagnosticos') }}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                          Diagnosticar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ TAB: DIAGNÓSTICOS ═══════════════════════════════════════════ */}
        {activeTab === 'diagnosticos' && (
          <DiagnosticosTab selectedCursante={selectedCursante} setSelectedCursante={setSelectedCursante} />
        )}

        {/* ══ TAB: CURSANTES ══════════════════════════════════════════════ */}
        {activeTab === 'cursantes' && (
          <CursantesMLTab onDiagnosticar={(c) => { setSelectedCursante(c); setActiveTab('diagnosticos') }} />
        )}

        {/* ══ TAB: EVALUACIONES ═══════════════════════════════════════════ */}
        {activeTab === 'evaluaciones' && (
          <EvaluacionesMatrizTab />
        )}
      </div>
    </div>
  )
}

// ─── Pestaña Diagnósticos ────────────────────────────────────────────────────
function DiagnosticosTab({ selectedCursante, setSelectedCursante }) {
  const [busquedaId, setBusquedaId] = useState(selectedCursante?.id || '')
  const [diagnostico, setDiagnostico] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedCursante) {
      setBusquedaId(selectedCursante.id)
      generarDiagnostico(selectedCursante)
    }
  }, [selectedCursante])

  const generarDiagnostico = (cursante) => {
    setLoading(true)
    setTimeout(() => {
      const promedio = cursante?.promedio || 76.6
      const nivel = promedio >= 90 ? 'Excelente' : promedio >= 80 ? 'Muy Bueno' : promedio >= 70 ? 'Bueno' : promedio >= 60 ? 'Regular' : 'Bajo'
      setDiagnostico({
        id: cursante?.id || 1,
        nombre: cursante?.nombre || 'Cursante',
        promedio_general: promedio,
        nivel,
        total_evaluaciones: 5,
        materias_fuertes: [
          { nombre: 'Disciplina', promedio: 94.0 },
          { nombre: 'Armas Tácticas', promedio: 96.8 },
          { nombre: 'Tec. Derribo', promedio: 92.8 },
        ],
        materias_debiles: promedio < 70 ? [
          { nombre: 'Entrenamiento Físico', promedio: 53.7 },
          { nombre: 'Lucha en Pie', promedio: 57.5 },
        ] : [],
        recomendaciones: promedio >= 85
          ? ['Excelente desempeño. Considerar para roles de liderazgo avanzado.', 'Participar en competencias regionales.', 'Ser mentor de cursantes con bajo rendimiento.']
          : promedio >= 70
          ? ['Rendimiento satisfactorio. Incrementar práctica en áreas débiles.', 'Aumentar sesiones de entrenamiento físico.', 'Revisar técnicas de combate cuerpo a cuerpo.']
          : ['Rendimiento bajo. Requiere plan de reforzamiento inmediato.', 'Sesiones de tutoría individual diarias.', 'Evaluación médica recomendada.', 'Apoyo psicológico si es necesario.'],
        alertas: promedio < 60
          ? [{ tipo: 'critico', mensaje: `Rendimiento crítico (${promedio}). Intervención urgente.` }]
          : promedio < 70
          ? [{ tipo: 'warning', mensaje: `Rendimiento en riesgo (${promedio}). Monitoreo cercano.` }]
          : [],
        tendencia: promedio > 80 ? 'mejorando' : promedio < 65 ? 'empeorando' : 'estable',
        comparacion_grupo: {
          promedio_cursante: promedio,
          promedio_grupo: 76.6,
          diferencia: promedio - 76.6,
          percentil: Math.min(99, Math.round((promedio / 100) * 100)),
        }
      })
      setLoading(false)
    }, 600)
  }

  const buscar = () => {
    const c = CURSANTES_SEED.find(x => x.id === Number(busquedaId))
    if (c) { setSelectedCursante(c); generarDiagnostico(c) }
    else { generarDiagnostico({ id: busquedaId, nombre: `Cursante ${busquedaId}`, promedio: 72 + Math.random() * 20 }) }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl" style={{ background: '#dc2626' }}>
          <Stethoscope size={22} color="white" />
        </div>
        <div>
          <h2 className="font-bold text-lg" style={{ color: '#0f172a' }}>Sistema de Diagnóstico Inteligente</h2>
          <p className="text-xs" style={{ color: '#64748b' }}>Análisis IA — Fortalezas · Debilidades · Recomendaciones personalizadas</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="rounded-xl p-4 mb-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="ID del Cursante (ej: 1, 6, 65...)"
            value={busquedaId}
            onChange={e => setBusquedaId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: '1px solid #e2e8f0', color: '#0f172a' }}
          />
          <button onClick={buscar}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: '#dc2626' }}>
            <Stethoscope size={15} /> Diagnosticar
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          {CURSANTES_SEED.slice(0, 5).map(c => (
            <button key={c.id} onClick={() => { setBusquedaId(c.id); setSelectedCursante(c); generarDiagnostico(c) }}
              className="text-xs px-3 py-1 rounded-full"
              style={{ background: '#f1f5f9', color: '#64748b' }}>
              ID {c.id} — {c.nombre.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: '#dc2626', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#64748b' }}>Analizando datos con IA...</p>
        </div>
      )}

      {diagnostico && !loading && (
        <div>
          {/* Header del diagnóstico */}
          <div className="rounded-xl p-5 mb-5 text-white" style={{
            background: 'linear-gradient(135deg, #1e3a5f, #0a0f0a)',
            border: '1px solid rgba(201,162,39,0.3)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{diagnostico.nombre}</h3>
                <p className="text-sm opacity-70">ID: {diagnostico.id} · {diagnostico.total_evaluaciones} evaluaciones analizadas</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black" style={{ color: '#c9a227' }}>{diagnostico.promedio_general.toFixed(2)}</p>
                <span className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{
                    background: `${NIVEL_COLOR[diagnostico.nivel]}30`,
                    color: NIVEL_COLOR[diagnostico.nivel],
                    border: `1px solid ${NIVEL_COLOR[diagnostico.nivel]}50`
                  }}>
                  {diagnostico.nivel}
                </span>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {diagnostico.alertas?.length > 0 && (
            <div className="mb-4">
              {diagnostico.alertas.map((a, i) => (
                <div key={i} className="rounded-xl px-4 py-3 flex items-center gap-3 mb-2"
                  style={{ background: a.tipo === 'critico' ? '#fef2f2' : '#fef3c7', border: `1px solid ${a.tipo === 'critico' ? '#fca5a5' : '#fde047'}` }}>
                  <AlertTriangle size={16} color={a.tipo === 'critico' ? '#dc2626' : '#d97706'} />
                  <p className="text-sm font-semibold" style={{ color: a.tipo === 'critico' ? '#dc2626' : '#d97706' }}>
                    {a.mensaje}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            {/* Fortalezas */}
            <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#15803d' }}>
                <Target size={15} /> Fortalezas
              </h4>
              {diagnostico.materias_fuertes.map((m, i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#374151' }}>{m.nombre}</span>
                    <span className="font-bold" style={{ color: '#15803d' }}>{m.promedio}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${m.promedio}%`, background: '#15803d' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Áreas de mejora */}
            <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#dc2626' }}>
                <AlertTriangle size={15} /> Áreas de Mejora
              </h4>
              {diagnostico.materias_debiles.length === 0
                ? <p className="text-xs text-center py-4" style={{ color: '#94a3b8' }}>✓ Sin áreas débiles identificadas</p>
                : diagnostico.materias_debiles.map((m, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#374151' }}>{m.nombre}</span>
                      <span className="font-bold" style={{ color: '#dc2626' }}>{m.promedio}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#e2e8f0' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${m.promedio}%`, background: '#dc2626' }} />
                    </div>
                  </div>
                ))}
            </div>

            {/* Comparación con grupo */}
            <div className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
              <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#0f172a' }}>
                <BarChart2 size={15} /> Comparación con Grupo
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Promedio cursante</span>
                  <span className="font-bold" style={{ color: '#0f172a' }}>{diagnostico.comparacion_grupo.promedio_cursante.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Promedio grupo</span>
                  <span className="font-bold" style={{ color: '#0f172a' }}>{diagnostico.comparacion_grupo.promedio_grupo}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Diferencia</span>
                  <span className="font-bold" style={{ color: diagnostico.comparacion_grupo.diferencia >= 0 ? '#15803d' : '#dc2626' }}>
                    {diagnostico.comparacion_grupo.diferencia >= 0 ? '+' : ''}{diagnostico.comparacion_grupo.diferencia.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Percentil</span>
                  <span className="font-bold" style={{ color: '#c9a227' }}>Top {100 - diagnostico.comparacion_grupo.percentil}%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Tendencia</span>
                  <span className="font-bold capitalize" style={{
                    color: diagnostico.tendencia === 'mejorando' ? '#15803d' : diagnostico.tendencia === 'empeorando' ? '#dc2626' : '#64748b'
                  }}>
                    {diagnostico.tendencia}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#0f172a' }}>
              💡 Recomendaciones Personalizadas (IA)
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {diagnostico.recomendaciones.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-3 rounded-lg" style={{ background: '#f8fafc' }}>
                  <ChevronRight size={13} color="#1d4ed8" className="mt-0.5 flex-shrink-0" />
                  <p style={{ color: '#374151' }}>{r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!diagnostico && !loading && (
        <div className="text-center py-16" style={{ color: '#94a3b8' }}>
          <Stethoscope size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Ingresa un ID de cursante para generar el diagnóstico con IA</p>
        </div>
      )}
    </div>
  )
}

// ─── Pestaña Cursantes con ML ────────────────────────────────────────────────
function CursantesMLTab({ onDiagnosticar }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('')

  const filtrados = CURSANTES_SEED.filter(c => {
    const matchB = !busqueda || c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchN = !filtroNivel || c.nivel === filtroNivel
    return matchB && matchN
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl" style={{ background: '#1d4ed8' }}>
          <Users size={22} color="white" />
        </div>
        <h2 className="font-bold text-lg" style={{ color: '#0f172a' }}>Gestión de Cursantes — Vista Comandante</h2>
      </div>

      <div className="flex gap-3 mb-5">
        <input type="text" placeholder="Buscar cursante..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a' }} />
        <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'white', border: '1px solid #e2e8f0', color: '#0f172a' }}>
          <option value="">Todos los niveles</option>
          <option value="Excelente">Excelente</option>
          <option value="Muy Bueno">Muy Bueno</option>
          <option value="Bueno">Bueno</option>
          <option value="Regular">Regular</option>
          <option value="Bajo">Bajo</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtrados.map(c => {
          const color = NIVEL_COLOR[c.nivel] || '#64748b'
          return (
            <div key={c.id} className="rounded-xl p-4" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: color }}>
                    {c.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{c.nombre}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>ID {c.id} · {c.periodo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black" style={{ color }}>{c.promedio}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                    {c.nivel}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full mb-3" style={{ background: '#e2e8f0' }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(c.promedio, 100)}%`, background: color }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: c.tendencia === 'mejorando' ? '#15803d' : c.tendencia === 'empeorando' ? '#dc2626' : '#64748b' }}>
                  {c.tendencia === 'mejorando' ? '↑ Tendencia positiva' : c.tendencia === 'empeorando' ? '↓ Tendencia negativa' : '→ Estable'}
                </span>
                <button onClick={() => onDiagnosticar(c)}
                  className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold"
                  style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <Brain size={12} /> Diagnóstico IA
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Pestaña Evaluaciones — Matriz de calor ──────────────────────────────────
const MATERIAS_MATRIZ = ['Armas Táct.', 'Box', 'Combate', 'Disciplina', 'Entren. Fís.', 'Jiu Jitsu', 'Judo', 'Lucha Pie', 'Taekwondo', 'Tec. Derribo']

const MATRIZ_DATA = [
  { nombre: 'Carlos Mamani', valores: [96.8, 93.8, 98.3, 94.0, 91.6, 95.1, 96.4, 86.9, 88.0, 92.8] },
  { nombre: 'José Quispe', valores: [67.3, 73.6, 67.5, 71.3, 73.0, 71.7, 74.9, 70.4, 71.7, 66.7] },
  { nombre: 'Juan Condori', valores: [73.2, 71.8, 69.9, 75.0, 74.3, 77.2, 74.5, 73.9, 76.4, 71.5] },
  { nombre: 'Miguel Apaza', valores: [75.1, 79.8, 80.9, 79.3, 80.4, 74.1, 78.2, 75.8, 76.2, 71.8] },
  { nombre: 'Ricardo Flores', valores: [73.6, 71.1, 75.6, 69.7, 73.0, 75.2, 67.8, 74.0, 73.5, 71.7] },
  { nombre: 'Fernando Gutierrez', valores: [93.0, 100.0, 94.9, 97.1, 100.0, 98.2, 100.0, 97.8, 100.0, 97.0] },
  { nombre: 'Luis Vargas', valores: [83.0, 89.3, 82.8, 89.5, 87.6, 89.9, 86.8, 85.2, 84.9, 80.2] },
  { nombre: 'Pedro Ticona', valores: [56.2, 56.7, 61.8, 50.1, 53.7, 59.3, 58.1, 57.5, 51.9, 51.2] },
]

function getCellColor(valor) {
  if (valor >= 90) return { bg: '#15803d', text: 'white' }
  if (valor >= 80) return { bg: '#0891b2', text: 'white' }
  if (valor >= 70) return { bg: '#d97706', text: 'white' }
  if (valor >= 60) return { bg: '#ea580c', text: 'white' }
  return { bg: '#dc2626', text: 'white' }
}

function EvaluacionesMatrizTab() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl" style={{ background: '#0891b2' }}>
          <Activity size={22} color="white" />
        </div>
        <div>
          <h2 className="font-bold text-lg" style={{ color: '#0f172a' }}>Matriz de Rendimiento por Materia</h2>
          <p className="text-xs" style={{ color: '#64748b' }}>Código de colores según nivel de desempeño</p>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { label: '90-100 Excelente', color: '#15803d' },
          { label: '80-89 Muy Bueno', color: '#0891b2' },
          { label: '70-79 Bueno', color: '#d97706' },
          { label: '60-69 Regular', color: '#ea580c' },
          { label: '0-59 Bajo', color: '#dc2626' },
        ].map((l, i) => (
          <span key={i} className="text-xs px-3 py-1 rounded-full text-white font-semibold"
            style={{ background: l.color }}>
            {l.label}
          </span>
        ))}
      </div>

      {/* Periodos */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {PERIODOS_DATA.map((p, i) => (
          <div key={i} className="rounded-xl p-4 text-white"
            style={{ background: `linear-gradient(135deg, ${p.color}ee, ${p.color}88)` }}>
            <p className="text-sm font-semibold">{p.periodo}</p>
            <p className="text-3xl font-black">{p.promedio}</p>
            <p className="text-xs opacity-75 mt-1">👥 {p.cursantes} cursantes · 📋 {p.evaluaciones} evaluaciones</p>
          </div>
        ))}
      </div>

      {/* Matriz de calor */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="w-full text-xs" style={{ minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#1e3a5f' }}>
                <th className="px-4 py-3 text-left text-white font-semibold sticky left-0" style={{ background: '#1e3a5f', minWidth: 140, zIndex: 10 }}>
                  Cursante
                </th>
                {MATERIAS_MATRIZ.map(m => (
                  <th key={m} className="px-3 py-3 text-center text-white font-semibold" style={{ minWidth: 80 }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIZ_DATA.map((fila, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td className="px-4 py-2.5 font-semibold sticky left-0" style={{ background: i % 2 === 0 ? 'white' : '#f8fafc', color: '#0f172a', zIndex: 5 }}>
                    {fila.nombre}
                  </td>
                  {fila.valores.map((val, j) => {
                    const { bg, text } = getCellColor(val)
                    return (
                      <td key={j} className="px-3 py-2.5 text-center font-bold"
                        style={{ background: bg, color: text }}>
                        {val}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}