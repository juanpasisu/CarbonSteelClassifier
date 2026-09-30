import { PreferenceToggles } from '../PreferenceToggles'
import { usePreferences } from '../../i18n/PreferencesContext'

export interface SiteNavLink {
  href: string
  label: string
  onNavigate?: () => void
  active?: boolean
}

interface SiteHeaderProps {
  menuOpen: boolean
  onToggleMenu: () => void
  onGoHome: () => void
  navLinks: SiteNavLink[]
}

export function SiteHeader({
  menuOpen,
  onToggleMenu,
  onGoHome,
  navLinks,
}: SiteHeaderProps) {
  const { t } = usePreferences()

  return (
    <header
      className="site-header sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        background: 'var(--mv-header-bg)',
        borderColor: 'var(--mv-header-border)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 lg:px-10">
        <button
          className="flex min-w-0 shrink items-center gap-2.5 text-left"
          onClick={onGoHome}
          type="button"
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[11px] font-bold text-white"
            style={{
              background: 'var(--green-primary)',
            }}
          >
            MV
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold text-[var(--mv-text)]">
              MetalVision AI
            </p>
            <p className="hidden truncate text-[10px] text-[var(--mv-text-muted)] sm:block">
              CarbonSteelClassifier
            </p>
          </div>
        </button>

        <nav className="hidden flex-1 items-center justify-center gap-0.5 text-[12.5px] lg:flex">
          {navLinks.map((link) => (
            <a
              className="relative rounded-md px-2 py-1.5 transition xl:px-2.5"
              href={link.href}
              key={link.href + link.label}
              onClick={(event) => {
                if (link.onNavigate) {
                  event.preventDefault()
                  link.onNavigate()
                }
              }}
              style={{
                color: link.active ? 'var(--green-primary)' : 'var(--mv-text-muted)',
              }}
            >
              {link.label}
              {link.active && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full"
                  style={{ background: 'var(--green-primary)' }}
                />
              )}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <PreferenceToggles />
          <img
            alt={t('logo.uisAlt')}
            className="hidden h-8 w-auto object-contain md:block"
            src="/branding/uis-mark.png?v=2"
          />
          <button
            aria-label={menuOpen ? t('nav.close') : t('nav.menu')}
            className="rounded-md border px-2.5 py-1.5 text-xs font-semibold lg:hidden"
            onClick={onToggleMenu}
            style={{
              borderColor: 'var(--mv-border)',
              color: 'var(--green-primary)',
              background: 'var(--mv-surface)',
            }}
            type="button"
          >
            Menu
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="border-t px-4 py-3 lg:hidden"
          style={{
            borderColor: 'var(--mv-border)',
            background: 'var(--mv-surface-muted)',
          }}
        >
          <nav className="flex flex-col gap-1 text-sm">
            {navLinks.map((link) => (
              <a
                className="rounded-md px-3 py-2"
                href={link.href}
                key={`m-${link.href}-${link.label}`}
                onClick={() => link.onNavigate?.()}
                style={{
                  color: link.active ? 'var(--green-primary)' : 'var(--mv-text-muted)',
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
