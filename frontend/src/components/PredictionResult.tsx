import type { MicrostructureClass, PredictResponse } from '../lib/api'

interface PredictionResultProps {
  prediction: PredictResponse
  previewUrl: string | null
  classes: MicrostructureClass[]
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(value >= 0.01 ? 1 : 2)}%`
}

export function PredictionResult({
  prediction,
  previewUrl,
  classes,
}: PredictionResultProps) {
  const educational = classes.find(
    (item) => item.name === prediction.predicted_class,
  )

  const ranked = [...prediction.probabilities].sort(
    (left, right) => right.probability - left.probability,
  )

  return (
    <section
      className="mt-10 scroll-mt-24 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
      id="resultado"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
        Microestructura identificada
      </p>
      <h3 className="mt-2 text-3xl font-semibold text-uis-green">
        {prediction.predicted_class}
      </h3>
      <p className="mt-2 text-slate-600">
        Confianza: {formatPercent(prediction.confidence)}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Modelo {prediction.model.name} · v{prediction.model.version}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h4 className="font-semibold text-slate-800">Imagen analizada</h4>
          {previewUrl ? (
            <img
              alt="Imagen metalográfica analizada"
              className="mt-3 max-h-80 w-full rounded-xl bg-slate-100 object-contain"
              src={previewUrl}
            />
          ) : (
            <p className="mt-3 text-sm text-slate-500">Vista previa no disponible.</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-slate-800">
            Distribución de probabilidades
          </h4>
          <ul className="mt-4 space-y-3">
            {ranked.map((item) => (
              <li key={item.class}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-700">{item.class}</span>
                  <span className="tabular-nums text-slate-500">
                    {formatPercent(item.probability)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-emerald-50">
                  <div
                    className="h-full rounded bg-uis-green transition-all"
                    style={{
                      width: `${Math.max(item.probability * 100, item.probability > 0 ? 0.5 : 0)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {educational && (
        <aside className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h4 className="font-semibold text-slate-800">
            Información sobre la microestructura
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {educational.scientific_description}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Texto educativo de referencia. No forma parte de la predicción de la
            CNN.
          </p>
        </aside>
      )}
    </section>
  )
}
