import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import fondoMilitar from '../assets/fondo-militar.png'

export default function LoginPage() {
  const [username, setUsername]     = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [focusUser, setFocusUser]   = useState(false)
  const [focusPass, setFocusPass]   = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ cursor: 'none' }}>

      {/* Imagen de fondo limpia */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${fondoMilitar})`,
          filter: 'brightness(0.35) saturate(0.9)',
        }}
      />

      {/* Capa oscura para mejor legibilidad */}
      <div className="absolute inset-0" style={{ background: 'rgba(0, 10, 2, 0.45)' }} />

      <CustomCursor />

      {/* Tarjeta login */}
      <div className="relative flex items-center justify-center min-h-screen" style={{ zIndex: 10 }}>
        <div
          className="w-full max-w-md mx-4 rounded-2xl p-8"
          style={{
            background: 'rgba(0, 20, 5, 0.75)',
            backdropFilter: 'blur(18px)',
            border: '1px solid rgba(74, 222, 128, 0.25)',
            boxShadow: '0 0 60px rgba(22, 163, 74, 0.15), 0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-wide">
              SISTEMA DE EVALUACIÓN
            </h1>
            <div
              className="h-px w-32 mx-auto my-3"
              style={{ background: 'linear-gradient(to right, transparent, #4ade80, transparent)' }}
            />
            <p className="text-green-400 text-xs tracking-widest uppercase font-medium">
              Unidad de Artes Marciales · Ejército de Bolivia
            </p>
            <p className="text-gray-500 text-xs mt-1">CNL. Eulogio Ruiz Paz</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Campo Usuario */}
            <div>
              <label className="block text-xs font-semibold text-green-400 mb-2 tracking-widest uppercase">
                Usuario
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: focusUser ? '#4ade80' : '#6b7280' }}>
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setFocusUser(true)}
                  onBlur={() => setFocusUser(false)}
                  placeholder="Ingresa tu usuario"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-white text-sm placeholder-gray-600 outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: focusUser ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: focusUser ? '0 0 15px rgba(74,222,128,0.2)' : 'none',
                    cursor: 'none',
                  }}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-green-400 mb-2 tracking-widest uppercase">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: focusPass ? '#4ade80' : '#6b7280' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusPass(true)}
                  onBlur={() => setFocusPass(false)}
                  placeholder="Ingresa tu contraseña"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-lg text-white text-sm placeholder-gray-600 outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: focusPass ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: focusPass ? '0 0 15px rgba(74,222,128,0.2)' : 'none',
                    cursor: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                  style={{ color: showPass ? '#4ade80' : '#6b7280', cursor: 'none' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="text-sm rounded-lg px-4 py-3 text-red-300"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                {error}
              </div>
            )}

            <AnimatedButton loading={loading} />

            {/* Botón Volver al inicio */}
            <div className="text-center mt-4">
              <span
                onClick={() => navigate('/')}
                className="text-xs uppercase tracking-widest transition-all duration-200 hover:text-white"
                style={{ 
                  color: '#4ade80', 
                  cursor: 'none', 
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(74, 222, 128, 0.3)'
                }}
              >
                ← Volver al inicio
              </span>
            </div>
          </form>

          <p className="text-center text-xs text-gray-600 mt-6">
            Gestión Académica Operativa
          </p>
        </div>
      </div>
    </div>
  )
}

function AnimatedButton({ loading }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className="w-full font-bold py-3 rounded-lg text-sm tracking-widest uppercase transition-all duration-200 disabled:opacity-50"
      style={{
        background: hovered
          ? 'linear-gradient(135deg, #16a34a, #4ade80)'
          : 'linear-gradient(135deg, #166534, #16a34a)',
        color: 'white',
        transform: pressed ? 'scale(0.97)' : hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: hovered
          ? '0 0 30px rgba(74,222,128,0.5), 0 8px 25px rgba(0,0,0,0.3)'
          : '0 4px 15px rgba(0,0,0,0.3)',
        cursor: 'none',
        letterSpacing: '0.15em',
      }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Verificando...
        </span>
      ) : 'Ingresar al Sistema'}
    </button>
  )
}

function CustomCursor() {
  const cursorRef = useRef(null)
  const dotRef     = useRef(null)

  useEffect(() => {
    let x = 0, y = 0, dotX = 0, dotY = 0
    const move = (e) => { x = e.clientX; y = e.clientY }
    window.addEventListener('mousemove', move)

    let raf
    const loop = () => {
      dotX += (x - dotX) * 0.12
      dotY += (y - dotY) * 0.12
      if (cursorRef.current)
        cursorRef.current.style.transform = `translate(${x - 10}px, ${y - 10}px)`
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const onDown = () => {
      if (cursorRef.current) {
        cursorRef.current.style.width  = '35px'
        cursorRef.current.style.height = '35px'
        cursorRef.current.style.borderColor = '#86efac'
      }
    }
    const onUp = () => {
      if (cursorRef.current) {
        cursorRef.current.style.width  = '20px'
        cursorRef.current.style.height = '20px'
        cursorRef.current.style.borderColor = '#4ade80'
      }
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 rounded-full"
        style={{
          width: '20px', height: '20px',
          border: '1.5px solid #4ade80',
          zIndex: 9999,
          transition: 'width 0.15s, height 0.15s, border-color 0.15s',
          mixBlendMode: 'difference',
        }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 rounded-full"
        style={{ width: '6px', height: '6px', background: '#4ade80', zIndex: 9999 }}
      />
    </>
  )
}