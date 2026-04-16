import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Lock, Eye, EyeOff, Shield } from 'lucide-react'

// PALETA: negro #0a0a0a, rojo #cc0000, plomo #4b5563 / #9ca3af

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [focusUser, setFocusUser] = useState(false)
  const [focusPass, setFocusPass] = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()
  const canvasRef = useRef(null)

  // Partículas de fondo
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1,
    }))

    let animId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(204,0,0,${p.alpha})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      // Líneas entre partículas cercanas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y)
          if (dist < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(204,0,0,${0.08 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const userData = await login(username, password)
      // Redirigir según rol
      const rol = (userData?.rol || '').toUpperCase()
      if (rol === 'COMANDANTE') navigate('/comandante')
      else navigate('/dashboard')
    } catch {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#0a0a0a', overflow: 'hidden' }}>

      {/* Canvas fondo */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Gradiente radial fondo */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(204,0,0,0.08) 0%, transparent 65%)',
      }} />

      {/* Tarjeta login */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '20px',
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(15,15,15,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(204,0,0,0.3)',
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 0 60px rgba(204,0,0,0.15), 0 25px 50px rgba(0,0,0,0.6)',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '2px solid #cc0000',
              background: 'rgba(204,0,0,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 0 20px rgba(204,0,0,0.25)',
            }}>
              <Shield size={28} color="#cc0000" />
            </div>
            <h1 style={{
              fontSize: 18, fontWeight: 700, color: 'white',
              letterSpacing: '0.08em', marginBottom: 6,
            }}>
              SISTEMA DE EVALUACIÓN
            </h1>
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #cc0000, transparent)', margin: '8px auto', width: 120 }} />
            <p style={{ fontSize: 11, color: '#cc0000', letterSpacing: '0.15em', marginBottom: 2 }}>
              EAME · EJÉRCITO DE BOLIVIA
            </p>
            <p style={{ fontSize: 10, color: '#4b5563', letterSpacing: '0.05em' }}>
              CNL. Eulogio Ruiz Paz
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Usuario */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#cc0000', marginBottom: 6, letterSpacing: '0.15em' }}>
                USUARIO
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <User size={15} color={focusUser ? '#cc0000' : '#4b5563'} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setFocusUser(true)}
                  onBlur={() => setFocusUser(false)}
                  placeholder="Ingresa tu usuario"
                  required
                  style={{
                    width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                    borderRadius: 10, fontSize: 13, color: 'white',
                    background: 'rgba(255,255,255,0.04)',
                    border: focusUser ? '1px solid #cc0000' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: focusUser ? '0 0 12px rgba(204,0,0,0.2)' : 'none',
                    outline: 'none', transition: 'all 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#cc0000', marginBottom: 6, letterSpacing: '0.15em' }}>
                CONTRASEÑA
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <Lock size={15} color={focusPass ? '#cc0000' : '#4b5563'} />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusPass(true)}
                  onBlur={() => setFocusPass(false)}
                  placeholder="Ingresa tu contraseña"
                  required
                  style={{
                    width: '100%', paddingLeft: 38, paddingRight: 42, paddingTop: 11, paddingBottom: 11,
                    borderRadius: 10, fontSize: 13, color: 'white',
                    background: 'rgba(255,255,255,0.04)',
                    border: focusPass ? '1px solid #cc0000' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: focusPass ? '0 0 12px rgba(204,0,0,0.2)' : 'none',
                    outline: 'none', transition: 'all 0.2s',
                  }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass
                    ? <EyeOff size={15} color={showPass ? '#cc0000' : '#4b5563'} />
                    : <Eye size={15} color="#4b5563" />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, fontSize: 12,
                background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.35)',
                color: '#ff6666',
              }}>
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                borderRadius: 10, fontSize: 13, fontWeight: 700,
                letterSpacing: '0.15em', color: 'white',
                background: loading
                  ? 'rgba(100,0,0,0.5)'
                  : 'linear-gradient(135deg, #cc0000, #990000)',
                border: '1px solid #cc000066',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 20px rgba(204,0,0,0.35)',
                transition: 'all 0.2s',
                marginTop: 4,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
                    <path fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Verificando...
                </span>
              ) : 'INGRESAR AL SISTEMA'}
            </button>

            {/* Volver */}
            <div style={{ textAlign: 'center' }}>
              <span onClick={() => navigate('/')}
                style={{ fontSize: 11, color: '#6b7280', cursor: 'pointer', letterSpacing: '0.05em' }}>
                ← Volver al inicio
              </span>
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: 10, color: '#374151', marginTop: 20 }}>
            Gestión Académica Operativa · UNIFRANZ 2026
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        input::placeholder { color: #374151; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #111 inset !important; -webkit-text-fill-color: white !important; }
      `}</style>
    </div>
  )
}