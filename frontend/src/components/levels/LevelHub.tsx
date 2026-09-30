import { BabillaMascot } from '../BabillaMascot'
import type { LevelId } from '../../lib/learningContent'
import { hubCardColors } from '../../lib/levelThemes'
import { usePreferences } from '../../i18n/PreferencesContext'

interface LevelHubProps {
  onSelect: (level: LevelId) => void
}

const LEVELS: Array<{
  id: LevelId
  step: string
  badgeKey: 'levels.basic.badge' | 'levels.beginner.badge' | 'levels.expert.badge'
  titleKey: 'levels.basic.title' | 'levels.beginner.title' | 'levels.expert.title'
  subtitleKey:
    | 'levels.basic.subtitle'
    | 'levels.beginner.subtitle'
    | 'levels.expert.subtitle'
  pointsKey:
    | 'levels.basic.points'
    | 'levels.beginner.points'
    | 'levels.expert.points'
  ctaKey: 'levels.basic.cta' | 'levels.beginner.cta' | 'levels.expert.cta'
}> = [
  {
    id: 'basic',
    step: '01',
    badgeKey: 'levels.basic.badge',
    titleKey: 'levels.basic.title',
    subtitleKey: 'levels.basic.subtitle',
    pointsKey: 'levels.basic.points',
    ctaKey: 'levels.basic.cta',
  },
  {
    id: 'beginner',
    step: '02',
    badgeKey: 'levels.beginner.badge',
    titleKey: 'levels.beginner.title',
    subtitleKey: 'levels.beginner.subtitle',
    pointsKey: 'levels.beginner.points',
    ctaKey: 'levels.beginner.cta',
  },
  {
    id: 'expert',
    step: '03',
    badgeKey: 'levels.expert.badge',
    titleKey: 'levels.expert.title',
    subtitleKey: 'levels.expert.subtitle',
    pointsKey: 'levels.expert.points',
    ctaKey: 'levels.expert.cta',
  },
]

/** First-viewport hub: title + Babi + three levels (pre-sections base). */
export function LevelHub({ onSelect }: LevelHubProps) {
  const { t, theme } = usePreferences()

  return (
    <section
      className="level-hub-screen relative overflow-hidden"
      id="niveles"
      style={{
        background: `
          radial-gradient(ellipse at 12% 15%, var(--mv-hub-glow-a), transparent 42%),
          radial-gradient(ellipse at 88% 20%, var(--mv-hub-glow-b), transparent 40%),
          radial-gradient(ellipse at 70% 90%, var(--mv-hub-glow-c), transparent 45%),
          var(--mv-hub-base)
        `,
      }}
    >
      <div className="relative mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="max-w-xl" id="inicio">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--green-primary)' }}
            >
              {t('levels.kicker')}
            </p>
            <h1 className="mt-3 font-display text-3xl font-normal tracking-tight text-[var(--mv-text)] sm:text-4xl lg:text-5xl">
              {t('levels.titleLead')}
              <span style={{ color: 'var(--green-primary)' }}>
                {t('levels.titleAccent')}
              </span>
              {t('levels.titleTrail')}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--mv-text-muted)] sm:text-base">
              {t('levels.subtitle')}
            </p>
            <p
              className="mt-2 text-sm font-medium"
              style={{ color: 'var(--green-primary)' }}
            >
              {t('levels.progress')}
            </p>
          </div>
          <BabillaMascot mood="nudge" size="lg" speechKey="mascot.welcome" />
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((level, index) => {
            const colors = hubCardColors(level.id, theme)
            return (
              <button
                className="level-path-card group flex min-h-[18rem] flex-col overflow-hidden rounded-[14px] border text-left sm:min-h-[20rem] lg:min-h-[22rem]"
                key={level.id}
                onClick={() => onSelect(level.id)}
                style={{
                  background: colors.soft,
                  borderColor: colors.border,
                  boxShadow: 'var(--mv-card-shadow)',
                }}
                type="button"
              >
                <div
                  className="relative px-5 py-5 sm:px-6 sm:py-6"
                  style={{ background: colors.softStrong, color: colors.ink }}
                >
                  <span
                    aria-hidden
                    className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-2xl text-sm font-bold sm:right-5 sm:top-5 sm:h-12 sm:w-12 sm:text-base"
                    style={{
                      background: colors.accent,
                      color: theme === 'dark' ? '#061A13' : '#ffffff',
                    }}
                  >
                    {level.step}
                  </span>
                  <p className="pr-12 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    {t('levels.step', { n: index + 1 })} · {t(level.badgeKey)}
                  </p>
                  <h2 className="mt-3 max-w-[14rem] font-display text-xl font-normal leading-tight sm:text-2xl lg:text-3xl">
                    {t(level.titleKey)}
                  </h2>
                </div>
                <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
                  <p className="text-sm leading-6" style={{ color: colors.ink }}>
                    {t(level.subtitleKey)}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm" style={{ color: colors.ink }}>
                    {t(level.pointsKey)
                      .split('|')
                      .map((point) => (
                        <li className="flex gap-2" key={point}>
                          <span aria-hidden style={{ color: colors.accent }}>
                            ▸
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                  </ul>
                  <span
                    className="mv-btn mt-auto inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
                    style={{
                      background: colors.accent,
                      color: theme === 'dark' ? '#061A13' : '#ffffff',
                    }}
                  >
                    {t(level.ctaKey)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
