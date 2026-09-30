import { CLASS_SAMPLE_SRC } from '../../lib/sampleImages'
import { usePreferences } from '../../i18n/PreferencesContext'

const GALLERY: Array<{ slug: string; nameEs: string; nameEn: string }> = [
  { slug: 'ferrita', nameEs: 'Ferrita', nameEn: 'Ferrite' },
  { slug: 'perlita', nameEs: 'Perlita', nameEn: 'Pearlite' },
  { slug: 'cementita-perlita', nameEs: 'Cementita + Perlita', nameEn: 'Cementite + Pearlite' },
  {
    slug: 'perlita-ferrita-widmanstatten',
    nameEs: 'Perlita + Ferrita Widmanstätten',
    nameEn: 'Pearlite + Widmanstätten ferrite',
  },
  {
    slug: 'perlita-ferrita-equiaxial',
    nameEs: 'Perlita + Ferrita equiaxial',
    nameEn: 'Pearlite + equiaxed ferrite',
  },
  { slug: 'austenita', nameEs: 'Austenita', nameEn: 'Austenite' },
  { slug: 'martensita', nameEs: 'Martensita', nameEn: 'Martensite' },
]

interface MicrostructureGalleryProps {
  note?: string
}

/** Horizontal catalog of real training classes — theme-independent images. */
export function MicrostructureGallery({ note }: MicrostructureGalleryProps) {
  const { t, locale } = usePreferences()

  return (
    <section
      className="border-y py-14"
      id="microestructuras"
      style={{
        background: 'var(--mv-surface)',
        borderColor: 'var(--mv-border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--green-primary)' }}
            >
              {t('classes.title')}
            </p>
            <h2 className="mt-2 font-display text-2xl font-normal leading-tight text-[var(--mv-text)] sm:text-3xl">
              {t('classes.question')}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--mv-text-muted)]">
              {t('classes.subtitle')}
            </p>
          </div>
          {note && (
            <aside
              className="max-w-sm rounded-xl border px-4 py-3 text-[12.5px] leading-5 text-[var(--mv-text-muted)]"
              style={{
                borderColor: 'var(--mv-border)',
                background: 'var(--mv-surface-muted)',
              }}
            >
              {note}
            </aside>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:gap-4">
          {GALLERY.map((item) => {
            const label = locale === 'en' ? item.nameEn : item.nameEs
            const src = CLASS_SAMPLE_SRC[item.slug] ?? '/samples/demo-perlita.png'
            return (
              <figure
                className="mv-micrograph flex h-full flex-col overflow-hidden rounded-[10px] border"
                key={item.slug}
                style={{
                  borderColor: 'var(--mv-border)',
                  background: 'var(--mv-surface)',
                }}
              >
                <div
                  className="aspect-square shrink-0 overflow-hidden"
                  style={{ background: 'var(--mv-micro-frame)' }}
                >
                  <img
                    alt={`${label}, 500×`}
                    className="h-full w-full object-cover"
                    decoding="async"
                    loading="lazy"
                    src={src}
                    style={{ filter: 'none' }}
                  />
                </div>
                <figcaption className="flex min-h-[3.75rem] flex-1 flex-col justify-center border-t px-2 py-2 text-center leading-snug"
                  style={{
                    borderColor: 'var(--mv-border)',
                    background: 'var(--mv-surface)',
                  }}
                >
                  <span className="block text-[11px] font-medium text-[var(--mv-text)]">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-[var(--mv-text-muted)]">
                    500×
                  </span>
                </figcaption>
                <div
                  aria-hidden
                  className="h-2.5 shrink-0"
                  style={{ background: 'var(--mv-micro-frame)' }}
                />
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
