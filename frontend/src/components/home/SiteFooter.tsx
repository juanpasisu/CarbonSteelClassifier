import { usePreferences } from '../../i18n/PreferencesContext'

export function SiteFooter() {
  const { t } = usePreferences()

  return (
    <footer
      className="site-footer border-t"
      id="creditos"
      style={{
        background: 'var(--mv-footer-bg)',
        borderColor: 'var(--mv-footer-border)',
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p className="max-w-2xl leading-6 text-[var(--mv-text-muted)]">
          {t('footer.strip.school')}
        </p>
        <p
          className="shrink-0 text-sm font-medium"
          style={{ color: 'var(--green-primary)' }}
        >
          {t('footer.strip.bridge')}
        </p>
      </div>
      <div className="border-t" style={{ borderColor: 'var(--mv-footer-border)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-[var(--mv-text-muted)] sm:px-6 lg:px-10">
          <span>MetalVision AI</span>
          <span>{t('footer.credit')}</span>
        </div>
      </div>
    </footer>
  )
}
