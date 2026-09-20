const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
])

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024
export const MAX_BATCH_IMAGES = 12

export type FileValidationReason =
  | 'unsupported_format'
  | 'invalid_size'
  | 'batch_limit'

export function validateSelectedFile(
  file: File,
): Exclude<FileValidationReason, 'batch_limit'> | null {
  if (
    !ACCEPTED_TYPES.has(file.type) &&
    !/\.(jpe?g|png|webp|tiff?)$/i.test(file.name)
  ) {
    return 'unsupported_format'
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return 'invalid_size'
  }
  return null
}

export interface SkippedFile {
  name: string
  reason: FileValidationReason
}

export interface AcceptedBatch {
  files: File[]
  skipped: SkippedFile[]
}

export function buildImageBatch(
  fileList: FileList | File[],
  maxFiles: number = MAX_BATCH_IMAGES,
): AcceptedBatch {
  const limit = Math.max(1, Math.min(maxFiles, MAX_BATCH_IMAGES))
  const incoming = Array.from(fileList)
  const files: File[] = []
  const skipped: SkippedFile[] = []

  for (const file of incoming) {
    if (files.length >= limit) {
      skipped.push({ name: file.name, reason: 'batch_limit' })
      continue
    }
    const error = validateSelectedFile(file)
    if (error) {
      skipped.push({ name: file.name, reason: error })
      continue
    }
    files.push(file)
  }

  return { files, skipped }
}

export function summarizeBatchClasses(
  results: Array<{ predicted_class: string }>,
): Array<{ className: string; count: number }> {
  const counts = new Map<string, number>()
  for (const result of results) {
    counts.set(
      result.predicted_class,
      (counts.get(result.predicted_class) ?? 0) + 1,
    )
  }
  return [...counts.entries()]
    .map(([className, count]) => ({ className, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count
      }
      return left.className.localeCompare(right.className, 'es')
    })
}
