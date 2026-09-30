import { usePreferences } from '../i18n/PreferencesContext'

function SunIcon() {
  return (
    <svg aria-hidden className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.2 3.2l.85.85M12 12l.85.85M12.85 3.2l-.85.85M3.95 12l-.85.85"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg aria-hidden className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
      <path
        d="M13.2 9.1A5.5 5.5 0 0 1 6.9 2.8 5.6 5.6 0 1 0 13.2 9.1Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function PreferenceToggles() {
  const { locale, theme, toggleLocale, toggleTheme, t } = usePreferences()

  const chipStyle = {
    borderColor: 'var(--mv-border)',
    background: 'var(--mv-surface)',
    color: 'var(--mv-text)',
  } as const

  return (
    <div className="flex items-center gap-1.5">
      <button
        aria-label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
        className="mv-btn inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold"
        onClick={toggleTheme}
        style={{
          ...chipStyle,
          borderColor:
            theme === 'dark'
              ? 'color-mix(in srgb, var(--green-primary) 55%, transparent)'
              : 'var(--mv-border)',
          color: 'var(--green-primary)',
        }}
        title={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
        type="button"
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
      <button
        aria-label={locale === 'es' ? t('lang.toEnglish') : t('lang.toSpanish')}
        className="mv-btn rounded-md border px-2.5 py-1.5 text-[11px] font-semibold"
        onClick={toggleLocale}
        style={chipStyle}
        title={locale === 'es' ? t('lang.toEnglish') : t('lang.toSpanish')}
        type="button"
      >
        {locale === 'es' ? 'EN' : 'ES'}
      </button>
    </div>
  )
}
