import { usePreferences } from '../i18n/PreferencesContext'
import type { MessageKey } from '../i18n/messages'

type Mood = 'idle' | 'cheer' | 'think' | 'nudge'

interface BabillaMascotProps {
  mood?: Mood
  speechKey?: MessageKey
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASS = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24 sm:h-28 sm:w-28',
  lg: 'h-28 w-28 sm:h-36 sm:w-36 lg:h-44 lg:w-44',
} as const

export function BabillaMascot({
  mood = 'idle',
  speechKey = 'mascot.welcome',
  size = 'lg',
  className = '',
}: BabillaMascotProps) {
  const { t } = usePreferences()

  return (
    <div
      className={`babilla-wrap flex w-full max-w-md flex-row-reverse items-end gap-2 sm:w-auto sm:flex-row sm:gap-3 ${className}`}
    >
      <div className="babilla-bubble relative min-w-0 flex-1 sm:max-w-[18rem]">
        <p
          className="rounded-2xl px-3 py-2.5 text-xs leading-5 sm:px-4 sm:py-3 sm:text-sm"
          style={{
            background: 'var(--mv-bubble-bg)',
            color: 'var(--mv-text)',
            border: '1px solid var(--mv-bubble-border)',
            boxShadow: 'var(--mv-card-shadow)',
          }}
        >
          {t(speechKey)}
        </p>
      </div>
      <div
        className={`babilla-mascot babilla-${mood} shrink-0 ${SIZE_CLASS[size]}`}
      >
        <img
          alt={t('mascot.alt')}
          className="h-full w-full object-contain"
          decoding="async"
          src="/branding/babi-mascot-clean.png?v=10"
          style={{ backgroundColor: 'transparent', background: 'none' }}
        />
      </div>
    </div>
  )
}
