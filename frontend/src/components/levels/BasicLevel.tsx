import { useMemo, useState } from 'react'

import { BabillaMascot } from '../BabillaMascot'
import { MicrographFrame, MicrographThumb } from '../MicrographFrame'
import { usePreferences } from '../../i18n/PreferencesContext'
import { LOCALIZED_CLASSES } from '../../i18n/classes'
import {
  CLASS_LEARNING,
  MAGNIFICATION_LESSONS,
  buildIdentificationQuiz,
  learningForSlug,
  localizeCue,
  type QuizQuestion,
} from '../../lib/learningContent'
import { bankForSlug, randomBankImage } from '../../lib/sampleImages'
import {
  LevelChip,
  LevelChrome,
  LevelPrimaryButton,
  LevelShell,
  LevelTab,
  useLevelTheme,
} from './LevelChrome'

const LEVEL_ID = 'basic' as const

interface BasicLevelProps {
  onBack: () => void
}

type BasicTab = 'learn' | 'quiz'

export function BasicLevel({ onBack }: BasicLevelProps) {
  const { t, locale, className, classDescription } = usePreferences()
  const tokens = useLevelTheme(LEVEL_ID)
  const [tab, setTab] = useState<BasicTab>('learn')
  const [selectedSlug, setSelectedSlug] = useState(
    CLASS_LEARNING[0]?.slug ?? 'perlita',
  )
  const [activeImage, setActiveImage] = useState(() =>
    randomBankImage(CLASS_LEARNING[0]?.slug ?? 'perlita'),
  )
  const [magId, setMagId] =
    useState<(typeof MAGNIFICATION_LESSONS)[number]['id']>('100x')
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null)
  const [quizIndex, setQuizIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [quizDone, setQuizDone] = useState(false)
  const [lastPick, setLastPick] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)

  const profile = learningForSlug(selectedSlug)
  const mag =
    MAGNIFICATION_LESSONS.find((item) => item.id === magId) ??
    MAGNIFICATION_LESSONS[0]
  const gallery = bankForSlug(selectedSlug)

  const score = useMemo(() => {
    if (!quiz) return 0
    return quiz.filter((q) => answers[q.id] === q.slug).length
  }, [answers, quiz])

  function selectClass(slug: string) {
    setSelectedSlug(slug)
    setActiveImage(randomBankImage(slug))
  }

  function shuffleImage() {
    setActiveImage(randomBankImage(selectedSlug, activeImage))
  }

  function startQuiz() {
    setQuiz(buildIdentificationQuiz(7))
    setQuizIndex(0)
    setAnswers({})
    setQuizDone(false)
    setLastPick(null)
    setStreak(0)
    setTab('quiz')
  }

  function chooseAnswer(optionSlug: string) {
    if (!quiz || quizDone || lastPick) return
    const current = quiz[quizIndex]
    const correct = optionSlug === current.slug
    setLastPick(optionSlug)
    setAnswers((prev) => ({ ...prev, [current.id]: optionSlug }))
    setStreak((value) => (correct ? value + 1 : 0))
  }

  function nextQuestion() {
    if (!quiz) return
    setLastPick(null)
    if (quizIndex >= quiz.length - 1) {
      setQuizDone(true)
      return
    }
    setQuizIndex((value) => value + 1)
  }

  const localizedName = (slug: string) => {
    const found = LOCALIZED_CLASSES.find((item) => item.slug === slug)
    return found ? className(found.nameEs) : slug
  }

  const mascotMood =
    tab === 'quiz' && quizDone
      ? score >= 5
        ? 'cheer'
        : 'think'
      : lastPick && quiz
        ? lastPick === quiz[quizIndex].slug
          ? 'cheer'
          : 'think'
        : 'idle'

  const mascotSpeech =
    tab === 'quiz' && quizDone
      ? score >= 5
        ? 'mascot.quizWin'
        : 'mascot.quizRetry'
      : lastPick && quiz
        ? lastPick === quiz[quizIndex].slug
          ? 'mascot.correct'
          : 'mascot.wrong'
        : tab === 'quiz'
          ? 'mascot.quiz'
          : 'mascot.learn'

  return (
    <LevelShell id={LEVEL_ID}>
      <LevelChrome
        badge={t('levels.basic.badge')}
        hint={t('basic.hint')}
        id={LEVEL_ID}
        onBack={onBack}
        title={t('levels.basic.title')}
        trailing={
          <BabillaMascot mood={mascotMood} size="md" speechKey={mascotSpeech} />
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <LevelTab
          active={tab === 'learn'}
          id={LEVEL_ID}
          onClick={() => setTab('learn')}
        >
          {t('basic.tabLearn')}
        </LevelTab>
        <LevelTab
          active={tab === 'quiz'}
          id={LEVEL_ID}
          onClick={() => {
            if (!quiz) startQuiz()
            else setTab('quiz')
          }}
        >
          {t('basic.tabQuiz')}
        </LevelTab>
        {tab === 'quiz' && quiz && !quizDone && (
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold sm:ml-auto"
            style={{ background: tokens.accent, color: tokens.onAccent }}
          >
            {t('basic.streak', { n: streak })}
          </span>
        )}
      </div>

      {tab === 'learn' && profile && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="min-w-0">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
              {CLASS_LEARNING.map((item) => (
                <LevelChip
                  active={selectedSlug === item.slug}
                  id={LEVEL_ID}
                  key={item.slug}
                  onClick={() => selectClass(item.slug)}
                >
                  {localizedName(item.slug)}
                </LevelChip>
              ))}
            </div>

            <MicrographFrame
              alt={localizedName(selectedSlug)}
              badge={mag.label}
              className="mt-3"
              footer={
                <button
                  className="absolute bottom-3 right-3 rounded-md px-3 py-1.5 text-xs font-semibold"
                  onClick={shuffleImage}
                  style={{ background: tokens.accent, color: tokens.onAccent }}
                  type="button"
                >
                  {t('basic.shuffleImage')}
                </button>
              }
              scale={mag.scale}
              src={activeImage}
            />

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((src) => (
                <MicrographThumb
                  accent={tokens.accent}
                  active={activeImage === src}
                  key={src}
                  onClick={() => setActiveImage(src)}
                  src={src}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {MAGNIFICATION_LESSONS.map((item) => (
                <button
                  className="rounded-md px-3 py-2 text-sm font-semibold"
                  key={item.id}
                  onClick={() => setMagId(item.id)}
                  style={
                    magId === item.id
                      ? {
                          background: tokens.accent,
                          color: tokens.onAccent,
                        }
                      : {
                          background: 'var(--mv-surface-muted)',
                          color: 'var(--mv-text)',
                        }
                  }
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <article
              className="mt-4 rounded-xl border p-4"
              style={{
                background: 'var(--mv-surface)',
                borderColor: 'var(--mv-border)',
              }}
            >
              <h3 className="font-semibold" style={{ color: tokens.accent }}>
                {locale === 'en' ? mag.titleEn : mag.titleEs}
              </h3>
              <p className="mt-2 text-sm leading-6 mv-text-muted">
                {locale === 'en' ? mag.bodyEn : mag.bodyEs}
              </p>
              <p className="mt-3 text-sm leading-6 mv-text-muted">
                {locale === 'en'
                  ? profile.typicalMagnificationEn
                  : profile.typicalMagnificationEs}
              </p>
            </article>
          </div>

          <div className="space-y-4">
            <article
              className="rounded-xl border p-4 sm:p-5"
              style={{
                background: 'var(--mv-surface)',
                borderColor: 'var(--mv-border)',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] mv-text-muted">
                {t('basic.morphology')}
              </p>
              <h3
                className="mt-2 text-xl font-semibold sm:text-2xl"
                style={{ color: tokens.accent }}
              >
                {localizedName(selectedSlug)}
              </h3>
              <p className="mt-3 text-sm leading-6 mv-text-muted">
                {locale === 'en' ? profile.morphologyEn : profile.morphologyEs}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.cues.map((cue) => (
                  <span
                    className="rounded-md border px-3 py-1.5 text-xs font-medium"
                    key={cue.id}
                    style={{
                      borderColor: tokens.border,
                      background: tokens.softStrong,
                      color: tokens.ink,
                    }}
                  >
                    {localizeCue(cue, locale)}
                  </span>
                ))}
              </div>
            </article>

            <article
              className="rounded-xl border p-4 sm:p-5"
              style={{
                background: 'var(--mv-surface-muted)',
                borderColor: 'var(--mv-border)',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] mv-text-muted">
                {t('basic.science')}
              </p>
              <p className="mt-3 text-sm leading-6 mv-text-muted">
                {classDescription(
                  selectedSlug,
                  locale === 'en' ? profile.whyEn : profile.whyEs,
                )}
              </p>
            </article>

            <LevelPrimaryButton
              className="w-full"
              id={LEVEL_ID}
              onClick={startQuiz}
            >
              {t('basic.startQuiz')}
            </LevelPrimaryButton>
          </div>
        </div>
      )}

      {tab === 'quiz' && (
        <div className="mt-8">
          {!quiz && (
            <LevelPrimaryButton id={LEVEL_ID} onClick={startQuiz}>
              {t('basic.startQuiz')}
            </LevelPrimaryButton>
          )}

          {quiz && !quizDone && (
            <article
              className="rounded-2xl border p-4 sm:p-5"
              style={{
                background: 'var(--mv-surface)',
                borderColor: 'var(--mv-border)',
              }}
            >
              <p className="text-sm mv-text-muted">
                {t('basic.quizProgress', {
                  current: quizIndex + 1,
                  total: quiz.length,
                })}
              </p>
              <h3
                className="mt-2 text-lg font-semibold sm:text-xl"
                style={{ color: tokens.accent }}
              >
                {t('basic.quizPrompt')}
              </h3>
              <div
                className="mt-4 flex justify-center overflow-hidden rounded-xl"
                style={{ background: 'var(--mv-micro-frame)' }}
              >
                <img
                  alt=""
                  className="block h-auto max-h-[min(50vh,28rem)] w-auto max-w-full object-contain"
                  decoding="async"
                  src={quiz[quizIndex].imageSrc}
                />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {quiz[quizIndex].options.map((optionSlug) => {
                  const picked = lastPick === optionSlug
                  const isCorrect = optionSlug === quiz[quizIndex].slug
                  const showResult = Boolean(lastPick)
                  let border = 'var(--mv-border)'
                  let background = 'var(--mv-bg)'
                  let color = tokens.ink
                  if (showResult && isCorrect) {
                    border = tokens.accent
                    background = tokens.successBg
                    color = tokens.ink
                  } else if (showResult && picked && !isCorrect) {
                    border = tokens.dangerBorder
                    background = tokens.dangerBg
                    color = tokens.dangerBorder
                  }
                  return (
                    <button
                      className="rounded-xl border px-3 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-default sm:px-4 sm:py-4"
                      disabled={Boolean(lastPick)}
                      key={optionSlug}
                      onClick={() => chooseAnswer(optionSlug)}
                      style={{ borderColor: border, background, color }}
                      type="button"
                    >
                      {localizedName(optionSlug)}
                    </button>
                  )
                })}
              </div>
              {lastPick && (
                <LevelPrimaryButton
                  className="mt-5 w-full"
                  id={LEVEL_ID}
                  onClick={nextQuestion}
                >
                  {quizIndex >= quiz.length - 1
                    ? t('basic.seeScore')
                    : t('basic.nextQuestion')}
                </LevelPrimaryButton>
              )}
            </article>
          )}

          {quiz && quizDone && (
            <article
              className="rounded-2xl border p-5 text-center sm:p-6"
              style={{
                background: 'var(--mv-surface)',
                borderColor: 'var(--mv-border)',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] mv-text-muted">
                {t('basic.quizDone')}
              </p>
              <p
                className="mt-3 text-4xl font-semibold"
                style={{ color: tokens.accent }}
              >
                {score}/{quiz.length}
              </p>
              <p className="mt-3 text-sm mv-text-muted">{t('basic.quizFeedback')}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <LevelPrimaryButton id={LEVEL_ID} onClick={startQuiz}>
                  {t('basic.quizRetry')}
                </LevelPrimaryButton>
                <button
                  className="rounded-md border px-4 py-2.5 text-sm font-semibold"
                  onClick={() => setTab('learn')}
                  style={{ borderColor: tokens.border, color: tokens.accent }}
                  type="button"
                >
                  {t('basic.backToLearn')}
                </button>
              </div>
            </article>
          )}
        </div>
      )}
    </LevelShell>
  )
}
