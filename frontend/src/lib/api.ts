const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '')

export interface MicrostructureClass {
  slug: string
  name: string
  scientific_description: string
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

export async function fetchMicrostructureClasses(
  signal?: AbortSignal,
): Promise<MicrostructureClass[]> {
  const response = await fetch(`${apiBaseUrl}/api/v1/classes`, { signal })
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`)
  }

  const payload: unknown = await response.json()
  if (!Array.isArray(payload) || !payload.every(isMicrostructureClass)) {
    throw new Error('API returned an invalid microstructure catalog.')
  }

  return payload
}
