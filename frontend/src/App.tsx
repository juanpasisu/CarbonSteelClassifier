import { useEffect, useState } from 'react'

import type { BatchAnalysisItem } from './components/BatchResults'
import { MicrostructureGallery } from './components/home/MicrostructureGallery'
import { SiteFooter } from './components/home/SiteFooter'
import { SiteHeader } from './components/home/SiteHeader'
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

function App() {
  const { t, locale } = usePreferences()
  const [classes, setClasses] = useState<MicrostructureClass[]>([])
  const [classesError, setClassesError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progressLabel, setProgressLabel] = useState('')
  const [analyzeError, setAnalyzeError] = useState('')
  const [batchItems, setBatchItems] = useState<BatchAnalysisItem[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
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

  function scrollToId(id: string) {
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  function openLevel(level: LevelId) {
    setMenuOpen(false)
    setActiveLevel(level)
    scrollToId('nivel-activo')
  }

  function backToLevels() {
    clearBatch()
    setActiveLevel(null)
    scrollToId('niveles')
  }

  function goHome() {
    setMenuOpen(false)
    setActiveLevel(null)
    scrollToId('niveles')
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

      scrollToId('resultado')
    } finally {
      setLoading(false)
      setProgressLabel('')
    }
  }

  const navLinks = [
    {
      href: '#niveles',
      label: t('nav.home'),
      active: !activeLevel,
      onNavigate: () => goHome(),
    },
    {
      href: '#niveles',
      label: t('nav.levels'),
      onNavigate: () => goHome(),
    },
    {
      href: '#microestructuras',
      label: t('nav.microstructures'),
      onNavigate: () => {
        setMenuOpen(false)
        scrollToId('microestructuras')
      },
    },
    {
      href: '#clasificador',
      label: t('nav.classifier'),
      active: activeLevel === 'expert',
      onNavigate: () => openLevel('expert'),
    },
    {
      href: '#como-funciona',
      label: t('nav.howItWorks'),
      onNavigate: () => {
        setMenuOpen(false)
        scrollToId('como-funciona')
      },
    },
    {
      href: '#sobre-el-proyecto',
      label: t('nav.about'),
      onNavigate: () => {
        setMenuOpen(false)
        scrollToId('sobre-el-proyecto')
      },
    },
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
      <SiteHeader
        menuOpen={menuOpen}
        navLinks={navLinks}
        onGoHome={goHome}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />

      {!activeLevel && <LevelHub onSelect={openLevel} />}

      {activeLevel === 'basic' && <BasicLevel onBack={backToLevels} />}
      {activeLevel === 'beginner' && (
        <BeginnerLevel classes={classes} onBack={backToLevels} />
      )}
      {activeLevel === 'expert' && (
        <div id="clasificador">
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
        </div>
      )}

      <MicrostructureGallery
        note={
          classesError
            ? classesError
            : t('learning.body')
        }
      />

      <section
        className="py-14"
        id="como-funciona"
        style={{ background: 'var(--mv-bg)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--green-primary)' }}
          >
            {t('how.title')}
          </p>
          <h2 className="mt-2 font-display text-2xl font-normal sm:text-3xl">
            {t('how.subtitle')}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                className="rounded-2xl border p-5"
                key={step.title}
                style={{
                  background: 'var(--mv-surface)',
                  borderColor: 'var(--mv-border)',
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-[0.16em]"
                  style={{ color: 'var(--green-primary)' }}
                >
                  {t('how.step', { n: index + 1 })}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 mv-text-muted">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-7 mv-text-muted">
            {t('learning.body')}
          </p>
        </div>
      </section>

      <section
        className="border-t py-16"
        id="sobre-el-proyecto"
        style={{
          background: 'var(--mv-surface)',
          borderColor: 'var(--mv-border)',
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
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
                style={{ color: 'var(--green-primary)' }}
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

      <SiteFooter />
    </main>
  )
}

export default App
