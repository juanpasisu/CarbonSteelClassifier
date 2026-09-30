import { describe, expect, it } from 'vitest'

import { resolveApiBaseUrl } from './api'

describe('resolveApiBaseUrl', () => {
  it('uses localhost when the env var is undefined', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('http://127.0.0.1:8000')
  })

  it('keeps an explicit empty string for same-origin deploys', () => {
    expect(resolveApiBaseUrl('')).toBe('')
  })

  it('strips trailing slashes from absolute URLs', () => {
    expect(resolveApiBaseUrl('https://api.example.com/')).toBe(
      'https://api.example.com',
    )
  })
})
