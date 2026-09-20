import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'

import { usePreferences } from '../i18n/PreferencesContext'
import type { MessageKey } from '../i18n/messages'
import {
  MAX_BATCH_IMAGES,
  buildImageBatch,
  type FileValidationReason,
  type SkippedFile,
} from '../lib/imageUpload'

export interface SelectedImage {
  id: string
  file: File
  previewUrl: string
}

interface ImageUploaderProps {
  disabled?: boolean
  loading?: boolean
  progressLabel?: string
  maxFiles?: number
  submitLabelKey?: MessageKey
  onAnalyze: (files: File[]) => void
  onClearResult?: () => void
}

function createSelectedImages(files: File[]): SelectedImage[] {
  return files.map((file, index) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
    file,
    previewUrl: URL.createObjectURL(file),
  }))
}

function revokeAll(images: SelectedImage[]) {
  for (const image of images) {
    URL.revokeObjectURL(image.previewUrl)
  }
}

function reasonMessageKey(
  reason: FileValidationReason,
): Extract<
  MessageKey,
  | 'uploader.error.unsupported'
  | 'uploader.error.size'
  | 'uploader.error.batchLimit'
> {
  if (reason === 'unsupported_format') {
    return 'uploader.error.unsupported'
  }
  if (reason === 'invalid_size') {
    return 'uploader.error.size'
  }
  return 'uploader.error.batchLimit'
}

export function ImageUploader({
  disabled = false,
  loading = false,
  progressLabel,
  maxFiles = MAX_BATCH_IMAGES,
  submitLabelKey,
  onAnalyze,
  onClearResult,
}: ImageUploaderProps) {
  const { t, locale } = usePreferences()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<SelectedImage[]>([])
  const [localError, setLocalError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const batchLimit = Math.max(1, Math.min(maxFiles, MAX_BATCH_IMAGES))

  useEffect(() => {
    return () => revokeAll(images)
    // Intentionally only on unmount; replacements revoke explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function formatSkipped(skipped: SkippedFile[]): string[] {
    return skipped.map((item) => {
      const detail = t(reasonMessageKey(item.reason), { max: batchLimit })
      return `${item.name}: ${detail}`
    })
  }

  function replaceImages(nextFiles: File[], skipped: SkippedFile[]) {
    setImages((current) => {
      revokeAll(current)
      return createSelectedImages(nextFiles)
    })
    onClearResult?.()

    const details = formatSkipped(skipped)
    if (nextFiles.length === 0 && details.length > 0) {
      setLocalError(details.join(' '))
      return
    }
    if (details.length > 0) {
      setLocalError(
        t('uploader.skipped', {
          count: details.length,
          details: details.slice(0, 3).join(' '),
        }),
      )
      return
    }
    setLocalError('')
  }

  function handleIncomingFiles(fileList: FileList | File[]) {
    const { files, skipped } = buildImageBatch(fileList, batchLimit)
    replaceImages(files, skipped)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const list = event.target.files
    if (list && list.length > 0) {
      handleIncomingFiles(list)
    }
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled || loading) {
      return
    }
    if (event.dataTransfer.files?.length) {
      handleIncomingFiles(event.dataTransfer.files)
    }
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      const next = current.filter((image) => image.id !== id)
      if (next.length === 0) {
        onClearResult?.()
      }
      return next
    })
    setLocalError('')
  }

  function clearAll() {
    setImages((current) => {
      revokeAll(current)
      return []
    })
    onClearResult?.()
    setLocalError('')
  }

  return (
    <div>
      <div
        className={`rounded-2xl border-2 border-dashed px-4 py-8 text-center transition sm:px-6 sm:py-10 ${
          isDragging ? 'border-uis-green' : ''
        }`}
        style={{
          background: isDragging
            ? 'var(--mv-accent-soft)'
            : 'var(--mv-surface)',
          borderColor: isDragging ? undefined : 'var(--mv-border)',
        }}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <p className="text-base font-medium sm:text-lg" style={{ color: 'var(--mv-text)' }}>
          {t('uploader.dropTitle')}
        </p>
        <p className="mt-2 text-sm mv-text-muted">
          {t('uploader.dropHint', { max: batchLimit })}
        </p>

        <input
          accept=".jpg,.jpeg,.png,.webp,.tif,.tiff,image/jpeg,image/png,image/webp,image/tiff"
          className="sr-only"
          id={inputId}
          multiple={batchLimit > 1}
          onChange={handleInputChange}
          ref={inputRef}
          type="file"
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <label
            className={`cursor-pointer rounded-lg border border-uis-green px-5 py-3 text-sm font-semibold text-uis-green transition hover:bg-uis-green-soft dark:hover:bg-emerald-950 ${
              disabled || loading ? 'pointer-events-none opacity-50' : ''
            }`}
            htmlFor={inputId}
          >
            {t('uploader.select')}
          </label>
          <button
            className="rounded-lg bg-uis-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={images.length === 0 || disabled || loading}
            onClick={() => onAnalyze(images.map((image) => image.file))}
            type="button"
          >
            {loading
              ? progressLabel || t('uploader.analyzing')
              : submitLabelKey
                ? t(submitLabelKey)
                : images.length > 1
                  ? t('uploader.analyzeMany', { count: images.length })
                  : t('uploader.analyzeOne')}
          </button>
        </div>

        {images.length > 0 && (
          <div className="mx-auto mt-8 max-w-4xl text-left">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium" style={{ color: 'var(--mv-text)' }}>
                {t('uploader.preview', {
                  count: images.length,
                  unit:
                    locale === 'es'
                      ? images.length === 1
                        ? 'imagen'
                        : 'imágenes'
                      : images.length === 1
                        ? 'image'
                        : 'images',
                })}
              </p>
              <button
                className="text-sm underline-offset-2 hover:underline disabled:opacity-50"
                disabled={loading}
                onClick={clearAll}
                style={{ color: 'var(--mv-accent)' }}
                type="button"
              >
                {t('uploader.removeAll')}
              </button>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <li
                  className="rounded-xl border p-3"
                  key={image.id}
                  style={{
                    background: 'var(--mv-surface-muted)',
                    borderColor: 'var(--mv-border)',
                  }}
                >
                  <p
                    className="mb-2 text-xs font-semibold"
                    style={{ color: 'var(--mv-accent)' }}
                  >
                    #{String(index + 1).padStart(2, '0')}
                  </p>
                  <img
                    alt={image.file.name}
                    className="h-36 w-full rounded-lg object-contain"
                    src={image.previewUrl}
                    style={{ background: 'var(--mv-surface)' }}
                  />
                  <p className="mt-2 truncate text-xs mv-text-muted">
                    {image.file.name}
                  </p>
                  <button
                    className="mt-2 text-xs underline-offset-2 hover:underline disabled:opacity-50"
                    disabled={loading}
                    onClick={() => removeImage(image.id)}
                    style={{ color: 'var(--mv-accent)' }}
                    type="button"
                  >
                    {t('uploader.remove')}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {localError && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {localError}
        </p>
      )}
    </div>
  )
}
