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
    accent: '#2bb673',
    ink: '#146b43',
    soft: 'rgba(43, 182, 115, 0.12)',
    softStrong: 'rgba(43, 182, 115, 0.22)',
    border: '#8fd9b0',
    onAccent: '#ffffff',
    dangerBg: '#fff7ed',
    dangerBorder: '#b45309',
    successBg: 'rgba(43, 182, 115, 0.16)',
  },
  beginner: {
    accent: '#2f9bc8',
    ink: '#17648a',
    soft: 'rgba(47, 155, 200, 0.12)',
    softStrong: 'rgba(47, 155, 200, 0.22)',
    border: '#8ecfe6',
    onAccent: '#ffffff',
    dangerBg: '#fff7ed',
    dangerBorder: '#b45309',
    successBg: 'rgba(47, 155, 200, 0.16)',
  },
  expert: {
    accent: '#d18a2f',
    ink: '#8a5410',
    soft: 'rgba(209, 138, 47, 0.12)',
    softStrong: 'rgba(209, 138, 47, 0.22)',
    border: '#e8c08a',
    onAccent: '#ffffff',
    dangerBg: '#fff7ed',
    dangerBorder: '#b45309',
    successBg: 'rgba(209, 138, 47, 0.16)',
  },
}

const DARK: Record<LevelThemeId, LevelThemeTokens> = {
  basic: {
    accent: '#34d399',
    ink: '#a7f3d0',
    soft: 'rgba(52, 211, 153, 0.12)',
    softStrong: 'rgba(52, 211, 153, 0.2)',
    border: 'rgba(52, 211, 153, 0.4)',
    onAccent: '#052e16',
    dangerBg: 'rgba(180, 83, 9, 0.2)',
    dangerBorder: '#fdba74',
    successBg: 'rgba(52, 211, 153, 0.18)',
  },
  beginner: {
    accent: '#38bdf8',
    ink: '#bae6fd',
    soft: 'rgba(56, 189, 248, 0.12)',
    softStrong: 'rgba(56, 189, 248, 0.2)',
    border: 'rgba(56, 189, 248, 0.4)',
    onAccent: '#0c4a6e',
    dangerBg: 'rgba(180, 83, 9, 0.2)',
    dangerBorder: '#fdba74',
    successBg: 'rgba(56, 189, 248, 0.18)',
  },
  expert: {
    accent: '#f0b45a',
    ink: '#fde68a',
    soft: 'rgba(240, 180, 90, 0.12)',
    softStrong: 'rgba(240, 180, 90, 0.2)',
    border: 'rgba(240, 180, 90, 0.4)',
    onAccent: '#451a03',
    dangerBg: 'rgba(180, 83, 9, 0.2)',
    dangerBorder: '#fdba74',
    successBg: 'rgba(240, 180, 90, 0.18)',
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
