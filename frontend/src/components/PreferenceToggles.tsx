import { usePreferences } from '../i18n/PreferencesContext'

export function PreferenceToggles() {
  const { locale, theme, toggleLocale, toggleTheme, t } = usePreferences()

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
        className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
        onClick={toggleTheme}
        style={{
          borderColor: 'var(--mv-border)',
          background: 'var(--mv-surface)',
          color: 'var(--mv-accent)',
        }}
        title={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
        type="button"
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
      <button
        aria-label={locale === 'es' ? t('lang.toEnglish') : t('lang.toSpanish')}
        className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
        onClick={toggleLocale}
        style={{
          borderColor: 'var(--mv-border)',
          background: 'var(--mv-surface)',
          color: 'var(--mv-accent)',
        }}
        title={locale === 'es' ? t('lang.toEnglish') : t('lang.toSpanish')}
        type="button"
      >
        {locale === 'es' ? 'EN' : 'ES'}
      </button>
    </div>
  )
}
