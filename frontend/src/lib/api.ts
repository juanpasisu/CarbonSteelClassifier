import type { Locale, MessageKey } from '../i18n/messages'
import { translate } from '../i18n/messages'

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

export interface IdentifiedPhase {
  slug: string
  name: string
  present: boolean
}

export interface PredictResponse {
  predicted_class: string
  confidence: number
  probabilities: ClassProbability[]
  identified_phases?: IdentifiedPhase[]
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

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }
  const message = error.message.toLowerCase()
  return (
    error.name === 'TypeError' ||
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('load failed')
  )
}

export function toUserFacingError(
  error: unknown,
  locale: Locale = 'es',
): string {
  const t = (key: MessageKey) => translate(locale, key)

  if (error instanceof ApiError) {
    if (error.status === 400) {
      return t('error.invalidImage')
    }
    if (error.status === 503) {
      return t('error.modelUnavailable')
    }
    return t('error.analyzeFailed')
  }
  if (isNetworkError(error)) {
    return t('error.apiUnreachable')
  }
  if (error instanceof Error) {
    return error.message
  }
  return t('error.unexpected')
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

function mimeFromFileName(name: string): string | undefined {
  const match = name.toLowerCase().match(/\.(jpe?g|png|webp|tiff?)$/)
  if (!match) {
    return undefined
  }
  if (match[1] === 'jpg' || match[1] === 'jpeg') {
    return 'image/jpeg'
  }
  if (match[1] === 'tif' || match[1] === 'tiff') {
    return 'image/tiff'
  }
  return `image/${match[1]}`
}

export async function predictMicrostructure(
  file: File,
  signal?: AbortSignal,
): Promise<PredictResponse> {
  const body = new FormData()
  const contentType = file.type || mimeFromFileName(file.name)
  const upload =
    contentType && contentType !== file.type
      ? new File([file], file.name, { type: contentType, lastModified: file.lastModified })
      : file
  body.append('file', upload)

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
