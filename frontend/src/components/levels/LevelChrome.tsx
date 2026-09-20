import type { CSSProperties, ReactNode } from 'react'

import { usePreferences } from '../../i18n/PreferencesContext'
import {
  resolveLevelTheme,
  type LevelThemeId,
  type LevelThemeTokens,
} from '../../lib/levelThemes'

export function useLevelTheme(id: LevelThemeId): LevelThemeTokens {
  const { theme } = usePreferences()
  return resolveLevelTheme(id, theme)
}

export function LevelShell({
  id,
  children,
}: {
  id: LevelThemeId
  children: ReactNode
}) {
  const tokens = useLevelTheme(id)
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-12"
      id="nivel-activo"
      style={{
        background: `linear-gradient(180deg, ${tokens.soft} 0%, transparent 36%)`,
      }}
    >
      {children}
    </section>
  )
}

export function LevelChrome({
  id,
  badge,
  title,
  hint,
  onBack,
  trailing,
}: {
  id: LevelThemeId
  badge: string
  title: string
  hint: string
  onBack: () => void
  trailing?: ReactNode
}) {
  const { t } = usePreferences()
  const tokens = useLevelTheme(id)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: tokens.accent }}
          >
            {badge}
          </p>
          <button
            className="shrink-0 rounded-md border px-3 py-2 text-sm font-semibold sm:hidden"
            onClick={onBack}
            style={{ borderColor: tokens.border, color: tokens.accent }}
            type="button"
          >
            {t('levels.back')}
          </button>
        </div>
        <h2
          className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl"
          style={{ color: tokens.accent }}
        >
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 mv-text-muted">{hint}</p>
      </div>
      <div className="flex flex-col items-stretch gap-3 sm:items-end">
        <button
          className="hidden rounded-md border px-3 py-2 text-sm font-semibold sm:inline-flex"
          onClick={onBack}
          style={{ borderColor: tokens.border, color: tokens.accent }}
          type="button"
        >
          {t('levels.back')}
        </button>
        {trailing}
      </div>
    </div>
  )
}

export function LevelTab({
  id,
  active,
  onClick,
  children,
}: {
  id: LevelThemeId
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  const tokens = useLevelTheme(id)
  const style: CSSProperties = active
    ? {
        background: tokens.accent,
        color: tokens.onAccent,
        borderColor: tokens.accent,
      }
    : {
        background: 'var(--mv-surface)',
        color: tokens.ink,
        borderColor: 'var(--mv-border)',
      }

  return (
    <button
      className="rounded-md border px-3 py-2 text-sm font-semibold transition sm:px-4"
      onClick={onClick}
      style={style}
      type="button"
    >
      {children}
    </button>
  )
}

export function LevelChip({
  id,
  active,
  onClick,
  children,
}: {
  id: LevelThemeId
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  const tokens = useLevelTheme(id)
  const style: CSSProperties = active
    ? {
        background: tokens.accent,
        color: tokens.onAccent,
        borderColor: tokens.accent,
      }
    : {
        background: 'var(--mv-surface)',
        color: tokens.ink,
        borderColor: 'var(--mv-border)',
      }

  return (
    <button
      className="shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold transition"
      onClick={onClick}
      style={style}
      type="button"
    >
      {children}
    </button>
  )
}

export function LevelPrimaryButton({
  id,
  onClick,
  children,
  disabled,
  className = '',
}: {
  id: LevelThemeId
  onClick: () => void
  children: ReactNode
  disabled?: boolean
  className?: string
}) {
  const tokens = useLevelTheme(id)
  return (
    <button
      className={`rounded-md px-4 py-3 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={disabled}
      onClick={onClick}
      style={{ background: tokens.accent, color: tokens.onAccent }}
      type="button"
    >
      {children}
    </button>
  )
}
