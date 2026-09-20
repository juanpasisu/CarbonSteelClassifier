import { describe, expect, it } from 'vitest'

import {
  MAX_BATCH_IMAGES,
  buildImageBatch,
  summarizeBatchClasses,
  validateSelectedFile,
} from './imageUpload'

function fakeFile(
  name: string,
  options: { type?: string; size?: number } = {},
): File {
  const size = options.size ?? 1024
  const type = options.type ?? 'image/jpeg'
  const buffer = new Uint8Array(size)
  return new File([buffer], name, { type })
}

describe('imageUpload batch helpers', () => {
  it('accepts valid images and skips invalid ones', () => {
    const batch = buildImageBatch([
      fakeFile('ok.jpg'),
      fakeFile('bad.exe', { type: 'application/octet-stream' }),
      fakeFile('ok2.png', { type: 'image/png' }),
    ])

    expect(batch.files.map((file) => file.name)).toEqual(['ok.jpg', 'ok2.png'])
    expect(batch.skipped).toHaveLength(1)
    expect(batch.skipped[0]).toEqual({
      name: 'bad.exe',
      reason: 'unsupported_format',
    })
  })

  it('enforces the batch size limit', () => {
    const files = Array.from({ length: MAX_BATCH_IMAGES + 2 }, (_, index) =>
      fakeFile(`img-${index}.jpg`),
    )
    const batch = buildImageBatch(files)
    expect(batch.files).toHaveLength(MAX_BATCH_IMAGES)
    expect(batch.skipped).toHaveLength(2)
    expect(batch.skipped.every((item) => item.reason === 'batch_limit')).toBe(
      true,
    )
  })

  it('rejects oversized files', () => {
    const error = validateSelectedFile(
      fakeFile('huge.jpg', { size: 26 * 1024 * 1024 }),
    )
    expect(error).toBe('invalid_size')
  })

  it('summarizes predicted classes in descending count order', () => {
    const summary = summarizeBatchClasses([
      { predicted_class: 'Ferrita' },
      { predicted_class: 'Perlita' },
      { predicted_class: 'Ferrita' },
      { predicted_class: 'Martensita' },
      { predicted_class: 'Ferrita' },
    ])

    expect(summary).toEqual([
      { className: 'Ferrita', count: 3 },
      { className: 'Martensita', count: 1 },
      { className: 'Perlita', count: 1 },
    ])
  })

  it('enforces a custom batch size limit', () => {
    const batch = buildImageBatch(
      [fakeFile('a.jpg'), fakeFile('b.jpg'), fakeFile('c.jpg')],
      1,
    )
    expect(batch.files).toHaveLength(1)
    expect(batch.skipped).toHaveLength(2)
  })
})
