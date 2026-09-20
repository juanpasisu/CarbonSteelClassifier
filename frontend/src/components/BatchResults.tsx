import { usePreferences } from '../i18n/PreferencesContext'
import type { MicrostructureClass, PredictResponse } from '../lib/api'
import { summarizeBatchClasses } from '../lib/imageUpload'
import { PredictionResult } from './PredictionResult'

export interface BatchAnalysisItem {
  fileName: string
  previewUrl: string
  prediction?: PredictResponse
  error?: string
}

interface BatchResultsProps {
  items: BatchAnalysisItem[]
  classes: MicrostructureClass[]
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function BatchResults({ items, classes }: BatchResultsProps) {
  const { t, className } = usePreferences()
  const successful = items.filter((item) => item.prediction)
  const failed = items.filter((item) => item.error)
  const summary = summarizeBatchClasses(
    successful.map((item) => item.prediction!),
  )
  const averageConfidence =
    successful.length === 0
      ? 0
      : successful.reduce(
          (total, item) => total + (item.prediction?.confidence ?? 0),
          0,
        ) / successful.length

  return (
    <section className="mt-10 scroll-mt-24" id="resultado">
      <div
        className="rounded-2xl border p-6 shadow-sm"
        style={{
          background: 'var(--mv-surface)',
          borderColor: 'var(--mv-border)',
        }}
      >
        <p
          className="text-sm font-semibold uppercase tracking-[0.15em]"
          style={{ color: 'var(--mv-accent)' }}
        >
          {t('batch.summary')}
        </p>
        <h3
          className="mt-2 text-2xl font-semibold"
          style={{ color: 'var(--mv-accent)' }}
        >
          {items.length === 1
            ? t('batch.processedOne', { count: items.length })
            : t('batch.processedMany', { count: items.length })}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--mv-accent-soft)' }}
          >
            <p
              className="text-xs uppercase tracking-wide"
              style={{ color: 'var(--mv-accent)' }}
            >
              {t('batch.success')}
            </p>
            <p
              className="mt-1 text-2xl font-semibold"
              style={{ color: 'var(--mv-accent)' }}
            >
              {successful.length}
            </p>
          </div>
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--mv-surface-muted)' }}
          >
            <p className="text-xs uppercase tracking-wide mv-text-muted">
              {t('batch.failed')}
            </p>
            <p className="mt-1 text-2xl font-semibold">{failed.length}</p>
          </div>
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'var(--mv-surface-muted)' }}
          >
            <p className="text-xs uppercase tracking-wide mv-text-muted">
              {t('batch.avgConfidence')}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {successful.length > 0 ? formatPercent(averageConfidence) : '—'}
            </p>
          </div>
        </div>

        {summary.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold">{t('batch.classDistribution')}</h4>
            <ul className="mt-3 space-y-2">
              {summary.map((entry) => (
                <li
                  className="flex items-center justify-between gap-3 text-sm"
                  key={entry.className}
                >
                  <span>{className(entry.className)}</span>
                  <span className="tabular-nums mv-text-muted">{entry.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead
              className="border-b mv-text-muted"
              style={{ borderColor: 'var(--mv-border)' }}
            >
              <tr>
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">{t('batch.file')}</th>
                <th className="py-2 pr-4 font-medium">{t('batch.class')}</th>
                <th className="py-2 font-medium">{t('batch.confidence')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  className="border-b last:border-0"
                  key={`${item.fileName}-${index}`}
                  style={{ borderColor: 'var(--mv-border)' }}
                >
                  <td className="py-3 pr-4 tabular-nums mv-text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="max-w-[14rem] truncate py-3 pr-4">
                    {item.fileName}
                  </td>
                  <td className="py-3 pr-4">
                    {item.prediction ? (
                      <span
                        className="font-medium"
                        style={{ color: 'var(--mv-accent)' }}
                      >
                        {className(item.prediction.predicted_class)}
                      </span>
                    ) : (
                      <span className="text-rose-600">{t('batch.error')}</span>
                    )}
                  </td>
                  <td className="py-3 tabular-nums mv-text-muted">
                    {item.prediction
                      ? formatPercent(item.prediction.confidence)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--mv-accent)' }}>
          {t('batch.detail')}
        </h3>
        {items.map((item, index) =>
          item.prediction ? (
            <PredictionResult
              classes={classes}
              compact
              fileName={item.fileName}
              index={index + 1}
              key={`${item.fileName}-ok-${index}`}
              prediction={item.prediction}
              previewUrl={item.previewUrl}
              total={items.length}
            />
          ) : (
            <article
              className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/40"
              key={`${item.fileName}-err-${index}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-rose-700 dark:text-rose-300">
                {t('batch.resultOf', {
                  index: String(index + 1).padStart(2, '0'),
                  total: String(items.length).padStart(2, '0'),
                })}
              </p>
              <h4 className="mt-2 font-semibold text-rose-800 dark:text-rose-200">
                {item.fileName}
              </h4>
              <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                {item.error || t('batch.analysisFailed')}
              </p>
            </article>
          ),
        )}
      </div>
    </section>
  )
}
