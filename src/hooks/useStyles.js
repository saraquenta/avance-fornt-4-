// useStyles — devuelve objetos de estilo reutilizables según el tema activo
// Uso: const S = useStyles()  →  style={S.card}

import { useTheme } from '../context/ThemeContext'

export function useStyles() {
  const { isDark } = useTheme()

  return {
    // Contenedores
    page: {
      padding: 28,
      minHeight: '100vh',
      background: isDark ? '#0f0f0f' : '#f1f5f9',
    },
    card: {
      background:   isDark ? '#141414' : '#ffffff',
      border:       `1px solid ${isDark ? '#1f1f1f' : '#e2e8f0'}`,
      borderRadius: 12,
      boxShadow:    isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 6px rgba(0,0,0,0.07)',
    },
    cardAlt: {
      background:   isDark ? '#1a1a1a' : '#f8fafc',
      border:       `1px solid ${isDark ? '#2a2a2a' : '#e2e8f0'}`,
      borderRadius: 10,
    },
    modal: {
      background:   isDark ? '#111111' : '#ffffff',
      border:       `1px solid ${isDark ? 'rgba(204,0,0,0.3)' : 'rgba(204,0,0,0.2)'}`,
      borderRadius: 16,
      boxShadow:    isDark ? '0 0 60px rgba(204,0,0,0.12)' : '0 20px 60px rgba(0,0,0,0.12)',
    },
    // Tabla
    tableHead: {
      background: '#1a0000',
    },
    tableRowEven: {
      background: isDark ? '#111111' : '#ffffff',
      borderBottom: `1px solid ${isDark ? '#1f1f1f' : '#f1f5f9'}`,
    },
    tableRowOdd: {
      background: isDark ? '#141414' : '#f8fafc',
      borderBottom: `1px solid ${isDark ? '#1f1f1f' : '#f1f5f9'}`,
    },
    // Texto
    textPrimary:   { color: isDark ? '#ffffff' : '#0f172a' },
    textSecondary: { color: isDark ? '#9ca3af' : '#374151' },
    textMuted:     { color: isDark ? '#4b5563' : '#64748b' },
    textDim:       { color: isDark ? '#6b7280' : '#94a3b8' },
    // Inputs
    input: {
      background:   isDark ? '#1a1a1a' : '#f8fafc',
      border:       `1px solid ${isDark ? '#2a2a2a' : '#e2e8f0'}`,
      color:        isDark ? '#ffffff' : '#0f172a',
      borderRadius: 9,
      fontSize:     13,
      outline:      'none',
      padding:      '9px 12px',
      width:        '100%',
    },
    inputPl: (pl = 36) => ({
      background:   isDark ? '#1a1a1a' : '#f8fafc',
      border:       `1px solid ${isDark ? '#2a2a2a' : '#e2e8f0'}`,
      color:        isDark ? '#ffffff' : '#0f172a',
      borderRadius: 9,
      fontSize:     13,
      outline:      'none',
      paddingLeft:  pl,
      paddingRight: 12,
      paddingTop:   9,
      paddingBottom: 9,
      width:        '100%',
    }),
    select: {
      background:   isDark ? '#1a1a1a' : '#f8fafc',
      border:       `1px solid ${isDark ? '#2a2a2a' : '#e2e8f0'}`,
      color:        isDark ? '#ffffff' : '#0f172a',
      borderRadius: 9,
      fontSize:     13,
      outline:      'none',
      padding:      '9px 14px',
    },
    // Barra de progreso (fondo)
    progressBg: {
      background: isDark ? '#1f1f1f' : '#e2e8f0',
    },
    // Gráficos recharts
    tooltipStyle: {
      background:   isDark ? '#1a1a1a' : '#ffffff',
      border:       `1px solid ${isDark ? 'rgba(204,0,0,0.3)' : 'rgba(204,0,0,0.2)'}`,
      borderRadius: 8,
      fontSize:     11,
      color:        isDark ? '#ffffff' : '#0f172a',
      boxShadow:    isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
    },
    gridColor:  isDark ? '#1f1f1f' : '#e2e8f0',
    tickColor:  isDark ? '#4b5563' : '#64748b',
    // Botón rojo primario
    btnRed: {
      padding:      '9px 22px',
      borderRadius: 9,
      fontSize:     13,
      fontWeight:   600,
      color:        'white',
      background:   '#cc0000',
      border:       'none',
      cursor:       'pointer',
      display:      'flex',
      alignItems:   'center',
      gap:          6,
      boxShadow:    '0 4px 14px rgba(204,0,0,0.35)',
    },
    btnGhost: {
      padding:      '9px 16px',
      borderRadius: 9,
      fontSize:     12,
      fontWeight:   600,
      color:        '#cc0000',
      background:   isDark ? 'rgba(204,0,0,0.1)' : 'rgba(204,0,0,0.07)',
      border:       `1px solid ${isDark ? 'rgba(204,0,0,0.25)' : 'rgba(204,0,0,0.2)'}`,
      cursor:       'pointer',
      display:      'flex',
      alignItems:   'center',
      gap:          5,
    },
    // Header de sección en tabla
    tableHeaderBar: {
      padding:      '12px 20px',
      background:   '#1a0000',
      borderBottom: `1px solid rgba(204,0,0,0.15)`,
    },
    // Label de sección
    sectionLabel: {
      fontSize:      11,
      fontWeight:    700,
      color:         '#cc0000',
      letterSpacing: '0.1em',
      marginBottom:  10,
    },
    // Overlay modal
    modalOverlay: {
      position:        'fixed',
      inset:           0,
      zIndex:          50,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      background:      'rgba(0,0,0,0.82)',
      backdropFilter:  'blur(6px)',
    },
    // KPI card interna
    kpiInner: (color) => ({
      width:          42,
      height:         42,
      borderRadius:   10,
      background:     `${color}18`,
      border:         `1px solid ${color}33`,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
    }),
    // Bool: oscuro o no
    isDark,
  }
}