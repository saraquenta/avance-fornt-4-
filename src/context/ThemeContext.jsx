import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('eame_theme')
    return saved ? saved === 'dark' : true // por defecto oscuro
  })

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('eame_theme', next ? 'dark' : 'light')
      return next
    })
  }

  // Variables CSS globales según tema
  const theme = isDark ? DARK : LIGHT

  useEffect(() => {
    const root = document.documentElement
    Object.entries(theme).forEach(([key, val]) => root.style.setProperty(key, val))
    document.body.style.background = theme['--bg-base']
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

// ─── Paleta OSCURA ────────────────────────────────────────────────────────────
export const DARK = {
  '--bg-base':        '#0f0f0f',
  '--bg-panel':       '#111111',
  '--bg-card':        '#141414',
  '--bg-card-alt':    '#1a1a1a',
  '--bg-input':       '#1a1a1a',
  '--border':         '#1f1f1f',
  '--border-soft':    '#2a2a2a',
  '--red':            '#cc0000',
  '--red-hover':      '#ee2222',
  '--red-bg':         'rgba(204,0,0,0.12)',
  '--red-glow':       'rgba(204,0,0,0.25)',
  '--text-primary':   '#ffffff',
  '--text-secondary': '#9ca3af',
  '--text-muted':     '#4b5563',
  '--text-dim':       '#6b7280',
  '--sidebar-bg':     '#0d1a0f',
  '--sidebar-border': 'rgba(201,162,39,0.2)',
  '--header-bg':      '#0d1a0f',
  '--table-head':     '#1a0000',
  '--table-even':     '#111111',
  '--table-odd':      '#141414',
  '--modal-bg':       '#111111',
  '--kpi-bg':         '#141414',
  '--chart-grid':     '#1f1f1f',
  '--tooltip-bg':     '#1a1a1a',
  '--tooltip-border': 'rgba(204,0,0,0.3)',
  '--periodo-1':      'linear-gradient(135deg,#7c3aed,#4c1d95)',
  '--periodo-2':      'linear-gradient(135deg,#1d4ed8,#1e3a8a)',
  '--periodo-3':      'linear-gradient(135deg,#0891b2,#164e63)',
  '--scatter-fill':   '#cc0000',
}

// ─── Paleta CLARA ─────────────────────────────────────────────────────────────
export const LIGHT = {
  '--bg-base':        '#f1f5f9',
  '--bg-panel':       '#ffffff',
  '--bg-card':        '#ffffff',
  '--bg-card-alt':    '#f8fafc',
  '--bg-input':       '#f1f5f9',
  '--border':         '#e2e8f0',
  '--border-soft':    '#cbd5e1',
  '--red':            '#cc0000',
  '--red-hover':      '#aa0000',
  '--red-bg':         'rgba(204,0,0,0.08)',
  '--red-glow':       'rgba(204,0,0,0.15)',
  '--text-primary':   '#0f172a',
  '--text-secondary': '#374151',
  '--text-muted':     '#64748b',
  '--text-dim':       '#94a3b8',
  '--sidebar-bg':     '#1a1a1a',
  '--sidebar-border': 'rgba(201,162,39,0.2)',
  '--header-bg':      '#1a1a1a',
  '--table-head':     '#1a0000',
  '--table-even':     '#ffffff',
  '--table-odd':      '#f8fafc',
  '--modal-bg':       '#ffffff',
  '--kpi-bg':         '#ffffff',
  '--chart-grid':     '#e2e8f0',
  '--tooltip-bg':     '#ffffff',
  '--tooltip-border': 'rgba(204,0,0,0.25)',
  '--periodo-1':      'linear-gradient(135deg,#7c3aed,#5b21b6)',
  '--periodo-2':      'linear-gradient(135deg,#2563eb,#1d4ed8)',
  '--periodo-3':      'linear-gradient(135deg,#0891b2,#0e7490)',
  '--scatter-fill':   '#cc0000',
}