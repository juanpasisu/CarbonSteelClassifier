const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '')

export interface MicrostructureClass {
  slug: string
  name: string
  scientific_description: string
}

export interface ClassProbability {
  class: string
  probability: number
}

export interface PredictResponse {
  predicted_class: string
  confidence: number
  probabilities: ClassProbability[]
  model: {
    name: string
    version: string
  }
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function isMicrostructureClass(value: unknown): value is MicrostructureClass {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.slug === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.scientific_description === 'string'
  )
}

function isPredictResponse(value: unknown): value is PredictResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.predicted_class === 'string' &&
    typeof candidate.confidence === 'number' &&
    Array.isArray(candidate.probabilities) &&
    typeof candidate.model === 'object' &&
    candidate.model !== null
  )
}

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json()
    if (
      payload &&
      typeof payload === 'object' &&
      'detail' in payload &&
      typeof (payload as { detail: unknown }).detail === 'string'
    ) {
      return (payload as { detail: string }).detail
    }
  } catch {
    // Fall through to a generic message.
  }
  return `API request failed with status ${response.status}.`
}

export function toUserFacingError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return 'La imagen no es válida. Verifica el formato, el tamaño (máx. 25 MB) y que el archivo no esté dañado.'
    }
    if (error.status === 503) {
      return 'El análisis aún no está disponible. El modelo CNN se integrará en una fase posterior.'
    }
    return 'No se pudo completar el análisis. Intenta de nuevo en unos momentos.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocurrió un error inesperado.'
}

export async function fetchMicrostructureClasses(
  signal?: AbortSignal,
): Promise<MicrostructureClass[]> {
  const response = await fetch(`${apiBaseUrl}/api/v1/classes`, { signal })
  if (!response.ok) {
    throw new ApiError(await readErrorDetail(response), response.status)
  }

  const payload: unknown = await response.json()
  if (!Array.isArray(payload) || !payload.every(isMicrostructureClass)) {
    throw new Error('API returned an invalid microstructure catalog.')
  }

  return payload
}

export async function predictMicrostructure(
  file: File,
  signal?: AbortSignal,
): Promise<PredictResponse> {
  const body = new FormData()
  body.append('file', file)

  const response = await fetch(`${apiBaseUrl}/api/v1/predict`, {
    method: 'POST',
    body,
    signal,
  })

  if (!response.ok) {
    throw new ApiError(await readErrorDetail(response), response.status)
  }

  const payload: unknown = await response.json()
  if (!isPredictResponse(payload)) {
    throw new Error('API returned an invalid prediction payload.')
  }

  return payload
}
