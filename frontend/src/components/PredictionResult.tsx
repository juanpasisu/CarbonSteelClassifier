import { usePreferences } from '../i18n/PreferencesContext'
import type { MicrostructureClass, PredictResponse } from '../lib/api'

interface PredictionResultProps {
  prediction: PredictResponse
  previewUrl: string | null
  classes: MicrostructureClass[]
  fileName?: string
  index?: number
  total?: number
  compact?: boolean
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(value >= 0.01 ? 1 : 2)}%`
}

export function PredictionResult({
  prediction,
  previewUrl,
  classes,
  fileName,
  index,
  total,
  compact = false,
}: PredictionResultProps) {
  const { t, locale, className, classDescription } = usePreferences()

  const educational = classes.find(
    (item) => item.name === prediction.predicted_class,
  )

  const ranked = [...prediction.probabilities].sort(
    (left, right) => right.probability - left.probability,
  )

  return (
    <article
      className={`rounded-2xl border p-6 shadow-sm ${compact ? '' : 'mt-10'}`}
      style={{
        background: 'var(--mv-surface)',
        borderColor: 'var(--mv-border)',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {typeof index === 'number' && (
            <p
              className="text-xs font-semibold uppercase tracking-[0.15em]"
              style={{ color: 'var(--mv-accent)' }}
            >
              {t('batch.resultOf', {
                index: String(index).padStart(2, '0'),
                total:
                  typeof total === 'number'
                    ? String(total).padStart(2, '0')
                    : '—',
              })}
            </p>
          )}
          <p
            className="mt-2 text-sm font-semibold uppercase tracking-[0.15em]"
            style={{ color: 'var(--mv-accent)' }}
          >
            {t('result.identified')}
          </p>
          <h3
            className="mt-2 text-3xl font-semibold"
            style={{ color: 'var(--mv-accent)' }}
          >
            {className(prediction.predicted_class)}
          </h3>
          <p className="mt-2 mv-text-muted">
            {t('result.confidence', {
              value: formatPercent(prediction.confidence),
            })}
          </p>
          {fileName && (
            <p className="mt-1 truncate text-sm mv-text-muted" title={fileName}>
              {t('result.file', { name: fileName })}
            </p>
          )}
          <p className="mt-1 text-xs mv-text-muted">
            {t('result.model', {
              name: prediction.model.name,
              version: prediction.model.version,
            })}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h4 className="font-semibold">{t('result.image')}</h4>
          {previewUrl ? (
            <img
              alt={
                fileName
                  ? `${t('result.image')}: ${fileName}`
                  : t('result.image')
              }
              className="mt-3 max-h-80 w-full rounded-xl object-contain"
              src={previewUrl}
              style={{ background: 'var(--mv-surface-muted)' }}
            />
          ) : (
            <p className="mt-3 text-sm mv-text-muted">
              {t('result.previewUnavailable')}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-semibold">{t('result.probabilities')}</h4>
          <ul className="mt-4 space-y-3">
            {ranked.map((item) => (
              <li key={item.class}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span>{className(item.class)}</span>
                  <span className="tabular-nums mv-text-muted">
                    {formatPercent(item.probability)}
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded"
                  style={{ background: 'var(--mv-accent-soft)' }}
                >
                  <div
                    className="h-full rounded bg-uis-green transition-all"
                    style={{
                      width: `${Math.max(item.probability * 100, item.probability > 0 ? 0.5 : 0)}%`,
                      background: 'var(--mv-accent)',
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {prediction.identified_phases && prediction.identified_phases.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold">{t('result.phasesTitle')}</h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {prediction.identified_phases.map((phase) => (
              <li
                className="rounded-full border px-3 py-1 text-sm"
                key={phase.slug}
                style={{
                  borderColor: phase.present ? 'var(--mv-accent)' : 'var(--mv-border)',
                  background: phase.present
                    ? 'var(--mv-accent-soft)'
                    : 'var(--mv-surface-muted)',
                  color: phase.present ? 'var(--mv-accent)' : 'var(--mv-text-muted)',
                }}
              >
                {phase.slug === 'cementita'
                  ? locale === 'en'
                    ? 'Cementite'
                    : 'Cementita'
                  : className(phase.name)}{' '}
                · {phase.present ? t('result.phasePresent') : t('result.phaseAbsent')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {educational && (
        <aside
          className="mt-8 rounded-xl border p-5"
          style={{
            background: 'var(--mv-surface-muted)',
            borderColor: 'var(--mv-border)',
          }}
        >
          <h4 className="font-semibold">{t('result.infoTitle')}</h4>
          <p className="mt-2 text-sm leading-6 mv-text-muted">
            {classDescription(
              educational.slug,
              educational.scientific_description,
            )}
          </p>
          <p className="mt-3 text-xs mv-text-muted">{t('result.infoNote')}</p>
        </aside>
      )}
    </article>
  )
}
