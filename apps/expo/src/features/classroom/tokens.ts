/**
 * 课堂播放器设计 Token。
 * 精确匹配 Web 端 open.maic.chat 的视觉规范。
 */

// ============ Colors ============
export const colors = {
  // Primary
  primary: '#722ed1',
  primaryLight: '#8b47ea',
  primaryDark: '#5b21b6',

  // Background
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundTertiary: '#f1f5f9',

  // Foreground
  foreground: '#242424',
  foregroundSecondary: '#64748b',
  foregroundTertiary: '#94a3b8',

  // Border
  border: '#e5e7eb',
  borderLight: 'rgba(0,0,0,0.06)',

  // Purple palette
  purple50: '#faf5ff',
  purple100: '#f3e8ff',
  purple200: '#e9d5ff',
  purple400: '#c084fc',
  purple500: '#a855f7',
  purple600: '#9333ea',

  // Violet palette
  violet50: '#f5f3ff',
  violet100: '#ede9fe',
  violet200: '#ddd6fe',
  violet400: '#a78bfa',
  violet500: '#8b5cf6',
  violet600: '#7c3aed',
  violet700: '#6d28d9',

  // Slate palette
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Chat bubbles
  bubbleTeacher: '#ffffff',
  bubbleUser: 'rgba(114,46,209,0.95)',
  bubbleStudent: '#eef2ff',
  bubbleAssistant: '#f8fafc',
} as const;

// ============ Typography ============
export const typography = {
  // Font families
  fontFamily: {
    sans: 'Inter',
    mono: 'monospace',
  },

  // Font sizes
  fontSize: {
    xs: 10,
    sm: 11,
    base: 12,
    md: 13,
    lg: 14,
    xl: 15,
    '2xl': 16,
    '3xl': 20,
    '4xl': 24,
  },

  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
    ultraWide: 0.14,
  },
} as const;

// ============ Spacing ============
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ============ Border Radius ============
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
  '2xl': 12,
  '3xl': 16,
  '4xl': 20,
  '5xl': 24,
  full: 9999,
} as const;

// ============ Shadows ============
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  purple: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

// ============ Layout ============
export const layout = {
  // Panel sizes
  sidebar: {
    default: 220,
    min: 160,
    max: 320,
  },
  chat: {
    default: 340,
    min: 280,
    max: 480,
  },

  // Header
  header: {
    height: 48,
  },

  // Toolbar
  toolbar: {
    height: 36,
  },

  // Roundtable
  roundtable: {
    height: 140,
  },

  // Slide
  slide: {
    viewportSize: 1000,
    viewportRatio: 0.5625, // 16:9
  },
} as const;

// ============ Animation ============
export const animation = {
  // Duration
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 400,
  },

  // Easing
  easing: {
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',
    spring: { tension: 50, friction: 7 },
  },
} as const;
