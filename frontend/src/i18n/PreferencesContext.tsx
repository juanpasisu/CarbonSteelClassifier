import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  localizeClassDescription,
  localizeClassName,
} from './classes'
import {
  translate,
  type Locale,
  type MessageKey,
  type Theme,
} from './messages'

const LOCALE_KEY = 'metalvision.locale'
const THEME_KEY = 'metalvision.theme'

interface PreferencesContextValue {
  locale: Locale
  theme: Theme
  setLocale: (locale: Locale) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  toggleLocale: () => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
  className: (name: string) => string
  classDescription: (slugOrName: string, fallback: string) => string
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function readStoredLocale(): Locale {
  const value = localStorage.getItem(LOCALE_KEY)
  return value === 'en' ? 'en' : 'es'
}

function readStoredTheme(): Theme {
  const value = localStorage.getItem(THEME_KEY)
  if (value === 'dark' || value === 'light') {
    return value
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyDocumentPreferences(locale: Locale, theme: Theme) {
  const root = document.documentElement
  root.lang = locale
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') {
      return 'es'
    }
    return readStoredLocale()
  })
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }
    return readStoredTheme()
  })

  useEffect(() => {
    applyDocumentPreferences(locale, theme)
    localStorage.setItem(LOCALE_KEY, locale)
    localStorage.setItem(THEME_KEY, theme)
  }, [locale, theme])

  const value = useMemo<PreferencesContextValue>(
    () => ({
      locale,
      theme,
      setLocale: (next) => {
        setLocaleState(next)
        applyDocumentPreferences(next, theme)
        localStorage.setItem(LOCALE_KEY, next)
      },
      setTheme: (next) => {
        setThemeState(next)
        applyDocumentPreferences(locale, next)
        localStorage.setItem(THEME_KEY, next)
      },
      toggleTheme: () => {
        setThemeState((current) => {
          const next = current === 'dark' ? 'light' : 'dark'
          applyDocumentPreferences(locale, next)
          localStorage.setItem(THEME_KEY, next)
          return next
        })
      },
      toggleLocale: () => {
        setLocaleState((current) => {
          const next = current === 'es' ? 'en' : 'es'
          applyDocumentPreferences(next, theme)
          localStorage.setItem(LOCALE_KEY, next)
          return next
        })
      },
      t: (key, vars) => translate(locale, key, vars),
      className: (name) => localizeClassName(name, locale),
      classDescription: (slugOrName, fallback) =>
        localizeClassDescription(slugOrName, locale, fallback),
    }),
    [locale, theme],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}
