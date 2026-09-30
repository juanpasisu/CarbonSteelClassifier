/** Shared color themes for the three learning platforms (light + dark). */

export type LevelThemeId = 'basic' | 'beginner' | 'expert'

export interface LevelThemeTokens {
  accent: string
  ink: string
  soft: string
  softStrong: string
  border: string
  onAccent: string
  dangerBg: string
  dangerBorder: string
  successBg: string
}

const LIGHT: Record<LevelThemeId, LevelThemeTokens> = {
  basic: {
    accent: '#65B83F',
    ink: '#2f6b1c',
    soft: 'rgba(101, 184, 63, 0.12)',
    softStrong: 'rgba(101, 184, 63, 0.2)',
    border: '#a8d48a',
    onAccent: '#ffffff',
    dangerBg: '#fff7ed',
    dangerBorder: '#b45309',
    successBg: 'rgba(101, 184, 63, 0.16)',
  },
  beginner: {
    accent: '#169FE5',
    ink: '#0c5f8a',
    soft: 'rgba(22, 159, 229, 0.12)',
    softStrong: 'rgba(22, 159, 229, 0.2)',
    border: '#8ecfe6',
    onAccent: '#ffffff',
    dangerBg: '#fff7ed',
    dangerBorder: '#b45309',
    successBg: 'rgba(22, 159, 229, 0.16)',
  },
  expert: {
    accent: '#E7A51B',
    ink: '#8a5f0c',
    soft: 'rgba(231, 165, 27, 0.12)',
    softStrong: 'rgba(231, 165, 27, 0.2)',
    border: '#e8c08a',
    onAccent: '#ffffff',
    dangerBg: '#fff7ed',
    dangerBorder: '#b45309',
    successBg: 'rgba(231, 165, 27, 0.16)',
  },
}

const DARK: Record<LevelThemeId, LevelThemeTokens> = {
  basic: {
    accent: '#65B83F',
    ink: '#c6e8b0',
    soft: 'rgba(101, 184, 63, 0.14)',
    softStrong: 'rgba(101, 184, 63, 0.22)',
    border: 'rgba(101, 184, 63, 0.4)',
    onAccent: '#061A13',
    dangerBg: 'rgba(180, 83, 9, 0.2)',
    dangerBorder: '#fdba74',
    successBg: 'rgba(101, 184, 63, 0.18)',
  },
  beginner: {
    accent: '#3BB4F0',
    ink: '#bae6fd',
    soft: 'rgba(59, 180, 240, 0.14)',
    softStrong: 'rgba(59, 180, 240, 0.22)',
    border: 'rgba(59, 180, 240, 0.4)',
    onAccent: '#061A13',
    dangerBg: 'rgba(180, 83, 9, 0.2)',
    dangerBorder: '#fdba74',
    successBg: 'rgba(59, 180, 240, 0.18)',
  },
  expert: {
    accent: '#F0B63A',
    ink: '#fde68a',
    soft: 'rgba(240, 182, 58, 0.14)',
    softStrong: 'rgba(240, 182, 58, 0.22)',
    border: 'rgba(240, 182, 58, 0.45)',
    onAccent: '#061A13',
    dangerBg: 'rgba(180, 83, 9, 0.2)',
    dangerBorder: '#fdba74',
    successBg: 'rgba(240, 182, 58, 0.18)',
  },
}

/** @deprecated Prefer resolveLevelTheme — kept for hub card previews in light. */
export const LEVEL_THEMES = {
  basic: {
    accent: LIGHT.basic.accent,
    accentDark: LIGHT.basic.ink,
    soft: '#e3f8ec',
    softStrong: '#c8f0d8',
    border: LIGHT.basic.border,
  },
  beginner: {
    accent: LIGHT.beginner.accent,
    accentDark: LIGHT.beginner.ink,
    soft: '#e4f5fb',
    softStrong: '#c7eaf6',
    border: LIGHT.beginner.border,
  },
  expert: {
    accent: LIGHT.expert.accent,
    accentDark: LIGHT.expert.ink,
    soft: '#fff3e4',
    softStrong: '#ffe0b8',
    border: LIGHT.expert.border,
  },
} as const

export function resolveLevelTheme(
  id: LevelThemeId,
  mode: 'light' | 'dark',
): LevelThemeTokens {
  return mode === 'dark' ? DARK[id] : LIGHT[id]
}

export function hubCardColors(
  id: LevelThemeId,
  mode: 'light' | 'dark',
): { accent: string; ink: string; soft: string; softStrong: string; border: string } {
  const t = resolveLevelTheme(id, mode)
  if (mode === 'dark') {
    return {
      accent: t.accent,
      ink: t.ink,
      soft: 'var(--mv-surface)',
      softStrong: t.softStrong,
      border: t.border,
    }
  }
  return {
    accent: t.accent,
    ink: t.ink,
    soft: LEVEL_THEMES[id].soft,
    softStrong: LEVEL_THEMES[id].softStrong,
    border: t.border,
  }
}
