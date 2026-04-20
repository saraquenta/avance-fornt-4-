import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ size = 'md' }) {
  const { isDark, toggleTheme } = useTheme()

  const isSmall = size === 'sm'

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isSmall ? 5 : 7,
        padding: isSmall ? '5px 11px' : '7px 14px',
        borderRadius: 20,
        border: `1px solid ${isDark ? 'rgba(201,162,39,0.35)' : 'rgba(204,0,0,0.3)'}`,
        background: isDark ? 'rgba(201,162,39,0.1)' : 'rgba(204,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        flexShrink: 0,
      }}
    >
      {/* Track */}
      <div style={{
        width: isSmall ? 32 : 38,
        height: isSmall ? 18 : 22,
        borderRadius: 999,
        background: isDark ? '#1f1f1f' : '#e2e8f0',
        border: `1.5px solid ${isDark ? '#2a2a2a' : '#cbd5e1'}`,
        position: 'relative',
        transition: 'background 0.3s',
        flexShrink: 0,
      }}>
        {/* Knob */}
        <div style={{
          position: 'absolute',
          top: '50%',
          transform: `translateY(-50%) translateX(${isDark ? (isSmall ? '13px' : '16px') : '1px'})`,
          width: isSmall ? 12 : 16,
          height: isSmall ? 12 : 16,
          borderRadius: '50%',
          background: isDark ? '#c9a227' : '#cc0000',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), background 0.3s',
          boxShadow: isDark ? '0 0 6px rgba(201,162,39,0.5)' : '0 0 6px rgba(204,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isDark
            ? <Moon size={isSmall ? 7 : 9} color="#0f0f0f" />
            : <Sun  size={isSmall ? 7 : 9} color="white"   />
          }
        </div>
      </div>

      {/* Label */}
      <span style={{
        fontSize: isSmall ? 10 : 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: isDark ? '#c9a227' : '#cc0000',
        transition: 'color 0.3s',
        whiteSpace: 'nowrap',
      }}>
        {isDark ? 'OSCURO' : 'CLARO'}
      </span>
    </button>
  )
}