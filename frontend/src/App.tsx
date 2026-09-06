import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'

import {
  fetchMicrostructureClasses,
  type MicrostructureClass,
} from './lib/api'
import { isSupabaseConfigured, supabase } from './lib/supabase'

type AuthMode = 'sign-in' | 'sign-up'

const capabilities = [
  {
    title: 'Carga de imágenes',
    description: 'Prepara una micrografía para su análisis asistido.',
  },
  {
    title: 'Clasificación CNN',
    description: 'Obtén una hipótesis de microestructura y su confianza.',
  },
  {
    title: 'Historial académico',
    description: 'Consulta tus análisis y compara resultados con el tiempo.',
  },
]

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [classes, setClasses] = useState<MicrostructureClass[]>([])
  const [classesError, setClassesError] = useState('')

  useEffect(() => {
    if (!supabase) {
      return
    }

    let mounted = true
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void fetchMicrostructureClasses(controller.signal)
      .then(setClasses)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        setClassesError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el catálogo.',
        )
      })

    return () => controller.abort()
  }, [])

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')

    if (!supabase) {
      setAuthError('Configura las variables públicas de Supabase para continuar.')
      return
    }

    setAuthLoading(true)
    try {
      const result =
        authMode === 'sign-in'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password })

      if (result.error) {
        setAuthError(result.error.message)
        return
      }

      if (authMode === 'sign-up' && !result.data.session) {
        setAuthMessage('Revisa tu correo para confirmar la cuenta.')
        return
      }

      setAuthMessage(
        authMode === 'sign-in'
          ? 'Sesión iniciada correctamente.'
          : 'Cuenta creada correctamente.',
      )
      setPassword('')
    } catch (error: unknown) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'No se pudo conectar con Supabase Auth.',
      )
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleSignOut() {
    if (!supabase) {
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setAuthError(error.message)
        return
      }
      setAuthMessage('Sesión cerrada.')
    } catch (error: unknown) {
      setAuthError(
        error instanceof Error
          ? error.message
          : 'No se pudo cerrar la sesión.',
      )
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-12">
        <nav className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-copper font-bold text-white">
              CS
            </span>
            <span className="font-semibold tracking-wide">
              CarbonSteelClassifier
            </span>
          </div>
          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-400 sm:inline">
                {session.user.email}
              </span>
              <button
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-copper hover:text-white"
                onClick={() => void handleSignOut()}
                type="button"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
              Fase 4 · Autenticación
            </span>
          )}
        </nav>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-copper">
              Metalurgia · IA · Aprendizaje
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Comprende la microestructura del acero con apoyo de inteligencia
              artificial.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Una plataforma académica para explorar fases y microconstituyentes
              en imágenes metalográficas mediante visión por computador.
            </p>

            {session ? (
              <div className="mt-9 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-sm font-semibold text-emerald-300">
                  Sesión autenticada
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Tu cuenta ya puede utilizar los análisis protegidos del
                  backend.
                </p>
              </div>
            ) : (
              <div className="mt-9 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
                <div className="mb-5 flex gap-2 rounded-lg bg-slate-800/70 p-1">
                  <button
                    className={`flex-1 rounded-md px-3 py-2 text-sm transition ${
                      authMode === 'sign-in'
                        ? 'bg-copper font-semibold text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setAuthMode('sign-in')}
                    type="button"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    className={`flex-1 rounded-md px-3 py-2 text-sm transition ${
                      authMode === 'sign-up'
                        ? 'bg-copper font-semibold text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setAuthMode('sign-up')}
                    type="button"
                  >
                    Crear cuenta
                  </button>
                </div>

                <h2 className="text-xl font-semibold">
                  {authMode === 'sign-in'
                    ? 'Acceso al laboratorio'
                    : 'Registro académico'}
                </h2>
                <form className="mt-5 space-y-4" onSubmit={handleAuthSubmit}>
                  <label className="block text-sm text-slate-300">
                    Correo electrónico
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-copper"
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      type="email"
                      value={email}
                    />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Contraseña
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-copper"
                      minLength={6}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      type="password"
                      value={password}
                    />
                  </label>
                  <button
                    className="w-full rounded-lg bg-copper px-5 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={authLoading || !isSupabaseConfigured}
                    type="submit"
                  >
                    {authLoading
                      ? 'Procesando...'
                      : authMode === 'sign-in'
                        ? 'Iniciar sesión'
                        : 'Crear cuenta'}
                  </button>
                </form>

                {!isSupabaseConfigured && (
                  <p className="mt-4 text-sm text-amber-300">
                    Supabase aún no está configurado en las variables públicas
                    del frontend.
                  </p>
                )}
                {authError && (
                  <p className="mt-4 text-sm text-rose-300">{authError}</p>
                )}
                {authMessage && (
                  <p className="mt-4 text-sm text-emerald-300">{authMessage}</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Clases iniciales</p>
                <p className="mt-1 text-3xl font-semibold">
                  {classes.length} microestructuras
                </p>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                Catálogo API
              </span>
            </div>
            {classesError ? (
              <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300">
                {classesError}
              </p>
            ) : (
              <div className="space-y-3">
                {classes.map((microstructureClass, index) => (
                  <div
                    className="flex items-center gap-3 rounded-xl bg-slate-800/70 px-4 py-3"
                    key={microstructureClass.slug}
                  >
                    <span className="text-xs text-copper">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-slate-300">
                      {microstructureClass.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-800 pt-8 md:grid-cols-3">
          {capabilities.map((capability) => (
            <article key={capability.title}>
              <h2 className="font-semibold">{capability.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {capability.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
