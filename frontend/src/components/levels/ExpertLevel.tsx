import { BatchResults, type BatchAnalysisItem } from '../BatchResults'
import { ImageUploader } from '../ImageUploader'
import { usePreferences } from '../../i18n/PreferencesContext'
import type { MicrostructureClass } from '../../lib/api'
import { LevelChrome, LevelShell, useLevelTheme } from './LevelChrome'

const LEVEL_ID = 'expert' as const

interface ExpertLevelProps {
  classes: MicrostructureClass[]
  loading: boolean
  progressLabel: string
  analyzeError: string
  batchItems: BatchAnalysisItem[]
  onAnalyze: (files: File[]) => void
  onClearResult: () => void
  onBack: () => void
}

export function ExpertLevel({
  classes,
  loading,
  progressLabel,
  analyzeError,
  batchItems,
  onAnalyze,
  onClearResult,
  onBack,
}: ExpertLevelProps) {
  const { t } = usePreferences()
  const tokens = useLevelTheme(LEVEL_ID)

  return (
    <LevelShell id={LEVEL_ID}>
      <LevelChrome
        badge={t('levels.expert.badge')}
        hint={t('expert.hint')}
        id={LEVEL_ID}
        onBack={onBack}
        title={t('levels.expert.title')}
      />

      <div
        className="mt-8 rounded-2xl border-2 p-4 shadow-sm sm:p-6"
        style={{
          background: 'var(--mv-surface)',
          borderColor: tokens.border,
        }}
      >
        <ImageUploader
          loading={loading}
          onAnalyze={onAnalyze}
          onClearResult={onClearResult}
          progressLabel={progressLabel}
        />
      </div>

      {analyzeError && (
        <p className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {analyzeError}
        </p>
      )}
      {batchItems.length > 0 && (
        <BatchResults classes={classes} items={batchItems} />
      )}
    </LevelShell>
  )
}
