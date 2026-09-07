import { useEffect, useState } from 'react'

import { ImageUploader } from './components/ImageUploader'
import { PredictionResult } from './components/PredictionResult'
import {
  fetchMicrostructureClasses,
  predictMicrostructure,
  toUserFacingError,
  type MicrostructureClass,
  type PredictResponse,
} from './lib/api'

const steps = [
  {
    title: 'Carga una imagen',
    description: 'Selecciona o arrastra una micrografía de acero al carbono.',
  },
  {
    title: 'Procesamiento',
    description: 'El sistema valida y prepara la imagen para el modelo.',
  },
  {
    title: 'Análisis CNN',
    description: 'La red neuronal estima la microestructura más probable.',
  },
  {
    title: 'Resultado',
    description: 'Obtienes la clase, la confianza y las probabilidades.',
  },
]

function App() {
  const [classes, setClasses] = useState<MicrostructureClass[]>([])
  const [classesError, setClassesError] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [prediction, setPrediction] = useState<PredictResponse | null>(null)
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null)

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

  useEffect(() => {
    return () => {
      if (resultPreviewUrl) {
        URL.revokeObjectURL(resultPreviewUrl)
      }
    }
  }, [resultPreviewUrl])

  async function handleAnalyze(file: File) {
    setLoading(true)
    setAnalyzeError('')
    setPrediction(null)

    if (resultPreviewUrl) {
      URL.revokeObjectURL(resultPreviewUrl)
    }
    const nextPreview = URL.createObjectURL(file)
    setResultPreviewUrl(nextPreview)

    try {
      const result = await predictMicrostructure(file)
      setPrediction(result)
      window.requestAnimationFrame(() => {
        document.getElementById('resultado')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    } catch (error: unknown) {
      setAnalyzeError(toUserFacingError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-12">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-uis-green font-bold text-white">
              MV
            </span>
            <div>
              <p className="font-semibold tracking-wide text-uis-green">
                MetalVision AI
              </p>
              <p className="text-xs text-slate-500">CarbonSteelClassifier</p>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm text-slate-600 sm:flex">
            <a className="hover:text-uis-green" href="#inicio">
              Inicio
            </a>
            <a className="hover:text-uis-green" href="#analizar">
              Analizar
            </a>
            <a className="hover:text-uis-green" href="#como-funciona">
              ¿Cómo funciona?
            </a>
            <a className="hover:text-uis-green" href="#microestructuras">
              Microestructuras
            </a>
          </nav>
        </div>
      </header>

      <section
        className="relative overflow-hidden bg-gradient-to-br from-uis-green via-emerald-800 to-emerald-950 text-white"
        id="inicio"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-12 lg:py-28">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Universidad Industrial de Santander
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Identificación inteligente de microestructuras en aceros al carbono
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50/90">
            Analiza imágenes metalográficas mediante Inteligencia Artificial y
            Redes Neuronales Convolucionales. Acceso directo, sin registro.
          </p>
          <a
            className="mt-8 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-uis-green transition hover:bg-emerald-50"
            href="#analizar"
          >
            Analizar microestructura
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-12" id="analizar">
        <h2 className="text-2xl font-semibold text-uis-green">
          Cargar imagen metalográfica
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Sube una micrografía para validarla y prepararla. La predicción con la
          CNN se activará cuando el modelo esté integrado.
        </p>

        <div className="mt-8">
          <ImageUploader
            loading={loading}
            onAnalyze={(file) => {
              void handleAnalyze(file)
            }}
            onClearResult={() => {
              setAnalyzeError('')
              setPrediction(null)
            }}
          />
        </div>

        {analyzeError && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {analyzeError}
          </p>
        )}

        {prediction && (
          <PredictionResult
            classes={classes}
            prediction={prediction}
            previewUrl={resultPreviewUrl}
          />
        )}
      </section>

      <section
        className="border-y border-emerald-900/5 bg-white"
        id="como-funciona"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-12">
          <h2 className="text-2xl font-semibold text-uis-green">
            ¿Cómo funciona?
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step.title}>
                <p className="text-sm font-semibold text-emerald-600">
                  Paso {index + 1}
                </p>
                <h3 className="mt-2 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-6 py-16 lg:px-12"
        id="microestructuras"
      >
        <h2 className="text-2xl font-semibold text-uis-green">
          Microestructuras reconocidas
        </h2>
        <p className="mt-2 text-slate-600">
          Siete clases oficiales en el orden de entrenamiento del modelo.
        </p>
        {classesError ? (
          <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {classesError}
          </p>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((microstructureClass, index) => (
              <article
                className="rounded-xl border border-emerald-100 bg-white px-4 py-4"
                key={microstructureClass.slug}
              >
                <p className="text-xs font-semibold text-emerald-700">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-1 font-medium text-slate-900">
                  {microstructureClass.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {microstructureClass.scientific_description}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-emerald-900/10 bg-uis-green text-emerald-50">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm leading-7 lg:px-12">
          <p className="font-semibold text-white">Proyecto académico</p>
          <p>Ingeniería Metalúrgica y Ciencia de Materiales</p>
          <p>Universidad Industrial de Santander</p>
          <p className="mt-3 text-emerald-100/80">
            React · FastAPI · CNN · Supabase
          </p>
        </div>
      </footer>
    </main>
  )
}

export default App
