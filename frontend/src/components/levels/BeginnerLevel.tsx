import { useEffect, useState, type ReactNode } from 'react'

import { BabillaMascot } from '../BabillaMascot'
import { ImageUploader } from '../ImageUploader'
import { PredictionResult } from '../PredictionResult'
import { usePreferences } from '../../i18n/PreferencesContext'
import { LOCALIZED_CLASSES } from '../../i18n/classes'
import {
  predictMicrostructure,
  toUserFacingError,
  type MicrostructureClass,
  type PredictResponse,
} from '../../lib/api'
import {
  MAG_CHOICES,
  MORPHOLOGY_OPTIONS,
  VISUAL_TRAIT_OPTIONS,
  learningForSlug,
  sampleSrcForSlug,
  slugFromClassName,
} from '../../lib/learningContent'
import {
  LevelChrome,
  LevelPrimaryButton,
  LevelShell,
  useLevelTheme,
} from './LevelChrome'

const LEVEL_ID = 'beginner' as const

interface BeginnerLevelProps {
  classes: MicrostructureClass[]
  onBack: () => void
}

type Step = 'upload' | 'questions' | 'result'

interface UserAnswers {
  morphology: string | null
  classSlug: string | null
  trait: string | null
  magnification: string | null
}

const INITIAL_ANSWERS: UserAnswers = {
  morphology: null,
  classSlug: null,
  trait: null,
  magnification: null,
}

export function BeginnerLevel({ classes, onBack }: BeginnerLevelProps) {
  const { t, locale, className, classDescription } = usePreferences()
  const tokens = useLevelTheme(LEVEL_ID)
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [answers, setAnswers] = useState<UserAnswers>(INITIAL_ANSWERS)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [prediction, setPrediction] = useState<PredictResponse | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function resetAll() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setAnswers(INITIAL_ANSWERS)
    setQuestionIndex(0)
    setPrediction(null)
    setError('')
    setStep('upload')
  }

  function handleUpload(files: File[]) {
    const next = files[0]
    if (!next) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(next)
    setPreviewUrl(URL.createObjectURL(next))
    setAnswers(INITIAL_ANSWERS)
    setQuestionIndex(0)
    setPrediction(null)
    setError('')
    setStep('questions')
  }

  async function runPrediction() {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const result = await predictMicrostructure(file)
      setPrediction(result)
      setStep('result')
    } catch (err: unknown) {
      setError(toUserFacingError(err, locale))
    } finally {
      setLoading(false)
    }
  }

  const localizedName = (slug: string) => {
    const found = LOCALIZED_CLASSES.find((item) => item.slug === slug)
    return found ? className(found.nameEs) : slug
  }

  const predictedSlug = prediction
    ? slugFromClassName(prediction.predicted_class)
    : undefined
  const matched =
    Boolean(answers.classSlug) &&
    Boolean(predictedSlug) &&
    answers.classSlug === predictedSlug
  const learning = predictedSlug ? learningForSlug(predictedSlug) : undefined

  const questionsReady =
    answers.morphology &&
    answers.classSlug &&
    answers.trait &&
    answers.magnification

  return (
    <LevelShell id={LEVEL_ID}>
      <LevelChrome
        badge={t('levels.beginner.badge')}
        hint={t('beginner.hint')}
        id={LEVEL_ID}
        onBack={onBack}
        title={t('levels.beginner.title')}
        trailing={
          <BabillaMascot
            mood={step === 'result' ? (matched ? 'cheer' : 'think') : 'idle'}
            size="md"
            speechKey={
              step === 'result'
                ? matched
                  ? 'mascot.correct'
                  : 'mascot.wrong'
                : step === 'questions'
                  ? 'mascot.quiz'
                  : 'mascot.welcome'
            }
          />
        }
      />

      {step === 'upload' && (
        <div
          className="mt-8 rounded-2xl border p-4 sm:p-6"
          style={{
            background: 'var(--mv-surface)',
            borderColor: tokens.border,
          }}
        >
          <p className="mb-4 text-sm mv-text-muted">{t('beginner.uploadHint')}</p>
          <ImageUploader
            maxFiles={1}
            onAnalyze={handleUpload}
            submitLabelKey="beginner.continue"
          />
        </div>
      )}

      {step === 'questions' && previewUrl && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: 'var(--mv-border)' }}
          >
            <img
              alt={t('beginner.yourImage')}
              className="aspect-square w-full object-contain sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[24rem] lg:object-contain"
              decoding="async"
              src={previewUrl}
              style={{ background: '#0b1f17' }}
            />
          </div>

          <div
            className="rounded-2xl border p-4 sm:p-5"
            style={{
              background: 'var(--mv-surface)',
              borderColor: tokens.border,
            }}
          >
            <p className="text-sm mv-text-muted">
              {t('beginner.questionProgress', {
                current: questionIndex + 1,
                total: 4,
              })}
            </p>

            {questionIndex === 0 && (
              <QuestionBlock color={tokens.accent} title={t('beginner.q.morphology')}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {MORPHOLOGY_OPTIONS.map((option) => (
                    <ChoiceCard
                      active={answers.morphology === option.id}
                      key={option.id}
                      label={locale === 'en' ? option.labelEn : option.labelEs}
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, morphology: option.id }))
                        setQuestionIndex(1)
                      }}
                      tokens={tokens}
                    />
                  ))}
                </div>
              </QuestionBlock>
            )}

            {questionIndex === 1 && (
              <QuestionBlock color={tokens.accent} title={t('beginner.q.class')}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {LOCALIZED_CLASSES.map((item) => {
                    const active = answers.classSlug === item.slug
                    return (
                      <button
                        className="overflow-hidden rounded-xl border text-left transition hover:-translate-y-0.5"
                        key={item.slug}
                        onClick={() => {
                          setAnswers((prev) => ({ ...prev, classSlug: item.slug }))
                          setQuestionIndex(2)
                        }}
                        style={{
                          borderColor: active ? tokens.accent : 'var(--mv-border)',
                          background: active ? tokens.softStrong : 'var(--mv-bg)',
                        }}
                        type="button"
                      >
                        <span
                          className="block aspect-square w-full overflow-hidden"
                          style={{ background: '#0b1f17' }}
                        >
                          <img
                            alt=""
                            className="h-full w-full object-contain"
                            decoding="async"
                            src={sampleSrcForSlug(item.slug)}
                          />
                        </span>
                        <span
                          className="block px-3 py-2 text-sm font-semibold"
                          style={{ color: tokens.ink }}
                        >
                          {className(item.nameEs)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </QuestionBlock>
            )}

            {questionIndex === 2 && (
              <QuestionBlock color={tokens.accent} title={t('beginner.q.trait')}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {VISUAL_TRAIT_OPTIONS.map((option) => (
                    <ChoiceCard
                      active={answers.trait === option.id}
                      key={option.id}
                      label={locale === 'en' ? option.labelEn : option.labelEs}
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, trait: option.id }))
                        setQuestionIndex(3)
                      }}
                      tokens={tokens}
                    />
                  ))}
                </div>
              </QuestionBlock>
            )}

            {questionIndex === 3 && (
              <QuestionBlock
                color={tokens.accent}
                title={t('beginner.q.magnification')}
              >
                <div className="grid grid-cols-2 gap-3">
                  {MAG_CHOICES.map((mag) => (
                    <ChoiceCard
                      active={answers.magnification === mag}
                      key={mag}
                      label={mag}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, magnification: mag }))
                      }
                      tokens={tokens}
                    />
                  ))}
                </div>
                {questionsReady && (
                  <LevelPrimaryButton
                    className="mt-6 w-full"
                    disabled={loading}
                    id={LEVEL_ID}
                    onClick={() => {
                      void runPrediction()
                    }}
                  >
                    {loading ? t('uploader.analyzing') : t('beginner.revealCnn')}
                  </LevelPrimaryButton>
                )}
              </QuestionBlock>
            )}

            {error && (
              <p className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 'result' && prediction && previewUrl && (
        <div className="mt-8 space-y-6">
          <article
            className="rounded-2xl border p-4 sm:p-5"
            style={{
              background: matched ? tokens.successBg : 'var(--mv-surface)',
              borderColor: tokens.border,
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] mv-text-muted">
              {t('beginner.compareTitle')}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm mv-text-muted">{t('beginner.yourAnswer')}</p>
                <p className="mt-1 text-xl font-semibold" style={{ color: tokens.accent }}>
                  {answers.classSlug ? localizedName(answers.classSlug) : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm mv-text-muted">{t('beginner.cnnAnswer')}</p>
                <p className="mt-1 text-xl font-semibold" style={{ color: tokens.accent }}>
                  {className(prediction.predicted_class)}
                </p>
              </div>
            </div>
            <p
              className="mt-4 text-sm font-semibold"
              style={{ color: matched ? tokens.ink : tokens.dangerBorder }}
            >
              {matched ? t('beginner.match') : t('beginner.mismatch')}
            </p>
            <ul className="mt-4 grid gap-2 text-sm mv-text-muted sm:grid-cols-2">
              <li>
                {t('beginner.savedMorphology')}:{' '}
                <strong>
                  {MORPHOLOGY_OPTIONS.find((o) => o.id === answers.morphology)
                    ? locale === 'en'
                      ? MORPHOLOGY_OPTIONS.find((o) => o.id === answers.morphology)!
                          .labelEn
                      : MORPHOLOGY_OPTIONS.find((o) => o.id === answers.morphology)!
                          .labelEs
                    : '—'}
                </strong>
              </li>
              <li>
                {t('beginner.savedTrait')}:{' '}
                <strong>
                  {VISUAL_TRAIT_OPTIONS.find((o) => o.id === answers.trait)
                    ? locale === 'en'
                      ? VISUAL_TRAIT_OPTIONS.find((o) => o.id === answers.trait)!
                          .labelEn
                      : VISUAL_TRAIT_OPTIONS.find((o) => o.id === answers.trait)!
                          .labelEs
                    : '—'}
                </strong>
              </li>
              <li>
                {t('beginner.savedMag')}:{' '}
                <strong>{answers.magnification ?? '—'}</strong>
              </li>
            </ul>
            {(learning || predictedSlug) && (
              <p className="mt-4 text-sm leading-6 mv-text-muted">
                {learning
                  ? locale === 'en'
                    ? learning.whyEn
                    : learning.whyEs
                  : classDescription(
                      predictedSlug ?? '',
                      prediction.predicted_class,
                    )}
              </p>
            )}
          </article>

          <PredictionResult
            classes={classes}
            compact
            fileName={file?.name}
            prediction={prediction}
            previewUrl={previewUrl}
          />

          <button
            className="rounded-md border px-4 py-2.5 text-sm font-semibold"
            onClick={resetAll}
            style={{ borderColor: tokens.border, color: tokens.accent }}
            type="button"
          >
            {t('beginner.tryAnother')}
          </button>
        </div>
      )}
    </LevelShell>
  )
}

function QuestionBlock({
  title,
  color,
  children,
}: {
  title: string
  color: string
  children: ReactNode
}) {
  return (
    <div className="mt-3">
      <h3 className="text-lg font-semibold sm:text-xl" style={{ color }}>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function ChoiceCard({
  label,
  active,
  onClick,
  tokens,
}: {
  label: string
  active: boolean
  onClick: () => void
  tokens: ReturnType<typeof useLevelTheme>
}) {
  return (
    <button
      className="rounded-xl border px-3 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 sm:px-4 sm:py-4"
      onClick={onClick}
      style={
        active
          ? {
              borderColor: tokens.accent,
              background: tokens.accent,
              color: tokens.onAccent,
            }
          : {
              borderColor: 'var(--mv-border)',
              background: 'var(--mv-bg)',
              color: tokens.ink,
            }
      }
      type="button"
    >
      {label}
    </button>
  )
}
