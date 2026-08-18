/**
 * Color and theme utilities for Three.js scenes.
 */

export interface ThemeColors {
  isDark: boolean;
  background: number;
  grid: number;
  android: number;
  androidGlow: number;
  ios: number;
  iosGlow: number;
  accent: number;
  accentGlow: number;
  warn: number;
  done: number;
  textPrimary: string;
  textSecondary: string;
  cardBg: number;
  cardBorder: number;
}

export function get3DThemeColors(): ThemeColors {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  if (isDark) {
    return {
      isDark: true,
      background: 0x0b1120,
      grid: 0x1e293b,
      android: 0x22c55e, // Emerald/Green
      androidGlow: 0x4ade80,
      ios: 0x38bdf8, // Sky Blue
      iosGlow: 0x7dd3fc,
      accent: 0x14b8a6, // Teal
      accentGlow: 0x5eead4,
      warn: 0xfbbf24,
      done: 0x34d399,
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      cardBg: 0x111827,
      cardBorder: 0x334155,
    };
  }

  return {
    isDark: false,
    background: 0xf8fafc,
    grid: 0xe2e8f0,
    android: 0x16a34a,
    androidGlow: 0x22c55e,
    ios: 0x0284c7,
    iosGlow: 0x38bdf8,
    accent: 0x0d9488,
    accentGlow: 0x14b8a6,
    warn: 0xd97706,
    done: 0x059669,
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    cardBg: 0xffffff,
    cardBorder: 0xcbd5e1,
  };
}
