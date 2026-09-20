import { useEffect, useState } from 'react'

import type { BatchAnalysisItem } from './components/BatchResults'
import { PreferenceToggles } from './components/PreferenceToggles'
import { BasicLevel } from './components/levels/BasicLevel'
import { BeginnerLevel } from './components/levels/BeginnerLevel'
import { ExpertLevel } from './components/levels/ExpertLevel'
import { LevelHub } from './components/levels/LevelHub'
import { usePreferences } from './i18n/PreferencesContext'
import {
  fetchMicrostructureClasses,
  predictMicrostructure,
  toUserFacingError,
  type MicrostructureClass,
} from './lib/api'
import type { LevelId } from './lib/learningContent'
import { CLASS_SAMPLE_SRC } from './lib/sampleImages'

function App() {
  const { t, locale, className, classDescription } = usePreferences()
  const [classes, setClasses] = useState<MicrostructureClass[]>([])
  const [classesError, setClassesError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progressLabel, setProgressLabel] = useState('')
  const [analyzeError, setAnalyzeError] = useState('')
  const [batchItems, setBatchItems] = useState<BatchAnalysisItem[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [expandedClass, setExpandedClass] = useState<string | null>(null)
  const [activeLevel, setActiveLevel] = useState<LevelId | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void fetchMicrostructureClasses(controller.signal)
      .then(setClasses)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        setClassesError(toUserFacingError(error, locale))
      })

    return () => controller.abort()
  }, [locale, t])

  useEffect(() => {
    return () => {
      for (const item of batchItems) {
        URL.revokeObjectURL(item.previewUrl)
      }
    }
  }, [batchItems])

  function clearBatch() {
    setAnalyzeError('')
    setBatchItems((current) => {
      for (const item of current) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return []
    })
  }

  function openLevel(level: LevelId) {
    setActiveLevel(level)
    window.requestAnimationFrame(() => {
      document.getElementById('nivel-activo')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  function backToLevels() {
    clearBatch()
    setActiveLevel(null)
    window.requestAnimationFrame(() => {
      document.getElementById('niveles')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  async function handleAnalyze(files: File[]) {
    setLoading(true)
    setAnalyzeError('')
    setProgressLabel('')

    setBatchItems((current) => {
      for (const item of current) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return []
    })

    const orderedFiles = [...files]
    const nextItems: BatchAnalysisItem[] = []

    try {
      for (let index = 0; index < orderedFiles.length; index += 1) {
        const file = orderedFiles[index]
        setProgressLabel(
          t('progress.analyzing', {
            current: index + 1,
            total: orderedFiles.length,
          }),
        )
        const previewUrl = URL.createObjectURL(file)

        try {
          const prediction = await predictMicrostructure(file)
          nextItems.push({
            fileName: file.name,
            previewUrl,
            prediction,
          })
        } catch (error: unknown) {
          nextItems.push({
            fileName: file.name,
            previewUrl,
            error: toUserFacingError(error, locale),
          })
        }
      }

      setBatchItems(nextItems)

      const failures = nextItems.filter((item) => item.error).length
      if (failures > 0 && failures === nextItems.length) {
        setAnalyzeError(t('error.allFailed'))
      } else if (failures > 0) {
        setAnalyzeError(t('error.someFailed', { count: failures }))
      }

      window.requestAnimationFrame(() => {
        document.getElementById('resultado')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    } finally {
      setLoading(false)
      setProgressLabel('')
    }
  }

  const navLinks = [
    { href: '#niveles', label: t('nav.levels') },
    { href: '#microestructuras', label: t('nav.microstructures') },
    { href: '#como-funciona', label: t('nav.howItWorks') },
    { href: '#sobre-el-proyecto', label: t('nav.about') },
  ]

  const steps = [
    { title: t('how.s1.title'), description: t('how.s1.desc') },
    { title: t('how.s2.title'), description: t('how.s2.desc') },
    { title: t('how.s3.title'), description: t('how.s3.desc') },
  ]

  const aboutPills = [
    t('about.pill1'),
    t('about.pill2'),
    t('about.pill3'),
    t('about.pill4'),
    t('about.pill5'),
  ]

  return (
    <main className="min-h-screen" style={{ background: 'var(--mv-bg)' }}>
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'var(--mv-surface)',
          borderColor: 'var(--mv-border)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-12">
          <button
            className="flex min-w-0 shrink items-center gap-2 text-left sm:gap-3"
            onClick={() => {
              setActiveLevel(null)
              window.requestAnimationFrame(() => {
                document.getElementById('niveles')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              })
            }}
            type="button"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#0b1f17] text-sm font-bold text-white sm:h-10 sm:w-10">
              MV
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold" style={{ color: 'var(--mv-accent)' }}>
                MetalVision AI
              </p>
              <p className="hidden text-xs mv-text-muted sm:block">
                CarbonSteelClassifier
              </p>
            </div>
          </button>

          <nav
            className="hidden flex-1 items-center justify-center gap-5 text-sm xl:flex"
            style={{ color: 'var(--mv-text-muted)' }}
          >
            {navLinks.map((link) => (
              <a
                className="transition hover:opacity-70"
                href={link.href}
                key={link.href}
                onClick={() => {
                  if (link.href === '#niveles') {
                    setActiveLevel(null)
                  }
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <PreferenceToggles />
            <div className="hidden items-center gap-2 lg:flex">
              <img
                alt={t('logo.uisAlt')}
                className="h-11 w-auto object-contain"
                src="/branding/uis-mark.png?v=2"
              />
              <img
                alt={t('logo.alt')}
                className="h-12 w-12 object-contain"
                src="/branding/eimcm-logo.png?v=4"
              />
            </div>
            <button
              aria-label={menuOpen ? t('nav.close') : t('nav.menu')}
              className="rounded-md border px-2.5 py-1.5 text-xs font-semibold xl:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              style={{
                borderColor: 'var(--mv-border)',
                color: 'var(--mv-accent)',
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
            className="border-t px-6 py-3 xl:hidden"
            style={{
              borderColor: 'var(--mv-border)',
              background: 'var(--mv-surface-muted)',
            }}
          >
            <nav className="flex flex-col gap-3 text-sm">
              {navLinks.map((link) => (
                <a
                  href={link.href}
                  key={link.href}
                  onClick={() => {
                    if (link.href === '#niveles') {
                      setActiveLevel(null)
                    }
                    setMenuOpen(false)
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {!activeLevel && <LevelHub onSelect={openLevel} />}

      {activeLevel === 'basic' && <BasicLevel onBack={backToLevels} />}
      {activeLevel === 'beginner' && (
        <BeginnerLevel classes={classes} onBack={backToLevels} />
      )}
      {activeLevel === 'expert' && (
        <ExpertLevel
          analyzeError={analyzeError}
          batchItems={batchItems}
          classes={classes}
          loading={loading}
          onAnalyze={(files) => {
            void handleAnalyze(files)
          }}
          onBack={backToLevels}
          onClearResult={clearBatch}
          progressLabel={progressLabel}
        />
      )}

      <section
        className="border-y py-16"
        id="microestructuras"
        style={{
          background: 'var(--mv-surface)',
          borderColor: 'var(--mv-border)',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--mv-accent)' }}
          >
            {t('classes.title')}
          </p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold leading-tight sm:text-3xl">
            {t('classes.question')}
          </h2>
          <p className="mt-3 max-w-2xl mv-text-muted">{t('classes.subtitle')}</p>

          {classesError ? (
            <p className="mt-6 text-sm text-rose-600">{classesError}</p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {classes.map((item) => {
                const expanded = expandedClass === item.slug
                const description = classDescription(
                  item.slug,
                  item.scientific_description,
                )
                return (
                  <article
                    className="flex flex-col overflow-hidden rounded-xl border transition hover:-translate-y-0.5"
                    key={item.slug}
                    style={{
                      background: 'var(--mv-bg)',
                      borderColor: 'var(--mv-border)',
                    }}
                  >
                    <span
                      className="block aspect-square w-full overflow-hidden"
                      style={{ background: '#0b1f17' }}
                    >
                      <img
                        alt={className(item.name)}
                        className="h-full w-full object-contain"
                        decoding="async"
                        src={
                          CLASS_SAMPLE_SRC[item.slug] ??
                          '/samples/demo-perlita.png'
                        }
                      />
                    </span>
                    <div className="flex flex-1 flex-col px-4 py-3">
                      <h3
                        className="font-semibold"
                        style={{ color: 'var(--mv-accent)' }}
                      >
                        {className(item.name)}
                      </h3>
                      <p
                        className={`mt-2 text-xs leading-5 mv-text-muted ${
                          expanded ? '' : 'line-clamp-3'
                        }`}
                      >
                        {description}
                      </p>
                      <button
                        className="mt-2 self-start text-xs font-semibold underline-offset-2 hover:underline"
                        onClick={() =>
                          setExpandedClass(expanded ? null : item.slug)
                        }
                        style={{ color: 'var(--mv-accent)' }}
                        type="button"
                      >
                        {expanded ? t('classes.seeLess') : t('classes.seeMore')}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-12" id="como-funciona">
        <h2 className="text-2xl font-semibold sm:text-3xl" style={{ color: 'var(--mv-accent)' }}>
          {t('how.title')}
        </h2>
        <p className="mt-2 mv-text-muted">{t('how.subtitle')}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              className="relative rounded-xl border p-5"
              key={step.title}
              style={{
                background: 'var(--mv-surface)',
                borderColor: 'var(--mv-border)',
              }}
            >
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-3 top-1/2 hidden h-px w-6 md:block"
                  style={{ background: 'var(--mv-border)' }}
                />
              )}
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: 'var(--mv-accent)' }}
              >
                {t('how.step', { n: index + 1 })}
              </p>
              <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 mv-text-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="border-y py-16"
        style={{
          background: 'var(--mv-surface-muted)',
          borderColor: 'var(--mv-border)',
        }}
      >
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-12">
          <h2 className="text-3xl font-semibold" style={{ color: 'var(--mv-accent)' }}>
            {t('learning.title')}
          </h2>
          <p className="mt-4 text-sm leading-7 mv-text-muted">{t('learning.body')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-12" id="sobre-el-proyecto">
        <h2 className="text-2xl font-semibold sm:text-3xl" style={{ color: 'var(--mv-accent)' }}>
          {t('about.title')}
        </h2>
        <div
          className="mt-8 grid gap-8 rounded-2xl border p-6 lg:grid-cols-[0.9fr_1.1fr]"
          style={{
            background: 'var(--mv-surface)',
            borderColor: 'var(--mv-border)',
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <img
              alt={t('logo.uisAlt')}
              className="h-16 w-auto object-contain"
              src="/branding/uis-mark.png?v=2"
            />
            <img
              alt={t('logo.alt')}
              className="h-16 w-16 object-contain"
              src="/branding/eimcm-logo.png?v=4"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] mv-text-muted">
                {t('hero.university')}
              </p>
              <p className="mt-1 text-sm">{t('hero.school')}</p>
              <p
                className="mt-2 text-sm font-semibold"
                style={{ color: 'var(--mv-accent)' }}
              >
                {t('about.degree')}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm leading-7 mv-text-muted">{t('about.body')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {aboutPills.map((pill) => (
                <span
                  className="rounded-full border px-3 py-1 text-xs"
                  key={pill}
                  style={{
                    borderColor: 'var(--mv-border)',
                    color: 'var(--mv-text-muted)',
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#053d2a] text-emerald-50" id="creditos">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <img
                  alt={t('logo.uisAlt')}
                  className="h-14 w-auto object-contain"
                  src="/branding/uis-mark.png?v=2"
                />
                <img
                  alt={t('logo.alt')}
                  className="h-14 w-14 object-contain"
                  src="/branding/eimcm-logo.png?v=4"
                />
                <div>
                  <p className="font-semibold text-white">MetalVision AI</p>
                  <p className="text-sm text-emerald-100/85">{t('footer.school')}</p>
                  <p className="text-sm text-emerald-100/70">{t('footer.location')}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-emerald-100/65">{t('footer.credit')}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                {t('footer.authors')}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white">
                <li>Juan Pablo Fajardo Sanabria</li>
                <li>Valentina Fajardo Rojas</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                {t('footer.direction')}
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-emerald-100/70">{t('footer.director')}</dt>
                  <dd className="text-white">Carlos Eduardo Rondon Almeyda</dd>
                </div>
                <div>
                  <dt className="text-emerald-100/70">{t('footer.coDirector')}</dt>
                  <dd className="text-white">Ana Emilse Coy Echeverría</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="mt-10 border-t border-white/15 pt-6 text-center">
            <p className="mx-auto max-w-2xl text-sm italic text-emerald-100/90">
              “{t('footer.quote')}”
            </p>
            <p className="mt-2 text-xs font-medium tracking-wide text-emerald-200/80">
              — {t('footer.quoteAuthor')}
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default App
